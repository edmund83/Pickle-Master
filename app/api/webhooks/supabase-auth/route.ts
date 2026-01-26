import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import * as crypto from 'crypto'
import { sendAdminNewUserNotification } from '@/app/actions/email'

// Supabase Auth Hook payload types
interface AuthHookUser {
  id: string
  email?: string
  phone?: string
  created_at: string
  raw_user_meta_data?: {
    full_name?: string
    company_name?: string
    plan?: string
    avatar_url?: string
  }
}

interface AuthHookPayload {
  type: string
  table: string
  record: AuthHookUser
  schema: string
  old_record?: AuthHookUser | null
}

/**
 * Verify webhook signature from Supabase
 * Supabase sends a signature in the format: sha256=<hash>
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(`sha256=${expectedSignature}`),
    Buffer.from(signature)
  )
}

export async function POST(req: Request) {
  const webhookSecret = process.env.SUPABASE_AUTH_WEBHOOK_SECRET

  // If no webhook secret configured, log and accept (for testing)
  if (!webhookSecret) {
    console.warn('⚠️ SUPABASE_AUTH_WEBHOOK_SECRET not configured - skipping signature verification')
  }

  const body = await req.text()
  const headersList = await headers()

  // Verify signature if secret is configured
  if (webhookSecret) {
    const signature = headersList.get('x-supabase-signature') ||
      headersList.get('x-webhook-signature') ||
      headersList.get('authorization')?.replace('Bearer ', '')

    if (!signature) {
      console.error('Missing webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    try {
      const isValid = verifySignature(body, signature, webhookSecret)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    } catch (err) {
      console.error('Signature verification failed:', err)
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 })
    }
  }

  let payload: AuthHookPayload

  try {
    payload = JSON.parse(body)
  } catch (err) {
    console.error('Invalid JSON payload:', err)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  try {
    // Handle different event types
    // Supabase Database Webhooks send 'INSERT', 'UPDATE', 'DELETE'
    // Auth Hooks may send different event names
    const eventType = payload.type?.toUpperCase() || ''

    if (eventType === 'INSERT' && payload.table === 'users') {
      // New user signup
      const user = payload.record

      if (user.email) {
        const metadata = user.raw_user_meta_data || {}

        await sendAdminNewUserNotification(
          user.email,
          metadata.full_name || null,
          metadata.company_name || null,
          metadata.plan || null
        )

        console.log(`📧 Admin notified of new signup: ${user.email}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    // Return 200 to prevent retries for non-critical errors
    return NextResponse.json({ received: true, warning: 'Handler error but acknowledged' })
  }
}
