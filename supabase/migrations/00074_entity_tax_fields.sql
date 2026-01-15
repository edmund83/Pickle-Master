-- ============================================================================
-- ADD TAX FIELDS TO CUSTOMERS, VENDORS, AND INVENTORY ITEMS
-- Supports worldwide tax ID formats (VAT, GST, EIN, ABN, etc.)
-- ============================================================================

-- ============================================================================
-- CUSTOMERS: Add Tax Fields
-- ============================================================================

-- Tax identification
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_id_label VARCHAR(30) DEFAULT 'Tax ID';

-- Tax behavior
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_tax_exempt BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_exemption_reason TEXT;

-- Default tax rate for this customer (applied to their orders)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS default_tax_rate_id UUID REFERENCES tax_rates(id) ON DELETE SET NULL;

-- Index for tax-related queries
CREATE INDEX IF NOT EXISTS idx_customers_tax_exempt ON customers(tenant_id, is_tax_exempt) WHERE is_tax_exempt = TRUE;
CREATE INDEX IF NOT EXISTS idx_customers_tax_id ON customers(tenant_id, tax_id) WHERE tax_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN customers.tax_id IS 'Customer tax identification number (VAT, GST, EIN, ABN, etc.)';
COMMENT ON COLUMN customers.tax_id_label IS 'Label for tax ID field (e.g., "VAT Number", "GST Number", "ABN")';
COMMENT ON COLUMN customers.is_tax_exempt IS 'If true, no tax will be applied to this customer''s orders';
COMMENT ON COLUMN customers.tax_exemption_reason IS 'Reason for tax exemption (for record-keeping)';
COMMENT ON COLUMN customers.default_tax_rate_id IS 'Default tax rate to apply to this customer''s orders';

-- ============================================================================
-- VENDORS: Add Tax Fields
-- ============================================================================

-- Tax identification
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS tax_id_label VARCHAR(30) DEFAULT 'Tax ID';

-- Index for tax-related queries
CREATE INDEX IF NOT EXISTS idx_vendors_tax_id ON vendors(tenant_id, tax_id) WHERE tax_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN vendors.tax_id IS 'Vendor tax identification number (VAT, GST, EIN, ABN, etc.)';
COMMENT ON COLUMN vendors.tax_id_label IS 'Label for tax ID field (e.g., "VAT Number", "GST Number", "ABN")';

-- ============================================================================
-- INVENTORY ITEMS: Add Tax Fields
-- ============================================================================

-- Default tax rate for this item
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS default_tax_rate_id UUID REFERENCES tax_rates(id) ON DELETE SET NULL;

-- Tax exempt items (e.g., certain food items, medical supplies)
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS is_tax_exempt BOOLEAN DEFAULT FALSE;

-- Index for tax-related queries
CREATE INDEX IF NOT EXISTS idx_inventory_items_tax_exempt ON inventory_items(tenant_id, is_tax_exempt) WHERE is_tax_exempt = TRUE;
CREATE INDEX IF NOT EXISTS idx_inventory_items_default_tax ON inventory_items(tenant_id, default_tax_rate_id) WHERE default_tax_rate_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN inventory_items.default_tax_rate_id IS 'Default tax rate to apply when this item is added to an order';
COMMENT ON COLUMN inventory_items.is_tax_exempt IS 'If true, no tax will be applied to this item';

-- ============================================================================
-- ADD TENANT-LEVEL TAX SETTINGS TO JSONB
-- ============================================================================

