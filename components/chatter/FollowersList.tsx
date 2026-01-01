'use client'

import { useState } from 'react'
import { UserPlus, Mail, Bell, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
    type ChatterFollower,
    type ChatterEntityType,
    updateFollowPreferences
} from '@/app/actions/chatter'

interface FollowersListProps {
    followers: ChatterFollower[]
    entityType: ChatterEntityType
    entityId: string
    currentUserId: string
    onRefresh: () => void
}

export function FollowersList({
    followers,
    entityType,
    entityId,
    currentUserId,
    onRefresh
}: FollowersListProps) {
    const [showInviteHint, setShowInviteHint] = useState(false)

    // Find current user's follow record
    const currentUserFollow = followers.find(f => f.user_id === currentUserId)

    // Toggle notification preference
    async function handleTogglePreference(
        preference: 'notify_email' | 'notify_in_app' | 'notify_push',
        currentValue: boolean
    ) {
        const result = await updateFollowPreferences(entityType, entityId, {
            [preference]: !currentValue
        })
        if (result.success) {
            onRefresh()
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">
                    {followers.length} {followers.length === 1 ? 'person' : 'people'} following
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInviteHint(!showInviteHint)}
                >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                </Button>
            </div>

            {/* Invite hint */}
            {showInviteHint && (
                <div className="p-3 bg-pickle-50 rounded-lg text-sm text-pickle-700">
                    <p className="font-medium mb-1">How to invite followers:</p>
                    <p className="text-pickle-600">
                        When team members comment on this item or @mention it, they will automatically
                        become followers and receive notifications.
                    </p>
                </div>
            )}

            {/* Current user's notification preferences */}
            {currentUserFollow && (
                <div className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                        Your notification preferences
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleTogglePreference('notify_in_app', currentUserFollow.notify_in_app)}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                                currentUserFollow.notify_in_app
                                    ? 'bg-pickle-100 text-pickle-700'
                                    : 'bg-neutral-200 text-neutral-500'
                            )}
                        >
                            <Bell className="h-3.5 w-3.5" />
                            In-app
                        </button>
                        <button
                            onClick={() => handleTogglePreference('notify_email', currentUserFollow.notify_email)}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                                currentUserFollow.notify_email
                                    ? 'bg-pickle-100 text-pickle-700'
                                    : 'bg-neutral-200 text-neutral-500'
                            )}
                        >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                        </button>
                        <button
                            onClick={() => handleTogglePreference('notify_push', currentUserFollow.notify_push)}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors',
                                currentUserFollow.notify_push
                                    ? 'bg-pickle-100 text-pickle-700'
                                    : 'bg-neutral-200 text-neutral-500'
                            )}
                        >
                            <Smartphone className="h-3.5 w-3.5" />
                            Push
                        </button>
                    </div>
                </div>
            )}

            {/* Followers list */}
            <div className="space-y-1">
                {followers.map(follower => (
                    <div
                        key={follower.user_id}
                        className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                        {follower.user_avatar ? (
                            <img
                                src={follower.user_avatar}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-pickle-100 flex items-center justify-center text-sm text-pickle-600 font-medium">
                                {follower.user_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                                {follower.user_name}
                                {follower.user_id === currentUserId && (
                                    <span className="ml-1 text-xs text-neutral-400">(you)</span>
                                )}
                            </p>
                            <p className="text-xs text-neutral-400">
                                Following since{' '}
                                {formatDistanceToNow(new Date(follower.followed_at), { addSuffix: true })}
                            </p>
                        </div>
                        {/* Notification icons */}
                        <div className="flex items-center gap-1">
                            {follower.notify_in_app && (
                                <Bell className="h-3.5 w-3.5 text-neutral-400" />
                            )}
                            {follower.notify_email && (
                                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                            )}
                            {follower.notify_push && (
                                <Smartphone className="h-3.5 w-3.5 text-neutral-400" />
                            )}
                        </div>
                    </div>
                ))}

                {followers.length === 0 && (
                    <div className="text-center py-6 text-neutral-400">
                        <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No followers yet</p>
                        <p className="text-sm">Be the first to comment!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
