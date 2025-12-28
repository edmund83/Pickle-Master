'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PurchaseOrderResult = {
    success: boolean
    error?: string
    purchase_order_id?: string
    vendor_id?: string
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

    // Get vendors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('vendors')
        .select('id, name, contact_name, email, phone')
        .eq('tenant_id', profile.tenant_id)
        .order('name')

    return data || []
}

// Create a new vendor
export async function createVendor(input: CreateVendorInput): Promise<PurchaseOrderResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Get user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return { success: false, error: 'No tenant found' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from('vendors')
        .insert({
            tenant_id: profile.tenant_id,
            name: input.name,
            contact_name: input.contact_name || null,
            email: input.email || null,
            phone: input.phone || null,
            address_line1: input.address_line1 || null,
            address_line2: input.address_line2 || null,
            city: input.city || null,
            state: input.state || null,
            postal_code: input.postal_code || null,
            country: input.country || null,
            notes: input.notes || null
        })
        .select('id')
        .single()

    if (error) {
        console.error('Create vendor error:', error)
        return { success: false, error: error.message }
    }

    return { success: true, vendor_id: data.id }
}

// Create a draft purchase order with minimal data (for quick-create flow)
export async function createDraftPurchaseOrder(): Promise<PurchaseOrderResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Get user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return { success: false, error: 'No tenant found' }

    // Generate order number
    const orderNumber = await generateOrderNumber(supabase, profile.tenant_id)

    // Create minimal purchase order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: po, error } = await (supabase as any)
        .from('purchase_orders')
        .insert({
            tenant_id: profile.tenant_id,
            order_number: orderNumber,
            status: 'draft',
            subtotal: 0,
            total: 0,
            created_by: user.id
        })
        .select('id')
        .single()

    if (error) {
        console.error('Create draft PO error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/workflows/purchase-orders')
    return { success: true, purchase_order_id: po.id }
}

// Generate next order number
async function generateOrderNumber(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, tenantId: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('purchase_orders')
        .select('order_number')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(1)

    if (data && data.length > 0 && data[0].order_number) {
        const lastNumber = data[0].order_number
        const match = lastNumber.match(/PO-(\d+)/)
        if (match) {
            const nextNum = parseInt(match[1]) + 1
            return `PO-${String(nextNum).padStart(4, '0')}`
        }
    }

    return 'PO-0001'
}

