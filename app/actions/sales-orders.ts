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
    priceSchema,
    optionalDateStringSchema,
} from '@/lib/auth/server-auth'
import { z } from 'zod'
import { escapeSqlLike } from '@/lib/utils'

export type SalesOrderResult = {
    success: boolean
    error?: string
    sales_order_id?: string
    display_id?: string
    pick_list_id?: string
}

// Status state machine
const SO_STATUS_TRANSITIONS: Record<string, string[]> = {
    draft: ['submitted', 'cancelled'],
    submitted: ['confirmed', 'draft', 'cancelled'],
    confirmed: ['picking', 'cancelled'],
    picking: ['picked', 'cancelled'],
    picked: ['partial_shipped', 'shipped'],
    partial_shipped: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['completed'],
    completed: [],
    cancelled: ['draft'],
}

function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    if (currentStatus === newStatus) return true
    const allowedTransitions = SO_STATUS_TRANSITIONS[currentStatus] || []
    return allowedTransitions.includes(newStatus)
}

// Validation schemas
const salesOrderItemSchema = z.object({
    item_id: optionalUuidSchema,
    item_name: z.string().min(1).max(500),
    sku: optionalStringSchema,
    quantity_ordered: quantitySchema,
    unit_price: priceSchema,
    discount_percent: z.number().min(0).max(100).optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    notes: z.string().max(2000).nullable().optional(),
})

const createSalesOrderSchema = z.object({
    customer_id: optionalUuidSchema,
    order_number: optionalStringSchema,
    order_date: optionalDateStringSchema,
    requested_date: optionalDateStringSchema,
    promised_date: optionalDateStringSchema,
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    ship_to_name: optionalStringSchema,
    ship_to_address1: optionalStringSchema,
    ship_to_address2: optionalStringSchema,
    ship_to_city: optionalStringSchema,
    ship_to_state: optionalStringSchema,
    ship_to_postal_code: optionalStringSchema,
    ship_to_country: optionalStringSchema,
    ship_to_phone: optionalStringSchema,
    bill_to_name: optionalStringSchema,
    bill_to_address1: optionalStringSchema,
    bill_to_address2: optionalStringSchema,
    bill_to_city: optionalStringSchema,
    bill_to_state: optionalStringSchema,
    bill_to_postal_code: optionalStringSchema,
    bill_to_country: optionalStringSchema,
    source_location_id: optionalUuidSchema,
    payment_term_id: optionalUuidSchema,
    internal_notes: z.string().max(2000).nullable().optional(),
    customer_notes: z.string().max(2000).nullable().optional(),
})

const updateSalesOrderSchema = createSalesOrderSchema.partial()

export interface CreateSalesOrderInput {
    customer_id?: string | null
    order_number?: string | null
    order_date?: string | null
    requested_date?: string | null
    promised_date?: string | null
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    ship_to_name?: string | null
    ship_to_address1?: string | null
    ship_to_address2?: string | null
    ship_to_city?: string | null
    ship_to_state?: string | null
    ship_to_postal_code?: string | null
    ship_to_country?: string | null
    ship_to_phone?: string | null
    bill_to_name?: string | null
    bill_to_address1?: string | null
    bill_to_address2?: string | null
    bill_to_city?: string | null
    bill_to_state?: string | null
    bill_to_postal_code?: string | null
    bill_to_country?: string | null
    source_location_id?: string | null
    payment_term_id?: string | null
    internal_notes?: string | null
    customer_notes?: string | null
}

export interface SalesOrderItemInput {
    item_id?: string | null
    item_name: string
    sku?: string | null
    quantity_ordered: number
    unit_price: number
    discount_percent?: number
    tax_rate?: number
    notes?: string | null
}

