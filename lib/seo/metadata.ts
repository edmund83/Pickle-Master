/**
 * International SEO metadata builder for Next.js
 */

import type { Metadata } from 'next'
import { type Locale, LOCALE_CONFIG, isValidLocale } from './locales'
import { buildUrl } from './urls'
import { buildMetadataAlternates } from './hreflang'

export type InternationalMetadataInput = {
  /** Current locale (e.g., 'en-us') */
  locale: Locale
  /** Path without locale prefix (e.g., '/pricing') */
  pathname: string
  /** Page title */
  title: string
  /** Meta description */
  description: string
  /** OpenGraph image URL (optional) */
  ogImage?: string
  /** OpenGraph type (default: 'website') */
  ogType?: 'website' | 'article'
  /** Additional keywords (optional) */
  keywords?: string[]
}

/**
 * Build international SEO metadata for a page
 *
 * Includes:
 * - Self-referencing canonical URL
 * - Hreflang alternates for all locales + x-default
 * - OpenGraph tags with canonical URL
 * - Twitter card meta
 *
 * @example
 * ```ts
 * export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *   const { locale } = await params
 *   return buildInternationalMetadata({
 *     locale,
 *     pathname: '/pricing',
 *     title: 'Pricing',
 *     description: 'Choose the right plan for your business.',
 *   })
 * }
 * ```
 */
export function buildInternationalMetadata({
  locale,
  pathname,
  title,
  description,
  ogImage,
  ogType = 'website',
  keywords,
}: InternationalMetadataInput): Metadata {
  // Validate locale, fallback to en-us if invalid
  const validLocale: Locale = isValidLocale(locale) ? locale : 'en-us'
  const localeConfig = LOCALE_CONFIG[validLocale]

  // Build canonical and alternates
  const canonical = buildUrl(validLocale, pathname)
  const alternates = buildMetadataAlternates(validLocale, pathname)

  // Default OG image if not provided
  const ogImageUrl = ogImage || `${buildUrl(validLocale, '/')}/og-image.png`

  return {
    title,
    description,
    keywords,
    alternates,
    openGraph: {
      type: ogType,
      url: canonical,
      title,
      description,
      siteName: 'StockZip',
      locale: localeConfig.hreflang.replace('-', '_'), // OpenGraph uses underscore
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

/**
 * Helper to extract locale from Next.js params
 * Use with generateMetadata and page components
 */
export function getLocaleFromParams(params: { locale?: string }): Locale {
  const locale = params.locale
  if (locale && isValidLocale(locale)) {
    return locale
  }
  return 'en-us'
}
