-- ============================================
-- Migration: External Contacts for Lending
-- Purpose: Track external people (non-team members) who can borrow items
-- ============================================

-- ===================
-- CONTACTS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Identity
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    id_number VARCHAR(100),  -- Employee ID, IC, badge number, etc.
    company VARCHAR(255),    -- External company/organization

    -- Metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,

    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_tenant ON contacts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_contacts_active ON contacts(tenant_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(tenant_id, company) WHERE company IS NOT NULL;

-- Unique constraint: same name + company within a tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_unique_name_company
    ON contacts(tenant_id, name, COALESCE(company, ''));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_contacts_updated_at ON contacts;
CREATE TRIGGER trigger_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===================
-- ADD 'contact' TO ENUM
-- ===================
-- Note: ALTER TYPE ... ADD VALUE cannot be inside a transaction block in some cases,
-- but Supabase migrations handle this properly
ALTER TYPE checkout_assignee_type ADD VALUE IF NOT EXISTS 'contact';

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tenant contacts" ON contacts;
CREATE POLICY "Users can view tenant contacts" ON contacts
    FOR SELECT USING (tenant_id = get_user_tenant_id());

DROP POLICY IF EXISTS "Editors can insert contacts" ON contacts;
CREATE POLICY "Editors can insert contacts" ON contacts
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Editors can update contacts" ON contacts;
CREATE POLICY "Editors can update contacts" ON contacts
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    );

DROP POLICY IF EXISTS "Admins can delete contacts" ON contacts;
CREATE POLICY "Admins can delete contacts" ON contacts
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- ===================
-- RPC FUNCTIONS
-- ===================

-- List contacts for the current tenant
CREATE OR REPLACE FUNCTION get_contacts(
    p_search TEXT DEFAULT NULL,
    p_include_inactive BOOLEAN DEFAULT FALSE,
    p_limit INTEGER DEFAULT 50
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
        FROM (
            SELECT
                id,
                name,
                email,
                phone,
                id_number,
                company,
                notes,
                is_active,
                created_at
            FROM contacts
            WHERE tenant_id = get_user_tenant_id()
            AND (p_include_inactive OR is_active = TRUE)
            AND (
                p_search IS NULL
                OR name ILIKE '%' || p_search || '%'
                OR email ILIKE '%' || p_search || '%'
                OR phone ILIKE '%' || p_search || '%'
                OR company ILIKE '%' || p_search || '%'
                OR id_number ILIKE '%' || p_search || '%'
            )
            ORDER BY name ASC
            LIMIT p_limit
        ) c
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create a new contact
CREATE OR REPLACE FUNCTION create_contact(
    p_name VARCHAR,
    p_email VARCHAR DEFAULT NULL,
    p_phone VARCHAR DEFAULT NULL,
    p_id_number VARCHAR DEFAULT NULL,
    p_company VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_contact_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Get tenant ID
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;

    -- Check for duplicate
    IF EXISTS (
        SELECT 1 FROM contacts
        WHERE tenant_id = v_tenant_id
        AND name = p_name
        AND COALESCE(company, '') = COALESCE(p_company, '')
    ) THEN
        RETURN json_build_object('success', false, 'error', 'A contact with this name and company already exists');
    END IF;

    -- Insert contact
    INSERT INTO contacts (
        tenant_id, name, email, phone, id_number, company, notes, created_by
    ) VALUES (
        v_tenant_id, p_name, p_email, p_phone, p_id_number, p_company, p_notes, auth.uid()
    ) RETURNING id INTO v_contact_id;

    RETURN json_build_object(
        'success', true,
        'contact_id', v_contact_id,
        'contact', (
            SELECT row_to_json(c) FROM (
                SELECT id, name, email, phone, id_number, company, notes, is_active
                FROM contacts WHERE id = v_contact_id
            ) c
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update a contact
CREATE OR REPLACE FUNCTION update_contact(
    p_contact_id UUID,
    p_name VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_phone VARCHAR DEFAULT NULL,
    p_id_number VARCHAR DEFAULT NULL,
    p_company VARCHAR DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Verify contact belongs to user's tenant
    SELECT tenant_id INTO v_tenant_id
    FROM contacts
    WHERE id = p_contact_id AND tenant_id = get_user_tenant_id();

    IF v_tenant_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Contact not found');
    END IF;

    -- Update contact
    UPDATE contacts SET
        name = COALESCE(p_name, name),
        email = COALESCE(p_email, email),
        phone = COALESCE(p_phone, phone),
        id_number = COALESCE(p_id_number, id_number),
        company = COALESCE(p_company, company),
        notes = COALESCE(p_notes, notes),
        is_active = COALESCE(p_is_active, is_active)
    WHERE id = p_contact_id;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get contact borrowing history
CREATE OR REPLACE FUNCTION get_contact_checkouts(
    p_contact_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
        FROM (
            SELECT
                ch.id,
                ch.item_id,
                i.name as item_name,
                i.sku as item_sku,
                ch.quantity,
                ch.checked_out_at,
                ch.due_date,
                ch.status,
                ch.returned_at,
                ch.return_condition
            FROM checkouts ch
            JOIN inventory_items i ON i.id = ch.item_id
            WHERE ch.tenant_id = get_user_tenant_id()
            AND ch.assignee_type = 'contact'
            AND ch.assignee_id = p_contact_id
            ORDER BY ch.checked_out_at DESC
            LIMIT p_limit
        ) c
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
