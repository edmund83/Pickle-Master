import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, Mail, Shield } from 'lucide-react'
import type { Profile } from '@/types/database.types'

async function getTeamData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return { members: [], isOwner: false }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: members } = await (supabase as any)
    .from('profiles')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: true })

  return {
    members: (members || []) as Profile[],
    isOwner: profile.role === 'owner',
  }
}

const roleColors: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  editor: 'bg-green-100 text-green-700',
  viewer: 'bg-neutral-100 text-neutral-700',
}

export default async function TeamSettingsPage() {
  const { members, isOwner } = await getTeamData()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Team Members</h1>
          <p className="text-neutral-500">Manage your team and their permissions</p>
        </div>
        {isOwner && (
          <Button disabled title="Coming soon">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team ({members.length})
          </CardTitle>
          <CardDescription>
            People with access to your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pickle-100 text-sm font-medium text-pickle-600">
                    {(member.full_name || member.email)?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {member.full_name || 'Unnamed User'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      roleColors[member.role || 'viewer'] || roleColors.viewer
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    {member.role || 'viewer'}
                  </span>
                  {isOwner && member.role !== 'owner' && (
                    <Button variant="ghost" size="sm" disabled title="Coming soon">
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roles explanation */}
      <Card className="mt-6 max-w-4xl">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                  Owner
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Full access including billing, team management, and all settings
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Admin
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Manage inventory, settings, and invite new members
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Editor
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                Create and edit inventory items, run reports
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                  Viewer
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">
                View inventory and reports (read-only access)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
