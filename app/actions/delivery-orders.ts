'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
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

export type DeliveryOrderResult = {
    success: boolean
    error?: string
    delivery_order_id?: string
    display_id?: string
}

// Status state machine
const DO_STATUS_TRANSITIONS: Record<string, string[]> = {
    draft: ['ready', 'cancelled'],
    ready: ['dispatched', 'draft', 'cancelled'],
    dispatched: ['in_transit', 'delivered', 'failed'],
    in_transit: ['delivered', 'failed', 'partial'],
    delivered: ['partial'],  // Can mark partial after delivery
    partial: ['delivered'],  // Complete partial delivery
    failed: ['ready', 'returned', 'cancelled'],
    returned: ['cancelled'],
    cancelled: ['draft'],
}

function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    if (currentStatus === newStatus) return true
    const allowedTransitions = DO_STATUS_TRANSITIONS[currentStatus] || []
    return allowedTransitions.includes(newStatus)
}

// Validation schemas - base object for partial/omit operations
const deliveryOrderBaseSchema = z.object({
    sales_order_id: optionalUuidSchema,
    customer_id: optionalUuidSchema,
    pick_list_id: optionalUuidSchema,
    carrier: optionalStringSchema,
    tracking_number: optionalStringSchema,
    shipping_method: optionalStringSchema,
    scheduled_date: optionalDateStringSchema,
    ship_to_name: optionalStringSchema,
    ship_to_address1: optionalStringSchema,
    ship_to_address2: optionalStringSchema,
    ship_to_city: optionalStringSchema,
    ship_to_state: optionalStringSchema,
    ship_to_postal_code: optionalStringSchema,
    ship_to_country: optionalStringSchema,
    ship_to_phone: optionalStringSchema,
    total_packages: z.number().int().min(1).optional(),
    total_weight: z.number().min(0).optional(),
    weight_unit: z.enum(['kg', 'lb', 'oz', 'g']).optional(),
    notes: z.string().max(2000).nullable().optional(),
})

// Create schema with refinement for required source
const createDeliveryOrderSchema = deliveryOrderBaseSchema.refine(
    data => data.sales_order_id || data.customer_id,
    { message: 'Either sales_order_id or customer_id is required' }
)

// Update schema - use base object for partial/omit (no refinement needed for updates)
const updateDeliveryOrderSchema = deliveryOrderBaseSchema.partial().omit({ sales_order_id: true })

const deliveryOrderItemSchema = z.object({
    sales_order_item_id: optionalUuidSchema,
    pick_list_item_id: optionalUuidSchema,
    item_id: optionalUuidSchema,
    item_name: z.string().min(1).max(500),
    sku: optionalStringSchema,
    quantity_shipped: quantitySchema,
    notes: z.string().max(2000).nullable().optional(),
})

export interface CreateDeliveryOrderInput {
    sales_order_id?: string | null
    customer_id?: string | null
    pick_list_id?: string | null
    carrier?: string | null
    tracking_number?: string | null
    shipping_method?: string | null
    scheduled_date?: string | null
    ship_to_name?: string | null
    ship_to_address1?: string | null
    ship_to_address2?: string | null
    ship_to_city?: string | null
    ship_to_state?: string | null
    ship_to_postal_code?: string | null
    ship_to_country?: string | null
    ship_to_phone?: string | null
    total_packages?: number
    total_weight?: number
    weight_unit?: 'kg' | 'lb' | 'oz' | 'g'
    notes?: string | null
}

export interface DeliveryOrderItemInput {
    sales_order_item_id?: string | null
    pick_list_item_id?: string | null
    item_id?: string | null
    item_name: string
    sku?: string | null
    quantity_shipped: number
    notes?: string | null
}

