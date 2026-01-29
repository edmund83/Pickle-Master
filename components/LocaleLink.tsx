'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { type ComponentProps } from 'react'
import { type Locale, isValidLocale, DEFAULT_LOCALE } from '@/lib/seo/locales'
import { buildLocalePath } from '@/lib/seo/urls'

type LinkProps = ComponentProps<typeof Link>

export interface LocaleLinkProps extends Omit<LinkProps, 'href'> {
  /** The href to link to (will be prefixed with locale automatically) */
  href: string
  /**
   * Override the locale from URL params
   * Useful for region switcher links
   */
  locale?: Locale
  /**
   * If true, skip locale prefixing (for absolute URLs, auth routes, etc.)
   * @default false - auto-detected based on href
   */
  skipLocalePrefix?: boolean
}

/**
 * Routes that should NOT be prefixed with locale
 * These are app routes that exist outside the marketing locale structure
 */
const NON_LOCALIZED_ROUTES = [
  '/login',
  '/signup',
  '/dashboard',
  '/inventory',
  '/settings',
  '/onboarding',
  '/api',
  '/auth',
  '/app',
]

/**
 * Check if a href should skip locale prefixing
 */
function shouldSkipLocalePrefix(href: string): boolean {
  // Skip absolute URLs
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return true
  }

  // Skip hash links
  if (href.startsWith('#')) {
    return true
  }

  // Skip mailto and tel links
  if (href.startsWith('mailto:') || href.startsWith('tel:')) {
    return true
  }

  // Skip non-localized app routes
  for (const route of NON_LOCALIZED_ROUTES) {
    if (href === route || href.startsWith(`${route}/`)) {
      return true
    }
  }

  // Skip if href already has a locale prefix
  if (/^\/(en-us|en-gb|en-au|en-ca)(\/|$)/.test(href)) {
    return true
  }

  return false
}

/**
 * A locale-aware Link component that automatically prefixes hrefs with the current locale.
 *
 * Use this component instead of Next.js Link for all marketing page internal links.
 * It will automatically:
 * - Prefix hrefs with the current locale (e.g., /pricing -> /en-gb/pricing)
 * - Skip prefixing for absolute URLs, hash links, and non-localized routes
 *
 * @example
 * ```tsx
 * // In a UK page, this will link to /en-gb/pricing
 * <LocaleLink href="/pricing">View Pricing</LocaleLink>
 *
 * // Force a specific locale (for region switcher)
 * <LocaleLink href="/pricing" locale="en-au">Switch to Australia</LocaleLink>
 *
 * // Skip locale prefixing for auth routes
 * <LocaleLink href="/login">Login</LocaleLink> // Links to /login
 * ```
 */
export function LocaleLink({
  href,
  locale: localeProp,
  skipLocalePrefix: skipProp,
  children,
  ...props
}: LocaleLinkProps) {
  const params = useParams()

  // Get current locale from URL params or prop
  const paramLocale = params?.locale as string | undefined
  const currentLocale: Locale =
    localeProp ||
    (paramLocale && isValidLocale(paramLocale) ? paramLocale : DEFAULT_LOCALE)

  // Determine if we should skip locale prefixing
  const shouldSkip = skipProp ?? shouldSkipLocalePrefix(href)

  // Build the final href
  const finalHref = shouldSkip ? href : buildLocalePath(currentLocale, href)

  return (
    <Link href={finalHref} {...props}>
      {children}
    </Link>
  )
}
