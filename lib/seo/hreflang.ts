/**
 * Hreflang tag generation for International SEO
 */

import { LOCALES, LOCALE_CONFIG, type Locale, DEFAULT_LOCALE } from './locales'
import { buildUrl } from './urls'

/**
 * Get the BCP 47 hreflang code for a locale
 * @param locale - URL locale (e.g., 'en-us')
 * @returns BCP 47 code (e.g., 'en-US')
 */
export function getHreflangCode(locale: Locale): string {
  return LOCALE_CONFIG[locale].hreflang
}

/**
 * Build all hreflang alternates for a page
 * Includes all locales plus x-default pointing to the default locale
 *
 * @param pathname - The path without locale (e.g., '/pricing')
 * @returns Object mapping hreflang codes to URLs
 */
export function buildHreflangAlternates(
  pathname: string
): Record<string, string> {
  const alternates: Record<string, string> = {}

  // Add all locale alternates
  for (const locale of LOCALES) {
    const hreflangCode = getHreflangCode(locale)
    alternates[hreflangCode] = buildUrl(locale, pathname)
  }

  // Add x-default pointing to the default locale (US)
  // This is the fallback for users whose locale doesn't match any supported locale
  alternates['x-default'] = buildUrl(DEFAULT_LOCALE, pathname)

  return alternates
}

/**
 * Build Next.js Metadata alternates object
 * Use this in generateMetadata functions
 */
export function buildMetadataAlternates(
  locale: Locale,
  pathname: string
): {
  canonical: string
  languages: Record<string, string>
} {
  return {
    canonical: buildUrl(locale, pathname),
    languages: buildHreflangAlternates(pathname),
  }
}
