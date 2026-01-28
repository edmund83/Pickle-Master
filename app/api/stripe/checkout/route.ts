import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, requireOwnerPermission } from '@/lib/auth/server-auth'
import { getPriceId, type StripePlanId } from '@/lib/stripe/config'
import { isValidPlanId } from '@/lib/plans/config'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
  }

  try {
    // Parse the request body
    const body = await req.json()
    const { planId } = body as { planId?: string }

    if (!planId || !isValidPlanId(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    // Validate auth and permissions
    const authResult = await getAuthContext()
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    const permResult = requireOwnerPermission(authResult.context)
    if (!permResult.success) {
      return NextResponse.json({ error: permResult.error }, { status: 403 })
    }

    const supabase = await createClient()

    // Get tenant info
    const { data: tenant } = await (supabase as any)
      .from('tenants')
      .select('id, stripe_customer_id, name')
      .eq('id', authResult.context.tenantId)
      .single()

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Get user email
    const { data: { user } } = await supabase.auth.getUser()
    const customerEmail = user?.email

    const stripe = getStripe()
    const { origin } = new URL(req.url)
    const priceId = getPriceId(planId as StripePlanId)

    // If they already have a Stripe customer, use it
    let customerId = tenant.stripe_customer_id

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/settings/billing?success=true`,
      cancel_url: `${origin}/settings/billing?canceled=true`,
      client_reference_id: tenant.id,
      metadata: {
        tenant_id: tenant.id,
        plan_id: planId,
      },
    }

    // If existing customer, use their ID; otherwise pre-fill email
    if (customerId) {
      sessionParams.customer = customerId
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
