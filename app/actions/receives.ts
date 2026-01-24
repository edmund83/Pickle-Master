'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireFeatureSafe } from '@/lib/features'
import {
    getAuthContext,
    requireWritePermission,
    verifyTenantOwnership,
    verifyRelatedTenantOwnership,
    validateInput,
    optionalStringSchema,
    optionalUuidSchema,
    quantitySchema,
    optionalDateStringSchema,
} from '@/lib/auth/server-auth'
import { z } from 'zod'
import { escapeSqlLike } from '@/lib/utils'

export type ReceiveResult = {
    success: boolean
    error?: string
    receive_id?: string
    display_id?: string
    items_processed?: number
    lots_created?: number
    po_fully_received?: boolean
}

// Validation schemas
const conditionSchema = z.enum(['good', 'damaged', 'rejected'])

const createReceiveSchema = z.object({
    purchase_order_id: z.string().uuid(),
    delivery_note_number: optionalStringSchema,
    carrier: optionalStringSchema,
    tracking_number: optionalStringSchema,
    default_location_id: optionalUuidSchema,
    notes: z.string().max(2000).nullable().optional(),
})

const addReceiveItemSchema = z.object({
    purchase_order_item_id: z.string().uuid(),
    quantity_received: quantitySchema,
    lot_number: optionalStringSchema,
    batch_code: optionalStringSchema,
    expiry_date: optionalDateStringSchema,
    manufactured_date: optionalDateStringSchema,
    location_id: optionalUuidSchema,
    condition: conditionSchema.default('good'),
    notes: z.string().max(2000).nullable().optional(),
})

const updateReceiveItemSchema = z.object({
    quantity_received: quantitySchema.optional(),
    lot_number: optionalStringSchema,
    batch_code: optionalStringSchema,
    expiry_date: optionalDateStringSchema,
    manufactured_date: optionalDateStringSchema,
    location_id: optionalUuidSchema,
    condition: conditionSchema.optional(),
    notes: z.string().max(2000).nullable().optional(),
}).partial()

const updateReceiveSchema = z.object({
    delivery_note_number: optionalStringSchema,
    carrier: optionalStringSchema,
    tracking_number: optionalStringSchema,
    default_location_id: optionalUuidSchema,
    received_date: optionalDateStringSchema,
    notes: z.string().max(2000).nullable().optional(),
}).partial()

const serialNumberSchema = z.string().min(1).max(255)

export interface CreateReceiveInput {
    purchase_order_id: string
    delivery_note_number?: string | null
    carrier?: string | null
    tracking_number?: string | null
    default_location_id?: string | null
    notes?: string | null
}

export interface AddReceiveItemInput {
    purchase_order_item_id: string
    quantity_received: number
    lot_number?: string | null
    batch_code?: string | null
    expiry_date?: string | null
    manufactured_date?: string | null
    location_id?: string | null
    condition?: 'good' | 'damaged' | 'rejected'
    notes?: string | null
}

export interface UpdateReceiveItemInput {
    quantity_received?: number
    lot_number?: string | null
    batch_code?: string | null
    expiry_date?: string | null
    manufactured_date?: string | null
    location_id?: string | null
    condition?: 'good' | 'damaged' | 'rejected'
    notes?: string | null
}

export interface UpdateReceiveInput {
    delivery_note_number?: string | null
    carrier?: string | null
    tracking_number?: string | null
    default_location_id?: string | null
    received_date?: string | null
    notes?: string | null
}

// Serial number for serialized items
export interface ReceiveItemSerial {
    id: string
    receive_item_id: string
    serial_number: string
    created_at: string
}

// Receive with details type
export interface ReceiveWithDetails {
    id: string
    display_id: string | null
    status: 'draft' | 'completed' | 'cancelled'
    received_date: string
    delivery_note_number: string | null
    carrier: string | null
    tracking_number: string | null
    default_location_id: string | null
    notes: string | null
    completed_at: string | null
    created_at: string
    received_by_name: string | null
    created_by_name: string | null
    default_location_name: string | null
    purchase_order: {
        id: string
        display_id: string | null
        order_number: string | null
        status: string
        vendor_name: string | null
    }
    items: ReceiveItemWithDetails[]
}

