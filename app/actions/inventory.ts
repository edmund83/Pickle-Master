'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendLowStockAlert } from './email'
import {
    getAuthContext,
    requireWritePermission,
    verifyRelatedTenantOwnership,
    validateInput,
    quantitySchema,
} from '@/lib/auth/server-auth'
import { z } from 'zod'
import { escapeSqlLike } from '@/lib/utils'

export type ActionResult<T> = {
    success: boolean
    data?: T
    error?: string
}

// Validation schemas for inventory actions
const updateQuantitySchema = z.object({
    itemId: z.string().uuid(),
    newQuantity: quantitySchema,
    changeSource: z.string().max(100).default('manual_update'),
})

export async function updateItemQuantity(
    itemId: string,
    newQuantity: number,
    changeSource: string = 'manual_update'
): Promise<ActionResult<void>> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(updateQuantitySchema, { itemId, newQuantity, changeSource })
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

    // 5. Get current item for checks (with tenant filter)
     
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', validatedInput.itemId)
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    const oldQuantity = item.quantity
    const minQuantity = item.min_quantity || 0

    // 6. Determine Status
    let status = 'in_stock'
    if (validatedInput.newQuantity <= 0) {
        status = 'out_of_stock'
    } else if (minQuantity > 0 && validatedInput.newQuantity <= minQuantity) {
        status = 'low_stock'
    }

    // 7. Update Item (with tenant filter for safety)
     
    const { error: updateError } = await (supabase as any)
        .from('inventory_items')
        .update({
            quantity: validatedInput.newQuantity,
            status,
            updated_at: new Date().toISOString(),
            last_modified_by: context.userId
        })
        .eq('id', validatedInput.itemId)
        .eq('tenant_id', context.tenantId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 8. Log Activity (awaited for reliability)
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'quantity_adjustment',
            entity_type: 'item',
            entity_id: validatedInput.itemId,
            entity_name: item.name,
            quantity_before: oldQuantity,
            quantity_after: validatedInput.newQuantity,
            quantity_delta: validatedInput.newQuantity - oldQuantity,
            changes: { source: validatedInput.changeSource }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    // 9. Check & Create Alerts
    if (status === 'low_stock' || status === 'out_of_stock') {
        // Create in-app notification
        try {
             
            await (supabase as any).from('notifications').insert({
                tenant_id: context.tenantId,
                user_id: context.userId,
                notification_type: status,
                title: status === 'out_of_stock' ? 'Item Out of Stock' : 'Low Stock Alert',
                message: `${item.name} is ${status === 'out_of_stock' ? 'out of stock' : 'running low'}. Current: ${validatedInput.newQuantity} ${item.unit}`,
                entity_type: 'item',
                entity_id: validatedInput.itemId,
                is_read: false
            })
        } catch (notifError) {
            console.error('Notification insert error:', notifError)
        }

        // Send email alert (get user email from auth)
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
            sendLowStockAlert(
                user.email,
                item.name,
                validatedInput.newQuantity,
                minQuantity || 0,
                item.unit || 'units'
            ).catch((err) => console.error('Email send error:', err))
        }
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${validatedInput.itemId}`)

    return { success: true }
}

// Validation schema for field updates
const fieldValueSchema = z.union([z.string().max(500), z.number().nonnegative()])
const updateFieldSchema = z.object({
    itemId: z.string().uuid(),
    field: z.enum(['name', 'sku', 'barcode', 'serial_number', 'location', 'price', 'cost_price', 'min_quantity', 'quantity']),
    value: fieldValueSchema,
})

export async function updateItemField(
    itemId: string,
    field: 'name' | 'sku' | 'barcode' | 'serial_number' | 'location' | 'price' | 'cost_price' | 'min_quantity' | 'quantity',
    value: string | number
): Promise<ActionResult<void>> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(updateFieldSchema, { itemId, field, value })
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

    // 5. Get current item to check previous state (with tenant filter)
     
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', validatedInput.itemId)
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

     
    const updates: Record<string, any> = {
        [validatedInput.field]: validatedInput.value,
        updated_at: new Date().toISOString(),
        last_modified_by: context.userId
    }

    // 6. Re-evaluate status if related fields change
    let status = item.status
    if (validatedInput.field === 'quantity' || validatedInput.field === 'min_quantity') {
        const qty = validatedInput.field === 'quantity' ? Number(validatedInput.value) : item.quantity
        const minQty = validatedInput.field === 'min_quantity' ? Number(validatedInput.value) : (item.min_quantity || 0)

        if (qty <= 0) {
            status = 'out_of_stock'
        } else if (minQty > 0 && qty <= minQty) {
            status = 'low_stock'
        } else {
            status = 'in_stock'
        }
        updates.status = status
    }

    // 7. Update Item (with tenant filter)
     
    const { error: updateError } = await (supabase as any)
        .from('inventory_items')
        .update(updates)
        .eq('id', validatedInput.itemId)
        .eq('tenant_id', context.tenantId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 8. Log Activity (awaited for reliability)
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'update',
            entity_type: 'item',
            entity_id: validatedInput.itemId,
            entity_name: item.name,
            changes: { field: validatedInput.field, from: item[validatedInput.field], to: validatedInput.value, source: 'inline_edit' }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    // 9. Trigger Alerts if status changed to low/out of stock
    if ((validatedInput.field === 'quantity' || validatedInput.field === 'min_quantity') && (status === 'low_stock' || status === 'out_of_stock')) {
        try {
             
            await (supabase as any).from('notifications').insert({
                tenant_id: context.tenantId,
                user_id: context.userId,
                notification_type: status,
                title: status === 'out_of_stock' ? 'Item Out of Stock' : 'Low Stock Alert',
                message: `${item.name} is ${status === 'out_of_stock' ? 'out of stock' : 'running low'}. Current: ${validatedInput.field === 'quantity' ? validatedInput.value : item.quantity} ${item.unit}`,
                entity_type: 'item',
                entity_id: validatedInput.itemId,
                is_read: false
            })
        } catch (notifError) {
            console.error('Notification insert error:', notifError)
        }
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${validatedInput.itemId}`)

    return { success: true }
}

