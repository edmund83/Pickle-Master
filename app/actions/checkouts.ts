'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    getAuthContext,
    requireWritePermission,
    verifyTenantOwnership,
    verifyRelatedTenantOwnership,
    validateInput,
    quantitySchema,
    optionalStringSchema,
    optionalDateStringSchema,
} from '@/lib/auth/server-auth'
import { z } from 'zod'

export type CheckoutResult = {
    success: boolean
    error?: string
}

// Validation schemas
const checkoutItemSchema = z.object({
    itemId: z.string().uuid(),
    quantity: quantitySchema,
    assigneeName: z.string().min(1).max(255),
    notes: z.string().max(2000).optional(),
    dueDate: optionalDateStringSchema,
})

const returnConditionSchema = z.enum(['good', 'damaged', 'needs_repair', 'lost'])

const returnItemSchema = z.object({
    checkoutId: z.string().uuid(),
    notes: z.string().max(2000).optional(),
    condition: returnConditionSchema,
})

const assigneeTypeSchema = z.enum(['person', 'job', 'location'])

const serialReturnSchema = z.object({
    serial_id: z.string().uuid(),
    condition: returnConditionSchema,
})

export async function checkoutItem(
    itemId: string,
    quantity: number,
    assigneeName: string,
    notes?: string,
    dueDate?: string
): Promise<CheckoutResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(checkoutItemSchema, { itemId, quantity, assigneeName, notes, dueDate })
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    // 4. Verify item belongs to user's tenant
    const itemCheck = await verifyRelatedTenantOwnership(
        'inventory_items',
        validatedInput.itemId,
        context.tenantId,
        'Inventory item'
    )
    if (!itemCheck.success) return { success: false, error: itemCheck.error }

    const supabase = await createClient()

    // 5. Get current item to check stock (with tenant filter)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', validatedInput.itemId)
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)
        .single()

    if (fetchError || !item) return { success: false, error: 'Item not found' }

    if (item.quantity < validatedInput.quantity) {
        return { success: false, error: `Insufficient stock. Available: ${item.quantity}` }
    }

    // 6. Create Checkout Record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: checkoutError } = await (supabase as any)
        .from('checkouts')
        .insert({
            tenant_id: context.tenantId,
            item_id: validatedInput.itemId,
            quantity: validatedInput.quantity,
            assignee_type: 'person',
            assignee_name: validatedInput.assigneeName,
            status: 'checked_out',
            checked_out_at: new Date().toISOString(),
            checked_out_by: context.userId,
            due_date: validatedInput.dueDate || null,
            notes: validatedInput.notes || null
        })

    if (checkoutError) return { success: false, error: checkoutError.message }

    // 7. Decrement Inventory
    const newQuantity = item.quantity - validatedInput.quantity
    let status = item.status
    if (newQuantity <= 0) status = 'out_of_stock'
    else if (item.min_quantity && newQuantity <= item.min_quantity) status = 'low_stock'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from('inventory_items')
        .update({
            quantity: newQuantity,
            status: status,
            updated_at: new Date().toISOString(),
            last_modified_by: context.userId
        })
        .eq('id', validatedInput.itemId)
        .eq('tenant_id', context.tenantId)

    if (updateError) {
        console.error('Failed to update inventory after checkout:', updateError)
        // Note: Checkout record was created but inventory update failed
        // In production, this should be a transaction
    }

    // 8. Log Activity (awaited for reliability)
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'checkout',
            entity_type: 'item',
            entity_id: validatedInput.itemId,
            entity_name: item.name,
            quantity_before: item.quantity,
            quantity_after: newQuantity,
            quantity_delta: -validatedInput.quantity,
            changes: { assignee: validatedInput.assigneeName, notes: validatedInput.notes }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath(`/inventory/${validatedInput.itemId}`)
    return { success: true }
}

export async function returnItem(
    checkoutId: string,
    notes?: string,
    condition: 'good' | 'damaged' | 'needs_repair' | 'lost' = 'good'
): Promise<CheckoutResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(returnItemSchema, { checkoutId, notes, condition })
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    const supabase = await createClient()

    // 4. Get Checkout Record with tenant verification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: checkout, error: fetchError } = await (supabase as any)
        .from('checkouts')
        .select('*, inventory_items(name, quantity, min_quantity, status)')
        .eq('id', validatedInput.checkoutId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (fetchError || !checkout) return { success: false, error: 'Checkout not found' }
    if (checkout.status === 'returned') return { success: false, error: 'Already returned' }

    // 5. Update Checkout Record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from('checkouts')
        .update({
            status: 'returned',
            returned_at: new Date().toISOString(),
            returned_by: context.userId,
            return_condition: validatedInput.condition,
            return_notes: validatedInput.notes || null
        })
        .eq('id', validatedInput.checkoutId)
        .eq('tenant_id', context.tenantId)

    if (updateError) return { success: false, error: updateError.message }

    // 6. Increment Inventory (unless lost)
    let quantityDelta = 0
    if (validatedInput.condition !== 'lost') {
        quantityDelta = checkout.quantity
        const item = checkout.inventory_items
        const newQuantity = (item.quantity || 0) + quantityDelta

        let status = 'in_stock'
        if (newQuantity <= 0) status = 'out_of_stock'
        else if (item.min_quantity && newQuantity <= item.min_quantity) status = 'low_stock'

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: invUpdateError } = await (supabase as any)
            .from('inventory_items')
            .update({
                quantity: newQuantity,
                status: status,
                updated_at: new Date().toISOString(),
                last_modified_by: context.userId
            })
            .eq('id', checkout.item_id)
            .eq('tenant_id', context.tenantId)

        if (invUpdateError) {
            console.error('Failed to update inventory after return:', invUpdateError)
        }
    }

    // 7. Log Activity (awaited for reliability)
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'check_in',
            entity_type: 'item',
            entity_id: checkout.item_id,
            entity_name: checkout.inventory_items?.name || 'Item',
            quantity_delta: quantityDelta,
            changes: { checkout_id: validatedInput.checkoutId, condition: validatedInput.condition, notes: validatedInput.notes }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath(`/inventory/${checkout.item_id}`)
    return { success: true }
}