export interface ReceiveItemWithDetails {
    id: string
    purchase_order_item_id: string
    item_id: string | null
    item_name: string
    item_sku: string | null
    ordered_quantity: number
    already_received: number
    quantity_received: number
    lot_number: string | null
    batch_code: string | null
    expiry_date: string | null
    manufactured_date: string | null
    location_id: string | null
    location_name: string | null
    condition: 'good' | 'damaged' | 'rejected'
    notes: string | null
    item_image: string | null
    item_tracking_mode: string | null
    serials?: ReceiveItemSerial[]
}

export interface ReceiveSummary {
    id: string
    display_id: string | null
    status: 'draft' | 'completed' | 'cancelled'
    received_date: string
    delivery_note_number: string | null
    carrier: string | null
    tracking_number: string | null
    items_count: number
    total_quantity: number
    received_by_name: string | null
    completed_at: string | null
    created_at: string
}

// Create a new receive from a PO with pre-populated items
export async function createReceive(input: CreateReceiveInput): Promise<ReceiveResult> {
    // Feature gate: Receiving requires Growth+ plan
    const featureCheck = await requireFeatureSafe('receiving')
    if (featureCheck.error) return { success: false, error: featureCheck.error }

    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(createReceiveSchema, input)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    // 4. Verify PO belongs to user's tenant
    const poCheck = await verifyRelatedTenantOwnership(
        'purchase_orders',
        validatedInput.purchase_order_id,
        context.tenantId,
        'Purchase order'
    )
    if (!poCheck.success) return { success: false, error: poCheck.error }

    // 5. If location_id is provided, verify it belongs to the tenant
    if (validatedInput.default_location_id) {
        const locationCheck = await verifyRelatedTenantOwnership(
            'locations',
            validatedInput.default_location_id,
            context.tenantId,
            'Location'
        )
        if (!locationCheck.success) return { success: false, error: locationCheck.error }
    }

    const supabase = await createClient()

    // Use the RPC function that pre-populates items from PO
     
    const { data, error } = await (supabase as any).rpc('create_receive_with_items', {
        p_purchase_order_id: validatedInput.purchase_order_id,
        p_delivery_note_number: validatedInput.delivery_note_number || null,
        p_carrier: validatedInput.carrier || null,
        p_tracking_number: validatedInput.tracking_number || null,
        p_default_location_id: validatedInput.default_location_id || null,
        p_notes: validatedInput.notes || null
    })

    if (error) {
        console.error('Create receive error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to create receive' }
    }

    // Log activity for receive creation
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'create',
            entity_type: 'receive',
            entity_id: data?.id,
            entity_name: data?.display_id,
            changes: {
                purchase_order_id: validatedInput.purchase_order_id,
                items_added: data?.items_added,
                status: 'draft'
            }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/tasks/receives')
    revalidatePath(`/tasks/purchase-orders/${validatedInput.purchase_order_id}`)
    return {
        success: true,
        receive_id: data?.id,
        display_id: data?.display_id,
        items_processed: data?.items_added
    }
}

// Get a single receive with all details
export async function getReceive(receiveId: string): Promise<ReceiveWithDetails | null> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return null
    const { context } = authResult

    // 2. Validate receiveId
    const idValidation = z.string().uuid().safeParse(receiveId)
    if (!idValidation.success) return null

    // 3. Verify receive belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('receives', receiveId, context.tenantId)
    if (!ownershipResult.success) return null

    const supabase = await createClient()

    // Use the RPC function to get receive with items
     
    const { data, error } = await (supabase as any).rpc('get_receive_with_items', {
        p_receive_id: receiveId
    })

    if (error) {
        console.error('Get receive error:', error)
        return null
    }

    if (!data) return null

    // Transform the data to match our interface
    return {
        id: data.receive.id,
        display_id: data.receive.display_id,
        status: data.receive.status,
        received_date: data.receive.received_date,
        delivery_note_number: data.receive.delivery_note_number,
        carrier: data.receive.carrier,
        tracking_number: data.receive.tracking_number,
        default_location_id: data.receive.default_location_id,
        notes: data.receive.notes,
        completed_at: data.receive.completed_at,
        created_at: data.receive.created_at,
        received_by_name: data.receive.received_by_name,
        created_by_name: data.receive.created_by_name,
        default_location_name: data.receive.default_location_name,
        purchase_order: data.purchase_order,
        items: data.items || []
    }
}

