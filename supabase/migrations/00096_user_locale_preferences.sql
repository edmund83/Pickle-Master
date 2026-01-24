-- Migration: User Locale Preferences
-- Adds locale_preferences JSONB column to profiles table
-- Implements user-level override for i18n settings (highest priority in resolution)

-- ============================================================================
-- Add locale_preferences column to profiles
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS locale_preferences JSONB DEFAULT '{}'::jsonb;

-- ============================================================================
-- Validation function for locale preferences
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_locale_preferences(prefs JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Allow empty object
  IF prefs IS NULL OR prefs = '{}'::jsonb THEN
    RETURN TRUE;
  END IF;

  -- Validate locale format (BCP 47: en-US, de-DE, zh-CN)
  IF prefs->>'locale' IS NOT NULL AND
     prefs->>'locale' !~ '^[a-z]{2}(-[A-Z]{2})?$' THEN
    RETURN FALSE;
  END IF;

  -- Validate timezone (IANA format: America/New_York, Europe/London)
  -- Basic validation - alphanumeric with underscores and slashes
  IF prefs->>'timezone' IS NOT NULL AND
     prefs->>'timezone' !~ '^[A-Za-z_]+(/[A-Za-z_]+)*$' THEN
    RETURN FALSE;
  END IF;

  -- Validate currency (ISO 4217: USD, EUR, MYR)
  IF prefs->>'currency' IS NOT NULL AND
     prefs->>'currency' !~ '^[A-Z]{3}$' THEN
    RETURN FALSE;
  END IF;

  -- Validate date_format
  IF prefs->>'date_format' IS NOT NULL AND
     prefs->>'date_format' NOT IN (
       'DD/MM/YYYY',
       'MM/DD/YYYY',
       'YYYY-MM-DD',
       'DD-MM-YYYY',
       'DD.MM.YYYY'
     ) THEN
    RETURN FALSE;
  END IF;

  -- Validate time_format
  IF prefs->>'time_format' IS NOT NULL AND
     prefs->>'time_format' NOT IN ('12-hour', '24-hour') THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- Add check constraint for locale preferences validation
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'valid_locale_preferences'
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT valid_locale_preferences
    CHECK (public.validate_locale_preferences(locale_preferences));
  END IF;
END;
$$;

-- ============================================================================
-- Create GIN index for efficient JSONB queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_locale_preferences
ON profiles USING GIN (locale_preferences);

-- ============================================================================
-- Add comment for documentation
-- ============================================================================

COMMENT ON COLUMN profiles.locale_preferences IS
'User-level locale preferences (highest priority in i18n resolution).
Schema: {
  "locale": "en-US",        // BCP 47 locale tag
  "timezone": "America/New_York",  // IANA timezone
  "currency": "USD",        // ISO 4217 currency code
  "date_format": "MM/DD/YYYY",  // Date format preference
  "time_format": "12-hour"  // Time format preference
}';

-- ============================================================================
-- RPC function to update user locale preferences
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_user_locale_preferences(
  p_preferences JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_result JSONB;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate preferences
  IF NOT public.validate_locale_preferences(p_preferences) THEN
    RAISE EXCEPTION 'Invalid locale preferences format';
  END IF;

  -- Update preferences (merge with existing)
  UPDATE profiles
  SET
    locale_preferences = COALESCE(locale_preferences, '{}'::jsonb) || p_preferences,
    updated_at = NOW()
  WHERE id = v_user_id
  RETURNING locale_preferences INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_user_locale_preferences(JSONB) TO authenticated;

-- ============================================================================
-- RPC function to get user locale preferences
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_locale_preferences()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_preferences JSONB;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;

  SELECT COALESCE(locale_preferences, '{}'::jsonb)
  INTO v_preferences
  FROM profiles
  WHERE id = v_user_id;

  RETURN COALESCE(v_preferences, '{}'::jsonb);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_locale_preferences() TO authenticated;
