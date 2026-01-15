-- Migration: 00071_fix_create_sales_order.sql
-- Description: Fix create_sales_order function to handle null customer properly

-- The original function used a RECORD type variable which fails when customer is null
-- This fix uses individual variables for each customer field instead

CREATE OR REPLACE FUNCTION create_sales_order(
    p_customer_id UUID DEFAULT NULL,
    p_order_number VARCHAR DEFAULT NULL,
    p_order_date DATE DEFAULT NULL,
    p_requested_date DATE DEFAULT NULL,
    p_promised_date DATE DEFAULT NULL,
    p_priority VARCHAR DEFAULT 'normal',
    p_ship_to_name VARCHAR DEFAULT NULL,
    p_ship_to_address1 VARCHAR DEFAULT NULL,
    p_ship_to_address2 VARCHAR DEFAULT NULL,
    p_ship_to_city VARCHAR DEFAULT NULL,
    p_ship_to_state VARCHAR DEFAULT NULL,
    p_ship_to_postal_code VARCHAR DEFAULT NULL,
    p_ship_to_country VARCHAR DEFAULT NULL,
    p_ship_to_phone VARCHAR DEFAULT NULL,
    p_source_location_id UUID DEFAULT NULL,
    p_internal_notes TEXT DEFAULT NULL,
    p_customer_notes TEXT DEFAULT NULL
)
RETURNS TABLE (id UUID, display_id VARCHAR(25))
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_display_id VARCHAR(25);
    v_so_id UUID;
    v_customer_name VARCHAR(255);
    v_customer_shipping_address1 VARCHAR(500);
    v_customer_shipping_address2 VARCHAR(500);
    v_customer_shipping_city VARCHAR(255);
    v_customer_shipping_state VARCHAR(255);
    v_customer_shipping_postal_code VARCHAR(50);
    v_customer_shipping_country VARCHAR(100);
    v_customer_billing_address1 VARCHAR(500);
    v_customer_billing_address2 VARCHAR(500);
    v_customer_billing_city VARCHAR(255);
    v_customer_billing_state VARCHAR(255);
    v_customer_billing_postal_code VARCHAR(50);
    v_customer_billing_country VARCHAR(100);
    v_customer_payment_term_id UUID;
BEGIN
    -- Get tenant
    v_tenant_id := get_user_tenant_id();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant found for current user';
    END IF;

    -- Generate display ID
    v_display_id := generate_display_id(v_tenant_id, 'sales_order');

    -- If customer provided, get their default addresses
    IF p_customer_id IS NOT NULL THEN
        SELECT
            c.name,
            c.shipping_address_line1,
            c.shipping_address_line2,
            c.shipping_city,
            c.shipping_state,
            c.shipping_postal_code,
            c.shipping_country,
            c.billing_address_line1,
            c.billing_address_line2,
            c.billing_city,
            c.billing_state,
            c.billing_postal_code,
            c.billing_country,
            c.payment_term_id
        INTO
            v_customer_name,
            v_customer_shipping_address1,
            v_customer_shipping_address2,
            v_customer_shipping_city,
            v_customer_shipping_state,
            v_customer_shipping_postal_code,
            v_customer_shipping_country,
            v_customer_billing_address1,
            v_customer_billing_address2,
            v_customer_billing_city,
            v_customer_billing_state,
            v_customer_billing_postal_code,
            v_customer_billing_country,
            v_customer_payment_term_id
        FROM customers c
        WHERE c.id = p_customer_id;
    END IF;

    -- Create sales order
    INSERT INTO sales_orders (
        tenant_id,
        display_id,
        customer_id,
        order_number,
        order_date,
        requested_date,
        promised_date,
        priority,
        ship_to_name,
        ship_to_address1,
        ship_to_address2,
        ship_to_city,
        ship_to_state,
        ship_to_postal_code,
        ship_to_country,
        ship_to_phone,
        bill_to_name,
        bill_to_address1,
        bill_to_address2,
        bill_to_city,
        bill_to_state,
        bill_to_postal_code,
        bill_to_country,
        source_location_id,
        internal_notes,
        customer_notes,
        payment_term_id,
        created_by,
        status
    ) VALUES (
        v_tenant_id,
        v_display_id,
        p_customer_id,
        p_order_number,
        COALESCE(p_order_date, CURRENT_DATE),
        p_requested_date,
        p_promised_date,
        COALESCE(p_priority, 'normal'),
        COALESCE(p_ship_to_name, v_customer_name),
        COALESCE(p_ship_to_address1, v_customer_shipping_address1),
        COALESCE(p_ship_to_address2, v_customer_shipping_address2),
        COALESCE(p_ship_to_city, v_customer_shipping_city),
        COALESCE(p_ship_to_state, v_customer_shipping_state),
        COALESCE(p_ship_to_postal_code, v_customer_shipping_postal_code),
        COALESCE(p_ship_to_country, v_customer_shipping_country),
        p_ship_to_phone,
        COALESCE(v_customer_name, p_ship_to_name),
        COALESCE(v_customer_billing_address1, p_ship_to_address1),
        v_customer_billing_address2,
        COALESCE(v_customer_billing_city, p_ship_to_city),
        COALESCE(v_customer_billing_state, p_ship_to_state),
        COALESCE(v_customer_billing_postal_code, p_ship_to_postal_code),
        COALESCE(v_customer_billing_country, p_ship_to_country),
        p_source_location_id,
        p_internal_notes,
        p_customer_notes,
        v_customer_payment_term_id,
        auth.uid(),
        'draft'
    )
    RETURNING sales_orders.id INTO v_so_id;

    RETURN QUERY SELECT v_so_id, v_display_id;
END;
$$;
