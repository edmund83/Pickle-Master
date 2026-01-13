'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ===================
// Types
// ===================

export interface ReorderSuggestion {
    item_id: string
    item_name: string
    sku: string | null
    item_image: string | null
    current_qty: number
    min_quantity: number
    reorder_point: number
    suggested_qty: number
    item_vendor_id: string | null
    preferred_vendor_id: string | null
    preferred_vendor_name: string | null
    preferred_vendor_email: string | null
    vendor_sku: string | null
    unit_cost: number | null
    min_order_qty: number | null
    pack_size: number | null
    vendor_lead_time: number | null
    urgency: 'critical' | 'urgent' | 'reorder' | 'normal'
    reason: string
}

export interface VendorSuggestionGroup {
    vendor_id: string
    vendor_name: string
    vendor_email: string | null
    vendor_phone: string | null
    item_count: number
    estimated_total: number
    items: Array<{
        item_id: string
        item_name: string
        sku: string | null
        item_image: string | null
        vendor_sku: string | null
        current_qty: number
        min_quantity: number
        reorder_point: number
        suggested_qty: number
        unit_cost: number | null
        urgency: 'critical' | 'urgent' | 'reorder'
    }>
}

export interface ItemVendor {
    id: string
    item_id: string
    vendor_id: string
    vendor_name: string
    vendor_email: string | null
    vendor_phone: string | null
    vendor_sku: string | null
    unit_cost: number | null
    min_order_qty: number
    pack_size: number
    lead_time_days: number
    is_preferred: boolean
    priority: number
    last_ordered_at: string | null
    last_unit_cost: number | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface LinkItemToVendorInput {
    item_id: string
    vendor_id: string
    vendor_sku?: string | null
    unit_cost?: number | null
    min_order_qty?: number
    pack_size?: number
    lead_time_days?: number
    is_preferred?: boolean
    notes?: string | null
}

export interface CreatePOFromSuggestionsInput {
    vendor_id: string
    items: Array<{
        item_id: string
        quantity: number
        unit_cost?: number | null
    }>
}

export type ReorderResult = {
    success: boolean
    error?: string
    purchase_order_id?: string
    display_id?: string
    items_added?: number
    subtotal?: number
}

// ===================
// Get Reorder Suggestions
// ===================

export async function getReorderSuggestions(
    includeWithoutVendor: boolean = false
): Promise<ReorderSuggestion[]> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .rpc('get_reorder_suggestions', {
            p_include_without_vendor: includeWithoutVendor
        })

    if (error) {
        console.error('Error fetching reorder suggestions:', error)
        return []
    }

    return (data as ReorderSuggestion[]) || []
}

// ===================
// Get Reorder Suggestions Grouped by Vendor
// ===================

export async function getReorderSuggestionsByVendor(): Promise<VendorSuggestionGroup[]> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .rpc('get_reorder_suggestions_by_vendor')

    if (error) {
        console.error('Error fetching reorder suggestions by vendor:', error)
        return []
    }

    return (data as VendorSuggestionGroup[]) || []
}

// ===================
// Get Reorder Suggestions Count (for sidebar badge)
// ===================

export async function getReorderSuggestionsCount(): Promise<number> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .rpc('get_reorder_suggestions_count')

    if (error) {
        console.error('Error fetching reorder suggestions count:', error)
        return 0
    }

    return (data as number) || 0
}

// ===================
// Create PO from Suggestions
// ===================

export async function createPOFromSuggestions(
    input: CreatePOFromSuggestionsInput
): Promise<ReorderResult> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .rpc('create_po_from_suggestions', {
            p_vendor_id: input.vendor_id,
            p_item_suggestions: input.items
        })

    if (error) {
        console.error('Error creating PO from suggestions:', error)
        return { success: false, error: error.message }
    }

    const result = data as ReorderResult

    if (result.success) {
        revalidatePath('/tasks/purchase-orders')
        revalidatePath('/tasks/reorder-suggestions')
    }

    return result
}

// ===================
// Get Item Vendors
// ===================

export async function getItemVendors(itemId: string): Promise<ItemVendor[]> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .rpc('get_item_vendors', {
            p_item_id: itemId
        })

    if (error) {
        console.error('Error fetching item vendors:', error)
        return []
    }

    return (data as ItemVendor[]) || []
}

// ===================
// Link Item to Vendor
// ===================

export async function linkItemToVendor(
    input: LinkItemToVendorInput
): Promise<{ success: boolean; error?: string; item_vendor_id?: string }> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .rpc('link_item_to_vendor', {
            p_item_id: input.item_id,
            p_vendor_id: input.vendor_id,
            p_vendor_sku: input.vendor_sku ?? null,
            p_unit_cost: input.unit_cost ?? null,
            p_min_order_qty: input.min_order_qty ?? 1,
            p_pack_size: input.pack_size ?? 1,
            p_lead_time_days: input.lead_time_days ?? 7,
            p_is_preferred: input.is_preferred ?? false,
            p_notes: input.notes ?? null
        })

    if (error) {
        console.error('Error linking item to vendor:', error)
        return { success: false, error: error.message }
    }

    const result = data as { success: boolean; error?: string; item_vendor_id?: string }

    if (result.success) {
        revalidatePath('/tasks/reorder-suggestions')
    }

    return result
}

// ===================
// Update Item Vendor
// ===================

export async function updateItemVendor(
    itemVendorId: string,
    updates: Partial<Omit<LinkItemToVendorInput, 'item_id' | 'vendor_id'>>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('item_vendors')
        .update({
            vendor_sku: updates.vendor_sku,
            unit_cost: updates.unit_cost,
            min_order_qty: updates.min_order_qty,
            pack_size: updates.pack_size,
            lead_time_days: updates.lead_time_days,
            is_preferred: updates.is_preferred,
            notes: updates.notes,
            updated_at: new Date().toISOString()
        })
        .eq('id', itemVendorId)

    if (error) {
        console.error('Error updating item vendor:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/reorder-suggestions')
    return { success: true }
}

// ===================
// Delete Item Vendor Link
// ===================

export async function unlinkItemFromVendor(
    itemVendorId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('item_vendors')
        .delete()
        .eq('id', itemVendorId)

    if (error) {
        console.error('Error unlinking item from vendor:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/reorder-suggestions')
    return { success: true }
}

// ===================
// Set Preferred Vendor
// ===================

export async function setPreferredVendor(
    itemId: string,
    vendorId: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // First, unset all preferred vendors for this item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
        .from('item_vendors')
        .update({ is_preferred: false })
        .eq('item_id', itemId)

    // Then set the new preferred vendor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('item_vendors')
        .update({ is_preferred: true, updated_at: new Date().toISOString() })
        .eq('item_id', itemId)
        .eq('vendor_id', vendorId)

    if (error) {
        console.error('Error setting preferred vendor:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/reorder-suggestions')
    return { success: true }
}

// ===================
// Update Item Reorder Settings
// ===================

export async function updateItemReorderSettings(
    itemId: string,
    settings: {
        reorder_point?: number | null
        reorder_quantity?: number | null
    }
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('inventory_items')
        .update({
            reorder_point: settings.reorder_point,
            reorder_quantity: settings.reorder_quantity,
            updated_at: new Date().toISOString()
        })
        .eq('id', itemId)

    if (error) {
        console.error('Error updating item reorder settings:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/reorder-suggestions')
    revalidatePath(`/inventory/${itemId}`)
    return { success: true }
}
