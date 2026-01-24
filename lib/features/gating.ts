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
 *
 * NOTE: This file contains client-safe code only.
 * Server-side feature checks are in gating.server.ts
 */

import { PlanId } from '@/lib/plans/config'

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

