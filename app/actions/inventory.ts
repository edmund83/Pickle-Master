'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendLowStockAlert } from './email'

export type ActionResult<T> = {
    success: boolean
    data?: T
    error?: string
}

export async function updateItemQuantity(
    itemId: string,
    newQuantity: number,
    changeSource: string = 'manual_update'
): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Get current item for checks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    const oldQuantity = item.quantity
    const minQuantity = item.min_quantity || 0

    // 2. Determine Status
    let status = 'in_stock'
    if (newQuantity <= 0) {
        status = 'out_of_stock'
    } else if (minQuantity > 0 && newQuantity <= minQuantity) {
        status = 'low_stock'
    }

    // 3. Update Item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from('inventory_items')
        .update({
            quantity: newQuantity,
            status,
            updated_at: new Date().toISOString(),
            last_modified_by: user.id
        })
        .eq('id', itemId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 4. Log Activity (fire-and-forget, don't block on failure)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('activity_logs').insert({
        tenant_id: item.tenant_id,
        user_id: user.id,
        user_name: user.email,
        action_type: 'quantity_adjustment',
        entity_type: 'item',
        entity_id: itemId,
        entity_name: item.name,
        quantity_before: oldQuantity,
        quantity_after: newQuantity,
        quantity_delta: newQuantity - oldQuantity,
        changes: { source: changeSource }
    }).then(({ error }: { error: Error | null }) => {
        if (error) console.error('Activity log error:', error.message)
    })

    // 5. Check & Create Alerts
    if (status === 'low_stock' || status === 'out_of_stock') {
        // Create in-app notification (fire-and-forget)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from('notifications').insert({
            tenant_id: item.tenant_id,
            user_id: user.id,
            notification_type: status,
            title: status === 'out_of_stock' ? 'Item Out of Stock' : 'Low Stock Alert',
            message: `${item.name} is ${status === 'out_of_stock' ? 'out of stock' : 'running low'}. Current: ${newQuantity} ${item.unit}`,
            entity_type: 'item',
            entity_id: itemId,
            is_read: false
        }).then(({ error }: { error: Error | null }) => {
            if (error) console.error('Notification insert error:', error.message)
        })

        // Send email alert (fire-and-forget, don't block response)
        if (user.email) {
            sendLowStockAlert(
                user.email,
                item.name,
                newQuantity,
                minQuantity || 0,
                item.unit || 'units'
            ).catch((err) => console.error('Email send error:', err))
        }
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${itemId}`)

    return { success: true }
}

export async function updateItemField(
    itemId: string,
    field: 'name' | 'sku' | 'barcode' | 'serial_number' | 'location' | 'price' | 'cost_price' | 'min_quantity' | 'quantity',
    value: string | number
): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Get current item to check previous state and needed fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    const updates: Record<string, any> = {
        [field]: value,
        updated_at: new Date().toISOString(),
        last_modified_by: user.id
    }

    // 2. Re-evaluate status if related fields change
    let status = item.status
    if (field === 'quantity' || field === 'min_quantity') {
        const qty = field === 'quantity' ? Number(value) : item.quantity
        const minQty = field === 'min_quantity' ? Number(value) : (item.min_quantity || 0)

        if (qty <= 0) {
            status = 'out_of_stock'
        } else if (minQty > 0 && qty <= minQty) {
            status = 'low_stock'
        } else {
            status = 'in_stock'
        }
        updates.status = status
    }

    // 3. Update Item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from('inventory_items')
        .update(updates)
        .eq('id', itemId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 4. Log Activity (fire-and-forget, don't block on failure)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('activity_logs').insert({
        tenant_id: item.tenant_id,
        user_id: user.id,
        user_name: user.email,
        action_type: 'update',
        entity_type: 'item',
        entity_id: itemId,
        entity_name: item.name,
        changes: { field, from: item[field], to: value, source: 'inline_edit' }
    }).then(({ error }: { error: Error | null }) => {
        if (error) console.error('Activity log error:', error.message)
    })

    // 5. Trigger Alerts if status changed to low/out of stock
    if ((field === 'quantity' || field === 'min_quantity') && (status === 'low_stock' || status === 'out_of_stock')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from('notifications').insert({
            tenant_id: item.tenant_id,
            user_id: user.id,
            notification_type: status,
            title: status === 'out_of_stock' ? 'Item Out of Stock' : 'Low Stock Alert',
            message: `${item.name} is ${status === 'out_of_stock' ? 'out of stock' : 'running low'}. Current: ${field === 'quantity' ? value : item.quantity} ${item.unit}`,
            entity_type: 'item',
            entity_id: itemId,
            is_read: false
        }).then(({ error }: { error: Error | null }) => {
            if (error) console.error('Notification insert error:', error.message)
        })
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${itemId}`)

    return { success: true }
}

export async function deleteItem(itemId: string): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Get item first for activity log
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    // Soft delete by setting deleted_at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
        .from('inventory_items')
        .update({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_modified_by: user.id
        })
        .eq('id', itemId)

    if (deleteError) {
        return { success: false, error: deleteError.message }
    }

    // Log activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('activity_logs').insert({
        tenant_id: item.tenant_id,
        user_id: user.id,
        user_name: user.email,
        action_type: 'delete',
        entity_type: 'item',
        entity_id: itemId,
        entity_name: item.name,
        changes: { deleted_by: user.email }
    })

    revalidatePath('/inventory')

    return { success: true }
}

