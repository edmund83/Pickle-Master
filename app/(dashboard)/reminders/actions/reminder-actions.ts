'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  ReminderType,
  ComparisonOperator,
  Profile,
} from '@/types/database.types'

interface RPCResponse {
  success: boolean
  error?: string
  reminder_id?: string
  new_status?: string
  created?: number
  skipped?: number
}

export interface GlobalReminder {
  id: string
  source_type: 'item' | 'folder'
  item_id: string | null
  folder_id: string | null
  item_name: string | null
  folder_name: string | null
  reminder_type: ReminderType
  title: string | null
  message: string | null
  threshold: number | null
  comparison_operator: ComparisonOperator | null
  days_before_expiry: number | null
  scheduled_at: string | null
  recurrence: string
  recurrence_end_date: string | null
  notify_in_app: boolean
  notify_email: boolean
  notify_user_ids: string[] | null
  status: string
  last_triggered_at: string | null
  next_trigger_at: string | null
  trigger_count: number
  created_at: string
  created_by: string
  created_by_name: string | null
  trigger_description: string
}

export interface ReminderStats {
  total: number
  active: number
  paused: number
  by_type: {
    low_stock: number
    expiry: number
    restock: number
  }
}

export interface GetAllRemindersResult {
  reminders: GlobalReminder[]
  total: number
}

/**
 * Get all reminders (both item and folder) for the tenant
 */
