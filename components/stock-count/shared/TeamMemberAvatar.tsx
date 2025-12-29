'use client'

import { cn } from '@/lib/utils'

interface TeamMemberAvatarProps {
  name: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTooltip?: boolean
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
}

// Generate consistent color from name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-pickle-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-amber-500',
    'bg-green-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-orange-500',
  ]
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// Get initials from name
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function TeamMemberAvatar({
  name,
  size = 'md',
  className,
  showTooltip = true,
}: TeamMemberAvatarProps) {
  if (!name) return null

  const initials = getInitials(name)
  const bgColor = getAvatarColor(name)

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full font-medium text-white',
        sizeClasses[size],
        bgColor,
        className
      )}
      title={showTooltip ? name : undefined}
    >
      {initials}
    </div>
  )
}

interface TeamMemberAvatarGroupProps {
  members: Array<{ name: string | null; id: string }>
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TeamMemberAvatarGroup({
  members,
  maxVisible = 3,
  size = 'md',
  className,
}: TeamMemberAvatarGroupProps) {
  const validMembers = members.filter((m) => m.name)
  const visible = validMembers.slice(0, maxVisible)
  const overflow = validMembers.length - maxVisible

  const overlapClasses = {
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
  }

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((member, index) => (
        <TeamMemberAvatar
          key={member.id}
          name={member.name}
          size={size}
          className={cn(
            'ring-2 ring-white',
            index > 0 && overlapClasses[size]
          )}
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full font-medium',
            'bg-neutral-300 text-neutral-700 ring-2 ring-white',
            sizeClasses[size],
            overlapClasses[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
