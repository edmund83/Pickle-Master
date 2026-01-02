'use client'

import { cn } from '@/lib/utils'

interface CompactProgressProps {
  counted: number
  total: number
  variances?: number
  showVariances?: boolean
  className?: string
}

export function CompactProgress({
  counted,
  total,
  variances = 0,
  showVariances = false,
  className,
}: CompactProgressProps) {
  const percentage = total > 0 ? Math.round((counted / total) * 100) : 0
  const isComplete = counted === total

  return (
    <div className={cn('space-y-2', className)}>
      {/* Stats row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="font-medium text-neutral-700">
            {counted} of {total} counted
          </span>
          {showVariances && variances > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              {variances} variance{variances !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span
          className={cn(
            'font-semibold tabular-nums',
            isComplete ? 'text-green-600' : 'text-neutral-600'
          )}
        >
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isComplete ? 'bg-green-500' : 'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