-- Update tenant settings validation to include tax settings
CREATE OR REPLACE FUNCTION validate_tenant_settings(settings JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- If settings is null, it's valid (allow null settings)
    IF settings IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Validate time_format if present
    IF settings ? 'time_format' AND settings->>'time_format' IS NOT NULL THEN
        IF settings->>'time_format' NOT IN ('12-hour', '24-hour') THEN
            RAISE EXCEPTION 'Invalid time_format: %. Must be 12-hour or 24-hour', settings->>'time_format';
        END IF;
    END IF;

    -- Validate decimal_precision if present
    IF settings ? 'decimal_precision' AND settings->>'decimal_precision' IS NOT NULL THEN
        IF settings->>'decimal_precision' NOT IN ('1', '0.1', '0.01', '0.001') THEN
            RAISE EXCEPTION 'Invalid decimal_precision: %. Must be 1, 0.1, 0.01, or 0.001', settings->>'decimal_precision';
        END IF;
    END IF;

    -- Validate date_format if present
    IF settings ? 'date_format' AND settings->>'date_format' IS NOT NULL THEN
        IF settings->>'date_format' NOT IN (
            'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD.MM.YYYY'
        ) THEN
            RAISE EXCEPTION 'Invalid date_format: %', settings->>'date_format';
        END IF;
    END IF;

    -- Validate currency if present (must be 3-letter uppercase code)
    IF settings ? 'currency' AND settings->>'currency' IS NOT NULL THEN
        IF settings->>'currency' !~ '^[A-Z]{3}$' THEN
            RAISE EXCEPTION 'Invalid currency code: %. Must be 3-letter uppercase code', settings->>'currency';
        END IF;
    END IF;

    -- Validate country if present (must be 2-letter uppercase code)
    IF settings ? 'country' AND settings->>'country' IS NOT NULL THEN
        IF settings->>'country' !~ '^[A-Z]{2}$' THEN
            RAISE EXCEPTION 'Invalid country code: %. Must be 2-letter uppercase code', settings->>'country';
        END IF;
    END IF;

    -- Validate timezone if present (basic format check - starts with a letter or uppercase region)
    IF settings ? 'timezone' AND settings->>'timezone' IS NOT NULL THEN
        IF settings->>'timezone' !~ '^[A-Za-z]' THEN
            RAISE EXCEPTION 'Invalid timezone: %', settings->>'timezone';
        END IF;
    END IF;

    -- Validate tax_label if present (for display purposes)
    IF settings ? 'tax_label' AND settings->>'tax_label' IS NOT NULL THEN
        IF LENGTH(settings->>'tax_label') > 30 THEN
            RAISE EXCEPTION 'Invalid tax_label: %. Must be 30 characters or less', settings->>'tax_label';
        END IF;
    END IF;

    -- Validate tax_id_label if present
    IF settings ? 'tax_id_label' AND settings->>'tax_id_label' IS NOT NULL THEN
        IF LENGTH(settings->>'tax_id_label') > 30 THEN
            RAISE EXCEPTION 'Invalid tax_id_label: %. Must be 30 characters or less', settings->>'tax_id_label';
        END IF;
    END IF;

    -- Validate company_tax_id if present
    IF settings ? 'company_tax_id' AND settings->>'company_tax_id' IS NOT NULL THEN
        IF LENGTH(settings->>'company_tax_id') > 50 THEN
            RAISE EXCEPTION 'Invalid company_tax_id: %. Must be 50 characters or less', settings->>'company_tax_id';
        END IF;
    END IF;

    -- Validate tax_included_in_prices if present (must be boolean-like)
    -- JSONB booleans are stored as true/false, so we check the type
    IF settings ? 'tax_included_in_prices' THEN
        IF jsonb_typeof(settings->'tax_included_in_prices') != 'boolean' THEN
            RAISE EXCEPTION 'Invalid tax_included_in_prices: must be true or false';
        END IF;
    END IF;

    -- Validate show_tax_on_documents if present
    IF settings ? 'show_tax_on_documents' THEN
        IF jsonb_typeof(settings->'show_tax_on_documents') != 'boolean' THEN
            RAISE EXCEPTION 'Invalid show_tax_on_documents: must be true or false';
        END IF;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- HELPER FUNCTION: Get Customer Tax Info
-- ============================================================================

CREATE OR REPLACE FUNCTION get_customer_tax_info(p_customer_id UUID)
RETURNS TABLE (
    customer_id UUID,
    customer_name VARCHAR(255),
    tax_id VARCHAR(50),
    tax_id_label VARCHAR(30),
    is_tax_exempt BOOLEAN,
    tax_exemption_reason TEXT,
    default_tax_rate_id UUID,
    default_tax_rate_name VARCHAR(100),
    default_tax_rate DECIMAL(5, 2)
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        c.id AS customer_id,
        c.name AS customer_name,
        c.tax_id,
        c.tax_id_label,
        c.is_tax_exempt,
        c.tax_exemption_reason,
        c.default_tax_rate_id,
        tr.name AS default_tax_rate_name,
        tr.rate AS default_tax_rate
    FROM customers c
    LEFT JOIN tax_rates tr ON tr.id = c.default_tax_rate_id AND tr.is_active = TRUE
    WHERE c.id = p_customer_id;
$$;

-- ============================================================================
-- HELPER FUNCTION: Get Item Tax Info
-- ============================================================================

CREATE OR REPLACE FUNCTION get_item_tax_info(p_item_id UUID)
RETURNS TABLE (
    item_id UUID,
    item_name VARCHAR(500),
    is_tax_exempt BOOLEAN,
    default_tax_rate_id UUID,
    default_tax_rate_name VARCHAR(100),
    default_tax_rate DECIMAL(5, 2)
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        i.id AS item_id,
        i.name AS item_name,
        i.is_tax_exempt,
        i.default_tax_rate_id,
        tr.name AS default_tax_rate_name,
        tr.rate AS default_tax_rate
    FROM inventory_items i
    LEFT JOIN tax_rates tr ON tr.id = i.default_tax_rate_id AND tr.is_active = TRUE
    WHERE i.id = p_item_id;
$$;