// Create a draft sales order
export async function createDraftSalesOrder(): Promise<SalesOrderResult> {
    // Feature gate: Sales orders require Growth+ plan
    const featureCheck = await requireFeatureSafe('sales_orders')
    if (featureCheck.error) return { success: false, error: featureCheck.error }

    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

     
    const { data, error } = await (supabase as any).rpc('create_sales_order', {
        p_customer_id: null,
        p_order_number: null,
        p_order_date: new Date().toISOString().split('T')[0],
        p_requested_date: null,
        p_promised_date: null,
        p_priority: 'normal',
        p_ship_to_name: null,
        p_ship_to_address1: null,
        p_ship_to_address2: null,
        p_ship_to_city: null,
        p_ship_to_state: null,
        p_ship_to_postal_code: null,
        p_ship_to_country: null,
        p_ship_to_phone: null,
        p_source_location_id: null,
        p_internal_notes: null,
        p_customer_notes: null,
    })

    if (error) {
        console.error('Create draft SO error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/sales-orders')
    return { success: true, sales_order_id: data?.id, display_id: data?.display_id }
}

// Create a new sales order with data
export async function createSalesOrder(input: CreateSalesOrderInput): Promise<SalesOrderResult> {
    // Feature gate: Sales orders require Growth+ plan
    const featureCheck = await requireFeatureSafe('sales_orders')
    if (featureCheck.error) return { success: false, error: featureCheck.error }

    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(createSalesOrderSchema, input)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    // Verify customer belongs to tenant if provided
    if (validatedInput.customer_id) {
        const customerCheck = await verifyRelatedTenantOwnership(
            'customers',
            validatedInput.customer_id,
            context.tenantId,
            'Customer'
        )
        if (!customerCheck.success) return { success: false, error: customerCheck.error }
    }

    const supabase = await createClient()

     
    const { data, error } = await (supabase as any).rpc('create_sales_order', {
        p_customer_id: validatedInput.customer_id || null,
        p_order_number: validatedInput.order_number || null,
        p_order_date: validatedInput.order_date || new Date().toISOString().split('T')[0],
        p_requested_date: validatedInput.requested_date || null,
        p_promised_date: validatedInput.promised_date || null,
        p_priority: validatedInput.priority || 'normal',
        p_ship_to_name: validatedInput.ship_to_name || null,
        p_ship_to_address1: validatedInput.ship_to_address1 || null,
        p_ship_to_address2: validatedInput.ship_to_address2 || null,
        p_ship_to_city: validatedInput.ship_to_city || null,
        p_ship_to_state: validatedInput.ship_to_state || null,
        p_ship_to_postal_code: validatedInput.ship_to_postal_code || null,
        p_ship_to_country: validatedInput.ship_to_country || null,
        p_ship_to_phone: validatedInput.ship_to_phone || null,
        p_source_location_id: validatedInput.source_location_id || null,
        p_internal_notes: validatedInput.internal_notes || null,
        p_customer_notes: validatedInput.customer_notes || null,
    })

    if (error) {
        console.error('Create SO error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/sales-orders')
    return { success: true, sales_order_id: data?.id, display_id: data?.display_id }
}

// Get a single sales order with details
export async function getSalesOrder(salesOrderId: string) {
    const authResult = await getAuthContext()
    if (!authResult.success) return null
    const { context } = authResult

    const supabase = await createClient()

     
    const { data } = await (supabase as any)
        .from('sales_orders')
        .select(`
            *,
            customers(id, name, customer_code, contact_name, email, phone),
            pick_lists(id, display_id, status),
            created_by_profile:profiles!created_by(full_name),
            assigned_to_profile:profiles!assigned_to(full_name),
            sales_order_items(
                *,
                inventory_items(id, name, sku, quantity, unit, image_urls)
            )
        `)
        .eq('id', salesOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    return data
}

// Get sales order with full details via RPC
export async function getSalesOrderWithDetails(salesOrderId: string) {
    const authResult = await getAuthContext()
    if (!authResult.success) return null

    const supabase = await createClient()

     
    const { data, error } = await (supabase as any).rpc('get_sales_order_with_details', {
        p_sales_order_id: salesOrderId
    })

    if (error) {
        console.error('Get SO details error:', error)
        return null
    }

    return data
}

// Update sales order
export async function updateSalesOrder(
    salesOrderId: string,
    updates: Partial<CreateSalesOrderInput>
): Promise<SalesOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(updateSalesOrderSchema, updates)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedUpdates = validation.data

    const ownershipResult = await verifyTenantOwnership('sales_orders', salesOrderId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    // Verify customer if updating
    if (validatedUpdates.customer_id) {
        const customerCheck = await verifyRelatedTenantOwnership(
            'customers',
            validatedUpdates.customer_id,
            context.tenantId,
            'Customer'
        )
        if (!customerCheck.success) return { success: false, error: customerCheck.error }
    }

    const supabase = await createClient()

    // Get current SO for logging
     
    const { data: currentSO } = await (supabase as any)
        .from('sales_orders')
        .select('display_id, status, customer_id')
        .eq('id', salesOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    // Only allow updates when in draft or submitted status
    if (currentSO && !['draft', 'submitted'].includes(currentSO.status)) {
        return { success: false, error: 'Cannot update sales order after confirmation' }
    }

     
    const { error } = await (supabase as any)
        .from('sales_orders')
        .update({
            ...validatedUpdates,
            updated_at: new Date().toISOString()
        })
        .eq('id', salesOrderId)
        .eq('tenant_id', context.tenantId)

    if (error) {
        console.error('Update SO error:', error)
        return { success: false, error: error.message }
    }

    // Log activity
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'update',
            entity_type: 'sales_order',
            entity_id: salesOrderId,
            entity_name: currentSO?.display_id,
            changes: {
                updated_fields: Object.keys(validatedUpdates),
            }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/tasks/sales-orders')
    revalidatePath(`/tasks/sales-orders/${salesOrderId}`)
    return { success: true }
}

// Update sales order status
export async function updateSalesOrderStatus(
    salesOrderId: string,
    newStatus: string,
    cancellationReason?: string
): Promise<SalesOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const ownershipResult = await verifyTenantOwnership('sales_orders', salesOrderId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Get current status
     
    const { data: currentSO, error: fetchError } = await (supabase as any)
        .from('sales_orders')
        .select('status, tenant_id, display_id, customer_id')
        .eq('id', salesOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (fetchError || !currentSO) {
        return { success: false, error: 'Sales order not found' }
    }

    // Validate transition
    if (!isValidStatusTransition(currentSO.status, newStatus)) {
        return {
            success: false,
            error: `Invalid status transition: cannot change from '${currentSO.status}' to '${newStatus}'`
        }
    }

    // Business rule checks
    if (newStatus === 'submitted' && !currentSO.customer_id) {
        return { success: false, error: 'Cannot submit sales order without a customer' }
    }

    // Check items when submitting
    if (newStatus === 'submitted') {
         
        const { count: itemCount } = await (supabase as any)
            .from('sales_order_items')
            .select('*', { count: 'exact', head: true })
            .eq('sales_order_id', salesOrderId)

        if (!itemCount || itemCount === 0) {
            return { success: false, error: 'Cannot submit sales order without any items' }
        }
    }

    // Handle special transitions
    if (newStatus === 'picking') {
        // Auto-generate pick list via RPC
         
        const { data: pickListId, error: rpcError } = await (supabase as any).rpc(
            'generate_pick_list_from_sales_order',
            { p_sales_order_id: salesOrderId }
        )

        if (rpcError) {
            console.error('Generate pick list error:', rpcError)
            return { success: false, error: rpcError.message }
        }

        revalidatePath('/tasks/sales-orders')
        revalidatePath('/tasks/pick-lists')
        revalidatePath(`/tasks/sales-orders/${salesOrderId}`)
        return { success: true, pick_list_id: pickListId }
    }

    // Standard status update
    const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
    }

    // Add tracking fields based on status
    if (newStatus === 'submitted') {
        updateData.submitted_by = context.userId
        updateData.submitted_at = new Date().toISOString()
    } else if (newStatus === 'confirmed') {
        updateData.confirmed_by = context.userId
        updateData.confirmed_at = new Date().toISOString()
    } else if (newStatus === 'cancelled') {
        updateData.cancelled_by = context.userId
        updateData.cancelled_at = new Date().toISOString()
        updateData.cancellation_reason = cancellationReason || null
    }

     
    const { error: updateError } = await (supabase as any)
        .from('sales_orders')
        .update(updateData)
        .eq('id', salesOrderId)
        .eq('tenant_id', context.tenantId)

    if (updateError) {
        console.error('Update SO status error:', updateError)
        return { success: false, error: updateError.message }
    }

    // Log activity
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'status_change',
            entity_type: 'sales_order',
            entity_id: salesOrderId,
            entity_name: currentSO?.display_id,
            changes: {
                from: currentSO.status,
                to: newStatus,
                cancellation_reason: cancellationReason || undefined
            }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/tasks/sales-orders')
    revalidatePath(`/tasks/sales-orders/${salesOrderId}`)
    return { success: true }
}

// Add item to sales order
export async function addSalesOrderItem(
    salesOrderId: string,
    item: SalesOrderItemInput
): Promise<SalesOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(salesOrderItemSchema, item)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedItem = validation.data

    const ownershipResult = await verifyTenantOwnership('sales_orders', salesOrderId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    // Verify item belongs to tenant if provided
    if (validatedItem.item_id) {
        const itemCheck = await verifyRelatedTenantOwnership(
            'inventory_items',
            validatedItem.item_id,
            context.tenantId,
            'Inventory item'
        )
        if (!itemCheck.success) return { success: false, error: itemCheck.error }
    }

    const supabase = await createClient()

    // Check SO status
     
    const { data: so } = await (supabase as any)
        .from('sales_orders')
        .select('status')
        .eq('id', salesOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (so && !['draft', 'submitted'].includes(so.status)) {
        return { success: false, error: 'Cannot add items to sales order after confirmation' }
    }

    // Calculate line total
    const baseAmount = validatedItem.quantity_ordered * validatedItem.unit_price
    const discountAmount = baseAmount * (validatedItem.discount_percent || 0) / 100
    const lineTotal = baseAmount - discountAmount

     
    const { error } = await (supabase as any)
        .from('sales_order_items')
        .insert({
            sales_order_id: salesOrderId,
            item_id: validatedItem.item_id || null,
            item_name: validatedItem.item_name,
            sku: validatedItem.sku || null,
            quantity_ordered: validatedItem.quantity_ordered,
            unit_price: validatedItem.unit_price,
            discount_percent: validatedItem.discount_percent || 0,
            discount_amount: discountAmount,
            tax_rate: validatedItem.tax_rate || 0,
            line_total: lineTotal,
            notes: validatedItem.notes || null,
        })

    if (error) {
        console.error('Add SO item error:', error)
        return { success: false, error: error.message }
    }

    // Recalculate totals (trigger handles this automatically)
    revalidatePath(`/tasks/sales-orders/${salesOrderId}`)
    return { success: true }
}

// Update sales order item
export async function updateSalesOrderItem(
    itemId: string,
    updates: Partial<SalesOrderItemInput>
): Promise<SalesOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get item and verify parent SO belongs to tenant
     
    const { data: soItem, error: fetchError } = await (supabase as any)
        .from('sales_order_items')
        .select('sales_order_id, sales_orders!inner(tenant_id, status)')
        .eq('id', itemId)
        .single()

    if (fetchError || !soItem) {
        return { success: false, error: 'Sales order item not found' }
    }

    if (soItem.sales_orders?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (!['draft', 'submitted'].includes(soItem.sales_orders?.status)) {
        return { success: false, error: 'Cannot update items after sales order is confirmed' }
    }

    // Calculate new line total if quantity or price changed
    const updateData: Record<string, unknown> = { ...updates }
    if (updates.quantity_ordered !== undefined || updates.unit_price !== undefined) {
         
        const { data: currentItem } = await (supabase as any)
            .from('sales_order_items')
            .select('quantity_ordered, unit_price, discount_percent')
            .eq('id', itemId)
            .single()

        const qty = updates.quantity_ordered ?? currentItem?.quantity_ordered ?? 0
        const price = updates.unit_price ?? currentItem?.unit_price ?? 0
        const discount = updates.discount_percent ?? currentItem?.discount_percent ?? 0

        const baseAmount = qty * price
        const discountAmount = baseAmount * discount / 100
        updateData.discount_amount = discountAmount
        updateData.line_total = baseAmount - discountAmount
    }

     
    const { error } = await (supabase as any)
        .from('sales_order_items')
        .update(updateData)
        .eq('id', itemId)

    if (error) {
        console.error('Update SO item error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/sales-orders/${soItem.sales_order_id}`)
    return { success: true }
}

// Remove item from sales order
export async function removeSalesOrderItem(itemId: string): Promise<SalesOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get item and verify parent SO belongs to tenant
     
    const { data: soItem, error: fetchError } = await (supabase as any)
        .from('sales_order_items')
        .select('sales_order_id, sales_orders!inner(tenant_id, status)')
        .eq('id', itemId)
        .single()

    if (fetchError || !soItem) {
        return { success: false, error: 'Sales order item not found' }
    }

    if (soItem.sales_orders?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (!['draft', 'submitted'].includes(soItem.sales_orders?.status)) {
        return { success: false, error: 'Cannot remove items after sales order is confirmed' }
    }

     
    const { error } = await (supabase as any)
        .from('sales_order_items')
        .delete()
        .eq('id', itemId)

    if (error) {
        console.error('Remove SO item error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/sales-orders/${soItem.sales_order_id}`)
    return { success: true }
}

// Delete sales order (only draft status)
export async function deleteSalesOrder(salesOrderId: string): Promise<SalesOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Check status and ownership
     
    const { data: so, error: fetchError } = await (supabase as any)
        .from('sales_orders')
        .select('status, tenant_id, display_id')
        .eq('id', salesOrderId)
        .single()

    if (fetchError || !so) {
        return { success: false, error: 'Sales order not found' }
    }

    if (so.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (so.status !== 'draft') {
        return { success: false, error: 'Only draft sales orders can be deleted' }
    }

    // Delete items first
     
    await (supabase as any)
        .from('sales_order_items')
        .delete()
        .eq('sales_order_id', salesOrderId)

    // Delete SO
     
    const { error } = await (supabase as any)
        .from('sales_orders')
        .delete()
        .eq('id', salesOrderId)
        .eq('tenant_id', context.tenantId)

    if (error) {
        console.error('Delete SO error:', error)
        return { success: false, error: error.message }
    }

    // Log activity
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'delete',
            entity_type: 'sales_order',
            entity_id: salesOrderId,
            entity_name: so.display_id,
            changes: {}
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/tasks/sales-orders')
    return { success: true }
}

// Paginated sales orders list
export interface PaginatedSalesOrdersResult {
    data: SalesOrderListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface SalesOrderListItem {
    id: string
    display_id: string | null
    order_number: string | null
    status: string
    priority: string | null
    total: number | null
    order_date: string | null
    requested_date: string | null
    created_at: string
    updated_at: string
    customer_name: string | null
    customer_id: string | null
    assigned_to_name: string | null
}

export interface SalesOrdersQueryParams {
    page?: number
    pageSize?: number
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
    status?: string
    customerId?: string
    priority?: string
    search?: string
}

export async function getPaginatedSalesOrders(
    params: SalesOrdersQueryParams = {}
): Promise<PaginatedSalesOrdersResult> {
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
        customerId,
        priority,
        search
    } = params

    const sanitizedPage = Math.max(1, page)
    const sanitizedPageSize = Math.min(100, Math.max(1, pageSize))
    const offset = (sanitizedPage - 1) * sanitizedPageSize

    const columnMap: Record<string, string> = {
        order_number: 'order_number',
        display_id: 'display_id',
        customer: 'customer_id',
        total: 'total',
        status: 'status',
        priority: 'priority',
        updated_at: 'updated_at',
        created_at: 'created_at',
        order_date: 'order_date',
    }

    const dbSortColumn = columnMap[sortColumn] || 'updated_at'
    const ascending = sortDirection === 'asc'

    const supabase = await createClient()

    // Build query for count
     
    let countQuery = (supabase as any)
        .from('sales_orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', context.tenantId)

    // Build query for data
     
    let dataQuery = (supabase as any)
        .from('sales_orders')
        .select(`
            id,
            display_id,
            order_number,
            status,
            priority,
            total,
            order_date,
            requested_date,
            created_at,
            updated_at,
            customer_id,
            customers(name),
            assigned_to_profile:profiles!assigned_to(full_name)
        `)
        .eq('tenant_id', context.tenantId)
        .order(dbSortColumn, { ascending })
        .range(offset, offset + sanitizedPageSize - 1)

    // Apply filters
    if (status) {
        countQuery = countQuery.eq('status', status)
        dataQuery = dataQuery.eq('status', status)
    }

    if (customerId) {
        countQuery = countQuery.eq('customer_id', customerId)
        dataQuery = dataQuery.eq('customer_id', customerId)
    }

    if (priority) {
        countQuery = countQuery.eq('priority', priority)
        dataQuery = dataQuery.eq('priority', priority)
    }

    if (search) {
        const searchPattern = `%${escapeSqlLike(search)}%`
        countQuery = countQuery.or(`order_number.ilike.${searchPattern},display_id.ilike.${searchPattern}`)
        dataQuery = dataQuery.or(`order_number.ilike.${searchPattern},display_id.ilike.${searchPattern}`)
    }

    const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
    ])

    const total = countResult.count || 0
    const totalPages = Math.ceil(total / sanitizedPageSize)

    const data: SalesOrderListItem[] = (dataResult.data || []).map((so: {
        id: string
        display_id: string | null
        order_number: string | null
        status: string
        priority: string | null
        total: number | null
        order_date: string | null
        requested_date: string | null
        created_at: string
        updated_at: string
        customer_id: string | null
        customers: { name: string } | null
        assigned_to_profile: { full_name: string } | null
    }) => ({
        id: so.id,
        display_id: so.display_id,
        order_number: so.order_number,
        status: so.status,
        priority: so.priority,
        total: so.total,
        order_date: so.order_date,
        requested_date: so.requested_date,
        created_at: so.created_at,
        updated_at: so.updated_at,
        customer_id: so.customer_id,
        customer_name: so.customers?.name || null,
        assigned_to_name: so.assigned_to_profile?.full_name || null
    }))

    return {
        data,
        total,
        page: sanitizedPage,
        pageSize: sanitizedPageSize,
        totalPages
    }
}

// Search inventory items for SO
export async function searchInventoryItemsForSO(query: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

     
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

     
    let queryBuilder = (supabase as any)
        .from('inventory_items')
        .select('id, name, sku, quantity, unit, price, image_urls')
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)
        .gt('quantity', 0)  // Only items in stock
        .order('name')
        .limit(20)

    if (query) {
        const escapedQuery = escapeSqlLike(query)
        queryBuilder = queryBuilder.or(`name.ilike.%${escapedQuery}%,sku.ilike.%${escapedQuery}%`)
    }

    const { data } = await queryBuilder
    return data || []
}

// Set tax rate for a sales order item
export async function setSalesOrderItemTax(
    itemId: string,
    taxRateId: string | null
): Promise<SalesOrderResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get item and verify parent SO belongs to tenant
     
    const { data: soItem, error: fetchError } = await (supabase as any)
        .from('sales_order_items')
        .select('sales_order_id, line_total, sales_orders!inner(tenant_id, status)')
        .eq('id', itemId)
        .single()

    if (fetchError || !soItem) {
        return { success: false, error: 'Sales order item not found' }
    }

    if (soItem.sales_orders?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (!['draft', 'submitted'].includes(soItem.sales_orders?.status)) {
        return { success: false, error: 'Cannot update items after sales order is confirmed' }
    }

    // If taxRateId is null, remove all taxes for this item
    if (!taxRateId) {
         
        const { error: deleteError } = await (supabase as any)
            .from('line_item_taxes')
            .delete()
            .eq('sales_order_item_id', itemId)

        if (deleteError) {
            console.error('Delete line item taxes error:', deleteError)
            return { success: false, error: deleteError.message }
        }

        // Also clear the legacy tax_rate field
         
        await (supabase as any)
            .from('sales_order_items')
            .update({ tax_rate: null, tax_amount: null })
            .eq('id', itemId)

        revalidatePath(`/tasks/sales-orders/${soItem.sales_order_id}`)
        return { success: true }
    }

    // Verify tax rate belongs to tenant
     
    const { data: taxRate, error: taxError } = await (supabase as any)
        .from('tax_rates')
        .select('id, name, code, tax_type, rate, is_compound, tenant_id')
        .eq('id', taxRateId)
        .single()

    if (taxError || !taxRate) {
        return { success: false, error: 'Tax rate not found' }
    }

    if (taxRate.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied to tax rate' }
    }

    // Call the recalculate function with a single tax rate
     
    const { error: rpcError } = await (supabase as any)
        .rpc('recalculate_line_item_taxes', {
            p_item_type: 'sales_order_item',
            p_item_id: itemId,
            p_tax_rate_ids: [taxRateId],
            p_taxable_amount: soItem.line_total || 0
        })

    if (rpcError) {
        console.error('Recalculate line item taxes error:', rpcError)
        return { success: false, error: rpcError.message }
    }

    // Also update the legacy tax_rate field for backward compatibility
     
    await (supabase as any)
        .from('sales_order_items')
        .update({
            tax_rate: taxRate.rate,
            tax_amount: Math.round(soItem.line_total * taxRate.rate) / 100
        })
        .eq('id', itemId)

    revalidatePath(`/tasks/sales-orders/${soItem.sales_order_id}`)
    return { success: true }
}