/**
 * Checkout with specific serial numbers (for serialized items)
 * Uses the checkout_with_serials RPC function
 */
export async function checkoutWithSerials(
    itemId: string,
    serialIds: string[],
    assigneeType: 'person' | 'job' | 'location',
    assigneeId?: string,
    assigneeName?: string,
    dueDate?: string,
    notes?: string
): Promise<CheckoutResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const inputSchema = z.object({
        itemId: z.string().uuid(),
        serialIds: z.array(z.string().uuid()).min(1, 'No serial numbers selected').max(1000),
        assigneeType: assigneeTypeSchema,
        assigneeId: z.string().uuid().optional(),
        assigneeName: z.string().max(255).optional(),
        dueDate: optionalDateStringSchema,
        notes: z.string().max(2000).optional(),
    })

    const validation = validateInput(inputSchema, { itemId, serialIds, assigneeType, assigneeId, assigneeName, dueDate, notes })
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    // 4. Verify item belongs to user's tenant
    const itemCheck = await verifyRelatedTenantOwnership(
        'inventory_items',
        validatedInput.itemId,
        context.tenantId,
        'Inventory item'
    )
    if (!itemCheck.success) return { success: false, error: itemCheck.error }

    const supabase = await createClient()

    // 5. Verify all serial IDs belong to the item and tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: serials, error: serialFetchError } = await (supabase as any)
        .from('item_serials')
        .select('id, item_id')
        .in('id', validatedInput.serialIds)
        .eq('item_id', validatedInput.itemId)

    if (serialFetchError) {
        return { success: false, error: 'Failed to verify serial numbers' }
    }

    if (!serials || serials.length !== validatedInput.serialIds.length) {
        return { success: false, error: 'One or more serial numbers not found or do not belong to this item' }
    }

    // 6. Call the RPC function that handles everything atomically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('checkout_with_serials', {
        p_item_id: validatedInput.itemId,
        p_serial_ids: validatedInput.serialIds,
        p_assignee_type: validatedInput.assigneeType,
        p_assignee_id: validatedInput.assigneeId || null,
        p_assignee_name: validatedInput.assigneeName || null,
        p_due_date: validatedInput.dueDate || null,
        p_notes: validatedInput.notes || null
    })

    if (error) {
        console.error('Checkout with serials error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Checkout failed' }
    }

    revalidatePath(`/inventory/${validatedInput.itemId}`)
    return { success: true }
}

/**
 * Return checkout with per-serial conditions (for serialized items)
 * Uses the return_checkout_serials RPC function
 */
export async function returnCheckoutSerials(
    checkoutId: string,
    serialReturns: Array<{ serial_id: string; condition: 'good' | 'damaged' | 'needs_repair' | 'lost' }>,
    notes?: string
): Promise<CheckoutResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const inputSchema = z.object({
        checkoutId: z.string().uuid(),
        serialReturns: z.array(serialReturnSchema).min(1).max(1000),
        notes: z.string().max(2000).optional(),
    })

    const validation = validateInput(inputSchema, { checkoutId, serialReturns, notes })
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    const supabase = await createClient()

    // 4. Verify checkout belongs to user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: checkout, error: fetchError } = await (supabase as any)
        .from('checkouts')
        .select('item_id, tenant_id')
        .eq('id', validatedInput.checkoutId)
        .single()

    if (fetchError || !checkout) {
        return { success: false, error: 'Checkout not found' }
    }

    if (checkout.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    // 5. Call the RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('return_checkout_serials', {
        p_checkout_id: validatedInput.checkoutId,
        p_serial_returns: JSON.stringify(validatedInput.serialReturns),
        p_notes: validatedInput.notes || null
    })

    if (error) {
        console.error('Return checkout serials error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Return failed' }
    }

    if (checkout?.item_id) {
        revalidatePath(`/inventory/${checkout.item_id}`)
    }
    return { success: true }
}

/**
 * Get serials linked to a checkout (for return modal)
 */
export async function getCheckoutSerials(checkoutId: string) {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error, serials: [] }
    const { context } = authResult

    // 2. Validate checkoutId
    const idValidation = z.string().uuid().safeParse(checkoutId)
    if (!idValidation.success) {
        return { success: false, error: 'Invalid checkout ID', serials: [] }
    }

    const supabase = await createClient()

    // 3. Verify checkout belongs to user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: checkout, error: fetchError } = await (supabase as any)
        .from('checkouts')
        .select('tenant_id')
        .eq('id', checkoutId)
        .single()

    if (fetchError || !checkout) {
        return { success: false, error: 'Checkout not found', serials: [] }
    }

    if (checkout.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied', serials: [] }
    }

    // 4. Get serials
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('get_checkout_serials', {
        p_checkout_id: checkoutId
    })

    if (error) {
        console.error('Get checkout serials error:', error)
        return { success: false, error: error.message, serials: [] }
    }

    return { success: true, serials: data || [] }
}
