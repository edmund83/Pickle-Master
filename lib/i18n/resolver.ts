/**
 * Locale Settings Resolver
 *
 * Implements industry-standard three-tier preference resolution:
 * User Preferences > Tenant Settings > Browser Detection > System Defaults
 */

import {
  COUNTRY_TO_LOCALE,
  COUNTRY_TO_CURRENCY,
  TIMEZONE_TO_COUNTRY,
  USES_12_HOUR_FORMAT,
  USES_MDY_FORMAT,
  USES_ISO_FORMAT,
  SYSTEM_DEFAULTS,
} from './types'
import type {
  ResolvedLocaleSettings,
  UserLocalePreferences,
  TenantLocaleSettings,
  BrowserContext,
  DateFormat,
  TimeFormat,
} from './types'

/**
 * Resolve locale settings using priority hierarchy:
 * User > Tenant > Browser > System Default
 *
 * @param userPrefs - User-level preferences (highest priority)
 * @param tenantSettings - Organization-level settings
 * @param browserContext - Detected browser context (lowest priority)
 * @returns Fully resolved locale settings
 */
export function resolveLocaleSettings(
  userPrefs?: UserLocalePreferences | null,
  tenantSettings?: TenantLocaleSettings | null,
  browserContext?: BrowserContext | null
): ResolvedLocaleSettings {
  // Start with system defaults
  const result: ResolvedLocaleSettings = {
    ...SYSTEM_DEFAULTS,
    _source: { ...SYSTEM_DEFAULTS._source },
  }

  // Resolve locale
  if (userPrefs?.locale) {
    result.locale = userPrefs.locale
    result._source.locale = 'user'
  } else if (tenantSettings?.locale) {
    result.locale = tenantSettings.locale
    result._source.locale = 'tenant'
  } else if (tenantSettings?.country && COUNTRY_TO_LOCALE[tenantSettings.country]) {
    result.locale = COUNTRY_TO_LOCALE[tenantSettings.country]
    result._source.locale = 'tenant'
  } else if (browserContext?.language) {
    result.locale = normalizeLocale(browserContext.language)
    result._source.locale = 'browser'
  }

  // Resolve timezone
  if (userPrefs?.timezone) {
    result.timezone = userPrefs.timezone
    result._source.timezone = 'user'
  } else if (tenantSettings?.timezone) {
    result.timezone = tenantSettings.timezone
    result._source.timezone = 'tenant'
  } else if (browserContext?.timezone) {
    result.timezone = browserContext.timezone
    result._source.timezone = 'browser'
  }

  // Resolve currency
  if (userPrefs?.currency) {
    result.currency = userPrefs.currency
    result._source.currency = 'user'
  } else if (tenantSettings?.currency) {
    result.currency = tenantSettings.currency
    result._source.currency = 'tenant'
  } else if (tenantSettings?.country && COUNTRY_TO_CURRENCY[tenantSettings.country]) {
    result.currency = COUNTRY_TO_CURRENCY[tenantSettings.country]
    result._source.currency = 'tenant'
  }

  // Resolve date format (user > tenant > locale-based default)
  if (userPrefs?.date_format) {
    result.dateFormat = userPrefs.date_format
  } else if (tenantSettings?.date_format) {
    result.dateFormat = tenantSettings.date_format
  } else {
    result.dateFormat = getDefaultDateFormat(result.locale)
  }

  // Resolve time format (user > tenant > locale-based default)
  if (userPrefs?.time_format) {
    result.timeFormat = userPrefs.time_format
  } else if (tenantSettings?.time_format) {
    result.timeFormat = tenantSettings.time_format
  } else {
    result.timeFormat = getDefaultTimeFormat(result.locale)
  }

  // Resolve decimal precision
  if (tenantSettings?.decimal_precision) {
    result.decimalPrecision = parseDecimalPrecision(tenantSettings.decimal_precision)
  }

  return result
}

/**
 * Normalize locale string to BCP 47 format
 * Handles various input formats: 'en-us', 'EN_US', 'en', etc.
 */
