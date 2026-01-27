/**
 * AI Request Timeout Utilities
 *
 * Prevents runaway AI calls from:
 * 1. Blocking serverless functions indefinitely
 * 2. Accumulating costs when providers hang
 * 3. Poor UX from long waits
 */

// Default timeout for AI requests (30 seconds)
export const AI_REQUEST_TIMEOUT_MS = 30_000

// Shorter timeout for simpler operations
export const AI_QUICK_TIMEOUT_MS = 15_000

/**
 * Custom error for AI timeouts
 */
export class AiTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`AI request timed out after ${timeoutMs / 1000} seconds`)
    this.name = 'AiTimeoutError'
  }
}

/**
 * Wrap any promise with a timeout
 * Rejects with AiTimeoutError if the promise doesn't resolve in time
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = AI_REQUEST_TIMEOUT_MS
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new AiTimeoutError(timeoutMs))
      }, timeoutMs)
    }),
  ])
}

/**
 * Create an AbortController that auto-aborts after timeout
 * For use with fetch() calls
 */
export function createTimeoutController(
  timeoutMs: number = AI_REQUEST_TIMEOUT_MS
): { controller: AbortController; cleanup: () => void } {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  return {
    controller,
    cleanup: () => clearTimeout(timeoutId),
  }
}

/**
 * Fetch with automatic timeout
 * Wrapper around fetch that aborts after specified time
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = AI_REQUEST_TIMEOUT_MS
): Promise<Response> {
  const { controller, cleanup } = createTimeoutController(timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AiTimeoutError(timeoutMs)
    }
    throw error
  } finally {
    cleanup()
  }
}
