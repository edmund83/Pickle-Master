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
    purchaseOrderStatusSchema,
} from '@/lib/auth/server-auth'
import { z } from 'zod'
import { escapeSqlLike } from '@/lib/utils'

export type PurchaseOrderResult = {
    success: boolean
    error?: string
    purchase_order_id?: string
    display_id?: string
    vendor_id?: string
}

// Status state machine - defines valid transitions
// draft -> submitted -> pending_approval -> confirmed -> partial -> received
// Any status can transition to cancelled (except received)
// Note: 'partial' status is set by complete_receive when not all items are received
const PO_STATUS_TRANSITIONS: Record<string, string[]> = {
    draft: ['submitted', 'pending_approval', 'cancelled'],
    submitted: ['pending_approval', 'confirmed', 'cancelled', 'draft'], // Can reject back to draft
    pending_approval: ['confirmed', 'draft', 'cancelled'], // Manager approves or rejects
    confirmed: ['partial', 'received', 'cancelled'], // After confirm, can start receiving items
    partial: ['partial', 'received', 'cancelled'], // More receives can happen until fully received
    received: [], // Terminal state - no transitions allowed
    cancelled: ['draft'], // Can be revived to draft
}

function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    // Same status is always valid (no-op)
    if (currentStatus === newStatus) return true
    const allowedTransitions = PO_STATUS_TRANSITIONS[currentStatus] || []
    return allowedTransitions.includes(newStatus)
}

// Validation schemas
const createVendorSchema = z.object({
    name: z.string().min(1, 'Vendor name is required').max(255),
    contact_name: optionalStringSchema,
    email: z.string().email().max(255).nullable().optional(),
    phone: z.string().max(50).nullable().optional(),
    address_line1: optionalStringSchema,
    address_line2: optionalStringSchema,
    city: optionalStringSchema,
    state: optionalStringSchema,
    postal_code: optionalStringSchema,
    country: optionalStringSchema,
    payment_terms: optionalStringSchema,
    notes: z.string().max(2000).nullable().optional(),
})

const purchaseOrderItemSchema = z.object({
    item_id: optionalUuidSchema,
    item_name: z.string().min(1).max(255),
    sku: optionalStringSchema,
    part_number: optionalStringSchema,
    ordered_quantity: quantitySchema,
    unit_price: priceSchema,
})

const createPurchaseOrderSchema = z.object({
    vendor_id: optionalUuidSchema,
    order_number: optionalStringSchema,
    expected_date: optionalDateStringSchema,
    notes: z.string().max(2000).nullable().optional(),
    ship_to_name: optionalStringSchema,
    ship_to_address1: optionalStringSchema,
    ship_to_address2: optionalStringSchema,
    ship_to_city: optionalStringSchema,
    ship_to_state: optionalStringSchema,
    ship_to_postal_code: optionalStringSchema,
    ship_to_country: optionalStringSchema,
    bill_to_name: optionalStringSchema,
    bill_to_address1: optionalStringSchema,
    bill_to_address2: optionalStringSchema,
    bill_to_city: optionalStringSchema,
    bill_to_state: optionalStringSchema,
    bill_to_postal_code: optionalStringSchema,
    bill_to_country: optionalStringSchema,
    items: z.array(purchaseOrderItemSchema),
})

const updatePurchaseOrderSchema = z.object({
    vendor_id: optionalUuidSchema,
    order_number: optionalStringSchema,
    expected_date: optionalDateStringSchema,
    notes: z.string().max(2000).nullable().optional(),
    status: purchaseOrderStatusSchema.optional(),
    ship_to_name: optionalStringSchema,
    ship_to_address1: optionalStringSchema,
    ship_to_address2: optionalStringSchema,
    ship_to_city: optionalStringSchema,
    ship_to_state: optionalStringSchema,
    ship_to_postal_code: optionalStringSchema,
    ship_to_country: optionalStringSchema,
    bill_to_name: optionalStringSchema,
    bill_to_address1: optionalStringSchema,
    bill_to_address2: optionalStringSchema,
    bill_to_city: optionalStringSchema,
    bill_to_state: optionalStringSchema,
    bill_to_postal_code: optionalStringSchema,
    bill_to_country: optionalStringSchema,
}).partial()

