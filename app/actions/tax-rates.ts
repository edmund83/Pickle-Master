'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    getAuthContext,
    requireAdminPermission,
    verifyTenantOwnership,
    validateInput,
    optionalStringSchema,
} from '@/lib/auth/server-auth'
import { z } from 'zod'

export type TaxRateResult = {
    success: boolean
    error?: string
    tax_rate_id?: string
}

// Tax types supported globally
export const TAX_TYPES = [
    { value: 'sales_tax', label: 'Sales Tax', description: 'US state/local sales tax' },
    { value: 'vat', label: 'VAT', description: 'Value Added Tax (EU, UK)' },
    { value: 'gst', label: 'GST', description: 'Goods and Services Tax (AU, NZ, SG, IN)' },
    { value: 'hst', label: 'HST', description: 'Harmonized Sales Tax (Canada)' },
    { value: 'pst', label: 'PST', description: 'Provincial Sales Tax (Canada)' },
    { value: 'other', label: 'Other', description: 'Custom tax type' },
] as const

export type TaxType = (typeof TAX_TYPES)[number]['value']

// Validation schemas
const createTaxRateSchema = z.object({
    name: z.string().min(1, 'Tax name is required').max(100),
    code: optionalStringSchema,
    description: z.string().max(500).nullable().optional(),
    tax_type: z.enum(['sales_tax', 'vat', 'gst', 'hst', 'pst', 'other']).default('sales_tax'),
    rate: z.number().min(0, 'Rate must be 0 or greater').max(100, 'Rate cannot exceed 100%'),
    country_code: z.string().length(2).nullable().optional(),
    region_code: z.string().max(10).nullable().optional(),
    is_default: z.boolean().optional(),
    applies_to_shipping: z.boolean().optional(),
    is_compound: z.boolean().optional(),
    is_active: z.boolean().optional(),
})

const updateTaxRateSchema = createTaxRateSchema.partial()

export interface TaxRate {
    id: string
    tenant_id: string
    name: string
    code: string | null
    description: string | null
    tax_type: TaxType
    rate: number
    country_code: string | null
    region_code: string | null
    is_default: boolean
    applies_to_shipping: boolean
    is_compound: boolean
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface CreateTaxRateInput {
    name: string
    code?: string | null
    description?: string | null
    tax_type?: TaxType
    rate: number
    country_code?: string | null
    region_code?: string | null
    is_default?: boolean
    applies_to_shipping?: boolean
    is_compound?: boolean
    is_active?: boolean
}

export interface UpdateTaxRateInput extends Partial<CreateTaxRateInput> {}

// Get all active tax rates for the current tenant
export async function getTaxRates(): Promise<TaxRate[]> {
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

    // Get tax rates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('tax_rates')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('name')

    return data || []
}

// Get all tax rates including inactive
export async function getAllTaxRates(): Promise<TaxRate[]> {
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
        .from('tax_rates')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('is_active', { ascending: false })
        .order('is_default', { ascending: false })
        .order('name')

    return data || []
}

// Get a single tax rate by ID
export async function getTaxRate(taxRateId: string): Promise<TaxRate | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('tax_rates')
        .select('*')
        .eq('id', taxRateId)
        .single()

    return data
}

// Get the default tax rate for the tenant
export async function getDefaultTaxRate(): Promise<TaxRate | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('tax_rates')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_default', true)
        .eq('is_active', true)
        .single()

    return data
}

// Create a new tax rate (admin only)
export async function createTaxRate(input: CreateTaxRateInput): Promise<TaxRateResult> {
    try {
        const { tenantId, userId } = await getAuthContext()
        await requireAdminPermission()

        const validated = validateInput(createTaxRateSchema, input)

        const supabase = await createClient()

        // Check for duplicate name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
            .from('tax_rates')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('name', validated.name)
            .single()

        if (existing) {
            return { success: false, error: 'A tax rate with this name already exists' }
        }

        // Insert tax rate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('tax_rates')
            .insert({
                tenant_id: tenantId,
                name: validated.name,
                code: validated.code || null,
                description: validated.description || null,
                tax_type: validated.tax_type || 'sales_tax',
                rate: validated.rate,
                country_code: validated.country_code || null,
                region_code: validated.region_code || null,
                is_default: validated.is_default || false,
                applies_to_shipping: validated.applies_to_shipping || false,
                is_compound: validated.is_compound || false,
                is_active: validated.is_active !== false,
            })
            .select('id')
            .single()

        if (error) throw error

        revalidatePath('/settings/taxes')
        revalidatePath('/tasks/sales-orders')
        revalidatePath('/tasks/invoices')

        return { success: true, tax_rate_id: data.id }
    } catch (error) {
        console.error('Error creating tax rate:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create tax rate',
        }
    }
}

