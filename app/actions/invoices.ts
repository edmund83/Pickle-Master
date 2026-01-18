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

export type InvoiceResult = {
    success: boolean
    error?: string
    invoice_id?: string
    display_id?: string
}

// Status state machine
const INVOICE_STATUS_TRANSITIONS: Record<string, string[]> = {
    draft: ['pending', 'cancelled'],
    pending: ['sent', 'draft', 'cancelled'],
    sent: ['partial', 'paid', 'overdue', 'void'],
    partial: ['paid', 'overdue', 'void'],
    paid: [],  // Final state
    overdue: ['partial', 'paid', 'void'],
    cancelled: ['draft'],  // Can reopen
    void: [],  // Final state
}

function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    if (currentStatus === newStatus) return true
    const allowedTransitions = INVOICE_STATUS_TRANSITIONS[currentStatus] || []
    return allowedTransitions.includes(newStatus)
}

// Validation schemas
const createInvoiceSchema = z.object({
    customer_id: z.string().uuid(),
    sales_order_id: optionalUuidSchema,
    delivery_order_id: optionalUuidSchema,
    invoice_number: optionalStringSchema,
    invoice_date: optionalDateStringSchema,
    due_date: optionalDateStringSchema,
    bill_to_name: optionalStringSchema,
    bill_to_address1: optionalStringSchema,
    bill_to_address2: optionalStringSchema,
    bill_to_city: optionalStringSchema,
    bill_to_state: optionalStringSchema,
    bill_to_postal_code: optionalStringSchema,
    bill_to_country: optionalStringSchema,
    tax_rate: z.number().min(0).max(100).optional(),
    discount_amount: z.number().min(0).optional(),
    payment_term_id: optionalUuidSchema,
    internal_notes: z.string().max(5000).nullable().optional(),
    customer_notes: z.string().max(2000).nullable().optional(),
    terms_and_conditions: z.string().max(5000).nullable().optional(),
})

const updateInvoiceSchema = createInvoiceSchema.partial().omit({ customer_id: true })

const invoiceItemSchema = z.object({
    sales_order_item_id: optionalUuidSchema,
    delivery_order_item_id: optionalUuidSchema,
    item_id: optionalUuidSchema,
    item_name: z.string().min(1).max(500),
    sku: optionalStringSchema,
    description: z.string().max(2000).nullable().optional(),
    quantity: quantitySchema,
    unit_price: z.number().min(0),
    discount_percent: z.number().min(0).max(100).optional(),
    discount_amount: z.number().min(0).optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    sort_order: z.number().int().min(0).optional(),
})

const recordPaymentSchema = z.object({
    amount: z.number().positive(),
    payment_date: optionalDateStringSchema,
    payment_method: z.enum(['cash', 'bank_transfer', 'card', 'check', 'other']).optional(),
    reference_number: optionalStringSchema,
    notes: z.string().max(1000).nullable().optional(),
})

export interface CreateInvoiceInput {
    customer_id: string
    sales_order_id?: string | null
    delivery_order_id?: string | null
    invoice_number?: string | null
    invoice_date?: string | null
    due_date?: string | null
    bill_to_name?: string | null
    bill_to_address1?: string | null
    bill_to_address2?: string | null
    bill_to_city?: string | null
    bill_to_state?: string | null
    bill_to_postal_code?: string | null
    bill_to_country?: string | null
    tax_rate?: number
    discount_amount?: number
    payment_term_id?: string | null
    internal_notes?: string | null
    customer_notes?: string | null
    terms_and_conditions?: string | null
}

export interface InvoiceItemInput {
    sales_order_item_id?: string | null
    delivery_order_item_id?: string | null
    item_id?: string | null
    item_name: string
    sku?: string | null
    description?: string | null
    quantity: number
    unit_price: number
    discount_percent?: number
    discount_amount?: number
    tax_rate?: number
    sort_order?: number
}

