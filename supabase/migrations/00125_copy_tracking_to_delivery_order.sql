-- ============================================
-- Migration: 00125_copy_tracking_to_delivery_order.sql
-- Purpose: Copy lot and serial tracking from pick list to delivery order
--
-- Problem: The create_delivery_order_from_sales_order function does not:
-- 1. Set pick_list_item_id on delivery order items
-- 2. Copy lot allocations from pick_list_item_lots to delivery_order_item_serials
-- 3. Copy serial allocations from pick_list_item_serials to delivery_order_item_serials
--
-- Solution: Update the function to copy all tracking information
-- ============================================

CREATE OR REPLACE FUNCTION create_delivery_order_from_sales_order(
    p_sales_order_id UUID
)
RETURNS TABLE (delivery_order_id UUID, display_id VARCHAR)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_sales_order RECORD;
    v_customer_name TEXT;
    v_display_id VARCHAR(25);
    v_delivery_order_id UUID;
    v_pick_list_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();

    SELECT * INTO v_sales_order
    FROM sales_orders
    WHERE id = p_sales_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sales order not found';
    END IF;

    IF v_sales_order.tenant_id != v_tenant_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    IF v_sales_order.status NOT IN ('picked', 'partial_shipped') THEN
        RAISE EXCEPTION 'Sales order must be in picked or partial shipped status';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM sales_order_items
        WHERE sales_order_id = p_sales_order_id
          AND quantity_picked > quantity_shipped
    ) THEN
        RAISE EXCEPTION 'No items ready to ship';
    END IF;

    -- Get pick list ID from sales order
    v_pick_list_id := v_sales_order.pick_list_id;

    IF v_sales_order.customer_id IS NOT NULL THEN
        SELECT name INTO v_customer_name
        FROM customers
        WHERE id = v_sales_order.customer_id;
    END IF;

    v_display_id := generate_display_id(v_tenant_id, 'delivery_order');

    INSERT INTO delivery_orders (
        tenant_id,
        display_id,
        sales_order_id,
        pick_list_id,
        ship_to_name,
        ship_to_address1,
        ship_to_address2,
        ship_to_city,
        ship_to_state,
        ship_to_postal_code,
        ship_to_country,
        ship_to_phone,
        created_by,
        status
    ) VALUES (
        v_tenant_id,
        v_display_id,
        p_sales_order_id,
        v_pick_list_id,
        COALESCE(v_sales_order.ship_to_name, v_customer_name),
        v_sales_order.ship_to_address1,
        v_sales_order.ship_to_address2,
        v_sales_order.ship_to_city,
        v_sales_order.ship_to_state,
        v_sales_order.ship_to_postal_code,
        v_sales_order.ship_to_country,
        v_sales_order.ship_to_phone,
        auth.uid(),
        'draft'
    )
    RETURNING id INTO v_delivery_order_id;

    -- Insert delivery order items WITH pick_list_item_id
    INSERT INTO delivery_order_items (
        delivery_order_id,
        sales_order_item_id,
        pick_list_item_id,
        item_id,
        item_name,
        sku,
        quantity_shipped
    )
    SELECT
        v_delivery_order_id,
        soi.id,
        pli.id,  -- Include pick_list_item_id
        soi.item_id,
        soi.item_name,
        soi.sku,
        soi.quantity_picked - soi.quantity_shipped
    FROM sales_order_items soi
    LEFT JOIN pick_list_items pli ON pli.source_item_id = soi.id
        AND pli.source_type = 'sales_order'
        AND pli.pick_list_id = v_pick_list_id
    WHERE soi.sales_order_id = p_sales_order_id
      AND soi.quantity_picked > soi.quantity_shipped;

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
        NULL  -- No serial number for lot tracking
    FROM delivery_order_items doi
    JOIN pick_list_item_lots plil ON plil.pick_list_item_id = doi.pick_list_item_id
    WHERE doi.delivery_order_id = v_delivery_order_id
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
        NULL,  -- Serials don't have lot_id (or could join if serial has lot)
        1      -- Each serial is quantity 1
    FROM delivery_order_items doi
    JOIN pick_list_item_serials plis ON plis.pick_list_item_id = doi.pick_list_item_id
    JOIN serial_numbers sn ON sn.id = plis.serial_id
    WHERE doi.delivery_order_id = v_delivery_order_id
      AND doi.pick_list_item_id IS NOT NULL;

    RETURN QUERY SELECT v_delivery_order_id, v_display_id;
END;
$$;

-- Add comment
COMMENT ON FUNCTION create_delivery_order_from_sales_order IS
'Creates a delivery order from a picked sales order.
Copies all tracking information (lots and serials) from the pick list to the delivery order.
The sales order must be in "picked" or "partial_shipped" status.';