// Get all receives for a PO
export async function getPOReceives(purchaseOrderId: string): Promise<ReceiveSummary[]> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return []
    const { context } = authResult

    // 2. Validate purchaseOrderId
    const idValidation = z.string().uuid().safeParse(purchaseOrderId)
    if (!idValidation.success) return []

    // 3. Verify PO belongs to user's tenant
    const poCheck = await verifyRelatedTenantOwnership(
        'purchase_orders',
        purchaseOrderId,
        context.tenantId,
        'Purchase order'
    )
    if (!poCheck.success) return []

    const supabase = await createClient()

    // Use the RPC function
     
    const { data, error } = await (supabase as any).rpc('get_po_receives', {
        p_purchase_order_id: purchaseOrderId
    })

    if (error) {
        console.error('Get PO receives error:', error)
        return []
    }

    return data || []
}

// Get all receives for the tenant (for receives list page)
export async function getReceives(options?: {
    status?: 'draft' | 'completed' | 'cancelled'
    limit?: number
}) {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return []
    const { context } = authResult

    const supabase = await createClient()

    // Build query with tenant filter
     
    let query = (supabase as any)
        .from('receives')
        .select(`
            id,
            display_id,
            status,
            received_date,
            delivery_note_number,
            carrier,
            tracking_number,
            completed_at,
            created_at,
            purchase_orders(id, display_id, order_number, vendors(name)),
            profiles!receives_received_by_fkey(full_name)
        `)
        .eq('tenant_id', context.tenantId)
        .order('created_at', { ascending: false })

    if (options?.status) {
        const statusValidation = z.enum(['draft', 'completed', 'cancelled']).safeParse(options.status)
        if (statusValidation.success) {
            query = query.eq('status', statusValidation.data)
        }
    }

    if (options?.limit && options.limit > 0 && options.limit <= 100) {
        query = query.limit(options.limit)
    }

    const { data } = await query

    return data || []
}

// Add item to a receive
export async function addReceiveItem(
    receiveId: string,
    input: AddReceiveItemInput
): Promise<ReceiveResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate receiveId
    const idValidation = z.string().uuid().safeParse(receiveId)
    if (!idValidation.success) return { success: false, error: 'Invalid receive ID' }

    // 4. Validate input
    const validation = validateInput(addReceiveItemSchema, input)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    // 5. Verify receive belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('receives', receiveId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    // 6. If location_id is provided, verify it belongs to the tenant
    if (validatedInput.location_id) {
        const locationCheck = await verifyRelatedTenantOwnership(
            'locations',
            validatedInput.location_id,
            context.tenantId,
            'Location'
        )
        if (!locationCheck.success) return { success: false, error: locationCheck.error }
    }

    const supabase = await createClient()

    // Use the RPC function
     
    const { data, error } = await (supabase as any).rpc('add_receive_item', {
        p_receive_id: receiveId,
        p_purchase_order_item_id: validatedInput.purchase_order_item_id,
        p_quantity_received: validatedInput.quantity_received,
        p_lot_number: validatedInput.lot_number || null,
        p_batch_code: validatedInput.batch_code || null,
        p_expiry_date: validatedInput.expiry_date || null,
        p_manufactured_date: validatedInput.manufactured_date || null,
        p_location_id: validatedInput.location_id || null,
        p_condition: validatedInput.condition || 'good',
        p_notes: validatedInput.notes || null
    })

    if (error) {
        console.error('Add receive item error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to add receive item' }
    }

    revalidatePath(`/tasks/receives/${receiveId}`)
    return { success: true }
}