export interface RecordPaymentInput {
    amount: number
    payment_date?: string | null
    payment_method?: 'cash' | 'bank_transfer' | 'card' | 'check' | 'other'
    reference_number?: string | null
    notes?: string | null
}

// Create a new invoice
export async function createInvoice(input: CreateInvoiceInput): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(createInvoiceSchema, input)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    // Verify customer belongs to tenant
    const customerCheck = await verifyRelatedTenantOwnership(
        'customers',
        validatedInput.customer_id,
        context.tenantId,
        'Customer'
    )
    if (!customerCheck.success) return { success: false, error: customerCheck.error }

    const supabase = await createClient()

    // Get customer details for billing address defaults
     
    const { data: customer } = await (supabase as any)
        .from('customers')
        .select('name, billing_address1, billing_address2, billing_city, billing_state, billing_postal_code, billing_country')
        .eq('id', validatedInput.customer_id)
        .eq('tenant_id', context.tenantId)
        .single()

    // Generate display ID
     
    const { data: displayId } = await (supabase as any).rpc(
        'generate_display_id_for_current_user',
        { p_entity_type: 'invoice' }
    )

    // Create invoice
     
    const { data, error } = await (supabase as any)
        .from('invoices')
        .insert({
            tenant_id: context.tenantId,
            display_id: displayId,
            customer_id: validatedInput.customer_id,
            sales_order_id: validatedInput.sales_order_id || null,
            delivery_order_id: validatedInput.delivery_order_id || null,
            invoice_number: validatedInput.invoice_number || null,
            invoice_date: validatedInput.invoice_date || new Date().toISOString().split('T')[0],
            due_date: validatedInput.due_date || null,
            bill_to_name: validatedInput.bill_to_name || customer?.name || null,
            bill_to_address1: validatedInput.bill_to_address1 || customer?.billing_address1 || null,
            bill_to_address2: validatedInput.bill_to_address2 || customer?.billing_address2 || null,
            bill_to_city: validatedInput.bill_to_city || customer?.billing_city || null,
            bill_to_state: validatedInput.bill_to_state || customer?.billing_state || null,
            bill_to_postal_code: validatedInput.bill_to_postal_code || customer?.billing_postal_code || null,
            bill_to_country: validatedInput.bill_to_country || customer?.billing_country || null,
            tax_rate: validatedInput.tax_rate || 0,
            discount_amount: validatedInput.discount_amount || 0,
            payment_term_id: validatedInput.payment_term_id || null,
            internal_notes: validatedInput.internal_notes || null,
            customer_notes: validatedInput.customer_notes || null,
            terms_and_conditions: validatedInput.terms_and_conditions || null,
            created_by: context.userId,
            status: 'draft',
        })
        .select('id, display_id')
        .single()

    if (error) {
        console.error('Create invoice error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/invoices')
    return { success: true, invoice_id: data.id, display_id: data.display_id }
}