// Create delivery order (linked to SO or standalone with customer)
export async function createDeliveryOrder(input: CreateDeliveryOrderInput): Promise<DeliveryOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(createDeliveryOrderSchema, input)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    const supabase = await createClient()
    let shippingDefaults: Record<string, string | null> = {}
    let customerId: string | null = null

    // If linked to sales order, verify and get shipping defaults
    if (validatedInput.sales_order_id) {
        const soCheck = await verifyRelatedTenantOwnership(
            'sales_orders',
            validatedInput.sales_order_id,
            context.tenantId,
            'Sales Order'
        )
        if (!soCheck.success) return { success: false, error: soCheck.error }

        const { data: so, error: soError } = await (supabase as any)
            .from('sales_orders')
            .select(`
                customer_id,
                ship_to_name, ship_to_address1, ship_to_address2,
                ship_to_city, ship_to_state, ship_to_postal_code,
                ship_to_country, ship_to_phone,
                customers(name)
            `)
            .eq('id', validatedInput.sales_order_id)
            .eq('tenant_id', context.tenantId)
            .single()

        if (soError) {
            console.error('Get SO error:', soError)
            return { success: false, error: soError.message }
        }

        customerId = so?.customer_id || null
        shippingDefaults = {
            ship_to_name: so?.ship_to_name || so?.customers?.name || null,
            ship_to_address1: so?.ship_to_address1 || null,
            ship_to_address2: so?.ship_to_address2 || null,
            ship_to_city: so?.ship_to_city || null,
            ship_to_state: so?.ship_to_state || null,
            ship_to_postal_code: so?.ship_to_postal_code || null,
            ship_to_country: so?.ship_to_country || null,
            ship_to_phone: so?.ship_to_phone || null,
        }
    }
    // If standalone with customer, verify customer and get defaults
    else if (validatedInput.customer_id) {
        const custCheck = await verifyRelatedTenantOwnership(
            'customers',
            validatedInput.customer_id,
            context.tenantId,
            'Customer'
        )
        if (!custCheck.success) return { success: false, error: custCheck.error }

        customerId = validatedInput.customer_id

        const { data: customer } = await (supabase as any)
            .from('customers')
            .select('name, shipping_address1, shipping_address2, shipping_city, shipping_state, shipping_postal_code, shipping_country, phone')
            .eq('id', validatedInput.customer_id)
            .eq('tenant_id', context.tenantId)
            .single()

        if (customer) {
            shippingDefaults = {
                ship_to_name: customer.name || null,
                ship_to_address1: customer.shipping_address1 || null,
                ship_to_address2: customer.shipping_address2 || null,
                ship_to_city: customer.shipping_city || null,
                ship_to_state: customer.shipping_state || null,
                ship_to_postal_code: customer.shipping_postal_code || null,
                ship_to_country: customer.shipping_country || null,
                ship_to_phone: customer.phone || null,
            }
        }
    }

    // Generate display ID
    const { data: displayId } = await (supabase as any).rpc(
        'generate_display_id_for_current_user',
        { p_entity_type: 'delivery_order' }
    )

    // Create delivery order
    const { data, error } = await (supabase as any)
        .from('delivery_orders')
        .insert({
            tenant_id: context.tenantId,
            display_id: displayId,
            sales_order_id: validatedInput.sales_order_id || null,
            customer_id: customerId,
            pick_list_id: validatedInput.pick_list_id || null,
            carrier: validatedInput.carrier || null,
            tracking_number: validatedInput.tracking_number || null,
            shipping_method: validatedInput.shipping_method || null,
            scheduled_date: validatedInput.scheduled_date || null,
            // Use provided address or defaults
            ship_to_name: validatedInput.ship_to_name || shippingDefaults.ship_to_name || null,
            ship_to_address1: validatedInput.ship_to_address1 || shippingDefaults.ship_to_address1 || null,
            ship_to_address2: validatedInput.ship_to_address2 || shippingDefaults.ship_to_address2 || null,
            ship_to_city: validatedInput.ship_to_city || shippingDefaults.ship_to_city || null,
            ship_to_state: validatedInput.ship_to_state || shippingDefaults.ship_to_state || null,
            ship_to_postal_code: validatedInput.ship_to_postal_code || shippingDefaults.ship_to_postal_code || null,
            ship_to_country: validatedInput.ship_to_country || shippingDefaults.ship_to_country || null,
            ship_to_phone: validatedInput.ship_to_phone || shippingDefaults.ship_to_phone || null,
            total_packages: validatedInput.total_packages || 1,
            total_weight: validatedInput.total_weight || null,
            weight_unit: validatedInput.weight_unit || 'kg',
            notes: validatedInput.notes || null,
            created_by: context.userId,
            status: 'draft',
        })
        .select('id, display_id')
        .single()

    if (error) {
        console.error('Create DO error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/delivery-orders')
    if (validatedInput.sales_order_id) {
        revalidatePath(`/tasks/sales-orders/${validatedInput.sales_order_id}`)
    }
    return { success: true, delivery_order_id: data.id, display_id: data.display_id }
}

