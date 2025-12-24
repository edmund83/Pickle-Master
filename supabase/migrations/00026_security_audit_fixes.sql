-- ============================================
-- Migration: Security Audit Fixes
-- Purpose: Address critical security vulnerabilities identified in audit
-- Date: 2024-12-24
-- ============================================

-- ============================================
-- 1. CRITICAL: Fix Profiles RLS - Prevent Tenant Hopping
-- The UPDATE policy must prevent users from changing their tenant_id
-- ============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- New INSERT policy: Only allow inserting own profile with correct tenant_id
-- Note: Profile creation is normally handled by auth trigger, but if direct insert
-- is needed, we must validate the tenant_id matches what the user should have
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (
        id = auth.uid()
        -- tenant_id is set by the auth trigger, not user-controllable
    );

-- New UPDATE policy: Prevent changing tenant_id
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND
        -- Prevent tenant_id from being changed - must match existing value
        tenant_id = (SELECT p.tenant_id FROM profiles p WHERE p.id = auth.uid())
    );

-- ============================================
-- 2. HIGH: Enable RLS on activity_logs_archive
-- ============================================

ALTER TABLE activity_logs_archive ENABLE ROW LEVEL SECURITY;

-- Policy for viewing archived logs (same as main activity_logs)
DROP POLICY IF EXISTS "Users can view tenant archived activity" ON activity_logs_archive;
CREATE POLICY "Users can view tenant archived activity" ON activity_logs_archive
    FOR SELECT USING (tenant_id = get_user_tenant_id());

-- Only allow inserts from the archive function (via service role or SECURITY DEFINER)
-- Regular users should not insert directly
DROP POLICY IF EXISTS "System can insert archived activity" ON activity_logs_archive;
CREATE POLICY "System can insert archived activity" ON activity_logs_archive
    FOR INSERT WITH CHECK (false); -- Block direct inserts, archive function uses SECURITY DEFINER

-- ============================================
-- 3. HIGH: Fix items_with_tags view with tenant filter
-- ============================================

DROP VIEW IF EXISTS items_with_tags;
CREATE OR REPLACE VIEW items_with_tags AS
SELECT
    i.*,
    COALESCE(
        array_agg(
            jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color)
        ) FILTER (WHERE t.id IS NOT NULL),
        '{}'::jsonb[]
    ) AS tag_list
FROM inventory_items i
LEFT JOIN item_tags it ON it.item_id = i.id
LEFT JOIN tags t ON t.id = it.tag_id
WHERE i.deleted_at IS NULL
AND i.tenant_id = get_user_tenant_id()  -- Added tenant filter
GROUP BY i.id;

-- ============================================
-- 4. HIGH: Protect tenant_stats materialized view
-- Materialized views can't have RLS directly, so we:
-- a) Revoke direct SELECT from authenticated users
-- b) Only allow access through the SECURITY DEFINER function
-- ============================================

-- Revoke direct access to the materialized view
REVOKE SELECT ON tenant_stats FROM authenticated;
REVOKE SELECT ON tenant_stats FROM anon;

-- The get_my_tenant_stats() function already filters by tenant and is SECURITY DEFINER
-- Users must use that function to access stats

-- ============================================
-- 5. HIGH: Fix update_overdue_checkouts to be tenant-scoped
-- This function is called within user RPCs and was updating all tenants
-- ============================================

CREATE OR REPLACE FUNCTION update_overdue_checkouts()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Only update checkouts for the current tenant
    UPDATE checkouts
    SET status = 'overdue', updated_at = NOW()
    WHERE status = 'checked_out'
    AND due_date < CURRENT_DATE
    AND tenant_id = tenant;  -- Added tenant filter

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. HIGH: Fix update_expired_lots to be tenant-scoped
-- ============================================

CREATE OR REPLACE FUNCTION update_expired_lots()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
    tenant UUID := get_user_tenant_id();
BEGIN
    -- Only update lots for the current tenant
    UPDATE lots
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active'
    AND expiry_date IS NOT NULL
    AND expiry_date < CURRENT_DATE
    AND tenant_id = tenant;  -- Added tenant filter

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. MEDIUM: Fix get_item_details to filter activity by tenant
-- ============================================

