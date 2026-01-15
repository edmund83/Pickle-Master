-- Migration: 00068_update_display_id.sql
-- Description: Update display_id function to support new entity types

-- ============================================================================
-- UPDATE GENERATE_DISPLAY_ID FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_display_id(
    p_tenant_id UUID,
    p_entity_type VARCHAR(20)
)
RETURNS VARCHAR(25)
LANGUAGE plpgsql
SECURITY DEFINER
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

    -- Default to random code if org_code not set
    IF v_org_code IS NULL THEN
        v_org_code := UPPER(LEFT(MD5(p_tenant_id::TEXT), 5));
    END IF;

    -- Determine prefix based on entity type
    v_prefix := CASE p_entity_type
        WHEN 'pick_list' THEN 'PL'
        WHEN 'purchase_order' THEN 'PO'
        WHEN 'item' THEN 'ITM'
        WHEN 'folder' THEN 'FLD'
        WHEN 'stock_count' THEN 'SC'
        WHEN 'receive' THEN 'RCV'
        WHEN 'sales_order' THEN 'SO'
        WHEN 'delivery_order' THEN 'DO'
        WHEN 'invoice' THEN 'INV'
        WHEN 'customer' THEN 'CUS'
        ELSE UPPER(LEFT(p_entity_type, 3))
    END;

    -- Get next sequence number (atomically)
    v_sequence := get_next_entity_number(p_tenant_id, p_entity_type);

    -- Format: PREFIX-ORGCODE-SEQUENCE (e.g., SO-ACM01-00001)
    RETURN v_prefix || '-' || v_org_code || '-' || LPAD(v_sequence::TEXT, 5, '0');
END;
$$;

-- ============================================================================
-- HELPER FUNCTION FOR CURRENT USER
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_display_id_for_current_user(
    p_entity_type VARCHAR(20)
)
RETURNS VARCHAR(25)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_user_tenant_id();
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No tenant found for current user';
    END IF;

    RETURN generate_display_id(v_tenant_id, p_entity_type);
END;
$$;
