'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    getAuthContext,
    requireWritePermission,
    requireAdminPermission,
    verifyTenantOwnership,
    validateInput,
    optionalStringSchema,
    optionalUuidSchema,
    priceSchema,
} from '@/lib/auth/server-auth'
import { z } from 'zod'

export type CustomerResult = {
    success: boolean
    error?: string
    customer_id?: string
    display_id?: string
}

// Basic customer type for list components
export interface Customer {
    id: string
    name: string
    customer_code: string | null
    contact_name: string | null
    email: string | null
    phone: string | null
    is_active: boolean
}

// Validation schemas
const createCustomerSchema = z.object({
    name: z.string().min(1, 'Customer name is required').max(255),
    customer_code: optionalStringSchema,
    contact_name: optionalStringSchema,
    email: z.string().email().max(255).nullable().optional(),
    phone: z.string().max(50).nullable().optional(),
    // Billing address
    billing_address_line1: optionalStringSchema,
    billing_address_line2: optionalStringSchema,
    billing_city: optionalStringSchema,
    billing_state: optionalStringSchema,
    billing_postal_code: optionalStringSchema,
    billing_country: optionalStringSchema,
    // Shipping address
    shipping_address_line1: optionalStringSchema,
    shipping_address_line2: optionalStringSchema,
    shipping_city: optionalStringSchema,
    shipping_state: optionalStringSchema,
    shipping_postal_code: optionalStringSchema,
    shipping_country: optionalStringSchema,
    shipping_same_as_billing: z.boolean().optional(),
    // Payment terms
    payment_term_id: optionalUuidSchema,
    credit_limit: priceSchema.optional(),
    // Notes
    notes: z.string().max(2000).nullable().optional(),
    // Tax fields
    tax_id: z.string().max(50).nullable().optional(),
    tax_id_label: z.string().max(30).nullable().optional(),
    is_tax_exempt: z.boolean().optional(),
    default_tax_rate_id: optionalUuidSchema,
})

const updateCustomerSchema = createCustomerSchema.partial().extend({
    is_active: z.boolean().optional(),
})

export interface CreateCustomerInput {
    name: string
    customer_code?: string | null
    contact_name?: string | null
    email?: string | null
    phone?: string | null
    billing_address_line1?: string | null
    billing_address_line2?: string | null
    billing_city?: string | null
    billing_state?: string | null
    billing_postal_code?: string | null
    billing_country?: string | null
    shipping_address_line1?: string | null
    shipping_address_line2?: string | null
    shipping_city?: string | null
    shipping_state?: string | null
    shipping_postal_code?: string | null
    shipping_country?: string | null
    shipping_same_as_billing?: boolean
    payment_term_id?: string | null
    credit_limit?: number
    notes?: string | null
    // Tax fields
    tax_id?: string | null
    tax_id_label?: string | null
    is_tax_exempt?: boolean
    default_tax_rate_id?: string | null
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
    is_active?: boolean
}

// Get all customers for dropdown
export async function getCustomers() {
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

    // Get customers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('customers')
        .select('id, name, customer_code, contact_name, email, phone, is_active')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)
        .order('name')

    return data || []
}

