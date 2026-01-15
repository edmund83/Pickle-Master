-- Migration: 00067_sales_order_rpcs.sql
-- Description: RPC functions for sales order workflow

-- ============================================================================
-- CREATE SALES ORDER
-- ============================================================================

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
    v_customer RECORD;
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
        SELECT * INTO v_customer FROM customers WHERE customers.id = p_customer_id;
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
        COALESCE(p_ship_to_name, v_customer.shipping_address_line1, v_customer.name),
        COALESCE(p_ship_to_address1, v_customer.shipping_address_line1),
        COALESCE(p_ship_to_address2, v_customer.shipping_address_line2),
        COALESCE(p_ship_to_city, v_customer.shipping_city),
        COALESCE(p_ship_to_state, v_customer.shipping_state),
        COALESCE(p_ship_to_postal_code, v_customer.shipping_postal_code),
        COALESCE(p_ship_to_country, v_customer.shipping_country),
        p_ship_to_phone,
        COALESCE(v_customer.name, p_ship_to_name),
        COALESCE(v_customer.billing_address_line1, p_ship_to_address1),
        v_customer.billing_address_line2,
        COALESCE(v_customer.billing_city, p_ship_to_city),
        COALESCE(v_customer.billing_state, p_ship_to_state),
        COALESCE(v_customer.billing_postal_code, p_ship_to_postal_code),
        COALESCE(v_customer.billing_country, p_ship_to_country),
        p_source_location_id,
        p_internal_notes,
        p_customer_notes,
        v_customer.payment_term_id,
        auth.uid(),
        'draft'
    )
    RETURNING sales_orders.id INTO v_so_id;

    RETURN QUERY SELECT v_so_id, v_display_id;
END;
$$;

-- ============================================================================
-- GENERATE PICK LIST FROM SALES ORDER
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_pick_list_from_sales_order(
    p_sales_order_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pick_list_id UUID;
    v_sales_order RECORD;
    v_display_id VARCHAR(25);
    v_tenant_id UUID;
    v_item_count INTEGER;
BEGIN
    -- Get sales order
    SELECT * INTO v_sales_order
    FROM sales_orders
    WHERE id = p_sales_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sales order not found';
    END IF;

    -- Verify tenant access
    v_tenant_id := get_user_tenant_id();
    IF v_sales_order.tenant_id != v_tenant_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    -- Check status
    IF v_sales_order.status != 'confirmed' THEN
        RAISE EXCEPTION 'Sales order must be confirmed to generate pick list. Current status: %', v_sales_order.status;
    END IF;

    -- Check if items exist
    SELECT COUNT(*) INTO v_item_count
    FROM sales_order_items
    WHERE sales_order_id = p_sales_order_id
      AND item_id IS NOT NULL
      AND quantity_ordered > quantity_picked;

    IF v_item_count = 0 THEN
        RAISE EXCEPTION 'No items to pick';
    END IF;

    -- Generate display ID for pick list
    v_display_id := generate_display_id(v_tenant_id, 'pick_list');

    -- Create pick list
    INSERT INTO pick_lists (
        tenant_id,
        display_id,
        name,
        status,
        source_entity_type,
        source_entity_id,
        ship_to_name,
        ship_to_address1,
        ship_to_address2,
        ship_to_city,
        ship_to_state,
        ship_to_postal_code,
        ship_to_country,
        due_date,
        assigned_to,
        created_by,
        notes
    ) VALUES (
        v_tenant_id,
        v_display_id,
        'Pick for ' || v_sales_order.display_id,
        'pending',
        'sales_order',
        p_sales_order_id,
        v_sales_order.ship_to_name,
        v_sales_order.ship_to_address1,
        v_sales_order.ship_to_address2,
        v_sales_order.ship_to_city,
        v_sales_order.ship_to_state,
        v_sales_order.ship_to_postal_code,
        v_sales_order.ship_to_country,
        v_sales_order.promised_date,
        v_sales_order.assigned_to,
        auth.uid(),
        'Auto-generated from ' || v_sales_order.display_id
    )
    RETURNING id INTO v_pick_list_id;

    -- Add pick list items from sales order items
    INSERT INTO pick_list_items (
        pick_list_id,
        item_id,
        source_item_id,
        source_type,
        requested_quantity,
        notes
    )
    SELECT
        v_pick_list_id,
        soi.item_id,
        soi.id,
        'sales_order',
        soi.quantity_ordered - soi.quantity_picked,
        soi.notes
    FROM sales_order_items soi
    WHERE soi.sales_order_id = p_sales_order_id
      AND soi.item_id IS NOT NULL
      AND soi.quantity_ordered > soi.quantity_picked;

    -- Update sales order with pick list reference and status
    UPDATE sales_orders
    SET pick_list_id = v_pick_list_id,
        status = 'picking',
        updated_at = NOW()
    WHERE id = p_sales_order_id;

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id,
        entity_name, action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), 'pick_list', v_pick_list_id,
        v_display_id, 'create',
        jsonb_build_object(
            'source', 'sales_order',
            'sales_order_id', p_sales_order_id,
            'sales_order_display_id', v_sales_order.display_id,
            'items_count', v_item_count
        )
    );

    RETURN v_pick_list_id;
