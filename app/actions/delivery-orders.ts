'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireFeatureSafe } from '@/lib/features/gating.server'
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

export type DeliveryOrderResult = {
    success: boolean
    error?: string
    delivery_order_id?: string
    display_id?: string
}

// Result type for inventory update operations
interface InventoryUpdateResult {
    success: boolean
    errors: string[]
    itemsUpdated: number
}

// Helper function to update inventory when a delivery order is dispatched
// This handles serials, lots, and non-tracked items
async function updateInventoryOnDispatch(
    supabase: Awaited<ReturnType<typeof createClient>>,
    deliveryOrderId: string,
    tenantId: string
): Promise<InventoryUpdateResult> {
    const errors: string[] = []
    let itemsUpdated = 0

    // Get all DO items with their tracking records
    const { data: items, error: itemsError } = await (supabase as any)
        .from('delivery_order_items')
        .select(`
            id,
            item_id,
            quantity_shipped,
            delivery_order_item_serials (
                id,
                serial_number,
                lot_id,
                quantity
            )
        `)
        .eq('delivery_order_id', deliveryOrderId)

    if (itemsError || !items) {
        const errorMsg = `Error fetching DO items for inventory update: ${itemsError?.message || 'No items found'}`
        console.error(errorMsg)
        return { success: false, errors: [errorMsg], itemsUpdated: 0 }
    }

    for (const item of items as {
        id: string
        item_id: string | null
        quantity_shipped: number
        delivery_order_item_serials: Array<{
            id: string
            serial_number: string
            lot_id: string | null
            quantity: number
        }> | null
    }[]) {
        // Skip items without inventory reference
        if (!item.item_id) continue

        const tracking = item.delivery_order_item_serials || []

        // Separate lots and serials based on whether lot_id is present
        const lotRecords = tracking.filter(t => t.lot_id)
        const serialRecords = tracking.filter(t => !t.lot_id)

        // 1. Update serials to 'sold' status
        if (serialRecords.length > 0) {
            const serialNumbers = serialRecords.map(s => s.serial_number)

            // Look up serial IDs from serial_numbers table
            const { data: serials, error: serialsError } = await (supabase as any)
                .from('serial_numbers')
                .select('id')
                .eq('item_id', item.item_id)
                .in('serial_number', serialNumbers)
                .eq('status', 'available')

            if (serialsError) {
                const errorMsg = `Error fetching serial IDs: ${serialsError.message}`
                console.error(errorMsg)
                errors.push(errorMsg)
            } else if (serials && serials.length > 0) {
                const serialIds = serials.map((s: { id: string }) => s.id)

                // Use the stock_out_serials RPC function
                const { data: result, error: stockOutError } = await (supabase as any)
                    .rpc('stock_out_serials', {
                        p_item_id: item.item_id,
                        p_serial_ids: serialIds,
                        p_reason: `Dispatched on delivery order`,
                        p_new_status: 'sold'
                    })

                if (stockOutError) {
                    const errorMsg = `Error stocking out serials: ${stockOutError.message}`
                    console.error(errorMsg)
                    errors.push(errorMsg)
                } else if (result?.success === false) {
                    const errorMsg = `Stock out serials failed: ${result.error}`
                    console.error(errorMsg)
                    errors.push(errorMsg)
                } else {
                    itemsUpdated++
                }
            }
        }

        // 2. Decrease lot quantities using Promise.all for parallel execution
        if (lotRecords.length > 0) {
            const lotPromises = lotRecords
                .filter(r => r.lot_id)
                .map(lotRecord =>
                    (supabase as any).rpc('adjust_lot_quantity', {
                        p_lot_id: lotRecord.lot_id,
                        p_quantity_delta: -lotRecord.quantity,
                        p_reason: 'Dispatched on delivery order'
                    })
                )

            const lotResults = await Promise.all(lotPromises)
            lotResults.forEach((result: { data: { success?: boolean; error?: string } | null; error: { message: string } | null }, index: number) => {
                if (result.error) {
                    const errorMsg = `Lot adjustment failed: ${result.error.message}`
                    console.error(errorMsg)
                    errors.push(errorMsg)
                } else if (result.data?.success === false) {
                    const errorMsg = `Lot quantity adjustment failed: ${result.data.error}`
                    console.error(errorMsg)
                    errors.push(errorMsg)
                } else {
                    itemsUpdated++
                }
            })
        }

        // 3. For non-tracked items (no tracking records), decrease inventory quantity directly
        if (tracking.length === 0 && item.quantity_shipped > 0) {
            // Check if item has tracking mode
            const { data: itemData } = await (supabase as any)
                .from('inventory_items')
                .select('tracking_mode, quantity')
                .eq('id', item.item_id)
                .eq('tenant_id', tenantId)
                .single()

            // Only decrease quantity for non-tracked items
            if (itemData && itemData.tracking_mode === 'none') {
                const newQuantity = Math.max(0, (itemData.quantity || 0) - item.quantity_shipped)

                const { error: updateError } = await (supabase as any)
                    .from('inventory_items')
                    .update({
                        quantity: newQuantity,
                        status: newQuantity <= 0 ? 'out_of_stock' : 'in_stock',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.item_id)
                    .eq('tenant_id', tenantId)

                if (updateError) {
                    const errorMsg = `Error updating non-tracked item quantity: ${updateError.message}`
                    console.error(errorMsg)
                    errors.push(errorMsg)
                } else {
                    itemsUpdated++
                }
            }
        }
    }

    return {
        success: errors.length === 0,
        errors,
        itemsUpdated
    }
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
    // Feature gate: Delivery orders require Growth+ plan
    const featureCheck = await requireFeatureSafe('delivery_orders')
    if (featureCheck.error) return { success: false, error: featureCheck.error }

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
    const { data, error } = await (supabase as any).rpc('create_delivery_order_from_sales_order', {
        p_sales_order_id: salesOrderId,
    })

    if (error) {
        console.error('Create DO error:', error)
        return { success: false, error: error.message }
    }

    const result = Array.isArray(data) ? data[0] : data

    if (!result?.delivery_order_id) {
        return { success: false, error: 'Failed to create delivery order' }
    }

    revalidatePath('/tasks/delivery-orders')
    revalidatePath(`/tasks/sales-orders/${salesOrderId}`)
    return { success: true, delivery_order_id: result.delivery_order_id, display_id: result.display_id }
}

// Input for creating DO from pick list
export interface CreateDeliveryOrderFromPickListInput {
    pick_list_id: string
    carrier?: string | null
    tracking_number?: string | null
    scheduled_date?: string | null
}

// Create delivery order from a completed pick list
export async function createDeliveryOrderFromPickList(
    input: CreateDeliveryOrderFromPickListInput
): Promise<DeliveryOrderResult> {
    // Feature gate: Delivery orders require Growth+ plan
    const featureCheck = await requireFeatureSafe('delivery_orders')
    if (featureCheck.error) return { success: false, error: featureCheck.error }

    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // Verify pick list belongs to tenant
    const pickListCheck = await verifyRelatedTenantOwnership(
        'pick_lists',
        input.pick_list_id,
        context.tenantId,
        'Pick List'
    )
    if (!pickListCheck.success) return { success: false, error: pickListCheck.error }

    const supabase = await createClient()

    // Create delivery order from pick list using RPC
    const { data: doId, error: createError } = await (supabase as any).rpc(
        'create_delivery_order_from_pick_list',
        {
            p_pick_list_id: input.pick_list_id,
            p_carrier: input.carrier || null,
            p_tracking_number: input.tracking_number || null,
            p_scheduled_date: input.scheduled_date || null,
        }
    )

    if (createError) {
        console.error('Create DO from pick list error:', createError)
        return { success: false, error: createError.message }
    }

    if (!doId) {
        return { success: false, error: 'Failed to create delivery order' }
    }

    // Get delivery order display_id for response
    const { data: doData } = await (supabase as any)
        .from('delivery_orders')
        .select('display_id')
        .eq('id', doId)
        .single()

    // Copy tracking from pick list items to delivery order items
    await copyPickListTrackingToDeliveryOrder(supabase, doId, context.tenantId)

    revalidatePath('/tasks/delivery-orders')
    revalidatePath(`/tasks/pick-lists/${input.pick_list_id}`)
    return {
        success: true,
        delivery_order_id: doId,
        display_id: doData?.display_id || null,
    }
}

// Helper function to copy serial/lot tracking from pick list items to delivery order items
async function copyPickListTrackingToDeliveryOrder(
    supabase: Awaited<ReturnType<typeof createClient>>,
    deliveryOrderId: string,
    tenantId: string
): Promise<void> {
    // Get delivery order items with their pick_list_item_ids
    const { data: doItems, error: doItemsError } = await (supabase as any)
        .from('delivery_order_items')
        .select('id, pick_list_item_id')
        .eq('delivery_order_id', deliveryOrderId)
        .not('pick_list_item_id', 'is', null)

    if (doItemsError || !doItems || doItems.length === 0) {
        // No items to process or error - not fatal, DO is already created
        if (doItemsError) {
            console.error('Error fetching DO items for tracking copy:', doItemsError)
        }
        return
    }

    // Collect all inserts to batch at the end (reduces N*M database calls to 1)
    const allInserts: Array<{
        delivery_order_item_id: string
        serial_number: string
        lot_id?: string
        quantity: number
    }> = []

    // Process each delivery order item to collect tracking data
    for (const doItem of doItems as { id: string; pick_list_item_id: string }[]) {
        try {
            // Get tracking from pick list item using the RPC function
            // Note: RPC calls still need to be per-item (can't easily batch these)
            const { data: tracking, error: trackingError } = await (supabase as any)
                .rpc('get_pick_list_item_tracking', {
                    p_pick_list_item_id: doItem.pick_list_item_id,
                })

            if (trackingError || !tracking?.success) {
                console.error(
                    'Error getting tracking for pick list item:',
                    doItem.pick_list_item_id,
                    trackingError || tracking?.error
                )
                continue
            }

            // Collect lot tracking records
            if (tracking.lots && Array.isArray(tracking.lots) && tracking.lots.length > 0) {
                for (const lot of tracking.lots as {
                    lot_id: string
                    lot_number: string
                    quantity: number
                }[]) {
                    allInserts.push({
                        delivery_order_item_id: doItem.id,
                        lot_id: lot.lot_id,
                        quantity: lot.quantity,
                        serial_number: lot.lot_number, // Store lot number for display
                    })
                }
            }

            // Collect serial tracking records
            if (tracking.serials && Array.isArray(tracking.serials) && tracking.serials.length > 0) {
                for (const serial of tracking.serials as {
                    serial_id: string
                    serial_number: string
                }[]) {
                    allInserts.push({
                        delivery_order_item_id: doItem.id,
                        serial_number: serial.serial_number,
                        quantity: 1, // Serials are always quantity 1
                    })
                }
            }
        } catch (err) {
            // Log but don't fail - the DO is already created
            console.error('Error processing tracking for DO item:', doItem.id, err)
        }
    }

    // Single batch insert at the end (reduces N*M inserts to 1 insert)
    if (allInserts.length > 0) {
        const { error: insertError } = await (supabase as any)
            .from('delivery_order_item_serials')
            .insert(allInserts)

        if (insertError) {
            console.error('Error batch inserting tracking records:', insertError)
        }
    }
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

    // If dispatched, update inventory (serials, lots, and non-tracked items)
    if (newStatus === 'dispatched') {
        const inventoryResult = await updateInventoryOnDispatch(supabase, deliveryOrderId, context.tenantId)
        if (!inventoryResult.success) {
            console.warn('Inventory update completed with errors:', inventoryResult.errors)
            // Log activity for inventory update failures (for operations team visibility)
            try {
                await (supabase as any).from('activity_logs').insert({
                    tenant_id: context.tenantId,
                    user_id: context.userId,
                    entity_type: 'delivery_order',
                    entity_id: deliveryOrderId,
                    action_type: 'inventory_update_partial_failure',
                    changes: {
                        status: 'dispatched',
                        inventory_errors: inventoryResult.errors,
                        items_updated: inventoryResult.itemsUpdated,
                        message: 'Delivery order dispatched but some inventory updates failed. Manual review may be required.'
                    }
                })
            } catch (logError) {
                console.error('Failed to log inventory update failure:', logError)
            }
        }
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
                const { data: incrementResult, error: incrementError } = await (supabase as any).rpc('increment_so_item_shipped', {
                    p_so_item_id: item.sales_order_item_id,
                    p_quantity: item.quantity_shipped
                })
                if (incrementError) {
                    console.error('Failed to increment SO item shipped quantity:', incrementError)
                    return { success: false, error: incrementError.message }
                }
                if (incrementResult?.success === false) {
                    return {
                        success: false,
                        error: incrementResult.error || 'Failed to increment shipped quantity'
                    }
                }
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
        const escapedQuery = escapeSqlLike(query)
        queryBuilder = queryBuilder.or(`name.ilike.%${escapedQuery}%,sku.ilike.%${escapedQuery}%`)
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
        const searchPattern = `%${escapeSqlLike(search)}%`
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
