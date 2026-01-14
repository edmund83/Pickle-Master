'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    getAuthContext,
    requireWritePermission,
    requireAdminPermission,
    verifyTenantOwnership,
    verifyRelatedTenantOwnership,
    validateInput,
    optionalStringSchema,
    optionalUuidSchema,
    quantitySchema,
    optionalDateStringSchema,
    pickListStatusSchema,
} from '@/lib/auth/server-auth'
import { z } from 'zod'

export type PickListResult = {
    success: boolean
    error?: string
    pick_list_id?: string
    display_id?: string
}

// Validation schemas
const pickListItemSchema = z.object({
    item_id: z.string().uuid(),
    requested_quantity: quantitySchema,
})

const createPickListSchema = z.object({
    name: optionalStringSchema,
    pick_list_number: optionalStringSchema,
    assigned_to: optionalUuidSchema,
    due_date: optionalDateStringSchema,
    notes: z.string().max(2000).nullable().optional(),
    ship_to_name: optionalStringSchema,
    ship_to_address1: optionalStringSchema,
    ship_to_address2: optionalStringSchema,
    ship_to_city: optionalStringSchema,
    ship_to_state: optionalStringSchema,
    ship_to_postal_code: optionalStringSchema,
    ship_to_country: optionalStringSchema,
    items: z.array(pickListItemSchema),
})

