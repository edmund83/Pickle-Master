/**
 * Rate limiting utilities for expensive operations
 * Uses database-backed rate limiting via RPC functions
 */

import { createClient } from '@/lib/supabase/server'

export type RateLimitResult = {
    allowed: boolean
    remaining?: number
    error?: string
    reset_at?: string
}

/**
 * Check if the current user/tenant is within rate limits for an operation
 * @param operation - The operation identifier (e.g., 'bulk_import', 'export')
 * @returns RateLimitResult indicating if the operation is allowed
 */
export async function checkRateLimit(operation: string): Promise<RateLimitResult> {
    try {
        const supabase = await createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).rpc('check_rate_limit', {
            p_operation: operation
        })

        if (error) {
            console.error('Rate limit check error:', error)
            // Allow on error - DB triggers provide fallback protection
            // In production, you may want to be more conservative
            return { allowed: true }
        }

        return data as RateLimitResult
    } catch (err) {
        console.error('Rate limit check exception:', err)
        // Allow on error to prevent blocking legitimate requests
        return { allowed: true }
    }
}

/**
 * Standard rate-limited operations
 * These match the default limits configured in the database
 */
export const RATE_LIMITED_OPERATIONS = {
    /** Bulk import of inventory items (10/hour default) */
    BULK_IMPORT: 'bulk_import',
    /** Report generation (20/hour default) */
    REPORT_GENERATION: 'report_generation',
    /** Data export operations (30/hour default) */
    EXPORT: 'export',
    /** Global search queries (100/hour default) */
    GLOBAL_SEARCH: 'global_search'
} as const

export type RateLimitedOperation = typeof RATE_LIMITED_OPERATIONS[keyof typeof RATE_LIMITED_OPERATIONS]

/**
 * Higher-order function to wrap an action with rate limiting
 * @param operation - The operation to rate limit
 * @param action - The async action to execute if rate limit allows
 * @returns Result of the action or error if rate limited
 */
export async function withRateLimit<T>(
    operation: RateLimitedOperation,
    action: () => Promise<T>
): Promise<T | { success: false; error: string }> {
    const rateLimitCheck = await checkRateLimit(operation)

    if (!rateLimitCheck.allowed) {
        return {
            success: false,
            error: rateLimitCheck.error || 'Rate limit exceeded. Please try again later.'
        }
    }

    return action()
}
