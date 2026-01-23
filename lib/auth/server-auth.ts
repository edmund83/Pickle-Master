// Server-side authentication utilities
// Note: This is NOT a server actions file. It provides utilities that are imported
// by server action files. The functions here can be async or sync.
// Server actions must be in files with 'use server' directive at the top.

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// =============================================================================
// ROLE DEFINITIONS (3-role model: owner, staff, viewer)
// =============================================================================

// All valid roles in the system
export const ROLES = ['owner', 'staff', 'viewer'] as const
export type Role = (typeof ROLES)[number]

// Roles that can perform write operations (create, edit, delete inventory)
export const WRITE_ROLES = ['owner', 'staff'] as const
export type WriteRole = (typeof WRITE_ROLES)[number]

// Roles that can perform owner-only operations (team management, billing, settings)
export const OWNER_ROLES = ['owner'] as const
export type OwnerRole = (typeof OWNER_ROLES)[number]

// Legacy alias for backwards compatibility (use OWNER_ROLES instead)
export const ADMIN_ROLES = OWNER_ROLES
export type AdminRole = OwnerRole

export interface AuthContext {
  userId: string
  tenantId: string
  role: string
  fullName: string | null
}

export type AuthResult =
  | { success: true; context: AuthContext }
  | { success: false; error: string }

/**
 * Get the authenticated user's context including tenant and role.
 * This is the primary function to use for authorization in server actions.
 */
export async function getAuthContext(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized: Not authenticated' }
  }

   
  const { data: profile, error: profileError } = await (supabase as any)
    .from('profiles')
    .select('tenant_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Unauthorized: Profile not found' }
  }

  const typedProfile = profile as { tenant_id: string | null; role: string | null; full_name: string | null }

  if (!typedProfile.tenant_id) {
    return { success: false, error: 'Unauthorized: No tenant associated' }
  }

  return {
    success: true,
    context: {
      userId: user.id,
      tenantId: typedProfile.tenant_id,
      role: typedProfile.role || 'viewer',
      fullName: typedProfile.full_name,
    },
  }
}

/**
 * Check if the user has write permission (owner, admin, or editor).
 */
export function hasWritePermission(role: string): boolean {
  return WRITE_ROLES.includes(role as WriteRole)
}

/**
 * Check if the user has owner permission (owner only).
 * Use this for team management, billing, and organization settings.
 */
export function hasOwnerPermission(role: string): boolean {
  return OWNER_ROLES.includes(role as OwnerRole)
}

/**
 * Check if the user has admin permission (owner only).
 * @deprecated Use hasOwnerPermission instead for clarity.
 */
export function hasAdminPermission(role: string): boolean {
  return hasOwnerPermission(role)
}

/**
 * Require write permission, returning an error if not met.
 */
export function requireWritePermission(context: AuthContext): { success: true } | { success: false; error: string } {
  if (!hasWritePermission(context.role)) {
    return { success: false, error: 'Permission denied: Requires editor, admin, or owner role' }
  }
  return { success: true }
}

/**
 * Require owner permission, returning an error if not met.
 * Use this for team management, billing, and organization settings.
 */
export function requireOwnerPermission(context: AuthContext): { success: true } | { success: false; error: string } {
  if (!hasOwnerPermission(context.role)) {
    return { success: false, error: 'Permission denied: Requires owner role' }
  }
  return { success: true }
}

/**
 * Require admin permission, returning an error if not met.
 * @deprecated Use requireOwnerPermission instead for clarity.
 */
export function requireAdminPermission(context: AuthContext): { success: true } | { success: false; error: string } {
  return requireOwnerPermission(context)
}

/**
 * Verify that a record belongs to the user's tenant.
 * This provides defense-in-depth on top of RLS.
 */
export async function verifyTenantOwnership(
  tableName: string,
  recordId: string,
  tenantId: string
): Promise<{ success: true; record: Record<string, unknown> } | { success: false; error: string }> {
  const supabase = await createClient()

   
  const { data: record, error } = await (supabase as any)
    .from(tableName)
    .select('tenant_id')
    .eq('id', recordId)
    .single()

  if (error || !record) {
    return { success: false, error: `Record not found in ${tableName}` }
  }

  if (record.tenant_id !== tenantId) {
    return { success: false, error: 'Unauthorized: Access denied' }
  }

  return { success: true, record }
}

/**
 * Verify that a related record (e.g., vendor_id, item_id) belongs to the user's tenant.
 */
export async function verifyRelatedTenantOwnership(
  tableName: string,
  recordId: string,
  tenantId: string,
  friendlyName: string = 'Record'
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

   
  const { data: record, error } = await (supabase as any)
    .from(tableName)
    .select('id')
    .eq('id', recordId)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !record) {
    return { success: false, error: `${friendlyName} not found or not in your organization` }
  }

  return { success: true }
}

// Common Zod schemas for input validation
export const stringSchema = z.string().min(1).max(500)
export const optionalStringSchema = z.string().max(500).nullable().optional()
export const uuidSchema = z.string().uuid()
export const optionalUuidSchema = z.string().uuid().nullable().optional()
export const positiveNumberSchema = z.number().positive()
export const nonNegativeNumberSchema = z.number().nonnegative()
export const quantitySchema = z.number().int().nonnegative().max(1000000)
export const priceSchema = z.number().nonnegative().max(1000000000)
export const dateStringSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date format',
})
export const optionalDateStringSchema = z
  .string()
  .transform(val => val === '' ? null : val)
  .nullable()
  .optional()
  .refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  })

// Address validation schema
export const addressSchema = z.object({
  name: optionalStringSchema,
  address1: optionalStringSchema,
  address2: optionalStringSchema,
  city: optionalStringSchema,
  state: optionalStringSchema,
  postal_code: optionalStringSchema,
  country: optionalStringSchema,
}).partial()

// Status validation
export const purchaseOrderStatusSchema = z.enum(['draft', 'submitted', 'pending_approval', 'confirmed', 'receiving', 'received', 'cancelled'])
export const pickListStatusSchema = z.enum(['draft', 'pending', 'in_progress', 'completed', 'cancelled'])
export const receiveStatusSchema = z.enum(['draft', 'in_progress', 'completed', 'cancelled'])

/**
 * Validate input against a Zod schema, returning a friendly error message.
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(input)
  if (!result.success) {
    const firstError = result.error.errors[0]
    return {
      success: false,
      error: `Validation error: ${firstError?.path.join('.') || 'input'} - ${firstError?.message}`
    }
  }
  return { success: true, data: result.data }
}
