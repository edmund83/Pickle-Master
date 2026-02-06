'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/auth/server-auth'
import { z } from 'zod'

// ============================================
// Types
// ============================================

export interface Notification {
    id: string
    type: string
    title: string
    message: string | null
    entity_type: string | null
    entity_id: string | null
    entity_display_id: string | null
    action_url: string | null
    read: boolean
    created_at: string
}

export interface NotificationPreferences {
    id: string
    user_id: string
    tenant_id: string
    // Email preferences
    email_enabled: boolean
    email_po_submitted: boolean
    email_po_approved: boolean
    email_receive_completed: boolean
    email_pick_list_assigned: boolean
    email_stock_count_assigned: boolean
    email_low_stock_alert: boolean
    // Push notification preferences
    push_enabled: boolean
    push_po_submitted: boolean
    push_po_approved: boolean
    push_receive_completed: boolean
    push_pick_list_assigned: boolean
    push_stock_count_assigned: boolean
    push_low_stock_alert: boolean
    // In-app notification preferences
    inapp_enabled: boolean
    // Digest preferences
    digest_frequency: 'instant' | 'hourly' | 'daily' | 'weekly'
    created_at: string
    updated_at: string
}

export interface NotificationsResult {
    notifications: Notification[]
    unread_count: number
}

// ============================================
// Validation schemas
// ============================================

const notificationPreferencesSchema = z.object({
    email_enabled: z.boolean().optional(),
    email_po_submitted: z.boolean().optional(),
    email_po_approved: z.boolean().optional(),
    email_receive_completed: z.boolean().optional(),
    email_pick_list_assigned: z.boolean().optional(),
    email_stock_count_assigned: z.boolean().optional(),
    email_low_stock_alert: z.boolean().optional(),
    push_enabled: z.boolean().optional(),
    push_po_submitted: z.boolean().optional(),
    push_po_approved: z.boolean().optional(),
    push_receive_completed: z.boolean().optional(),
    push_pick_list_assigned: z.boolean().optional(),
    push_stock_count_assigned: z.boolean().optional(),
    push_low_stock_alert: z.boolean().optional(),
    inapp_enabled: z.boolean().optional(),
    digest_frequency: z.enum(['instant', 'hourly', 'daily', 'weekly']).optional(),
}).partial()

// ============================================
// Server Actions
// ============================================

/**
 * Get user's notifications with pagination
 */
export async function getNotifications(
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
): Promise<{ success: boolean; data?: NotificationsResult; error?: string }> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }

    const supabase = await createClient()

     
    const cappedOffset = Math.min(Math.max(0, offset), 10_000)
    const { data, error } = await (supabase as any).rpc('get_user_notifications', {
        p_limit: Math.min(100, Math.max(1, limit)),
        p_offset: cappedOffset,
        p_unread_only: unreadOnly
    })

    if (error) {
        console.error('Get notifications error:', error)
        return { success: false, error: error.message }
    }

    return {
        success: true,
        data: data as NotificationsResult
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }

    const supabase = await createClient()

     
    const { data, error } = await (supabase as any).rpc('get_unread_notification_count')

    if (error) {
        console.error('Get unread count error:', error)
        return { success: false, error: error.message }
    }

    return { success: true, count: data as number }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(
    notificationIds: string[]
): Promise<{ success: boolean; error?: string }> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }

    // Validate notification IDs
    const idsValidation = z.array(z.string().uuid()).safeParse(notificationIds)
    if (!idsValidation.success) {
        return { success: false, error: 'Invalid notification IDs' }
    }

    const supabase = await createClient()

     
    const { error } = await (supabase as any).rpc('mark_notifications_read', {
        p_notification_ids: notificationIds
    })

    if (error) {
        console.error('Mark notifications read error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/notifications')
    return { success: true }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean; error?: string }> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const supabase = await createClient()

     
    const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', context.userId)
        .eq('read', false)

    if (error) {
        console.error('Mark all notifications read error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/notifications')
    return { success: true }
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(): Promise<{
    success: boolean
    data?: NotificationPreferences
    error?: string
}> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const supabase = await createClient()

     
    const { data, error } = await (supabase as any)
        .from('notification_preferences')
        .select('*')
        .eq('user_id', context.userId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Get notification preferences error:', error)
        return { success: false, error: error.message }
    }

    // If no preferences exist, return defaults
    if (!data) {
        return {
            success: true,
            data: {
                id: '',
                user_id: context.userId,
                tenant_id: context.tenantId,
                email_enabled: true,
                email_po_submitted: true,
                email_po_approved: true,
                email_receive_completed: true,
                email_pick_list_assigned: true,
                email_stock_count_assigned: true,
                email_low_stock_alert: true,
                push_enabled: true,
                push_po_submitted: true,
                push_po_approved: true,
                push_receive_completed: true,
                push_pick_list_assigned: true,
                push_stock_count_assigned: true,
                push_low_stock_alert: true,
                inapp_enabled: true,
                digest_frequency: 'instant',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as NotificationPreferences
        }
    }

    return { success: true, data: data as NotificationPreferences }
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
    preferences: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'tenant_id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // Validate input
    const validation = notificationPreferencesSchema.safeParse(preferences)
    if (!validation.success) {
        return { success: false, error: 'Invalid preferences' }
    }
    const validatedPrefs = validation.data

    const supabase = await createClient()

    // Check if preferences exist
     
    const { data: existing } = await (supabase as any)
        .from('notification_preferences')
        .select('id')
        .eq('user_id', context.userId)
        .single()

    if (existing) {
        // Update existing preferences
         
        const { error } = await (supabase as any)
            .from('notification_preferences')
            .update({
                ...validatedPrefs,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', context.userId)

        if (error) {
            console.error('Update notification preferences error:', error)
            return { success: false, error: error.message }
        }
    } else {
        // Insert new preferences
         
        const { error } = await (supabase as any)
            .from('notification_preferences')
            .insert({
                user_id: context.userId,
                tenant_id: context.tenantId,
                ...validatedPrefs
            })

        if (error) {
            console.error('Insert notification preferences error:', error)
            return { success: false, error: error.message }
        }
    }

    revalidatePath('/settings/notifications')
    return { success: true }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // Validate notification ID
    const idValidation = z.string().uuid().safeParse(notificationId)
    if (!idValidation.success) {
        return { success: false, error: 'Invalid notification ID' }
    }

    const supabase = await createClient()

     
    const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', context.userId)

    if (error) {
        console.error('Delete notification error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/notifications')
    return { success: true }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(): Promise<{ success: boolean; error?: string }> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const supabase = await createClient()

     
    const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('user_id', context.userId)

    if (error) {
        console.error('Clear all notifications error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/notifications')
    return { success: true }
}
