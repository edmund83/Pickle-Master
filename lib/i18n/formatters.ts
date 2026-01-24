/**
 * Internationalized Formatters
 *
 * Industry-standard formatting using native Intl APIs with caching
 * for optimal performance. All formatters are timezone and locale-aware.
 */

import { toZonedTime } from 'date-fns-tz'
import { parseISO } from 'date-fns'
import { SYSTEM_DEFAULTS } from './types'
import type { ResolvedLocaleSettings } from './types'

// ============================================================================
// Formatter Caches (Intl formatters are expensive to create)
// ============================================================================

const dateTimeFormatCache = new Map<string, Intl.DateTimeFormat>()
const numberFormatCache = new Map<string, Intl.NumberFormat>()
const relativeTimeFormatCache = new Map<string, Intl.RelativeTimeFormat>()

/**
 * Get or create cached DateTimeFormat
 */
function getDateTimeFormat(
  locale: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`
  let formatter = dateTimeFormatCache.get(key)

  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat(locale, options)
    } catch {
      // Fallback to en-US if locale is not supported
      formatter = new Intl.DateTimeFormat('en-US', options)
    }
    dateTimeFormatCache.set(key, formatter)
  }

  return formatter
}

/**
 * Get or create cached NumberFormat
 */
function getNumberFormat(
  locale: string,
  options: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`
  let formatter = numberFormatCache.get(key)

  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat(locale, options)
    } catch {
      // Fallback to en-US if locale is not supported
      formatter = new Intl.NumberFormat('en-US', options)
    }
    numberFormatCache.set(key, formatter)
  }

  return formatter
}

/**
 * Get or create cached RelativeTimeFormat
 */
function getRelativeTimeFormat(locale: string): Intl.RelativeTimeFormat {
  let formatter = relativeTimeFormatCache.get(locale)

  if (!formatter) {
    try {
      formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    } catch {
      // Fallback to en-US if locale is not supported
      formatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
    }
    relativeTimeFormatCache.set(locale, formatter)
  }

  return formatter
}

// ============================================================================
// Date Parsing & Timezone Conversion
// ============================================================================

/**
 * Parse date string or Date object safely
 */
function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null

  try {
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? null : date
    }
    const parsed = parseISO(date)
    return isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

/**
 * Convert UTC date to specified timezone
 */
function toTimezone(date: Date, timezone: string): Date {
  try {
    return toZonedTime(date, timezone)
  } catch {
    // Return original date if timezone conversion fails
    return date
  }
}

// ============================================================================
// Date & Time Formatters
// ============================================================================

/**
 * Format date according to locale settings
 * Respects user's preferred date format (DD/MM/YYYY, MM/DD/YYYY, etc.)
 *
 * @example
 * formatDate('2025-01-31T10:00:00Z', { locale: 'en-US', dateFormat: 'MM/DD/YYYY' })
 * // → "01/31/2025"
 *
 * formatDate('2025-01-31T10:00:00Z', { locale: 'de-DE', dateFormat: 'DD.MM.YYYY' })
 * // → "31.01.2025"
 */
