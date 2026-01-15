-- Migration: 00063_customers.sql
-- Description: Customer table for sales order management (mirrors vendor structure)

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    customer_code VARCHAR(50),  -- Optional customer reference code

    -- Contact
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),

    -- Billing address
    billing_address_line1 VARCHAR(500),
    billing_address_line2 VARCHAR(500),
    billing_city VARCHAR(255),
    billing_state VARCHAR(255),
    billing_postal_code VARCHAR(50),
    billing_country VARCHAR(100),

    -- Shipping address (default)
    shipping_address_line1 VARCHAR(500),
    shipping_address_line2 VARCHAR(500),
    shipping_city VARCHAR(255),
    shipping_state VARCHAR(255),
    shipping_postal_code VARCHAR(50),
    shipping_country VARCHAR(100),
    shipping_same_as_billing BOOLEAN DEFAULT FALSE,

    -- Payment terms
    payment_term_id UUID REFERENCES payment_terms(id) ON DELETE SET NULL,
    credit_limit DECIMAL(12, 2) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,

    -- Audit
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_customer_name_per_tenant UNIQUE (tenant_id, name)
);

-- Create partial unique index for customer_code (only when not null)
CREATE UNIQUE INDEX idx_unique_customer_code_per_tenant
ON customers(tenant_id, customer_code)
WHERE customer_code IS NOT NULL;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_customers_tenant ON customers(tenant_id);
CREATE INDEX idx_customers_tenant_name ON customers(tenant_id, name);
CREATE INDEX idx_customers_tenant_active ON customers(tenant_id, is_active);
CREATE INDEX idx_customers_tenant_updated ON customers(tenant_id, updated_at DESC);
CREATE INDEX idx_customers_email ON customers(tenant_id, email) WHERE email IS NOT NULL;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY customers_tenant_isolation ON customers
    FOR ALL
    USING (tenant_id = get_user_tenant_id())
    WITH CHECK (tenant_id = get_user_tenant_id());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();

-- ============================================================================
-- ACTIVITY LOGGING TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION log_customer_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action_type TEXT;
    v_changes JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_action_type := 'create';
        v_changes := jsonb_build_object('name', NEW.name);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action_type := 'update';
        v_changes := jsonb_build_object(
            'name', CASE WHEN OLD.name != NEW.name THEN jsonb_build_object('from', OLD.name, 'to', NEW.name) ELSE NULL END,
            'email', CASE WHEN OLD.email IS DISTINCT FROM NEW.email THEN jsonb_build_object('from', OLD.email, 'to', NEW.email) ELSE NULL END,
            'is_active', CASE WHEN OLD.is_active != NEW.is_active THEN jsonb_build_object('from', OLD.is_active, 'to', NEW.is_active) ELSE NULL END
        );
        -- Remove null values
        v_changes := (SELECT jsonb_object_agg(key, value) FROM jsonb_each(v_changes) WHERE value IS NOT NULL);
    ELSIF TG_OP = 'DELETE' THEN
        v_action_type := 'delete';
        v_changes := jsonb_build_object('name', OLD.name);
    END IF;

    INSERT INTO activity_logs (
        tenant_id,
        user_id,
        entity_type,
        entity_id,
        entity_name,
        action_type,
        changes
    ) VALUES (
        COALESCE(NEW.tenant_id, OLD.tenant_id),
        auth.uid(),
        'customer',
        COALESCE(NEW.id, OLD.id),
        COALESCE(NEW.name, OLD.name),
        v_action_type,
        v_changes
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_log_customer_changes
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION log_customer_changes();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Search customers for autocomplete
CREATE OR REPLACE FUNCTION search_customers(
    p_query TEXT,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    customer_code VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    billing_city VARCHAR(255),
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c.customer_code,
        c.email,
        c.phone,
        c.billing_city,
        c.is_active
    FROM customers c
    WHERE c.tenant_id = get_user_tenant_id()
      AND c.is_active = TRUE
      AND (
          c.name ILIKE '%' || p_query || '%'
          OR c.customer_code ILIKE '%' || p_query || '%'
          OR c.email ILIKE '%' || p_query || '%'
      )
    ORDER BY
        CASE WHEN c.name ILIKE p_query || '%' THEN 0 ELSE 1 END,
        c.name
    LIMIT p_limit;
END;
$$;

-- Get customer with full details
CREATE OR REPLACE FUNCTION get_customer_details(p_customer_id UUID)
RETURNS TABLE (
    id UUID,
    tenant_id UUID,
    name VARCHAR(255),
    customer_code VARCHAR(50),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    billing_address_line1 VARCHAR(500),
    billing_address_line2 VARCHAR(500),
    billing_city VARCHAR(255),
    billing_state VARCHAR(255),
    billing_postal_code VARCHAR(50),
    billing_country VARCHAR(100),
    shipping_address_line1 VARCHAR(500),
    shipping_address_line2 VARCHAR(500),
    shipping_city VARCHAR(255),
    shipping_state VARCHAR(255),
    shipping_postal_code VARCHAR(50),
    shipping_country VARCHAR(100),
    shipping_same_as_billing BOOLEAN,
    payment_term_id UUID,
    payment_term_name VARCHAR(255),
    credit_limit DECIMAL(12, 2),
    is_active BOOLEAN,
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    total_orders BIGINT,
    total_revenue DECIMAL(12, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.tenant_id,
        c.name,
        c.customer_code,
        c.contact_name,
        c.email,
        c.phone,
        c.billing_address_line1,
        c.billing_address_line2,
        c.billing_city,
        c.billing_state,
        c.billing_postal_code,
        c.billing_country,
        c.shipping_address_line1,
        c.shipping_address_line2,
        c.shipping_city,
        c.shipping_state,
        c.shipping_postal_code,
        c.shipping_country,
        c.shipping_same_as_billing,
        c.payment_term_id,
        pt.name AS payment_term_name,
        c.credit_limit,
        c.is_active,
        c.notes,
        c.created_at,
        c.updated_at,
        0::BIGINT AS total_orders,  -- Will be updated when sales_orders table exists
        0::DECIMAL(12,2) AS total_revenue  -- Will be updated when sales_orders table exists
    FROM customers c
    LEFT JOIN payment_terms pt ON pt.id = c.payment_term_id
    WHERE c.id = p_customer_id
      AND c.tenant_id = get_user_tenant_id();
END;
$$;