export interface CreateVendorInput {
    name: string
    contact_name?: string | null
    email?: string | null
    phone?: string | null
    address_line1?: string | null
    address_line2?: string | null
    city?: string | null
    state?: string | null
    postal_code?: string | null
    country?: string | null
    payment_terms?: string | null
    notes?: string | null
}

export interface CreatePurchaseOrderInput {
    vendor_id: string | null
    order_number?: string | null
    expected_date?: string | null
    notes?: string | null
    // Ship To address
    ship_to_name?: string | null
    ship_to_address1?: string | null
    ship_to_address2?: string | null
    ship_to_city?: string | null
    ship_to_state?: string | null
    ship_to_postal_code?: string | null
    ship_to_country?: string | null
    // Bill To address
    bill_to_name?: string | null
    bill_to_address1?: string | null
    bill_to_address2?: string | null
    bill_to_city?: string | null
    bill_to_state?: string | null
    bill_to_postal_code?: string | null
    bill_to_country?: string | null
    items: Array<{
        item_id: string | null
        item_name: string
        sku?: string | null
        part_number?: string | null
        ordered_quantity: number
        unit_price: number
    }>
}

export interface UpdatePurchaseOrderInput {
    vendor_id?: string | null
    order_number?: string | null
    expected_date?: string | null
    notes?: string | null
    status?: string
    // Ship To address
    ship_to_name?: string | null
    ship_to_address1?: string | null
    ship_to_address2?: string | null
    ship_to_city?: string | null
    ship_to_state?: string | null
    ship_to_postal_code?: string | null
    ship_to_country?: string | null
    // Bill To address
    bill_to_name?: string | null
    bill_to_address1?: string | null
    bill_to_address2?: string | null
    bill_to_city?: string | null
    bill_to_state?: string | null
    bill_to_postal_code?: string | null
    bill_to_country?: string | null
}

// Get all vendors for dropdown
export async function getVendors() {
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

    // Get vendors
     
    const { data } = await (supabase as any)
        .from('vendors')
        .select('id, name, contact_name, email, phone')
        .eq('tenant_id', profile.tenant_id)
        .order('name')

    return data || []
}

// Create a new vendor
export async function createVendor(input: CreateVendorInput): Promise<PurchaseOrderResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(createVendorSchema, input)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    const supabase = await createClient()

     
    const { data, error } = await (supabase as any)
        .from('vendors')
        .insert({
            tenant_id: context.tenantId,
            name: validatedInput.name,
            contact_name: validatedInput.contact_name || null,
            email: validatedInput.email || null,
            phone: validatedInput.phone || null,
            address_line1: validatedInput.address_line1 || null,
            address_line2: validatedInput.address_line2 || null,
            city: validatedInput.city || null,
            state: validatedInput.state || null,
            postal_code: validatedInput.postal_code || null,
            country: validatedInput.country || null,
            payment_terms: validatedInput.payment_terms || null,
            notes: validatedInput.notes || null
        })
        .select('id')
        .single()

    if (error) {
        console.error('Create vendor error:', error)
        return { success: false, error: error.message }
    }

    // Log activity
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'create',
            entity_type: 'vendor',
            entity_id: data.id,
            entity_name: validatedInput.name,
            changes: { name: validatedInput.name, email: validatedInput.email }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    return { success: true, vendor_id: data.id }
}

