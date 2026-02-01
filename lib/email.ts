import nodemailer from 'nodemailer'

// =============================================================================
// EMAIL CONFIGURATION
// =============================================================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// =============================================================================
// EMAIL TYPES
// =============================================================================

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SendInvitationEmailOptions {
  to: string
  inviterName: string
  tenantName: string
  role: 'staff' | 'viewer'
  inviteUrl: string
}

// =============================================================================
// EMAIL FUNCTIONS
// =============================================================================

/**
 * Send a generic email
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'StockZip <noreply@stockzip.app>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

/**
 * Send a team invitation email
 */
export async function sendInvitationEmail(options: SendInvitationEmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, inviterName, tenantName, role, inviteUrl } = options

  const roleDescription = role === 'staff'
    ? 'Staff members can create, edit, and manage inventory items.'
    : 'Viewers have read-only access to view inventory items and reports.'

  const fullInviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://stockzip.app'}${inviteUrl}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${tenantName} on StockZip</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">StockZip</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Simple Inventory Management</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 600;">You're Invited!</h2>

              <p style="margin: 0 0 24px 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                <strong style="color: #18181b;">${inviterName}</strong> has invited you to join <strong style="color: #18181b;">${tenantName}</strong> on StockZip as a <strong style="color: #059669;">${role}</strong>.
              </p>

              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #71717a; font-size: 14px; line-height: 1.5;">
                  <strong style="color: #52525b;">About your role:</strong><br>
                  ${roleDescription}
                </p>
              </div>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 8px 0 24px 0;">
                    <a href="${fullInviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #71717a; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 24px 0; word-break: break-all;">
                <a href="${fullInviteUrl}" style="color: #059669; font-size: 14px;">${fullInviteUrl}</a>
              </p>

              <div style="border-top: 1px solid #e4e4e7; padding-top: 24px;">
                <p style="margin: 0; color: #a1a1aa; font-size: 13px; line-height: 1.5;">
                  This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px 0; color: #71717a; font-size: 13px;">
                &copy; ${new Date().getFullYear()} StockZip. All rights reserved.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                Simple inventory management for teams of all sizes.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  const text = `
You're Invited to Join ${tenantName} on StockZip!

${inviterName} has invited you to join ${tenantName} on StockZip as a ${role}.

About your role:
${roleDescription}

Accept your invitation by visiting:
${fullInviteUrl}

This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.

---
© ${new Date().getFullYear()} StockZip. All rights reserved.
`

  return sendEmail({
    to,
    subject: `You're invited to join ${tenantName} on StockZip`,
    html,
    text,
  })
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    await transporter.verify()
    return { success: true }
  } catch (error) {
    console.error('SMTP connection failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'SMTP connection failed' }
  }
}
