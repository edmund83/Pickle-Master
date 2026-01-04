// Supabase Edge Function: Process Reminders
// This function processes scheduled (restock) and expiry reminders
// It should be invoked on a cron schedule (e.g., every 15 minutes)
//
// SECURITY: This function requires a secret key to invoke.
// Set CRON_SECRET in your Supabase Edge Function secrets.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

interface DueReminder {
  id: string
  tenant_id: string
  item_id: string
  item_name: string
  reminder_type: 'low_stock' | 'expiry' | 'restock'
  title: string | null
  message: string | null
  threshold: number | null
  days_before_expiry: number | null
  scheduled_at: string | null
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly'
  recurrence_end_date: string | null
  notify_in_app: boolean
  notify_email: boolean
  notify_user_ids: string[] | null
  created_by: string | null
  trigger_count: number
}

interface Lot {
  id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  quantity: number
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // SECURITY: Verify the request is from an authorized source (cron job)
    const cronSecret = Deno.env.get('CRON_SECRET')
    const providedSecret = req.headers.get('x-cron-secret')

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'Server misconfigured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!providedSecret || providedSecret !== cronSecret) {
      console.warn('Unauthorized access attempt to process-reminders')
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let processedCount = 0

    // 1. Process scheduled (restock) reminders
    const { data: dueReminders, error: dueError } = await supabase
      .rpc('get_due_reminders')

    if (dueError) {
      console.error('Error fetching due reminders:', dueError)
    } else if (dueReminders && dueReminders.length > 0) {
      for (const reminder of dueReminders as DueReminder[]) {
        await processScheduledReminder(supabase, reminder)
        processedCount++
      }
    }

    // 2. Process expiry reminders
    const { data: expiryReminders, error: expError } = await supabase
      .from('item_reminders')
      .select(`
        *,
        item:inventory_items(id, name, tenant_id)
      `)
      .eq('reminder_type', 'expiry')
      .eq('status', 'active')