// Get all customers including inactive
export async function getAllCustomers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('customers')
        .select(`
            id,
            name,
            customer_code,
            contact_name,
            email,
            phone,
            is_active,
            billing_city,
            billing_country,
            credit_limit,
            created_at
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('name')

    return data || []
}

// Get a single customer by ID
export async function getCustomer(customerId: string) {
    const authResult = await getAuthContext()
    if (!authResult.success) return null
    const { context } = authResult

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('customers')
        .select(`
            *,
            payment_terms(id, name, days)
        `)
        .eq('id', customerId)
        .eq('tenant_id', context.tenantId)
        .single()

    return data
}

// Create a new customer
export async function createCustomer(input: CreateCustomerInput): Promise<CustomerResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(createCustomerSchema, input)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    const supabase = await createClient()

    // If payment_term_id is provided, verify it belongs to the tenant
    if (validatedInput.payment_term_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: paymentTerm } = await (supabase as any)
            .from('payment_terms')
            .select('id')
            .eq('id', validatedInput.payment_term_id)
            .eq('tenant_id', context.tenantId)
            .single()

        if (!paymentTerm) {
            return { success: false, error: 'Payment term not found or not in your organization' }
        }
    }

    // If default_tax_rate_id is provided, verify it belongs to the tenant
    if (validatedInput.default_tax_rate_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: taxRate } = await (supabase as any)
            .from('tax_rates')
            .select('id')
            .eq('id', validatedInput.default_tax_rate_id)
            .eq('tenant_id', context.tenantId)
            .single()

        if (!taxRate) {
            return { success: false, error: 'Tax rate not found or not in your organization' }
        }
    }

    // Generate display_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: displayId, error: displayIdError } = await (supabase as any).rpc('generate_display_id_for_current_user', {
        p_entity_type: 'customer'
    })

    if (displayIdError) {
        console.error('Generate display_id error:', displayIdError)
        return { success: false, error: 'Failed to generate customer ID' }
    }

    // Create customer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
        .from('customers')
        .insert({
            tenant_id: context.tenantId,
            display_id: displayId,
            name: validatedInput.name,
            customer_code: validatedInput.customer_code || null,
            contact_name: validatedInput.contact_name || null,
            email: validatedInput.email || null,
            phone: validatedInput.phone || null,
            billing_address_line1: validatedInput.billing_address_line1 || null,
            billing_address_line2: validatedInput.billing_address_line2 || null,
            billing_city: validatedInput.billing_city || null,
            billing_state: validatedInput.billing_state || null,
            billing_postal_code: validatedInput.billing_postal_code || null,
            billing_country: validatedInput.billing_country || null,
            shipping_address_line1: validatedInput.shipping_same_as_billing ? validatedInput.billing_address_line1 : validatedInput.shipping_address_line1 || null,
            shipping_address_line2: validatedInput.shipping_same_as_billing ? validatedInput.billing_address_line2 : validatedInput.shipping_address_line2 || null,
            shipping_city: validatedInput.shipping_same_as_billing ? validatedInput.billing_city : validatedInput.shipping_city || null,
            shipping_state: validatedInput.shipping_same_as_billing ? validatedInput.billing_state : validatedInput.shipping_state || null,
            shipping_postal_code: validatedInput.shipping_same_as_billing ? validatedInput.billing_postal_code : validatedInput.shipping_postal_code || null,
            shipping_country: validatedInput.shipping_same_as_billing ? validatedInput.billing_country : validatedInput.shipping_country || null,
            shipping_same_as_billing: validatedInput.shipping_same_as_billing || false,
            payment_term_id: validatedInput.payment_term_id || null,
            credit_limit: validatedInput.credit_limit || 0,
            notes: validatedInput.notes || null,
            // Tax fields
            tax_id: validatedInput.tax_id || null,
            tax_id_label: validatedInput.tax_id_label || null,
            is_tax_exempt: validatedInput.is_tax_exempt || false,
            default_tax_rate_id: validatedInput.default_tax_rate_id || null,
            created_by: context.userId,
            is_active: true,
        })
        .select('id')
        .single()

    if (error) {
        console.error('Create customer error:', error)
        if (error.code === '23505') {
            if (error.message.includes('customer_code')) {
                return { success: false, error: 'A customer with this code already exists' }
            }
            if (error.message.includes('name')) {
                return { success: false, error: 'A customer with this name already exists' }
            }
        }
        return { success: false, error: error.message }
    }

    // Log activity
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'create',
            entity_type: 'customer',
            entity_id: data.id,
            entity_name: validatedInput.name,
            changes: { name: validatedInput.name, email: validatedInput.email }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/partners/customers')
    return { success: true, customer_id: data.id, display_id: displayId }
}

// Update a customer
export async function updateCustomer(
    customerId: string,
    updates: UpdateCustomerInput
): Promise<CustomerResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(updateCustomerSchema, updates)
    if (!validation.success) return { success: false, error: validation.error }
    const validatedUpdates = validation.data

    // 4. Verify customer belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('customers', customerId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // If payment_term_id is provided, verify it belongs to the tenant
    if (validatedUpdates.payment_term_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: paymentTerm } = await (supabase as any)
            .from('payment_terms')
            .select('id')
            .eq('id', validatedUpdates.payment_term_id)
            .eq('tenant_id', context.tenantId)
            .single()

        if (!paymentTerm) {
            return { success: false, error: 'Payment term not found or not in your organization' }
        }
    }

    // If default_tax_rate_id is provided, verify it belongs to the tenant
    if (validatedUpdates.default_tax_rate_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: taxRate } = await (supabase as any)
            .from('tax_rates')
            .select('id')
            .eq('id', validatedUpdates.default_tax_rate_id)
            .eq('tenant_id', context.tenantId)
            .single()

        if (!taxRate) {
            return { success: false, error: 'Tax rate not found or not in your organization' }
        }
    }

    // Get current customer for logging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentCustomer } = await (supabase as any)
        .from('customers')
        .select('name, email, is_active')
        .eq('id', customerId)
        .eq('tenant_id', context.tenantId)
        .single()

    // Handle shipping_same_as_billing
    const updateData: Record<string, unknown> = {
        ...validatedUpdates,
        updated_at: new Date().toISOString()
    }

    if (validatedUpdates.shipping_same_as_billing) {
        updateData.shipping_address_line1 = validatedUpdates.billing_address_line1 || null
        updateData.shipping_address_line2 = validatedUpdates.billing_address_line2 || null
        updateData.shipping_city = validatedUpdates.billing_city || null
        updateData.shipping_state = validatedUpdates.billing_state || null
        updateData.shipping_postal_code = validatedUpdates.billing_postal_code || null
        updateData.shipping_country = validatedUpdates.billing_country || null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('customers')
        .update(updateData)
        .eq('id', customerId)
        .eq('tenant_id', context.tenantId)

    if (error) {
        console.error('Update customer error:', error)
        if (error.code === '23505') {
            if (error.message.includes('customer_code')) {
                return { success: false, error: 'A customer with this code already exists' }
            }
            if (error.message.includes('name')) {
                return { success: false, error: 'A customer with this name already exists' }
            }
        }
        return { success: false, error: error.message }
    }

    // Log activity
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'update',
            entity_type: 'customer',
            entity_id: customerId,
            entity_name: currentCustomer?.name,
            changes: {
                updated_fields: Object.keys(validatedUpdates),
                previous: { name: currentCustomer?.name, email: currentCustomer?.email, is_active: currentCustomer?.is_active },
                new: validatedUpdates
            }
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/partners/customers')
    revalidatePath(`/partners/customers/${customerId}`)
    return { success: true }
}

// Delete a customer (soft delete - set is_active = false)
export async function deleteCustomer(customerId: string): Promise<CustomerResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check admin permission for delete operations
    const permResult = requireAdminPermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    const supabase = await createClient()

    // 3. Check if customer exists and belongs to tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: customer, error: fetchError } = await (supabase as any)
        .from('customers')
        .select('name, tenant_id')
        .eq('id', customerId)
        .single()

    if (fetchError || !customer) {
        return { success: false, error: 'Customer not found' }
    }

    if (customer.tenant_id !== context.tenantId) {
        return { success: false, error: 'Unauthorized: Access denied' }
    }

    // 4. Check if customer has any sales orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: salesOrderCount } = await (supabase as any)
        .from('sales_orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId)

    if (salesOrderCount && salesOrderCount > 0) {
        // Soft delete - just deactivate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('customers')
            .update({
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', customerId)
            .eq('tenant_id', context.tenantId)

        if (error) {
            console.error('Deactivate customer error:', error)
            return { success: false, error: error.message }
        }

        // Log activity
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('activity_logs').insert({
                tenant_id: context.tenantId,
                user_id: context.userId,
                user_name: context.fullName,
                action_type: 'deactivate',
                entity_type: 'customer',
                entity_id: customerId,
                entity_name: customer.name,
                changes: { reason: 'has_sales_orders' }
            })
        } catch (logError) {
            console.error('Activity log error:', logError)
        }
    } else {
        // Hard delete if no sales orders
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('customers')
            .delete()
            .eq('id', customerId)
            .eq('tenant_id', context.tenantId)

        if (error) {
            console.error('Delete customer error:', error)
            return { success: false, error: error.message }
        }

        // Log activity
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from('activity_logs').insert({
                tenant_id: context.tenantId,
                user_id: context.userId,
                user_name: context.fullName,
                action_type: 'delete',
                entity_type: 'customer',
                entity_id: customerId,
                entity_name: customer.name,
                changes: {}
            })
        } catch (logError) {
            console.error('Activity log error:', logError)
        }
    }

    revalidatePath('/partners/customers')
    return { success: true }
}

// Reactivate a customer
export async function reactivateCustomer(customerId: string): Promise<CustomerResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Verify customer belongs to user's tenant
    const ownershipResult = await verifyTenantOwnership('customers', customerId, context.tenantId)
    if (!ownershipResult.success) return { success: false, error: ownershipResult.error }

    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: customer } = await (supabase as any)
        .from('customers')
        .select('name')
        .eq('id', customerId)
        .eq('tenant_id', context.tenantId)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
        .from('customers')
        .update({
            is_active: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('tenant_id', context.tenantId)

    if (error) {
        console.error('Reactivate customer error:', error)
        return { success: false, error: error.message }
    }

    // Log activity
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('activity_logs').insert({
            tenant_id: context.tenantId,
            user_id: context.userId,
            user_name: context.fullName,
            action_type: 'reactivate',
            entity_type: 'customer',
            entity_id: customerId,
            entity_name: customer?.name,
            changes: {}
        })
    } catch (logError) {
        console.error('Activity log error:', logError)
    }

    revalidatePath('/partners/customers')
    return { success: true }
}

// Search customers
export async function searchCustomers(query: string, activeOnly: boolean = true) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let queryBuilder = (supabase as any)
        .from('customers')
        .select('id, name, customer_code, contact_name, email, phone, is_active')
        .eq('tenant_id', profile.tenant_id)
        .order('name')
        .limit(20)

    if (activeOnly) {
        queryBuilder = queryBuilder.eq('is_active', true)
    }

    if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,customer_code.ilike.%${query}%,email.ilike.%${query}%`)
    }

    const { data } = await queryBuilder

    return data || []
}

