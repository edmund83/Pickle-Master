'use client'

import { cn } from '@/lib/utils'

export type CountingFilterStatus = 'all' | 'pending' | 'counted' | 'variance'

interface CountingFiltersProps {
  activeFilter: CountingFilterStatus
  onFilterChange: (filter: CountingFilterStatus) => void
  counts: {
    all: number
    pending: number
    counted: number
    variance: number
  }
}

const filterConfig: { id: CountingFilterStatus; label: string; variant?: 'default' | 'warning' | 'danger' | 'success' }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'counted', label: 'Counted', variant: 'success' },
  { id: 'variance', label: 'Variance', variant: 'warning' },
]

export function CountingFilters({
  activeFilter,
  onFilterChange,
  counts,
}: CountingFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {filterConfig.map((filter) => {
        const count = counts[filter.id]
        const isActive = activeFilter === filter.id

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              'flex items-center gap-2',
              'h-10 sm:h-11 px-4',
              'rounded-full',
              'font-medium text-sm',
              'whitespace-nowrap',
              'transition-all duration-200',
              'active:scale-95',
              isActive
                ? filter.variant === 'warning'
                  ? 'bg-amber-500 text-white'
                  : filter.variant === 'danger'
                  ? 'bg-red-500 text-white'
                  : filter.variant === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-primary text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            )}
          >
            {filter.label}
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-xs font-semibold tabular-nums',
                isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-500'
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
