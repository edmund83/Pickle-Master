'use server'

import { resend } from '@/lib/resend'
import { getAuthContext, requireWritePermission } from '@/lib/auth/server-auth'
import { escapeHtml } from '@/lib/utils'

export type EmailResult = {
    success: boolean
    error?: string
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function sendLowStockAlert(
    email: string,
    itemName: string,
    currentQuantity: number,
    minQuantity: number,
    unit: string = 'units'
): Promise<EmailResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    if (!resend) {
        console.warn('⚠️ Email skipped: SMTP not configured')
        return { success: false, error: 'SMTP not configured' }
    }

    try {
        // Escape user input to prevent XSS in email
        const safeItemName = escapeHtml(itemName)
        const safeUnit = escapeHtml(unit)

        const { data, error } = await resend.emails.send({
            from: process.env.SMTP_FROM || 'StockZip <noreply@stockzip.com>',
            to: [email],
            subject: `⚠️ Low Stock Alert: ${safeItemName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #d97706;">Low Stock Alert</h1>
                    <p>The following item has fallen below its minimum stock level:</p>

                    <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; border: 1px solid #fcd34d; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #92400e;">${safeItemName}</h2>
                        <p style="font-size: 16px;">
                            Current Quantity: <strong>${currentQuantity} ${safeUnit}</strong>
                            <br/>
                            Minimum Required: <strong>${minQuantity} ${safeUnit}</strong>
                        </p>
                    </div>

                    <p>Please restock this item as soon as possible to avoid running out.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                    <p style="font-size: 12px; color: #6b7280;">
                        Sent automatically by StockZip Inventory System.
                    </p>
                </div>
            `
        })

        if (error) {
            console.error('SMTP Error:', error)
            return { success: false, error: error.message }
        }

        console.log(`📧 Email sent to ${email} for item ${itemName}`)
        return { success: true }
    } catch (err) {
        console.error('Email Exception:', err)
        return { success: false, error: 'Failed to send email' }
    }
}

/**
 * Send admin notification for new user signup
 * Called from auth webhook - no auth context required
 */
export async function sendAdminNewUserNotification(
    userEmail: string,
    fullName: string | null,
    companyName: string | null,
    plan: string | null
): Promise<EmailResult> {
    if (!resend) {
        console.warn('⚠️ Admin email skipped: SMTP not configured')
        return { success: false, error: 'SMTP not configured' }
    }

    if (!ADMIN_EMAIL) {
        console.warn('⚠️ Admin email skipped: ADMIN_EMAIL not configured')
        return { success: false, error: 'ADMIN_EMAIL not configured' }
    }

    try {
        const safeEmail = escapeHtml(userEmail)
        const safeName = fullName ? escapeHtml(fullName) : 'Not provided'
        const safeCompany = companyName ? escapeHtml(companyName) : 'Not provided'
        const safePlan = plan ? escapeHtml(plan) : 'Free'

        const { error } = await resend.emails.send({
            from: process.env.SMTP_FROM || 'StockZip <noreply@stockzip.com>',
            to: [ADMIN_EMAIL],
            subject: `🎉 New User Signup: ${safeEmail}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #10b981;">New User Signed Up!</h1>
                    <p>A new user has registered on StockZip:</p>

                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #86efac; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; width: 120px;">Email:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${safeEmail}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Name:</td>
                                <td style="padding: 8px 0;">${safeName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Company:</td>
                                <td style="padding: 8px 0;">${safeCompany}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Plan:</td>
                                <td style="padding: 8px 0;">${safePlan}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Signed up:</td>
                                <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
                            </tr>
                        </table>
                    </div>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                    <p style="font-size: 12px; color: #6b7280;">
                        StockZip Admin Notification
                    </p>
                </div>
            `
        })

        if (error) {
            console.error('Admin signup notification error:', error)
            return { success: false, error: error.message }
        }

        console.log(`📧 Admin notified of new signup: ${userEmail}`)
        return { success: true }
    } catch (err) {
        console.error('Admin signup notification exception:', err)
        return { success: false, error: 'Failed to send admin notification' }
    }
}

/**
 * Send admin notification for bug report submission
 * Called from bug report action - no additional auth check needed (already verified)
 */
