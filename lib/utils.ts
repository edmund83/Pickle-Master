import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Use this when interpolating user-provided strings into HTML context
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Escapes SQL LIKE/ILIKE wildcard characters (% and _)
 * Use this when interpolating user-provided strings into ILIKE patterns
 * to prevent pattern injection attacks
 */
export function escapeSqlLike(unsafe: string): string {
  return unsafe.replace(/[%_]/g, '\\$&')
}

/**
 * Returns a URL safe for use in <img src>. Allows https:, http:, and relative URLs.
 * Returns null for javascript:, data:, or other protocols to prevent XSS.
 */
export function safeImageUrl(url: string | null | undefined): string | null {
  if (url == null || url === '') return null
  const trimmed = url.trim().toLowerCase()
  if (trimmed.startsWith('https:') || trimmed.startsWith('http:')) return url
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) return url
  return null
}
