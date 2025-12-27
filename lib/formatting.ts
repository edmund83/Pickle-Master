import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

/**
 * Tenant Settings type for formatting functions
 */
export interface TenantSettings {
  currency: string
  timezone: string
  date_format: string
  time_format: '12-hour' | '24-hour'
  decimal_precision: string
  country: string
}

/**
 * Default settings used when tenant settings are not available
 */
export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  currency: 'MYR',
  timezone: 'Asia/Kuala_Lumpur',
  date_format: 'DD/MM/YYYY',
  time_format: '12-hour',
  decimal_precision: '0.01',
  country: 'MY',
}

/**
 * Currency symbol mapping for all supported currencies
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  // Major currencies
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  // A
  AED: 'د.إ',
  AFN: '؋',
  ALL: 'L',
  AMD: '֏',
  ARS: '$',
  AUD: 'A$',
  AZN: '₼',
  // B
  BAM: 'KM',
  BDT: '৳',
  BGN: 'лв',
  BHD: '.د.ب',
  BND: 'B$',
  BOB: 'Bs.',
  BRL: 'R$',
  // C
  CAD: 'C$',
  CHF: 'CHF',
  CLP: '$',
  COP: '$',
  CRC: '₡',
  CZK: 'Kč',
  // D
  DKK: 'kr',
  DOP: 'RD$',
  DZD: 'د.ج',
  // E
  EGP: 'E£',
  ETB: 'Br',
  // G
  GEL: '₾',
  GHS: '₵',
  GTQ: 'Q',
  // H
  HKD: 'HK$',
  HNL: 'L',
  HRK: 'kn',
  HUF: 'Ft',
  // I
  IDR: 'Rp',
  ILS: '₪',
  INR: '₹',
  IQD: 'ع.د',
  IRR: '﷼',
  ISK: 'kr',
  // J
  JOD: 'د.ا',
  // K
  KES: 'KSh',
  KGS: 'с',
  KHR: '៛',
  KRW: '₩',
  KWD: 'د.ك',
  KZT: '₸',
  // L
  LAK: '₭',
  LBP: 'ل.ل',
  LKR: 'Rs',
  // M
  MAD: 'د.م.',
  MDL: 'L',
  MKD: 'ден',
  MMK: 'K',
  MNT: '₮',
  MOP: 'MOP$',
  MUR: '₨',
  MVR: 'Rf',
  MXN: '$',
  MYR: 'RM',
  // N
  NGN: '₦',
  NIO: 'C$',
  NOK: 'kr',
  NPR: 'Rs',
  NZD: 'NZ$',
  // O
  OMR: 'ر.ع.',
  // P
  PAB: 'B/.',
  PEN: 'S/',
  PHP: '₱',
  PKR: 'Rs',
  PLN: 'zł',
  PYG: '₲',
  // Q
  QAR: 'ر.ق',
  // R
  RON: 'lei',
  RSD: 'дин',
  RUB: '₽',
  RWF: 'FRw',
  // S
  SAR: 'ر.س',
  SEK: 'kr',
  SGD: 'S$',
  // T
  THB: '฿',
  TND: 'د.ت',
  TRY: '₺',
  TWD: 'NT$',
  TZS: 'TSh',
  // U
  UAH: '₴',
  UGX: 'USh',
  UYU: '$U',
  UZS: "so'm",
  // V
  VES: 'Bs.',
  VND: '₫',
  // Z
  ZAR: 'R',
  ZMW: 'ZK',
}

/**
 * Date format mapping from user-friendly format to date-fns format
 */
const DATE_FORMAT_MAP: Record<string, string> = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
  'DD-MM-YYYY': 'dd-MM-yyyy',
  'DD.MM.YYYY': 'dd.MM.yyyy',
}

/**
 * Get the currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode
}

/**
 * Get decimal places from precision string
 */
function getDecimalPlaces(precision: string): number {
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
 * Format a number as currency with tenant settings
 * @example formatCurrency(1234.56, settings) → "RM 1,234.56"
 */
export function formatCurrency(
  value: number | null | undefined,
  settings?: Partial<TenantSettings>
): string {
  // Handle null, undefined, NaN, and Infinity
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '-'
  }

  const currency = settings?.currency || DEFAULT_TENANT_SETTINGS.currency
  const precision = settings?.decimal_precision || DEFAULT_TENANT_SETTINGS.decimal_precision
  const symbol = getCurrencySymbol(currency)
  const decimals = getDecimalPlaces(precision)

  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return `${symbol} ${formatted}`
}

