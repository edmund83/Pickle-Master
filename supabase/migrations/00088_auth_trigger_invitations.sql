-- Update auth trigger to check for pending invitations on signup
-- If a valid invitation exists, join that tenant instead of creating a new one

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
    -- NO INVITATION - CREATE NEW TENANT (existing behavior)
    -- =========================================================================

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

-- Add comment for documentation
COMMENT ON FUNCTION handle_new_user() IS 'Creates profile for new users. If pending invitation exists, joins that tenant with invited role. Otherwise creates new tenant as owner.';
