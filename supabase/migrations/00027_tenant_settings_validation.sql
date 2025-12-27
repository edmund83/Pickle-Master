-- Migration: Add validation for tenant settings JSONB column
-- This ensures that only valid settings values can be stored in the database

-- Create validation function for tenant settings
CREATE OR REPLACE FUNCTION validate_tenant_settings(settings JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- If settings is null, it's valid (allow null settings)
  IF settings IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Validate time_format if present
  IF settings ? 'time_format' AND settings->>'time_format' IS NOT NULL THEN
    IF settings->>'time_format' NOT IN ('12-hour', '24-hour') THEN
      RAISE EXCEPTION 'Invalid time_format: %. Must be 12-hour or 24-hour', settings->>'time_format';
    END IF;
  END IF;

  -- Validate decimal_precision if present
  IF settings ? 'decimal_precision' AND settings->>'decimal_precision' IS NOT NULL THEN
    IF settings->>'decimal_precision' NOT IN ('1', '0.1', '0.01', '0.001') THEN
      RAISE EXCEPTION 'Invalid decimal_precision: %. Must be 1, 0.1, 0.01, or 0.001', settings->>'decimal_precision';
    END IF;
  END IF;

  -- Validate date_format if present
  IF settings ? 'date_format' AND settings->>'date_format' IS NOT NULL THEN
    IF settings->>'date_format' NOT IN (
      'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD.MM.YYYY'
    ) THEN
      RAISE EXCEPTION 'Invalid date_format: %', settings->>'date_format';
    END IF;
  END IF;

  -- Validate currency if present (must be 3-letter uppercase code)
  IF settings ? 'currency' AND settings->>'currency' IS NOT NULL THEN
    IF settings->>'currency' !~ '^[A-Z]{3}$' THEN
      RAISE EXCEPTION 'Invalid currency code: %. Must be 3-letter uppercase code', settings->>'currency';
    END IF;
  END IF;

  -- Validate country if present (must be 2-letter uppercase code)
  IF settings ? 'country' AND settings->>'country' IS NOT NULL THEN
    IF settings->>'country' !~ '^[A-Z]{2}$' THEN
      RAISE EXCEPTION 'Invalid country code: %. Must be 2-letter uppercase code', settings->>'country';
    END IF;
  END IF;

  -- Validate timezone if present (basic format check - starts with a letter or uppercase region)
  IF settings ? 'timezone' AND settings->>'timezone' IS NOT NULL THEN
    IF settings->>'timezone' !~ '^[A-Za-z]' THEN
      RAISE EXCEPTION 'Invalid timezone: %', settings->>'timezone';
    END IF;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add CHECK constraint to tenants table
-- Note: This will fail if there are existing invalid values in the database
DO $$
BEGIN
  -- First check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_tenant_settings'
    AND conrelid = 'tenants'::regclass
  ) THEN
    -- Add the constraint
    ALTER TABLE tenants
    ADD CONSTRAINT valid_tenant_settings
    CHECK (settings IS NULL OR validate_tenant_settings(settings));
  END IF;
END $$;

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT valid_tenant_settings ON tenants IS
  'Validates tenant settings JSONB structure and values';