/**
 * Format a number with tenant decimal precision settings
 * @example formatNumber(1234.567, settings) → "1,234.57"
 */
export function formatNumber(
  value: number | null | undefined,
  settings?: Partial<TenantSettings>
): string {
  // Handle null, undefined, NaN, and Infinity
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '-'
  }

  const precision = settings?.decimal_precision || DEFAULT_TENANT_SETTINGS.decimal_precision
  const decimals = getDecimalPlaces(precision)

  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Parse a date string or Date object safely
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
 * Convert a UTC date to the tenant's timezone
 */
function toTenantTimezone(date: Date, timezone: string): Date {
  try {
    return toZonedTime(date, timezone)
  } catch {
    // Fallback to original date if timezone conversion fails
    return date
  }
}

/**
 * Format a date according to tenant settings (date only)
 * @example formatDate('2025-12-25T10:00:00Z', settings) → "25/12/2025"
 */
export function formatDate(
  date: string | Date | null | undefined,
  settings?: Partial<TenantSettings>
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const timezone = settings?.timezone || DEFAULT_TENANT_SETTINGS.timezone
  const dateFormat = settings?.date_format || DEFAULT_TENANT_SETTINGS.date_format
  const formatString = DATE_FORMAT_MAP[dateFormat] || 'dd/MM/yyyy'

  const zonedDate = toTenantTimezone(parsed, timezone)
  return format(zonedDate, formatString)
}

/**
 * Format a time according to tenant settings (time only)
 * @example formatTime('2025-12-25T14:30:00Z', settings) → "2:30 PM" or "14:30"
 */
export function formatTime(
  date: string | Date | null | undefined,
  settings?: Partial<TenantSettings>
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const timezone = settings?.timezone || DEFAULT_TENANT_SETTINGS.timezone
  const timeFormat = settings?.time_format || DEFAULT_TENANT_SETTINGS.time_format

  const zonedDate = toTenantTimezone(parsed, timezone)
  const formatString = timeFormat === '24-hour' ? 'HH:mm' : 'h:mm a'

  return format(zonedDate, formatString)
}

/**
 * Format a date and time according to tenant settings
 * @example formatDateTime('2025-12-25T14:30:00Z', settings) → "25/12/2025 2:30 PM"
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  settings?: Partial<TenantSettings>
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const timezone = settings?.timezone || DEFAULT_TENANT_SETTINGS.timezone
  const dateFormat = settings?.date_format || DEFAULT_TENANT_SETTINGS.date_format
  const timeFormat = settings?.time_format || DEFAULT_TENANT_SETTINGS.time_format

  const dateFormatString = DATE_FORMAT_MAP[dateFormat] || 'dd/MM/yyyy'
  const timeFormatString = timeFormat === '24-hour' ? 'HH:mm' : 'h:mm a'

  const zonedDate = toTenantTimezone(parsed, timezone)
  return format(zonedDate, `${dateFormatString} ${timeFormatString}`)
}

/**
 * Format a date with relative time (e.g., "Today", "Yesterday", "Dec 25")
 */
export function formatRelativeDate(
  date: string | Date | null | undefined,
  settings?: Partial<TenantSettings>
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const timezone = settings?.timezone || DEFAULT_TENANT_SETTINGS.timezone
  const zonedDate = toTenantTimezone(parsed, timezone)
  const now = toTenantTimezone(new Date(), timezone)

  const isToday =
    zonedDate.getDate() === now.getDate() &&
    zonedDate.getMonth() === now.getMonth() &&
    zonedDate.getFullYear() === now.getFullYear()

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    zonedDate.getDate() === yesterday.getDate() &&
    zonedDate.getMonth() === yesterday.getMonth() &&
    zonedDate.getFullYear() === yesterday.getFullYear()

  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'

  return formatDate(date, settings)
}

/**
 * Format a date for display in short form (e.g., "Dec 25, 2025")
 */
export function formatShortDate(
  date: string | Date | null | undefined,
  settings?: Partial<TenantSettings>
): string {
  const parsed = parseDate(date)
  if (!parsed) return '-'

  const timezone = settings?.timezone || DEFAULT_TENANT_SETTINGS.timezone
  const zonedDate = toTenantTimezone(parsed, timezone)

  return format(zonedDate, 'MMM d, yyyy')
}

/**
 * Get just the currency symbol for display
 */
export function getCurrencyDisplay(settings?: Partial<TenantSettings>): string {
  const currency = settings?.currency || DEFAULT_TENANT_SETTINGS.currency
  return getCurrencySymbol(currency)
}
