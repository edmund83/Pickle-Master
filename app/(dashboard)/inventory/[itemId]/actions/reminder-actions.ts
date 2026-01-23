'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthContext, requireWritePermission } from '@/lib/auth/server-auth'
import type {
  ItemReminderWithDetails,
  CreateReminderInput,
  ReminderStatus,
  Profile,
} from '@/types/database.types'

interface RPCResponse {
  success: boolean
  error?: string
  reminder_id?: string
  new_status?: string
}

/**
 * Get all reminders for an item
 */
export async function getItemReminders(
  itemId: string
): Promise<ItemReminderWithDetails[]> {
  const authResult = await getAuthContext()
  if (!authResult.success) return []

  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('get_item_reminders', {
    p_item_id: itemId,
  })

  if (error) {
    console.error('Error fetching item reminders:', error)
    return []
  }

  return (data || []) as ItemReminderWithDetails[]
}

/**
 * Create a new reminder for an item
 */
export async function createItemReminder(
  input: CreateReminderInput
): Promise<{ success: boolean; error?: string; reminderId?: string }> {
  const authResult = await getAuthContext()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { context } = authResult
  const permResult = requireWritePermission(context)
  if (!permResult.success) return { success: false, error: permResult.error }

  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('create_item_reminder', {
    p_item_id: input.itemId,
    p_reminder_type: input.reminderType,
    p_title: input.title || null,
    p_message: input.message || null,
    p_threshold: input.threshold || null,
    p_days_before_expiry: input.daysBeforeExpiry || null,
    p_scheduled_at: input.scheduledAt || null,
    p_recurrence: input.recurrence || 'once',
    p_recurrence_end_date: input.recurrenceEndDate || null,
    p_notify_in_app: input.notifyInApp ?? true,
    p_notify_email: input.notifyEmail ?? false,
    p_notify_user_ids: input.notifyUserIds || null,
    p_comparison_operator: input.comparisonOperator || 'lte',
  })

  if (error) {
    console.error('Error creating reminder:', error)
    return { success: false, error: error.message }
  }

  const result = data as RPCResponse

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath(`/inventory/${input.itemId}`)
  return { success: true, reminderId: result.reminder_id }
}

/**
 * Update an existing reminder
 */
export async function updateItemReminder(
  reminderId: string,
  itemId: string,
  updates: {
    title?: string
    message?: string
    threshold?: number
    daysBeforeExpiry?: number
    scheduledAt?: string
    recurrence?: string
    recurrenceEndDate?: string
    notifyInApp?: boolean
    notifyEmail?: boolean
    status?: ReminderStatus
  }
): Promise<{ success: boolean; error?: string }> {
  const authResult = await getAuthContext()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { context } = authResult
  const permResult = requireWritePermission(context)
  if (!permResult.success) return { success: false, error: permResult.error }

  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('update_item_reminder', {
    p_reminder_id: reminderId,
    p_title: updates.title,
    p_message: updates.message,
    p_threshold: updates.threshold,
    p_days_before_expiry: updates.daysBeforeExpiry,
    p_scheduled_at: updates.scheduledAt,
    p_recurrence: updates.recurrence,
    p_recurrence_end_date: updates.recurrenceEndDate,
    p_notify_in_app: updates.notifyInApp,
    p_notify_email: updates.notifyEmail,
    p_status: updates.status,
  })

  if (error) {
    console.error('Error updating reminder:', error)
    return { success: false, error: error.message }
  }

  const result = data as RPCResponse

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath(`/inventory/${itemId}`)
  return { success: true }
}

/**
 * Delete a reminder
 */
export async function deleteItemReminder(
  reminderId: string,
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  const authResult = await getAuthContext()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { context } = authResult
  const permResult = requireWritePermission(context)
  if (!permResult.success) return { success: false, error: permResult.error }

  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('delete_item_reminder', {
    p_reminder_id: reminderId,
  })

  if (error) {
    console.error('Error deleting reminder:', error)
    return { success: false, error: error.message }
  }

  const result = data as RPCResponse

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath(`/inventory/${itemId}`)
  return { success: true }
}

/**
 * Toggle reminder status (active/paused)
 */
export async function toggleReminderStatus(
  reminderId: string,
  itemId: string
): Promise<{ success: boolean; error?: string; newStatus?: string }> {
  const authResult = await getAuthContext()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { context } = authResult
  const permResult = requireWritePermission(context)
  if (!permResult.success) return { success: false, error: permResult.error }

  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('toggle_reminder_status', {
    p_reminder_id: reminderId,
  })

  if (error) {
    console.error('Error toggling reminder status:', error)
    return { success: false, error: error.message }
  }

  const result = data as RPCResponse

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath(`/inventory/${itemId}`)
  return { success: true, newStatus: result.new_status }
}

/**
 * Get team members for the current user's tenant
 */
export async function getTeamMembers(): Promise<Profile[]> {
  const authResult = await getAuthContext()
  if (!authResult.success) return []
  const { context } = authResult

  const supabase = await createClient()

  // Get all team members in the tenant
   
  const { data: members, error } = await (supabase as any)
    .from('profiles')
    .select('id, email, full_name, role, avatar_url')
    .eq('tenant_id', context.tenantId)
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return (members || []) as Profile[]
}
