/**
 * Stripe configuration
 * Maps internal plan IDs to Stripe price IDs
 */

export const STRIPE_PLANS = {
  early_access: {
    name: 'Early Access',
    description: 'Exclusive free tier for early adopters',
    monthly: {
      priceId: process.env.STRIPE_EARLY_ACCESS_PRICE_ID || 'price_1SsgGZ5NscmEQsQQEMnpJ59h',
      amount: 0, // Free
    },
  },
  starter: {
    name: 'Starter',
    description: 'For individuals & small operations',
    monthly: {
      priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || 'price_1SlqBh5NscmEQsQQCALccT4F',
      amount: 1800, // $18.00 in cents
    },
  },
  growth: {
    name: 'Growth',
    description: 'For growing small businesses',
    monthly: {
      priceId: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID || 'price_1SlqB95NscmEQsQQ1YoczS1u',
      amount: 3900, // $39.00 in cents
    },
  },
  scale: {
    name: 'Scale',
    description: 'For teams needing advanced controls',
    monthly: {
      priceId: process.env.STRIPE_SCALE_MONTHLY_PRICE_ID || 'price_1Slq9O5NscmEQsQQnGvdw1SW',
      amount: 8900, // $89.00 in cents
    },
  },
} as const

export type StripePlanId = keyof typeof STRIPE_PLANS
export type BillingInterval = 'monthly' | 'annual'

/**
 * Get price ID for a plan
 */
export function getPriceId(planId: StripePlanId): string {
  return STRIPE_PLANS[planId].monthly.priceId
}

/**
 * Get plan details by price ID
 */
export function getPlanByPriceId(priceId: string): { planId: StripePlanId; interval: BillingInterval } | null {
  for (const [planId, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.monthly.priceId === priceId) {
      return { planId: planId as StripePlanId, interval: 'monthly' }
    }
  }
  return null
}
