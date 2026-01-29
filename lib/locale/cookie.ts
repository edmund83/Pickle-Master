/**
 * Locale cookie utilities for region preference persistence
 */

import { type Locale, isValidLocale, DEFAULT_LOCALE } from '@/lib/seo/locales'

export const LOCALE_COOKIE_NAME = 'stockzip_locale'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180 // 180 days in seconds

/**
 * Get the locale preference from cookies (client-side)
 * Returns null if no preference is set or cookie is invalid
 */
export function getLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === LOCALE_COOKIE_NAME) {
      const decoded = decodeURIComponent(value)
      if (isValidLocale(decoded)) {
        return decoded
      }
    }
  }
  return null
}

/**
 * Set the locale preference cookie (client-side)
 * Cookie is set for 180 days with path=/
 */
export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return

  if (!isValidLocale(locale)) {
    console.warn(`Invalid locale: ${locale}, using default: ${DEFAULT_LOCALE}`)
    locale = DEFAULT_LOCALE
  }

  const expires = new Date()
  expires.setTime(expires.getTime() + LOCALE_COOKIE_MAX_AGE * 1000)

  document.cookie = [
    `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}`,
    `expires=${expires.toUTCString()}`,
    'path=/',
    'SameSite=Lax',
  ].join('; ')
}

/**
 * Remove the locale preference cookie (client-side)
 */
export function removeLocaleCookie(): void {
  if (typeof document === 'undefined') return

  document.cookie = [
    `${LOCALE_COOKIE_NAME}=`,
    'expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'path=/',
  ].join('; ')
}

/**
 * Parse locale cookie from a cookie header string (server-side)
 * @param cookieHeader - The Cookie header value
 */
export function parseLocaleCookieFromHeader(
  cookieHeader: string | null
): Locale | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === LOCALE_COOKIE_NAME && value) {
      const decoded = decodeURIComponent(value)
      if (isValidLocale(decoded)) {
        return decoded
      }
    }
  }
  return null
}
