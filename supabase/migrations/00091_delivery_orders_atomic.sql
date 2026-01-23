-- Atomic delivery order creation from sales order
-- Ensures delivery order and items are created in a single transaction

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
        v_sales_order.pick_list_id,
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

    INSERT INTO delivery_order_items (
        delivery_order_id,
        sales_order_item_id,
        item_id,
        item_name,
        sku,
        quantity_shipped
    )
    SELECT
        v_delivery_order_id,
        id,
        item_id,
        item_name,
        sku,
        quantity_picked - quantity_shipped
    FROM sales_order_items
    WHERE sales_order_id = p_sales_order_id
      AND quantity_picked > quantity_shipped;

    RETURN QUERY SELECT v_delivery_order_id, v_display_id;
END;
$$;
