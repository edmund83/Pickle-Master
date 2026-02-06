-- ============================================
-- Migration: 00133_harden_stock_out_rpc_tenant.sql
-- Purpose: Enforce tenant ownership in stock_out_fifo and stock_out_serials
-- Impact: Prevent cross-tenant stock deductions via SECURITY DEFINER RPCs
-- ============================================

-- Harden stock_out_fifo: ensure item belongs to caller tenant
CREATE OR REPLACE FUNCTION stock_out_fifo(
  p_item_id UUID,
  p_quantity INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
  v_user_tenant_id UUID;
  v_remaining INTEGER := p_quantity;
  v_lot RECORD;
  v_deduct INTEGER;
  v_total_deducted INTEGER := 0;
  v_item_name VARCHAR;
  v_user_name VARCHAR;
BEGIN
  -- Get tenant_id from item
  SELECT i.tenant_id, i.name INTO v_tenant_id, v_item_name
  FROM inventory_items i
  WHERE i.id = p_item_id;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  -- Enforce tenant ownership (defense-in-depth)
  v_user_tenant_id := get_user_tenant_id();
  IF v_user_tenant_id IS NULL OR v_user_tenant_id <> v_tenant_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied');
  END IF;

  -- Get user name for activity log
  SELECT full_name INTO v_user_name
  FROM profiles WHERE id = auth.uid();

  -- Check total available quantity
  IF (SELECT COALESCE(SUM(quantity), 0) FROM lots WHERE item_id = p_item_id AND status = 'active') < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient quantity available');
  END IF;

  -- Loop through lots in FEFO order (earliest expiry first, then oldest created)
  FOR v_lot IN
    SELECT id, quantity, lot_number
    FROM lots
    WHERE item_id = p_item_id
      AND status = 'active'
      AND quantity > 0
    ORDER BY
      expiry_date ASC NULLS LAST,
      created_at ASC
  LOOP
    EXIT WHEN v_remaining <= 0;

    -- Calculate how much to deduct from this lot
    v_deduct := LEAST(v_lot.quantity, v_remaining);

    -- Update the lot (this triggers sync_item_quantity_from_lots which updates inventory_items.quantity)
    UPDATE lots
    SET
      quantity = quantity - v_deduct,
      status = CASE WHEN quantity - v_deduct <= 0 THEN 'depleted' ELSE status END,
      updated_at = NOW()
    WHERE id = v_lot.id;

    -- Log the movement
    INSERT INTO lot_movements (
      lot_id,
      movement_type,
      quantity,
      reason,
      created_by,
      created_at
    ) VALUES (
      v_lot.id,
      'stock_out',
      v_deduct,
      p_reason,
      auth.uid(),
      NOW()
    );

    -- Log activity (if available)
    IF v_item_name IS NOT NULL THEN
      INSERT INTO activity_logs (
        tenant_id, user_id, user_name,
        action_type, entity_type, entity_id, entity_name,
        quantity_delta
      ) VALUES (
        v_tenant_id, auth.uid(), v_user_name,
        'stock_out_fifo', 'item', p_item_id, v_item_name,
        -v_deduct
      );
    END IF;

    v_remaining := v_remaining - v_deduct;
    v_total_deducted := v_total_deducted + v_deduct;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'quantity_deducted', v_total_deducted);
END;
$$;

-- Harden stock_out_serials: ensure item belongs to caller tenant
CREATE OR REPLACE FUNCTION stock_out_serials(
  p_item_id UUID,
  p_serial_ids UUID[],
  p_reason TEXT DEFAULT NULL,
  p_new_status TEXT DEFAULT 'sold'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
  v_user_tenant_id UUID;
  v_updated_count INTEGER;
  v_item_name VARCHAR;
  v_user_name VARCHAR;
BEGIN
  -- Get tenant_id from item
  SELECT i.tenant_id, i.name INTO v_tenant_id, v_item_name
  FROM inventory_items i
  WHERE i.id = p_item_id;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  -- Enforce tenant ownership (defense-in-depth)
  v_user_tenant_id := get_user_tenant_id();
  IF v_user_tenant_id IS NULL OR v_user_tenant_id <> v_tenant_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Access denied');
  END IF;

  -- Get user name for activity log
  SELECT full_name INTO v_user_name
  FROM profiles WHERE id = auth.uid();

  -- Update serials
  UPDATE serial_numbers
  SET
    status = p_new_status::serial_status,
    updated_at = NOW()
  WHERE id = ANY(p_serial_ids)
    AND item_id = p_item_id;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  -- Log activity
  IF v_item_name IS NOT NULL THEN
    INSERT INTO activity_logs (
      tenant_id, user_id, user_name,
      action_type, entity_type, entity_id, entity_name,
      quantity_delta
    ) VALUES (
      v_tenant_id, auth.uid(), v_user_name,
      'stock_out_serials', 'item', p_item_id, v_item_name,
      -v_updated_count
    );
  END IF;

  RETURN jsonb_build_object('success', true, 'updated', v_updated_count);
END;
$$;