// Create delivery order from picked sales order items
export async function createDeliveryOrderFromSO(salesOrderId: string): Promise<DeliveryOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get SO with items that have been picked
     
    const { data: so, error: soError } = await (supabase as any)
        .from('sales_orders')
        .select(`
            *,
            customers(name),
            sales_order_items(
                id, item_id, item_name, sku,
                quantity_ordered, quantity_picked, quantity_shipped
            )
        `)
        .eq('id', salesOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (soError || !so) {
        return { success: false, error: 'Sales order not found' }
    }

    // Check SO is in correct status
    if (!['picked', 'partial_shipped'].includes(so.status)) {
        return { success: false, error: 'Sales order must be in picked or partial shipped status' }
    }

    // Find items ready to ship (picked > shipped)
    const itemsToShip = (so.sales_order_items || []).filter(
        (item: { quantity_picked: number; quantity_shipped: number }) =>
            item.quantity_picked > item.quantity_shipped
    )

    if (itemsToShip.length === 0) {
        return { success: false, error: 'No items ready to ship' }
    }

    // Generate display ID
     
    const { data: displayId } = await (supabase as any).rpc(
        'generate_display_id_for_current_user',
        { p_entity_type: 'delivery_order' }
    )

    // Create delivery order
     
    const { data: doData, error: doError } = await (supabase as any)
        .from('delivery_orders')
        .insert({
            tenant_id: context.tenantId,
            display_id: displayId,
            sales_order_id: salesOrderId,
            pick_list_id: so.pick_list_id || null,
            ship_to_name: so.ship_to_name || so.customers?.name || null,
            ship_to_address1: so.ship_to_address1 || null,
            ship_to_address2: so.ship_to_address2 || null,
            ship_to_city: so.ship_to_city || null,
            ship_to_state: so.ship_to_state || null,
            ship_to_postal_code: so.ship_to_postal_code || null,
            ship_to_country: so.ship_to_country || null,
            ship_to_phone: so.ship_to_phone || null,
            created_by: context.userId,
            status: 'draft',
        })
        .select('id, display_id')
        .single()

    if (doError) {
        console.error('Create DO error:', doError)
        return { success: false, error: doError.message }
    }

    // Create delivery order items
    const doItems = itemsToShip.map((item: {
        id: string
        item_id: string | null
        item_name: string
        sku: string | null
        quantity_picked: number
        quantity_shipped: number
    }) => ({
        delivery_order_id: doData.id,
        sales_order_item_id: item.id,
        item_id: item.item_id || null,
        item_name: item.item_name,
        sku: item.sku || null,
        quantity_shipped: item.quantity_picked - item.quantity_shipped,
    }))

     
    const { error: itemsError } = await (supabase as any)
        .from('delivery_order_items')
        .insert(doItems)

    if (itemsError) {
        console.error('Create DO items error:', itemsError)
        // Rollback DO creation
         
        await (supabase as any).from('delivery_orders').delete().eq('id', doData.id)
        return { success: false, error: itemsError.message }
    }

    revalidatePath('/tasks/delivery-orders')
    revalidatePath(`/tasks/sales-orders/${salesOrderId}`)
    return { success: true, delivery_order_id: doData.id, display_id: doData.display_id }
}

