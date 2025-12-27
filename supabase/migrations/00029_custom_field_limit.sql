-- Migration: Custom Field Limit Per Tenant
-- Purpose: Enforce maximum of 20 custom fields per tenant at database level
-- This provides a safety net in addition to frontend validation

-- Create function to check custom field limit
CREATE OR REPLACE FUNCTION check_custom_field_limit()
RETURNS TRIGGER AS $$
DECLARE
    field_count INTEGER;
BEGIN
    -- Count existing fields for this tenant
    SELECT COUNT(*) INTO field_count
    FROM custom_field_definitions
    WHERE tenant_id = NEW.tenant_id;

    -- Check if limit exceeded (20 max)
    IF field_count >= 20 THEN
        RAISE EXCEPTION 'Maximum of 20 custom fields per tenant exceeded';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce limit on insert
DROP TRIGGER IF EXISTS enforce_custom_field_limit ON custom_field_definitions;
CREATE TRIGGER enforce_custom_field_limit
    BEFORE INSERT ON custom_field_definitions
    FOR EACH ROW
    EXECUTE FUNCTION check_custom_field_limit();

-- Add comment for documentation
COMMENT ON FUNCTION check_custom_field_limit() IS 'Enforces maximum of 20 custom fields per tenant';