CREATE OR REPLACE FUNCTION get_item_details(p_item_id UUID)
RETURNS JSON AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    result JSON;
BEGIN
    SELECT json_build_object(
        'item', (
            SELECT row_to_json(i)
            FROM (
                SELECT
                    inv.*,
                    f.name as folder_name,
                    f.color as folder_color,
                    cp.full_name as created_by_name,
                    mp.full_name as modified_by_name
                FROM inventory_items inv
                LEFT JOIN folders f ON f.id = inv.folder_id
                LEFT JOIN profiles cp ON cp.id = inv.created_by
                LEFT JOIN profiles mp ON mp.id = inv.last_modified_by
                WHERE inv.id = p_item_id AND inv.tenant_id = tenant AND inv.deleted_at IS NULL
            ) i
        ),
        'tags', (
            SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
            FROM (
                SELECT tg.id, tg.name, tg.color
                FROM item_tags it
                INNER JOIN tags tg ON tg.id = it.tag_id
                WHERE it.item_id = p_item_id
                AND tg.tenant_id = tenant  -- Added tenant filter
                ORDER BY tg.name
            ) t
        ),
        'recent_activity', (
            SELECT COALESCE(json_agg(row_to_json(a)), '[]'::json)
            FROM (
                SELECT id, action_type, user_name, changes, quantity_delta, created_at
                FROM activity_logs
                WHERE entity_id = p_item_id
                AND entity_type = 'item'
                AND tenant_id = tenant  -- Added tenant filter
                ORDER BY created_at DESC
                LIMIT 10
            ) a
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- 8. MEDIUM: Add FK tenant validation to child tables
-- Ensure referenced entities belong to the same tenant
-- ============================================

-- location_stock: Validate item and location belong to user's tenant
DROP POLICY IF EXISTS "Editors can insert stock" ON location_stock;
CREATE POLICY "Editors can insert stock" ON location_stock
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')) AND
        -- Validate item belongs to same tenant
        EXISTS (SELECT 1 FROM inventory_items WHERE id = item_id AND tenant_id = get_user_tenant_id()) AND
        -- Validate location belongs to same tenant
        EXISTS (SELECT 1 FROM locations WHERE id = location_id AND tenant_id = get_user_tenant_id())
    );

DROP POLICY IF EXISTS "Editors can update stock" ON location_stock;
CREATE POLICY "Editors can update stock" ON location_stock
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    ) WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        -- Prevent changing to item/location from different tenant
        EXISTS (SELECT 1 FROM inventory_items WHERE id = item_id AND tenant_id = get_user_tenant_id()) AND
        EXISTS (SELECT 1 FROM locations WHERE id = location_id AND tenant_id = get_user_tenant_id())
    );

-- lots: Validate item belongs to user's tenant
DROP POLICY IF EXISTS "Editors can insert lots" ON lots;
CREATE POLICY "Editors can insert lots" ON lots
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')) AND
        -- Validate item belongs to same tenant
        EXISTS (SELECT 1 FROM inventory_items WHERE id = item_id AND tenant_id = get_user_tenant_id()) AND
        -- Validate location belongs to same tenant (if provided)
        (location_id IS NULL OR EXISTS (SELECT 1 FROM locations WHERE id = location_id AND tenant_id = get_user_tenant_id()))
    );

DROP POLICY IF EXISTS "Editors can update lots" ON lots;
CREATE POLICY "Editors can update lots" ON lots
    FOR UPDATE USING (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor'))
    ) WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        -- Prevent changing to item/location from different tenant
        EXISTS (SELECT 1 FROM inventory_items WHERE id = item_id AND tenant_id = get_user_tenant_id()) AND
        (location_id IS NULL OR EXISTS (SELECT 1 FROM locations WHERE id = location_id AND tenant_id = get_user_tenant_id()))
    );

