-- ============================================
-- Migration: Payment Terms Table
-- Purpose: Enable tenant-specific payment terms management
-- ============================================

-- 1. Create payment_terms table
CREATE TABLE IF NOT EXISTS payment_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    days INTEGER,  -- Days until payment due (NULL for COD, Prepaid, etc.)
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_payment_term_per_tenant UNIQUE (tenant_id, name)
);

-- 2. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_payment_terms_tenant ON payment_terms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_terms_sort ON payment_terms(tenant_id, sort_order, name);

-- 3. Add comment for documentation
COMMENT ON TABLE payment_terms IS 'Tenant-specific payment terms for vendor management';
COMMENT ON COLUMN payment_terms.days IS 'Number of days until payment is due. NULL for terms like COD or Prepaid';
COMMENT ON COLUMN payment_terms.is_default IS 'Whether this payment term should be pre-selected in forms';

-- 4. Enable RLS
ALTER TABLE payment_terms ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (following tags pattern)
DROP POLICY IF EXISTS "Users can view tenant payment terms" ON payment_terms;
CREATE POLICY "Users can view tenant payment terms" ON payment_terms
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Admins can insert payment terms" ON payment_terms;
CREATE POLICY "Admins can insert payment terms" ON payment_terms
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS "Admins can update payment terms" ON payment_terms;
CREATE POLICY "Admins can update payment terms" ON payment_terms
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS "Admins can delete payment terms" ON payment_terms;
CREATE POLICY "Admins can delete payment terms" ON payment_terms
    FOR DELETE USING (
        tenant_id = get_user_tenant_id()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 6. Function to seed default payment terms for a tenant
CREATE OR REPLACE FUNCTION seed_default_payment_terms(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
    inserted_count INTEGER := 0;
BEGIN
    INSERT INTO payment_terms (tenant_id, name, description, days, sort_order, is_default)
    VALUES
        (p_tenant_id, 'COD', 'Cash on Delivery', NULL, 1, FALSE),
        (p_tenant_id, 'Due on Receipt', 'Payment due upon receipt of invoice', 0, 2, FALSE),
        (p_tenant_id, 'Prepaid', 'Payment required before shipment', NULL, 3, FALSE),
        (p_tenant_id, 'Net 7', 'Payment due within 7 days', 7, 4, FALSE),
        (p_tenant_id, 'Net 15', 'Payment due within 15 days', 15, 5, FALSE),
        (p_tenant_id, 'Net 30', 'Payment due within 30 days', 30, 6, TRUE),
        (p_tenant_id, 'Net 45', 'Payment due within 45 days', 45, 7, FALSE),
        (p_tenant_id, 'Net 60', 'Payment due within 60 days', 60, 8, FALSE),
        (p_tenant_id, 'Net 90', 'Payment due within 90 days', 90, 9, FALSE),
        (p_tenant_id, '2/10 Net 30', '2% discount if paid in 10 days, otherwise net 30', 30, 10, FALSE)
    ON CONFLICT (tenant_id, name) DO NOTHING;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Seed default payment terms for all existing tenants
DO $$
DECLARE
    t_id UUID;
BEGIN
    FOR t_id IN SELECT id FROM tenants
    LOOP
        PERFORM seed_default_payment_terms(t_id);
    END LOOP;
END $$;

-- 8. Add trigger to seed payment terms for new tenants
CREATE OR REPLACE FUNCTION trigger_seed_payment_terms()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM seed_default_payment_terms(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS seed_payment_terms_on_tenant_create ON tenants;
CREATE TRIGGER seed_payment_terms_on_tenant_create
    AFTER INSERT ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_seed_payment_terms();

-- 9. Function to get payment terms with usage count
CREATE OR REPLACE FUNCTION get_payment_terms_with_usage()
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    description TEXT,
    days INTEGER,
    sort_order INTEGER,
    is_default BOOLEAN,
    usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pt.id,
        pt.name,
        pt.description,
        pt.days,
        pt.sort_order,
        pt.is_default,
        COUNT(v.id)::BIGINT as usage_count
    FROM payment_terms pt
    LEFT JOIN vendors v ON v.payment_terms = pt.name AND v.tenant_id = pt.tenant_id
    WHERE pt.tenant_id = get_user_tenant_id()
    GROUP BY pt.id, pt.name, pt.description, pt.days, pt.sort_order, pt.is_default
    ORDER BY pt.sort_order, pt.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 10. Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_terms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_terms_updated_at ON payment_terms;
CREATE TRIGGER payment_terms_updated_at
    BEFORE UPDATE ON payment_terms
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_terms_updated_at();
