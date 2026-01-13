'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleSectionProps {
  title: string
  icon?: LucideIcon
  defaultExpanded?: boolean
  hasContent?: boolean
  children: ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  icon: Icon,
  defaultExpanded = false,
  hasContent = false,
  children,
  className,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || hasContent)

  return (
    <div className={cn('rounded-lg border border-neutral-200 bg-white', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors rounded-lg"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          {Icon && <Icon className="h-4 w-4 text-neutral-500" />}
          {title}
          {hasContent && !isExpanded && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-neutral-400 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="border-t border-neutral-100 px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
