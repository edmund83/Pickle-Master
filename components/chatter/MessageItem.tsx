'use client'

import { useState } from 'react'
import { Reply, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'
import {
    editMessage,
    deleteMessage,
    getMessageReplies,
    type ChatterMessage,
    type ChatterReply
} from '@/app/actions/chatter'
import { Button } from '@/components/ui/button'

interface MessageItemProps {
    message: ChatterMessage | ChatterReply
    currentUserId: string
    onReply?: () => void
    onRefresh: () => void
    isReply?: boolean
}

export function MessageItem({
    message,
    currentUserId,
    onReply,
    onRefresh,
    isReply = false
}: MessageItemProps) {
    const { formatRelativeTime } = useFormatting()
    const [showActions, setShowActions] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(message.content)
    const [saving, setSaving] = useState(false)
    const [showReplies, setShowReplies] = useState(false)
    const [replies, setReplies] = useState<ChatterReply[]>([])
    const [loadingReplies, setLoadingReplies] = useState(false)

    const isAuthor = message.author_id === currentUserId
    const replyCount = 'reply_count' in message ? message.reply_count : 0

    // Load replies
    async function handleToggleReplies() {
        if (showReplies) {
            setShowReplies(false)
            return
        }

        setLoadingReplies(true)
        const result = await getMessageReplies(message.id)
        if (result.success && result.data) {
            setReplies(result.data)
        }
        setLoadingReplies(false)
        setShowReplies(true)
    }

    // Handle edit
    async function handleEdit() {
        if (!editContent.trim() || saving) return

        setSaving(true)
        const result = await editMessage(message.id, editContent.trim())
        if (result.success) {
            setIsEditing(false)
            onRefresh()
        }
        setSaving(false)
    }

    // Handle delete
    async function handleDelete() {
        if (!confirm('Delete this message?')) return

        const result = await deleteMessage(message.id)
        if (result.success) {
            onRefresh()
        }
    }

    // Render content with highlighted @mentions
    function renderContent(content: string) {
        // Split by @mentions pattern
        const parts = content.split(/(@\S+)/g)
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return (
                    <span key={i} className="text-primary font-medium">
                        {part}
                    </span>
                )
            }
            return part
        })
    }

    return (
        <div className={cn('group', isReply && 'ml-10 pl-4 border-l-2 border-neutral-100')}>
            <div
                className="flex gap-3"
                onMouseEnter={() => setShowActions(true)}
                onMouseLeave={() => setShowActions(false)}
            >
                {/* Avatar */}
                {message.author_avatar ? (
                    <img
                        src={message.author_avatar}
                        alt=""
                        className="h-8 w-8 rounded-full flex-shrink-0 object-cover"
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm text-primary font-medium">
                        {message.author_name.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-neutral-900">
                            {message.author_name}
                        </span>
                        <span className="text-xs text-neutral-400">
                            {formatRelativeTime(message.created_at)}
                        </span>
                        {message.edited_at && (
                            <span className="text-xs text-neutral-400 italic">(edited)</span>
                        )}
                        {message.is_system_message && (
                            <span className="text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                                System
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    {isEditing ? (
                        <div className="mt-2 space-y-2">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                                rows={2}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleEdit}
                                    loading={saving}
                                    disabled={!editContent.trim()}
                                >
                                    Save
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditContent(message.content)
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-0.5 text-sm text-neutral-700 whitespace-pre-wrap break-words">
                            {renderContent(message.content)}
                        </p>
                    )}

                    {/* Reply count & toggle */}
                    {!isReply && replyCount > 0 && (
                        <button
                            onClick={handleToggleReplies}
                            className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary"
                            disabled={loadingReplies}
                        >
                            {showReplies ? (
                                <ChevronUp className="h-3 w-3" />
                            ) : (
                                <ChevronDown className="h-3 w-3" />
                            )}
                            {loadingReplies
                                ? 'Loading...'
                                : `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
                        </button>
                    )}
                </div>

                {/* Actions */}
                {showActions && !isEditing && !message.is_system_message && (
                    <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isReply && onReply && (
                            <button
                                onClick={onReply}
                                className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                                title="Reply"
                            >
                                <Reply className="h-4 w-4" />
                            </button>
                        )}
                        {isAuthor && (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1 text-neutral-400 hover:text-neutral-600 rounded"
                                    title="Edit"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="p-1 text-neutral-400 hover:text-red-500 rounded"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Replies */}
            {showReplies && replies.length > 0 && (
                <div className="mt-3 space-y-3">
                    {replies.map(reply => (
                        <MessageItem
                            key={reply.id}
                            message={reply}
                            currentUserId={currentUserId}
                            onRefresh={() => {
                                handleToggleReplies() // Reload replies
                                onRefresh() // Refresh parent
                            }}
                            isReply
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