const updatePickListSchema = z.object({
    name: optionalStringSchema,
    pick_list_number: optionalStringSchema,
    assigned_to: optionalUuidSchema,
    due_date: optionalDateStringSchema,
    notes: z.string().max(2000).nullable().optional(),
    ship_to_name: optionalStringSchema,
    ship_to_address1: optionalStringSchema,
    ship_to_address2: optionalStringSchema,
    ship_to_city: optionalStringSchema,
    ship_to_state: optionalStringSchema,
    ship_to_postal_code: optionalStringSchema,
    ship_to_country: optionalStringSchema,
}).partial()

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
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(createPickListSchema, input)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    // 4. If assigned_to is provided, verify it's a valid team member in the tenant
    if (validatedInput.assigned_to) {
        const assigneeCheck = await verifyRelatedTenantOwnership(
            'profiles',
            validatedInput.assigned_to,
            context.tenantId,
            'Team member'
        )
        if (!assigneeCheck.success) return { success: false, error: assigneeCheck.error }
    }

    // 5. Verify all item_ids belong to the tenant
    for (const item of validatedInput.items) {
        const itemCheck = await verifyRelatedTenantOwnership(
            'inventory_items',
            item.item_id,
            context.tenantId,
            'Inventory item'
        )
        if (!itemCheck.success) return { success: false, error: itemCheck.error }
    }

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('create_pick_list_with_items', {
        p_name: validatedInput.name,
        p_assigned_to: validatedInput.assigned_to || null,
        p_due_date: validatedInput.due_date || null,
        p_item_outcome: 'decrement',  // Pick Lists always decrement stock
        p_notes: validatedInput.notes || null,
        p_ship_to_name: validatedInput.ship_to_name || null,
        p_ship_to_address1: validatedInput.ship_to_address1 || null,
        p_ship_to_address2: validatedInput.ship_to_address2 || null,
        p_ship_to_city: validatedInput.ship_to_city || null,
        p_ship_to_state: validatedInput.ship_to_state || null,
        p_ship_to_postal_code: validatedInput.ship_to_postal_code || null,
        p_ship_to_country: validatedInput.ship_to_country || null,
        p_items: validatedInput.items
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
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

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
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(updatePickListSchema, updates)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedUpdates = validation.data

    // 4. Verify pick list belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('pick_lists', pickListId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    // 5. If assigned_to is provided, verify it's a valid team member in the tenant
    if (validatedUpdates.assigned_to) {
        const assigneeCheck = await verifyRelatedTenantOwnership(
            'profiles',
            validatedUpdates.assigned_to,
            context.tenantId,
            'Team member'
        )
        if (!assigneeCheck.success) return { success: false, error: assigneeCheck.error }
    }

    const supabase = await createClient()

    // Exclude display_id from updates - it is immutable once set
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { display_id, ...safeUpdates } = validatedUpdates as Record<string, unknown>

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_lists')
        .update({
            ...safeUpdates,
            updated_at: new Date().toISOString()
        })
        .eq('id', pickListId)
        .eq('tenant_id', context.tenantId) // Double-check tenant

    if (error) {
        console.error('Update pick list error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/pick-lists')
    revalidatePath(`/tasks/pick-lists/${pickListId}`)
    return { success: true }
}

export async function deletePickList(pickListId: string): Promise<PickListResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check admin permission for delete operations
    const permResult = requireAdminPermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Verify pick list belongs to user's tenant and check status
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: pickList, error: fetchError } = await (supabase as any)
        .from('pick_lists')
        .select('status, tenant_id')
        .eq('id', pickListId)
        .single()

    if (fetchError || !pickList) {
        return { success: false, error: 'Pick list not found' }
    }

    if (pickList.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    // Only allow deletion of draft or cancelled pick lists
    if (!['draft', 'cancelled'].includes(pickList.status)) {
        return { success: false, error: 'Only draft or cancelled pick lists can be deleted' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_lists')
        .delete()
        .eq('id', pickListId)
        .eq('tenant_id', context.tenantId) // Double-check tenant

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
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(pickListItemSchema, { item_id: itemId, requested_quantity: requestedQuantity })
    if (!validation.success) return { success: false, error: validation.error }

    // 4. Verify pick list belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('pick_lists', pickListId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    // 5. Verify item belongs to tenant
    const itemCheck = await verifyRelatedTenantOwnership(
        'inventory_items',
        itemId,
        context.tenantId,
        'Inventory item'
    )
    if (!itemCheck.success) return { success: false, error: itemCheck.error }

    const supabase = await createClient()

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
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // 3. Get pick list item and verify the parent pick list belongs to user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: plItem, error: fetchError } = await (supabase as any)
        .from('pick_list_items')
        .select('pick_list_id, pick_lists!inner(tenant_id)')
        .eq('id', pickListItemId)
        .single()

    if (fetchError || !plItem) {
        return { success: false, error: 'Pick list item not found' }
    }

    if (plItem.pick_lists?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_list_items')
        .delete()
        .eq('id', pickListItemId)

    if (error) {
        console.error('Remove pick list item error:', error)
        return { success: false, error: error.message }
    }

    if (plItem?.pick_list_id) {
        revalidatePath(`/tasks/pick-lists/${plItem.pick_list_id}`)
    }
    return { success: true }
}

export async function updatePickListItem(
    pickListItemId: string,
    requestedQuantity: number
): Promise<PickListResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate quantity
    const qtyValidation = quantitySchema.safeParse(requestedQuantity)
    if (!qtyValidation.success) {
        return { success: false, error: 'Invalid quantity' }
    }

    const supabase = await createClient()

    // 4. Get pick list item and verify the parent pick list belongs to user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: plItem, error: fetchError } = await (supabase as any)
        .from('pick_list_items')
        .select('pick_list_id, pick_lists!inner(tenant_id)')
        .eq('id', pickListItemId)
        .single()

    if (fetchError || !plItem) {
        return { success: false, error: 'Pick list item not found' }
    }

    if (plItem.pick_lists?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_list_items')
        .update({ requested_quantity: requestedQuantity })
        .eq('id', pickListItemId)

    if (error) {
        console.error('Update pick list item error:', error)
        return { success: false, error: error.message }
    }

    if (plItem?.pick_list_id) {
        revalidatePath(`/tasks/pick-lists/${plItem.pick_list_id}`)
    }
    return { success: true }
}

export async function pickItem(
    pickListItemId: string,
    pickedQuantity: number
): Promise<PickListResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate quantity
    const qtyValidation = quantitySchema.safeParse(pickedQuantity)
    if (!qtyValidation.success) {
        return { success: false, error: 'Invalid quantity' }
    }

    const supabase = await createClient()

    // 4. Verify the pick list item belongs to user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: plItem, error: fetchError } = await (supabase as any)
        .from('pick_list_items')
        .select('pick_list_id, pick_lists!inner(tenant_id)')
        .eq('id', pickListItemId)
        .single()

    if (fetchError || !plItem) {
        return { success: false, error: 'Pick list item not found' }
    }

    if (plItem.pick_lists?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

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
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Verify pick list belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('pick_lists', pickListId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

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
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Verify pick list belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('pick_lists', pickListId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_lists')
        .update({ status: 'in_progress' })
        .eq('id', pickListId)
        .eq('tenant_id', context.tenantId) // Double-check tenant

    if (error) {
        console.error('Start pick list error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/pick-lists')
    revalidatePath(`/tasks/pick-lists/${pickListId}`)
    return { success: true }
}

export async function cancelPickList(pickListId: string): Promise<PickListResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check admin permission for cancel operations
    const permResult = requireAdminPermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Verify pick list belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('pick_lists', pickListId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('pick_lists')
        .update({ status: 'cancelled' })
        .eq('id', pickListId)
        .eq('tenant_id', context.tenantId) // Double-check tenant

    if (error) {
        console.error('Cancel pick list error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/pick-lists')
    revalidatePath(`/tasks/pick-lists/${pickListId}`)
    return { success: true }
}

export async function getTeamMembers() {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return []
    const { context } = authResult

    const supabase = await createClient()

    // Get team members with tenant filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, email')
        .eq('tenant_id', context.tenantId)
        .order('full_name')

    return data || []
}

export async function searchInventoryItems(query: string) {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return []
    const { context } = authResult

    const supabase = await createClient()

    // Search items with tenant filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryBuilder = (supabase as any)
        .from('inventory_items')
        .select('id, name, sku, quantity, image_urls, unit')
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)
        .gt('quantity', 0)
        .order('name')
        .limit(20)

    if (query) {
        // Escape special characters in query to prevent SQL injection via ilike
        const escapedQuery = query.replace(/[%_]/g, '\\$&')
        queryBuilder = queryBuilder.or(`name.ilike.%${escapedQuery}%,sku.ilike.%${escapedQuery}%`)
    }

    const { data } = await queryBuilder

    return data || []
}
