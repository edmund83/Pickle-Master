import { createClient } from '@/lib/supabase/client'

export type QuotaUsage = {
  resource_type: 'users' | 'items'
  current_usage: number
  max_allowed: number
  usage_percent: number
  is_warning: boolean
  is_exceeded: boolean
}

export type QuotaCheckResult = {
  allowed: boolean
  message?: string
  usage?: QuotaUsage
}

/**
 * Client-side quota usage check
 */
export async function getQuotaUsageClient(): Promise<QuotaUsage[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_quota_usage')

  if (error) {
    console.error('Error fetching quota usage:', error)
    throw error
  }

  return data as QuotaUsage[]
}

/**
 * Check if the tenant can add more items (client-side)
 */
export async function canAddItemClient(): Promise<QuotaCheckResult> {
  try {
    const usage = await getQuotaUsageClient()
    const items = usage.find((u) => u.resource_type === 'items')

    if (!items) {
      return { allowed: true }
    }

    if (items.is_exceeded) {
      return {
        allowed: false,
        message: `Item limit reached (${items.current_usage}/${items.max_allowed}). Please upgrade your plan to add more items.`,
        usage: items,
      }
    }

    return { allowed: true, usage: items }
  } catch {
    // If we can't check quota, allow the operation
    // The database trigger will catch it as a fallback
    console.warn('Could not check item quota, allowing operation')
    return { allowed: true }
  }
}

/**
 * Check if the tenant can add a specific number of items (for bulk import)
 */
export async function canAddItemsClient(count: number): Promise<QuotaCheckResult> {
  try {
    const usage = await getQuotaUsageClient()
    const items = usage.find((u) => u.resource_type === 'items')

    if (!items) {
      return { allowed: true }
    }

    const remaining = items.max_allowed - items.current_usage

    if (remaining <= 0) {
      return {
        allowed: false,
        message: `Item limit reached (${items.current_usage}/${items.max_allowed}). Please upgrade your plan.`,
        usage: items,
      }
    }

    if (count > remaining) {
      return {
        allowed: false,
        message: `Cannot import ${count} items. Only ${remaining} slots remaining (${items.current_usage}/${items.max_allowed}). Please reduce the import size or upgrade your plan.`,
        usage: items,
      }
    }

    return { allowed: true, usage: items }
  } catch {
    console.warn('Could not check item quota, allowing operation')
    return { allowed: true }
  }
}