// Create a draft purchase order with minimal data (for quick-create flow)
// Uses RPC to generate display_id in format PO-{ORG_CODE}-{5-digit-number}
export async function createDraftPurchaseOrder(): Promise<PurchaseOrderResult> {
    // Feature gate: Purchase orders require Growth+ plan
    const featureCheck = await requireFeatureSafe('purchase_orders')
    if (featureCheck.error) return { success: false, error: featureCheck.error }

    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Use the new RPC function for atomic creation with display_id
     
    const { data, error } = await (supabase as any).rpc('create_purchase_order_v2', {
        p_vendor_id: null,
        p_expected_date: null,
        p_notes: null,
        p_currency: 'MYR',
        p_ship_to_name: null,
        p_ship_to_address1: null,
        p_ship_to_address2: null,
        p_ship_to_city: null,
        p_ship_to_state: null,
        p_ship_to_postal_code: null,
        p_ship_to_country: null,
        p_bill_to_name: null,
        p_bill_to_address1: null,
        p_bill_to_address2: null,
        p_bill_to_city: null,
        p_bill_to_state: null,
        p_bill_to_postal_code: null,
        p_bill_to_country: null,
        p_items: []
    })

    if (error) {
        console.error('Create draft PO error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to create purchase order' }
    }

    // Log activity
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'create',
            entity_type: 'purchase_order',
            entity_id: data?.purchase_order_id,
            entity_name: data?.display_id,
            changes: { status: 'draft', source: 'quick_create' }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/tasks/purchase-orders')
    return { success: true, purchase_order_id: data?.purchase_order_id, display_id: data?.display_id }
}

// Generate display ID using RPC (concurrency-safe)
// Format: PO-{ORG_CODE}-{5-digit-number} e.g., PO-ACM01-00001
async function generateDisplayId(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never): Promise<string> {
     
    const { data, error } = await (supabase as any).rpc('generate_display_id_for_current_user', {
        p_entity_type: 'purchase_order'
    })

    if (error) {
        console.error('Generate display_id error:', error)
        throw new Error('Failed to generate display ID')
    }

    return data
}

// Create a new purchase order with items
// Uses RPC for atomic creation with display_id generation
export async function createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrderResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(createPurchaseOrderSchema, input)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    // 4. If vendor_id is provided, verify it belongs to the tenant
    if (validatedInput.vendor_id) {
        const vendorCheck = await verifyRelatedTenantOwnership(
            'vendors',
            validatedInput.vendor_id,
            context.tenantId,
            'Vendor'
        )
        if (!vendorCheck.success) return { success: false, error: vendorCheck.error }
    }

    const supabase = await createClient()

    // Use the new RPC function for atomic creation with display_id

    const { data, error } = await (supabase as any).rpc('create_purchase_order_v2', {
        p_vendor_id: validatedInput.vendor_id || null,
        p_expected_date: validatedInput.expected_date || null,
        p_notes: validatedInput.notes || null,
        p_currency: 'MYR',
        p_ship_to_name: validatedInput.ship_to_name || null,
        p_ship_to_address1: validatedInput.ship_to_address1 || null,
        p_ship_to_address2: validatedInput.ship_to_address2 || null,
        p_ship_to_city: validatedInput.ship_to_city || null,
        p_ship_to_state: validatedInput.ship_to_state || null,
        p_ship_to_postal_code: validatedInput.ship_to_postal_code || null,
        p_ship_to_country: validatedInput.ship_to_country || null,
        p_bill_to_name: validatedInput.bill_to_name || null,
        p_bill_to_address1: validatedInput.bill_to_address1 || null,
        p_bill_to_address2: validatedInput.bill_to_address2 || null,
        p_bill_to_city: validatedInput.bill_to_city || null,
        p_bill_to_state: validatedInput.bill_to_state || null,
        p_bill_to_postal_code: validatedInput.bill_to_postal_code || null,
        p_bill_to_country: validatedInput.bill_to_country || null,
        p_items: validatedInput.items.map(item => ({
            item_id: item.item_id,
            item_name: item.item_name,
            sku: item.sku,
            ordered_quantity: item.ordered_quantity,
            unit_price: item.unit_price
        }))
    })

    if (error) {
        console.error('Create PO error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to create purchase order' }
    }

    // Log activity
    try {

        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'create',
            entity_type: 'purchase_order',
            entity_id: data?.purchase_order_id,
            entity_name: data?.display_id,
            changes: {
                status: 'draft',
                source: 'full_create',
                items_count: validatedInput.items.length,
                vendor_id: validatedInput.vendor_id
            }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/tasks/purchase-orders')
    return { success: true, purchase_order_id: data?.purchase_order_id, display_id: data?.display_id }
}