export function normalizeLocale(locale: string): string {
  if (!locale) return SYSTEM_DEFAULTS.locale

  // Replace underscore with hyphen and normalize case
  const normalized = locale.replace('_', '-')
  const parts = normalized.split('-')

  if (parts.length === 1) {
    // Just language code (e.g., 'en')
    return parts[0].toLowerCase()
  }

  // Language-Region format (e.g., 'en-US')
  return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`
}

/**
 * Get default date format based on locale
 */
export function getDefaultDateFormat(locale: string): DateFormat {
  const region = getRegionFromLocale(locale)

  if (USES_MDY_FORMAT.has(region)) {
    return 'MM/DD/YYYY'
  }

  if (USES_ISO_FORMAT.has(region)) {
    return 'YYYY-MM-DD'
  }

  // Most of the world uses DD/MM/YYYY
  return 'DD/MM/YYYY'
}

/**
 * Get default time format based on locale
 */
export function getDefaultTimeFormat(locale: string): TimeFormat {
  const region = getRegionFromLocale(locale)
  return USES_12_HOUR_FORMAT.has(region) ? '12-hour' : '24-hour'
}

/**
 * Extract region code from locale
 */
function getRegionFromLocale(locale: string): string {
  const parts = locale.split('-')
  return parts.length > 1 ? parts[1].toUpperCase() : ''
}

/**
 * Parse decimal precision string to number
 */
export function parseDecimalPrecision(precision: string): number {
  switch (precision) {
    case '1':
      return 0
    case '0.1':
      return 1
    case '0.01':
      return 2
    case '0.001':
      return 3
    default:
      return 2
  }
}

/**
 * Detect browser context (client-side only)
 * Returns empty object when called on server
 */
export function detectBrowserContext(): BrowserContext {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    return {
      language: navigator.language,
      languages: [...navigator.languages],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  } catch {
    return {}
  }
}

/**
 * Guess country from IANA timezone
 * Used for initial locale suggestion during signup
 */
export function guessCountryFromTimezone(timezone: string | undefined): string | null {
  if (!timezone) return null
  return TIMEZONE_TO_COUNTRY[timezone] || null
}

/**
 * Get suggested locale settings based on browser detection
 * Useful for onboarding flow
 */
export function getSuggestedSettings(browserContext: BrowserContext): Partial<TenantLocaleSettings> {
  const country = guessCountryFromTimezone(browserContext.timezone)

  if (!country) {
    return {}
  }

  return {
    country,
    currency: COUNTRY_TO_CURRENCY[country],
    locale: COUNTRY_TO_LOCALE[country],
    timezone: browserContext.timezone,
    date_format: getDefaultDateFormat(COUNTRY_TO_LOCALE[country] || 'en-US'),
    time_format: getDefaultTimeFormat(COUNTRY_TO_LOCALE[country] || 'en-US'),
  }
}

/**
 * Country to primary timezone mapping
 * Maps ISO 3166-1 country codes to their most common IANA timezone
 */
export const COUNTRY_TO_PRIMARY_TIMEZONE: Record<string, string> = {
  // Americas
  US: 'America/New_York',
  CA: 'America/Toronto',
  MX: 'America/Mexico_City',
  BR: 'America/Sao_Paulo',
  AR: 'America/Buenos_Aires',
  CO: 'America/Bogota',
  CL: 'America/Santiago',
  PE: 'America/Lima',

  // Europe
  GB: 'Europe/London',
  IE: 'Europe/Dublin',
  DE: 'Europe/Berlin',
  FR: 'Europe/Paris',
  IT: 'Europe/Rome',
  ES: 'Europe/Madrid',
  NL: 'Europe/Amsterdam',
  BE: 'Europe/Brussels',
  AT: 'Europe/Vienna',
  CH: 'Europe/Zurich',
  PT: 'Europe/Lisbon',
  SE: 'Europe/Stockholm',
  NO: 'Europe/Oslo',
  DK: 'Europe/Copenhagen',
  FI: 'Europe/Helsinki',
  PL: 'Europe/Warsaw',
  CZ: 'Europe/Prague',
  HU: 'Europe/Budapest',
  RO: 'Europe/Bucharest',
  GR: 'Europe/Athens',
  UA: 'Europe/Kyiv',
  RU: 'Europe/Moscow',
  TR: 'Europe/Istanbul',

  // Asia Pacific
  JP: 'Asia/Tokyo',
  CN: 'Asia/Shanghai',
  KR: 'Asia/Seoul',
  TW: 'Asia/Taipei',
  HK: 'Asia/Hong_Kong',
  SG: 'Asia/Singapore',
  MY: 'Asia/Kuala_Lumpur',
  TH: 'Asia/Bangkok',
  VN: 'Asia/Ho_Chi_Minh',
  ID: 'Asia/Jakarta',
  PH: 'Asia/Manila',
  IN: 'Asia/Kolkata',
  AU: 'Australia/Sydney',
  NZ: 'Pacific/Auckland',

  // Middle East & Africa
  SA: 'Asia/Riyadh',
  AE: 'Asia/Dubai',
  IL: 'Asia/Jerusalem',
  EG: 'Africa/Cairo',
  ZA: 'Africa/Johannesburg',
  NG: 'Africa/Lagos',
  KE: 'Africa/Nairobi',

  // South Asia
  PK: 'Asia/Karachi',
  BD: 'Asia/Dhaka',
  LK: 'Asia/Colombo',
}

/**
 * Get all inferred settings from a country code
 * Used for the simplified Regional Settings UI
 */
export function getSettingsFromCountry(countryCode: string): {
  currency: string
  timezone: string
  dateFormat: DateFormat
  timeFormat: TimeFormat
  locale: string
} {
  const locale = COUNTRY_TO_LOCALE[countryCode] || 'en-US'

  return {
    currency: COUNTRY_TO_CURRENCY[countryCode] || 'USD',
    timezone: COUNTRY_TO_PRIMARY_TIMEZONE[countryCode] || 'UTC',
    dateFormat: getDefaultDateFormat(locale),
    timeFormat: getDefaultTimeFormat(locale),
    locale,
  }
}

/**
 * Validate a locale string (BCP 47 format)
 */
export function isValidLocale(locale: string): boolean {
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(locale)
}

/**
 * Validate a timezone string (IANA format)
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

/**
 * Validate a currency code (ISO 4217 format)
 */
export function isValidCurrency(currency: string): boolean {
  return /^[A-Z]{3}$/.test(currency)
}
