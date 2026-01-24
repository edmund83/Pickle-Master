-- ============================================
-- Migration: Sync Pricing Plans
-- Purpose: Update handle_new_user() trigger with correct plan names and limits
--          Add helper functions for plan limit lookups
-- ============================================

-- 0. Add max_folders column to tenants table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants' AND column_name = 'max_folders'
    ) THEN
        ALTER TABLE tenants ADD COLUMN max_folders INTEGER DEFAULT -1;
        COMMENT ON COLUMN tenants.max_folders IS 'Maximum number of folders allowed. -1 = unlimited.';
    END IF;
END $$;

-- 1. Function to get plan limits (called by triggers and webhook)
-- This is the database-level source of truth for plan limits
CREATE OR REPLACE FUNCTION get_plan_limits(plan_id TEXT)
RETURNS TABLE (
    max_users_limit INTEGER,
    max_items_limit INTEGER,
    max_folders_limit INTEGER,
    trial_days INTEGER
) AS $$
BEGIN
    CASE plan_id
        WHEN 'early_access' THEN
            RETURN QUERY SELECT 3, 1200, -1, 90;
        WHEN 'starter' THEN
            RETURN QUERY SELECT 3, 1200, -1, 14;  -- unlimited folders
        WHEN 'growth' THEN
            RETURN QUERY SELECT 5, 3000, -1, 14;
        WHEN 'scale' THEN
            RETURN QUERY SELECT 8, 8000, -1, 14;
        ELSE
            -- Default to starter for unknown plans
            RETURN QUERY SELECT 3, 1200, -1, 14;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment
COMMENT ON FUNCTION get_plan_limits(TEXT) IS 'Returns max_users, max_items, max_folders, trial_days for a given plan ID. Source of truth for plan limits.';

-- 2. Function to update tenant limits (called by webhook on plan change)
CREATE OR REPLACE FUNCTION update_tenant_limits(tenant_uuid UUID, new_plan_id TEXT)
RETURNS VOID AS $$
DECLARE
    limits RECORD;
BEGIN
    SELECT * INTO limits FROM get_plan_limits(new_plan_id);

    UPDATE tenants
    SET
        subscription_tier = new_plan_id,
        max_users = limits.max_users_limit,
        max_items = limits.max_items_limit,
        max_folders = limits.max_folders_limit,
        updated_at = NOW()
    WHERE id = tenant_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION update_tenant_limits(UUID, TEXT) IS 'Updates tenant limits when subscription tier changes. Called by Stripe webhook.';

-- 3. Function to normalize plan IDs
CREATE OR REPLACE FUNCTION normalize_plan_id(plan_id TEXT)
RETURNS TEXT AS $$
BEGIN
    IF plan_id IN ('early_access', 'starter', 'growth', 'scale') THEN
        RETURN plan_id;
    ELSE
        RETURN 'starter';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment
COMMENT ON FUNCTION normalize_plan_id(TEXT) IS 'Returns plan_id if valid, otherwise defaults to starter.';

-- 4. Update handle_new_user() to use correct plan names and limits
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_tenant_id UUID;
    company_name TEXT;
    full_name TEXT;
    selected_plan TEXT;
    normalized_plan TEXT;
    slug TEXT;
    limits RECORD;
    invitation_record RECORD;
BEGIN
    -- Get metadata from the new user
    full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
    company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company');
    selected_plan := COALESCE(NEW.raw_user_meta_data->>'plan', 'starter');

    -- =========================================================================
    -- CHECK FOR PENDING INVITATION
    -- =========================================================================
    SELECT id, tenant_id, role
    INTO invitation_record
    FROM team_invitations
    WHERE lower(email) = lower(NEW.email)
      AND accepted_at IS NULL
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;

    -- If invitation exists, join existing tenant
    IF invitation_record.id IS NOT NULL THEN
        -- Create profile with invited role
        INSERT INTO profiles (id, tenant_id, email, full_name, role, onboarding_completed)
        VALUES (
            NEW.id,
            invitation_record.tenant_id,
            NEW.email,
            full_name,
            invitation_record.role,
            FALSE
        );

        -- Mark invitation as accepted
        UPDATE team_invitations
        SET accepted_at = now()
        WHERE id = invitation_record.id;

        RETURN NEW;
    END IF;

    -- =========================================================================
    -- NO INVITATION - CREATE NEW TENANT
    -- =========================================================================

    -- Normalize plan ID (handles legacy names and defaults)
    normalized_plan := normalize_plan_id(selected_plan);

    -- Get limits for the normalized plan
    SELECT * INTO limits FROM get_plan_limits(normalized_plan);

    -- Generate slug
    slug := LOWER(REGEXP_REPLACE(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
    slug := TRIM(BOTH '-' FROM slug);
    slug := slug || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;

    -- Create tenant with trial settings and correct limits
    INSERT INTO tenants (
        name,
        slug,
        org_code,
        subscription_tier,
        subscription_status,
        trial_ends_at,
        max_users,
        max_items,
        max_folders
    )
    VALUES (
        company_name,
        slug,
        generate_org_code(company_name),
        normalized_plan,
        'trial',
        NOW() + (limits.trial_days || ' days')::INTERVAL,
        limits.max_users_limit,
        limits.max_items_limit,
        limits.max_folders_limit
    )
    RETURNING id INTO new_tenant_id;

    -- Create profile as owner of new tenant
    INSERT INTO profiles (id, tenant_id, email, full_name, role, onboarding_completed)
    VALUES (
        NEW.id,
        new_tenant_id,
        NEW.email,
        full_name,
        'owner',
        FALSE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update comment
COMMENT ON FUNCTION handle_new_user() IS 'Creates profile for new users. If pending invitation exists, joins that tenant with invited role. Otherwise creates new tenant as owner with correct plan limits.';

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_plan_limits(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION normalize_plan_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_tenant_limits(UUID, TEXT) TO service_role;
