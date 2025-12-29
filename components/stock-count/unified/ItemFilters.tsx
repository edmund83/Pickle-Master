'use client'

import { cn } from '@/lib/utils'

export type FilterOption = 'all' | 'pending' | 'counted' | 'variance'

interface ItemFiltersProps {
  selected: FilterOption
  onChange: (filter: FilterOption) => void
  counts: {
    all: number
    pending: number
    counted: number
    variance: number
  }
  className?: string
}

const filterConfig: Array<{
  value: FilterOption
  label: string
  activeClass: string
}> = [
  { value: 'all', label: 'All', activeClass: 'bg-neutral-900 text-white' },
  { value: 'pending', label: 'Pending', activeClass: 'bg-blue-600 text-white' },
  { value: 'counted', label: 'Counted', activeClass: 'bg-green-600 text-white' },
  { value: 'variance', label: 'Variance', activeClass: 'bg-amber-500 text-white' },
]

export function ItemFilters({
  selected,
  onChange,
  counts,
  className,
}: ItemFiltersProps) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-1 scrollbar-hide',
        className
      )}
    >
      {filterConfig.map((filter) => {
        const count = counts[filter.value]
        const isActive = selected === filter.value

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'text-sm font-medium whitespace-nowrap',
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-pickle-500 focus:ring-offset-2',
              isActive
                ? filter.activeClass
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {filter.label}
            <span
              className={cn(
                'min-w-5 h-5 px-1 rounded-full text-xs font-semibold',
                'flex items-center justify-center',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-neutral-200 text-neutral-600'
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
