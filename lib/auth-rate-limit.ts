/**
 * In-memory rate limit for auth-related pages (login, signup, forgot-password).
 * Limits requests per IP per minute to mitigate brute-force and abuse.
 * Note: Resets on server restart; for multi-instance deployments consider Redis.
 */

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15

const store = new Map<string, { count: number; resetAt: number }>()

function prune(): void {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key)
  }
}

export function checkAuthRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  if (store.size > 10000) prune()

  let entry = store.get(ip)
  if (!entry) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true }
  }
  if (entry.resetAt <= now) {
    entry = { count: 1, resetAt: now + WINDOW_MS }
    store.set(ip, entry)
    return { allowed: true }
  }
  entry.count += 1
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { allowed: true }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}
