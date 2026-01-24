-- Migration: 00085_increment_so_item_shipped.sql
-- Purpose: Add RPC to increment shipped quantity for a sales order item

CREATE OR REPLACE FUNCTION increment_so_item_shipped(
    p_so_item_id UUID,
    p_quantity INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_item RECORD;
BEGIN
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RETURN json_build_object('success', false, 'error', 'Quantity must be greater than 0');
    END IF;

    SELECT soi.id, soi.sales_order_id, so.tenant_id
    INTO v_item
    FROM sales_order_items soi
    JOIN sales_orders so ON so.id = soi.sales_order_id
    WHERE soi.id = p_so_item_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Sales order item not found');
    END IF;

    IF v_item.tenant_id != get_user_tenant_id() THEN
        RETURN json_build_object('success', false, 'error', 'Access denied');
    END IF;

    UPDATE sales_order_items
    SET quantity_shipped = quantity_shipped + p_quantity,
        updated_at = NOW()
    WHERE id = p_so_item_id;

    RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION increment_so_item_shipped(UUID, INTEGER) TO authenticated;
COMMENT ON FUNCTION increment_so_item_shipped IS 'Increment shipped quantity for a sales order item with tenant validation';