export async function sendAdminBugReportNotification(
    reportId: string,
    category: string,
    subject: string,
    description: string,
    userEmail: string,
    pageUrl: string | null
): Promise<EmailResult> {
    if (!resend) {
        console.warn('⚠️ Admin email skipped: SMTP not configured')
        return { success: false, error: 'SMTP not configured' }
    }

    if (!ADMIN_EMAIL) {
        console.warn('⚠️ Admin email skipped: ADMIN_EMAIL not configured')
        return { success: false, error: 'ADMIN_EMAIL not configured' }
    }

    try {
        const safeSubject = escapeHtml(subject)
        const safeDescription = escapeHtml(description).replace(/\n/g, '<br/>')
        const safeCategory = escapeHtml(category)
        const safeEmail = escapeHtml(userEmail)
        const safePageUrl = pageUrl ? escapeHtml(pageUrl) : 'Not provided'

        const categoryColors: Record<string, string> = {
            bug: '#ef4444',
            feature_request: '#8b5cf6',
            performance: '#f59e0b',
            ui_ux: '#3b82f6',
            data: '#10b981',
            other: '#6b7280',
        }
        const categoryColor = categoryColors[category] || '#6b7280'

        const { error } = await resend.emails.send({
            from: process.env.SMTP_FROM || 'StockZip <noreply@stockzip.com>',
            to: [ADMIN_EMAIL],
            subject: `🐛 Bug Report: ${safeSubject}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #ef4444;">New Bug Report</h1>
                    <p>A user has submitted a bug report:</p>

                    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0;">
                        <div style="margin-bottom: 16px;">
                            <span style="background-color: ${categoryColor}; color: white; padding: 4px 12px; border-radius: 999px; font-size: 12px; text-transform: uppercase;">
                                ${safeCategory.replace('_', ' ')}
                            </span>
                        </div>

                        <h2 style="margin-top: 0; color: #991b1b;">${safeSubject}</h2>

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280; width: 100px;">Report ID:</td>
                                <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${reportId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">From:</td>
                                <td style="padding: 8px 0;">${safeEmail}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Page:</td>
                                <td style="padding: 8px 0; font-size: 12px;">${safePageUrl}</td>
                            </tr>
                        </table>

                        <div style="background-color: white; padding: 16px; border-radius: 4px; border: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #374151; line-height: 1.6;">${safeDescription}</p>
                        </div>
                    </div>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                    <p style="font-size: 12px; color: #6b7280;">
                        StockZip Admin Notification
                    </p>
                </div>
            `
        })

        if (error) {
            console.error('Admin bug report notification error:', error)
            return { success: false, error: error.message }
        }

        console.log(`📧 Admin notified of bug report: ${reportId}`)
        return { success: true }
    } catch (err) {
        console.error('Admin bug report notification exception:', err)
        return { success: false, error: 'Failed to send admin notification' }
    }
}

/**
 * Send payment failed notification to tenant contact.
 * Called from Stripe webhook - no auth context required.
 */
export async function sendPaymentFailedEmail(
    to: string,
    tenantName: string | null,
    billingUrl?: string | null
): Promise<EmailResult> {
    if (!resend) {
        console.warn('⚠️ Payment failed email skipped: Resend not configured')
        return { success: false, error: 'Email not configured' }
    }

    try {
        const safeName = tenantName ? escapeHtml(tenantName) : 'your account'
        const billingLink = billingUrl && billingUrl.trim()
            ? `<p><a href="${escapeHtml(billingUrl.trim())}" style="color: #2563eb; font-weight: 600;">Update payment method</a></p>`
            : '<p>Please update your payment method in <strong>Settings → Billing</strong> to avoid service interruption.</p>'

        const { error } = await resend.emails.send({
            from: process.env.SMTP_FROM || 'StockZip <noreply@stockzip.com>',
            to: [to],
            subject: 'Action required: payment failed for your StockZip subscription',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #dc2626;">Payment Failed</h1>
                    <p>We were unable to process the payment for <strong>${safeName}</strong>.</p>

                    <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border: 1px solid #fecaca; margin: 20px 0;">
                        <p style="margin: 0;">Please update your payment method so we can retry the charge. Stripe will automatically retry failed payments.</p>
                    </div>

                    ${billingLink}

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                    <p style="font-size: 12px; color: #6b7280;">
                        Sent automatically by StockZip. If you have questions, contact support.
                    </p>
                </div>
            `
        })

        if (error) {
            console.error('Payment failed email error:', error)
            return { success: false, error: error.message }
        }

        console.log(`📧 Payment failed email sent to ${to} for tenant ${tenantName ?? 'unknown'}`)
        return { success: true }
    } catch (err) {
        console.error('Payment failed email exception:', err)
        return { success: false, error: 'Failed to send payment failed email' }
    }
}

/**
 * Send chatter notification email (mention or new comment).
 * Called from chatter action - no auth context required for the send itself.
 */
export async function sendChatterNotificationEmail(
    to: string,
    subject: string,
    body: string,
    activityUrl: string
): Promise<EmailResult> {
    if (!resend) {
        return { success: false, error: 'Email not configured' }
    }

    try {
        const safeSubject = escapeHtml(subject)
        const safeBody = escapeHtml(body).replace(/\n/g, '<br/>')
        const safeUrl = activityUrl.trim()

        const { error } = await resend.emails.send({
            from: process.env.SMTP_FROM || 'StockZip <noreply@stockzip.com>',
            to: [to],
            subject: safeSubject,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <p>${safeBody}</p>
                    <p><a href="${safeUrl}" style="color: #2563eb; font-weight: 600;">View in StockZip</a></p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                    <p style="font-size: 12px; color: #6b7280;">Sent by StockZip</p>
                </div>
            `
        })

        if (error) {
            console.error('Chatter email error:', error)
            return { success: false, error: error.message }
        }
        return { success: true }
    } catch (err) {
        console.error('Chatter email exception:', err)
        return { success: false, error: 'Failed to send chatter email' }
    }
}
