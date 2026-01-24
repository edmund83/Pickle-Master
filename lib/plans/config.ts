/**
 * Single source of truth for plan definitions
 * All plan limits, pricing, and features are defined here
 */

export const PLAN_IDS = ['early_access', 'starter', 'growth', 'scale'] as const
export type PlanId = (typeof PLAN_IDS)[number]

export interface PlanLimits {
  maxItems: number
  maxUsers: number
  maxFolders: number // -1 = unlimited
  maxAiQuestions: number
}

import type { FeatureId } from '@/lib/features/gating'

export interface PlanConfig {
  id: PlanId
  name: string
  description: string
  price: number // monthly price in dollars, 0 for free
  limits: PlanLimits
  features: string[] // Display features for marketing
  allowedFeatures: FeatureId[] // Machine-readable feature IDs for gating
  isPromotional?: boolean
  isPopular?: boolean
  trialDays: number
}

/**
 * Plan configurations matching docs/pricingplan.md
 *
 * Founders Pricing (Limited Spots):
 * - Early Access: $0 for 3 months, 1,200 items, 3 users, 500 AI questions
 * - Starter: $18/mo, 1,200 items, 3 users, 50 AI questions
 * - Growth: $39/mo, 3,000 items, 5 users, 100 AI questions
 * - Scale: $89/mo, 8,000 items, 8 users, 500 AI questions
 */
export const PLANS: Record<PlanId, PlanConfig> = {
  early_access: {
    id: 'early_access',
    name: 'Early Access',
    description: 'Limited spots for early adopters',
    price: 0,
    limits: {
      maxItems: 1200,
      maxUsers: 3,
      maxFolders: -1, // unlimited
      maxAiQuestions: 500,
    },
    features: [
      'All Scale features included',
      'Lot & serial tracking',
      '500 AskZoe AI questions/mo',
      '3 months free - then pick a plan',
    ],
    allowedFeatures: [
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
    isPromotional: true,
    trialDays: 90,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For individuals & small operations',
    price: 18,
    limits: {
      maxItems: 1200,
      maxUsers: 3,
      maxFolders: -1, // unlimited
      maxAiQuestions: 50,
    },
    features: [
      '1,200 inventory items',
      '3 users',
      '50 AskZoe AI questions/mo',
      'Basic reports',
    ],
    allowedFeatures: ['pick_lists', 'check_in_out'],
    trialDays: 14,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'For growing small businesses',
    price: 39,
    limits: {
      maxItems: 3000,
      maxUsers: 5,
      maxFolders: -1, // unlimited
      maxAiQuestions: 100,
    },
    features: [
      '3,000 inventory items',
      '5 users',
      '100 AskZoe AI questions/mo',
      'Purchase orders & receiving',
      'Pick lists & fulfillment',
    ],
    allowedFeatures: [
      'pick_lists',
      'check_in_out',
      'sales_orders',
      'delivery_orders',
      'invoices',
      'stock_counts',
      'purchase_orders',
      'receiving',
    ],
    isPopular: true,
    trialDays: 14,
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    description: 'For teams needing advanced controls',
    price: 89,
    limits: {
      maxItems: 8000,
      maxUsers: 8,
      maxFolders: -1, // unlimited
      maxAiQuestions: 500,
    },
    features: [
      '8,000 inventory items',
      '8 users',
      '500 AskZoe AI questions/mo',
      'Lot/Serial tracking',
      'Audit trail & Approvals',
    ],
    allowedFeatures: [
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
    trialDays: 14,
  },
}

/**
 * Get plan config by ID
 * Returns null if plan ID is not found
 */
export function getPlanById(planId: string): PlanConfig | null {
  if (isValidPlanId(planId)) {
    return PLANS[planId]
  }
  return null
}

/**
 * Get plan limits by ID
 * Returns starter limits if plan ID is not found (safe default)
 */
export function getPlanLimits(planId: string): PlanLimits {
  const plan = getPlanById(planId)
  return plan?.limits ?? PLANS.starter.limits
}

/**
 * Check if a string is a valid plan ID
 */
export function isValidPlanId(planId: string): planId is PlanId {
  return PLAN_IDS.includes(planId as PlanId)
}

/**
 * Get default plan ID (used for OAuth signups and fallbacks)
 */
export function getDefaultPlanId(): PlanId {
  return 'starter'
}

/**
 * Get trial duration for a plan in days
 */
export function getTrialDays(planId: string): number {
  const plan = getPlanById(planId)
  return plan?.trialDays ?? 14
}

/**
 * Normalize a plan ID
 * Returns the plan ID if valid, otherwise returns the default plan
 */
export function normalizePlanId(planId: string): PlanId {
  if (isValidPlanId(planId)) {
    return planId
  }
  return getDefaultPlanId()
}

/**
 * PLAN_LIMITS export for backwards compatibility with lib/subscription/status.ts
 */
export const PLAN_LIMITS = Object.fromEntries(
  Object.entries(PLANS).map(([id, plan]) => [
    id,
    {
      maxUsers: plan.limits.maxUsers,
      maxItems: plan.limits.maxItems,
      price: plan.price,
    },
  ])
) as Record<PlanId, { maxUsers: number; maxItems: number; price: number }>
