'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  getAuthContext,
  requireOwnerPermission,
  validateInput,
} from '@/lib/auth/server-auth'
import { z } from 'zod'
import crypto from 'crypto'

// =============================================================================
// TYPES
// =============================================================================

export type InvitationResult = {
  success: boolean
  error?: string
  invitation_id?: string
  invite_url?: string
}

export interface Invitation {
  id: string
  email: string
  role: 'staff' | 'viewer'
  invited_by: string | null
  invited_by_name: string | null
  expires_at: string
  accepted_at: string | null
  created_at: string
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createInvitationSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(255),
  role: z.enum(['staff', 'viewer'], {
    errorMap: () => ({ message: 'Role must be either staff or viewer' }),
  }),
})

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// =============================================================================
// SERVER ACTIONS
// =============================================================================

/**
 * Create a new team invitation.
 * Only owners can invite new team members.
 */
export async function createInvitation(
  input: z.infer<typeof createInvitationSchema>
): Promise<InvitationResult> {
  // 1. Authenticate and authorize
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const permResult = requireOwnerPermission(authResult.context)
  if (!permResult.success) {
    return { success: false, error: permResult.error }
  }

  // 2. Validate input
  const validation = validateInput(createInvitationSchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error }
  }

  const { email, role } = validation.data
  const { tenantId, userId } = authResult.context

  // 3. Check if email is already a team member
  const supabase = await createClient()
  const { data: existingMember } = await supabase
    .from('profiles')
    .select('id')
    .eq('tenant_id', tenantId)
    .ilike('email', email)
    .single()

  if (existingMember) {
    return { success: false, error: 'This email is already a team member' }
  }

  // 4. Check for existing pending invitation
  // Note: team_invitations table types may not be in generated types - using type assertion
  const { data: existingInvite } = await (supabase as any)
    .from('team_invitations')
    .select('id')
    .eq('tenant_id', tenantId)
    .ilike('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (existingInvite) {
    return { success: false, error: 'An invitation has already been sent to this email' }
  }

  // 5. Generate token and create invitation
  const token = generateToken()

  // Note: team_invitations table types may not be in generated types - using type assertion
  const { data: invitation, error } = await (supabase as any)
    .from('team_invitations')
    .insert({
      tenant_id: tenantId,
      email: email.toLowerCase(),
      role,
      invited_by: userId,
      token,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create invitation:', error)
    // Check for quota error
    if (error.message?.includes('Team size limit')) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create invitation' }
  }

  // 6. Generate invite URL (relative - frontend will add base URL)
  const inviteUrl = `/accept-invite/${token}`

  // 7. Revalidate team page
  revalidatePath('/settings/team')

  return {
    success: true,
    invitation_id: invitation.id,
    invite_url: inviteUrl,
  }
}

/**
 * Get all pending invitations for the current tenant.
 * Only owners can view invitations.
 */
export async function getInvitations(): Promise<{
  success: boolean
  error?: string
  invitations?: Invitation[]
}> {
  // 1. Authenticate and authorize
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const permResult = requireOwnerPermission(authResult.context)
  if (!permResult.success) {
    return { success: false, error: permResult.error }
  }

  const { tenantId } = authResult.context

  // 2. Fetch invitations
  const supabase = await createClient()
  // Note: team_invitations table types may not be in generated types - using type assertion
  const { data: invitations, error } = await (supabase as any)
    .from('team_invitations')
    .select(`
      id,
      email,
      role,
      invited_by,
      expires_at,
      accepted_at,
      created_at,
      inviter:profiles!team_invitations_invited_by_fkey(full_name)
    `)
    .eq('tenant_id', tenantId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch invitations:', error)
    return { success: false, error: 'Failed to fetch invitations' }
  }

  // Transform data
  const transformedInvitations: Invitation[] = (invitations || []).map((inv: any) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    invited_by: inv.invited_by,
    invited_by_name: inv.inviter?.full_name || null,
    expires_at: inv.expires_at,
    accepted_at: inv.accepted_at,
    created_at: inv.created_at,
  }))

  return { success: true, invitations: transformedInvitations }
}

/**
 * Cancel a pending invitation.
 * Only owners can cancel invitations.
 */
export async function cancelInvitation(invitationId: string): Promise<InvitationResult> {
  // 1. Authenticate and authorize
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const permResult = requireOwnerPermission(authResult.context)
  if (!permResult.success) {
    return { success: false, error: permResult.error }
  }

  // 2. Validate UUID
  const uuidSchema = z.string().uuid()
  const validation = validateInput(uuidSchema, invitationId)
  if (!validation.success) {
    return { success: false, error: 'Invalid invitation ID' }
  }

  const { tenantId } = authResult.context

  // 3. Delete the invitation
  const supabase = await createClient()
  // Note: team_invitations table types may not be in generated types - using type assertion
  const { error } = await (supabase as any)
    .from('team_invitations')
    .delete()
    .eq('id', invitationId)
    .eq('tenant_id', tenantId)
    .is('accepted_at', null) // Can only cancel pending invitations

  if (error) {
    console.error('Failed to cancel invitation:', error)
    return { success: false, error: 'Failed to cancel invitation' }
  }

  // 4. Revalidate team page
  revalidatePath('/settings/team')

  return { success: true }
}

