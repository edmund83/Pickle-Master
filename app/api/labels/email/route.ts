import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { getAuthContext, requireWritePermission } from '@/lib/auth/server-auth'
import { checkRateLimit, RATE_LIMITED_OPERATIONS } from '@/lib/rate-limit'
import { escapeHtml } from '@/lib/utils'

const MAX_PDF_BYTES = 5 * 1024 * 1024 // 5MB
const MAX_ITEM_NAME_LENGTH = 120
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthContext()
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    const permResult = requireWritePermission(authResult.context)
    if (!permResult.success) {
      return NextResponse.json({ error: permResult.error }, { status: 403 })
    }

    const rateLimitResult = await checkRateLimit(RATE_LIMITED_OPERATIONS.EXPORT)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const { email, itemName, pdfBase64 } = await request.json()

    if (!email || !itemName || !pdfBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const trimmedName = String(itemName).trim()
    if (!trimmedName || trimmedName.length > MAX_ITEM_NAME_LENGTH) {
      return NextResponse.json({ error: 'Invalid item name' }, { status: 400 })
    }

    const estimatedBytes = Math.floor((pdfBase64.length * 3) / 4)
    if (estimatedBytes > MAX_PDF_BYTES) {
      return NextResponse.json({ error: 'Attachment too large' }, { status: 413 })
    }

    if (!resend) {
      console.warn('Email skipped: RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
    }

    // Convert base64 to buffer for attachment
    const pdfBuffer = Buffer.from(pdfBase64, 'base64')
    if (pdfBuffer.length === 0 || pdfBuffer.length > MAX_PDF_BYTES) {
      return NextResponse.json({ error: 'Invalid attachment' }, { status: 400 })
    }

    const safeFileName = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'label'

    // Escape user input to prevent XSS in email
    const safeItemName = escapeHtml(trimmedName)

    const { data, error } = await resend.emails.send({
      from: 'StockZip <onboarding@resend.dev>',
      to: [email],
      subject: `Label for ${safeItemName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Your Label is Ready</h1>
          <p>The label for <strong>${safeItemName}</strong> is attached to this email as a PDF.</p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #86efac; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #166534;">Printing Tips</h2>
            <ul style="color: #166534; padding-left: 20px;">
              <li>Use the correct Avery label sheet for best results</li>
              <li>Set your printer to "Actual Size" (not "Fit to Page")</li>
              <li>Do a test print on regular paper first to check alignment</li>
            </ul>
          </div>

          <p>Happy organizing!</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="font-size: 12px; color: #6b7280;">
            Sent by StockZip Inventory System.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `label-${safeFileName}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    if (error) {
      console.error('Resend Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`📧 Label email sent to ${email} for item ${itemName}`)
    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (err) {
    console.error('Email Exception:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
