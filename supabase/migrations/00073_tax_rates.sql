-- ============================================================================
-- TAX RATES TABLE
-- Worldwide tax compatibility: USA Sales Tax, EU VAT, GST, HST, etc.
-- ============================================================================

-- ============================================================================
-- TAX RATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identification
    name VARCHAR(100) NOT NULL,                    -- "California Sales Tax", "UK VAT Standard"
    code VARCHAR(20),                              -- "CA-ST", "VAT-20" (optional, for integrations)
    description TEXT,

    -- Tax Type (for display/grouping)
    tax_type VARCHAR(20) NOT NULL DEFAULT 'sales_tax',  -- 'sales_tax', 'vat', 'gst', 'hst', 'pst', 'other'

    -- Rate (stored as percentage, e.g., 8.25 = 8.25%)
    rate DECIMAL(5, 2) NOT NULL CHECK (rate >= 0 AND rate <= 100),

    -- Region (optional, for organization/filtering)
    country_code CHAR(2),                          -- 'US', 'GB', 'AU', 'CA', etc.
    region_code VARCHAR(10),                       -- 'CA', 'TX', 'ON', etc. (state/province)

    -- Behavior
    is_default BOOLEAN DEFAULT FALSE,              -- Auto-apply to new orders when no other tax specified
    applies_to_shipping BOOLEAN DEFAULT FALSE,     -- Whether this tax applies to shipping charges
    is_compound BOOLEAN DEFAULT FALSE,             -- Applied on top of other taxes (e.g., PST on GST+amount)
    is_active BOOLEAN DEFAULT TRUE,

    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(tenant_id, name)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tax_rates_tenant_id ON tax_rates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tax_rates_tenant_active ON tax_rates(tenant_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_tax_rates_tenant_default ON tax_rates(tenant_id) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_tax_rates_country ON tax_rates(tenant_id, country_code) WHERE country_code IS NOT NULL;

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_tax_rates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tax_rates_updated_at
    BEFORE UPDATE ON tax_rates
    FOR EACH ROW
    EXECUTE FUNCTION update_tax_rates_updated_at();

-- ============================================================================
-- ENSURE ONLY ONE DEFAULT TAX RATE PER TENANT
-- ============================================================================

CREATE OR REPLACE FUNCTION ensure_single_default_tax_rate()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this tax rate as default, unset any other defaults for this tenant
    IF NEW.is_default = TRUE THEN
        UPDATE tax_rates
        SET is_default = FALSE
        WHERE tenant_id = NEW.tenant_id
          AND id != NEW.id
          AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_tax_rate
    BEFORE INSERT OR UPDATE ON tax_rates
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_default_tax_rate();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- View: All authenticated users can view their tenant's tax rates
CREATE POLICY tax_rates_select ON tax_rates
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles WHERE id = (SELECT auth.uid())
        )
    );

-- Insert: Only admins/owners can create tax rates
CREATE POLICY tax_rates_insert ON tax_rates
    FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM profiles
            WHERE id = (SELECT auth.uid())
              AND role IN ('admin', 'owner')
        )
    );

-- Update: Only admins/owners can update tax rates
CREATE POLICY tax_rates_update ON tax_rates
    FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles
            WHERE id = (SELECT auth.uid())
              AND role IN ('admin', 'owner')
        )
    );

-- Delete: Only admins/owners can delete tax rates
CREATE POLICY tax_rates_delete ON tax_rates
    FOR DELETE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM profiles
            WHERE id = (SELECT auth.uid())
              AND role IN ('admin', 'owner')
        )
    );

-- ============================================================================
-- HELPER FUNCTION: Get Default Tax Rate for Tenant
-- ============================================================================

CREATE OR REPLACE FUNCTION get_default_tax_rate(p_tenant_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    rate DECIMAL(5, 2),
    tax_type VARCHAR(20)
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT id, name, rate, tax_type
    FROM tax_rates
    WHERE tenant_id = p_tenant_id
      AND is_default = TRUE
      AND is_active = TRUE
    LIMIT 1;
$$;

-- ============================================================================
-- HELPER FUNCTION: Get Active Tax Rates for Tenant
-- ============================================================================

CREATE OR REPLACE FUNCTION get_active_tax_rates(p_tenant_id UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    code VARCHAR(20),
    rate DECIMAL(5, 2),
    tax_type VARCHAR(20),
    country_code CHAR(2),
    region_code VARCHAR(10),
    is_default BOOLEAN,
    applies_to_shipping BOOLEAN,
    is_compound BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        id, name, code, rate, tax_type,
        country_code, region_code,
        is_default, applies_to_shipping, is_compound
    FROM tax_rates
    WHERE tenant_id = p_tenant_id
      AND is_active = TRUE
    ORDER BY is_default DESC, name ASC;
$$;

-- ============================================================================
-- DISPLAY ID SUPPORT
-- ============================================================================

-- Add tax_rate to entity types for display ID generation
DO $$
BEGIN
    -- Add to sequence counters if not exists
    IF NOT EXISTS (
        SELECT 1 FROM entity_sequence_counters
        WHERE entity_type = 'tax_rate'
        LIMIT 1
    ) THEN
        INSERT INTO entity_sequence_counters (tenant_id, entity_type, current_value)
        SELECT DISTINCT tenant_id, 'tax_rate', 0
        FROM tenants;
    END IF;
EXCEPTION
    WHEN undefined_table THEN
        -- entity_sequence_counters doesn't exist, skip
        NULL;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE tax_rates IS 'Tenant-managed tax rates for worldwide tax compatibility (USA Sales Tax, EU VAT, GST, etc.)';
COMMENT ON COLUMN tax_rates.tax_type IS 'Tax category: sales_tax (USA), vat (EU/UK), gst (AU/CA/SG), hst (CA), pst (CA), other';
COMMENT ON COLUMN tax_rates.rate IS 'Tax rate as percentage (e.g., 8.25 = 8.25%)';
COMMENT ON COLUMN tax_rates.is_compound IS 'If true, this tax is calculated on the subtotal + other taxes (e.g., some Canadian provincial taxes)';
COMMENT ON COLUMN tax_rates.applies_to_shipping IS 'If true, this tax rate applies to shipping charges as well as line items';
