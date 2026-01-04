import { NextRequest, NextResponse } from 'next/server'
import { resend } from '@/lib/resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, itemName, pdfBase64 } = await request.json()

    if (!email || !itemName || !pdfBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!resend) {
      console.warn('Email skipped: RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 })
    }

    // Convert base64 to buffer for attachment
    const pdfBuffer = Buffer.from(pdfBase64, 'base64')

    const { data, error } = await resend.emails.send({
      from: 'StockZip <onboarding@resend.dev>',
      to: [email],
      subject: `Label for ${itemName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Your Label is Ready</h1>
          <p>The label for <strong>${itemName}</strong> is attached to this email as a PDF.</p>

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
          filename: `label-${itemName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
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
