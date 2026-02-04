-- ============================================
-- Migration: 00118_fix_stock_out_serials_type.sql
-- Purpose: Fix type casting in stock_out_serials function
-- Issue: p_new_status is TEXT but status column is serial_status enum
-- ============================================

-- Stock out specific serials (FIXED: cast TEXT to serial_status)
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
  v_item_name VARCHAR;
  v_user_name VARCHAR;
BEGIN
  -- Get tenant_id from item
  SELECT tenant_id, name INTO v_tenant_id, v_item_name
  FROM inventory_items
  WHERE id = p_item_id;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  -- Get user name for activity log
  SELECT full_name INTO v_user_name
  FROM profiles WHERE id = auth.uid();

  -- Verify all serials belong to this item and are available
  SELECT COUNT(*) INTO v_count
  FROM serial_numbers
  WHERE id = ANY(p_serial_ids)
    AND item_id = p_item_id
    AND status = 'available';

  IF v_count != array_length(p_serial_ids, 1) THEN
    RETURN jsonb_build_object('success', false, 'error', 'One or more serials not available');
  END IF;

  -- Update serial statuses (FIX: cast to serial_status enum)
  UPDATE serial_numbers
  SET
    status = p_new_status::serial_status,
    notes = COALESCE(notes || E'\n', '') || 'Stock out: ' || COALESCE(p_reason, 'No reason provided'),
    updated_at = NOW()
  WHERE id = ANY(p_serial_ids);

  -- Note: item quantity is updated automatically by sync_item_quantity_from_serials trigger
  -- No need to manually update inventory_items.quantity for serialized items

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
    'stock_out_serials',
    'item',
    p_item_id,
    v_item_name,
    -array_length(p_serial_ids, 1),
    jsonb_build_object('reason', p_reason, 'serial_ids', p_serial_ids, 'new_status', p_new_status),
    NOW()
  );

  RETURN jsonb_build_object('success', true, 'count', array_length(p_serial_ids, 1));
END;
$$;
