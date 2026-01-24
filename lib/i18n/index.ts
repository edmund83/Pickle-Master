/**
 * Internationalization Module
 *
 * Industry-standard i18n implementation with:
 * - Three-tier locale resolution (User > Tenant > Browser > Default)
 * - Cached Intl formatters for performance
 * - Full timezone and currency support
 *
 * @example
 * import { resolveLocaleSettings, formatCurrency, formatDate } from '@/lib/i18n'
 *
 * const settings = resolveLocaleSettings(userPrefs, tenantSettings, browserContext)
 * const price = formatCurrency(99.99, settings)  // "$99.99" or "99,99 €"
 * const date = formatDate(new Date(), settings)  // "01/31/2025" or "31/01/2025"
 */

// Types
export type {
  ResolvedLocaleSettings,
  UserLocalePreferences,
  TenantLocaleSettings,
  BrowserContext,
  DateFormat,
  TimeFormat,
  SettingSource,
} from './types'

// Constants
export {
  COUNTRY_TO_LOCALE,
  COUNTRY_TO_CURRENCY,
  TIMEZONE_TO_COUNTRY,
  USES_12_HOUR_FORMAT,
  USES_MDY_FORMAT,
  USES_ISO_FORMAT,
  SYSTEM_DEFAULTS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from './types'

// Resolver
export {
  resolveLocaleSettings,
  normalizeLocale,
  getDefaultDateFormat,
  getDefaultTimeFormat,
  parseDecimalPrecision,
  detectBrowserContext,
  guessCountryFromTimezone,
  getSuggestedSettings,
  isValidLocale,
  isValidTimezone,
  isValidCurrency,
} from './resolver'

// Formatters
export {
  // Date & Time
  formatDate,
  formatTime,
  formatDateTime,
  formatShortDate,
  formatLongDate,
  formatRelativeDate,
  formatRelativeTime,

  // Numbers & Currency
  formatCurrency,
  formatNumber,
  formatInteger,
  formatPercent,
  formatCompactNumber,

  // Utilities
  getCurrencySymbol,
  getDecimalSeparator,
  getThousandsSeparator,
  formatISO,
  formatISODate,
} from './formatters'