// Get a single purchase order with items and vendor
export async function getPurchaseOrder(purchaseOrderId: string) {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return null
    const { context } = authResult

    const supabase = await createClient()

    // 2. Fetch with tenant filter for defense-in-depth
     
    const { data } = await (supabase as any)
        .from('purchase_orders')
        .select(`
            *,
            vendors(id, name, contact_name, email, phone),
            purchase_order_items(
                *,
                inventory_items(id, name, sku, quantity, unit, image_urls)
            )
        `)
        .eq('id', purchaseOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    return data
}

// Update purchase order
export async function updatePurchaseOrder(
    purchaseOrderId: string,
    updates: UpdatePurchaseOrderInput
): Promise<PurchaseOrderResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(updatePurchaseOrderSchema, updates)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedUpdates = validation.data

    // 4. Verify PO belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('purchase_orders', purchaseOrderId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    // 5. If updating vendor_id, verify it belongs to the tenant
    if (validatedUpdates.vendor_id) {
        const vendorCheck = await verifyRelatedTenantOwnership(
            'vendors',
            validatedUpdates.vendor_id,
            context.tenantId,
            'Vendor'
        )
        if (!vendorCheck.success) return { success: false, error: vendorCheck.error }
    }

    const supabase = await createClient()

    // Exclude display_id from updates - it is immutable once set
     
    const { display_id, ...safeUpdates } = validatedUpdates as Record<string, unknown>

    // Get PO current state for logging
     
    const { data: currentPO } = await (supabase as any)
        .from('purchase_orders')
        .select('display_id, status, vendor_id')
        .eq('id', purchaseOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

     
    const { error } = await (supabase as any)
        .from('purchase_orders')
        .update({
            ...safeUpdates,
            updated_at: new Date().toISOString()
        })
        .eq('id', purchaseOrderId)
        .eq('tenant_id', context.tenantId) // Double-check tenant

    if (error) {
        console.error('Update PO error:', error)
        return { success: false, error: error.message }
    }

    // Log activity
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'update',
            entity_type: 'purchase_order',
            entity_id: purchaseOrderId,
            entity_name: currentPO?.display_id,
            changes: {
                updated_fields: Object.keys(safeUpdates),
                previous: { status: currentPO?.status, vendor_id: currentPO?.vendor_id },
                new: safeUpdates
            }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/tasks/purchase-orders')
    revalidatePath(`/tasks/purchase-orders/${purchaseOrderId}`)
    return { success: true }
}

// Update purchase order status
export async function updatePurchaseOrderStatus(
    purchaseOrderId: string,
    status: string
): Promise<PurchaseOrderResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate status
    const statusValidation = purchaseOrderStatusSchema.safeParse(status)
    if (!statusValidation.success) {
        return { success: false, error: 'Invalid status value' }
    }
    const validatedStatus = statusValidation.data

    // 4. Verify PO belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('purchase_orders', purchaseOrderId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Get current state for validation and logging
     
    const { data: currentPO } = await (supabase as any)
        .from('purchase_orders')
        .select('display_id, status, vendor_id, created_by, submitted_by')
        .eq('id', purchaseOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (!currentPO) {
        return { success: false, error: 'Purchase order not found' }
    }

    const previousStatus = currentPO.status

    // 5. Enforce status state machine
    if (!isValidStatusTransition(previousStatus, validatedStatus)) {
        return {
            success: false,
            error: `Invalid status transition: cannot change from '${previousStatus}' to '${validatedStatus}'`
        }
    }

    // 6. Block submission without required vendor
    if ((validatedStatus === 'submitted' || validatedStatus === 'pending_approval') && !currentPO.vendor_id) {
        return { success: false, error: 'Cannot submit purchase order without a vendor' }
    }

    // 7. Check for items when submitting
    if (validatedStatus === 'submitted' || validatedStatus === 'pending_approval') {
         
        const { count: itemCount } = await (supabase as any)
            .from('purchase_order_items')
            .select('*', { count: 'exact', head: true })
            .eq('purchase_order_id', purchaseOrderId)

        if (!itemCount || itemCount === 0) {
            return { success: false, error: 'Cannot submit purchase order without any items' }
        }
    }

    const updates: Record<string, unknown> = {
        status: validatedStatus,
        updated_at: new Date().toISOString()
    }

    // Set submitted_by and submitted_at when submitting for approval
    if ((validatedStatus === 'submitted' || validatedStatus === 'pending_approval') && !currentPO.submitted_by) {
        updates.submitted_by = context.userId
        updates.submitted_at = new Date().toISOString()
    }

    // Set approved_by and approved_at when confirming (approving)
    if (validatedStatus === 'confirmed' && (previousStatus === 'submitted' || previousStatus === 'pending_approval')) {
        updates.approved_by = context.userId
        updates.approved_at = new Date().toISOString()
    }

    // Set received_date when marking as received
    if (validatedStatus === 'received') {
        updates.received_date = new Date().toISOString().split('T')[0]
    }

     
    const { error } = await (supabase as any)
        .from('purchase_orders')
        .update(updates)
        .eq('id', purchaseOrderId)
        .eq('tenant_id', context.tenantId) // Double-check tenant

    if (error) {
        console.error('Update PO status error:', error)
        return { success: false, error: error.message }
    }

    // Log activity for status change
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'status_change',
            entity_type: 'purchase_order',
            entity_id: purchaseOrderId,
            entity_name: currentPO?.display_id,
            changes: {
                previous_status: previousStatus,
                new_status: validatedStatus
            }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    // Trigger notifications based on status change
    try {
        // Notify admins when submitted for approval
        if (validatedStatus === 'submitted' || validatedStatus === 'pending_approval') {
             
            await (supabase as any).rpc('notify_admins_pending_approval', {
                p_tenant_id: context.tenantId,
                p_entity_type: 'purchase_order',
                p_entity_id: purchaseOrderId,
                p_entity_display_id: currentPO.display_id,
                p_submitter_name: context.fullName,
                p_triggered_by: context.userId
            })
        }

        // Notify submitter when approved or rejected
        if (validatedStatus === 'confirmed' && currentPO.submitted_by && currentPO.submitted_by !== context.userId) {
             
            await (supabase as any).rpc('notify_approval', {
                p_tenant_id: context.tenantId,
                p_user_id: currentPO.submitted_by,
                p_entity_type: 'purchase_order',
                p_entity_id: purchaseOrderId,
                p_entity_display_id: currentPO.display_id,
                p_approver_name: context.fullName,
                p_approved: true,
                p_triggered_by: context.userId
            })
        }

        // Notify submitter when rejected (sent back to draft)
        if (validatedStatus === 'draft' && (previousStatus === 'submitted' || previousStatus === 'pending_approval') && currentPO.submitted_by && currentPO.submitted_by !== context.userId) {
             
            await (supabase as any).rpc('notify_approval', {
                p_tenant_id: context.tenantId,
                p_user_id: currentPO.submitted_by,
                p_entity_type: 'purchase_order',
                p_entity_id: purchaseOrderId,
                p_entity_display_id: currentPO.display_id,
                p_approver_name: context.fullName,
                p_approved: false,
                p_triggered_by: context.userId
            })
        }
    } catch (notifyError) {
        console.error('Notification error:', notifyError)
        // Don't fail the operation if notification fails
    }

    revalidatePath('/tasks/purchase-orders')
    revalidatePath(`/tasks/purchase-orders/${purchaseOrderId}`)
    return { success: true }
}

// Add item to purchase order
export async function addPurchaseOrderItem(
    purchaseOrderId: string,
    item: {
        item_id: string | null
        item_name: string
        sku?: string | null
        part_number?: string | null
        ordered_quantity: number
        unit_price: number
    }
): Promise<PurchaseOrderResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(purchaseOrderItemSchema, item)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedItem = validation.data

    // 4. Verify PO belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('purchase_orders', purchaseOrderId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    // 5. If item_id is provided, verify it belongs to the tenant
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

     
    const { error } = await (supabase as any)
        .from('purchase_order_items')
        .insert({
            purchase_order_id: purchaseOrderId,
            item_id: validatedItem.item_id || null,
            item_name: validatedItem.item_name,
            sku: validatedItem.sku || null,
            part_number: validatedItem.part_number || null,
            ordered_quantity: validatedItem.ordered_quantity,
            unit_price: validatedItem.unit_price,
            received_quantity: 0
        })

    if (error) {
        console.error('Add PO item error:', error)
        return { success: false, error: error.message }
    }

    // Recalculate totals
    await recalculatePurchaseOrderTotals(supabase, purchaseOrderId)

    revalidatePath(`/tasks/purchase-orders/${purchaseOrderId}`)
    return { success: true }
}

