import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TeamContent } from './team-content'

async function getTeamData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single<{ tenant_id: string | null; role: string | null }>()

  if (!profile?.tenant_id) {
    return {
      members: [],
      isOwner: false,
      currentUserId: user.id,
      invitations: [],
    }
  }

  const isOwner = profile.role === 'owner'

  // Get all team members
  const { data: members } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: true })

  // Get pending invitations (only for owners)
  let invitations: any[] = []
  if (isOwner) {
    const { data: invitationsData } = await supabase
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
      .eq('tenant_id', profile.tenant_id)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    // Filter out invitations where user already exists as team member
    // (handles edge case where invitation wasn't marked as accepted)
    const memberEmails = new Set(
      (members || []).map((m: { email: string }) => m.email.toLowerCase())
    )

    invitations = (invitationsData || [])
      .filter((inv: any) => !memberEmails.has(inv.email.toLowerCase()))
      .map((inv: any) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        invited_by: inv.invited_by,
        invited_by_name: inv.inviter?.full_name || null,
        expires_at: inv.expires_at,
        accepted_at: inv.accepted_at,
        created_at: inv.created_at,
      }))
  }

  return {
    members: members || [],
    isOwner,
    currentUserId: user.id,
    invitations,
  }
}

export default async function TeamSettingsPage() {
  const { members, isOwner, currentUserId, invitations } = await getTeamData()

  return (
    <TeamContent
      members={members}
      isOwner={isOwner}
      currentUserId={currentUserId}
      initialInvitations={invitations}
    />
  )
}
