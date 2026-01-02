'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getTeamMembersForMention, type TeamMember } from '@/app/actions/chatter'

interface MentionInputProps {
    value: string
    onChange: (value: string) => void
    onMentionsChange: (userIds: string[]) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function MentionInput({
    value,
    onChange,
    onMentionsChange,
    placeholder = 'Write a message... Use @ to mention',
    className,
    disabled = false
}: MentionInputProps) {
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState<TeamMember[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [mentionStartIndex, setMentionStartIndex] = useState(-1)
    const [trackedMentions, setTrackedMentions] = useState<Map<string, string>>(new Map()) // name -> userId
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Load suggestions when @ is detected
    const loadSuggestions = useCallback(async (query: string) => {
        const result = await getTeamMembersForMention(query)
        if (result.success && result.data) {
            setSuggestions(result.data)
            setSelectedIndex(0)
        }
    }, [])

    // Update tracked mentions based on current text
    const updateTrackedMentions = useCallback((text: string) => {
        const newTracked = new Map<string, string>()
        trackedMentions.forEach((userId, name) => {
            if (text.includes(`@${name}`)) {
                newTracked.set(name, userId)
            }
        })
        setTrackedMentions(newTracked)
        onMentionsChange(Array.from(newTracked.values()))
    }, [trackedMentions, onMentionsChange])

    // Handle input changes
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        const cursor = e.target.selectionStart || 0

        onChange(newValue)

        // Check for @ trigger
        const textBeforeCursor = newValue.slice(0, cursor)
        const lastAtIndex = textBeforeCursor.lastIndexOf('@')

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
            // Only search if no space after @ (still typing mention)
            if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
                setMentionStartIndex(lastAtIndex)
                setShowSuggestions(true)
                loadSuggestions(textAfterAt)
            } else {
                setShowSuggestions(false)
                setMentionStartIndex(-1)
            }
        } else {
            setShowSuggestions(false)
            setMentionStartIndex(-1)
        }

        // Update tracked mentions (remove ones that were deleted)
        updateTrackedMentions(newValue)
    }, [onChange, loadSuggestions, updateTrackedMentions])

    // Handle selecting a mention
    const selectMention = useCallback((member: TeamMember) => {
        if (mentionStartIndex === -1) return

        const beforeMention = value.slice(0, mentionStartIndex)
        const afterCursor = value.slice(inputRef.current?.selectionStart || value.length)

        // Use display name for mention
        const mentionText = `@${member.user_name} `
        const newValue = beforeMention + mentionText + afterCursor

        onChange(newValue)
        setShowSuggestions(false)
        setMentionStartIndex(-1)

        // Track this mention
        const newTracked = new Map(trackedMentions)
        newTracked.set(member.user_name, member.user_id)
        setTrackedMentions(newTracked)
        onMentionsChange(Array.from(newTracked.values()))

        // Focus back on input and set cursor position
        setTimeout(() => {
            if (inputRef.current) {
                const newCursorPos = beforeMention.length + mentionText.length
                inputRef.current.focus()
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
            }
        }, 0)
    }, [value, mentionStartIndex, onChange, trackedMentions, onMentionsChange])

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions || suggestions.length === 0) {
            // Allow Enter to submit when not showing suggestions
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % suggestions.length)
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
                break
            case 'Enter':
            case 'Tab':
                e.preventDefault()
                selectMention(suggestions[selectedIndex])
                break
            case 'Escape':
                setShowSuggestions(false)
                setMentionStartIndex(-1)
                break
        }
    }, [showSuggestions, suggestions, selectedIndex, selectMention])

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={cn('relative', className)}>
            <textarea
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    'w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
                    'resize-none placeholder:text-neutral-400',
                    'disabled:bg-neutral-50 disabled:cursor-not-allowed'
                )}
                rows={2}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute bottom-full left-0 mb-1 w-full max-h-48 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg z-50"
                >
                    {suggestions.map((member, index) => (
                        <button
                            key={member.user_id}
                            onClick={() => selectMention(member)}
                            className={cn(
                                'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
                                index === selectedIndex
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-neutral-50'
                            )}
                        >
                            {member.user_avatar ? (
                                <img
                                    src={member.user_avatar}
                                    alt=""
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                                    {member.user_name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">
                                    {member.user_name}
                                </p>
                                <p className="text-xs text-neutral-500 truncate">
                                    {member.user_email}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
