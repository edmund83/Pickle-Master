-- ============================================
-- Migration: Quota Enforcement
-- Purpose: Enforce subscription limits at database level
-- Strategy: Grandfather existing tenants (only block new inserts)
-- ============================================

-- 1. Function to enforce item quota before insert
CREATE OR REPLACE FUNCTION enforce_item_quota()
RETURNS TRIGGER AS $$
DECLARE
    tenant_max_items INTEGER;
    current_count BIGINT;
BEGIN
    -- Get tenant limit
    SELECT max_items INTO tenant_max_items
    FROM tenants WHERE id = NEW.tenant_id;

    -- If no limit set or unlimited (-1), allow
    IF tenant_max_items IS NULL OR tenant_max_items < 0 THEN
        RETURN NEW;
    END IF;

    -- Count current items (excluding soft-deleted)
    SELECT COUNT(*) INTO current_count
    FROM inventory_items
    WHERE tenant_id = NEW.tenant_id AND deleted_at IS NULL;

    -- Check if limit would be exceeded
    IF current_count >= tenant_max_items THEN
        RAISE EXCEPTION 'Item limit exceeded. Your plan allows % items. Current: %. Please upgrade your plan.',
            tenant_max_items, current_count
        USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to enforce user quota before insert
CREATE OR REPLACE FUNCTION enforce_user_quota()
RETURNS TRIGGER AS $$
DECLARE
    tenant_max_users INTEGER;
    current_count BIGINT;
BEGIN
    -- Get tenant limit
    SELECT max_users INTO tenant_max_users
    FROM tenants WHERE id = NEW.tenant_id;

    -- If no limit set or unlimited (-1), allow
    IF tenant_max_users IS NULL OR tenant_max_users < 0 THEN
        RETURN NEW;
    END IF;

    -- Count current users
    SELECT COUNT(*) INTO current_count
    FROM profiles WHERE tenant_id = NEW.tenant_id;

    -- Check if limit would be exceeded
    IF current_count >= tenant_max_users THEN
        RAISE EXCEPTION 'User limit exceeded. Your plan allows % users. Current: %. Please upgrade your plan.',
            tenant_max_users, current_count
        USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger on inventory_items
DROP TRIGGER IF EXISTS trigger_enforce_item_quota ON inventory_items;
CREATE TRIGGER trigger_enforce_item_quota
    BEFORE INSERT ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION enforce_item_quota();

-- 4. Create trigger on profiles (skip for owner creation during signup)
-- Owners are created during initial signup and should bypass the quota
DROP TRIGGER IF EXISTS trigger_enforce_user_quota ON profiles;
CREATE TRIGGER trigger_enforce_user_quota
    BEFORE INSERT ON profiles
    FOR EACH ROW
    WHEN (NEW.role != 'owner')
    EXECUTE FUNCTION enforce_user_quota();

-- 5. Enhanced usage function with percentage and warning thresholds
CREATE OR REPLACE FUNCTION get_quota_usage()
RETURNS TABLE (
    resource_type TEXT,
    current_usage BIGINT,
    max_allowed INTEGER,
    usage_percent NUMERIC,
    is_warning BOOLEAN,
    is_exceeded BOOLEAN
) AS $$
DECLARE
    tenant UUID := get_user_tenant_id();
    tenant_record RECORD;
    user_count BIGINT;
    item_count BIGINT;
BEGIN
    -- Get tenant limits
    SELECT max_users, max_items INTO tenant_record
    FROM tenants WHERE id = tenant;

    -- Count users
    SELECT COUNT(*) INTO user_count
    FROM profiles WHERE tenant_id = tenant;

    -- Count items (excluding soft-deleted)
    SELECT COUNT(*) INTO item_count
    FROM inventory_items WHERE tenant_id = tenant AND deleted_at IS NULL;

    -- Users quota
    RETURN QUERY
    SELECT
        'users'::TEXT,
        user_count,
        tenant_record.max_users,
        CASE
            WHEN tenant_record.max_users IS NULL OR tenant_record.max_users <= 0 THEN 0::NUMERIC
            ELSE ROUND(user_count::NUMERIC / tenant_record.max_users * 100, 1)
        END,
        CASE
            WHEN tenant_record.max_users IS NULL OR tenant_record.max_users <= 0 THEN FALSE
            ELSE user_count >= (tenant_record.max_users * 0.8)
        END,
        CASE
            WHEN tenant_record.max_users IS NULL OR tenant_record.max_users <= 0 THEN FALSE
            ELSE user_count >= tenant_record.max_users
        END;

    -- Items quota
    RETURN QUERY
    SELECT
        'items'::TEXT,
        item_count,
        tenant_record.max_items,
        CASE
            WHEN tenant_record.max_items IS NULL OR tenant_record.max_items <= 0 THEN 0::NUMERIC
            ELSE ROUND(item_count::NUMERIC / tenant_record.max_items * 100, 1)
        END,
        CASE
            WHEN tenant_record.max_items IS NULL OR tenant_record.max_items <= 0 THEN FALSE
            ELSE item_count >= (tenant_record.max_items * 0.8)
        END,
        CASE
            WHEN tenant_record.max_items IS NULL OR tenant_record.max_items <= 0 THEN FALSE
            ELSE item_count >= tenant_record.max_items
        END;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_quota_usage() TO authenticated;

-- 7. Add comment for documentation
COMMENT ON FUNCTION enforce_item_quota() IS 'Enforces item quota before insert. Returns -1 for unlimited plans.';
COMMENT ON FUNCTION enforce_user_quota() IS 'Enforces user quota before insert. Skips owner role (signup flow).';
COMMENT ON FUNCTION get_quota_usage() IS 'Returns current quota usage with warning (>=80%) and exceeded (>=100%) flags.';
