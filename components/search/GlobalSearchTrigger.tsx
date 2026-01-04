'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'

interface GlobalSearchTriggerProps {
  variant?: 'desktop' | 'mobile'
  className?: string
}

export function GlobalSearchTrigger({ variant = 'desktop', className }: GlobalSearchTriggerProps) {
  const { openSearch } = useGlobalSearch()

  if (variant === 'mobile') {
    return (
      <button
        onClick={openSearch}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          'bg-neutral-100 text-neutral-600',
          'hover:bg-neutral-200 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className
        )}
        aria-label="Search inventory"
      >
        <Search className="h-5 w-5" />
      </button>
    )
  }

  // Desktop variant - pill-shaped button with placeholder text and shortcut hint
  return (
    <button
      onClick={openSearch}
      className={cn(
        'flex items-center gap-2 px-3 h-10',
        'bg-white border border-neutral-200 rounded-lg',
        'text-sm text-neutral-500',
        'hover:border-neutral-300 hover:bg-neutral-50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'min-w-[200px] lg:min-w-[280px]',
        className
      )}
      aria-label="Search inventory"
    >
      <Search className="h-4 w-4 text-neutral-400 shrink-0" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-medium text-neutral-400 bg-neutral-100 rounded">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </button>
  )
}
