/**
 * Subscription status helpers
 * Used to check trial status, grace period, and account access
 */

export type SubscriptionTier = 'starter' | 'team' | 'business' | 'enterprise'
export type SubscriptionStatus = 'trial' | 'active' | 'paused' | 'cancelled'

export interface Tenant {
  id: string
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null
  max_users: number
  max_items: number
  stripe_customer_id?: string | null
}

export interface SubscriptionState {
  isTrialActive: boolean
  isInGracePeriod: boolean
  isAccountPaused: boolean
  isPaid: boolean
  daysRemaining: number
  canAccess: boolean
  message?: string
}

/**
 * Plan limits configuration
 */
export const PLAN_LIMITS = {
  starter: { maxUsers: 1, maxItems: 10000, price: 19 },
  team: { maxUsers: 10, maxItems: 10000, price: 49 },
  business: { maxUsers: 25, maxItems: 10000, price: 99 },
  enterprise: { maxUsers: Infinity, maxItems: Infinity, price: null },
} as const

/**
 * Grace period duration in days
 */
export const GRACE_PERIOD_DAYS = 7

/**
 * Check if the trial is still active
 */
export function isTrialActive(tenant: Tenant): boolean {
  if (tenant.subscription_status !== 'trial') return false
  if (!tenant.trial_ends_at) return false

  const trialEnd = new Date(tenant.trial_ends_at)
  return trialEnd > new Date()
}

/**
 * Check if the account is in the grace period (7 days after trial ends)
 */
export function isInGracePeriod(tenant: Tenant): boolean {
  if (tenant.subscription_status !== 'trial') return false
  if (!tenant.trial_ends_at) return false

  const now = new Date()
  const trialEnd = new Date(tenant.trial_ends_at)
  const graceEnd = new Date(trialEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)

  return trialEnd <= now && now < graceEnd
}

/**
 * Check if the account is paused (trial + grace period expired, or status is paused/cancelled)
 */
export function isAccountPaused(tenant: Tenant): boolean {
  // Explicitly paused or cancelled
  if (tenant.subscription_status === 'paused' || tenant.subscription_status === 'cancelled') {
    return true
  }

  // Trial with expired grace period
  if (tenant.subscription_status === 'trial' && tenant.trial_ends_at) {
    const now = new Date()
    const trialEnd = new Date(tenant.trial_ends_at)
    const graceEnd = new Date(trialEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
    return now >= graceEnd
  }

  return false
}

/**
 * Check if the subscription is actively paid
 */
export function isPaidSubscription(tenant: Tenant): boolean {
  return tenant.subscription_status === 'active'
}

/**
 * Get days remaining in trial (0 if not in trial or expired)
 */
export function getDaysRemaining(tenant: Tenant): number {
  if (!tenant.trial_ends_at) return 0

  const now = new Date()
  const trialEnd = new Date(tenant.trial_ends_at)
  const diffMs = trialEnd.getTime() - now.getTime()

  if (diffMs <= 0) return 0

  return Math.ceil(diffMs / (24 * 60 * 60 * 1000))
}

/**
 * Get grace period days remaining (0 if not in grace period)
 */
export function getGraceDaysRemaining(tenant: Tenant): number {
  if (!isInGracePeriod(tenant)) return 0
  if (!tenant.trial_ends_at) return 0

  const now = new Date()
  const trialEnd = new Date(tenant.trial_ends_at)
  const graceEnd = new Date(trialEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
  const diffMs = graceEnd.getTime() - now.getTime()

  if (diffMs <= 0) return 0

  return Math.ceil(diffMs / (24 * 60 * 60 * 1000))
}

/**
 * Get the full subscription state for a tenant
 */
export function getSubscriptionState(tenant: Tenant): SubscriptionState {
  const trialActive = isTrialActive(tenant)
  const inGracePeriod = isInGracePeriod(tenant)
  const accountPaused = isAccountPaused(tenant)
  const paid = isPaidSubscription(tenant)
  const daysRemaining = trialActive ? getDaysRemaining(tenant) : getGraceDaysRemaining(tenant)

  // Can access if: paid, trial active, or in grace period
  const canAccess = paid || trialActive || inGracePeriod

  // Generate appropriate message
  let message: string | undefined
  if (accountPaused) {
    message = 'Your account is paused. Please upgrade to continue using StockZip.'
  } else if (inGracePeriod) {
    message = `Your trial has ended. You have ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left to upgrade before your account is paused.`
  } else if (trialActive && daysRemaining <= 3) {
    message = `Your trial ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Upgrade now to keep your data.`
  }

  return {
    isTrialActive: trialActive,
    isInGracePeriod: inGracePeriod,
    isAccountPaused: accountPaused,
    isPaid: paid,
    daysRemaining,
    canAccess,
    message,
  }
}

/**
 * Format trial end date for display
 */
export function formatTrialEndDate(trialEndsAt: string | null): string {
  if (!trialEndsAt) return 'N/A'

  const date = new Date(trialEndsAt)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Get human-readable subscription status
 */
export function getStatusLabel(tenant: Tenant): string {
  if (isPaidSubscription(tenant)) {
    return `${capitalize(tenant.subscription_tier)} Plan`
  }

  if (isTrialActive(tenant)) {
    const days = getDaysRemaining(tenant)
    return `Trial (${days} day${days === 1 ? '' : 's'} left)`
  }

  if (isInGracePeriod(tenant)) {
    const days = getGraceDaysRemaining(tenant)
    return `Grace Period (${days} day${days === 1 ? '' : 's'} left)`
  }

  if (isAccountPaused(tenant)) {
    return 'Account Paused'
  }

  return 'Unknown'
}

/**
 * Get status badge color class
 */
export function getStatusColor(tenant: Tenant): string {
  if (isPaidSubscription(tenant)) {
    return 'bg-green-100 text-green-700'
  }

  if (isTrialActive(tenant)) {
    const days = getDaysRemaining(tenant)
    if (days <= 3) return 'bg-yellow-100 text-yellow-700'
    return 'bg-blue-100 text-blue-700'
  }

  if (isInGracePeriod(tenant)) {
    return 'bg-orange-100 text-orange-700'
  }

  return 'bg-red-100 text-red-700'
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