/**
 * Resend an invitation (generates a new token and resets expiry).
 * Only owners can resend invitations.
 */
export async function resendInvitation(invitationId: string): Promise<InvitationResult> {
  // 1. Authenticate and authorize
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const permResult = requireOwnerPermission(authResult.context)
  if (!permResult.success) {
    return { success: false, error: permResult.error }
  }

  // 2. Validate UUID
  const uuidSchema = z.string().uuid()
  const validation = validateInput(uuidSchema, invitationId)
  if (!validation.success) {
    return { success: false, error: 'Invalid invitation ID' }
  }

  const { tenantId } = authResult.context

  // 3. Generate new token and update invitation
  const newToken = generateToken()
  const newExpiry = new Date()
  newExpiry.setDate(newExpiry.getDate() + 7) // 7 days from now

  const supabase = await createClient()
  // Note: team_invitations table types may not be in generated types - using type assertion
  const { data: invitation, error } = await (supabase as any)
    .from('team_invitations')
    .update({
      token: newToken,
      expires_at: newExpiry.toISOString(),
    })
    .eq('id', invitationId)
    .eq('tenant_id', tenantId)
    .is('accepted_at', null)
    .select('id')
    .single()

  if (error || !invitation) {
    console.error('Failed to resend invitation:', error)
    return { success: false, error: 'Failed to resend invitation' }
  }

  // 4. Generate new invite URL
  const inviteUrl = `/accept-invite/${newToken}`

  // 5. Revalidate team page
  revalidatePath('/settings/team')

  return {
    success: true,
    invitation_id: invitation.id,
    invite_url: inviteUrl,
  }
}

/**
 * Update a team member's role.
 * Only owners can change roles.
 * Cannot change the owner's role.
 */
export async function updateMemberRole(
  memberId: string,
  newRole: 'staff' | 'viewer'
): Promise<{ success: boolean; error?: string }> {
  // 1. Authenticate and authorize
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const permResult = requireOwnerPermission(authResult.context)
  if (!permResult.success) {
    return { success: false, error: permResult.error }
  }

  // 2. Validate inputs
  const uuidSchema = z.string().uuid()
  const roleSchema = z.enum(['staff', 'viewer'])

  const memberValidation = validateInput(uuidSchema, memberId)
  if (!memberValidation.success) {
    return { success: false, error: 'Invalid member ID' }
  }

  const roleValidation = validateInput(roleSchema, newRole)
  if (!roleValidation.success) {
    return { success: false, error: 'Invalid role' }
  }

  const { tenantId, userId } = authResult.context

  // 3. Cannot change own role
  if (memberId === userId) {
    return { success: false, error: 'You cannot change your own role' }
  }

  // 4. Check member exists and is not owner
  const supabase = await createClient()
  const { data: member } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', memberId)
    .eq('tenant_id', tenantId)
    .single<{ id: string; role: string | null }>()

  if (!member) {
    return { success: false, error: 'Team member not found' }
  }

  if (member.role === 'owner') {
    return { success: false, error: 'Cannot change the owner\'s role' }
  }

  // 5. Update role
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ role: newRole })
    .eq('id', memberId)
    .eq('tenant_id', tenantId)

  if (error) {
    console.error('Failed to update member role:', error)
    return { success: false, error: 'Failed to update role' }
  }

  // 6. Revalidate team page
  revalidatePath('/settings/team')

  return { success: true }
}

/**
 * Remove a team member.
 * Only owners can remove members.
 * Cannot remove the owner.
 */
export async function removeMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Authenticate and authorize
  const authResult = await getAuthContext()
  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const permResult = requireOwnerPermission(authResult.context)
  if (!permResult.success) {
    return { success: false, error: permResult.error }
  }

  // 2. Validate input
  const uuidSchema = z.string().uuid()
  const validation = validateInput(uuidSchema, memberId)
  if (!validation.success) {
    return { success: false, error: 'Invalid member ID' }
  }

  const { tenantId, userId } = authResult.context

  // 3. Cannot remove yourself
  if (memberId === userId) {
    return { success: false, error: 'You cannot remove yourself from the team' }
  }

  // 4. Check member exists and is not owner
  const supabase = await createClient()
  const { data: member } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', memberId)
    .eq('tenant_id', tenantId)
    .single<{ id: string; role: string | null }>()

  if (!member) {
    return { success: false, error: 'Team member not found' }
  }

  if (member.role === 'owner') {
    return { success: false, error: 'Cannot remove the owner from the team' }
  }

  // 5. Delete the profile (this will cascade delete auth user via trigger if needed)
  // Note: We're just removing from this tenant - the user still exists in Supabase Auth
  // We'll set tenant_id to null to effectively remove them from the team
  const { error } = await (supabase as any)
    .from('profiles')
    .delete()
    .eq('id', memberId)
    .eq('tenant_id', tenantId)

  if (error) {
    console.error('Failed to remove team member:', error)
    return { success: false, error: 'Failed to remove team member' }
  }

  // 6. Revalidate team page
  revalidatePath('/settings/team')

  return { success: true }
}