// Remove item from purchase order
export async function removePurchaseOrderItem(purchaseOrderItemId: string): Promise<PurchaseOrderResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // 3. Get PO item and verify the parent PO belongs to user's tenant
     
    const { data: poItem, error: fetchError } = await (supabase as any)
        .from('purchase_order_items')
        .select('purchase_order_id, purchase_orders!inner(tenant_id)')
        .eq('id', purchaseOrderItemId)
        .single()

    if (fetchError || !poItem) {
        return { success: false, error: 'Purchase order item not found' }
    }

    if (poItem.purchase_orders?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

     
    const { error } = await (supabase as any)
        .from('purchase_order_items')
        .delete()
        .eq('id', purchaseOrderItemId)

    if (error) {
        console.error('Remove PO item error:', error)
        return { success: false, error: error.message }
    }

    if (poItem?.purchase_order_id) {
        await recalculatePurchaseOrderTotals(supabase, poItem.purchase_order_id)
        revalidatePath(`/tasks/purchase-orders/${poItem.purchase_order_id}`)
    }

    return { success: true }
}

// Update purchase order item
export async function updatePurchaseOrderItem(
    purchaseOrderItemId: string,
    updates: {
        ordered_quantity?: number
        unit_price?: number
    }
): Promise<PurchaseOrderResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate updates
    const updateSchema = z.object({
        ordered_quantity: quantitySchema.optional(),
        unit_price: priceSchema.optional(),
    })
    const validation = validateInput(updateSchema, updates)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedUpdates = validation.data

    const supabase = await createClient()

    // 4. Get PO item and verify the parent PO belongs to user's tenant
     
    const { data: poItem, error: fetchError } = await (supabase as any)
        .from('purchase_order_items')
        .select('purchase_order_id, purchase_orders!inner(tenant_id)')
        .eq('id', purchaseOrderItemId)
        .single()

    if (fetchError || !poItem) {
        return { success: false, error: 'Purchase order item not found' }
    }

    if (poItem.purchase_orders?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

     
    const { error } = await (supabase as any)
        .from('purchase_order_items')
        .update(validatedUpdates)
        .eq('id', purchaseOrderItemId)

    if (error) {
        console.error('Update PO item error:', error)
        return { success: false, error: error.message }
    }

    if (poItem?.purchase_order_id) {
        await recalculatePurchaseOrderTotals(supabase, poItem.purchase_order_id)
        revalidatePath(`/tasks/purchase-orders/${poItem.purchase_order_id}`)
    }

    return { success: true }
}

