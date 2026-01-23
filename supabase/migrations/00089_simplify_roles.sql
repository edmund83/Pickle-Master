-- Simplify Role System: 5 roles → 3 roles
-- Migration: owner, admin, editor, viewer, member → owner, staff, viewer
--
-- Role mapping:
--   owner  → owner  (unchanged)
--   admin  → staff  (demoted from admin privileges)
--   editor → staff  (unchanged permissions)
--   viewer → viewer (unchanged)
--   member → viewer (same as viewer)

-- ============================================================================
-- 1. MIGRATE EXISTING DATA
-- ============================================================================

-- Convert admin users to staff (they lose team management but keep inventory ops)
UPDATE profiles SET role = 'staff' WHERE role = 'admin';

-- Convert editor users to staff
UPDATE profiles SET role = 'staff' WHERE role = 'editor';

-- Convert member users to viewer
UPDATE profiles SET role = 'viewer' WHERE role = 'member';

-- ============================================================================
-- 2. UPDATE VALIDATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_user_role(role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN role IN ('owner', 'staff', 'viewer');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 3. UPDATE RLS POLICIES - INVENTORY ITEMS
-- ============================================================================

-- Drop and recreate item policies with new roles
DROP POLICY IF EXISTS "Editors can insert items" ON inventory_items;
CREATE POLICY "Staff can insert items" ON inventory_items
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update items" ON inventory_items;
CREATE POLICY "Staff can update items" ON inventory_items
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete items" ON inventory_items;
CREATE POLICY "Staff can delete items" ON inventory_items
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 4. UPDATE RLS POLICIES - FOLDERS
-- ============================================================================

DROP POLICY IF EXISTS "Editors can insert folders" ON folders;
CREATE POLICY "Staff can insert folders" ON folders
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update folders" ON folders;
CREATE POLICY "Staff can update folders" ON folders
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete folders" ON folders;
CREATE POLICY "Staff can delete folders" ON folders
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 5. UPDATE RLS POLICIES - TAGS
-- ============================================================================

DROP POLICY IF EXISTS "Editors can insert tags" ON tags;
CREATE POLICY "Staff can insert tags" ON tags
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update tags" ON tags;
CREATE POLICY "Staff can update tags" ON tags
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete tags" ON tags;
CREATE POLICY "Staff can delete tags" ON tags
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 6. UPDATE RLS POLICIES - VENDORS
-- ============================================================================

DROP POLICY IF EXISTS "Editors can insert vendors" ON vendors;
CREATE POLICY "Staff can insert vendors" ON vendors
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update vendors" ON vendors;
CREATE POLICY "Staff can update vendors" ON vendors
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete vendors" ON vendors;
CREATE POLICY "Staff can delete vendors" ON vendors
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 7. UPDATE RLS POLICIES - PURCHASE ORDERS
-- ============================================================================

DROP POLICY IF EXISTS "Editors can insert purchase_orders" ON purchase_orders;
CREATE POLICY "Staff can insert purchase_orders" ON purchase_orders
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update purchase_orders" ON purchase_orders;
CREATE POLICY "Staff can update purchase_orders" ON purchase_orders
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete purchase_orders" ON purchase_orders;
CREATE POLICY "Staff can delete purchase_orders" ON purchase_orders
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 8. UPDATE RLS POLICIES - PICK LISTS
-- ============================================================================

DROP POLICY IF EXISTS "Editors can insert pick_lists" ON pick_lists;
CREATE POLICY "Staff can insert pick_lists" ON pick_lists
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update pick_lists" ON pick_lists;
CREATE POLICY "Staff can update pick_lists" ON pick_lists
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete pick_lists" ON pick_lists;
CREATE POLICY "Staff can delete pick_lists" ON pick_lists
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 9. UPDATE RLS POLICIES - ADDRESSES
-- ============================================================================

DROP POLICY IF EXISTS "Editors can insert addresses" ON addresses;
CREATE POLICY "Staff can insert addresses" ON addresses
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update addresses" ON addresses;
CREATE POLICY "Staff can update addresses" ON addresses
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete addresses" ON addresses;
CREATE POLICY "Staff can delete addresses" ON addresses
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 10. UPDATE RLS POLICIES - LOTS
-- ============================================================================

DROP POLICY IF EXISTS "Editors can insert lots" ON lots;
CREATE POLICY "Staff can insert lots" ON lots
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update lots" ON lots;
CREATE POLICY "Staff can update lots" ON lots
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete lots" ON lots;
CREATE POLICY "Staff can delete lots" ON lots
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 11. UPDATE RLS POLICIES - RECEIVES
-- ============================================================================

DROP POLICY IF EXISTS "Editors can insert receives" ON receives;
CREATE POLICY "Staff can insert receives" ON receives
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update receives" ON receives;
CREATE POLICY "Staff can update receives" ON receives
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete receives" ON receives;
CREATE POLICY "Staff can delete receives" ON receives
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 12. UPDATE RLS POLICIES - RECEIVE ITEMS
-- ============================================================================

DROP POLICY IF EXISTS "Editors can insert receive_items" ON receive_items;
CREATE POLICY "Staff can insert receive_items" ON receive_items
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM receives r WHERE r.id = receive_id AND r.tenant_id = get_user_tenant_id()) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Editors can update receive_items" ON receive_items;
CREATE POLICY "Staff can update receive_items" ON receive_items
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM receives r WHERE r.id = receive_id AND r.tenant_id = get_user_tenant_id()) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

