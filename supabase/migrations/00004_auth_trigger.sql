-- Trigger to create tenant and profile when a new user signs up
-- This runs after a user is created in auth.users

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_tenant_id UUID;
    company_name TEXT;
    full_name TEXT;
    slug TEXT;
BEGIN
    -- Get metadata from the new user
    full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
    company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Company');

    -- Generate slug
    slug := LOWER(REGEXP_REPLACE(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
    slug := TRIM(BOTH '-' FROM slug);
    slug := slug || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;

    -- Create tenant
    INSERT INTO public.tenants (name, slug)
    VALUES (company_name, slug)
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

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
