import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be limited.')
}

/**
 * Server-side Stripe client
 * Only use in API routes and server components
 */
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null

/**
 * Get the Stripe publishable key for client-side use
 */
export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null
}

/**
 * Get the Stripe Pricing Table ID for embedding
 */
export function getStripePricingTableId(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || null
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  )
}
