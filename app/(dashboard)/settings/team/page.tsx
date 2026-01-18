import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus, Mail, Shield, Crown, ShieldCheck, Edit3, Eye, Search } from 'lucide-react'
import type { Profile } from '@/types/database.types'

async function getTeamData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

   
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { members: [], isOwner: false, currentUserId: user.id }

   
  const { data: members } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: true })

  return {
    members: (members || []) as Profile[],
    isOwner: profile.role === 'owner',
    currentUserId: user.id,
  }
}

const roleConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
  owner: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: <Crown className="h-3 w-3" />,
    label: 'Owner',
  },
  admin: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <ShieldCheck className="h-3 w-3" />,
    label: 'Admin',
  },
  editor: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <Edit3 className="h-3 w-3" />,
    label: 'Editor',
  },
  viewer: {
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    icon: <Eye className="h-3 w-3" />,
    label: 'Viewer',
  },
}

export default async function TeamSettingsPage() {
  const { members, isOwner, currentUserId } = await getTeamData()

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-900">Team</h1>
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>
          <p className="mt-1 text-neutral-500">Manage your team and their access permissions</p>
        </div>
        {isOwner && (
          <Button disabled title="Coming soon">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Team Members Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Team Members</CardTitle>
                <CardDescription>People with access to your inventory</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search (future enhancement placeholder) */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  disabled
                  className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm text-neutral-500 placeholder-neutral-400"
                />
              </div>
            </div>

            {/* Members List */}
            <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
              {members.map((member) => {
                const role = roleConfig[member.role || 'viewer'] || roleConfig.viewer
                const isCurrentUser = member.id === currentUserId
                const initials = (member.full_name || member.email)
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2) || 'U'

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-4 ${
                      isCurrentUser ? 'bg-primary/5' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {member.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.avatar_url}
                            alt={member.full_name || 'User'}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-900">
                            {member.full_name || 'Unnamed User'}
                          </p>
                          {isCurrentUser && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                          <Mail className="h-3.5 w-3.5" />
                          {member.email}
                        </div>
                      </div>
                    </div>

                    {/* Role & Actions */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${role.bgColor} ${role.color}`}
                      >
                        {role.icon}
                        {role.label}
                      </span>
                      {isOwner && member.role !== 'owner' && (
                        <Button variant="ghost" size="sm" disabled title="Coming soon">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}

              {members.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-neutral-300" />
                  <p className="mt-2 text-sm text-neutral-500">No team members yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roles & Permissions */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Role Permissions</CardTitle>
                <CardDescription>What each role can do in your organization</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(roleConfig).map(([key, config]) => (
                <div
                  key={key}
                  className="rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bgColor} ${config.color}`}
                    >
                      {config.icon}
                      {config.label}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-neutral-600">
                    {key === 'owner' &&
                      'Full access including billing, team management, and all settings'}
                    {key === 'admin' &&
                      'Manage inventory, settings, and invite new members'}
                    {key === 'editor' &&
                      'Create and edit inventory items, run reports'}
                    {key === 'viewer' &&
                      'View inventory and reports (read-only access)'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invite Banner */}
        {isOwner && (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-6 text-center">
            <UserPlus className="mx-auto h-8 w-8 text-neutral-400" />
            <h3 className="mt-3 font-medium text-neutral-900">Invite team members</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Add colleagues to collaborate on inventory management
            </p>
            <Button className="mt-4" disabled>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
            <p className="mt-2 text-xs text-neutral-400">Coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