export async function deleteItem(itemId: string): Promise<ActionResult<void>> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Require write permission for delete
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate itemId
    const idValidation = z.string().uuid().safeParse(itemId)
    if (!idValidation.success) return { success: false, error: 'Invalid item ID' }

    // 4. Verify item belongs to user's tenant
    const itemCheck = await verifyRelatedTenantOwnership(
        'inventory_items',
        itemId,
        context.tenantId,
        'Inventory item'
    )
    if (!itemCheck.success) return { success: false, error: itemCheck.error }

    const supabase = await createClient()

    // 5. Get item first for activity log (with tenant filter)
     
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    // 6. Soft delete by setting deleted_at (with tenant filter)
     
    const { error: deleteError } = await (supabase as any)
        .from('inventory_items')
        .update({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_modified_by: context.userId
        })
        .eq('id', itemId)
        .eq('tenant_id', context.tenantId)

    if (deleteError) {
        return { success: false, error: deleteError.message }
    }

    // 7. Log activity (awaited)
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'delete',
            entity_type: 'item',
            entity_id: itemId,
            entity_name: item.name,
            changes: { deleted_by: context.fullName }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/inventory')

    return { success: true }
}

// Validation schema for tags update
const updateTagsSchema = z.object({
    itemId: z.string().uuid(),
    tagIds: z.array(z.string().uuid()).max(100),
})

export async function updateItemTags(
    itemId: string,
    tagIds: string[]
): Promise<ActionResult<void>> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(updateTagsSchema, { itemId, tagIds })
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

    // 5. Get item first for name (with tenant filter)
     
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('name')
        .eq('id', validatedInput.itemId)
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    // 6. Delete existing item_tags for this item (RLS handles tenant isolation)
     
    await (supabase as any)
        .from('item_tags')
        .delete()
        .eq('item_id', validatedInput.itemId)

    // 7. Insert new tags
    if (validatedInput.tagIds.length > 0) {
        const tagInserts = validatedInput.tagIds.map(tagId => ({
            item_id: validatedInput.itemId,
            tag_id: tagId,
            tenant_id: context.tenantId
        }))

         
        const { error: insertError } = await (supabase as any)
            .from('item_tags')
            .insert(tagInserts)

        if (insertError) {
            return { success: false, error: insertError.message }
        }
    }

    // 8. Log activity (awaited)
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'update',
            entity_type: 'item',
            entity_id: validatedInput.itemId,
            entity_name: item.name,
            changes: { tags_updated: validatedInput.tagIds.length }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath(`/inventory/${validatedInput.itemId}`)

    return { success: true }
}

