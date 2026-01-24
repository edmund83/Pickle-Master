/**
 * Internationalization Types and Mappings
 *
 * Industry-standard i18n configuration following BCP 47 locale tags,
 * IANA timezone identifiers, and ISO 4217 currency codes.
 */

/**
 * Resolved locale settings with full context
 */
export interface ResolvedLocaleSettings {
  // BCP 47 locale tag (e.g., 'en-US', 'de-DE')
  locale: string

  // IANA timezone (e.g., 'America/New_York', 'Europe/Berlin')
  timezone: string

  // ISO 4217 currency code (e.g., 'USD', 'EUR')
  currency: string

  // Date format preference
  dateFormat: DateFormat

  // Time format preference
  timeFormat: TimeFormat

  // Decimal precision for numbers
  decimalPrecision: number

  // Source of each setting for debugging
  _source: {
    locale: SettingSource
    timezone: SettingSource
    currency: SettingSource
  }
}

export type DateFormat =
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY-MM-DD'
  | 'DD-MM-YYYY'
  | 'DD.MM.YYYY'

export type TimeFormat = '12-hour' | '24-hour'

export type SettingSource = 'user' | 'tenant' | 'browser' | 'default'

/**
 * User preferences stored in profiles.locale_preferences
 */
export interface UserLocalePreferences {
  locale?: string
  timezone?: string
  currency?: string
  date_format?: DateFormat
  time_format?: TimeFormat
}

/**
 * Tenant settings stored in tenants.settings
 */
export interface TenantLocaleSettings {
  locale?: string
  timezone?: string
  currency?: string
  country?: string
  date_format?: DateFormat
  time_format?: TimeFormat
  decimal_precision?: string
}

/**
 * Browser context detected client-side
 */
export interface BrowserContext {
  language?: string // navigator.language
  languages?: string[] // navigator.languages
  timezone?: string // Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Country to locale mapping (ISO 3166-1 alpha-2 to BCP 47)
 */
export const COUNTRY_TO_LOCALE: Record<string, string> = {
  // English-speaking
  US: 'en-US',
  GB: 'en-GB',
  AU: 'en-AU',
  CA: 'en-CA',
  NZ: 'en-NZ',
  IE: 'en-IE',
  ZA: 'en-ZA',
  IN: 'en-IN',
  SG: 'en-SG',
  MY: 'en-MY',
  PH: 'en-PH',
  HK: 'en-HK',

  // German-speaking
  DE: 'de-DE',
  AT: 'de-AT',
  CH: 'de-CH',

  // French-speaking
  FR: 'fr-FR',
  BE: 'fr-BE',

  // Spanish-speaking
  ES: 'es-ES',
  MX: 'es-MX',
  AR: 'es-AR',
  CO: 'es-CO',
  CL: 'es-CL',
  PE: 'es-PE',

  // Portuguese-speaking
  PT: 'pt-PT',
  BR: 'pt-BR',

  // Other European
  IT: 'it-IT',
  NL: 'nl-NL',
  PL: 'pl-PL',
  SE: 'sv-SE',
  NO: 'nb-NO',
  DK: 'da-DK',
  FI: 'fi-FI',
  CZ: 'cs-CZ',
  HU: 'hu-HU',
  RO: 'ro-RO',
  GR: 'el-GR',
  UA: 'uk-UA',
  RU: 'ru-RU',

  // Asian
  JP: 'ja-JP',
  KR: 'ko-KR',
  CN: 'zh-CN',
  TW: 'zh-TW',
  TH: 'th-TH',
  VN: 'vi-VN',
  ID: 'id-ID',

  // Middle Eastern
  TR: 'tr-TR',
  SA: 'ar-SA',
  AE: 'ar-AE',
  IL: 'he-IL',
  EG: 'ar-EG',
}

/**
 * Country to default currency mapping (ISO 3166-1 to ISO 4217)
 */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Americas
  US: 'USD',
  CA: 'CAD',
  MX: 'MXN',
  BR: 'BRL',
  AR: 'ARS',
  CO: 'COP',
  CL: 'CLP',
  PE: 'PEN',

