/**
 * International SEO locale configuration
 * Defines supported locales for marketing pages
 */

export const LOCALES = ['en-us', 'en-gb', 'en-au', 'en-ca'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en-us'

export const LOCALE_CONFIG = {
  'en-us': {
    hreflang: 'en-US',
    name: 'United States',
    shortName: 'US',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
  },
  'en-gb': {
    hreflang: 'en-GB',
    name: 'United Kingdom',
    shortName: 'UK',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
  },
  'en-au': {
    hreflang: 'en-AU',
    name: 'Australia',
    shortName: 'AU',
    currency: 'AUD',
    currencySymbol: 'A$',
    flag: '🇦🇺',
  },
  'en-ca': {
    hreflang: 'en-CA',
    name: 'Canada',
    shortName: 'CA',
    currency: 'CAD',
    currencySymbol: 'C$',
    flag: '🇨🇦',
  },
} as const

export type LocaleConfig = (typeof LOCALE_CONFIG)[Locale]

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale)
}

/**
 * Get locale config, with fallback to default
 */
export function getLocaleConfig(locale: string): LocaleConfig {
  if (isValidLocale(locale)) {
    return LOCALE_CONFIG[locale]
  }
  return LOCALE_CONFIG[DEFAULT_LOCALE]
}
