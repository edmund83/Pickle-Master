-- Migration: Create entity sequence counter table and functions
-- This provides concurrency-safe sequence generation for display IDs
-- Uses FOR UPDATE locking to prevent race conditions

-- ===================
-- Entity Sequence Counters Table
-- ===================
CREATE TABLE IF NOT EXISTS entity_sequence_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL, -- 'pick_list', 'purchase_order', 'item', 'folder'
    current_value BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_tenant_entity_counter UNIQUE (tenant_id, entity_type)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_entity_counters_tenant_type
    ON entity_sequence_counters(tenant_id, entity_type);

-- Comments
COMMENT ON TABLE entity_sequence_counters IS 'Per-tenant, per-entity-type sequence counters for display ID generation';
COMMENT ON COLUMN entity_sequence_counters.entity_type IS 'Entity type: pick_list, purchase_order, item, folder';
COMMENT ON COLUMN entity_sequence_counters.current_value IS 'Current sequence value (last used number)';

-- ===================
-- Enable RLS
-- ===================
ALTER TABLE entity_sequence_counters ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their tenant's counters
CREATE POLICY "Tenant users can view their counters"
    ON entity_sequence_counters
    FOR SELECT
    USING (tenant_id = get_user_tenant_id());

-- Note: INSERT/UPDATE/DELETE on counters is handled via SECURITY DEFINER functions only
-- This prevents direct manipulation of counters by users

-- ===================
-- Function: Get next sequence number (concurrency-safe)
-- ===================
CREATE OR REPLACE FUNCTION get_next_entity_number(
    p_tenant_id UUID,
    p_entity_type VARCHAR(20)
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_val BIGINT;
BEGIN
    -- Attempt to update existing counter and get next value
    -- The UPDATE implicitly locks the row, preventing race conditions
    UPDATE entity_sequence_counters
    SET current_value = current_value + 1,
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id
      AND entity_type = p_entity_type
    RETURNING current_value INTO next_val;

    -- If no row exists, insert one (handles first-time use)
    IF next_val IS NULL THEN
        INSERT INTO entity_sequence_counters (tenant_id, entity_type, current_value)
        VALUES (p_tenant_id, p_entity_type, 1)
        ON CONFLICT (tenant_id, entity_type) DO UPDATE
        SET current_value = entity_sequence_counters.current_value + 1,
            updated_at = NOW()
        RETURNING current_value INTO next_val;
    END IF;

    RETURN next_val;
END;
$$;

COMMENT ON FUNCTION get_next_entity_number(UUID, VARCHAR) IS 'Atomically increments and returns the next sequence number for a tenant/entity type combination';

-- ===================
-- Function: Generate display ID
-- ===================
CREATE OR REPLACE FUNCTION generate_display_id(
    p_tenant_id UUID,
    p_entity_type VARCHAR(20)
)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_code VARCHAR(5);
    v_prefix VARCHAR(4);
    v_sequence BIGINT;
BEGIN
    -- Get org code for tenant
    SELECT org_code INTO v_org_code
    FROM tenants
    WHERE id = p_tenant_id;

    IF v_org_code IS NULL THEN
        RAISE EXCEPTION 'Tenant org_code not found for tenant_id %', p_tenant_id;
    END IF;

    -- Determine prefix based on entity type
    v_prefix := CASE p_entity_type
        WHEN 'pick_list' THEN 'PL'
        WHEN 'purchase_order' THEN 'PO'
        WHEN 'item' THEN 'ITM'
        WHEN 'folder' THEN 'FLD'
        ELSE UPPER(LEFT(p_entity_type, 3))
    END;

    -- Get next sequence number (atomically)
    v_sequence := get_next_entity_number(p_tenant_id, p_entity_type);

    -- Format: PREFIX-ORGCODE-SEQUENCE (e.g., PL-ACM01-00001)
    RETURN v_prefix || '-' || v_org_code || '-' || LPAD(v_sequence::TEXT, 5, '0');
END;
$$;

COMMENT ON FUNCTION generate_display_id(UUID, VARCHAR) IS 'Generates a unique display ID in format PREFIX-ORGCODE-SEQUENCE (e.g., PL-ACM01-00001)';

-- ===================
-- Function: Get display ID for current user's tenant
-- ===================
CREATE OR REPLACE FUNCTION generate_display_id_for_current_user(
    p_entity_type VARCHAR(20)
)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Current user has no associated tenant';
    END IF;

    RETURN generate_display_id(v_tenant_id, p_entity_type);
END;
$$;

COMMENT ON FUNCTION generate_display_id_for_current_user(VARCHAR) IS 'Generates a display ID for the current authenticated user''s tenant';

-- ===================
-- Initialize counters for existing tenants
-- ===================
INSERT INTO entity_sequence_counters (tenant_id, entity_type, current_value)
SELECT t.id, et.entity_type, 0
FROM tenants t
CROSS JOIN (VALUES ('pick_list'), ('purchase_order'), ('item'), ('folder')) AS et(entity_type)
ON CONFLICT (tenant_id, entity_type) DO NOTHING;