// Validation schema for move item
const moveItemSchema = z.object({
    itemId: z.string().uuid(),
    targetFolderId: z.string().uuid().nullable(),
})

export async function moveItemToFolder(
    itemId: string,
    targetFolderId: string | null
): Promise<ActionResult<void>> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(moveItemSchema, { itemId, targetFolderId })
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

    // 5. Verify target folder belongs to user's tenant (if not null)
    if (validatedInput.targetFolderId) {
        const folderCheck = await verifyRelatedTenantOwnership(
            'folders',
            validatedInput.targetFolderId,
            context.tenantId,
            'Folder'
        )
        if (!folderCheck.success) return { success: false, error: folderCheck.error }
    }

    const supabase = await createClient()

    // 6. Get current item with folder info (with tenant filter)
     
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*, folder:folders(id, name)')
        .eq('id', validatedInput.itemId)
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    const fromFolderId = item.folder_id
    const fromFolderName = item.folder?.name || null

    // 7. Get target folder name if not null (with tenant filter)
    let toFolderName: string | null = null
    if (validatedInput.targetFolderId) {
         
        const { data: targetFolder } = await (supabase as any)
            .from('folders')
            .select('name')
            .eq('id', validatedInput.targetFolderId)
            .eq('tenant_id', context.tenantId)
            .single()
        toFolderName = targetFolder?.name || null
    }

    // 8. Update item folder_id (with tenant filter)
     
    const { error: updateError } = await (supabase as any)
        .from('inventory_items')
        .update({
            folder_id: validatedInput.targetFolderId,
            updated_at: new Date().toISOString(),
            last_modified_by: context.userId
        })
        .eq('id', validatedInput.itemId)
        .eq('tenant_id', context.tenantId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 9. Log activity with folder move details (awaited)
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'move',
            entity_type: 'item',
            entity_id: validatedInput.itemId,
            entity_name: item.name,
            from_folder_id: fromFolderId,
            from_folder_name: fromFolderName,
            to_folder_id: validatedInput.targetFolderId,
            to_folder_name: toFolderName,
            changes: { source: 'move_to_folder' }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/${validatedInput.itemId}`)
    revalidatePath('/tasks/moves')

    return { success: true }
}

export async function duplicateItem(
    itemId: string
): Promise<ActionResult<{ newItemId: string }>> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate itemId
    const idValidation = z.string().uuid().safeParse(itemId)
    if (!idValidation.success) return { success: false, error: 'Invalid item ID' }

    // 4. Verify item belongs to user's tenant
    const itemCheck = await verifyRelatedTenantOwnership(
        'inventory_items',
        itemId,
        context.tenantId,
        'Inventory item'
    )
    if (!itemCheck.success) return { success: false, error: itemCheck.error }

    const supabase = await createClient()

    // 5. Get original item with all fields (with tenant filter)
     
    const { data: item, error: fetchError } = await (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('id', itemId)
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)
        .single()

    if (fetchError || !item) {
        return { success: false, error: 'Item not found' }
    }

    // 6. Create new item data (exclude id, timestamps, tracking fields)
    const newItemData = {
        tenant_id: context.tenantId,
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
        created_by: context.userId,
        last_modified_by: context.userId
    }

    // 7. Insert new item
     
    const { data: newItem, error: insertError } = await (supabase as any)
        .from('inventory_items')
        .insert(newItemData)
        .select('id')
        .single()

    if (insertError || !newItem) {
        return { success: false, error: insertError?.message || 'Failed to create duplicate' }
    }

    // 8. Copy item tags (RLS handles tenant isolation)
     
    const { data: itemTags } = await (supabase as any)
        .from('item_tags')
        .select('tag_id')
        .eq('item_id', itemId)

    if (itemTags && itemTags.length > 0) {
        const tagInserts = itemTags.map((t: { tag_id: string }) => ({
            item_id: newItem.id,
            tag_id: t.tag_id,
            tenant_id: context.tenantId
        }))

         
        await (supabase as any)
            .from('item_tags')
            .insert(tagInserts)
    }

    // 9. Log activity (awaited)
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'create',
            entity_type: 'item',
            entity_id: newItem.id,
            entity_name: newItemData.name,
            changes: { source: 'duplicate', original_item_id: itemId, original_item_name: item.name }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/inventory')

    return { success: true, data: { newItemId: newItem.id } }
}

/**
 * Bulk move multiple items to a folder
 * Used by the moves page for batch operations
 */
// Validation schema for bulk move
const bulkMoveSchema = z.object({
    itemIds: z.array(z.string().uuid()).min(1).max(500),
    targetFolderId: z.string().uuid().nullable(),
})

export async function bulkMoveItemsToFolder(
    itemIds: string[],
    targetFolderId: string | null
): Promise<ActionResult<{ moved: number }>> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(bulkMoveSchema, { itemIds, targetFolderId })
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    // 4. Verify target folder belongs to user's tenant (if not null)
    if (validatedInput.targetFolderId) {
        const folderCheck = await verifyRelatedTenantOwnership(
            'folders',
            validatedInput.targetFolderId,
            context.tenantId,
            'Folder'
        )
        if (!folderCheck.success) return { success: false, error: folderCheck.error }
    }

    const supabase = await createClient()

    // 5. Get target folder name for logging
    let toFolderName: string | null = null
    if (validatedInput.targetFolderId) {
         
        const { data: targetFolder } = await (supabase as any)
            .from('folders')
            .select('name')
            .eq('id', validatedInput.targetFolderId)
            .eq('tenant_id', context.tenantId)
            .single()
        toFolderName = targetFolder?.name || null
    }

    // 6. Verify all items belong to user's tenant and get their current state
     
    const { data: items, error: itemsError } = await (supabase as any)
        .from('inventory_items')
        .select('id, name, folder_id, folders(name)')
        .in('id', validatedInput.itemIds)
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)

    if (itemsError) {
        return { success: false, error: 'Failed to verify items' }
    }

    if (!items || items.length === 0) {
        return { success: false, error: 'No valid items found' }
    }

    // Check if all requested items were found
    if (items.length !== validatedInput.itemIds.length) {
        return { success: false, error: 'Some items not found or not in your organization' }
    }

    // 7. Bulk update items (with tenant filter)
     
    const { error: updateError } = await (supabase as any)
        .from('inventory_items')
        .update({
            folder_id: validatedInput.targetFolderId,
            updated_at: new Date().toISOString(),
            last_modified_by: context.userId
        })
        .in('id', validatedInput.itemIds)
        .eq('tenant_id', context.tenantId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 8. Log activity for each item (batch insert for efficiency)
    try {
        const activityLogs = items.map((item: { id: string; name: string; folder_id: string | null; folders: { name: string } | null }) => ({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'move',
            entity_type: 'item',
            entity_id: item.id,
            entity_name: item.name,
            from_folder_id: item.folder_id,
            from_folder_name: item.folders?.name || null,
            to_folder_id: validatedInput.targetFolderId,
            to_folder_name: toFolderName,
            changes: { source: 'bulk_move', batch_size: items.length }
        }))

         
        await (supabase as any).from('activity_logs').insert(activityLogs)
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/inventory')
    revalidatePath('/tasks/moves')

    return { success: true, data: { moved: items.length } }
}

// ============================================
// Moves Page Data - Server-side fetching
// ============================================

export interface MovePageItem {
    id: string
    name: string
    sku: string | null
    quantity: number
    status: string | null
    folder_id: string | null
    folder_name: string | null
    folder_color: string | null
}

export interface MovePageFolder {
    id: string
    name: string
    parent_id: string | null
    color: string | null
}

export interface MovePageData {
    items: MovePageItem[]
    folders: MovePageFolder[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface MovePageQueryParams {
    page?: number
    pageSize?: number
    search?: string
    folderIds?: string[]
    statuses?: string[]
}

export async function getMovePageData(
    params: MovePageQueryParams = {}
): Promise<MovePageData> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) {
        return { items: [], folders: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }
    }
    const { context } = authResult

    const {
        page = 1,
        pageSize = 50,
        search,
        folderIds,
        statuses
    } = params

    // Validate and sanitize parameters
    const sanitizedPage = Math.max(1, page)
    const sanitizedPageSize = Math.min(100, Math.max(1, pageSize))
    const offset = (sanitizedPage - 1) * sanitizedPageSize

    const supabase = await createClient()

    // Build count query
     
    let countQuery = (supabase as any)
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)

    // Build data query
     
    let dataQuery = (supabase as any)
        .from('inventory_items')
        .select(`
            id,
            name,
            sku,
            quantity,
            status,
            folder_id,
            folders(name, color)
        `)
        .eq('tenant_id', context.tenantId)
        .is('deleted_at', null)
        .order('name', { ascending: true })
        .range(offset, offset + sanitizedPageSize - 1)

    // Apply search filter
    if (search) {
        const searchPattern = `%${escapeSqlLike(search)}%`
        countQuery = countQuery.or(`name.ilike.${searchPattern},sku.ilike.${searchPattern}`)
        dataQuery = dataQuery.or(`name.ilike.${searchPattern},sku.ilike.${searchPattern}`)
    }

    // Apply folder filter
    if (folderIds && folderIds.length > 0) {
        const hasRoot = folderIds.includes('root')
        const folderUuids = folderIds.filter(id => id !== 'root')

        if (hasRoot && folderUuids.length > 0) {
            // Include both root (null) and specific folders
            countQuery = countQuery.or(`folder_id.is.null,folder_id.in.(${folderUuids.join(',')})`)
            dataQuery = dataQuery.or(`folder_id.is.null,folder_id.in.(${folderUuids.join(',')})`)
        } else if (hasRoot) {
            countQuery = countQuery.is('folder_id', null)
            dataQuery = dataQuery.is('folder_id', null)
        } else if (folderUuids.length > 0) {
            countQuery = countQuery.in('folder_id', folderUuids)
            dataQuery = dataQuery.in('folder_id', folderUuids)
        }
    }

    // Apply status filter
    if (statuses && statuses.length > 0) {
        countQuery = countQuery.in('status', statuses)
        dataQuery = dataQuery.in('status', statuses)
    }

    // Get folders for the tenant (always needed for target selection)
     
    const foldersQuery = (supabase as any)
        .from('folders')
        .select('id, name, parent_id, color')
        .eq('tenant_id', context.tenantId)
        .order('name', { ascending: true })

    // Execute queries in parallel
    const [countResult, dataResult, foldersResult] = await Promise.all([
        countQuery,
        dataQuery,
        foldersQuery
    ])

    const total = countResult.count || 0
    const totalPages = Math.ceil(total / sanitizedPageSize)

    // Transform items data
    const items: MovePageItem[] = (dataResult.data || []).map((item: {
        id: string
        name: string
        sku: string | null
        quantity: number
        status: string | null
        folder_id: string | null
        folders: { name: string; color: string | null } | null
    }) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        status: item.status,
        folder_id: item.folder_id,
        folder_name: item.folders?.name || null,
        folder_color: item.folders?.color || null
    }))

    // Transform folders data
    const folders: MovePageFolder[] = (foldersResult.data || []).map((folder: {
        id: string
        name: string
        parent_id: string | null
        color: string | null
    }) => ({
        id: folder.id,
        name: folder.name,
        parent_id: folder.parent_id,
        color: folder.color
    }))

    return {
        items,
        folders,
        total,
        page: sanitizedPage,
        pageSize: sanitizedPageSize,
        totalPages
    }
}
