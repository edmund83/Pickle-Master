/**
 * AI Usage Cost Tracking
 *
 * Tracks per-user AI usage with $0.05/month limit (~100-160 questions with Gemini Flash)
 */

import { createClient } from '@/lib/supabase/server'
import { createClient as createClientBrowser } from '@/lib/supabase/client'

export interface UsageCheckResult {
  allowed: boolean
  error?: string
  status: number
  warning?: boolean
  usage?: UsageInfo
}

export interface UsageInfo {
  current_usd: number
  limit_usd: number
  remaining_usd: number
  usage_percent: number
  resets_at: string
}

export interface UsageSummary extends UsageInfo {
  total_tokens: number
  request_count: number
  period_start: string
}

export interface TrackUsageResult {
  success: boolean
  cost_usd?: number
  input_tokens?: number
  output_tokens?: number
  error?: string
}

// Model pricing per 1M tokens (keep in sync with DB function)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'gemini-2.0-flash': { input: 0.1, output: 0.4 },
  'gemini-1.5-pro': { input: 1.25, output: 5 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'claude-3.5-sonnet': { input: 3, output: 15 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
}

/**
 * Estimate cost for a request (for pre-check)
 * Default assumes ~1000 input tokens, ~500 output tokens (typical question)
 */
export function estimateCost(
  inputTokens: number = 1000,
  outputTokens: number = 500,
  model: string = 'gemini-1.5-flash'
): number {
  const pricing =
    Object.entries(MODEL_PRICING).find(([key]) =>
      model.toLowerCase().includes(key.toLowerCase())
    )?.[1] || MODEL_PRICING['gemini-1.5-flash']

  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000
}

/**
 * Check if user has enough budget for a request (server-side)
 */
export async function checkAiUsageLimit(
  estimatedCost: number = 0.0003 // ~1 standard question
): Promise<UsageCheckResult> {
  try {
    const supabase = await createClient()
     
    const { data, error } = await (supabase as any).rpc('check_ai_usage_limit', {
      p_estimated_cost: estimatedCost,
    })

    if (error) {
      console.error('Error checking AI usage limit:', error)
      return {
        allowed: false,
        status: 503,
        error: 'AI usage check unavailable. Please try again later.',
      }
    }

    return data as UsageCheckResult
  } catch (err) {
    console.error('Exception checking AI usage limit:', err)
    return {
      allowed: false,
      status: 503,
      error: 'AI usage check unavailable. Please try again later.',
    }
  }
}

/**
 * Track usage after AI call completes (server-side)
 */
export async function trackAiUsage(
  inputTokens: number,
  outputTokens: number,
  modelName: string = 'gemini-1.5-flash',
  operation: string = 'ai_chat'
): Promise<TrackUsageResult> {
  try {
    const supabase = await createClient()
     
    const { data, error } = await (supabase as any).rpc('track_ai_usage', {
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_model_name: modelName,
      p_operation: operation,
    })

    if (error) {
      console.error('Error tracking AI usage:', error)
      return { success: false, error: error.message }
    }

    return data as TrackUsageResult
  } catch (err) {
    console.error('Exception tracking AI usage:', err)
    return { success: false, error: 'Failed to track usage' }
  }
}

/**
 * Get user's usage summary (server-side)
 */
export async function getAiUsageSummary(): Promise<UsageSummary | null> {
  try {
    const supabase = await createClient()
     
    const { data, error } = await (supabase as any).rpc('get_ai_usage_summary')

    if (error) {
      console.error('Error getting AI usage summary:', error)
      return null
    }

    return data as UsageSummary
  } catch (err) {
    console.error('Exception getting AI usage summary:', err)
    return null
  }
}

// ===========================================
// CLIENT-SIDE FUNCTIONS
// ===========================================

/**
 * Get user's usage summary (client-side)
 */
export async function getAiUsageSummaryClient(): Promise<UsageSummary | null> {
  try {
    const supabase = createClientBrowser()
     
    const { data, error } = await (supabase as any).rpc('get_ai_usage_summary')

    if (error) {
      console.error('Error getting AI usage summary:', error)
      return null
    }

    return data as UsageSummary
  } catch (err) {
    console.error('Exception getting AI usage summary:', err)
    return null
  }
}

/**
 * Check usage limit (client-side) - for UI warnings
 */
export async function checkAiUsageLimitClient(): Promise<UsageCheckResult> {
  try {
    const supabase = createClientBrowser()
     
    const { data, error } = await (supabase as any).rpc('check_ai_usage_limit', {
      p_estimated_cost: 0.0003,
    })

    if (error) {
      console.error('Error checking AI usage limit:', error)
      return { allowed: true, status: 200 }
    }

    return data as UsageCheckResult
  } catch (err) {
    console.error('Exception checking AI usage limit:', err)
    return { allowed: true, status: 200 }
  }
}