// Update receive item
export async function updateReceiveItem(
    receiveItemId: string,
    updates: UpdateReceiveItemInput
): Promise<ReceiveResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate receiveItemId
    const idValidation = z.string().uuid().safeParse(receiveItemId)
    if (!idValidation.success) return { success: false, error: 'Invalid receive item ID' }

    // 4. Validate input
    const validation = validateInput(updateReceiveItemSchema, updates)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedUpdates = validation.data

    const supabase = await createClient()

    // 5. Verify receive item belongs to user's tenant (via the parent receive)
     
    const { data: receiveItem, error: fetchError } = await (supabase as any)
        .from('receive_items')
        .select('receive_id, receives!inner(tenant_id)')
        .eq('id', receiveItemId)
        .single()

    if (fetchError || !receiveItem) {
        return { success: false, error: 'Receive item not found' }
    }

    if (receiveItem.receives?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    // 6. If location_id is provided, verify it belongs to the tenant
    if (validatedUpdates.location_id) {
        const locationCheck = await verifyRelatedTenantOwnership(
            'locations',
            validatedUpdates.location_id,
            context.tenantId,
            'Location'
        )
        if (!locationCheck.success) return { success: false, error: locationCheck.error }
    }

    // Use the RPC function
     
    const { data, error } = await (supabase as any).rpc('update_receive_item', {
        p_receive_item_id: receiveItemId,
        p_quantity_received: validatedUpdates.quantity_received || null,
        p_lot_number: validatedUpdates.lot_number,
        p_batch_code: validatedUpdates.batch_code,
        p_expiry_date: validatedUpdates.expiry_date,
        p_manufactured_date: validatedUpdates.manufactured_date,
        p_location_id: validatedUpdates.location_id,
        p_condition: validatedUpdates.condition,
        p_notes: validatedUpdates.notes
    })

    if (error) {
        console.error('Update receive item error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to update receive item' }
    }

    revalidatePath('/tasks/receives')
    return { success: true }
}

// Remove receive item
export async function removeReceiveItem(receiveItemId: string): Promise<ReceiveResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate receiveItemId
    const idValidation = z.string().uuid().safeParse(receiveItemId)
    if (!idValidation.success) return { success: false, error: 'Invalid receive item ID' }

    const supabase = await createClient()

    // 4. Verify receive item belongs to user's tenant
     
    const { data: receiveItem, error: fetchError } = await (supabase as any)
        .from('receive_items')
        .select('receive_id, receives!inner(tenant_id)')
        .eq('id', receiveItemId)
        .single()

    if (fetchError || !receiveItem) {
        return { success: false, error: 'Receive item not found' }
    }

    if (receiveItem.receives?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    // Use the RPC function
     
    const { data, error } = await (supabase as any).rpc('remove_receive_item', {
        p_receive_item_id: receiveItemId
    })

    if (error) {
        console.error('Remove receive item error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to remove receive item' }
    }

    revalidatePath('/tasks/receives')
    return { success: true }
}

// Complete receive - updates inventory
export async function completeReceive(receiveId: string): Promise<ReceiveResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate receiveId
    const idValidation = z.string().uuid().safeParse(receiveId)
    if (!idValidation.success) return { success: false, error: 'Invalid receive ID' }

    // 4. Verify receive belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('receives', receiveId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Get receive info for logging
     
    const { data: receive } = await (supabase as any)
        .from('receives')
        .select('display_id, status')
        .eq('id', receiveId)
        .eq('tenant_id', context.tenantId)
        .single()

    // Use the RPC function
     
    const { data, error } = await (supabase as any).rpc('complete_receive', {
        p_receive_id: receiveId
    })

    if (error) {
        console.error('Complete receive error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to complete receive' }
    }

    // Log activity for receive completion
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'complete',
            entity_type: 'receive',
            entity_id: receiveId,
            entity_name: receive?.display_id,
            changes: {
                previous_status: receive?.status,
                new_status: 'completed',
                items_processed: data?.items_processed,
                lots_created: data?.lots_created,
                po_fully_received: data?.po_fully_received
            }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    // Trigger notification for receive completion
    try {
         
        await (supabase as any).rpc('notify_receive_completed', {
            p_tenant_id: context.tenantId,
            p_receive_id: receiveId,
            p_receive_display_id: receive?.display_id,
            p_completer_name: context.fullName,
            p_triggered_by: context.userId
        })
    } catch (notifyError) {
        console.error('Notification error:', notifyError)
        // Don't fail the operation if notification fails
    }

    revalidatePath('/tasks/receives')
    revalidatePath('/tasks/purchase-orders')
    return {
        success: true,
        items_processed: data?.items_processed,
        lots_created: data?.lots_created,
        po_fully_received: data?.po_fully_received
    }
}

