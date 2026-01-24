-- Migration: Tenant Locale Enhancement
-- Adds locale validation and backfills existing tenants with locale based on country

-- ============================================================================
-- Update validation function to include locale
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_tenant_settings(settings JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- If settings is null, it's valid (allow null settings)
  IF settings IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Validate locale if present (BCP 47 format: en-US, de-DE, zh-CN)
  IF settings ? 'locale' AND settings->>'locale' IS NOT NULL THEN
    IF settings->>'locale' !~ '^[a-z]{2}(-[A-Z]{2})?$' THEN
      RAISE EXCEPTION 'Invalid locale: %. Must be BCP 47 format (e.g., en-US)', settings->>'locale';
    END IF;
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

  -- Validate timezone if present (IANA format)
  IF settings ? 'timezone' AND settings->>'timezone' IS NOT NULL THEN
    IF settings->>'timezone' !~ '^[A-Za-z_]+(/[A-Za-z_]+)*$' THEN
      RAISE EXCEPTION 'Invalid timezone: %', settings->>'timezone';
    END IF;
  END IF;

  -- Validate number_format if present
  IF settings ? 'number_format' AND settings->>'number_format' IS NOT NULL THEN
    IF settings->>'number_format' NOT IN ('1,234.56', '1.234,56', '1 234,56') THEN
      RAISE EXCEPTION 'Invalid number_format: %', settings->>'number_format';
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- Backfill locale for existing tenants based on country
-- ============================================================================

-- Country to locale mapping for backfill
DO $$
DECLARE
  country_locale_map JSONB := '{
    "US": "en-US",
    "GB": "en-GB",
    "AU": "en-AU",
    "CA": "en-CA",
    "NZ": "en-NZ",
    "IE": "en-IE",
    "ZA": "en-ZA",
    "IN": "en-IN",
    "SG": "en-SG",
    "MY": "en-MY",
    "PH": "en-PH",
    "HK": "en-HK",
    "DE": "de-DE",
    "AT": "de-AT",
    "CH": "de-CH",
    "FR": "fr-FR",
    "BE": "fr-BE",
    "ES": "es-ES",
    "MX": "es-MX",
    "AR": "es-AR",
    "CO": "es-CO",
    "CL": "es-CL",
    "PE": "es-PE",
    "PT": "pt-PT",
    "BR": "pt-BR",
    "IT": "it-IT",
    "NL": "nl-NL",
    "PL": "pl-PL",
    "SE": "sv-SE",
    "NO": "nb-NO",
    "DK": "da-DK",
    "FI": "fi-FI",
    "CZ": "cs-CZ",
    "HU": "hu-HU",
    "RO": "ro-RO",
    "GR": "el-GR",
    "UA": "uk-UA",
    "RU": "ru-RU",
    "JP": "ja-JP",
    "KR": "ko-KR",
    "CN": "zh-CN",
    "TW": "zh-TW",
    "TH": "th-TH",
    "VN": "vi-VN",
    "ID": "id-ID",
    "TR": "tr-TR",
    "SA": "ar-SA",
    "AE": "ar-AE",
    "IL": "he-IL",
    "EG": "ar-EG"
  }'::jsonb;
BEGIN
  -- Update tenants that have a country but no locale
  UPDATE tenants
  SET settings = COALESCE(settings, '{}'::jsonb) ||
    jsonb_build_object('locale', country_locale_map->>settings->>'country')
  WHERE settings->>'country' IS NOT NULL
    AND (settings->>'locale' IS NULL OR settings->>'locale' = '')
    AND country_locale_map ? (settings->>'country');

  -- Set default locale for tenants without country (use en-US)
  UPDATE tenants
  SET settings = COALESCE(settings, '{}'::jsonb) ||
    jsonb_build_object('locale', 'en-US')
  WHERE (settings->>'locale' IS NULL OR settings->>'locale' = '')
    AND (settings->>'country' IS NULL OR settings->>'country' = '');
END;
$$;

-- ============================================================================
-- Add comment for documentation
-- ============================================================================

COMMENT ON FUNCTION public.validate_tenant_settings(JSONB) IS
'Validates tenant settings JSONB structure.
Expected schema: {
  "locale": "en-US",          // BCP 47 locale tag
  "timezone": "America/New_York",  // IANA timezone
  "currency": "USD",          // ISO 4217 currency code
  "country": "US",            // ISO 3166-1 alpha-2 country code
  "date_format": "MM/DD/YYYY",  // Date format preference
  "time_format": "12-hour",   // Time format preference
  "decimal_precision": "0.01",  // Decimal precision
  "number_format": "1,234.56"   // Number format style
}';
