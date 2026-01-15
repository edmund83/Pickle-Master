'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database.types'

// Types
export type ChatterEntityType = Database['public']['Enums']['chatter_entity_type']

export interface ChatterMessage {
    id: string
    content: string
    author_id: string
    author_name: string
    author_email: string
    author_avatar: string | null
    parent_id: string | null
    is_system_message: boolean
    created_at: string
    edited_at: string | null
    reply_count: number
    mentions: Array<{ user_id: string; user_name: string }>
}

export interface ChatterReply {
    id: string
    content: string
    author_id: string
    author_name: string
    author_email: string
    author_avatar: string | null
    parent_id: string
    is_system_message: boolean
    created_at: string
    edited_at: string | null
    mentions: Array<{ user_id: string; user_name: string }>
}

export interface ChatterFollower {
    user_id: string
    user_name: string
    user_email: string
    user_avatar: string | null
    notify_email: boolean
    notify_in_app: boolean
    notify_push: boolean
    followed_at: string
}

export interface TeamMember {
    user_id: string
    user_name: string
    user_email: string
    user_avatar: string | null
}

export type ActionResult<T> = {
    success: boolean
    data?: T
    error?: string
}

// Get messages for an entity
export async function getEntityMessages(
    entityType: ChatterEntityType,
    entityId: string,
    limit = 50,
    offset = 0
): Promise<ActionResult<ChatterMessage[]>> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_entity_messages', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_limit: limit,
        p_offset: offset
    })

    if (error) {
        console.error('Error fetching messages:', error)
        return { success: false, error: error.message }
    }

    // Transform the data to match our interface
    const messages: ChatterMessage[] = (data || []).map((m: {
        id: string
        content: string
        author_id: string
        author_name: string
        author_email: string
        author_avatar: string | null
        parent_id: string | null
        is_system_message: boolean
        created_at: string
        edited_at: string | null
        reply_count: number
        mentions: Array<{ user_id: string; user_name: string }> | null
    }) => ({
        id: m.id,
        content: m.content,
        author_id: m.author_id,
        author_name: m.author_name,
        author_email: m.author_email,
        author_avatar: m.author_avatar,
        parent_id: m.parent_id,
        is_system_message: m.is_system_message,
        created_at: m.created_at,
        edited_at: m.edited_at,
        reply_count: Number(m.reply_count),
        mentions: m.mentions || []
    }))

    return { success: true, data: messages }
}

// Get replies for a message
export async function getMessageReplies(
    messageId: string,
    limit = 50
): Promise<ActionResult<ChatterReply[]>> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_message_replies', {
        p_message_id: messageId,
        p_limit: limit
    })

    if (error) {
        console.error('Error fetching replies:', error)
        return { success: false, error: error.message }
    }

    const replies: ChatterReply[] = (data || []).map((m: {
        id: string
        content: string
        author_id: string
        author_name: string
        author_email: string
        author_avatar: string | null
        parent_id: string | null
        is_system_message: boolean
        created_at: string
        edited_at: string | null
        mentions: Array<{ user_id: string; user_name: string }> | null
    }) => ({
        id: m.id,
        content: m.content,
        author_id: m.author_id,
        author_name: m.author_name,
        author_email: m.author_email,
        author_avatar: m.author_avatar,
        parent_id: m.parent_id || '',
        is_system_message: m.is_system_message,
        created_at: m.created_at,
        edited_at: m.edited_at,
        mentions: m.mentions || []
    }))

    return { success: true, data: replies }
}

// Post a new message
export async function postMessage(
    entityType: ChatterEntityType,
    entityId: string,
    content: string,
    parentId?: string,
    mentionedUserIds?: string[]
): Promise<ActionResult<string>> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('post_chatter_message', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_content: content,
        p_parent_id: parentId || null,
        p_mentioned_user_ids: mentionedUserIds || []
    })

    if (error) {
        console.error('Error posting message:', error)
        return { success: false, error: error.message }
    }

    // Trigger notification dispatch (async, fire-and-forget)
    dispatchChatterNotifications(entityType, entityId, data, mentionedUserIds || [])
        .catch(err => console.error('Notification dispatch error:', err))

    // Revalidate the entity page
    revalidatePath(getEntityPath(entityType, entityId))

    return { success: true, data }
}

