-- Prevent duplicate invoices for the same delivery order.
-- create_invoice_from_delivery did not check for an existing invoice, allowing double-invoicing.

CREATE OR REPLACE FUNCTION create_invoice_from_delivery(
    p_delivery_order_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invoice_id UUID;
    v_do RECORD;
    v_so RECORD;
    v_customer RECORD;
    v_display_id VARCHAR(25);
    v_due_date DATE;
    v_subtotal DECIMAL(12,2);
    v_tax_amount DECIMAL(12,2);
    v_total DECIMAL(12,2);
    v_tenant_id UUID;
    v_payment_days INTEGER;
    v_existing_invoice_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();

    -- Get delivery order
    SELECT * INTO v_do FROM delivery_orders WHERE id = p_delivery_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Delivery order not found';
    END IF;

    IF v_do.tenant_id != v_tenant_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    IF v_do.status != 'delivered' THEN
        RAISE EXCEPTION 'Delivery order must be delivered to create invoice. Current status: %', v_do.status;
    END IF;

    -- Prevent duplicate: one invoice per delivery order (excluding cancelled/void)
    SELECT id INTO v_existing_invoice_id
    FROM invoices
    WHERE delivery_order_id = p_delivery_order_id
      AND tenant_id = v_tenant_id
      AND (status IS NULL OR status NOT IN ('cancelled', 'void'))
    LIMIT 1;

    IF v_existing_invoice_id IS NOT NULL THEN
        RAISE EXCEPTION 'An invoice already exists for this delivery order';
    END IF;

    -- Get sales order
    SELECT * INTO v_so FROM sales_orders WHERE id = v_do.sales_order_id;

    -- Get customer
    SELECT * INTO v_customer FROM customers WHERE id = v_so.customer_id;

    -- Generate display ID
    v_display_id := generate_display_id(v_tenant_id, 'invoice');

    -- Calculate due date from payment terms
    SELECT COALESCE(pt.days, 30)
    INTO v_payment_days
    FROM payment_terms pt
    WHERE pt.id = COALESCE(v_so.payment_term_id, v_customer.payment_term_id);

    v_due_date := CURRENT_DATE + COALESCE(v_payment_days, 30);

    -- Create invoice
    INSERT INTO invoices (
        tenant_id,
        display_id,
        sales_order_id,
        delivery_order_id,
        customer_id,
        status,
        invoice_date,
        due_date,
        bill_to_name,
        bill_to_address1,
        bill_to_address2,
        bill_to_city,
        bill_to_state,
        bill_to_postal_code,
        bill_to_country,
        payment_term_id,
        created_by
    ) VALUES (
        v_tenant_id,
        v_display_id,
        v_do.sales_order_id,
        p_delivery_order_id,
        v_so.customer_id,
        'draft',
        CURRENT_DATE,
        v_due_date,
        COALESCE(v_so.bill_to_name, v_customer.name),
        COALESCE(v_so.bill_to_address1, v_customer.billing_address_line1),
        COALESCE(v_so.bill_to_address2, v_customer.billing_address_line2),
        COALESCE(v_so.bill_to_city, v_customer.billing_city),
        COALESCE(v_so.bill_to_state, v_customer.billing_state),
        COALESCE(v_so.bill_to_postal_code, v_customer.billing_postal_code),
        COALESCE(v_so.bill_to_country, v_customer.billing_country),
        COALESCE(v_so.payment_term_id, v_customer.payment_term_id),
        auth.uid()
    )
    RETURNING id INTO v_invoice_id;

    -- Add invoice items from delivery
    INSERT INTO invoice_items (
        invoice_id,
        sales_order_item_id,
        delivery_order_item_id,
        item_id,
        item_name,
        sku,
        quantity,
        unit_price,
        discount_percent,
        tax_rate,
        tax_amount,
        line_total
    )
    SELECT
        v_invoice_id,
        doi.sales_order_item_id,
        doi.id,
        doi.item_id,
        doi.item_name,
        doi.sku,
        doi.quantity_delivered,
        soi.unit_price,
        soi.discount_percent,
        soi.tax_rate,
        (doi.quantity_delivered * soi.unit_price * (1 - COALESCE(soi.discount_percent, 0) / 100)) * COALESCE(soi.tax_rate, 0) / 100,
        (doi.quantity_delivered * soi.unit_price * (1 - COALESCE(soi.discount_percent, 0) / 100))
    FROM delivery_order_items doi
    JOIN sales_order_items soi ON soi.id = doi.sales_order_item_id
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.quantity_delivered > 0;

    -- Calculate totals
    SELECT
        COALESCE(SUM(line_total), 0),
        COALESCE(SUM(tax_amount), 0)
    INTO v_subtotal, v_tax_amount
    FROM invoice_items
    WHERE invoice_id = v_invoice_id;

    v_total := v_subtotal + v_tax_amount;

    -- Update invoice totals
    UPDATE invoices
    SET subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total = v_total,
        balance_due = v_total,
        updated_at = NOW()
    WHERE id = v_invoice_id;

    -- Update sales order items with invoiced quantities
    UPDATE sales_order_items soi
    SET quantity_invoiced = soi.quantity_invoiced + doi.quantity_delivered,
        updated_at = NOW()
    FROM delivery_order_items doi
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.sales_order_item_id = soi.id;

    RETURN v_invoice_id;
END;
$$;