export async function updateItemTags(
    itemId: string,
    tagIds: string[]
): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // Get item first for tenant_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('tenant_id, name')
        .eq('id', itemId)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    // Delete existing item_tags for this item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from('item_tags')
        .delete()
        .eq('item_id', itemId)

    // Insert new tags
    if (tagIds.length > 0) {
        const tagInserts = tagIds.map(tagId => ({
            item_id: itemId,
            tag_id: tagId,
            tenant_id: item.tenant_id
        }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase as any)
            .from('item_tags')
            .insert(tagInserts)

        if (insertError) {
            return { success: false, error: insertError.message }
        }
    }

    // Log activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('activity_logs').insert({
        tenant_id: item.tenant_id,
        user_id: user.id,
        user_name: user.email,
        action_type: 'update',
        entity_type: 'item',
        entity_id: itemId,
        entity_name: item.name,
        changes: { tags_updated: tagIds.length }
    })

    revalidatePath(`/inventory/${itemId}`)

    return { success: true }
}

export async function moveItemToFolder(
    itemId: string,
    targetFolderId: string | null
): Promise<ActionResult<void>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Get current item with folder info
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*, folder:folders(id, name)')
        .eq('id', itemId)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    const fromFolderId = item.folder_id
    const fromFolderName = item.folder?.name || null

    // 2. Get target folder name if not null
    let toFolderName: string | null = null
    if (targetFolderId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: targetFolder } = await (supabase as any)
            .from('folders')
            .select('name')
            .eq('id', targetFolderId)
            .single()
        toFolderName = targetFolder?.name || null
    }

    // 3. Update item folder_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
        .from('inventory_items')
        .update({
            folder_id: targetFolderId,
            updated_at: new Date().toISOString(),
            last_modified_by: user.id
        })
        .eq('id', itemId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 4. Log activity with folder move details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('activity_logs').insert({
        tenant_id: item.tenant_id,
        user_id: user.id,
        user_name: user.email,
        action_type: 'move',
        entity_type: 'item',
        entity_id: itemId,
        entity_name: item.name,
        from_folder_id: fromFolderId,
        from_folder_name: fromFolderName,
        to_folder_id: targetFolderId,
        to_folder_name: toFolderName,
        changes: { source: 'move_to_folder' }
    }).then(({ error }: { error: Error | null }) => {
        if (error) console.error('Activity log error:', error.message)
    })

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${itemId}`)

    return { success: true }
}

export async function duplicateItem(
    itemId: string
): Promise<ActionResult<{ newItemId: string }>> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Get original item with all fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    // 2. Create new item data (exclude id, timestamps, tracking fields)
    const newItemData = {
        tenant_id: item.tenant_id,
        folder_id: item.folder_id,
        name: `${item.name} (Copy)`,
        sku: item.sku ? `${item.sku}-COPY` : null,
        barcode: null, // Don't copy barcode as it should be unique
        description: item.description,
        notes: item.notes,
        quantity: item.quantity,
        min_quantity: item.min_quantity,
        max_quantity: item.max_quantity,
        unit: item.unit,
        price: item.price,
        cost_price: item.cost_price,
        currency: item.currency,
        location: item.location,
        image_urls: item.image_urls,
        status: item.status,
        custom_fields: item.custom_fields,
        tracking_mode: item.tracking_mode,
        weight: item.weight,
        weight_unit: item.weight_unit,
        length: item.length,
        width: item.width,
        height: item.height,
        dimension_unit: item.dimension_unit,
        created_by: user.id,
        last_modified_by: user.id
    }

    // 3. Insert new item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newItem, error: insertError } = await (supabase as any)
        .from('inventory_items')
        .insert(newItemData)
        .select('id')
        .single()

    if (insertError || !newItem) {
        return { success: false, error: insertError?.message || 'Failed to create duplicate' }
    }

    // 4. Copy item tags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: itemTags } = await (supabase as any)
        .from('item_tags')
        .select('tag_id')
        .eq('item_id', itemId)

    if (itemTags && itemTags.length > 0) {
        const tagInserts = itemTags.map((t: { tag_id: string }) => ({
            item_id: newItem.id,
            tag_id: t.tag_id,
            tenant_id: item.tenant_id
        }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('item_tags')
            .insert(tagInserts)
    }

    // 5. Log activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('activity_logs').insert({
        tenant_id: item.tenant_id,
        user_id: user.id,
        user_name: user.email,
        action_type: 'create',
        entity_type: 'item',
        entity_id: newItem.id,
        entity_name: newItemData.name,
        changes: { source: 'duplicate', original_item_id: itemId, original_item_name: item.name }
    }).then(({ error }: { error: Error | null }) => {
        if (error) console.error('Activity log error:', error.message)
    })

    revalidatePath('/inventory')

    return { success: true, data: { newItemId: newItem.id } }
}
