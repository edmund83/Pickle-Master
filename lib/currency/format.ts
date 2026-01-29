/**
 * Currency formatting utilities for locale-specific pricing display
 */

import { type Locale, LOCALE_CONFIG } from '@/lib/seo/locales'

/**
 * Approximate exchange rates from USD
 * These are approximate and for display purposes only
 * Actual billing remains in USD
 */
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.36,
}

/**
 * Get the currency code for a locale
 */
export function getCurrencyForLocale(locale: Locale): string {
  return LOCALE_CONFIG[locale].currency
}

/**
 * Get the currency symbol for a locale
 */
export function getCurrencySymbol(locale: Locale): string {
  return LOCALE_CONFIG[locale].currencySymbol
}

/**
 * Convert USD amount to locale currency
 * @param usdAmount - Amount in USD
 * @param locale - Target locale
 * @returns Converted amount (rounded to nearest integer for display)
 */
export function convertToLocaleCurrency(
  usdAmount: number,
  locale: Locale
): number {
  const currency = getCurrencyForLocale(locale)
  const rate = EXCHANGE_RATES[currency] || 1
  return Math.round(usdAmount * rate)
}

/**
 * Format a price for display in the locale's currency
 * @param usdAmount - Amount in USD
 * @param locale - Target locale
 * @param options - Formatting options
 * @returns Formatted price string (e.g., "$29", "£23", "A$44")
 */
export function formatLocaleCurrency(
  usdAmount: number,
  locale: Locale,
  options: {
    /** Whether to convert from USD (default: true) */
    convert?: boolean
    /** Whether to show cents (default: false for whole numbers) */
    showCents?: boolean
    /** Whether to show currency code instead of symbol (default: false) */
    showCode?: boolean
  } = {}
): string {
  const { convert = true, showCents = false, showCode = false } = options

  const amount = convert ? convertToLocaleCurrency(usdAmount, locale) : usdAmount
  const currency = getCurrencyForLocale(locale)
  const symbol = getCurrencySymbol(locale)

  // Format the number
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })

  const formattedNumber = formatter.format(amount)

  if (showCode) {
    return `${formattedNumber} ${currency}`
  }

  return `${symbol}${formattedNumber}`
}

/**
 * Get the tax note for a locale
 * Returns locale-specific tax information for pricing pages
 */
export function getTaxNote(locale: Locale): string | null {
  switch (locale) {
    case 'en-gb':
      return 'Prices exclude VAT'
    case 'en-au':
      return 'Prices exclude GST'
    case 'en-ca':
      return 'Prices exclude GST/HST'
    case 'en-us':
    default:
      return null // US typically doesn't show tax note
  }
}

/**
 * Format a price range for display
 * @param minUsd - Minimum price in USD
 * @param maxUsd - Maximum price in USD (or 'custom' for enterprise)
 * @param locale - Target locale
 */
export function formatPriceRange(
  minUsd: number,
  maxUsd: number | 'custom',
  locale: Locale
): string {
  const minFormatted = formatLocaleCurrency(minUsd, locale)

  if (maxUsd === 'custom') {
    return `${minFormatted}+`
  }

  const maxFormatted = formatLocaleCurrency(maxUsd, locale)
  return `${minFormatted} - ${maxFormatted}`
}

/**
 * Format monthly/yearly price with period suffix
 */
export function formatPriceWithPeriod(
  usdAmount: number,
  locale: Locale,
  period: 'month' | 'year'
): string {
  const formatted = formatLocaleCurrency(usdAmount, locale)
  return `${formatted}/${period === 'month' ? 'mo' : 'yr'}`
}
