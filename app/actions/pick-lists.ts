'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PickListResult = {
    success: boolean
    error?: string
    pick_list_id?: string
    display_id?: string
}

export interface CreatePickListInput {
    name?: string
    pick_list_number?: string | null
    assigned_to?: string | null
    due_date?: string | null
    notes?: string | null
    ship_to_name?: string | null
    ship_to_address1?: string | null
    ship_to_address2?: string | null
    ship_to_city?: string | null
    ship_to_state?: string | null
    ship_to_postal_code?: string | null
    ship_to_country?: string | null
    items: Array<{ item_id: string; requested_quantity: number }>
}

// Generate display ID using RPC (concurrency-safe)
// Format: PL-{ORG_CODE}-{5-digit-number} e.g., PL-ACM01-00001
async function generateDisplayId(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('generate_display_id_for_current_user', {
        p_entity_type: 'pick_list'
    })

    if (error) {
        console.error('Generate display_id error:', error)
        throw new Error('Failed to generate display ID')
    }

    return data
}

export async function createPickList(input: CreatePickListInput): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('create_pick_list_with_items', {
        p_name: input.name,
        p_assigned_to: input.assigned_to || null,
        p_due_date: input.due_date || null,
        p_item_outcome: 'decrement',  // Pick Lists always decrement stock
        p_notes: input.notes || null,
        p_ship_to_name: input.ship_to_name || null,
        p_ship_to_address1: input.ship_to_address1 || null,
        p_ship_to_address2: input.ship_to_address2 || null,
        p_ship_to_city: input.ship_to_city || null,
        p_ship_to_state: input.ship_to_state || null,
        p_ship_to_postal_code: input.ship_to_postal_code || null,
        p_ship_to_country: input.ship_to_country || null,
        p_items: input.items  // Pass array directly, Supabase handles JSONB conversion
    })

    if (error) {
        console.error('Create pick list error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to create pick list' }
    }

    revalidatePath('/tasks/pick-lists')
    return { success: true, pick_list_id: data?.pick_list_id, display_id: data?.display_id }
}

// Create a draft pick list with minimal data (for quick-create flow)
// Uses RPC to generate display_id in format PL-{ORG_CODE}-{5-digit-number}
export async function createDraftPickList(): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Use the new RPC function for atomic creation with display_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('create_pick_list_v2', {
        p_name: null, // Will default to display_id
        p_assigned_to: null,
        p_due_date: null,
        p_notes: null,
        p_item_outcome: 'decrement',
        p_ship_to_name: null,
        p_ship_to_address1: null,
        p_ship_to_address2: null,
        p_ship_to_city: null,
        p_ship_to_state: null,
        p_ship_to_postal_code: null,
        p_ship_to_country: null,
        p_items: []
    })

    if (error) {
        console.error('Create draft pick list error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to create pick list' }
    }

    revalidatePath('/tasks/pick-lists')
    return { success: true, pick_list_id: data?.pick_list_id, display_id: data?.display_id }
}

export async function updatePickList(
    pickListId: string,
    updates: Partial<Omit<CreatePickListInput, 'items'>> & { pick_list_number?: string | null }
): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Exclude display_id from updates - it is immutable once set
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { display_id, ...safeUpdates } = updates as Record<string, unknown>

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_lists')
        .update({
            ...safeUpdates,
            updated_at: new Date().toISOString()
        })
        .eq('id', pickListId)

    if (error) {
        console.error('Update pick list error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/pick-lists')
    revalidatePath(`/tasks/pick-lists/${pickListId}`)
    return { success: true }
}

export async function deletePickList(pickListId: string): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_lists')
        .delete()
        .eq('id', pickListId)

    if (error) {
        console.error('Delete pick list error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/pick-lists')
    return { success: true }
}

export async function addPickListItem(
    pickListId: string,
    itemId: string,
    requestedQuantity: number
): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_list_items')
        .insert({
            pick_list_id: pickListId,
            item_id: itemId,
            requested_quantity: requestedQuantity
        })

    if (error) {
        console.error('Add pick list item error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/pick-lists/${pickListId}`)
    return { success: true }
}

export async function removePickListItem(pickListItemId: string): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Get pick list id for revalidation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item } = await (supabase as any)
        .from('pick_list_items')
        .select('pick_list_id')
        .eq('id', pickListItemId)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_list_items')
        .delete()
        .eq('id', pickListItemId)

    if (error) {
        console.error('Remove pick list item error:', error)
        return { success: false, error: error.message }
    }

    if (item?.pick_list_id) {
        revalidatePath(`/tasks/pick-lists/${item.pick_list_id}`)
    }
    return { success: true }
}

export async function updatePickListItem(
    pickListItemId: string,
    requestedQuantity: number
): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Get pick list id for revalidation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item } = await (supabase as any)
        .from('pick_list_items')
        .select('pick_list_id')
        .eq('id', pickListItemId)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_list_items')
        .update({ requested_quantity: requestedQuantity })
        .eq('id', pickListItemId)

    if (error) {
        console.error('Update pick list item error:', error)
        return { success: false, error: error.message }
    }

    if (item?.pick_list_id) {
        revalidatePath(`/tasks/pick-lists/${item.pick_list_id}`)
    }
    return { success: true }
}

export async function pickItem(
    pickListItemId: string,
    pickedQuantity: number
): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('pick_pick_list_item', {
        p_pick_list_item_id: pickListItemId,
        p_picked_quantity: pickedQuantity
    })

    if (error) {
        console.error('Pick item error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to pick item' }
    }

    revalidatePath('/tasks/pick-lists')
    return { success: true }
}

export async function completePickList(pickListId: string): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('complete_pick_list', {
        p_pick_list_id: pickListId
    })

    if (error) {
        console.error('Complete pick list error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to complete pick list' }
    }

    revalidatePath('/tasks/pick-lists')
    revalidatePath(`/tasks/pick-lists/${pickListId}`)
    return { success: true }
}

export async function startPickList(pickListId: string): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_lists')
        .update({ status: 'in_progress' })
        .eq('id', pickListId)

    if (error) {
        console.error('Start pick list error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/pick-lists')
    revalidatePath(`/tasks/pick-lists/${pickListId}`)
    return { success: true }
}

export async function cancelPickList(pickListId: string): Promise<PickListResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_lists')
        .update({ status: 'cancelled' })
        .eq('id', pickListId)

    if (error) {
        console.error('Cancel pick list error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/pick-lists')
    revalidatePath(`/tasks/pick-lists/${pickListId}`)
    return { success: true }
}

export async function getTeamMembers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Get user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

    // Get team members
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, email')
        .eq('tenant_id', profile.tenant_id)
        .order('full_name')

    return data || []
}

export async function searchInventoryItems(query: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Get user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

    // Search items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryBuilder = (supabase as any)
        .from('inventory_items')
        .select('id, name, sku, quantity, image_urls, unit')
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)
        .gt('quantity', 0)
        .order('name')
        .limit(20)

    if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
    }

    const { data } = await queryBuilder

    return data || []
}