// Edit a message
export async function editMessage(
    messageId: string,
    content: string
): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('chatter_messages')
        .update({
            content,
            edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('author_id', user.id) // Ensure user owns the message

    if (error) {
        console.error('Error editing message:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Delete (soft) a message
export async function deleteMessage(
    messageId: string
): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('chatter_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('author_id', user.id) // Ensure user owns the message

    if (error) {
        console.error('Error deleting message:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Get followers for an entity
export async function getEntityFollowers(
    entityType: ChatterEntityType,
    entityId: string
): Promise<ActionResult<ChatterFollower[]>> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_entity_followers', {
        p_entity_type: entityType,
        p_entity_id: entityId
    })

    if (error) {
        console.error('Error fetching followers:', error)
        return { success: false, error: error.message }
    }

    const followers: ChatterFollower[] = (data || []).map((f: {
        user_id: string
        user_name: string
        user_email: string
        user_avatar: string | null
        notify_email: boolean
        notify_in_app: boolean
        notify_push: boolean
        followed_at: string
    }) => ({
        user_id: f.user_id,
        user_name: f.user_name,
        user_email: f.user_email,
        user_avatar: f.user_avatar,
        notify_email: f.notify_email,
        notify_in_app: f.notify_in_app,
        notify_push: f.notify_push,
        followed_at: f.followed_at
    }))

    return { success: true, data: followers }
}

// Follow an entity
export async function followEntity(
    entityType: ChatterEntityType,
    entityId: string,
    notifyEmail = true,
    notifyInApp = true,
    notifyPush = false
): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Get tenant_id from profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) {
        return { success: false, error: 'Profile not found' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('entity_followers')
        .upsert({
            tenant_id: profile.tenant_id,
            entity_type: entityType,
            entity_id: entityId,
            user_id: user.id,
            notify_email: notifyEmail,
            notify_in_app: notifyInApp,
            notify_push: notifyPush
        }, {
            onConflict: 'entity_type,entity_id,user_id'
        })

    if (error) {
        console.error('Error following entity:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Unfollow an entity
export async function unfollowEntity(
    entityType: ChatterEntityType,
    entityId: string
): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('entity_followers')
        .delete()
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error unfollowing entity:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Check if current user follows an entity
export async function isFollowingEntity(
    entityType: ChatterEntityType,
    entityId: string
): Promise<boolean> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('is_following_entity', {
        p_entity_type: entityType,
        p_entity_id: entityId
    })

    if (error) {
        console.error('Error checking follow status:', error)
        return false
    }

    return data === true
}

// Update follow preferences
export async function updateFollowPreferences(
    entityType: ChatterEntityType,
    entityId: string,
    preferences: {
        notify_email?: boolean
        notify_in_app?: boolean
        notify_push?: boolean
    }
): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('entity_followers')
        .update(preferences)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating follow preferences:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

// Get team members for @mention autocomplete
export async function getTeamMembersForMention(
    searchQuery?: string
): Promise<ActionResult<TeamMember[]>> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_team_members_for_mention', {
        p_search_query: searchQuery || null,
        p_limit: 10
    })

    if (error) {
        console.error('Error fetching team members:', error)
        return { success: false, error: error.message }
    }

    const members: TeamMember[] = (data || []).map((m: {
        user_id: string
        user_name: string
        user_email: string
        user_avatar: string | null
    }) => ({
        user_id: m.user_id,
        user_name: m.user_name,
        user_email: m.user_email,
        user_avatar: m.user_avatar
    }))

    return { success: true, data: members }
}

// Get unread mention count
export async function getUnreadMentionsCount(): Promise<number> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_unread_mentions_count')

    if (error) {
        console.error('Error fetching unread mentions count:', error)
        return 0
    }

    return Number(data) || 0
}

// Mark mentions as read
export async function markMentionsRead(
    messageIds: string[]
): Promise<ActionResult<number>> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('mark_mentions_read', {
        p_message_ids: messageIds
    })

    if (error) {
        console.error('Error marking mentions as read:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data: Number(data) || 0 }
}

// Helper to get entity path for revalidation
function getEntityPath(entityType: ChatterEntityType, entityId: string): string {
    const paths: Record<ChatterEntityType, string> = {
        item: `/inventory/${entityId}`,
        checkout: `/tasks/checkouts/${entityId}`,
        stock_count: `/tasks/stock-count/${entityId}`,
        purchase_order: `/tasks/purchase-orders/${entityId}`,
        pick_list: `/tasks/pick-lists/${entityId}`,
        receive: `/tasks/receives/${entityId}`,
        customer: `/settings/customers/${entityId}`,
        sales_order: `/tasks/sales-orders/${entityId}`,
        delivery_order: `/tasks/delivery-orders/${entityId}`,
        invoice: `/tasks/invoices/${entityId}`
    }
    return paths[entityType]
}

// Get entity name for notifications
async function getEntityName(
    supabase: Awaited<ReturnType<typeof createClient>>,
    entityType: ChatterEntityType,
    entityId: string
): Promise<string> {
    const tableMap: Record<ChatterEntityType, string> = {
        item: 'inventory_items',
        checkout: 'checkouts',
        stock_count: 'stock_counts',
        purchase_order: 'purchase_orders',
        pick_list: 'pick_lists',
        receive: 'receives',
        customer: 'customers',
        sales_order: 'sales_orders',
        delivery_order: 'delivery_orders',
        invoice: 'invoices'
    }

    const nameFieldMap: Record<ChatterEntityType, string> = {
        item: 'name',
        checkout: 'display_id',
        stock_count: 'display_id',
        purchase_order: 'display_id',
        pick_list: 'display_id',
        receive: 'display_id',
        customer: 'name',
        sales_order: 'display_id',
        delivery_order: 'display_id',
        invoice: 'display_id'
    }

    const table = tableMap[entityType]
    const nameField = nameFieldMap[entityType]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from(table)
        .select(nameField)
        .eq('id', entityId)
        .single()

    return data?.[nameField] || entityType
}

// Dispatch notifications for chatter messages
async function dispatchChatterNotifications(
    entityType: ChatterEntityType,
    entityId: string,
    messageId: string,
    mentionedUserIds: string[]
): Promise<void> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Get author info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('full_name, email, tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return

    const authorName = profile.full_name || profile.email || 'Someone'
    const entityName = await getEntityName(supabase, entityType, entityId)

    // Get all followers except the author
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: followers } = await (supabase as any)
        .from('entity_followers')
        .select('user_id, notify_email, notify_in_app')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .neq('user_id', user.id)

    if (!followers?.length && !mentionedUserIds.length) return

    // Create in-app notifications for followers who opted in
    interface FollowerRow {
        user_id: string
        notify_email: boolean
        notify_in_app: boolean
    }
    const followerNotifications = ((followers || []) as FollowerRow[])
        .filter((f: FollowerRow) => f.notify_in_app)
        .map((f: FollowerRow) => ({
            tenant_id: profile.tenant_id,
            user_id: f.user_id,
            title: `${authorName} commented`,
            message: `New comment on ${entityName}`,
            notification_type: 'chatter',
            notification_subtype: 'message',
            entity_type: entityType,
            entity_id: entityId,
            is_read: false
        }))

    // Create notifications for mentioned users (higher priority)
    const mentionNotifications = mentionedUserIds
        .filter(id => id !== user.id) // Don't notify self
        .map(userId => ({
            tenant_id: profile.tenant_id,
            user_id: userId,
            title: `${authorName} mentioned you`,
            message: `You were mentioned in a comment on ${entityName}`,
            notification_type: 'chatter',
            notification_subtype: 'mention',
            entity_type: entityType,
            entity_id: entityId,
            is_read: false
        }))

    // Combine and deduplicate (mentions take priority)
    const mentionedSet = new Set(mentionedUserIds)
    const filteredFollowerNotifs = followerNotifications.filter(
        (n: { user_id: string }) => !mentionedSet.has(n.user_id)
    )

    const allNotifications = [...mentionNotifications, ...filteredFollowerNotifs]

    if (allNotifications.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('notifications')
            .insert(allNotifications)

        if (error) {
            console.error('Error creating chatter notifications:', error)
        }
    }

    // TODO: Send email notifications for those who opted in
    // This would use the existing email infrastructure (Resend)
}