// Helper to recalculate PO totals
async function recalculatePurchaseOrderTotals(
    supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
    purchaseOrderId: string
) {
     
    const { data: items } = await (supabase as any)
        .from('purchase_order_items')
        .select('ordered_quantity, unit_price')
        .eq('purchase_order_id', purchaseOrderId)

    if (items) {
        const subtotal = items.reduce((sum: number, item: { ordered_quantity: number; unit_price: number }) =>
            sum + (item.ordered_quantity * item.unit_price), 0)

         
        await (supabase as any)
            .from('purchase_orders')
            .update({
                subtotal,
                total: subtotal,
                updated_at: new Date().toISOString()
            })
            .eq('id', purchaseOrderId)
    }
}

// Delete purchase order (only draft status)
export async function deletePurchaseOrder(purchaseOrderId: string): Promise<PurchaseOrderResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission for delete operations (editors can delete draft POs)
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // 3. Check if PO exists, belongs to tenant, and is in draft status
     
    const { data: po, error: fetchError } = await (supabase as any)
        .from('purchase_orders')
        .select('status, tenant_id, display_id')
        .eq('id', purchaseOrderId)
        .single()

    if (fetchError || !po) {
        return { success: false, error: 'Purchase order not found' }
    }

    if (po.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (po.status !== 'draft') {
        return { success: false, error: 'Only draft purchase orders can be deleted' }
    }

    // Delete items first (cascade should handle this, but being explicit)
     
    await (supabase as any)
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', purchaseOrderId)

    // Delete PO with tenant check
     
    const { error } = await (supabase as any)
        .from('purchase_orders')
        .delete()
        .eq('id', purchaseOrderId)
        .eq('tenant_id', context.tenantId) // Double-check tenant

    if (error) {
        console.error('Delete PO error:', error)
        return { success: false, error: error.message }
    }

    // Log activity for delete
    try {
         
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'delete',
            entity_type: 'purchase_order',
            entity_id: purchaseOrderId,
            entity_name: po.display_id,
            changes: { deleted_status: po.status }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/tasks/purchase-orders')
    return { success: true }
}

// Search inventory items for PO (similar to pick-lists)
export async function searchInventoryItemsForPO(query: string, lowStockOnly: boolean = false) {
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

    // Search items (don't filter by quantity for POs - we're ordering new stock)
     
    let queryBuilder = (supabase as any)
        .from('inventory_items')
        .select('id, name, sku, quantity, min_quantity, image_urls, unit, price')
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)
        .order('name')
        .limit(20)

    if (query) {
        const escapedQuery = escapeSqlLike(query)
        queryBuilder = queryBuilder.or(`name.ilike.%${escapedQuery}%,sku.ilike.%${escapedQuery}%`)
    }

    // Filter for low stock items only
    if (lowStockOnly) {
        // Items where quantity <= min_quantity
        queryBuilder = queryBuilder.or('quantity.lte.min_quantity,status.eq.low_stock,status.eq.out_of_stock')
    }

    const { data } = await queryBuilder

    // If lowStockOnly, do client-side filter as well since the SQL filter might not work perfectly
    if (lowStockOnly && data) {
        return data.filter((item: { quantity: number; min_quantity: number | null }) => {
            const minQty = item.min_quantity || 0
            return item.quantity <= minQty
        })
    }

    return data || []
}

