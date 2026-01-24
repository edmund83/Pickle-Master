/**
 * Feature Gating System - Server-Side Functions
 *
 * This file contains server-only feature gating utilities that use
 * Supabase server client. Import from here in Server Components and
 * Server Actions only.
 */

import { createClient } from '@/lib/supabase/server'
import { PlanId } from '@/lib/plans/config'
import {
  type FeatureId,
  FEATURE_INFO,
  hasFeature,
  getRequiredPlan,
} from './gating'

// ============================================================================
// SERVER-SIDE FEATURE CHECKS
// ============================================================================

export interface FeatureCheckResult {
  allowed: boolean
  feature: FeatureId
  currentPlan: PlanId
  requiredPlan: PlanId
  upgradeMessage: string
}

/**
 * Check if the current user can access a feature (server-side)
 * Uses the database function can_access_feature() for authoritative check.
 */
export async function checkFeatureAccess(feature: FeatureId): Promise<FeatureCheckResult> {
  const supabase = await createClient()

  // Get user's tenant info
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      allowed: false,
      feature,
      currentPlan: 'starter',
      requiredPlan: getRequiredPlan(feature),
      upgradeMessage: 'Please sign in to access this feature.',
    }
  }

  // Get tenant's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, tenants(subscription_tier)')
    .eq('id', user.id)
    .single()

  // Type the joined tenants result
  const profileWithTenant = profile as { tenants: { subscription_tier?: string } | null } | null
  const currentPlan = (profileWithTenant?.tenants?.subscription_tier as PlanId) || 'starter'
  const allowed = hasFeature(currentPlan, feature)
  const requiredPlan = getRequiredPlan(feature)

  return {
    allowed,
    feature,
    currentPlan,
    requiredPlan,
    upgradeMessage: allowed ? '' : FEATURE_INFO[feature]?.upgradeMessage || 'Upgrade required.',
  }
}

/**
 * Server action guard - throws error if feature not allowed
 * Use at the start of server actions to enforce feature access.
 */
export async function requireFeature(feature: FeatureId): Promise<void> {
  const result = await checkFeatureAccess(feature)
  if (!result.allowed) {
    throw new Error(result.upgradeMessage)
  }
}

/**
 * Server action guard - returns error object instead of throwing
 * Use when you want to return a structured error response.
 */
export async function requireFeatureSafe(
  feature: FeatureId
): Promise<{ error: string } | { error: null }> {
  const result = await checkFeatureAccess(feature)
  if (!result.allowed) {
    return { error: result.upgradeMessage }
  }
  return { error: null }
}
