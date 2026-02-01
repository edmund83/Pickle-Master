-- Stock out using FIFO (First Expired First Out) strategy
-- Automatically deducts from oldest expiry batches first

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
BEGIN
  -- Get tenant_id from item
  SELECT tenant_id INTO v_tenant_id
  FROM inventory_items
  WHERE id = p_item_id;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  -- Check total available quantity
  IF (SELECT COALESCE(SUM(quantity), 0) FROM lots WHERE item_id = p_item_id AND status = 'active') < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient quantity available');
  END IF;

  -- Loop through lots in FEFO order (earliest expiry first, then oldest created)
  FOR v_lot IN
    SELECT id, quantity
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

    -- Update the lot
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
      created_at
    ) VALUES (
      v_lot.id,
      'stock_out',
      -v_deduct,
      COALESCE(p_reason, 'FIFO stock out'),
      NOW()
    );

    v_remaining := v_remaining - v_deduct;
    v_total_deducted := v_total_deducted + v_deduct;
  END LOOP;

  -- Update item quantity
  UPDATE inventory_items
  SET
    quantity = quantity - v_total_deducted,
    status = CASE
      WHEN quantity - v_total_deducted <= 0 THEN 'out_of_stock'
      WHEN min_quantity IS NOT NULL AND quantity - v_total_deducted <= min_quantity THEN 'low_stock'
      ELSE 'in_stock'
    END,
    updated_at = NOW()
  WHERE id = p_item_id;

  -- Log activity
  INSERT INTO activity_logs (
    tenant_id,
    action_type,
    entity_type,
    entity_id,
    quantity_delta,
    changes,
    created_at
  ) VALUES (
    v_tenant_id,
    'stock_out',
    'item',
    p_item_id,
    -v_total_deducted,
    jsonb_build_object('reason', p_reason, 'method', 'fifo'),
    NOW()
  );

  RETURN jsonb_build_object('success', true, 'quantity_deducted', v_total_deducted);
END;
$$;

-- Stock out specific serials
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
  v_count INTEGER;
BEGIN
  -- Get tenant_id from item
  SELECT tenant_id INTO v_tenant_id
  FROM inventory_items
  WHERE id = p_item_id;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  -- Verify all serials belong to this item and are available
  SELECT COUNT(*) INTO v_count
  FROM serial_numbers
  WHERE id = ANY(p_serial_ids)
    AND item_id = p_item_id
    AND status = 'available';

  IF v_count != array_length(p_serial_ids, 1) THEN
    RETURN jsonb_build_object('success', false, 'error', 'One or more serials not available');
  END IF;

  -- Update serial statuses
  UPDATE serial_numbers
  SET
    status = p_new_status,
    notes = COALESCE(notes || E'\n', '') || 'Stock out: ' || COALESCE(p_reason, 'No reason provided'),
    updated_at = NOW()
  WHERE id = ANY(p_serial_ids);

  -- Update item quantity
  UPDATE inventory_items
  SET
    quantity = quantity - array_length(p_serial_ids, 1),
    status = CASE
      WHEN quantity - array_length(p_serial_ids, 1) <= 0 THEN 'out_of_stock'
      WHEN min_quantity IS NOT NULL AND quantity - array_length(p_serial_ids, 1) <= min_quantity THEN 'low_stock'
      ELSE 'in_stock'
    END,
    updated_at = NOW()
  WHERE id = p_item_id;

  -- Log activity
  INSERT INTO activity_logs (
    tenant_id,
    action_type,
    entity_type,
    entity_id,
    quantity_delta,
    changes,
    created_at
  ) VALUES (
    v_tenant_id,
    'stock_out',
    'item',
    p_item_id,
    -array_length(p_serial_ids, 1),
    jsonb_build_object('reason', p_reason, 'serial_ids', p_serial_ids, 'new_status', p_new_status),
    NOW()
  );

  RETURN jsonb_build_object('success', true, 'count', array_length(p_serial_ids, 1));
END;
$$;
