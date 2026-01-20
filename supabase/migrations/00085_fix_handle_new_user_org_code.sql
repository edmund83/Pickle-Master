-- Fix handle_new_user() to include org_code in tenant INSERT
-- This fixes the "Database error saving new user" error on signup
-- The org_code column was made NOT NULL in migration 00036, but handle_new_user()
-- was not updated to include it.
--
-- IMPORTANT: This function runs in the auth schema context (triggered by auth.users INSERT),
-- so we must SET search_path = public to access public schema tables and functions.

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
    slug TEXT;
    max_users_limit INTEGER;
    max_items_limit INTEGER;
BEGIN
    -- Get metadata from the new user
    full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
    company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company');
    selected_plan := COALESCE(NEW.raw_user_meta_data->>'plan', 'starter');

    -- Set limits based on plan
    CASE selected_plan
        WHEN 'starter' THEN
            max_users_limit := 1;
            max_items_limit := 10000;
        WHEN 'team' THEN
            max_users_limit := 10;
            max_items_limit := 10000;
        WHEN 'business' THEN
            max_users_limit := 25;
            max_items_limit := 10000;
        ELSE
            -- Default to starter
            selected_plan := 'starter';
            max_users_limit := 1;
            max_items_limit := 10000;
    END CASE;

    -- Generate slug
    slug := LOWER(REGEXP_REPLACE(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
    slug := TRIM(BOTH '-' FROM slug);
    slug := slug || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;

    -- Create tenant with trial settings
    -- Note: org_code is generated using generate_org_code() function from migration 00036
    INSERT INTO tenants (
        name,
        slug,
        org_code,
        subscription_tier,
        subscription_status,
        trial_ends_at,
        max_users,
        max_items
    )
    VALUES (
        company_name,
        slug,
        generate_org_code(company_name),
        selected_plan,
        'trial',
        NOW() + INTERVAL '14 days',
        max_users_limit,
        max_items_limit
    )
    RETURNING id INTO new_tenant_id;

    -- Create profile
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