export function formatDate(
  date: string | Date | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const zonedDate = toTimezone(parsed, settings.timezone)

  // Get date parts using Intl.DateTimeFormat
  const formatter = getDateTimeFormat(settings.locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: settings.timezone,
  })

  const parts = formatter.formatToParts(zonedDate)
  const day = parts.find((p) => p.type === 'day')?.value || ''
  const month = parts.find((p) => p.type === 'month')?.value || ''
  const year = parts.find((p) => p.type === 'year')?.value || ''

  // Reassemble according to user's preferred format
  switch (settings.dateFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`
    default:
      return `${day}/${month}/${year}`
  }
}

/**
 * Format time according to locale settings
 * Respects user's 12/24 hour preference
 *
 * @example
 * formatTime('2025-01-31T14:30:00Z', { timeFormat: '12-hour' })
 * // → "2:30 PM"
 *
 * formatTime('2025-01-31T14:30:00Z', { timeFormat: '24-hour' })
 * // → "14:30"
 */
export function formatTime(
  date: string | Date | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const formatter = getDateTimeFormat(settings.locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: settings.timeFormat === '12-hour',
    timeZone: settings.timezone,
  })

  return formatter.format(parsed)
}

/**
 * Format date and time together
 *
 * @example
 * formatDateTime('2025-01-31T14:30:00Z', settings)
 * // → "01/31/2025 2:30 PM" (US) or "31/01/2025 14:30" (EU)
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  return `${formatDate(date, settings)} ${formatTime(date, settings)}`
}

/**
 * Format short date with localized month name
 *
 * @example
 * formatShortDate('2025-01-31', { locale: 'en-US' })
 * // → "Jan 31, 2025"
 *
 * formatShortDate('2025-01-31', { locale: 'de-DE' })
 * // → "31. Jan. 2025"
 */
export function formatShortDate(
  date: string | Date | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const formatter = getDateTimeFormat(settings.locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: settings.timezone,
  })

  return formatter.format(parsed)
}

/**
 * Format long date with full month name
 *
 * @example
 * formatLongDate('2025-01-31', { locale: 'en-US' })
 * // → "January 31, 2025"
 */
export function formatLongDate(
  date: string | Date | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const formatter = getDateTimeFormat(settings.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: settings.timezone,
  })

  return formatter.format(parsed)
}

// ============================================================================
// Relative Time Formatters
// ============================================================================

/**
 * Format relative date (Today, Yesterday, or short date)
 * Timezone-aware comparison
 *
 * @example
 * formatRelativeDate(new Date()) // → "Today"
 * formatRelativeDate(yesterday)  // → "Yesterday"
 * formatRelativeDate(lastWeek)   // → "Jan 24, 2025"
 */
export function formatRelativeDate(
  date: string | Date | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const zonedDate = toTimezone(parsed, settings.timezone)
  const zonedNow = toTimezone(new Date(), settings.timezone)

  // Check if same day
  const isToday =
    zonedDate.getDate() === zonedNow.getDate() &&
    zonedDate.getMonth() === zonedNow.getMonth() &&
    zonedDate.getFullYear() === zonedNow.getFullYear()

  if (isToday) {
    const formatter = getRelativeTimeFormat(settings.locale)
    const diffMs = zonedDate.getTime() - zonedNow.getTime()
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))

    if (Math.abs(diffHours) < 1) {
      const diffMinutes = Math.round(diffMs / (1000 * 60))
      if (Math.abs(diffMinutes) < 1) {
        return formatter.format(0, 'minute') // "now" in most locales
      }
      return formatter.format(diffMinutes, 'minute')
    }
    return formatter.format(diffHours, 'hour')
  }

  // Check if yesterday
  const yesterday = new Date(zonedNow)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    zonedDate.getDate() === yesterday.getDate() &&
    zonedDate.getMonth() === yesterday.getMonth() &&
    zonedDate.getFullYear() === yesterday.getFullYear()

  if (isYesterday) {
    const formatter = getRelativeTimeFormat(settings.locale)
    return formatter.format(-1, 'day')
  }

  // Fall back to short date
  return formatShortDate(date, settings)
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * Full locale support for relative time expressions
 *
 * @example
 * formatRelativeTime(twoHoursAgo, { locale: 'en-US' })
 * // → "2 hours ago"
 *
 * formatRelativeTime(twoHoursAgo, { locale: 'de-DE' })
 * // → "vor 2 Stunden"
 */
export function formatRelativeTime(
  date: string | Date | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const zonedDate = toTimezone(parsed, settings.timezone)
  const zonedNow = toTimezone(new Date(), settings.timezone)
  const diffMs = zonedDate.getTime() - zonedNow.getTime()

  const formatter = getRelativeTimeFormat(settings.locale)

  const absDiff = Math.abs(diffMs)
  const sign = diffMs < 0 ? -1 : 1

  // Seconds
  if (absDiff < 60 * 1000) {
    const seconds = Math.round(absDiff / 1000)
    return formatter.format(sign * seconds, 'second')
  }

  // Minutes
  if (absDiff < 60 * 60 * 1000) {
    const minutes = Math.round(absDiff / (60 * 1000))
    return formatter.format(sign * minutes, 'minute')
  }

  // Hours
  if (absDiff < 24 * 60 * 60 * 1000) {
    const hours = Math.round(absDiff / (60 * 60 * 1000))
    return formatter.format(sign * hours, 'hour')
  }

  // Days
  if (absDiff < 30 * 24 * 60 * 60 * 1000) {
    const days = Math.round(absDiff / (24 * 60 * 60 * 1000))
    return formatter.format(sign * days, 'day')
  }

  // Months
  if (absDiff < 365 * 24 * 60 * 60 * 1000) {
    const months = Math.round(absDiff / (30 * 24 * 60 * 60 * 1000))
    return formatter.format(sign * months, 'month')
  }

  // Years
  const years = Math.round(absDiff / (365 * 24 * 60 * 60 * 1000))
  return formatter.format(sign * years, 'year')
}

// ============================================================================
// Number & Currency Formatters
// ============================================================================

/**
 * Format currency with full locale support
 * Uses Intl.NumberFormat for proper currency placement and symbols
 *
 * @example
 * formatCurrency(1234.56, { locale: 'en-US', currency: 'USD' })
 * // → "$1,234.56"
 *
 * formatCurrency(1234.56, { locale: 'de-DE', currency: 'EUR' })
 * // → "1.234,56 €"
 *
 * formatCurrency(1234.56, { locale: 'ja-JP', currency: 'JPY' })
 * // → "¥1,235"
 */
export function formatCurrency(
  value: number | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '-'
  }

  const formatter = getNumberFormat(settings.locale, {
    style: 'currency',
    currency: settings.currency,
    minimumFractionDigits: settings.decimalPrecision,
    maximumFractionDigits: settings.decimalPrecision,
  })

  return formatter.format(value)
}

/**
 * Format number with locale-aware separators
 *
 * @example
 * formatNumber(1234567.89, { locale: 'en-US' })
 * // → "1,234,567.89"
 *
 * formatNumber(1234567.89, { locale: 'de-DE' })
 * // → "1.234.567,89"
 *
 * formatNumber(1234567.89, { locale: 'fr-FR' })
 * // → "1 234 567,89"
 */
export function formatNumber(
  value: number | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '-'
  }

  const formatter = getNumberFormat(settings.locale, {
    minimumFractionDigits: settings.decimalPrecision,
    maximumFractionDigits: settings.decimalPrecision,
  })

  return formatter.format(value)
}

/**
 * Format integer (no decimals) with locale-aware separators
 *
 * @example
 * formatInteger(1234567, { locale: 'en-US' })
 * // → "1,234,567"
 */
export function formatInteger(
  value: number | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '-'
  }

  const formatter = getNumberFormat(settings.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return formatter.format(Math.round(value))
}

/**
 * Format percentage with locale
 *
 * @example
 * formatPercent(75.5, { locale: 'en-US' })
 * // → "75.5%"
 *
 * formatPercent(75.5, { locale: 'de-DE' })
 * // → "75,5 %"
 */
export function formatPercent(
  value: number | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS,
  decimals: number = 1
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '-'
  }

  const formatter = getNumberFormat(settings.locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  // Intl.NumberFormat expects decimal (0.75 for 75%)
  return formatter.format(value / 100)
}

/**
 * Format compact number (e.g., 1.2K, 3.4M)
 *
 * @example
 * formatCompactNumber(1234567, { locale: 'en-US' })
 * // → "1.2M"
 */
export function formatCompactNumber(
  value: number | null | undefined,
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '-'
  }

  const formatter = getNumberFormat(settings.locale, {
    notation: 'compact',
    compactDisplay: 'short',
  })

  return formatter.format(value)
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get currency symbol only
 *
 * @example
 * getCurrencySymbol({ locale: 'en-US', currency: 'USD' })
 * // → "$"
 *
 * getCurrencySymbol({ locale: 'en-MY', currency: 'MYR' })
 * // → "RM"
 */
export function getCurrencySymbol(
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const formatter = getNumberFormat(settings.locale, {
    style: 'currency',
    currency: settings.currency,
    currencyDisplay: 'narrowSymbol',
  })

  const parts = formatter.formatToParts(0)
  return parts.find((p) => p.type === 'currency')?.value || settings.currency
}

/**
 * Get the decimal separator for the locale
 *
 * @example
 * getDecimalSeparator({ locale: 'en-US' }) // → "."
 * getDecimalSeparator({ locale: 'de-DE' }) // → ","
 */
export function getDecimalSeparator(
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const formatter = getNumberFormat(settings.locale, {
    minimumFractionDigits: 1,
  })

  const parts = formatter.formatToParts(1.1)
  return parts.find((p) => p.type === 'decimal')?.value || '.'
}

/**
 * Get the thousands separator for the locale
 *
 * @example
 * getThousandsSeparator({ locale: 'en-US' }) // → ","
 * getThousandsSeparator({ locale: 'de-DE' }) // → "."
 */
export function getThousandsSeparator(
  settings: ResolvedLocaleSettings = SYSTEM_DEFAULTS
): string {
  const formatter = getNumberFormat(settings.locale, {
    useGrouping: true,
  })

  const parts = formatter.formatToParts(1000)
  return parts.find((p) => p.type === 'group')?.value || ','
}

/**
 * Format date for ISO 8601 (always UTC, for data exchange)
 * Use this for CSV exports, API responses, etc.
 */
export function formatISO(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return ''

  return parsed.toISOString()
}

/**
 * Format date as YYYY-MM-DD (ISO date only, for data exchange)
 */
export function formatISODate(date: string | Date | null | undefined): string {
  const parsed = parseDate(date)
  if (!parsed) return ''

  return parsed.toISOString().split('T')[0]
}
