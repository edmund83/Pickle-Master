-- Trial Signup Flow Migration
-- Adds trial_ends_at column and updates auth trigger to handle plan selection

-- 1. Add trial_ends_at column to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- 2. Add stripe_customer_id column for future Stripe integration
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- 3. Create index for subscription queries
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status
ON tenants(subscription_status);

CREATE INDEX IF NOT EXISTS idx_tenants_trial_ends_at
ON tenants(trial_ends_at)
WHERE trial_ends_at IS NOT NULL;

-- 4. Update the auth trigger to handle plan selection and trial setup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
    INSERT INTO public.tenants (
        name,
        slug,
        subscription_tier,
        subscription_status,
        trial_ends_at,
        max_users,
        max_items
    )
    VALUES (
        company_name,
        slug,
        selected_plan,
        'trial',
        NOW() + INTERVAL '14 days',
        max_users_limit,
        max_items_limit
    )
    RETURNING id INTO new_tenant_id;

    -- Create profile
    INSERT INTO public.profiles (id, tenant_id, email, full_name, role, onboarding_completed)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create helper function to check trial status
CREATE OR REPLACE FUNCTION is_trial_active(tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    tenant_record RECORD;
BEGIN
    SELECT subscription_status, trial_ends_at
    INTO tenant_record
    FROM tenants
    WHERE id = tenant_id;

    IF tenant_record IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN (
        tenant_record.subscription_status = 'trial'
        AND tenant_record.trial_ends_at IS NOT NULL
        AND tenant_record.trial_ends_at > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. Create helper function to check if in grace period (7 days after trial ends)
CREATE OR REPLACE FUNCTION is_in_grace_period(tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    tenant_record RECORD;
BEGIN
    SELECT subscription_status, trial_ends_at
    INTO tenant_record
    FROM tenants
    WHERE id = tenant_id;

    IF tenant_record IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN (
        tenant_record.subscription_status = 'trial'
        AND tenant_record.trial_ends_at IS NOT NULL
        AND tenant_record.trial_ends_at <= NOW()
        AND tenant_record.trial_ends_at + INTERVAL '7 days' > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7. Create helper function to check if account is paused
CREATE OR REPLACE FUNCTION is_account_paused(tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    tenant_record RECORD;
BEGIN
    SELECT subscription_status, trial_ends_at
    INTO tenant_record
    FROM tenants
    WHERE id = tenant_id;

    IF tenant_record IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Account is paused if:
    -- 1. Status is 'paused' or 'cancelled', OR
    -- 2. Status is 'trial' and grace period has expired
    RETURN (
        tenant_record.subscription_status IN ('paused', 'cancelled')
        OR (
            tenant_record.subscription_status = 'trial'
            AND tenant_record.trial_ends_at IS NOT NULL
            AND tenant_record.trial_ends_at + INTERVAL '7 days' <= NOW()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 8. Create function to get days remaining in trial
CREATE OR REPLACE FUNCTION get_trial_days_remaining(tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
    trial_end TIMESTAMPTZ;
BEGIN
    SELECT trial_ends_at
    INTO trial_end
    FROM tenants
    WHERE id = tenant_id;

    IF trial_end IS NULL THEN
        RETURN 0;
    END IF;

    RETURN GREATEST(0, EXTRACT(DAY FROM (trial_end - NOW()))::INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 9. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_trial_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_in_grace_period(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_account_paused(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trial_days_remaining(UUID) TO authenticated;

-- 10. Add comment for documentation
COMMENT ON COLUMN tenants.trial_ends_at IS 'When the trial period ends. After this date, a 7-day grace period begins before the account is paused.';
COMMENT ON COLUMN tenants.stripe_customer_id IS 'Stripe customer ID for billing integration.';
