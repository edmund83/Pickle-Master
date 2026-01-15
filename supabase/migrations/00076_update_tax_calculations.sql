-- ============================================================================
-- UPDATE TAX CALCULATION FUNCTIONS
-- Modify recalculate functions to use line_item_taxes table
-- ============================================================================

-- ============================================================================
-- UPDATED: Recalculate Sales Order Totals
-- Now uses line_item_taxes for multi-tax support while maintaining backward
-- compatibility with the existing tax_rate field on line items
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_sales_order_totals(p_sales_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subtotal DECIMAL(12, 2);
    v_tax_amount DECIMAL(12, 2);
    v_tax_from_line_items DECIMAL(12, 2);
    v_tax_from_taxes_table DECIMAL(12, 2);
    v_total DECIMAL(12, 2);
    v_so RECORD;
BEGIN
    -- Get sales order
    SELECT * INTO v_so FROM sales_orders WHERE id = p_sales_order_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calculate subtotal from items
    SELECT COALESCE(SUM(line_total), 0)
    INTO v_subtotal
    FROM sales_order_items
    WHERE sales_order_id = p_sales_order_id;

    -- Calculate tax from line_item_taxes table (new multi-tax system)
    SELECT COALESCE(SUM(lit.tax_amount), 0)
    INTO v_tax_from_taxes_table
    FROM line_item_taxes lit
    INNER JOIN sales_order_items soi ON soi.id = lit.sales_order_item_id
    WHERE soi.sales_order_id = p_sales_order_id;

    -- Calculate tax from legacy tax_rate field on line items (backward compatibility)
    SELECT COALESCE(SUM(line_total * tax_rate / 100), 0)
    INTO v_tax_from_line_items
    FROM sales_order_items
    WHERE sales_order_id = p_sales_order_id
      AND tax_rate > 0;

    -- Use whichever tax calculation method has data
    -- Prefer line_item_taxes if any exist, otherwise use legacy
    IF v_tax_from_taxes_table > 0 THEN
        v_tax_amount := v_tax_from_taxes_table;
    ELSE
        v_tax_amount := v_tax_from_line_items;
    END IF;

    -- Calculate total
    v_total := v_subtotal + v_tax_amount + COALESCE(v_so.shipping_cost, 0) - COALESCE(v_so.discount_amount, 0);

    -- Update sales order
    UPDATE sales_orders
    SET subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total = v_total,
        updated_at = NOW()
    WHERE id = p_sales_order_id;
END;
$$;

-- ============================================================================
-- UPDATED: Recalculate Invoice Totals
-- Now uses line_item_taxes for multi-tax support
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_invoice_totals(p_invoice_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subtotal DECIMAL(12, 2);
    v_tax_amount DECIMAL(12, 2);
    v_tax_from_items DECIMAL(12, 2);
    v_tax_from_taxes_table DECIMAL(12, 2);
    v_total DECIMAL(12, 2);
    v_invoice RECORD;
BEGIN
    -- Get invoice
    SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calculate subtotal from items
    SELECT COALESCE(SUM(line_total), 0)
    INTO v_subtotal
    FROM invoice_items
    WHERE invoice_id = p_invoice_id;

    -- Calculate tax from line_item_taxes table (new multi-tax system)
    SELECT COALESCE(SUM(lit.tax_amount), 0)
    INTO v_tax_from_taxes_table
    FROM line_item_taxes lit
    INNER JOIN invoice_items ii ON ii.id = lit.invoice_item_id
    WHERE ii.invoice_id = p_invoice_id;

    -- Calculate tax from legacy tax_amount field on items (backward compatibility)
    SELECT COALESCE(SUM(tax_amount), 0)
    INTO v_tax_from_items
    FROM invoice_items
    WHERE invoice_id = p_invoice_id;

    -- Use whichever tax calculation method has data
    -- Prefer line_item_taxes if any exist, otherwise use legacy
    IF v_tax_from_taxes_table > 0 THEN
        v_tax_amount := v_tax_from_taxes_table;
    ELSE
        v_tax_amount := v_tax_from_items;
    END IF;

    -- Calculate total
    v_total := v_subtotal + v_tax_amount - COALESCE(v_invoice.discount_amount, 0);

    -- Update invoice
    UPDATE invoices
    SET subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total = v_total,
        balance_due = v_total - amount_paid,
        updated_at = NOW()
    WHERE id = p_invoice_id;
END;
$$;

-- ============================================================================
-- TRIGGER: Recalculate on line_item_taxes changes
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_on_line_item_tax_change()
RETURNS TRIGGER AS $$
DECLARE
    v_sales_order_id UUID;
    v_invoice_id UUID;
BEGIN
    -- Determine which parent to recalculate based on operation
    IF TG_OP = 'DELETE' THEN
        -- For sales order items
        IF OLD.sales_order_item_id IS NOT NULL THEN
            SELECT sales_order_id INTO v_sales_order_id
            FROM sales_order_items WHERE id = OLD.sales_order_item_id;

            IF v_sales_order_id IS NOT NULL THEN
                PERFORM recalculate_sales_order_totals(v_sales_order_id);
            END IF;
        END IF;

        -- For invoice items
        IF OLD.invoice_item_id IS NOT NULL THEN
            SELECT invoice_id INTO v_invoice_id
            FROM invoice_items WHERE id = OLD.invoice_item_id;

            IF v_invoice_id IS NOT NULL THEN
                PERFORM recalculate_invoice_totals(v_invoice_id);
            END IF;
        END IF;

        RETURN OLD;
    ELSE
        -- INSERT or UPDATE
        -- For sales order items
        IF NEW.sales_order_item_id IS NOT NULL THEN
            SELECT sales_order_id INTO v_sales_order_id
            FROM sales_order_items WHERE id = NEW.sales_order_item_id;

            IF v_sales_order_id IS NOT NULL THEN
                PERFORM recalculate_sales_order_totals(v_sales_order_id);
            END IF;
        END IF;

        -- For invoice items
        IF NEW.invoice_item_id IS NOT NULL THEN
            SELECT invoice_id INTO v_invoice_id
            FROM invoice_items WHERE id = NEW.invoice_item_id;

            IF v_invoice_id IS NOT NULL THEN
                PERFORM recalculate_invoice_totals(v_invoice_id);
            END IF;
        END IF;

        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_line_item_taxes_recalculate ON line_item_taxes;
CREATE TRIGGER trigger_line_item_taxes_recalculate
    AFTER INSERT OR UPDATE OR DELETE ON line_item_taxes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_on_line_item_tax_change();

-- ============================================================================
-- NEW: Calculate Purchase Order Totals (was missing auto-calculation)
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_purchase_order_totals(p_purchase_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_subtotal DECIMAL(12, 2);
    v_tax_amount DECIMAL(12, 2);
    v_tax_from_taxes_table DECIMAL(12, 2);
    v_total DECIMAL(12, 2);
    v_po RECORD;
BEGIN
    -- Get purchase order
    SELECT * INTO v_po FROM purchase_orders WHERE id = p_purchase_order_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Calculate subtotal from items (ordered_quantity * unit_price)
    SELECT COALESCE(SUM(ordered_quantity * unit_price), 0)
    INTO v_subtotal
    FROM purchase_order_items
    WHERE purchase_order_id = p_purchase_order_id;

    -- Calculate tax from line_item_taxes table
    SELECT COALESCE(SUM(lit.tax_amount), 0)
    INTO v_tax_from_taxes_table
    FROM line_item_taxes lit
    INNER JOIN purchase_order_items poi ON poi.id = lit.purchase_order_item_id
    WHERE poi.purchase_order_id = p_purchase_order_id;

    -- Use calculated tax if available, otherwise keep existing
    IF v_tax_from_taxes_table > 0 THEN
        v_tax_amount := v_tax_from_taxes_table;
    ELSE
        v_tax_amount := COALESCE(v_po.tax, 0);
    END IF;

    -- Calculate total
    v_total := v_subtotal + v_tax_amount + COALESCE(v_po.shipping, 0);

    -- Update purchase order
    UPDATE purchase_orders
    SET subtotal = v_subtotal,
        tax = v_tax_amount,
        total = v_total,
        updated_at = NOW()
    WHERE id = p_purchase_order_id;
END;
$$;

-- ============================================================================
-- TRIGGER: Recalculate PO totals on item changes
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_po_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_purchase_order_totals(OLD.purchase_order_id);
        RETURN OLD;
    ELSE
        PERFORM recalculate_purchase_order_totals(NEW.purchase_order_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trigger_po_items_recalculate ON purchase_order_items;
CREATE TRIGGER trigger_po_items_recalculate
    AFTER INSERT OR UPDATE OR DELETE ON purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalculate_po_totals();

-- ============================================================================
-- HELPER: Get Tax Breakdown for Document
-- Returns aggregated tax by type for display on invoices/orders
-- ============================================================================

CREATE OR REPLACE FUNCTION get_document_tax_breakdown(
    p_document_type VARCHAR(20),  -- 'sales_order', 'invoice', 'purchase_order'
    p_document_id UUID
)
RETURNS TABLE (
    tax_name VARCHAR(100),
    tax_type VARCHAR(20),
    tax_rate DECIMAL(5, 2),
    taxable_amount DECIMAL(12, 2),
    tax_amount DECIMAL(12, 2)
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    IF p_document_type = 'sales_order' THEN
        RETURN QUERY
        SELECT
            lit.tax_name,
            lit.tax_type,
            lit.tax_rate,
            SUM(lit.taxable_amount)::DECIMAL(12, 2) AS taxable_amount,
            SUM(lit.tax_amount)::DECIMAL(12, 2) AS tax_amount
        FROM line_item_taxes lit
        INNER JOIN sales_order_items soi ON soi.id = lit.sales_order_item_id
        WHERE soi.sales_order_id = p_document_id
        GROUP BY lit.tax_name, lit.tax_type, lit.tax_rate
        ORDER BY lit.tax_type, lit.tax_name;

    ELSIF p_document_type = 'invoice' THEN
        RETURN QUERY
        SELECT
            lit.tax_name,
            lit.tax_type,
            lit.tax_rate,
            SUM(lit.taxable_amount)::DECIMAL(12, 2) AS taxable_amount,
            SUM(lit.tax_amount)::DECIMAL(12, 2) AS tax_amount
        FROM line_item_taxes lit
        INNER JOIN invoice_items ii ON ii.id = lit.invoice_item_id
        WHERE ii.invoice_id = p_document_id
        GROUP BY lit.tax_name, lit.tax_type, lit.tax_rate
        ORDER BY lit.tax_type, lit.tax_name;

    ELSIF p_document_type = 'purchase_order' THEN
        RETURN QUERY
        SELECT
            lit.tax_name,
            lit.tax_type,
            lit.tax_rate,
            SUM(lit.taxable_amount)::DECIMAL(12, 2) AS taxable_amount,
            SUM(lit.tax_amount)::DECIMAL(12, 2) AS tax_amount
        FROM line_item_taxes lit
        INNER JOIN purchase_order_items poi ON poi.id = lit.purchase_order_item_id
        WHERE poi.purchase_order_id = p_document_id
        GROUP BY lit.tax_name, lit.tax_type, lit.tax_rate
        ORDER BY lit.tax_type, lit.tax_name;
    END IF;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION recalculate_sales_order_totals IS 'Recalculates sales order totals including taxes from line_item_taxes table';
COMMENT ON FUNCTION recalculate_invoice_totals IS 'Recalculates invoice totals including taxes from line_item_taxes table';
COMMENT ON FUNCTION recalculate_purchase_order_totals IS 'Recalculates purchase order totals including taxes from line_item_taxes table';
COMMENT ON FUNCTION get_document_tax_breakdown IS 'Returns aggregated tax breakdown by type for display on documents';
