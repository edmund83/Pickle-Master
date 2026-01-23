'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Crown,
  Briefcase,
  Eye,
  Search,
  MoreVertical,
  Trash2,
  Clock,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { InviteDialog } from './invite-dialog'
import {
  getInvitations,
  cancelInvitation,
  resendInvitation,
  updateMemberRole,
  removeMember,
  type Invitation,
} from '@/app/actions/invitations'
import { useRouter } from 'next/navigation'

// =============================================================================
// TYPES
// =============================================================================

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
}

interface TeamContentProps {
  members: TeamMember[]
  isOwner: boolean
  currentUserId: string
  initialInvitations: Invitation[]
}

// =============================================================================
// ROLE CONFIG (3 roles only)
// =============================================================================

const roleConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string; description: string }> = {
  owner: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: <Crown className="h-3 w-3" />,
    label: 'Owner',
    description: 'Full access including billing, team management, and all settings',
  },
  staff: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <Briefcase className="h-3 w-3" />,
    label: 'Staff',
    description: 'Create, edit, and delete inventory items. Manage orders and run reports.',
  },
  viewer: {
    color: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    icon: <Eye className="h-3 w-3" />,
    label: 'Viewer',
    description: 'View inventory and reports (read-only access)',
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TeamContent({ members, isOwner, currentUserId, initialInvitations }: TeamContentProps) {
  const router = useRouter()
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    variant: 'destructive' | 'warning' | 'default'
    onConfirm: () => Promise<void>
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'destructive',
    onConfirm: async () => {},
  })

  // Refresh invitations
  async function refreshInvitations() {
    const result = await getInvitations()
    if (result.success && result.invitations) {
      setInvitations(result.invitations)
    }
  }

  // Handle cancel invitation
  async function handleCancelInvitation(invitation: Invitation) {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Invitation',
      description: `Are you sure you want to cancel the invitation for ${invitation.email}?`,
      variant: 'warning',
      onConfirm: async () => {
        setIsLoading(true)
        try {
          const result = await cancelInvitation(invitation.id)
          if (result.success) {
            await refreshInvitations()
          }
        } finally {
          setIsLoading(false)
        }
      },
    })
  }

  // Handle resend invitation
  async function handleResendInvitation(invitationId: string) {
    setIsLoading(true)
    try {
      const result = await resendInvitation(invitationId)
      if (result.success) {
        await refreshInvitations()
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle role change
  async function handleRoleChange(memberId: string, memberName: string, newRole: 'staff' | 'viewer') {
    setConfirmDialog({
      isOpen: true,
      title: 'Change Role',
      description: `Change ${memberName}'s role to ${roleConfig[newRole].label}?`,
      variant: 'default',
      onConfirm: async () => {
        setIsLoading(true)
        try {
          const result = await updateMemberRole(memberId, newRole)
          if (result.success) {
            router.refresh()
          }
        } finally {
          setIsLoading(false)
        }
      },
    })
  }

  // Handle remove member
  async function handleRemoveMember(member: TeamMember) {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Team Member',
      description: `Are you sure you want to remove ${member.full_name || member.email} from the team? They will lose access to all inventory data.`,
      variant: 'destructive',
      onConfirm: async () => {
        setIsLoading(true)
        try {
          const result = await removeMember(member.id)
          if (result.success) {
            router.refresh()
          }
        } finally {
          setIsLoading(false)
        }
      },
    })
  }

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
          <Button onClick={() => setIsInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Pending Invitations */}
        {isOwner && invitations.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Pending Invitations</CardTitle>
                  <CardDescription>Invitations waiting to be accepted</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                {invitations.map((invitation) => {
                  const role = roleConfig[invitation.role] || roleConfig.viewer
                  const expiresIn = Math.ceil(
                    (new Date(invitation.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )

                  return (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 hover:bg-neutral-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{invitation.email}</p>
                          <p className="text-sm text-neutral-500">
                            Expires in {expiresIn} {expiresIn === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${role.bgColor} ${role.color}`}
                        >
                          {role.icon}
                          {role.label}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleResendInvitation(invitation.id)}
                              disabled={isLoading}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCancelInvitation(invitation)}
                              className="text-red-600"
                              disabled={isLoading}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role !== 'staff' && (
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, member.full_name || member.email, 'staff')}
                                disabled={isLoading}
                              >
                                <Briefcase className="mr-2 h-4 w-4" />
                                Make Staff
                              </DropdownMenuItem>
                            )}
                            {member.role !== 'viewer' && (
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(member.id, member.full_name || member.email, 'viewer')}
                                disabled={isLoading}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Make Viewer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member)}
                              className="text-red-600"
                              disabled={isLoading}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            <div className="grid gap-3 sm:grid-cols-3">
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
                  <p className="mt-3 text-sm text-neutral-600">{config.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invite Banner (only show if no members invited yet and is owner) */}
        {isOwner && members.length === 1 && invitations.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-6 text-center">
            <UserPlus className="mx-auto h-8 w-8 text-neutral-400" />
            <h3 className="mt-3 font-medium text-neutral-900">Invite team members</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Add colleagues to collaborate on inventory management
            </p>
            <Button className="mt-4" onClick={() => setIsInviteOpen(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <InviteDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={refreshInvitations}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
      />

      {/* Global loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  )
}