// Cancel receive
export async function cancelReceive(receiveId: string): Promise<ReceiveResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission for cancel operations
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate receiveId
    const idValidation = z.string().uuid().safeParse(receiveId)
    if (!idValidation.success) return { success: false, error: 'Invalid receive ID' }

    // 4. Verify receive belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('receives', receiveId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Get receive info for logging
     
    const { data: receive } = await (supabase as any)
        .from('receives')
        .select('display_id, status')
        .eq('id', receiveId)
        .eq('tenant_id', context.tenantId)
        .single()

    // Use the RPC function
     
    const { data, error } = await (supabase as any).rpc('cancel_receive', {
        p_receive_id: receiveId
    })

    if (error) {
        console.error('Cancel receive error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to cancel receive' }
    }

    // Log activity for receive cancellation
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'cancel',
            entity_type: 'receive',
            entity_id: receiveId,
            entity_name: receive?.display_id,
            changes: {
                previous_status: receive?.status,
                new_status: 'cancelled'
            }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/tasks/receives')
    return { success: true }
}

// Update receive header info
export async function updateReceive(
    receiveId: string,
    updates: UpdateReceiveInput
): Promise<ReceiveResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate receiveId
    const idValidation = z.string().uuid().safeParse(receiveId)
    if (!idValidation.success) return { success: false, error: 'Invalid receive ID' }

    // 4. Validate input
    const validation = validateInput(updateReceiveSchema, updates)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedUpdates = validation.data

    const supabase = await createClient()

    // 5. Check if receive exists, belongs to tenant, and is in draft status
     
    const { data: receive, error: fetchError } = await (supabase as any)
        .from('receives')
        .select('status, tenant_id')
        .eq('id', receiveId)
        .single()

    if (fetchError || !receive) {
        return { success: false, error: 'Receive not found' }
    }

    if (receive.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (receive.status !== 'draft') {
        return { success: false, error: 'Can only update draft receives' }
    }

    // 6. If location_id is provided, verify it belongs to the tenant
    if (validatedUpdates.default_location_id) {
        const locationCheck = await verifyRelatedTenantOwnership(
            'locations',
            validatedUpdates.default_location_id,
            context.tenantId,
            'Location'
        )
        if (!locationCheck.success) return { success: false, error: locationCheck.error }
    }

    // Update the receive
     
    const { error } = await (supabase as any)
        .from('receives')
        .update({
            delivery_note_number: validatedUpdates.delivery_note_number,
            carrier: validatedUpdates.carrier,
            tracking_number: validatedUpdates.tracking_number,
            default_location_id: validatedUpdates.default_location_id,
            received_date: validatedUpdates.received_date,
            notes: validatedUpdates.notes,
            updated_at: new Date().toISOString()
        })
        .eq('id', receiveId)
        .eq('tenant_id', context.tenantId) // Double-check tenant

    if (error) {
        console.error('Update receive error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/receives/${receiveId}`)
    return { success: true }
}

// Get locations for dropdown
export async function getLocations() {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return []
    const { context } = authResult

    const supabase = await createClient()

    // Get locations with tenant filter
     
    const { data } = await (supabase as any)
        .from('locations')
        .select('id, name, type')
        .eq('tenant_id', context.tenantId)
        .eq('is_active', true)
        .order('name')

    return data || []
}

// Get pending POs for receiving (for receives list page)
export async function getPendingPurchaseOrders() {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return []
    const { context } = authResult

    const supabase = await createClient()

    // Get POs that can be received (submitted, confirmed, or partial)
     
    const { data } = await (supabase as any)
        .from('purchase_orders')
        .select(`
            id,
            display_id,
            order_number,
            status,
            expected_date,
            vendors(id, name),
            purchase_order_items(
                id,
                item_name,
                sku,
                ordered_quantity,
                received_quantity
            )
        `)
        .eq('tenant_id', context.tenantId)
        .in('status', ['submitted', 'confirmed', 'partial'])
        .order('expected_date', { ascending: true, nullsFirst: false })

    return data || []
}

// ============================================
// Serial Number Management for Serialized Items
// ============================================

// Add a single serial number to a receive item
export async function addReceiveItemSerial(
    receiveItemId: string,
    serialNumber: string
): Promise<{ success: boolean; error?: string; serial?: ReceiveItemSerial }> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate inputs
    const idValidation = z.string().uuid().safeParse(receiveItemId)
    if (!idValidation.success) return { success: false, error: 'Invalid receive item ID' }

    const serialValidation = serialNumberSchema.safeParse(serialNumber)
    if (!serialValidation.success) return { success: false, error: 'Invalid serial number' }

    const supabase = await createClient()

    // 4. Verify receive item belongs to user's tenant
     
    const { data: receiveItem, error: fetchError } = await (supabase as any)
        .from('receive_items')
        .select('receive_id, receives!inner(tenant_id, status)')
        .eq('id', receiveItemId)
        .single()

    if (fetchError || !receiveItem) {
        return { success: false, error: 'Receive item not found' }
    }

    if (receiveItem.receives?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (receiveItem.receives?.status !== 'draft') {
        return { success: false, error: 'Can only add serials to draft receives' }
    }

    // Insert the serial number
     
    const { data, error } = await (supabase as any)
        .from('receive_item_serials')
        .insert({
            receive_item_id: receiveItemId,
            serial_number: serialValidation.data.trim()
        })
        .select()
        .single()

    if (error) {
        console.error('Add serial error:', error)
        if (error.code === '23505') {
            return { success: false, error: 'This serial number already exists for this item' }
        }
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/receives')
    return { success: true, serial: data }
}

// Remove a serial number from a receive item
export async function removeReceiveItemSerial(
    serialId: string
): Promise<{ success: boolean; error?: string }> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate serialId
    const idValidation = z.string().uuid().safeParse(serialId)
    if (!idValidation.success) return { success: false, error: 'Invalid serial ID' }

    const supabase = await createClient()

    // 4. Verify serial belongs to user's tenant (via receive_items -> receives)
     
    const { data: serial, error: fetchError } = await (supabase as any)
        .from('receive_item_serials')
        .select('id, receive_items!inner(receives!inner(tenant_id, status))')
        .eq('id', serialId)
        .single()

    if (fetchError || !serial) {
        return { success: false, error: 'Serial not found' }
    }

    if (serial.receive_items?.receives?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (serial.receive_items?.receives?.status !== 'draft') {
        return { success: false, error: 'Can only remove serials from draft receives' }
    }

    // Delete the serial number
     
    const { error } = await (supabase as any)
        .from('receive_item_serials')
        .delete()
        .eq('id', serialId)

    if (error) {
        console.error('Remove serial error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/receives')
    return { success: true }
}

// Bulk add serial numbers to a receive item
export async function bulkAddReceiveItemSerials(
    receiveItemId: string,
    serialNumbers: string[]
): Promise<{ success: boolean; error?: string; added: number; duplicates: string[] }> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error, added: 0, duplicates: [] }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error, added: 0, duplicates: [] }

    // 3. Validate receiveItemId
    const idValidation = z.string().uuid().safeParse(receiveItemId)
    if (!idValidation.success) return { success: false, error: 'Invalid receive item ID', added: 0, duplicates: [] }

    // 4. Validate and limit serial numbers array
    if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
        return { success: false, error: 'No serial numbers provided', added: 0, duplicates: [] }
    }

    if (serialNumbers.length > 1000) {
        return { success: false, error: 'Maximum 1000 serial numbers per request', added: 0, duplicates: [] }
    }

    // Trim and filter empty entries, validate each
    const cleanSerials = serialNumbers
        .map(s => (typeof s === 'string' ? s.trim() : ''))
        .filter(s => s.length > 0 && s.length <= 255)

    if (cleanSerials.length === 0) {
        return { success: false, error: 'No valid serial numbers provided', added: 0, duplicates: [] }
    }

    const supabase = await createClient()

    // 5. Verify receive item belongs to user's tenant
     
    const { data: receiveItem, error: fetchError } = await (supabase as any)
        .from('receive_items')
        .select('receive_id, receives!inner(tenant_id, status)')
        .eq('id', receiveItemId)
        .single()

    if (fetchError || !receiveItem) {
        return { success: false, error: 'Receive item not found', added: 0, duplicates: [] }
    }

    if (receiveItem.receives?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied', added: 0, duplicates: [] }
    }

    if (receiveItem.receives?.status !== 'draft') {
        return { success: false, error: 'Can only add serials to draft receives', added: 0, duplicates: [] }
    }

    // Check for duplicates within the input
    const uniqueSerials = [...new Set(cleanSerials)]
    const inputDuplicates = cleanSerials.length - uniqueSerials.length

    // Get existing serials for this receive item
     
    const { data: existingSerials } = await (supabase as any)
        .from('receive_item_serials')
        .select('serial_number')
        .eq('receive_item_id', receiveItemId)

    const existingSet = new Set((existingSerials || []).map((s: { serial_number: string }) => s.serial_number))

    // Filter out already existing serials
    const newSerials = uniqueSerials.filter(s => !existingSet.has(s))
    const duplicates = uniqueSerials.filter(s => existingSet.has(s))

    if (newSerials.length === 0) {
        return {
            success: false,
            error: 'All serial numbers already exist',
            added: 0,
            duplicates
        }
    }

    // Insert new serials
     
    const { error } = await (supabase as any)
        .from('receive_item_serials')
        .insert(newSerials.map(serial_number => ({
            receive_item_id: receiveItemId,
            serial_number
        })))

    if (error) {
        console.error('Bulk add serials error:', error)
        return { success: false, error: error.message, added: 0, duplicates }
    }

    revalidatePath('/tasks/receives')
    return {
        success: true,
        added: newSerials.length,
        duplicates: [...duplicates, ...(inputDuplicates > 0 ? ['(input had duplicates)'] : [])]
    }
}