// Get delivery order with details
export async function getDeliveryOrder(deliveryOrderId: string) {
    const authResult = await getAuthContext()
    if (!authResult.success) return null
    const { context } = authResult

    const supabase = await createClient()

    const { data } = await (supabase as any)
        .from('delivery_orders')
        .select(`
            *,
            sales_orders(id, display_id, customer_id, customers(id, name, email, phone)),
            customers(id, name, email, phone),
            pick_lists(id, display_id),
            delivery_order_items(
                *,
                inventory_items(id, name, sku, image_urls)
            ),
            created_by_profile:profiles!delivery_orders_created_by_fkey(full_name),
            dispatched_by_profile:profiles!delivery_orders_dispatched_by_fkey(full_name)
        `)
        .eq('id', deliveryOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    return data
}

// Update delivery order
export async function updateDeliveryOrder(
    deliveryOrderId: string,
    updates: Partial<Omit<CreateDeliveryOrderInput, 'sales_order_id'>>
): Promise<DeliveryOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(updateDeliveryOrderSchema, updates)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedUpdates = validation.data

    const ownershipResult = await verifyTenantOwnership('delivery_orders', deliveryOrderId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Check status allows updates
     
    const { data: currentDO } = await (supabase as any)
        .from('delivery_orders')
        .select('status')
        .eq('id', deliveryOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (currentDO && !['draft', 'ready'].includes(currentDO.status)) {
        return { success: false, error: 'Cannot update delivery order after dispatch' }
    }

     
    const { error } = await (supabase as any)
        .from('delivery_orders')
        .update({
            ...validatedUpdates,
            updated_at: new Date().toISOString()
        })
        .eq('id', deliveryOrderId)
        .eq('tenant_id', context.tenantId)

    if (error) {
        console.error('Update DO error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/delivery-orders')
    revalidatePath(`/tasks/delivery-orders/${deliveryOrderId}`)
    return { success: true }
}

// Update delivery order status
export async function updateDeliveryOrderStatus(
    deliveryOrderId: string,
    newStatus: string,
    additionalData?: {
        received_by?: string
        delivery_notes?: string
    }
): Promise<DeliveryOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const ownershipResult = await verifyTenantOwnership('delivery_orders', deliveryOrderId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Get current status
     
    const { data: currentDO, error: fetchError } = await (supabase as any)
        .from('delivery_orders')
        .select('status, sales_order_id, display_id')
        .eq('id', deliveryOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (fetchError || !currentDO) {
        return { success: false, error: 'Delivery order not found' }
    }

    // Validate transition
    if (!isValidStatusTransition(currentDO.status, newStatus)) {
        return {
            success: false,
            error: `Invalid status transition: cannot change from '${currentDO.status}' to '${newStatus}'`
        }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
    }

    // Add tracking fields based on status
    if (newStatus === 'dispatched') {
        updateData.dispatched_by = context.userId
        updateData.dispatched_at = new Date().toISOString()
    } else if (newStatus === 'delivered') {
        updateData.delivered_confirmed_by = context.userId
        updateData.delivered_at = new Date().toISOString()
        if (additionalData?.received_by) {
            updateData.received_by = additionalData.received_by
        }
        if (additionalData?.delivery_notes) {
            updateData.delivery_notes = additionalData.delivery_notes
        }
    }

     
    const { error: updateError } = await (supabase as any)
        .from('delivery_orders')
        .update(updateData)
        .eq('id', deliveryOrderId)
        .eq('tenant_id', context.tenantId)

    if (updateError) {
        console.error('Update DO status error:', updateError)
        return { success: false, error: updateError.message }
    }

    // If delivered and linked to SO, update SO item shipped quantities
    if (newStatus === 'delivered' && currentDO.sales_order_id) {
        // Get DO items that have SO item links
        const { data: doItems } = await (supabase as any)
            .from('delivery_order_items')
            .select('sales_order_item_id, quantity_shipped')
            .eq('delivery_order_id', deliveryOrderId)
            .not('sales_order_item_id', 'is', null)

        // Update each SO item's shipped quantity
        for (const item of doItems || []) {
            if (item.sales_order_item_id) {
                await (supabase as any).rpc('increment_so_item_shipped', {
                    p_so_item_id: item.sales_order_item_id,
                    p_quantity: item.quantity_shipped
                })
            }
        }

        // Check if all items are shipped to update SO status
        const { data: soItems } = await (supabase as any)
            .from('sales_order_items')
            .select('quantity_ordered, quantity_shipped')
            .eq('sales_order_id', currentDO.sales_order_id)

        const allShipped = (soItems || []).every(
            (item: { quantity_ordered: number; quantity_shipped: number }) =>
                item.quantity_shipped >= item.quantity_ordered
        )

        if (allShipped) {
            await (supabase as any)
                .from('sales_orders')
                .update({ status: 'shipped', updated_at: new Date().toISOString() })
                .eq('id', currentDO.sales_order_id)
        } else {
            await (supabase as any)
                .from('sales_orders')
                .update({ status: 'partial_shipped', updated_at: new Date().toISOString() })
                .eq('id', currentDO.sales_order_id)
        }
    }

    revalidatePath('/tasks/delivery-orders')
    revalidatePath(`/tasks/delivery-orders/${deliveryOrderId}`)
    if (currentDO.sales_order_id) {
        revalidatePath(`/tasks/sales-orders/${currentDO.sales_order_id}`)
    }
    return { success: true }
}

// Add item to delivery order
export async function addDeliveryOrderItem(
    deliveryOrderId: string,
    item: DeliveryOrderItemInput
): Promise<DeliveryOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(deliveryOrderItemSchema, item)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedItem = validation.data

    const ownershipResult = await verifyTenantOwnership('delivery_orders', deliveryOrderId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Check DO status
     
    const { data: doData } = await (supabase as any)
        .from('delivery_orders')
        .select('status')
        .eq('id', deliveryOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (doData && !['draft', 'ready'].includes(doData.status)) {
        return { success: false, error: 'Cannot add items after dispatch' }
    }

    const { error } = await (supabase as any)
        .from('delivery_order_items')
        .insert({
            delivery_order_id: deliveryOrderId,
            sales_order_item_id: validatedItem.sales_order_item_id || null,
            pick_list_item_id: validatedItem.pick_list_item_id || null,
            item_id: validatedItem.item_id || null,
            item_name: validatedItem.item_name,
            sku: validatedItem.sku || null,
            quantity_shipped: validatedItem.quantity_shipped,
            notes: validatedItem.notes || null,
        })

    if (error) {
        console.error('Add DO item error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/delivery-orders/${deliveryOrderId}`)
    return { success: true }
}

// Update delivery order item
export async function updateDeliveryOrderItem(
    itemId: string,
    updates: Partial<DeliveryOrderItemInput>
): Promise<DeliveryOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get item and verify parent DO belongs to tenant
     
    const { data: doItem, error: fetchError } = await (supabase as any)
        .from('delivery_order_items')
        .select('delivery_order_id, delivery_orders!inner(tenant_id, status)')
        .eq('id', itemId)
        .single()

    if (fetchError || !doItem) {
        return { success: false, error: 'Delivery order item not found' }
    }

    if (doItem.delivery_orders?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (!['draft', 'ready'].includes(doItem.delivery_orders?.status)) {
        return { success: false, error: 'Cannot update items after dispatch' }
    }

     
    const { error } = await (supabase as any)
        .from('delivery_order_items')
        .update(updates)
        .eq('id', itemId)

    if (error) {
        console.error('Update DO item error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/delivery-orders/${doItem.delivery_order_id}`)
    return { success: true }
}

// Remove item from delivery order
export async function removeDeliveryOrderItem(itemId: string): Promise<DeliveryOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get item and verify parent DO belongs to tenant
     
    const { data: doItem, error: fetchError } = await (supabase as any)
        .from('delivery_order_items')
        .select('delivery_order_id, delivery_orders!inner(tenant_id, status)')
        .eq('id', itemId)
        .single()

    if (fetchError || !doItem) {
        return { success: false, error: 'Delivery order item not found' }
    }

    if (doItem.delivery_orders?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (!['draft', 'ready'].includes(doItem.delivery_orders?.status)) {
        return { success: false, error: 'Cannot remove items after dispatch' }
    }

     
    const { error } = await (supabase as any)
        .from('delivery_order_items')
        .delete()
        .eq('id', itemId)

    if (error) {
        console.error('Remove DO item error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/delivery-orders/${doItem.delivery_order_id}`)
    return { success: true }
}

// Delete delivery order (only draft status)
export async function deleteDeliveryOrder(deliveryOrderId: string): Promise<DeliveryOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Check status and ownership
     
    const { data: doData, error: fetchError } = await (supabase as any)
        .from('delivery_orders')
        .select('status, tenant_id, display_id, sales_order_id')
        .eq('id', deliveryOrderId)
        .single()

    if (fetchError || !doData) {
        return { success: false, error: 'Delivery order not found' }
    }

    if (doData.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (doData.status !== 'draft') {
        return { success: false, error: 'Only draft delivery orders can be deleted' }
    }

    // Delete items first
     
    await (supabase as any)
        .from('delivery_order_items')
        .delete()
        .eq('delivery_order_id', deliveryOrderId)

    // Delete DO
     
    const { error } = await (supabase as any)
        .from('delivery_orders')
        .delete()
        .eq('id', deliveryOrderId)
        .eq('tenant_id', context.tenantId)

    if (error) {
        console.error('Delete DO error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/delivery-orders')
    if (doData.sales_order_id) {
        revalidatePath(`/tasks/sales-orders/${doData.sales_order_id}`)
    }
    return { success: true }
}

// Search inventory items for delivery order (items with available stock)
export async function searchInventoryItemsForDO(query: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Get user's tenant
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

    // Search items with available stock for delivery
    let queryBuilder = (supabase as any)
        .from('inventory_items')
        .select('id, name, sku, quantity, image_urls, unit, price')
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)
        .gt('quantity', 0) // Only items with stock available
        .order('name')
        .limit(20)

    if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
    }

    const { data } = await queryBuilder
    return data || []
}

// Paginated delivery orders list
export interface PaginatedDeliveryOrdersResult {
    data: DeliveryOrderListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface DeliveryOrderListItem {
    id: string
    display_id: string | null
    status: string
    carrier: string | null
    tracking_number: string | null
    scheduled_date: string | null
    dispatched_at: string | null
    delivered_at: string | null
    total_packages: number
    created_at: string
    updated_at: string
    sales_order_display_id: string | null
    customer_name: string | null
    ship_to_city: string | null
    is_standalone: boolean
}

export interface DeliveryOrdersQueryParams {
    page?: number
    pageSize?: number
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
    status?: string
    salesOrderId?: string
    search?: string
}

export async function getPaginatedDeliveryOrders(
    params: DeliveryOrdersQueryParams = {}
): Promise<PaginatedDeliveryOrdersResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) {
        return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    }
    const { context } = authResult

    const {
        page = 1,
        pageSize = 20,
        sortColumn = 'updated_at',
        sortDirection = 'desc',
        status,
        salesOrderId,
        search
    } = params

    const sanitizedPage = Math.max(1, page)
    const sanitizedPageSize = Math.min(100, Math.max(1, pageSize))
    const offset = (sanitizedPage - 1) * sanitizedPageSize

    const columnMap: Record<string, string> = {
        display_id: 'display_id',
        status: 'status',
        carrier: 'carrier',
        scheduled_date: 'scheduled_date',
        updated_at: 'updated_at',
        created_at: 'created_at',
    }

    const dbSortColumn = columnMap[sortColumn] || 'updated_at'
    const ascending = sortDirection === 'asc'

    const supabase = await createClient()

    // Build query for count
     
    let countQuery = (supabase as any)
        .from('delivery_orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', context.tenantId)

    // Build query for data
    let dataQuery = (supabase as any)
        .from('delivery_orders')
        .select(`
            id,
            display_id,
            status,
            carrier,
            tracking_number,
            scheduled_date,
            dispatched_at,
            delivered_at,
            total_packages,
            ship_to_city,
            created_at,
            updated_at,
            sales_order_id,
            sales_orders(display_id, customers(name)),
            customers(name)
        `)
        .eq('tenant_id', context.tenantId)
        .order(dbSortColumn, { ascending })
        .range(offset, offset + sanitizedPageSize - 1)

    // Apply filters
    if (status) {
        countQuery = countQuery.eq('status', status)
        dataQuery = dataQuery.eq('status', status)
    }

    if (salesOrderId) {
        countQuery = countQuery.eq('sales_order_id', salesOrderId)
        dataQuery = dataQuery.eq('sales_order_id', salesOrderId)
    }

    if (search) {
        const searchPattern = `%${search}%`
        countQuery = countQuery.or(`display_id.ilike.${searchPattern},tracking_number.ilike.${searchPattern}`)
        dataQuery = dataQuery.or(`display_id.ilike.${searchPattern},tracking_number.ilike.${searchPattern}`)
    }

    const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
    ])

    const total = countResult.count || 0
    const totalPages = Math.ceil(total / sanitizedPageSize)

    const data: DeliveryOrderListItem[] = (dataResult.data || []).map((doItem: {
        id: string
        display_id: string | null
        status: string
        carrier: string | null
        tracking_number: string | null
        scheduled_date: string | null
        dispatched_at: string | null
        delivered_at: string | null
        total_packages: number
        ship_to_city: string | null
        created_at: string
        updated_at: string
        sales_order_id: string | null
        sales_orders: { display_id: string | null; customers: { name: string } | null } | null
        customers: { name: string } | null
    }) => ({
        id: doItem.id,
        display_id: doItem.display_id,
        status: doItem.status,
        carrier: doItem.carrier,
        tracking_number: doItem.tracking_number,
        scheduled_date: doItem.scheduled_date,
        dispatched_at: doItem.dispatched_at,
        delivered_at: doItem.delivered_at,
        total_packages: doItem.total_packages,
        ship_to_city: doItem.ship_to_city,
        created_at: doItem.created_at,
        updated_at: doItem.updated_at,
        sales_order_display_id: doItem.sales_orders?.display_id || null,
        customer_name: doItem.sales_orders?.customers?.name || doItem.customers?.name || null,
        is_standalone: !doItem.sales_order_id,
    }))

    return {
        data,
        total,
        page: sanitizedPage,
        pageSize: sanitizedPageSize,
        totalPages
    }
}