END;
$$;

-- ============================================================================
-- SYNC PICK TO SALES ORDER (trigger function)
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_pick_to_sales_order()
RETURNS TRIGGER AS $$
DECLARE
    v_source_item_id UUID;
BEGIN
    -- Check if this pick list item is linked to a sales order
    v_source_item_id := NEW.source_item_id;

    IF v_source_item_id IS NOT NULL AND NEW.source_type = 'sales_order' THEN
        -- Update sales_order_item.quantity_picked
        UPDATE sales_order_items
        SET quantity_picked = NEW.picked_quantity,
            updated_at = NOW()
        WHERE id = v_source_item_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trigger_sync_pick_to_sales_order ON pick_list_items;
CREATE TRIGGER trigger_sync_pick_to_sales_order
    AFTER UPDATE OF picked_quantity ON pick_list_items
    FOR EACH ROW
    EXECUTE FUNCTION sync_pick_to_sales_order();

-- ============================================================================
-- CREATE DELIVERY ORDER FROM PICK LIST
-- ============================================================================

CREATE OR REPLACE FUNCTION create_delivery_order_from_pick_list(
    p_pick_list_id UUID,
    p_carrier VARCHAR DEFAULT NULL,
    p_tracking_number VARCHAR DEFAULT NULL,
    p_scheduled_date DATE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_delivery_order_id UUID;
    v_pick_list RECORD;
    v_sales_order RECORD;
    v_display_id VARCHAR(25);
    v_tenant_id UUID;
BEGIN
    -- Get tenant
    v_tenant_id := get_user_tenant_id();

    -- Get pick list
    SELECT * INTO v_pick_list
    FROM pick_lists
    WHERE id = p_pick_list_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pick list not found';
    END IF;

    -- Verify tenant access
    IF v_pick_list.tenant_id != v_tenant_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    IF v_pick_list.status != 'completed' THEN
        RAISE EXCEPTION 'Pick list must be completed to create delivery order. Current status: %', v_pick_list.status;
    END IF;

    -- Get linked sales order
    SELECT * INTO v_sales_order
    FROM sales_orders
    WHERE pick_list_id = p_pick_list_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No sales order linked to this pick list';
    END IF;

    -- Generate display ID
    v_display_id := generate_display_id(v_tenant_id, 'delivery_order');

    -- Create delivery order
    INSERT INTO delivery_orders (
        tenant_id,
        display_id,
        sales_order_id,
        pick_list_id,
        status,
        carrier,
        tracking_number,
        scheduled_date,
        ship_to_name,
        ship_to_address1,
        ship_to_address2,
        ship_to_city,
        ship_to_state,
        ship_to_postal_code,
        ship_to_country,
        ship_to_phone,
        created_by
    ) VALUES (
        v_tenant_id,
        v_display_id,
        v_sales_order.id,
        p_pick_list_id,
        'draft',
        p_carrier,
        p_tracking_number,
        p_scheduled_date,
        v_sales_order.ship_to_name,
        v_sales_order.ship_to_address1,
        v_sales_order.ship_to_address2,
        v_sales_order.ship_to_city,
        v_sales_order.ship_to_state,
        v_sales_order.ship_to_postal_code,
        v_sales_order.ship_to_country,
        v_sales_order.ship_to_phone,
        auth.uid()
    )
    RETURNING id INTO v_delivery_order_id;

    -- Add delivery items from pick list
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
        pli.source_item_id,
        pli.id,
        pli.item_id,
        ii.name,
        ii.sku,
        pli.picked_quantity
    FROM pick_list_items pli
    JOIN inventory_items ii ON ii.id = pli.item_id
    WHERE pli.pick_list_id = p_pick_list_id
      AND pli.picked_quantity > 0;

    -- Update sales order status
    UPDATE sales_orders
    SET status = 'picked',
        updated_at = NOW()
    WHERE id = v_sales_order.id
      AND status = 'picking';

    -- Log activity
    INSERT INTO activity_logs (
        tenant_id, user_id, entity_type, entity_id,
        entity_name, action_type, changes
    ) VALUES (
        v_tenant_id, auth.uid(), 'delivery_order', v_delivery_order_id,
        v_display_id, 'create',
        jsonb_build_object(
            'sales_order_id', v_sales_order.id,
            'sales_order_display_id', v_sales_order.display_id,
            'pick_list_id', p_pick_list_id
        )
    );

    RETURN v_delivery_order_id;
END;
$$;

-- ============================================================================
-- DISPATCH DELIVERY ORDER
-- ============================================================================

CREATE OR REPLACE FUNCTION dispatch_delivery_order(p_delivery_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_do RECORD;
    v_so RECORD;
    v_shipped_count INTEGER;
    v_total_count INTEGER;
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();

    SELECT * INTO v_do FROM delivery_orders WHERE id = p_delivery_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Delivery order not found';
    END IF;

    IF v_do.tenant_id != v_tenant_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    IF v_do.status != 'draft' AND v_do.status != 'ready' THEN
        RAISE EXCEPTION 'Delivery order must be draft or ready to dispatch. Current status: %', v_do.status;
    END IF;

    -- Update delivery order
    UPDATE delivery_orders
    SET status = 'dispatched',
        dispatched_at = NOW(),
        dispatched_by = auth.uid(),
        updated_at = NOW()
    WHERE id = p_delivery_order_id;

    -- Update sales order item quantities
    UPDATE sales_order_items soi
    SET quantity_shipped = soi.quantity_shipped + doi.quantity_shipped,
        updated_at = NOW()
    FROM delivery_order_items doi
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.sales_order_item_id = soi.id;

    -- Check if all items shipped for the sales order
    SELECT * INTO v_so FROM sales_orders WHERE id = v_do.sales_order_id;

    SELECT
        COUNT(*) FILTER (WHERE quantity_shipped >= quantity_ordered),
        COUNT(*)
    INTO v_shipped_count, v_total_count
    FROM sales_order_items
    WHERE sales_order_id = v_do.sales_order_id;

    -- Update sales order status
    IF v_shipped_count = v_total_count THEN
        UPDATE sales_orders SET status = 'shipped', updated_at = NOW()
        WHERE id = v_do.sales_order_id;
    ELSE
        UPDATE sales_orders SET status = 'partial_shipped', updated_at = NOW()
        WHERE id = v_do.sales_order_id;
    END IF;
END;
$$;

-- ============================================================================
-- CONFIRM DELIVERY
-- ============================================================================

CREATE OR REPLACE FUNCTION confirm_delivery(
    p_delivery_order_id UUID,
    p_received_by VARCHAR DEFAULT NULL,
    p_delivery_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_do RECORD;
    v_delivered_count INTEGER;
    v_total_count INTEGER;
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();

    SELECT * INTO v_do FROM delivery_orders WHERE id = p_delivery_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Delivery order not found';
    END IF;

    IF v_do.tenant_id != v_tenant_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    IF v_do.status != 'dispatched' AND v_do.status != 'in_transit' THEN
        RAISE EXCEPTION 'Delivery order must be dispatched to confirm delivery. Current status: %', v_do.status;
    END IF;

    -- Update delivery order
    UPDATE delivery_orders
    SET status = 'delivered',
        delivered_at = NOW(),
        delivered_confirmed_by = auth.uid(),
        received_by = COALESCE(p_received_by, received_by),
        delivery_notes = COALESCE(p_delivery_notes, delivery_notes),
        updated_at = NOW()
    WHERE id = p_delivery_order_id;

    -- Update delivery items to delivered
    UPDATE delivery_order_items
    SET quantity_delivered = quantity_shipped
    WHERE delivery_order_id = p_delivery_order_id;

    -- Update sales order item quantities
    UPDATE sales_order_items soi
    SET quantity_delivered = soi.quantity_delivered + doi.quantity_shipped,
        updated_at = NOW()
    FROM delivery_order_items doi
    WHERE doi.delivery_order_id = p_delivery_order_id
      AND doi.sales_order_item_id = soi.id;

    -- Check if all items delivered for the sales order
    SELECT
        COUNT(*) FILTER (WHERE quantity_delivered >= quantity_ordered),
        COUNT(*)
    INTO v_delivered_count, v_total_count
    FROM sales_order_items
    WHERE sales_order_id = v_do.sales_order_id;

    -- Update sales order status
    IF v_delivered_count = v_total_count THEN
        UPDATE sales_orders SET status = 'delivered', updated_at = NOW()
        WHERE id = v_do.sales_order_id;
    END IF;
END;
$$;

-- ============================================================================
-- CREATE INVOICE FROM DELIVERY
-- ============================================================================

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

-- ============================================================================
-- RECORD INVOICE PAYMENT
-- ============================================================================

CREATE OR REPLACE FUNCTION record_invoice_payment(
    p_invoice_id UUID,
    p_amount DECIMAL(12,2),
    p_payment_method VARCHAR DEFAULT NULL,
    p_reference_number VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_payment_id UUID;
    v_invoice RECORD;
    v_new_balance DECIMAL(12,2);
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();

    SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;

    IF v_invoice.tenant_id != v_tenant_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    IF v_invoice.status IN ('cancelled', 'void') THEN
        RAISE EXCEPTION 'Cannot record payment on cancelled/void invoice';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be positive';
    END IF;

    -- Create payment record
    INSERT INTO invoice_payments (
        invoice_id,
        tenant_id,
        amount,
        payment_date,
        payment_method,
        reference_number,
        notes,
        recorded_by
    ) VALUES (
        p_invoice_id,
        v_tenant_id,
        p_amount,
        CURRENT_DATE,
        p_payment_method,
        p_reference_number,
        p_notes,
        auth.uid()
    )
    RETURNING id INTO v_payment_id;

    -- Update invoice
    v_new_balance := v_invoice.balance_due - p_amount;

    UPDATE invoices
    SET amount_paid = amount_paid + p_amount,
        balance_due = v_new_balance,
        last_payment_date = CURRENT_DATE,
        status = CASE
            WHEN v_new_balance <= 0 THEN 'paid'::invoice_status
            WHEN amount_paid + p_amount > 0 THEN 'partial'::invoice_status
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = p_invoice_id;

    -- If fully paid, complete the sales order
    IF v_new_balance <= 0 THEN
        UPDATE sales_orders
        SET status = 'completed',
            payment_status = 'paid',
            updated_at = NOW()
        WHERE id = v_invoice.sales_order_id
          AND status = 'delivered';
    ELSE
        UPDATE sales_orders
        SET payment_status = 'partial',
            updated_at = NOW()
        WHERE id = v_invoice.sales_order_id;
    END IF;

    RETURN v_payment_id;
END;
$$;

-- ============================================================================
-- GET SALES ORDER WITH DETAILS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_sales_order_with_details(p_sales_order_id UUID)
RETURNS TABLE (
    id UUID,
    display_id VARCHAR(25),
    status sales_order_status,
    customer_id UUID,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    order_date DATE,
    requested_date DATE,
    promised_date DATE,
    priority VARCHAR(20),
    subtotal DECIMAL(12,2),
    tax_amount DECIMAL(12,2),
    total DECIMAL(12,2),
    payment_status VARCHAR(20),
    ship_to_name VARCHAR(255),
    ship_to_address1 VARCHAR(500),
    ship_to_city VARCHAR(255),
    ship_to_state VARCHAR(255),
    ship_to_country VARCHAR(100),
    items_count BIGINT,
    pick_list_id UUID,
    pick_list_display_id VARCHAR(25),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        so.id,
        so.display_id,
        so.status,
        so.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        so.order_date,
        so.requested_date,
        so.promised_date,
        so.priority,
        so.subtotal,
        so.tax_amount,
        so.total,
        so.payment_status,
        so.ship_to_name,
        so.ship_to_address1,
        so.ship_to_city,
        so.ship_to_state,
        so.ship_to_country,
        (SELECT COUNT(*) FROM sales_order_items WHERE sales_order_id = so.id) AS items_count,
        so.pick_list_id,
        pl.display_id AS pick_list_display_id,
        so.created_at,
        so.updated_at
    FROM sales_orders so
    LEFT JOIN customers c ON c.id = so.customer_id
    LEFT JOIN pick_lists pl ON pl.id = so.pick_list_id
    WHERE so.id = p_sales_order_id
      AND so.tenant_id = get_user_tenant_id();
END;
$$;
