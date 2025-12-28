-- Migration: Add org_code to tenants table
-- This creates a unique organization identifier (3 letters + 2 digits) for each tenant
-- Example: "Acme Corp" -> "ACM01", "Pickle Inc" -> "PIC01"

-- ===================
-- Add org_code column
-- ===================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS org_code VARCHAR(5);

-- Create unique index for org_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_org_code ON tenants(org_code);

-- Add comment
COMMENT ON COLUMN tenants.org_code IS 'Immutable 5-character organization code (3 letters + 2 digits), e.g., ACM01. Used in display IDs like PL-ACM01-00001';

-- ===================
-- Function: Generate org_code from company name
-- ===================
CREATE OR REPLACE FUNCTION generate_org_code(p_company_name TEXT)
RETURNS VARCHAR(5)
LANGUAGE plpgsql
AS $$
DECLARE
    base_code VARCHAR(3);
    suffix INTEGER;
    candidate VARCHAR(5);
    max_attempts INTEGER := 99;
BEGIN
    -- Step 1: Extract first 3 letters from company name (uppercase, letters only)
    base_code := UPPER(
        SUBSTRING(
            REGEXP_REPLACE(p_company_name, '[^A-Za-z]', '', 'g'),
            1, 3
        )
    );

    -- Fallback if company name doesn't have 3 letters
    IF LENGTH(base_code) < 3 THEN
        base_code := RPAD(COALESCE(base_code, ''), 3, 'X');
    END IF;

    -- Step 2: Try base code with incrementing suffixes (01-99)
    suffix := 1;
    LOOP
        candidate := base_code || LPAD(suffix::TEXT, 2, '0');

        -- Check if this code is available
        IF NOT EXISTS (SELECT 1 FROM tenants WHERE org_code = candidate) THEN
            RETURN candidate;
        END IF;

        suffix := suffix + 1;

        EXIT WHEN suffix > max_attempts;
    END LOOP;

    -- Fallback: generate random suffix if all 01-99 are taken
    RETURN base_code || LPAD((FLOOR(RANDOM() * 99) + 1)::TEXT, 2, '0');
END;
$$;

COMMENT ON FUNCTION generate_org_code(TEXT) IS 'Generates a unique 5-character org code from company name (e.g., "Acme Corp" -> "ACM01")';

-- ===================
-- Trigger: Auto-generate org_code on tenant creation
-- ===================
CREATE OR REPLACE FUNCTION trigger_generate_org_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.org_code IS NULL THEN
        NEW.org_code := generate_org_code(NEW.name);
    END IF;
    RETURN NEW;
END;
$$;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trg_tenants_org_code ON tenants;
CREATE TRIGGER trg_tenants_org_code
    BEFORE INSERT ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_org_code();

-- ===================
-- Trigger: Prevent org_code modification (immutability)
-- ===================
CREATE OR REPLACE FUNCTION prevent_org_code_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.org_code IS NOT NULL AND NEW.org_code IS DISTINCT FROM OLD.org_code THEN
        RAISE EXCEPTION 'org_code is immutable and cannot be changed once set';
    END IF;
    RETURN NEW;
END;
$$;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trg_tenants_org_code_immutable ON tenants;
CREATE TRIGGER trg_tenants_org_code_immutable
    BEFORE UPDATE OF org_code ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION prevent_org_code_modification();

-- ===================
-- Backfill org_codes for existing tenants
-- ===================
DO $$
DECLARE
    tenant_record RECORD;
    new_org_code VARCHAR(5);
BEGIN
    FOR tenant_record IN
        SELECT id, name FROM tenants WHERE org_code IS NULL ORDER BY created_at
    LOOP
        new_org_code := generate_org_code(tenant_record.name);
        UPDATE tenants SET org_code = new_org_code WHERE id = tenant_record.id;
        RAISE NOTICE 'Generated org_code % for tenant %', new_org_code, tenant_record.name;
    END LOOP;
END;
$$;

-- Make org_code NOT NULL after backfill
-- Note: This will fail if there are tenants without org_code - run backfill first
ALTER TABLE tenants ALTER COLUMN org_code SET NOT NULL;
