/**
 * Stripe configuration
 * Maps internal plan IDs to Stripe price IDs
 */

export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    description: 'For solo operators and small teams',
    monthly: {
      priceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || '',
      amount: 1900, // $19.00 in cents
    },
    annual: {
      priceId: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || '',
      amount: 15200, // $152.00/year ($15.20/mo equivalent, 20% off)
    },
  },
  team: {
    name: 'Team',
    description: 'For teams who need accountability',
    monthly: {
      priceId: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || '',
      amount: 4900, // $49.00 in cents
    },
    annual: {
      priceId: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID || '',
      amount: 39200, // $392.00/year ($39.20/mo equivalent, 20% off)
    },
  },
  business: {
    name: 'Business',
    description: 'For multi-location operations',
    monthly: {
      priceId: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || '',
      amount: 9900, // $99.00 in cents
    },
    annual: {
      priceId: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID || '',
      amount: 79200, // $792.00/year ($79.20/mo equivalent, 20% off)
    },
  },
} as const

export type StripePlanId = keyof typeof STRIPE_PLANS
export type BillingInterval = 'monthly' | 'annual'

/**
 * Get price ID for a plan and interval
 */
export function getPriceId(planId: StripePlanId, interval: BillingInterval): string {
  return STRIPE_PLANS[planId][interval].priceId
}

/**
 * Get plan details by price ID
 */
export function getPlanByPriceId(priceId: string): { planId: StripePlanId; interval: BillingInterval } | null {
  for (const [planId, plan] of Object.entries(STRIPE_PLANS)) {
    if (plan.monthly.priceId === priceId) {
      return { planId: planId as StripePlanId, interval: 'monthly' }
    }
    if (plan.annual.priceId === priceId) {
      return { planId: planId as StripePlanId, interval: 'annual' }
    }
  }
  return null
}
