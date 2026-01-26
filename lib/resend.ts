import nodemailer from 'nodemailer'

// SMTP Configuration from environment variables
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

const fromEmail = process.env.SMTP_FROM || 'StockZip <noreply@stockzip.com>'

// Check if SMTP is configured
const isConfigured = !!(smtpConfig.host && smtpConfig.auth.user && smtpConfig.auth.pass)

// Create transporter only if configured
const transporter = isConfigured ? nodemailer.createTransport(smtpConfig) : null

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export interface SendEmailResult {
  success: boolean
  error?: string
  messageId?: string
}

/**
 * Send an email using SMTP
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!transporter) {
    console.warn('⚠️ Email skipped: SMTP not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS)')
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: options.from || fromEmail,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log(`📧 Email sent: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('SMTP Error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send email'
    }
  }
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

export interface SendEmailWithAttachmentsOptions extends SendEmailOptions {
  attachments?: EmailAttachment[]
}

/**
 * Send an email with attachments using SMTP
 */
export async function sendEmailWithAttachments(options: SendEmailWithAttachmentsOptions): Promise<SendEmailResult> {
  if (!transporter) {
    console.warn('⚠️ Email skipped: SMTP not configured (missing SMTP_HOST, SMTP_USER, or SMTP_PASS)')
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: options.from || fromEmail,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    })

    console.log(`📧 Email sent: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('SMTP Error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to send email'
    }
  }
}

// Legacy export for backwards compatibility
// If any code still imports `resend`, this provides a compatible interface
interface LegacyAttachment {
  filename: string
  content: Buffer | string
}

export const resend = transporter ? {
  emails: {
    send: async (options: {
      from: string
      to: string[]
      subject: string
      html: string
      attachments?: LegacyAttachment[]
    }) => {
      const result = await sendEmailWithAttachments({
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      })
      if (!result.success) {
        return { data: null, error: { message: result.error } }
      }
      return { data: { id: result.messageId }, error: null }
    }
  }
} : null