-- stock_transfers: Validate item and locations belong to user's tenant
DROP POLICY IF EXISTS "Editors can insert transfers" ON stock_transfers;
CREATE POLICY "Editors can insert transfers" ON stock_transfers
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')) AND
        -- Validate item belongs to same tenant
        EXISTS (SELECT 1 FROM inventory_items WHERE id = item_id AND tenant_id = get_user_tenant_id()) AND
        -- Validate both locations belong to same tenant
        EXISTS (SELECT 1 FROM locations WHERE id = from_location_id AND tenant_id = get_user_tenant_id()) AND
        EXISTS (SELECT 1 FROM locations WHERE id = to_location_id AND tenant_id = get_user_tenant_id())
    );

-- item_reminders: Validate item belongs to user's tenant
DROP POLICY IF EXISTS "Editors can create reminders" ON item_reminders;
CREATE POLICY "Editors can create reminders" ON item_reminders
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('owner', 'admin', 'editor')
        ) AND
        -- Validate item belongs to same tenant
        EXISTS (SELECT 1 FROM inventory_items WHERE id = item_id AND tenant_id = get_user_tenant_id())
    );

-- checkouts: Validate item belongs to user's tenant
DROP POLICY IF EXISTS "Editors can insert checkouts" ON checkouts;
CREATE POLICY "Editors can insert checkouts" ON checkouts
    FOR INSERT WITH CHECK (
        tenant_id = get_user_tenant_id() AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner', 'admin', 'editor')) AND
        -- Validate item belongs to same tenant
        EXISTS (SELECT 1 FROM inventory_items WHERE id = item_id AND tenant_id = get_user_tenant_id())
    );

-- ============================================
-- 9. HIGH: Scope reminder functions properly
-- get_due_reminders and process_reminder_trigger should not be callable by users
-- ============================================

-- Revoke EXECUTE from authenticated users on internal functions
-- These should only be called by service role (Edge Functions)
REVOKE EXECUTE ON FUNCTION get_due_reminders() FROM authenticated;
REVOKE EXECUTE ON FUNCTION get_due_reminders() FROM anon;
REVOKE EXECUTE ON FUNCTION process_reminder_trigger(UUID, BOOLEAN) FROM authenticated;
REVOKE EXECUTE ON FUNCTION process_reminder_trigger(UUID, BOOLEAN) FROM anon;

-- Also revoke from archive functions that should be service-role only
REVOKE EXECUTE ON FUNCTION archive_old_activity_logs(INTEGER) FROM authenticated;
REVOKE EXECUTE ON FUNCTION archive_old_activity_logs(INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION purge_old_archives(INTEGER) FROM authenticated;
REVOKE EXECUTE ON FUNCTION purge_old_archives(INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION refresh_all_tenant_stats() FROM authenticated;
REVOKE EXECUTE ON FUNCTION refresh_all_tenant_stats() FROM anon;

-- ============================================
-- 10. Add database-level constraint to prevent tenant_id changes
-- Belt-and-suspenders approach for the critical profiles table
-- ============================================

CREATE OR REPLACE FUNCTION prevent_tenant_id_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.tenant_id IS DISTINCT FROM NEW.tenant_id THEN
        RAISE EXCEPTION 'Changing tenant_id is not allowed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles table
DROP TRIGGER IF EXISTS trigger_prevent_profile_tenant_change ON profiles;
CREATE TRIGGER trigger_prevent_profile_tenant_change
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_tenant_id_change();

-- Apply to other critical tables that should never have tenant_id changed
DROP TRIGGER IF EXISTS trigger_prevent_item_tenant_change ON inventory_items;
CREATE TRIGGER trigger_prevent_item_tenant_change
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION prevent_tenant_id_change();

DROP TRIGGER IF EXISTS trigger_prevent_folder_tenant_change ON folders;
CREATE TRIGGER trigger_prevent_folder_tenant_change
    BEFORE UPDATE ON folders
    FOR EACH ROW
    EXECUTE FUNCTION prevent_tenant_id_change();

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON POLICY "Users can update own profile" ON profiles IS
    'Users can update their own profile but cannot change their tenant_id';

COMMENT ON POLICY "Users can view tenant archived activity" ON activity_logs_archive IS
    'Users can only view archived activity logs from their own tenant';

COMMENT ON FUNCTION prevent_tenant_id_change() IS
    'Trigger function to prevent tenant_id from being changed on any row';