// Create a new purchase order with items
export async function createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrderResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Get user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return { success: false, error: 'No tenant found' }

    // Generate order number if not provided
    const orderNumber = input.order_number || await generateOrderNumber(supabase, profile.tenant_id)

    // Calculate totals
    const subtotal = input.items.reduce((sum, item) => sum + (item.ordered_quantity * item.unit_price), 0)

    // Create purchase order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: po, error: poError } = await (supabase as any)
        .from('purchase_orders')
        .insert({
            tenant_id: profile.tenant_id,
            vendor_id: input.vendor_id || null,
            order_number: orderNumber,
            expected_date: input.expected_date || null,
            notes: input.notes || null,
            status: 'draft',
            subtotal: subtotal,
            total: subtotal,
            created_by: user.id,
            // Ship To address
            ship_to_name: input.ship_to_name || null,
            ship_to_address1: input.ship_to_address1 || null,
            ship_to_address2: input.ship_to_address2 || null,
            ship_to_city: input.ship_to_city || null,
            ship_to_state: input.ship_to_state || null,
            ship_to_postal_code: input.ship_to_postal_code || null,
            ship_to_country: input.ship_to_country || null,
            // Bill To address
            bill_to_name: input.bill_to_name || null,
            bill_to_address1: input.bill_to_address1 || null,
            bill_to_address2: input.bill_to_address2 || null,
            bill_to_city: input.bill_to_city || null,
            bill_to_state: input.bill_to_state || null,
            bill_to_postal_code: input.bill_to_postal_code || null,
            bill_to_country: input.bill_to_country || null
        })
        .select('id')
        .single()

    if (poError) {
        console.error('Create PO error:', poError)
        return { success: false, error: poError.message }
    }

    // Create purchase order items
    const itemsToInsert = input.items.map(item => ({
        purchase_order_id: po.id,
        item_id: item.item_id || null,
        item_name: item.item_name,
        sku: item.sku || null,
        part_number: item.part_number || null,
        ordered_quantity: item.ordered_quantity,
        unit_price: item.unit_price,
        received_quantity: 0
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: itemsError } = await (supabase as any)
        .from('purchase_order_items')
        .insert(itemsToInsert)

    if (itemsError) {
        console.error('Create PO items error:', itemsError)
        // Delete the PO if items failed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('purchase_orders').delete().eq('id', po.id)
        return { success: false, error: itemsError.message }
    }

    revalidatePath('/workflows/purchase-orders')
    return { success: true, purchase_order_id: po.id }
}

// Get a single purchase order with items and vendor
export async function getPurchaseOrder(purchaseOrderId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        .single()

    return data
}

// Update purchase order
export async function updatePurchaseOrder(
    purchaseOrderId: string,
    updates: UpdatePurchaseOrderInput
): Promise<PurchaseOrderResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('purchase_orders')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', purchaseOrderId)

    if (error) {
        console.error('Update PO error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/workflows/purchase-orders')
    revalidatePath(`/workflows/purchase-orders/${purchaseOrderId}`)
    return { success: true }
}

// Update purchase order status
export async function updatePurchaseOrderStatus(
    purchaseOrderId: string,
    status: string
): Promise<PurchaseOrderResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString()
    }

    // Set received_date when marking as received
    if (status === 'received') {
        updates.received_date = new Date().toISOString().split('T')[0]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('purchase_orders')
        .update(updates)
        .eq('id', purchaseOrderId)

    if (error) {
        console.error('Update PO status error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/workflows/purchase-orders')
    revalidatePath(`/workflows/purchase-orders/${purchaseOrderId}`)
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('purchase_order_items')
        .insert({
            purchase_order_id: purchaseOrderId,
            item_id: item.item_id || null,
            item_name: item.item_name,
            sku: item.sku || null,
            part_number: item.part_number || null,
            ordered_quantity: item.ordered_quantity,
            unit_price: item.unit_price,
            received_quantity: 0
        })

    if (error) {
        console.error('Add PO item error:', error)
        return { success: false, error: error.message }
    }

    // Recalculate totals
    await recalculatePurchaseOrderTotals(supabase, purchaseOrderId)

    revalidatePath(`/workflows/purchase-orders/${purchaseOrderId}`)
    return { success: true }
}

// Remove item from purchase order
export async function removePurchaseOrderItem(purchaseOrderItemId: string): Promise<PurchaseOrderResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Get PO id for revalidation and recalculation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item } = await (supabase as any)
        .from('purchase_order_items')
        .select('purchase_order_id')
        .eq('id', purchaseOrderItemId)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('purchase_order_items')
        .delete()
        .eq('id', purchaseOrderItemId)

    if (error) {
        console.error('Remove PO item error:', error)
        return { success: false, error: error.message }
    }

    if (item?.purchase_order_id) {
        await recalculatePurchaseOrderTotals(supabase, item.purchase_order_id)
        revalidatePath(`/workflows/purchase-orders/${item.purchase_order_id}`)
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Get PO id for recalculation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: item } = await (supabase as any)
        .from('purchase_order_items')
        .select('purchase_order_id')
        .eq('id', purchaseOrderItemId)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('purchase_order_items')
        .update(updates)
        .eq('id', purchaseOrderItemId)

    if (error) {
        console.error('Update PO item error:', error)
        return { success: false, error: error.message }
    }

    if (item?.purchase_order_id) {
        await recalculatePurchaseOrderTotals(supabase, item.purchase_order_id)
        revalidatePath(`/workflows/purchase-orders/${item.purchase_order_id}`)
    }

    return { success: true }
}

// Helper to recalculate PO totals
async function recalculatePurchaseOrderTotals(
    supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
    purchaseOrderId: string
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items } = await (supabase as any)
        .from('purchase_order_items')
        .select('ordered_quantity, unit_price')
        .eq('purchase_order_id', purchaseOrderId)

    if (items) {
        const subtotal = items.reduce((sum: number, item: { ordered_quantity: number; unit_price: number }) =>
            sum + (item.ordered_quantity * item.unit_price), 0)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check if PO is in draft status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: po } = await (supabase as any)
        .from('purchase_orders')
        .select('status')
        .eq('id', purchaseOrderId)
        .single()

    if (po?.status !== 'draft') {
        return { success: false, error: 'Only draft purchase orders can be deleted' }
    }

    // Delete items first (cascade should handle this, but being explicit)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from('purchase_order_items')
        .delete()
        .eq('purchase_order_id', purchaseOrderId)

    // Delete PO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('purchase_orders')
        .delete()
        .eq('id', purchaseOrderId)

    if (error) {
        console.error('Delete PO error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/workflows/purchase-orders')
    return { success: true }
}

// Search inventory items for PO (similar to pick-lists)
export async function searchInventoryItemsForPO(query: string, lowStockOnly: boolean = false) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Get user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

    // Search items (don't filter by quantity for POs - we're ordering new stock)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryBuilder = (supabase as any)
        .from('inventory_items')
        .select('id, name, sku, quantity, min_quantity, image_urls, unit, price')
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)
        .order('name')
        .limit(20)

    if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
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