// Create invoice from a sales order (copies items)
export async function createInvoiceFromSO(salesOrderId: string): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get SO with items
     
    const { data: so, error: soError } = await (supabase as any)
        .from('sales_orders')
        .select(`
            *,
            customers(name, billing_address1, billing_address2, billing_city, billing_state, billing_postal_code, billing_country),
            sales_order_items(
                id, item_id, item_name, sku,
                quantity_ordered, unit_price
            )
        `)
        .eq('id', salesOrderId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (soError || !so) {
        return { success: false, error: 'Sales order not found' }
    }

    // Check SO is in a valid status for invoicing
    const validStatuses = ['shipped', 'delivered', 'completed', 'partial_shipped']
    if (!validStatuses.includes(so.status)) {
        return { success: false, error: `Sales order must be in one of these statuses to invoice: ${validStatuses.join(', ')}` }
    }

    // Check no invoice already exists for this SO
     
    const { data: existingInvoice } = await (supabase as any)
        .from('invoices')
        .select('id, display_id')
        .eq('sales_order_id', salesOrderId)
        .eq('tenant_id', context.tenantId)
        .not('status', 'in', '("cancelled","void")')
        .limit(1)
        .single()

    if (existingInvoice) {
        return { success: false, error: `Invoice ${existingInvoice.display_id} already exists for this sales order` }
    }

    // Generate display ID
     
    const { data: displayId } = await (supabase as any).rpc(
        'generate_display_id_for_current_user',
        { p_entity_type: 'invoice' }
    )

    // Create invoice
     
    const { data: invoiceData, error: invoiceError } = await (supabase as any)
        .from('invoices')
        .insert({
            tenant_id: context.tenantId,
            display_id: displayId,
            customer_id: so.customer_id,
            sales_order_id: salesOrderId,
            invoice_date: new Date().toISOString().split('T')[0],
            bill_to_name: so.bill_to_name || so.customers?.name || null,
            bill_to_address1: so.bill_to_address1 || so.customers?.billing_address1 || null,
            bill_to_address2: so.bill_to_address2 || so.customers?.billing_address2 || null,
            bill_to_city: so.bill_to_city || so.customers?.billing_city || null,
            bill_to_state: so.bill_to_state || so.customers?.billing_state || null,
            bill_to_postal_code: so.bill_to_postal_code || so.customers?.billing_postal_code || null,
            bill_to_country: so.bill_to_country || so.customers?.billing_country || null,
            internal_notes: so.internal_notes || null,
            created_by: context.userId,
            status: 'draft',
        })
        .select('id, display_id')
        .single()

    if (invoiceError) {
        console.error('Create invoice error:', invoiceError)
        return { success: false, error: invoiceError.message }
    }

    // Create invoice items from SO items
    const invoiceItems = (so.sales_order_items || []).map((item: {
        id: string
        item_id: string | null
        item_name: string
        sku: string | null
        quantity_ordered: number
        unit_price: number
    }, index: number) => {
        const lineTotal = item.quantity_ordered * item.unit_price
        return {
            invoice_id: invoiceData.id,
            sales_order_item_id: item.id,
            item_id: item.item_id || null,
            item_name: item.item_name,
            sku: item.sku || null,
            quantity: item.quantity_ordered,
            unit_price: item.unit_price,
            line_total: lineTotal,
            sort_order: index,
        }
    })

    if (invoiceItems.length > 0) {
         
        const { error: itemsError } = await (supabase as any)
            .from('invoice_items')
            .insert(invoiceItems)

        if (itemsError) {
            console.error('Create invoice items error:', itemsError)
            // Rollback invoice creation
             
            await (supabase as any).from('invoices').delete().eq('id', invoiceData.id)
            return { success: false, error: itemsError.message }
        }
    }

    revalidatePath('/tasks/invoices')
    revalidatePath(`/tasks/sales-orders/${salesOrderId}`)
    return { success: true, invoice_id: invoiceData.id, display_id: invoiceData.display_id }
}

// Get invoice with details
export async function getInvoice(invoiceId: string) {
    const authResult = await getAuthContext()
    if (!authResult.success) return null
    const { context } = authResult

    const supabase = await createClient()

     
    const { data } = await (supabase as any)
        .from('invoices')
        .select(`
            *,
            customers(id, name, email, phone),
            sales_orders(id, display_id),
            delivery_orders(id, display_id),
            invoice_items(
                *,
                inventory_items(id, name, sku, image_urls)
            ),
            invoice_payments(*),
            created_by_profile:profiles!invoices_created_by_fkey(full_name),
            sent_by_profile:profiles!invoices_sent_by_fkey(full_name),
            cancelled_by_profile:profiles!invoices_cancelled_by_fkey(full_name)
        `)
        .eq('id', invoiceId)
        .eq('tenant_id', context.tenantId)
        .single()

    return data
}

