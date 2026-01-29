/**
 * URL building utilities for International SEO
 */

import { type Locale, DEFAULT_LOCALE } from './locales'

/**
 * Get the site origin URL
 * Priority: NEXT_PUBLIC_SITE_URL > VERCEL_URL > localhost
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) {
    // Remove trailing slash if present
    return explicit.replace(/\/$/, '')
  }

  const vercel = process.env.VERCEL_URL
  if (vercel) {
    return `https://${vercel}`
  }

  return 'http://localhost:3000'
}

export const SITE_ORIGIN = getSiteOrigin()

/**
 * Normalize a pathname to ensure it starts with / and has no trailing slash
 */
export function normalizePathname(pathname: string): string {
  // Ensure leading slash
  let normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  // Remove trailing slash (except for root)
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }
  return normalized
}

/**
 * Build a full URL with locale prefix
 * @param locale - The locale (e.g., 'en-us')
 * @param pathname - The path without locale (e.g., '/pricing')
 * @returns Full URL (e.g., 'https://www.stockzip.app/en-us/pricing')
 */
export function buildUrl(locale: Locale, pathname: string): string {
  const normalizedPath = normalizePathname(pathname)
  // Root path for locale should just be /{locale}
  const localePath =
    normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`
  return `${SITE_ORIGIN}${localePath}`
}

/**
 * Build a URL without locale prefix (for legacy or non-localized pages)
 */
export function buildAbsoluteUrl(pathname: string): string {
  const normalizedPath = normalizePathname(pathname)
  return `${SITE_ORIGIN}${normalizedPath}`
}

/**
 * Extract the pathname from a localized URL (removes locale prefix)
 * @param localizedPath - Path with locale (e.g., '/en-gb/pricing')
 * @returns Path without locale (e.g., '/pricing')
 */
export function extractPathname(localizedPath: string): string {
  const normalized = normalizePathname(localizedPath)
  // Match /{locale} or /{locale}/...
  const localePattern = /^\/(?:en-us|en-gb|en-au|en-ca)(?:\/|$)/
  return normalized.replace(localePattern, '/') || '/'
}

/**
 * Get the locale from a path
 */
export function getLocaleFromPath(path: string): Locale | null {
  const match = path.match(/^\/(en-us|en-gb|en-au|en-ca)(?:\/|$)/)
  return match ? (match[1] as Locale) : null
}

/**
 * Build a localized path (without full URL)
 */
export function buildLocalePath(locale: Locale, pathname: string): string {
  const normalizedPath = normalizePathname(pathname)
  return normalizedPath === '/' ? `/${locale}` : `/${locale}${normalizedPath}`
}
