import { createClient } from '@/lib/supabase/server'

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
 * Get quota usage for the current tenant
 * Returns usage stats for users and items with warning/exceeded flags
 */
export async function getQuotaUsage(): Promise<QuotaUsage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_quota_usage')

  if (error) {
    console.error('Error fetching quota usage:', error)
    throw error
  }

  return data as QuotaUsage[]
}

/**
 * Check if the tenant can add more items
 * Returns allowed: false if at or above limit
 */
export async function canAddItem(): Promise<QuotaCheckResult> {
  try {
    const usage = await getQuotaUsage()
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
    console.warn('Could not check item quota')
    return {
      allowed: false,
      message: 'Quota check unavailable. Please try again later.',
    }
  }
}

/**
 * Check if the tenant can add more users
 * Returns allowed: false if at or above limit
 */
export async function canAddUser(): Promise<QuotaCheckResult> {
  try {
    const usage = await getQuotaUsage()
    const users = usage.find((u) => u.resource_type === 'users')

    if (!users) {
      return { allowed: true }
    }

    if (users.is_exceeded) {
      return {
        allowed: false,
        message: `User limit reached (${users.current_usage}/${users.max_allowed}). Please upgrade your plan to add more team members.`,
        usage: users,
      }
    }

    return { allowed: true, usage: users }
  } catch {
    console.warn('Could not check user quota')
    return {
      allowed: false,
      message: 'Quota check unavailable. Please try again later.',
    }
  }
}

/**
 * Get the highest priority warning/exceeded quota
 * Useful for showing a single banner
 */
export async function getQuotaWarning(): Promise<{
  hasWarning: boolean
  hasExceeded: boolean
  items?: QuotaUsage
  users?: QuotaUsage
}> {
  try {
    const usage = await getQuotaUsage()
    const items = usage.find((u) => u.resource_type === 'items')
    const users = usage.find((u) => u.resource_type === 'users')

    const hasWarning = (items?.is_warning || users?.is_warning) ?? false
    const hasExceeded = (items?.is_exceeded || users?.is_exceeded) ?? false

    return {
      hasWarning,
      hasExceeded,
      items,
      users,
    }
  } catch {
    return { hasWarning: false, hasExceeded: false }
  }
}
