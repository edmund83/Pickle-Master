-- ============================================================================
-- LINE ITEM TAXES TABLE
-- Supports multiple taxes per line item (e.g., US state + county, Canada GST + PST)
-- ============================================================================

-- ============================================================================
-- LINE ITEM TAXES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS line_item_taxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Reference to parent line item (one of these must be set)
    sales_order_item_id UUID REFERENCES sales_order_items(id) ON DELETE CASCADE,
    invoice_item_id UUID REFERENCES invoice_items(id) ON DELETE CASCADE,
    purchase_order_item_id UUID REFERENCES purchase_order_items(id) ON DELETE CASCADE,

    -- Reference to tax rate (kept for linking, but details are denormalized)
    tax_rate_id UUID REFERENCES tax_rates(id) ON DELETE SET NULL,

    -- Denormalized tax details (snapshot at time of order for invoice permanence)
    tax_name VARCHAR(100) NOT NULL,
    tax_code VARCHAR(20),
    tax_type VARCHAR(20) NOT NULL DEFAULT 'sales_tax',
    tax_rate DECIMAL(5, 2) NOT NULL,

    -- Amounts
    taxable_amount DECIMAL(12, 2) NOT NULL,  -- The amount this tax is calculated on
    tax_amount DECIMAL(12, 2) NOT NULL,       -- The calculated tax

    -- Behavior
    is_compound BOOLEAN DEFAULT FALSE,        -- Was this applied on top of other taxes?
    sort_order INTEGER DEFAULT 0,             -- Order of application (important for compound)

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure only one parent reference is set
    CONSTRAINT line_item_taxes_single_parent CHECK (
        (
            (sales_order_item_id IS NOT NULL)::int +
            (invoice_item_id IS NOT NULL)::int +
            (purchase_order_item_id IS NOT NULL)::int
        ) = 1
    )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_line_item_taxes_tenant ON line_item_taxes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_line_item_taxes_so_item ON line_item_taxes(sales_order_item_id) WHERE sales_order_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_line_item_taxes_invoice_item ON line_item_taxes(invoice_item_id) WHERE invoice_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_line_item_taxes_po_item ON line_item_taxes(purchase_order_item_id) WHERE purchase_order_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_line_item_taxes_tax_rate ON line_item_taxes(tax_rate_id) WHERE tax_rate_id IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE line_item_taxes ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy (simplified - relies on parent item's RLS)
CREATE POLICY line_item_taxes_tenant_isolation ON line_item_taxes
    FOR ALL
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())
        )
    );

-- ============================================================================
-- HELPER FUNCTION: Get Taxes for Sales Order Item
-- ============================================================================