export async function getAllReminders(
  type?: string,
  status?: string,
  limit: number = 50,
  offset: number = 0
): Promise<GetAllRemindersResult> {
  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('get_all_reminders', {
    p_type: type || null,
    p_status: status || null,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    console.error('Error fetching all reminders:', error)
    return { reminders: [], total: 0 }
  }

  return data as GetAllRemindersResult
}

/**
 * Get reminder stats for the sidebar badge
 */
export async function getReminderStats(): Promise<ReminderStats> {
  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('get_reminder_stats')

  if (error) {
    console.error('Error fetching reminder stats:', error)
    return {
      total: 0,
      active: 0,
      paused: 0,
      by_type: { low_stock: 0, expiry: 0, restock: 0 },
    }
  }

  return data as ReminderStats
}

/**
 * Create a folder reminder
 */
export async function createFolderReminder(input: {
  folderId: string
  reminderType: ReminderType
  title?: string
  message?: string
  threshold?: number
  daysBeforeExpiry?: number
  scheduledAt?: string
  recurrence?: string
  recurrenceEndDate?: string
  notifyInApp?: boolean
  notifyEmail?: boolean
  notifyUserIds?: string[]
  comparisonOperator?: ComparisonOperator
}): Promise<{ success: boolean; error?: string; reminderId?: string }> {
  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('create_folder_reminder', {
    p_folder_id: input.folderId,
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
    console.error('Error creating folder reminder:', error)
    return { success: false, error: error.message }
  }

  const result = data as RPCResponse

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath('/reminders')
  return { success: true, reminderId: result.reminder_id }
}

/**
 * Create bulk item reminders
 */
export async function createBulkItemReminders(input: {
  itemIds: string[]
  reminderType: ReminderType
  title?: string
  message?: string
  threshold?: number
  daysBeforeExpiry?: number
  scheduledAt?: string
  recurrence?: string
  recurrenceEndDate?: string
  notifyInApp?: boolean
  notifyEmail?: boolean
  notifyUserIds?: string[]
  comparisonOperator?: ComparisonOperator
}): Promise<{ success: boolean; error?: string; created?: number; skipped?: number }> {
  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('create_bulk_item_reminders', {
    p_item_ids: input.itemIds,
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
    console.error('Error creating bulk item reminders:', error)
    return { success: false, error: error.message }
  }

  const result = data as RPCResponse

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath('/reminders')
  return { success: true, created: result.created, skipped: result.skipped }
}

/**
 * Delete a reminder (item or folder)
 */
export async function deleteReminder(
  reminderId: string,
  sourceType: 'item' | 'folder'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('delete_reminder', {
    p_reminder_id: reminderId,
    p_source_type: sourceType,
  })

  if (error) {
    console.error('Error deleting reminder:', error)
    return { success: false, error: error.message }
  }

  const result = data as RPCResponse

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath('/reminders')
  return { success: true }
}

/**
 * Update a reminder (item or folder)
 */
export async function updateReminder(
  reminderId: string,
  sourceType: 'item' | 'folder',
  updates: {
    title?: string
    message?: string
    threshold?: number
    comparisonOperator?: ComparisonOperator
    daysBeforeExpiry?: number
    scheduledAt?: string
    recurrence?: string
    recurrenceEndDate?: string
    notifyInApp?: boolean
    notifyEmail?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('update_reminder', {
    p_reminder_id: reminderId,
    p_source_type: sourceType,
    p_title: updates.title || null,
    p_message: updates.message || null,
    p_threshold: updates.threshold || null,
    p_comparison_operator: updates.comparisonOperator || null,
    p_days_before_expiry: updates.daysBeforeExpiry || null,
    p_scheduled_at: updates.scheduledAt || null,
    p_recurrence: updates.recurrence || null,
    p_recurrence_end_date: updates.recurrenceEndDate || null,
    p_notify_in_app: updates.notifyInApp ?? null,
    p_notify_email: updates.notifyEmail ?? null,
  })

  if (error) {
    console.error('Error updating reminder:', error)
    return { success: false, error: error.message }
  }

  const result = data as RPCResponse

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath('/reminders')
  return { success: true }
}

/**
 * Toggle reminder status (active/paused)
 */
export async function toggleReminder(
  reminderId: string,
  sourceType: 'item' | 'folder'
): Promise<{ success: boolean; error?: string; newStatus?: string }> {
  const supabase = await createClient()

   
  const { data, error } = await (supabase as any).rpc('toggle_reminder', {
    p_reminder_id: reminderId,
    p_source_type: sourceType,
  })

  if (error) {
    console.error('Error toggling reminder:', error)
    return { success: false, error: error.message }
  }

  const result = data as RPCResponse

  if (!result.success) {
    return { success: false, error: result.error }
  }

  revalidatePath('/reminders')
  return { success: true, newStatus: result.new_status }
}

/**
 * Get all items for the current tenant (for bulk selection)
 */
export async function getItemsForSelection(): Promise<
  { id: string; name: string; folder_id: string | null }[]
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

   
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

   
  const { data: items, error } = await (supabase as any)
    .from('inventory_items')
    .select('id, name, folder_id')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .order('name', { ascending: true })
    .limit(500)

  if (error) {
    console.error('Error fetching items for selection:', error)
    return []
  }

  return items || []
}

/**
 * Get all folders for the current tenant (for selection)
 */
export async function getFoldersForSelection(): Promise<
  { id: string; name: string; parent_id: string | null; item_count: number }[]
> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

   
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // Get folders with item counts
   
  const { data: folders, error } = await (supabase as any)
    .from('folders')
    .select(`
      id,
      name,
      parent_id,
      inventory_items!inner(id)
    `)
    .eq('tenant_id', profile.tenant_id)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching folders for selection:', error)
    return []
  }

  // Transform to include item count
  return (folders || []).map((f: { id: string; name: string; parent_id: string | null; inventory_items: { id: string }[] }) => ({
    id: f.id,
    name: f.name,
    parent_id: f.parent_id,
    item_count: f.inventory_items?.length || 0,
  }))
}

/**
 * Get team members for the current user's tenant
 */
export async function getTeamMembers(): Promise<Profile[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

   
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

   
  const { data: members, error } = await (supabase as any)
    .from('profiles')
    .select('id, email, full_name, role, avatar_url')
    .eq('tenant_id', profile.tenant_id)
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return (members || []) as Profile[]
}