// Update invoice (only draft/pending status)
export async function updateInvoice(
    invoiceId: string,
    updates: Partial<Omit<CreateInvoiceInput, 'customer_id'>>
): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(updateInvoiceSchema, updates)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedUpdates = validation.data

    const ownershipResult = await verifyTenantOwnership('invoices', invoiceId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Check status allows updates
     
    const { data: currentInvoice } = await (supabase as any)
        .from('invoices')
        .select('status')
        .eq('id', invoiceId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (currentInvoice && !['draft', 'pending'].includes(currentInvoice.status)) {
        return { success: false, error: 'Cannot update invoice after it has been sent' }
    }

     
    const { error } = await (supabase as any)
        .from('invoices')
        .update({
            ...validatedUpdates,
            updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .eq('tenant_id', context.tenantId)

    if (error) {
        console.error('Update invoice error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/invoices')
    revalidatePath(`/tasks/invoices/${invoiceId}`)
    return { success: true }
}

// Update invoice status
export async function updateInvoiceStatus(
    invoiceId: string,
    newStatus: string,
    additionalData?: {
        sent_to_email?: string
    }
): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const ownershipResult = await verifyTenantOwnership('invoices', invoiceId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Get current status
     
    const { data: currentInvoice, error: fetchError } = await (supabase as any)
        .from('invoices')
        .select('status, display_id, total, balance_due')
        .eq('id', invoiceId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (fetchError || !currentInvoice) {
        return { success: false, error: 'Invoice not found' }
    }

    // Validate transition
    if (!isValidStatusTransition(currentInvoice.status, newStatus)) {
        return {
            success: false,
            error: `Invalid status transition: cannot change from '${currentInvoice.status}' to '${newStatus}'`
        }
    }

    // Validate requirements for certain transitions
    if (newStatus === 'sent' && currentInvoice.total <= 0) {
        return { success: false, error: 'Cannot send invoice with zero total' }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
    }

    // Add tracking fields based on status
    if (newStatus === 'sent') {
        updateData.sent_by = context.userId
        updateData.sent_at = new Date().toISOString()
        if (additionalData?.sent_to_email) {
            updateData.sent_to_email = additionalData.sent_to_email
        }
    } else if (newStatus === 'cancelled') {
        updateData.cancelled_by = context.userId
        updateData.cancelled_at = new Date().toISOString()
    }

     
    const { error: updateError } = await (supabase as any)
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .eq('tenant_id', context.tenantId)

    if (updateError) {
        console.error('Update invoice status error:', updateError)
        return { success: false, error: updateError.message }
    }

    revalidatePath('/tasks/invoices')
    revalidatePath(`/tasks/invoices/${invoiceId}`)
    return { success: true }
}

// Add item to invoice
export async function addInvoiceItem(
    invoiceId: string,
    item: InvoiceItemInput
): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(invoiceItemSchema, item)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedItem = validation.data

    const ownershipResult = await verifyTenantOwnership('invoices', invoiceId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Check invoice status
     
    const { data: invoiceData } = await (supabase as any)
        .from('invoices')
        .select('status')
        .eq('id', invoiceId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (invoiceData && !['draft', 'pending'].includes(invoiceData.status)) {
        return { success: false, error: 'Cannot add items after invoice has been sent' }
    }

    // Calculate line total
    const baseAmount = validatedItem.quantity * validatedItem.unit_price
    const discountAmt = validatedItem.discount_amount || (baseAmount * (validatedItem.discount_percent || 0) / 100)
    const afterDiscount = baseAmount - discountAmt
    const taxAmt = afterDiscount * (validatedItem.tax_rate || 0) / 100
    const lineTotal = afterDiscount + taxAmt

     
    const { error } = await (supabase as any)
        .from('invoice_items')
        .insert({
            invoice_id: invoiceId,
            sales_order_item_id: validatedItem.sales_order_item_id || null,
            delivery_order_item_id: validatedItem.delivery_order_item_id || null,
            item_id: validatedItem.item_id || null,
            item_name: validatedItem.item_name,
            sku: validatedItem.sku || null,
            description: validatedItem.description || null,
            quantity: validatedItem.quantity,
            unit_price: validatedItem.unit_price,
            discount_percent: validatedItem.discount_percent || 0,
            discount_amount: discountAmt,
            tax_rate: validatedItem.tax_rate || 0,
            tax_amount: taxAmt,
            line_total: lineTotal,
            sort_order: validatedItem.sort_order || 0,
        })

    if (error) {
        console.error('Add invoice item error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/invoices/${invoiceId}`)
    return { success: true }
}

// Update invoice item
export async function updateInvoiceItem(
    itemId: string,
    updates: Partial<InvoiceItemInput>
): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get item and verify parent invoice belongs to tenant
     
    const { data: invoiceItem, error: fetchError } = await (supabase as any)
        .from('invoice_items')
        .select('invoice_id, quantity, unit_price, invoices!inner(tenant_id, status)')
        .eq('id', itemId)
        .single()

    if (fetchError || !invoiceItem) {
        return { success: false, error: 'Invoice item not found' }
    }

    if (invoiceItem.invoices?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (!['draft', 'pending'].includes(invoiceItem.invoices?.status)) {
        return { success: false, error: 'Cannot update items after invoice has been sent' }
    }

    // Calculate new line total if quantity or price changed
    const quantity = updates.quantity ?? invoiceItem.quantity
    const unitPrice = updates.unit_price ?? invoiceItem.unit_price
    const baseAmount = quantity * unitPrice
    const discountAmt = updates.discount_amount || (baseAmount * (updates.discount_percent || 0) / 100)
    const afterDiscount = baseAmount - discountAmt
    const taxAmt = afterDiscount * (updates.tax_rate || 0) / 100
    const lineTotal = afterDiscount + taxAmt

     
    const { error } = await (supabase as any)
        .from('invoice_items')
        .update({
            ...updates,
            discount_amount: discountAmt,
            tax_amount: taxAmt,
            line_total: lineTotal,
        })
        .eq('id', itemId)

    if (error) {
        console.error('Update invoice item error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/invoices/${invoiceItem.invoice_id}`)
    return { success: true }
}

// Remove item from invoice
export async function removeInvoiceItem(itemId: string): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get item and verify parent invoice belongs to tenant
     
    const { data: invoiceItem, error: fetchError } = await (supabase as any)
        .from('invoice_items')
        .select('invoice_id, invoices!inner(tenant_id, status)')
        .eq('id', itemId)
        .single()

    if (fetchError || !invoiceItem) {
        return { success: false, error: 'Invoice item not found' }
    }

    if (invoiceItem.invoices?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (!['draft', 'pending'].includes(invoiceItem.invoices?.status)) {
        return { success: false, error: 'Cannot remove items after invoice has been sent' }
    }

     
    const { error } = await (supabase as any)
        .from('invoice_items')
        .delete()
        .eq('id', itemId)

    if (error) {
        console.error('Remove invoice item error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath(`/tasks/invoices/${invoiceItem.invoice_id}`)
    return { success: true }
}

// Record a payment
export async function recordPayment(
    invoiceId: string,
    payment: RecordPaymentInput
): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const validation = validateInput(recordPaymentSchema, payment)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedPayment = validation.data

    const ownershipResult = await verifyTenantOwnership('invoices', invoiceId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // Get current invoice
     
    const { data: invoice, error: fetchError } = await (supabase as any)
        .from('invoices')
        .select('status, total, amount_paid, balance_due')
        .eq('id', invoiceId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (fetchError || !invoice) {
        return { success: false, error: 'Invoice not found' }
    }

    // Check status allows payments
    if (!['sent', 'partial', 'overdue'].includes(invoice.status)) {
        return { success: false, error: 'Invoice must be sent before recording payments' }
    }

    // Check payment doesn't exceed balance
    if (validatedPayment.amount > invoice.balance_due) {
        return { success: false, error: `Payment amount cannot exceed balance due (${invoice.balance_due})` }
    }

    // Insert payment record
     
    const { error: paymentError } = await (supabase as any)
        .from('invoice_payments')
        .insert({
            invoice_id: invoiceId,
            tenant_id: context.tenantId,
            amount: validatedPayment.amount,
            payment_date: validatedPayment.payment_date || new Date().toISOString().split('T')[0],
            payment_method: validatedPayment.payment_method || null,
            reference_number: validatedPayment.reference_number || null,
            notes: validatedPayment.notes || null,
            recorded_by: context.userId,
        })

    if (paymentError) {
        console.error('Record payment error:', paymentError)
        return { success: false, error: paymentError.message }
    }

    // Update invoice totals
    const newAmountPaid = Number(invoice.amount_paid) + validatedPayment.amount
    const newBalanceDue = Number(invoice.total) - newAmountPaid
    const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial'

     
    const { error: updateError } = await (supabase as any)
        .from('invoices')
        .update({
            amount_paid: newAmountPaid,
            balance_due: newBalanceDue,
            last_payment_date: validatedPayment.payment_date || new Date().toISOString().split('T')[0],
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .eq('tenant_id', context.tenantId)

    if (updateError) {
        console.error('Update invoice after payment error:', updateError)
        return { success: false, error: updateError.message }
    }

    revalidatePath('/tasks/invoices')
    revalidatePath(`/tasks/invoices/${invoiceId}`)
    return { success: true }
}

// Delete invoice (only draft status)
export async function deleteInvoice(invoiceId: string): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Check status and ownership
     
    const { data: invoiceData, error: fetchError } = await (supabase as any)
        .from('invoices')
        .select('status, tenant_id, display_id')
        .eq('id', invoiceId)
        .single()

    if (fetchError || !invoiceData) {
        return { success: false, error: 'Invoice not found' }
    }

    if (invoiceData.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (invoiceData.status !== 'draft') {
        return { success: false, error: 'Only draft invoices can be deleted' }
    }

    // Delete items first (should cascade, but explicit is safer)
     
    await (supabase as any)
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId)

    // Delete invoice
     
    const { error } = await (supabase as any)
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('tenant_id', context.tenantId)

    if (error) {
        console.error('Delete invoice error:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/tasks/invoices')
    return { success: true }
}

// Paginated invoices list
export interface PaginatedInvoicesResult {
    data: InvoiceListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface InvoiceListItem {
    id: string
    display_id: string | null
    invoice_number: string | null
    status: string
    invoice_date: string
    due_date: string | null
    subtotal: number
    total: number
    amount_paid: number
    balance_due: number
    created_at: string
    updated_at: string
    customer_id: string
    customer_name: string | null
    sales_order_display_id: string | null
}

export interface InvoicesQueryParams {
    page?: number
    pageSize?: number
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
    status?: string
    customerId?: string
    salesOrderId?: string
    search?: string
}

export async function getPaginatedInvoices(
    params: InvoicesQueryParams = {}
): Promise<PaginatedInvoicesResult> {
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
        salesOrderId,
        search
    } = params

    const sanitizedPage = Math.max(1, page)
    const sanitizedPageSize = Math.min(100, Math.max(1, pageSize))
    const offset = (sanitizedPage - 1) * sanitizedPageSize

    const columnMap: Record<string, string> = {
        display_id: 'display_id',
        status: 'status',
        invoice_date: 'invoice_date',
        due_date: 'due_date',
        total: 'total',
        balance_due: 'balance_due',
        updated_at: 'updated_at',
        created_at: 'created_at',
    }

    const dbSortColumn = columnMap[sortColumn] || 'updated_at'
    const ascending = sortDirection === 'asc'

    const supabase = await createClient()

    // Build query for count
     
    let countQuery = (supabase as any)
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', context.tenantId)

    // Build query for data
     
    let dataQuery = (supabase as any)
        .from('invoices')
        .select(`
            id,
            display_id,
            invoice_number,
            status,
            invoice_date,
            due_date,
            subtotal,
            total,
            amount_paid,
            balance_due,
            created_at,
            updated_at,
            customer_id,
            customers(name),
            sales_orders(display_id)
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

    if (salesOrderId) {
        countQuery = countQuery.eq('sales_order_id', salesOrderId)
        dataQuery = dataQuery.eq('sales_order_id', salesOrderId)
    }

    if (search) {
        const searchPattern = `%${search}%`
        countQuery = countQuery.or(`display_id.ilike.${searchPattern},invoice_number.ilike.${searchPattern}`)
        dataQuery = dataQuery.or(`display_id.ilike.${searchPattern},invoice_number.ilike.${searchPattern}`)
    }

    const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
    ])

    const total = countResult.count || 0
    const totalPages = Math.ceil(total / sanitizedPageSize)

    const data: InvoiceListItem[] = (dataResult.data || []).map((invoice: {
        id: string
        display_id: string | null
        invoice_number: string | null
        status: string
        invoice_date: string
        due_date: string | null
        subtotal: number
        total: number
        amount_paid: number
        balance_due: number
        created_at: string
        updated_at: string
        customer_id: string
        customers: { name: string } | null
        sales_orders: { display_id: string } | null
    }) => ({
        id: invoice.id,
        display_id: invoice.display_id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        subtotal: invoice.subtotal,
        total: invoice.total,
        amount_paid: invoice.amount_paid,
        balance_due: invoice.balance_due,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at,
        customer_id: invoice.customer_id,
        customer_name: invoice.customers?.name || null,
        sales_order_display_id: invoice.sales_orders?.display_id || null,
    }))

    return {
        data,
        total,
        page: sanitizedPage,
        pageSize: sanitizedPageSize,
        totalPages
    }
}

// Set tax rate for an invoice item
export async function setInvoiceItemTax(
    itemId: string,
    taxRateId: string | null
): Promise<InvoiceResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // Get item and verify parent invoice belongs to tenant
     
    const { data: invItem, error: fetchError } = await (supabase as any)
        .from('invoice_items')
        .select('invoice_id, line_total, invoices!inner(tenant_id, status)')
        .eq('id', itemId)
        .single()

    if (fetchError || !invItem) {
        return { success: false, error: 'Invoice item not found' }
    }

    if (invItem.invoices?.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    if (!['draft', 'pending'].includes(invItem.invoices?.status)) {
        return { success: false, error: 'Cannot update items after invoice is sent' }
    }

    // If taxRateId is null, remove all taxes for this item
    if (!taxRateId) {
         
        const { error: deleteError } = await (supabase as any)
            .from('line_item_taxes')
            .delete()
            .eq('invoice_item_id', itemId)

        if (deleteError) {
            console.error('Delete line item taxes error:', deleteError)
            return { success: false, error: deleteError.message }
        }

        // Also clear the legacy tax_rate field
         
        await (supabase as any)
            .from('invoice_items')
            .update({ tax_rate: null, tax_amount: null })
            .eq('id', itemId)

        revalidatePath(`/tasks/invoices/${invItem.invoice_id}`)
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
            p_item_type: 'invoice_item',
            p_item_id: itemId,
            p_tax_rate_ids: [taxRateId],
            p_taxable_amount: invItem.line_total || 0
        })

    if (rpcError) {
        console.error('Recalculate line item taxes error:', rpcError)
        return { success: false, error: rpcError.message }
    }

    // Also update the legacy tax_rate field for backward compatibility
     
    await (supabase as any)
        .from('invoice_items')
        .update({
            tax_rate: taxRate.rate,
            tax_amount: Math.round(invItem.line_total * taxRate.rate) / 100
        })
        .eq('id', itemId)

    revalidatePath(`/tasks/invoices/${invItem.invoice_id}`)
    return { success: true }
}