DROP POLICY IF EXISTS "Admins can delete receive_items" ON receive_items;
CREATE POLICY "Staff can delete receive_items" ON receive_items
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM receives r WHERE r.id = receive_id AND r.tenant_id = get_user_tenant_id()) AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'staff'))
    );

-- ============================================================================
-- 13. UPDATE RLS POLICIES - PAYMENT TERMS
-- ============================================================================

DROP POLICY IF EXISTS "Admins can insert payment_terms" ON payment_terms;
CREATE POLICY "Owner can insert payment_terms" ON payment_terms
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
    );

DROP POLICY IF EXISTS "Admins can update payment_terms" ON payment_terms;
CREATE POLICY "Owner can update payment_terms" ON payment_terms
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
    );

DROP POLICY IF EXISTS "Admins can delete payment_terms" ON payment_terms;
CREATE POLICY "Owner can delete payment_terms" ON payment_terms
    FOR DELETE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
    );

-- ============================================================================
-- 14. UPDATE RLS POLICIES - TENANTS
-- ============================================================================

DROP POLICY IF EXISTS "Owners and admins can update tenant" ON tenants;
CREATE POLICY "Owner can update tenant" ON tenants
    FOR UPDATE USING (
        id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
    );

-- ============================================================================
-- 15. UPDATE HELPER FUNCTIONS THAT CHECK ROLES
-- ============================================================================

-- Update reminder creation function
CREATE OR REPLACE FUNCTION create_item_reminder(
    p_item_id UUID,
    p_reminder_type VARCHAR(50),
    p_reminder_date TIMESTAMPTZ,
    p_quantity_threshold INTEGER DEFAULT NULL,
    p_comparison_operator VARCHAR(10) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_tenant_id UUID;
    v_user_id UUID;
    v_user_role VARCHAR(50);
    v_item_tenant_id UUID;
    v_new_id UUID;
BEGIN
    v_user_id := auth.uid();
    SELECT tenant_id, role INTO v_tenant_id, v_user_role FROM profiles WHERE id = v_user_id;

    IF v_user_role NOT IN ('owner', 'staff') THEN
        RAISE EXCEPTION 'Permission denied: requires owner or staff role';
    END IF;

    SELECT tenant_id INTO v_item_tenant_id FROM inventory_items WHERE id = p_item_id;
    IF v_item_tenant_id IS NULL OR v_item_tenant_id != v_tenant_id THEN
        RAISE EXCEPTION 'Item not found or access denied';
    END IF;

    INSERT INTO item_reminders (
        item_id, tenant_id, reminder_type, reminder_date,
        quantity_threshold, comparison_operator, notes, created_by
    ) VALUES (
        p_item_id, v_tenant_id, p_reminder_type, p_reminder_date,
        p_quantity_threshold, p_comparison_operator, p_notes, v_user_id
    ) RETURNING id INTO v_new_id;

    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 16. UPDATE TEAM MEMBER FUNCTION FOR CHATTER
-- ============================================================================

CREATE OR REPLACE FUNCTION get_team_members_for_mention()
RETURNS TABLE (
    id UUID,
    full_name VARCHAR,
    email VARCHAR,
    avatar_url TEXT,
    role VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.full_name, p.email, p.avatar_url, p.role
    FROM profiles p
    WHERE p.tenant_id = get_user_tenant_id()
    ORDER BY p.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- 17. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION validate_user_role(TEXT) IS 'Validates that a role is one of: owner, staff, viewer';

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Role simplification complete: admin/editor → staff, member → viewer';
END $$;