    if (expError) {
      console.error('Error fetching expiry reminders:', expError)
    } else if (expiryReminders && expiryReminders.length > 0) {
      for (const reminder of expiryReminders) {
        const processed = await processExpiryReminder(supabase, reminder)
        if (processed) processedCount++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error processing reminders:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function processScheduledReminder(
  supabase: ReturnType<typeof createClient>,
  reminder: DueReminder
) {
  const userIds = reminder.notify_user_ids || (reminder.created_by ? [reminder.created_by] : [])

  const notificationTitle = reminder.title || `Restock Reminder: ${reminder.item_name}`
  const notificationMessage =
    reminder.message || `Time to restock ${reminder.item_name}`

  // Create in-app notifications
  if (reminder.notify_in_app && userIds.length > 0) {
    const notifications = userIds.map((userId) => ({
      tenant_id: reminder.tenant_id,
      user_id: userId,
      title: notificationTitle,
      message: notificationMessage,
      notification_type: 'reminder_restock',
      entity_type: 'item',
      entity_id: reminder.item_id,
    }))

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications)

    if (notifError) {
      console.error('Error creating notifications:', notifError)
    }
  }

  // Send email notifications
  if (reminder.notify_email && userIds.length > 0) {
    await sendEmailNotifications(supabase, userIds, {
      subject: notificationTitle,
      body: notificationMessage,
      itemId: reminder.item_id,
      itemName: reminder.item_name,
      reminderType: 'restock',
    })
  }

  // Update reminder status
  const { error: updateError } = await supabase
    .rpc('process_reminder_trigger', {
      p_reminder_id: reminder.id,
      p_mark_triggered: reminder.recurrence === 'once',
    })

  if (updateError) {
    console.error('Error updating reminder:', updateError)
  }
}

async function processExpiryReminder(
  supabase: ReturnType<typeof createClient>,
  reminder: {
    id: string
    days_before_expiry: number | null
    title: string | null
    message: string | null
    notify_in_app: boolean
    notify_email: boolean
    notify_user_ids: string[] | null
    created_by: string | null
    last_triggered_at: string | null
    trigger_count: number
    item: { id: string; name: string; tenant_id: string } | null
  }
): Promise<boolean> {
  if (!reminder.item) return false

  // Check if already triggered within the last 24 hours
  if (reminder.last_triggered_at) {
    const lastTriggered = new Date(reminder.last_triggered_at)
    const hoursSinceLastTrigger =
      (Date.now() - lastTriggered.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastTrigger < 24) {
      return false
    }
  }

  // Get lots with expiry dates for this item
  const { data: lots, error: lotsError } = await supabase
    .from('lots')
    .select('id, expiry_date, quantity, lot_number, batch_code')
    .eq('item_id', reminder.item.id)
    .eq('status', 'active')
    .gt('quantity', 0)
    .not('expiry_date', 'is', null)

  if (lotsError || !lots || lots.length === 0) {
    return false
  }

  const today = new Date()
  const daysThreshold = reminder.days_before_expiry || 7
  const triggerDate = new Date()
  triggerDate.setDate(today.getDate() + daysThreshold)

  // Find lots expiring within the threshold
  const expiringLots = (lots as Lot[]).filter((lot) => {
    if (!lot.expiry_date) return false
    const expiryDate = new Date(lot.expiry_date)
    return expiryDate <= triggerDate && expiryDate > today
  })

  if (expiringLots.length === 0) {
    return false
  }

  const userIds = reminder.notify_user_ids || (reminder.created_by ? [reminder.created_by] : [])

  // Create notifications for expiring lots
  for (const lot of expiringLots) {
    const expiryDate = new Date(lot.expiry_date!)
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    const notificationTitle =
      reminder.title || `Expiry Alert: ${reminder.item.name}`
    const notificationMessage =
      reminder.message ||
      `${reminder.item.name} (Lot: ${lot.lot_number || 'N/A'}) expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`

    if (reminder.notify_in_app && userIds.length > 0) {
      const notifications = userIds.map((userId) => ({
        tenant_id: reminder.item!.tenant_id,
        user_id: userId,
        title: notificationTitle,
        message: notificationMessage,
        notification_type: 'reminder_expiry',
        entity_type: 'item',
        entity_id: reminder.item!.id,
      }))

      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notifError) {
        console.error('Error creating expiry notifications:', notifError)
      }
    }

    if (reminder.notify_email && userIds.length > 0) {
      await sendEmailNotifications(supabase, userIds, {
        subject: notificationTitle,
        body: notificationMessage,
        itemId: reminder.item.id,
        itemName: reminder.item.name,
        reminderType: 'expiry',
        lotNumber: lot.lot_number,
        expiryDate: lot.expiry_date,
        daysUntilExpiry,
      })
    }
  }

  // Update last_triggered_at
  const { error: updateError } = await supabase
    .from('item_reminders')
    .update({
      last_triggered_at: new Date().toISOString(),
      trigger_count: (reminder.trigger_count || 0) + 1,
    })
    .eq('id', reminder.id)

  if (updateError) {
    console.error('Error updating expiry reminder:', updateError)
  }

  return true
}

async function sendEmailNotifications(
  supabase: ReturnType<typeof createClient>,
  userIds: string[],
  emailData: {
    subject: string
    body: string
    itemId: string
    itemName: string
    reminderType: 'restock' | 'expiry'
    lotNumber?: string | null
    expiryDate?: string | null
    daysUntilExpiry?: number
  }
) {
  // Get user emails
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('email')
    .in('id', userIds)

  if (profileError || !profiles || profiles.length === 0) {
    console.error('Error fetching user profiles for email:', profileError)
    return
  }

  const emails = profiles.map((p) => p.email).filter(Boolean)

  if (emails.length === 0) {
    return
  }

  // Check if Resend API key is available
  const resendApiKey = Deno.env.get('RESEND_API_KEY')

  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email notifications')
    return
  }

  // Send emails via Resend
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'StockZip Inventory <notifications@stockzip.app>',
        to: emails,
        subject: emailData.subject,
        html: generateEmailHtml(emailData),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error sending email via Resend:', errorText)
    }
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

function generateEmailHtml(emailData: {
  subject: string
  body: string
  itemId: string
  itemName: string
  reminderType: 'restock' | 'expiry'
  lotNumber?: string | null
  expiryDate?: string | null
  daysUntilExpiry?: number
}): string {
  const appUrl = Deno.env.get('APP_URL') || 'https://stockzip.app'
  const itemUrl = `${appUrl}/inventory/${emailData.itemId}`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">StockZip Inventory</h1>
      </div>

      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #111827; margin-top: 0;">${emailData.subject}</h2>

        <p style="color: #4b5563; font-size: 16px;">${emailData.body}</p>

        ${emailData.reminderType === 'expiry' && emailData.lotNumber ? `
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Lot Number:</strong> ${emailData.lotNumber}<br>
              ${emailData.expiryDate ? `<strong>Expiry Date:</strong> ${new Date(emailData.expiryDate).toLocaleDateString()}` : ''}
            </p>
          </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px;">
          <a href="${itemUrl}" style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Item
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          You're receiving this email because you set up a reminder in StockZip Inventory.
        </p>
      </div>
    </body>
    </html>
  `
}