CREATE OR REPLACE FUNCTION get_sales_order_item_taxes(p_item_id UUID)
RETURNS TABLE (
    id UUID,
    tax_name VARCHAR(100),
    tax_code VARCHAR(20),
    tax_type VARCHAR(20),
    tax_rate DECIMAL(5, 2),
    taxable_amount DECIMAL(12, 2),
    tax_amount DECIMAL(12, 2),
    is_compound BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        id, tax_name, tax_code, tax_type, tax_rate,
        taxable_amount, tax_amount, is_compound
    FROM line_item_taxes
    WHERE sales_order_item_id = p_item_id
    ORDER BY sort_order, created_at;
$$;

-- ============================================================================
-- HELPER FUNCTION: Get Taxes for Invoice Item
-- ============================================================================

CREATE OR REPLACE FUNCTION get_invoice_item_taxes(p_item_id UUID)
RETURNS TABLE (
    id UUID,
    tax_name VARCHAR(100),
    tax_code VARCHAR(20),
    tax_type VARCHAR(20),
    tax_rate DECIMAL(5, 2),
    taxable_amount DECIMAL(12, 2),
    tax_amount DECIMAL(12, 2),
    is_compound BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        id, tax_name, tax_code, tax_type, tax_rate,
        taxable_amount, tax_amount, is_compound
    FROM line_item_taxes
    WHERE invoice_item_id = p_item_id
    ORDER BY sort_order, created_at;
$$;

-- ============================================================================
-- HELPER FUNCTION: Calculate Total Tax for Sales Order
-- ============================================================================

CREATE OR REPLACE FUNCTION get_sales_order_tax_summary(p_sales_order_id UUID)
RETURNS TABLE (
    tax_name VARCHAR(100),
    tax_type VARCHAR(20),
    tax_rate DECIMAL(5, 2),
    total_taxable DECIMAL(12, 2),
    total_tax DECIMAL(12, 2)
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        lit.tax_name,
        lit.tax_type,
        lit.tax_rate,
        SUM(lit.taxable_amount) AS total_taxable,
        SUM(lit.tax_amount) AS total_tax
    FROM line_item_taxes lit
    INNER JOIN sales_order_items soi ON soi.id = lit.sales_order_item_id
    WHERE soi.sales_order_id = p_sales_order_id
    GROUP BY lit.tax_name, lit.tax_type, lit.tax_rate
    ORDER BY lit.tax_name;
$$;

-- ============================================================================
-- HELPER FUNCTION: Calculate Total Tax for Invoice
-- ============================================================================

CREATE OR REPLACE FUNCTION get_invoice_tax_summary(p_invoice_id UUID)
RETURNS TABLE (
    tax_name VARCHAR(100),
    tax_type VARCHAR(20),
    tax_rate DECIMAL(5, 2),
    total_taxable DECIMAL(12, 2),
    total_tax DECIMAL(12, 2)
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        lit.tax_name,
        lit.tax_type,
        lit.tax_rate,
        SUM(lit.taxable_amount) AS total_taxable,
        SUM(lit.tax_amount) AS total_tax
    FROM line_item_taxes lit
    INNER JOIN invoice_items ii ON ii.id = lit.invoice_item_id
    WHERE ii.invoice_id = p_invoice_id
    GROUP BY lit.tax_name, lit.tax_type, lit.tax_rate
    ORDER BY lit.tax_name;
$$;

-- ============================================================================
-- FUNCTION: Add Tax to Line Item
-- ============================================================================

CREATE OR REPLACE FUNCTION add_line_item_tax(
    p_tenant_id UUID,
    p_item_type VARCHAR(20),           -- 'sales_order_item', 'invoice_item', 'purchase_order_item'
    p_item_id UUID,
    p_tax_rate_id UUID,
    p_taxable_amount DECIMAL(12, 2),
    p_is_compound BOOLEAN DEFAULT FALSE,
    p_sort_order INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tax_rate RECORD;
    v_tax_amount DECIMAL(12, 2);
    v_new_id UUID;
BEGIN
    -- Get tax rate details
    SELECT name, code, tax_type, rate
    INTO v_tax_rate
    FROM tax_rates
    WHERE id = p_tax_rate_id AND is_active = TRUE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tax rate not found or inactive: %', p_tax_rate_id;
    END IF;

    -- Calculate tax amount
    v_tax_amount := ROUND(p_taxable_amount * v_tax_rate.rate / 100, 2);

    -- Insert line item tax
    INSERT INTO line_item_taxes (
        tenant_id,
        sales_order_item_id,
        invoice_item_id,
        purchase_order_item_id,
        tax_rate_id,
        tax_name,
        tax_code,
        tax_type,
        tax_rate,
        taxable_amount,
        tax_amount,
        is_compound,
        sort_order
    ) VALUES (
        p_tenant_id,
        CASE WHEN p_item_type = 'sales_order_item' THEN p_item_id ELSE NULL END,
        CASE WHEN p_item_type = 'invoice_item' THEN p_item_id ELSE NULL END,
        CASE WHEN p_item_type = 'purchase_order_item' THEN p_item_id ELSE NULL END,
        p_tax_rate_id,
        v_tax_rate.name,
        v_tax_rate.code,
        v_tax_rate.tax_type,
        v_tax_rate.rate,
        p_taxable_amount,
        v_tax_amount,
        p_is_compound,
        p_sort_order
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;
END;
$$;

-- ============================================================================
-- FUNCTION: Clear and Recalculate Line Item Taxes
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_line_item_taxes(
    p_item_type VARCHAR(20),
    p_item_id UUID,
    p_tax_rate_ids UUID[],
    p_taxable_amount DECIMAL(12, 2)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_tax_rate_id UUID;
    v_sort_order INTEGER := 0;
    v_running_total DECIMAL(12, 2) := p_taxable_amount;
    v_tax_rate RECORD;
    v_tax_amount DECIMAL(12, 2);
BEGIN
    -- Get tenant_id from the parent item
    IF p_item_type = 'sales_order_item' THEN
        SELECT so.tenant_id INTO v_tenant_id
        FROM sales_order_items soi
        JOIN sales_orders so ON so.id = soi.sales_order_id
        WHERE soi.id = p_item_id;
    ELSIF p_item_type = 'invoice_item' THEN
        SELECT i.tenant_id INTO v_tenant_id
        FROM invoice_items ii
        JOIN invoices i ON i.id = ii.invoice_id
        WHERE ii.id = p_item_id;
    ELSIF p_item_type = 'purchase_order_item' THEN
        SELECT po.tenant_id INTO v_tenant_id
        FROM purchase_order_items poi
        JOIN purchase_orders po ON po.id = poi.purchase_order_id
        WHERE poi.id = p_item_id;
    END IF;

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Could not determine tenant for item: % %', p_item_type, p_item_id;
    END IF;

    -- Delete existing taxes for this line item
    IF p_item_type = 'sales_order_item' THEN
        DELETE FROM line_item_taxes WHERE sales_order_item_id = p_item_id;
    ELSIF p_item_type = 'invoice_item' THEN
        DELETE FROM line_item_taxes WHERE invoice_item_id = p_item_id;
    ELSIF p_item_type = 'purchase_order_item' THEN
        DELETE FROM line_item_taxes WHERE purchase_order_item_id = p_item_id;
    END IF;

    -- Add each tax rate
    FOREACH v_tax_rate_id IN ARRAY p_tax_rate_ids
    LOOP
        -- Get tax rate details
        SELECT name, code, tax_type, rate, is_compound
        INTO v_tax_rate
        FROM tax_rates
        WHERE id = v_tax_rate_id AND is_active = TRUE;

        IF FOUND THEN
            -- Calculate tax amount (compound taxes use running total)
            IF v_tax_rate.is_compound THEN
                v_tax_amount := ROUND(v_running_total * v_tax_rate.rate / 100, 2);
            ELSE
                v_tax_amount := ROUND(p_taxable_amount * v_tax_rate.rate / 100, 2);
            END IF;

            -- Insert tax
            INSERT INTO line_item_taxes (
                tenant_id,
                sales_order_item_id,
                invoice_item_id,
                purchase_order_item_id,
                tax_rate_id,
                tax_name,
                tax_code,
                tax_type,
                tax_rate,
                taxable_amount,
                tax_amount,
                is_compound,
                sort_order
            ) VALUES (
                v_tenant_id,
                CASE WHEN p_item_type = 'sales_order_item' THEN p_item_id ELSE NULL END,
                CASE WHEN p_item_type = 'invoice_item' THEN p_item_id ELSE NULL END,
                CASE WHEN p_item_type = 'purchase_order_item' THEN p_item_id ELSE NULL END,
                v_tax_rate_id,
                v_tax_rate.name,
                v_tax_rate.code,
                v_tax_rate.tax_type,
                v_tax_rate.rate,
                CASE WHEN v_tax_rate.is_compound THEN v_running_total ELSE p_taxable_amount END,
                v_tax_amount,
                v_tax_rate.is_compound,
                v_sort_order
            );

            -- Update running total for compound taxes
            v_running_total := v_running_total + v_tax_amount;
            v_sort_order := v_sort_order + 1;
        END IF;
    END LOOP;
END;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE line_item_taxes IS 'Stores individual tax amounts per line item, supporting multiple taxes (e.g., state + county, GST + PST)';
COMMENT ON COLUMN line_item_taxes.taxable_amount IS 'The base amount this tax was calculated on';
COMMENT ON COLUMN line_item_taxes.tax_amount IS 'The calculated tax amount (taxable_amount * tax_rate / 100)';
COMMENT ON COLUMN line_item_taxes.is_compound IS 'If true, this tax was calculated on subtotal + previous taxes';
COMMENT ON COLUMN line_item_taxes.sort_order IS 'Order in which taxes were applied (important for compound taxes)';
