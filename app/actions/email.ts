'use server'

import { resend } from '@/lib/resend'

export type EmailResult = {
    success: boolean
    error?: string
}

export async function sendLowStockAlert(
    email: string,
    itemName: string,
    currentQuantity: number,
    minQuantity: number,
    unit: string = 'units'
): Promise<EmailResult> {
    if (!resend) {
        console.warn('⚠️ Email skipped: RESEND_API_KEY not found in environment variables.')
        return { success: false, error: 'Configuration missing' }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Nook Master <onboarding@resend.dev>', // Should be configured in env, but defaulting for ease
            to: [email],
            subject: `⚠️ Low Stock Alert: ${itemName}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #d97706;">Low Stock Alert</h1>
                    <p>The following item has fallen below its minimum stock level:</p>
                    
                    <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; border: 1px solid #fcd34d; margin: 20px 0;">
                        <h2 style="margin-top: 0; color: #92400e;">${itemName}</h2>
                        <p style="font-size: 16px;">
                            Current Quantity: <strong>${currentQuantity} ${unit}</strong>
                            <br/>
                            Minimum Required: <strong>${minQuantity} ${unit}</strong>
                        </p>
                    </div>

                    <p>Please restock this item as soon as possible to avoid running out.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                    <p style="font-size: 12px; color: #6b7280;">
                        Sent automatically by Nook Master Inventory System.
                    </p>
                </div>
            `
        })

        if (error) {
            console.error('Resend Error:', error)
            return { success: false, error: error.message }
        }

        console.log(`📧 Email sent to ${email} for item ${itemName}`)
        return { success: true }
    } catch (err) {
        console.error('Email Exception:', err)
        return { success: false, error: 'Failed to send email' }
    }
}
