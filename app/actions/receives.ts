'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ReceiveResult = {
    success: boolean
    error?: string
    receive_id?: string
    display_id?: string
    items_processed?: number
    lots_created?: number
    po_fully_received?: boolean
}

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Use the RPC function that pre-populates items from PO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('create_receive_with_items', {
        p_purchase_order_id: input.purchase_order_id,
        p_delivery_note_number: input.delivery_note_number || null,
        p_carrier: input.carrier || null,
        p_tracking_number: input.tracking_number || null,
        p_default_location_id: input.default_location_id || null,
        p_notes: input.notes || null
    })

    if (error) {
        console.error('Create receive error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to create receive' }
    }

    revalidatePath('/tasks/receives')
    revalidatePath(`/tasks/purchase-orders/${input.purchase_order_id}`)
    return {
        success: true,
        receive_id: data?.id,
        display_id: data?.display_id,
        items_processed: data?.items_added
    }
}

// Get a single receive with all details
export async function getReceive(receiveId: string): Promise<ReceiveWithDetails | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Use the RPC function to get receive with items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Use the RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })

    if (options?.status) {
        query = query.eq('status', options.status)
    }

    if (options?.limit) {
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Use the RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('add_receive_item', {
        p_receive_id: receiveId,
        p_purchase_order_item_id: input.purchase_order_item_id,
        p_quantity_received: input.quantity_received,
        p_lot_number: input.lot_number || null,
        p_batch_code: input.batch_code || null,
        p_expiry_date: input.expiry_date || null,
        p_manufactured_date: input.manufactured_date || null,
        p_location_id: input.location_id || null,
        p_condition: input.condition || 'good',
        p_notes: input.notes || null
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Use the RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('update_receive_item', {
        p_receive_item_id: receiveItemId,
        p_quantity_received: updates.quantity_received || null,
        p_lot_number: updates.lot_number,
        p_batch_code: updates.batch_code,
        p_expiry_date: updates.expiry_date,
        p_manufactured_date: updates.manufactured_date,
        p_location_id: updates.location_id,
        p_condition: updates.condition,
        p_notes: updates.notes
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Use the RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Use the RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Use the RPC function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    revalidatePath('/tasks/receives')
    return { success: true }
}

// Update receive header info
export async function updateReceive(
    receiveId: string,
    updates: UpdateReceiveInput
): Promise<ReceiveResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Check if receive is in draft status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: receive } = await (supabase as any)
        .from('receives')
        .select('status')
        .eq('id', receiveId)
        .single()

    if (receive?.status !== 'draft') {
        return { success: false, error: 'Can only update draft receives' }
    }

    // Update the receive
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('receives')
        .update({
            delivery_note_number: updates.delivery_note_number,
            carrier: updates.carrier,
            tracking_number: updates.tracking_number,
            default_location_id: updates.default_location_id,
            received_date: updates.received_date,
            notes: updates.notes,
            updated_at: new Date().toISOString()
        })
        .eq('id', receiveId)

    if (error) {
        console.error('Update receive error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/receives/${receiveId}`)
    return { success: true }
}

// Get locations for dropdown
export async function getLocations() {
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

    // Get locations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('locations')
        .select('id, name, type')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)
        .order('name')

    return data || []
}

// Get pending POs for receiving (for receives list page)
export async function getPendingPurchaseOrders() {
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

    // Get POs that can be received (submitted, confirmed, or partial)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        .eq('tenant_id', profile.tenant_id)
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Insert the serial number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from('receive_item_serials')
        .insert({
            receive_item_id: receiveItemId,
            serial_number: serialNumber.trim()
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    // Delete the serial number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized', added: 0, duplicates: [] }

    // Trim and filter empty entries
    const cleanSerials = serialNumbers
        .map(s => s.trim())
        .filter(s => s.length > 0)

    if (cleanSerials.length === 0) {
        return { success: false, error: 'No valid serial numbers provided', added: 0, duplicates: [] }
    }

    // Check for duplicates within the input
    const uniqueSerials = [...new Set(cleanSerials)]
    const inputDuplicates = cleanSerials.length - uniqueSerials.length

    // Get existing serials for this receive item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Get serial numbers for a receive item
export async function getReceiveItemSerials(
    receiveItemId: string
): Promise<ReceiveItemSerial[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
