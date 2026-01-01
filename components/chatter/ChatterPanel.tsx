'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageCircle, Users, Send, Reply, Bell, BellOff, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
    getEntityMessages,
    postMessage,
    getEntityFollowers,
    followEntity,
    unfollowEntity,
    isFollowingEntity,
    type ChatterEntityType,
    type ChatterMessage,
    type ChatterFollower
} from '@/app/actions/chatter'
import { MentionInput } from './MentionInput'
import { MessageItem } from './MessageItem'
import { FollowersList } from './FollowersList'

interface ChatterPanelProps {
    entityType: ChatterEntityType
    entityId: string
    entityName: string
    currentUserId: string
    className?: string
}

export function ChatterPanel({
    entityType,
    entityId,
    entityName,
    currentUserId,
    className
}: ChatterPanelProps) {
    const [activeTab, setActiveTab] = useState<'messages' | 'followers'>('messages')
    const [messages, setMessages] = useState<ChatterMessage[]>([])
    const [followers, setFollowers] = useState<ChatterFollower[]>([])
    const [following, setFollowing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [newMessage, setNewMessage] = useState('')
    const [mentionedUsers, setMentionedUsers] = useState<string[]>([])
    const [replyingTo, setReplyingTo] = useState<ChatterMessage | null>(null)
    const [sending, setSending] = useState(false)

    // Load initial data
    const loadData = useCallback(async () => {
        setLoading(true)
        const [messagesResult, followersResult, followingResult] = await Promise.all([
            getEntityMessages(entityType, entityId),
            getEntityFollowers(entityType, entityId),
            isFollowingEntity(entityType, entityId)
        ])

        if (messagesResult.success && messagesResult.data) {
            setMessages(messagesResult.data)
        }
        if (followersResult.success && followersResult.data) {
            setFollowers(followersResult.data)
        }
        setFollowing(followingResult)
        setLoading(false)
    }, [entityType, entityId])

    useEffect(() => {
        loadData()
    }, [loadData])

    // Handle sending a message
    async function handleSendMessage() {
        if (!newMessage.trim() || sending) return

        setSending(true)
        const result = await postMessage(
            entityType,
            entityId,
            newMessage.trim(),
            replyingTo?.id,
            mentionedUsers
        )

        if (result.success) {
            setNewMessage('')
            setMentionedUsers([])
            setReplyingTo(null)
            await loadData() // Refresh messages
        }
        setSending(false)
    }

    // Handle follow/unfollow
    async function handleFollowToggle() {
        if (following) {
            const result = await unfollowEntity(entityType, entityId)
            if (result.success) {
                setFollowing(false)
            }
        } else {
            const result = await followEntity(entityType, entityId)
            if (result.success) {
                setFollowing(true)
            }
        }
        // Refresh followers list
        const followersResult = await getEntityFollowers(entityType, entityId)
        if (followersResult.success && followersResult.data) {
            setFollowers(followersResult.data)
        }
    }

    // Handle Enter key to send (Shift+Enter for new line)
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    return (
        <Card className={cn('flex flex-col', className)}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-neutral-400" />
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        Chatter
                    </h2>
                </div>
                <Button
                    variant={following ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={handleFollowToggle}
                    className={following ? 'text-pickle-600' : ''}
                >
                    {following ? (
                        <>
                            <BellOff className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Following</span>
                        </>
                    ) : (
                        <>
                            <Bell className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Follow</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-100">
                <button
                    onClick={() => setActiveTab('messages')}
                    className={cn(
                        'flex-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                        activeTab === 'messages'
                            ? 'border-pickle-500 text-pickle-600'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    )}
                >
                    <MessageCircle className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                    Messages
                    {messages.length > 0 && (
                        <span className="ml-1.5 text-xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-full">
                            {messages.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('followers')}
                    className={cn(
                        'flex-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                        activeTab === 'followers'
                            ? 'border-pickle-500 text-pickle-600'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    )}
                >
                    <Users className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                    Followers
                    {followers.length > 0 && (
                        <span className="ml-1.5 text-xs bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-full">
                            {followers.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 max-h-[400px] min-h-[200px]">
                {activeTab === 'messages' ? (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-neutral-400">
                                <div className="animate-pulse">Loading messages...</div>
                            </div>
                        ) : messages.length > 0 ? (
                            messages.map(message => (
                                <MessageItem
                                    key={message.id}
                                    message={message}
                                    currentUserId={currentUserId}
                                    onReply={() => setReplyingTo(message)}
                                    onRefresh={loadData}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-neutral-400">
                                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                                <p className="font-medium">No messages yet</p>
                                <p className="text-sm mt-1">Start the conversation!</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <FollowersList
                        followers={followers}
                        entityType={entityType}
                        entityId={entityId}
                        currentUserId={currentUserId}
                        onRefresh={loadData}
                    />
                )}
            </div>

            {/* Composer - only show on messages tab */}
            {activeTab === 'messages' && (
                <div className="border-t border-neutral-100 px-4 py-3 sm:px-6 sm:py-4">
                    {/* Reply indicator */}
                    {replyingTo && (
                        <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500 bg-neutral-50 px-3 py-2 rounded-lg">
                            <Reply className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                                Replying to <span className="font-medium">{replyingTo.author_name}</span>
                            </span>
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="ml-auto text-neutral-400 hover:text-neutral-600 p-0.5"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Input and send button */}
                    <div className="flex gap-2" onKeyDown={handleKeyDown}>
                        <MentionInput
                            value={newMessage}
                            onChange={setNewMessage}
                            onMentionsChange={setMentionedUsers}
                            placeholder={replyingTo ? 'Write a reply...' : 'Write a message... Use @ to mention'}
                            className="flex-1"
                            disabled={sending}
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || sending}
                            loading={sending}
                            size="icon"
                            className="flex-shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Hint text */}
                    <p className="mt-2 text-xs text-neutral-400">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                </div>
            )}
        </Card>
    )
}
