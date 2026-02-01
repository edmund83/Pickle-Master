'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    getAuthContext,
    requireWritePermission,
    validateInput,
} from '@/lib/auth/server-auth'
import { z } from 'zod'

export type ContactResult = {
    success: boolean
    error?: string
    contact?: {
        id: string
        name: string
        email?: string
        phone?: string
        id_number?: string
        company?: string
    }
}

// Validation schemas
const createContactSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    email: z.string().email().max(255).optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
    idNumber: z.string().max(100).optional().nullable(),
    company: z.string().max(255).optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
})

export async function createContact(
    name: string,
    email?: string | null,
    phone?: string | null,
    idNumber?: string | null,
    company?: string | null,
    notes?: string | null
): Promise<ContactResult> {
    // 1. Authenticate and get context
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error }
    const { context } = authResult

    // 2. Check write permission
    const permResult = requireWritePermission(context)
    if (!permResult.success) return { success: false, error: permResult.error }

    // 3. Validate input
    const validation = validateInput(createContactSchema, { name, email, phone, idNumber, company, notes })
    if (!validation.success) return { success: false, error: validation.error }
    const validatedInput = validation.data

    const supabase = await createClient()

    // 4. Call RPC to create contact
    const { data, error } = await (supabase as any).rpc('create_contact', {
        p_name: validatedInput.name,
        p_email: validatedInput.email || null,
        p_phone: validatedInput.phone || null,
        p_id_number: validatedInput.idNumber || null,
        p_company: validatedInput.company || null,
        p_notes: validatedInput.notes || null,
    })

    if (error) {
        console.error('Create contact error:', error)
        return { success: false, error: error.message }
    }

    if (data && !data.success) {
        return { success: false, error: data.error || 'Failed to create contact' }
    }

    return {
        success: true,
        contact: data.contact,
    }
}

export async function getContacts(search?: string): Promise<{ success: boolean; error?: string; contacts: any[] }> {
    // 1. Authenticate
    const authResult = await getAuthContext()
    if (!authResult.success) return { success: false, error: authResult.error, contacts: [] }

    const supabase = await createClient()

    // 2. Call RPC to get contacts
    const { data, error } = await (supabase as any).rpc('get_contacts', {
        p_search: search || null,
        p_include_inactive: false,
        p_limit: 50,
    })

    if (error) {
        console.error('Get contacts error:', error)
        return { success: false, error: error.message, contacts: [] }
    }

    return { success: true, contacts: data || [] }
}
