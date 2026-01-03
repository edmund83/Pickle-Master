import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getPlanByPriceId } from '@/lib/stripe/config'

// Lazy initialize Stripe to avoid build-time errors when keys aren't configured
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = SupabaseClient<any, 'public', any>

function getSupabaseAdmin(): SupabaseAdmin {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuration is missing')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: Request) {
  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(stripe, supabaseAdmin, session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(supabaseAdmin, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabaseAdmin, subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(supabaseAdmin, invoice)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(supabaseAdmin, invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

/**
 * Handle successful checkout - create/update subscription
 */
async function handleCheckoutComplete(
  stripe: Stripe,
  supabaseAdmin: SupabaseAdmin,
  session: Stripe.Checkout.Session
) {
  const tenantId = session.client_reference_id
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!tenantId) {
    console.error('No tenant_id in checkout session')
    return
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id
  const planInfo = getPlanByPriceId(priceId)

  if (!planInfo) {
    console.error('Unknown price ID:', priceId)
    return
  }

  // Update tenant with subscription info
  const { error } = await supabaseAdmin
    .from('tenants')
    .update({
      stripe_customer_id: customerId,
      subscription_tier: planInfo.planId,
      subscription_status: 'active',
      trial_ends_at: null, // Clear trial since they've paid
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenantId)

  if (error) {
    console.error('Failed to update tenant subscription:', error)
    throw error
  }

  console.log(`Subscription activated for tenant ${tenantId}: ${planInfo.planId}`)
}

/**
 * Handle subscription updates (plan changes, renewals)
 */
async function handleSubscriptionUpdated(
  supabaseAdmin: SupabaseAdmin,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string

  // Find tenant by Stripe customer ID
  const { data: tenant, error: findError } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (findError || !tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  const priceId = subscription.items.data[0]?.price.id
  const planInfo = getPlanByPriceId(priceId)

  let status: string
  switch (subscription.status) {
    case 'active':
    case 'trialing':
      status = 'active'
      break
    case 'past_due':
      status = 'active' // Still active but payment is late
      break
    case 'canceled':
    case 'unpaid':
      status = 'cancelled'
      break
    default:
      status = 'paused'
  }

  const { error: updateError } = await supabaseAdmin
    .from('tenants')
    .update({
      subscription_tier: planInfo?.planId || 'starter',
      subscription_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenant.id)

  if (updateError) {
    console.error('Failed to update subscription:', updateError)
    throw updateError
  }

  console.log(`Subscription updated for tenant ${tenant.id}: ${status}`)
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(
  supabaseAdmin: SupabaseAdmin,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string

  // Find tenant by Stripe customer ID
  const { data: tenant, error: findError } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (findError || !tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  // Set status to cancelled
  const { error: updateError } = await supabaseAdmin
    .from('tenants')
    .update({
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenant.id)

  if (updateError) {
    console.error('Failed to cancel subscription:', updateError)
    throw updateError
  }

  console.log(`Subscription cancelled for tenant ${tenant.id}`)
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  supabaseAdmin: SupabaseAdmin,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string

  // Find tenant by Stripe customer ID
  const { data: tenant, error: findError } = await supabaseAdmin
    .from('tenants')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (findError || !tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  // Log the failed payment - don't immediately cancel
  // Stripe will handle retry logic
  console.log(`Payment failed for tenant ${tenant.id}, invoice: ${invoice.id}`)

  // TODO: Send email notification about failed payment
}

/**
 * Handle successful payment (renewal)
 */
async function handlePaymentSucceeded(
  supabaseAdmin: SupabaseAdmin,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string

  // Find tenant by Stripe customer ID
  const { data: tenant, error: findError } = await supabaseAdmin
    .from('tenants')
    .select('id, subscription_status')
    .eq('stripe_customer_id', customerId)
    .single()

  if (findError || !tenant) {
    console.error('Tenant not found for customer:', customerId)
    return
  }

  // If status was past_due or paused, reactivate
  if (tenant.subscription_status !== 'active') {
    const { error: updateError } = await supabaseAdmin
      .from('tenants')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', tenant.id)

    if (updateError) {
      console.error('Failed to reactivate subscription:', updateError)
      throw updateError
    }

    console.log(`Subscription reactivated for tenant ${tenant.id}`)
  }
}