// Paginated customers list
export interface PaginatedCustomersResult {
    data: CustomerListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface CustomerListItem {
    id: string
    display_id: string | null
    name: string
    customer_code: string | null
    contact_name: string | null
    email: string | null
    phone: string | null
    billing_city: string | null
    billing_country: string | null
    credit_limit: number | null
    is_active: boolean
    created_at: string
    updated_at: string
    sales_order_count?: number
}

export interface CustomersQueryParams {
    page?: number
    pageSize?: number
    sortColumn?: string
    sortDirection?: 'asc' | 'desc'
    isActive?: boolean | null
    search?: string
}

export async function getPaginatedCustomers(
    params: CustomersQueryParams = {}
): Promise<PaginatedCustomersResult> {
    const authResult = await getAuthContext()
    if (!authResult.success) {
        return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    }
    const { context } = authResult

    const {
        page = 1,
        pageSize = 20,
        sortColumn = 'name',
        sortDirection = 'asc',
        isActive = null,
        search
    } = params

    const sanitizedPage = Math.max(1, page)
    const sanitizedPageSize = Math.min(100, Math.max(1, pageSize))
    const offset = (sanitizedPage - 1) * sanitizedPageSize

    const columnMap: Record<string, string> = {
        name: 'name',
        customer_code: 'customer_code',
        email: 'email',
        billing_city: 'billing_city',
        credit_limit: 'credit_limit',
        is_active: 'is_active',
        created_at: 'created_at',
        updated_at: 'updated_at',
    }

    const dbSortColumn = columnMap[sortColumn] || 'name'
    const ascending = sortDirection === 'asc'

    const supabase = await createClient()

    // Build query for count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let countQuery = (supabase as any)
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', context.tenantId)

    // Build query for data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dataQuery = (supabase as any)
        .from('customers')
        .select(`
            id,
            display_id,
            name,
            customer_code,
            contact_name,
            email,
            phone,
            billing_city,
            billing_country,
            credit_limit,
            is_active,
            created_at,
            updated_at
        `)
        .eq('tenant_id', context.tenantId)
        .order(dbSortColumn, { ascending })
        .range(offset, offset + sanitizedPageSize - 1)

    // Apply filters
    if (isActive !== null) {
        countQuery = countQuery.eq('is_active', isActive)
        dataQuery = dataQuery.eq('is_active', isActive)
    }

    if (search) {
        const searchPattern = `%${search}%`
        countQuery = countQuery.or(`name.ilike.${searchPattern},customer_code.ilike.${searchPattern},email.ilike.${searchPattern}`)
        dataQuery = dataQuery.or(`name.ilike.${searchPattern},customer_code.ilike.${searchPattern},email.ilike.${searchPattern}`)
    }

    const [countResult, dataResult] = await Promise.all([
        countQuery,
        dataQuery
    ])

    const total = countResult.count || 0
    const totalPages = Math.ceil(total / sanitizedPageSize)

    const data: CustomerListItem[] = (dataResult.data || []).map((customer: {
        id: string
        display_id: string | null
        name: string
        customer_code: string | null
        contact_name: string | null
        email: string | null
        phone: string | null
        billing_city: string | null
        billing_country: string | null
        credit_limit: number | null
        is_active: boolean
        created_at: string
        updated_at: string
    }) => ({
        id: customer.id,
        display_id: customer.display_id,
        name: customer.name,
        customer_code: customer.customer_code,
        contact_name: customer.contact_name,
        email: customer.email,
        phone: customer.phone,
        billing_city: customer.billing_city,
        billing_country: customer.billing_country,
        credit_limit: customer.credit_limit,
        is_active: customer.is_active,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
    }))

    return {
        data,
        total,
        page: sanitizedPage,
        pageSize: sanitizedPageSize,
        totalPages
    }
}

// Get customer statistics
export async function getCustomerStats(customerId: string) {
    const authResult = await getAuthContext()
    if (!authResult.success) return null
    const { context } = authResult

    const supabase = await createClient()

    // Verify ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: customer } = await (supabase as any)
        .from('customers')
        .select('id, name')
        .eq('id', customerId)
        .eq('tenant_id', context.tenantId)
        .single()

    if (!customer) return null

    // Get sales order stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: soStats } = await (supabase as any)
        .from('sales_orders')
        .select('status, total')
        .eq('customer_id', customerId)
        .eq('tenant_id', context.tenantId)

    // Get invoice stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: invoiceStats } = await (supabase as any)
        .from('invoices')
        .select('status, total, balance_due')
        .eq('customer_id', customerId)
        .eq('tenant_id', context.tenantId)

    const salesOrders = soStats || []
    const invoices = invoiceStats || []

    return {
        totalOrders: salesOrders.length,
        totalRevenue: salesOrders.reduce((sum: number, so: { total: number }) => sum + (so.total || 0), 0),
        pendingOrders: salesOrders.filter((so: { status: string }) => !['completed', 'cancelled'].includes(so.status)).length,
        totalInvoices: invoices.length,
        unpaidInvoices: invoices.filter((inv: { status: string }) => !['paid', 'cancelled', 'void'].includes(inv.status)).length,
        outstandingBalance: invoices.reduce((sum: number, inv: { balance_due: number }) => sum + (inv.balance_due || 0), 0),
    }
}
