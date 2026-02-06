-- ============================================
-- Migration: 00129_copy_tracking_from_pick_list_to_do_rpc.sql
-- Purpose: Single RPC to copy all lot/serial tracking from pick list to delivery order
--          (replaces N round-trips of get_pick_list_item_tracking in the app)
-- ============================================

CREATE OR REPLACE FUNCTION copy_tracking_from_pick_list_to_delivery_order(
    p_delivery_order_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'User has no tenant';
    END IF;

    -- Verify delivery order exists and belongs to tenant
    IF NOT EXISTS (
        SELECT 1 FROM delivery_orders
        WHERE id = p_delivery_order_id
          AND tenant_id = v_tenant_id
    ) THEN
        RAISE EXCEPTION 'Delivery order not found or access denied';
    END IF;

    -- Copy lot tracking from pick_list_item_lots to delivery_order_item_serials
    INSERT INTO delivery_order_item_serials (
        delivery_order_item_id,
        lot_id,
        quantity,
        serial_number
    )
    SELECT
        doi.id,
        plil.lot_id,
        plil.quantity,
        l.lot_number  -- For display (nullable; lot_number stored for UI)
    FROM delivery_order_items doi
    JOIN pick_list_item_lots plil ON plil.pick_list_item_id = doi.pick_list_item_id
    JOIN lots l ON l.id = plil.lot_id
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.pick_list_item_id IS NOT NULL;

    -- Copy serial tracking from pick_list_item_serials to delivery_order_item_serials
    INSERT INTO delivery_order_item_serials (
        delivery_order_item_id,
        serial_number,
        lot_id,
        quantity
    )
    SELECT
        doi.id,
        sn.serial_number,
        NULL,
        1
    FROM delivery_order_items doi
    JOIN pick_list_item_serials plis ON plis.pick_list_item_id = doi.pick_list_item_id
    JOIN serial_numbers sn ON sn.id = plis.serial_id
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.pick_list_item_id IS NOT NULL;

END;
$$;

GRANT EXECUTE ON FUNCTION copy_tracking_from_pick_list_to_delivery_order TO authenticated;

COMMENT ON FUNCTION copy_tracking_from_pick_list_to_delivery_order IS
'Copies all lot and serial allocations from the linked pick list items into delivery_order_item_serials for the given delivery order. Call after create_delivery_order_from_pick_list to avoid N round-trips.';