// Update a tax rate (admin only)
export async function updateTaxRate(
    taxRateId: string,
    input: UpdateTaxRateInput
): Promise<TaxRateResult> {
    try {
        const { tenantId } = await getAuthContext()
        await requireAdminPermission()

        const validated = validateInput(updateTaxRateSchema, input)

        const supabase = await createClient()

        // Verify ownership
        await verifyTenantOwnership(supabase, 'tax_rates', taxRateId, tenantId)

        // Check for duplicate name if name is being changed
        if (validated.name) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existing } = await (supabase as any)
                .from('tax_rates')
                .select('id')
                .eq('tenant_id', tenantId)
                .eq('name', validated.name)
                .neq('id', taxRateId)
                .single()

            if (existing) {
                return { success: false, error: 'A tax rate with this name already exists' }
            }
        }

        // Update tax rate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('tax_rates')
            .update({
                ...validated,
                updated_at: new Date().toISOString(),
            })
            .eq('id', taxRateId)

        if (error) throw error

        revalidatePath('/settings/taxes')
        revalidatePath('/tasks/sales-orders')
        revalidatePath('/tasks/invoices')

        return { success: true, tax_rate_id: taxRateId }
    } catch (error) {
        console.error('Error updating tax rate:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update tax rate',
        }
    }
}

// Delete a tax rate (admin only)
export async function deleteTaxRate(taxRateId: string): Promise<TaxRateResult> {
    try {
        const { tenantId } = await getAuthContext()
        await requireAdminPermission()

        const supabase = await createClient()

        // Verify ownership
        await verifyTenantOwnership(supabase, 'tax_rates', taxRateId, tenantId)

        // Check if tax rate is in use
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count: lineItemCount } = await (supabase as any)
            .from('line_item_taxes')
            .select('*', { count: 'exact', head: true })
            .eq('tax_rate_id', taxRateId)

        if (lineItemCount && lineItemCount > 0) {
            // Soft delete by deactivating instead
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('tax_rates')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', taxRateId)

            if (error) throw error

            revalidatePath('/settings/taxes')
            return {
                success: true,
                tax_rate_id: taxRateId,
                error: 'Tax rate is in use and has been deactivated instead of deleted',
            }
        }

        // Hard delete if not in use
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('tax_rates')
            .delete()
            .eq('id', taxRateId)

        if (error) throw error

        revalidatePath('/settings/taxes')

        return { success: true, tax_rate_id: taxRateId }
    } catch (error) {
        console.error('Error deleting tax rate:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete tax rate',
        }
    }
}

// Set a tax rate as the default (admin only)
export async function setDefaultTaxRate(taxRateId: string): Promise<TaxRateResult> {
    try {
        const { tenantId } = await getAuthContext()
        await requireAdminPermission()

        const supabase = await createClient()

        // Verify ownership
        await verifyTenantOwnership(supabase, 'tax_rates', taxRateId, tenantId)

        // The database trigger will handle unsetting other defaults
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('tax_rates')
            .update({ is_default: true, updated_at: new Date().toISOString() })
            .eq('id', taxRateId)

        if (error) throw error

        revalidatePath('/settings/taxes')

        return { success: true, tax_rate_id: taxRateId }
    } catch (error) {
        console.error('Error setting default tax rate:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to set default tax rate',
        }
    }
}

// Toggle tax rate active status (admin only)
export async function toggleTaxRateActive(taxRateId: string): Promise<TaxRateResult> {
    try {
        const { tenantId } = await getAuthContext()
        await requireAdminPermission()

        const supabase = await createClient()

        // Verify ownership and get current status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: taxRate, error: fetchError } = await (supabase as any)
            .from('tax_rates')
            .select('is_active, tenant_id')
            .eq('id', taxRateId)
            .single()

        if (fetchError || !taxRate) {
            return { success: false, error: 'Tax rate not found' }
        }

        if (taxRate.tenant_id !== tenantId) {
            return { success: false, error: 'Access denied' }
        }

        // Toggle active status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('tax_rates')
            .update({
                is_active: !taxRate.is_active,
                updated_at: new Date().toISOString(),
            })
            .eq('id', taxRateId)

        if (error) throw error

        revalidatePath('/settings/taxes')

        return { success: true, tax_rate_id: taxRateId }
    } catch (error) {
        console.error('Error toggling tax rate:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to toggle tax rate',
        }
    }
}

// Get tax rates for a specific country/region
export async function getTaxRatesByRegion(
    countryCode?: string,
    regionCode?: string
): Promise<TaxRate[]> {
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
    let query = (supabase as any)
        .from('tax_rates')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('is_active', true)

    if (countryCode) {
        query = query.eq('country_code', countryCode)
    }

    if (regionCode) {
        query = query.eq('region_code', regionCode)
    }

    const { data } = await query.order('name')

    return data || []
}