// Paginated purchase orders list with server-side sorting and filtering
export interface PaginatedPurchaseOrdersResult {
    data: PurchaseOrderListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface PurchaseOrderListItem {
    id: string
    display_id: string | null
    order_number: string | null
    status: string
    total_amount: number | null
    expected_date: string | null
    received_date: string | null
    ship_to_name: string | null
    created_at: string
    updated_at: string
    vendor_name: string | null
    created_by_name: string | null
    submitted_by_name: string | null
}

export interface PurchaseOrdersQueryParams {
    page?: number
    pageSize?: number
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
    status?: string
    vendorId?: string
    search?: string
}

export async function getPaginatedPurchaseOrders(
    params: PurchaseOrdersQueryParams = {}
): Promise<PaginatedPurchaseOrdersResult> {
    // 1. Authenticate and get context
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
        vendorId,
        search
    } = params

    // Validate and sanitize parameters
    const sanitizedPage = Math.max(1, page)
    const sanitizedPageSize = Math.min(100, Math.max(1, pageSize))
    const offset = (sanitizedPage - 1) * sanitizedPageSize

    // Map sort columns to database columns
    const columnMap: Record<string, string> = {
        order_number: 'order_number',
        vendor: 'vendor_id',
        total_amount: 'total_amount',
        status: 'status',
        updated_at: 'updated_at',
        created_at: 'created_at',
        expected_date: 'expected_date',
        received_date: 'received_date',
        ship_to_name: 'ship_to_name',
    }

