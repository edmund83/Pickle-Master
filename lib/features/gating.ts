/**
 * Feature Gating System
 *
 * Single source of truth for plan-based feature access control.
 * Aligns with docs/pricingplan.md and database function can_access_feature().
 *
 * Feature Matrix:
 * - ALL PLANS: pick_lists, check_in_out
 * - GROWTH+: sales_orders, delivery_orders, invoices, stock_counts, purchase_orders, receiving
 * - SCALE ONLY: lot_tracking, serial_tracking
 * - Early Access = Scale (all features)
 */

import { PlanId } from '@/lib/plans/config'
import { createClient } from '@/lib/supabase/server'

// ============================================================================
// FEATURE TYPES
// ============================================================================

export const FEATURE_IDS = [
  // ALL PLANS
  'pick_lists',
  'check_in_out',
  // GROWTH+
  'sales_orders',
  'delivery_orders',
  'invoices',
  'stock_counts',
  'purchase_orders',
  'receiving',
  // SCALE ONLY
  'lot_tracking',
  'serial_tracking',
] as const

export type FeatureId = (typeof FEATURE_IDS)[number]

// ============================================================================
// PLAN FEATURE MATRIX
// ============================================================================

/**
 * Features available for each plan tier.
 * This must match the database function can_access_feature() in migration 00095.
 */
export const PLAN_FEATURES: Record<PlanId, FeatureId[]> = {
  starter: ['pick_lists', 'check_in_out'],
  growth: [
    'pick_lists',
    'check_in_out',
    'sales_orders',
    'delivery_orders',
    'invoices',
    'stock_counts',
    'purchase_orders',
    'receiving',
  ],
  scale: [
    'pick_lists',
    'check_in_out',
    'sales_orders',
    'delivery_orders',
    'invoices',
    'stock_counts',
    'purchase_orders',
    'receiving',
    'lot_tracking',
    'serial_tracking',
  ],
  early_access: [
    'pick_lists',
    'check_in_out',
    'sales_orders',
    'delivery_orders',
    'invoices',
    'stock_counts',
    'purchase_orders',
    'receiving',
    'lot_tracking',
    'serial_tracking',
  ],
}

// ============================================================================
// FEATURE METADATA
// ============================================================================

export interface FeatureInfo {
  id: FeatureId
  name: string
  description: string
  requiredPlan: PlanId
  upgradeMessage: string
}

export const FEATURE_INFO: Record<FeatureId, FeatureInfo> = {
  pick_lists: {
    id: 'pick_lists',
    name: 'Pick Lists',
    description: 'Create and manage pick lists for order fulfillment',
    requiredPlan: 'starter',
    upgradeMessage: 'Pick lists are available on all plans.',
  },
  check_in_out: {
    id: 'check_in_out',
    name: 'Check In/Out',
    description: 'Track asset check-ins and check-outs',
    requiredPlan: 'starter',
    upgradeMessage: 'Check in/out is available on all plans.',
  },
  sales_orders: {
    id: 'sales_orders',
    name: 'Sales Orders',
    description: 'Create and manage sales orders',
    requiredPlan: 'growth',
    upgradeMessage: 'Upgrade to Growth to create sales orders.',
  },
  delivery_orders: {
    id: 'delivery_orders',
    name: 'Delivery Orders',
    description: 'Create and manage delivery orders',
    requiredPlan: 'growth',
    upgradeMessage: 'Upgrade to Growth to create delivery orders.',
  },
  invoices: {
    id: 'invoices',
    name: 'Invoices',
    description: 'Create and manage invoices',
    requiredPlan: 'growth',
    upgradeMessage: 'Upgrade to Growth to create invoices.',
  },
  stock_counts: {
    id: 'stock_counts',
    name: 'Stock Counts',
    description: 'Perform inventory counts and cycle counting',
    requiredPlan: 'growth',
    upgradeMessage: 'Upgrade to Growth to perform stock counts.',
  },
  purchase_orders: {
    id: 'purchase_orders',
    name: 'Purchase Orders',
    description: 'Create and manage purchase orders',
    requiredPlan: 'growth',
    upgradeMessage: 'Upgrade to Growth to create purchase orders.',
  },
  receiving: {
    id: 'receiving',
    name: 'Receiving',
    description: 'Receive inventory from purchase orders',
    requiredPlan: 'growth',
    upgradeMessage: 'Upgrade to Growth to receive inventory.',
  },
  lot_tracking: {
    id: 'lot_tracking',
    name: 'Lot Tracking',
    description: 'Track lot numbers, batch codes, and expiry dates',
    requiredPlan: 'scale',
    upgradeMessage: 'Upgrade to Scale for lot tracking.',
  },
  serial_tracking: {
    id: 'serial_tracking',
    name: 'Serial Number Tracking',
    description: 'Track individual serial numbers',
    requiredPlan: 'scale',
    upgradeMessage: 'Upgrade to Scale for serial number tracking.',
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a plan has access to a feature (client-side check)
 */
export function hasFeature(planId: PlanId | string, feature: FeatureId): boolean {
  const normalizedPlan = (planId as PlanId) || 'starter'
  const features = PLAN_FEATURES[normalizedPlan] || PLAN_FEATURES.starter
  return features.includes(feature)
}

/**
 * Get the minimum required plan for a feature
 */
export function getRequiredPlan(feature: FeatureId): PlanId {
  return FEATURE_INFO[feature]?.requiredPlan || 'starter'
}

/**
 * Get feature info by ID
 */
export function getFeatureInfo(feature: FeatureId): FeatureInfo | null {
  return FEATURE_INFO[feature] || null
}

/**
 * Get all features available for a plan
 */
export function getFeaturesForPlan(planId: PlanId | string): FeatureId[] {
  const normalizedPlan = (planId as PlanId) || 'starter'
  return PLAN_FEATURES[normalizedPlan] || PLAN_FEATURES.starter
}

/**
 * Check if a feature ID is valid
 */
export function isValidFeatureId(featureId: string): featureId is FeatureId {
  return FEATURE_IDS.includes(featureId as FeatureId)
}

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