  // Europe - Eurozone
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  AT: 'EUR',
  BE: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  GR: 'EUR',
  FI: 'EUR',

  // Europe - Non-Eurozone
  GB: 'GBP',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',
  RU: 'RUB',
  UA: 'UAH',

  // Asia Pacific
  JP: 'JPY',
  CN: 'CNY',
  KR: 'KRW',
  TW: 'TWD',
  HK: 'HKD',
  SG: 'SGD',
  MY: 'MYR',
  TH: 'THB',
  VN: 'VND',
  ID: 'IDR',
  PH: 'PHP',
  IN: 'INR',
  AU: 'AUD',
  NZ: 'NZD',

  // Middle East & Africa
  SA: 'SAR',
  AE: 'AED',
  IL: 'ILS',
  TR: 'TRY',
  EG: 'EGP',
  ZA: 'ZAR',
  NG: 'NGN',
  KE: 'KES',

  // South Asia
  PK: 'PKR',
  BD: 'BDT',
  LK: 'LKR',
}

/**
 * Timezone to country mapping (for initial detection)
 * Maps common IANA timezones to ISO 3166-1 country codes
 */
export const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Americas
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Mexico_City': 'MX',
  'America/Sao_Paulo': 'BR',
  'America/Buenos_Aires': 'AR',
  'America/Bogota': 'CO',
  'America/Santiago': 'CL',
  'America/Lima': 'PE',

  // Europe
  'Europe/London': 'GB',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO',
  'Europe/Athens': 'GR',
  'Europe/Dublin': 'IE',
  'Europe/Lisbon': 'PT',
  'Europe/Moscow': 'RU',
  'Europe/Kiev': 'UA',
  'Europe/Istanbul': 'TR',

  // Asia Pacific
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'HK',
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Bangkok': 'TH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Jakarta': 'ID',
  'Asia/Manila': 'PH',
  'Asia/Seoul': 'KR',
  'Asia/Taipei': 'TW',
  'Asia/Kolkata': 'IN',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Perth': 'AU',
  'Pacific/Auckland': 'NZ',

  // Middle East
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Jerusalem': 'IL',
  'Africa/Cairo': 'EG',

  // Africa
  'Africa/Johannesburg': 'ZA',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
}

/**
 * Countries that use 12-hour time format
 */
export const USES_12_HOUR_FORMAT: Set<string> = new Set([
  'US',
  'CA',
  'AU',
  'NZ',
  'PH',
  'MY',
  'IN',
  'PK',
  'BD',
  'EG',
  'SA',
  'CO',
  'MX',
])

/**
 * Countries that use MM/DD/YYYY date format
 */
export const USES_MDY_FORMAT: Set<string> = new Set(['US'])

/**
 * Countries that use YYYY-MM-DD (ISO) date format
 */
export const USES_ISO_FORMAT: Set<string> = new Set([
  'SE',
  'JP',
  'CN',
  'KR',
  'TW',
  'HU',
  'LT',
])

/**
 * Default system settings (fallback of last resort)
 * Uses international standards: UTC timezone, USD currency, ISO date format
 */
export const SYSTEM_DEFAULTS: ResolvedLocaleSettings = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12-hour',
  decimalPrecision: 2,
  _source: {
    locale: 'default',
    timezone: 'default',
    currency: 'default',
  },
}

/**
 * Supported date formats with their display labels
 */
export const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string; example: string }[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '01/31/2025' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/01/2025' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)', example: '2025-01-31' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', example: '31-01-2025' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY', example: '31.01.2025' },
]

/**
 * Supported time formats with their display labels
 */
export const TIME_FORMAT_OPTIONS: { value: TimeFormat; label: string; example: string }[] = [
  { value: '12-hour', label: '12-hour', example: '2:30 PM' },
  { value: '24-hour', label: '24-hour', example: '14:30' },
]