    const dbSortColumn = columnMap[sortColumn] || 'updated_at'
    const ascending = sortDirection === 'asc'

    const supabase = await createClient()

    // Build query for count
     
    let countQuery = (supabase as any)
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', context.tenantId)

    // Build query for data
     
    let dataQuery = (supabase as any)
        .from('purchase_orders')
        .select(`
            id,
            display_id,
            order_number,
            status,
            total_amount,
            expected_date,
            received_date,
            ship_to_name,
            created_at,
            updated_at,
            vendors(name),
            created_by_profile:profiles!created_by(full_name),
            submitted_by_profile:profiles!submitted_by(full_name)
        `)
        .eq('tenant_id', context.tenantId)
        .order(dbSortColumn, { ascending })
        .range(offset, offset + sanitizedPageSize - 1)

    // Apply filters
    if (status) {
        countQuery = countQuery.eq('status', status)
        dataQuery = dataQuery.eq('status', status)
    }

    if (vendorId) {
        countQuery = countQuery.eq('vendor_id', vendorId)
        dataQuery = dataQuery.eq('vendor_id', vendorId)
    }

    if (search) {
        const searchPattern = `%${escapeSqlLike(search)}%`
        countQuery = countQuery.or(`order_number.ilike.${searchPattern},display_id.ilike.${searchPattern}`)
        dataQuery = dataQuery.or(`order_number.ilike.${searchPattern},display_id.ilike.${searchPattern}`)
    }

    // Execute queries
    const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
    ])

    const total = countResult.count || 0
    const totalPages = Math.ceil(total / sanitizedPageSize)

    // Transform data
    const data: PurchaseOrderListItem[] = (dataResult.data || []).map((po: {
        id: string
        display_id: string | null
        order_number: string | null
        status: string
        total_amount: number | null
        expected_date: string | null
        received_date: string | null
        ship_to_name: string | null
        created_at: string
        updated_at: string
        vendors: { name: string } | null
        created_by_profile: { full_name: string } | null
        submitted_by_profile: { full_name: string } | null
    }) => ({
        id: po.id,
        display_id: po.display_id,
        order_number: po.order_number,
        status: po.status,
        total_amount: po.total_amount,
        expected_date: po.expected_date,
        received_date: po.received_date,
        ship_to_name: po.ship_to_name,
        created_at: po.created_at,
        updated_at: po.updated_at,
        vendor_name: po.vendors?.name || null,
        created_by_name: po.created_by_profile?.full_name || null,
        submitted_by_name: po.submitted_by_profile?.full_name || null
    }))

    return {
        data,
        total,
        page: sanitizedPage,
        pageSize: sanitizedPageSize,
        totalPages
    }
}
