'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CheckoutResult = {
    success: boolean
    error?: string
}

export async function checkoutItem(
    itemId: string,
    quantity: number,
    assigneeName: string,
    notes?: string,
    dueDate?: string
): Promise<CheckoutResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // 1. Get current item to check stock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single()

    if (fetchError || !item) return { success: false, error: 'Item not found' }

    if (item.quantity < quantity) {
        return { success: false, error: `Insufficient stock. Available: ${item.quantity}` }
    }

    // 2. Create Checkout Record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: checkoutError } = await (supabase as any)
        .from('checkouts')
        .insert({
            tenant_id: item.tenant_id,
            item_id: itemId,
            quantity: quantity,
            assignee_type: 'person', // Default to person for simplicity
            assignee_name: assigneeName,
            status: 'checked_out',
            checked_out_at: new Date().toISOString(),
            checked_out_by: user.id,
            due_date: dueDate || null,
            notes: notes || null
        })

    if (checkoutError) return { success: false, error: checkoutError.message }

    // 3. Decrement Inventory (Assumption: Checkout removes from available stock)
    const newQuantity = item.quantity - quantity
    let status = item.status
    if (newQuantity <= 0) status = 'out_of_stock'
    else if (item.min_quantity && newQuantity <= item.min_quantity) status = 'low_stock'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from('inventory_items')
        .update({
            quantity: newQuantity,
            status: status,
            updated_at: new Date().toISOString(),
            last_modified_by: user.id
        })
        .eq('id', itemId)

    // 4. Log Activity (fire-and-forget, don't block on failure)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('activity_logs').insert({
        tenant_id: item.tenant_id,
        user_id: user.id,
        user_name: user.email,
        action_type: 'checkout',
        entity_type: 'item',
        entity_id: itemId,
        entity_name: item.name,
        quantity_before: item.quantity,
        quantity_after: newQuantity,
        quantity_delta: -quantity,
        changes: { assignee: assigneeName, notes: notes }
    }).then(({ error }: { error: Error | null }) => {
        if (error) console.error('Activity log error:', error.message)
    })

    revalidatePath(`/inventory/${itemId}`)
    return { success: true }
}

export async function returnItem(
    checkoutId: string,
    notes?: string,
    condition: 'good' | 'damaged' | 'needs_repair' | 'lost' = 'good'
): Promise<CheckoutResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // 1. Get Checkout Record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: checkout, error: fetchError } = await (supabase as any)
        .from('checkouts')
        .select('*, inventory_items(name, quantity, min_quantity, status)')
        .eq('id', checkoutId)
        .single()

    if (fetchError || !checkout) return { success: false, error: 'Checkout not found' }
    if (checkout.status === 'returned') return { success: false, error: 'Already returned' }

    // 2. Update Checkout Record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from('checkouts')
        .update({
            status: 'returned',
            returned_at: new Date().toISOString(),
            returned_by: user.id,
            return_condition: condition,
            return_notes: notes || null
        })
        .eq('id', checkoutId)

    if (updateError) return { success: false, error: updateError.message }

    // 3. Increment Inventory (unless lost)
    // If 'lost', we might NOT increment quantity, or we increment and then strict decrement?
    // User logic: "Returned" usually means it's back in stock. If it's damanged/lost, the user might want to manually adjust.
    // Let's assume for now "Return" = Put back on shelf. 
    // If it is 'lost', we should probably NOT add it back? 
    // Let's stick to: Return adds it back. If it's broken, user can adjust stock manually or we handle it later.
    // ACTUALLY: If condition is 'lost', we strictly shouldn't add it back.

    let quantityDelta = 0
    if (condition !== 'lost') {
        quantityDelta = checkout.quantity
        const item = checkout.inventory_items
        const newQuantity = (item.quantity || 0) + quantityDelta

        let status = 'in_stock'
        if (newQuantity <= 0) status = 'out_of_stock'
        else if (item.min_quantity && newQuantity <= item.min_quantity) status = 'low_stock'

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('inventory_items')
            .update({
                quantity: newQuantity,
                status: status,
                updated_at: new Date().toISOString(),
                last_modified_by: user.id
            })
            .eq('id', checkout.item_id)
    }

    // 4. Log Activity (fire-and-forget, don't block on failure)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('activity_logs').insert({
        tenant_id: checkout.tenant_id,
        user_id: user.id,
        user_name: user.email,
        action_type: 'check_in',
        entity_type: 'item',
        entity_id: checkout.item_id,
        entity_name: checkout.inventory_items?.name || 'Item',
        quantity_delta: quantityDelta,
        changes: { checkout_id: checkoutId, condition, notes }
    }).then(({ error }: { error: Error | null }) => {
        if (error) console.error('Activity log error:', error.message)
    })

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    if (serialIds.length === 0) {
        return { success: false, error: 'No serial numbers selected' }
    }

    // Call the RPC function that handles everything atomically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('checkout_with_serials', {
        p_item_id: itemId,
        p_serial_ids: serialIds,
        p_assignee_type: assigneeType,
        p_assignee_id: assigneeId || null,
        p_assignee_name: assigneeName || null,
        p_due_date: dueDate || null,
        p_notes: notes || null
    })

    if (error) {
        console.error('Checkout with serials error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Checkout failed' }
    }

    revalidatePath(`/inventory/${itemId}`)
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Get checkout to find item_id for revalidation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: checkout } = await (supabase as any)
        .from('checkouts')
        .select('item_id')
        .eq('id', checkoutId)
        .single()

    // Call the RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('return_checkout_serials', {
        p_checkout_id: checkoutId,
        p_serial_returns: JSON.stringify(serialReturns),
        p_notes: notes || null
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized', serials: [] }

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
