import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, requireOwnerPermission } from '@/lib/auth/server-auth'

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
    const authResult = await getAuthContext()
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    const permResult = requireOwnerPermission(authResult.context)
    if (!permResult.success) {
      return NextResponse.json({ error: permResult.error }, { status: 403 })
    }
    const supabase = await createClient()

    const { data: tenant } = await (supabase as any)
      .from('tenants')
      .select('stripe_customer_id')
      .eq('id', authResult.context.tenantId)
      .single()

    if (!tenant?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const stripe = getStripe()

    // Create portal session
    const { origin } = new URL(req.url)
    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${origin}/settings/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal session error:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