// ============================================
// Server-side Pagination for Receives List
// ============================================

export interface PaginatedReceivesResult {
    data: ReceiveListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface ReceiveListItem {
    id: string
    display_id: string | null
    status: 'draft' | 'completed' | 'cancelled'
    received_date: string
    delivery_note_number: string | null
    carrier: string | null
    tracking_number: string | null
    completed_at: string | null
    created_at: string
    po_display_id: string | null
    po_order_number: string | null
    vendor_name: string | null
    received_by_name: string | null
}

export interface ReceivesQueryParams {
    page?: number
    pageSize?: number
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
    status?: 'draft' | 'completed' | 'cancelled'
    purchaseOrderId?: string
    search?: string
}

export async function getPaginatedReceives(
    params: ReceivesQueryParams = {}
): Promise<PaginatedReceivesResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) {
        return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    }
    const { context } = authResult

    const {
        page = 1,
        pageSize = 20,
        sortColumn = 'created_at',
        sortDirection = 'desc',
        status,
        purchaseOrderId,
        search
    } = params

    // Validate and sanitize parameters
    const sanitizedPage = Math.max(1, page)
    const sanitizedPageSize = Math.min(100, Math.max(1, pageSize))
    const offset = (sanitizedPage - 1) * sanitizedPageSize

    // Map sort columns to database columns
    const columnMap: Record<string, string> = {
        display_id: 'display_id',
        status: 'status',
        received_date: 'received_date',
        delivery_note_number: 'delivery_note_number',
        carrier: 'carrier',
        completed_at: 'completed_at',
        created_at: 'created_at',
    }

    const dbSortColumn = columnMap[sortColumn] || 'created_at'
    const ascending = sortDirection === 'asc'

    const supabase = await createClient()

    // Build query for count
     
    let countQuery = (supabase as any)
        .from('receives')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', context.tenantId)

    // Build query for data
     
    let dataQuery = (supabase as any)
        .from('receives')
        .select(`
            id,
            display_id,
            status,
            received_date,
            delivery_note_number,
            carrier,
            tracking_number,
            completed_at,
            created_at,
            purchase_orders(display_id, order_number, vendors(name)),
            profiles!receives_received_by_fkey(full_name)
        `)
        .eq('tenant_id', context.tenantId)
        .order(dbSortColumn, { ascending })
        .range(offset, offset + sanitizedPageSize - 1)

    // Apply filters
    if (status) {
        const statusValidation = z.enum(['draft', 'completed', 'cancelled']).safeParse(status)
        if (statusValidation.success) {
            countQuery = countQuery.eq('status', statusValidation.data)
            dataQuery = dataQuery.eq('status', statusValidation.data)
        }
    }

    if (purchaseOrderId) {
        const idValidation = z.string().uuid().safeParse(purchaseOrderId)
        if (idValidation.success) {
            countQuery = countQuery.eq('purchase_order_id', purchaseOrderId)
            dataQuery = dataQuery.eq('purchase_order_id', purchaseOrderId)
        }
    }

    if (search) {
        const searchPattern = `%${escapeSqlLike(search)}%`
        countQuery = countQuery.or(`display_id.ilike.${searchPattern},delivery_note_number.ilike.${searchPattern},tracking_number.ilike.${searchPattern}`)
        dataQuery = dataQuery.or(`display_id.ilike.${searchPattern},delivery_note_number.ilike.${searchPattern},tracking_number.ilike.${searchPattern}`)
    }

    // Execute queries
    const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
    ])

    const total = countResult.count || 0
    const totalPages = Math.ceil(total / sanitizedPageSize)

    // Transform data
    const data: ReceiveListItem[] = (dataResult.data || []).map((r: {
        id: string
        display_id: string | null
        status: 'draft' | 'completed' | 'cancelled'
        received_date: string
        delivery_note_number: string | null
        carrier: string | null
        tracking_number: string | null
        completed_at: string | null
        created_at: string
        purchase_orders: { display_id: string | null; order_number: string | null; vendors: { name: string } | null } | null
        profiles: { full_name: string } | null
    }) => ({
        id: r.id,
        display_id: r.display_id,
        status: r.status,
        received_date: r.received_date,
        delivery_note_number: r.delivery_note_number,
        carrier: r.carrier,
        tracking_number: r.tracking_number,
        completed_at: r.completed_at,
        created_at: r.created_at,
        po_display_id: r.purchase_orders?.display_id || null,
        po_order_number: r.purchase_orders?.order_number || null,
        vendor_name: r.purchase_orders?.vendors?.name || null,
        received_by_name: r.profiles?.full_name || null
    }))

    return {
        data,
        total,
        page: sanitizedPage,
        pageSize: sanitizedPageSize,
        totalPages
    }
}

// Get serial numbers for a receive item
export async function getReceiveItemSerials(
    receiveItemId: string
): Promise<ReceiveItemSerial[]> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return []
    const { context } = authResult

    // 2. Validate receiveItemId
    const idValidation = z.string().uuid().safeParse(receiveItemId)
    if (!idValidation.success) return []

    const supabase = await createClient()

    // 3. Verify receive item belongs to user's tenant
     
    const { data: receiveItem, error: fetchError } = await (supabase as any)
        .from('receive_items')
        .select('receive_id, receives!inner(tenant_id)')
        .eq('id', receiveItemId)
        .single()

    if (fetchError || !receiveItem) {
        return []
    }

    if (receiveItem.receives?.tenant_id !== context.tenantId) {
        return []
    }

     
    const { data, error } = await (supabase as any)
        .from('receive_item_serials')
        .select('*')
        .eq('receive_item_id', receiveItemId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Get serials error:', error)
        return []
    }

    return data || []
}
