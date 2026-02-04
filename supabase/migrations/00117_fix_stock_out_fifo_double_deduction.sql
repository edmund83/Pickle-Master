-- ============================================
-- Migration: 00117_fix_stock_out_fifo_double_deduction.sql
-- Purpose: Fix double-deduction bug in stock_out_fifo
-- Issue: Function manually updates inventory_items.quantity but
--        trigger_sync_item_from_lots already does this automatically
-- ============================================

-- Remove the manual inventory_items.quantity update since
-- the sync_item_quantity_from_lots trigger handles it automatically
-- when lot quantities change.

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
  v_remaining INTEGER := p_quantity;
  v_lot RECORD;
  v_deduct INTEGER;
  v_total_deducted INTEGER := 0;
  v_item_name VARCHAR;
  v_user_name VARCHAR;
BEGIN
  -- Get tenant_id and item name
  SELECT i.tenant_id, i.name INTO v_tenant_id, v_item_name
  FROM inventory_items i
  WHERE i.id = p_item_id;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
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
      -v_deduct,
      COALESCE(p_reason, 'FIFO stock out'),
      auth.uid(),
      NOW()
    );

    v_remaining := v_remaining - v_deduct;
    v_total_deducted := v_total_deducted + v_deduct;
  END LOOP;

  -- NOTE: inventory_items.quantity is automatically updated by the
  -- sync_item_quantity_from_lots trigger when lot quantities change.
  -- DO NOT manually update inventory_items.quantity here to avoid double-deduction!

  -- Update item status based on new quantity (calculated from lots by trigger)
  UPDATE inventory_items
  SET
    status = CASE
      WHEN (SELECT COALESCE(SUM(quantity), 0) FROM lots WHERE item_id = p_item_id AND status = 'active') <= 0 THEN 'out_of_stock'
      WHEN min_quantity IS NOT NULL AND (SELECT COALESCE(SUM(quantity), 0) FROM lots WHERE item_id = p_item_id AND status = 'active') <= min_quantity THEN 'low_stock'
      ELSE 'in_stock'
    END,
    updated_at = NOW()
  WHERE id = p_item_id;

  -- Log activity
  INSERT INTO activity_logs (
    tenant_id,
    user_id,
    user_name,
    action_type,
    entity_type,
    entity_id,
    entity_name,
    quantity_delta,
    changes,
    created_at
  ) VALUES (
    v_tenant_id,
    auth.uid(),
    v_user_name,
    'stock_out',
    'item',
    p_item_id,
    v_item_name,
    -v_total_deducted,
    jsonb_build_object('reason', p_reason, 'method', 'fifo'),
    NOW()
  );

  RETURN jsonb_build_object('success', true, 'quantity_deducted', v_total_deducted);
END;
$$;
