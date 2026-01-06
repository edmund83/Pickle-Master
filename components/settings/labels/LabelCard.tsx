'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LabelWithUsage {
  id: string
  name: string
  color: string | null
  usage_count: number
}

interface LabelCardProps {
  label: LabelWithUsage
  onEdit: () => void
  onDelete: () => void
  className?: string
}

export function LabelCard({ label, onEdit, onDelete, className }: LabelCardProps) {
  const color = label.color || '#6b7280'

  return (
    <div
      className={cn(
        'relative flex flex-col',
        'aspect-square',
        'rounded-2xl border border-neutral-200 bg-white',
        'transition-all duration-200',
        'hover:border-neutral-300 hover:shadow-md',
        'group overflow-hidden',
        className
      )}
    >
      {/* Colored top section - label tag style */}
      <div
        className="relative h-1/2 flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        {/* Tag hole decoration */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <div className="h-4 w-4 rounded-full bg-white/30 border-2 border-white/50" />
        </div>

        {/* Action buttons - visible on hover */}
        <div
          className={cn(
            'absolute top-2 right-2 flex gap-1',
            'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
            'transition-opacity duration-200'
          )}
        >
          <button
            type="button"
            onClick={onEdit}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              'bg-white/90 backdrop-blur-sm shadow-sm',
              'text-neutral-600 hover:text-neutral-800',
              'hover:bg-white active:bg-neutral-100',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
            )}
            aria-label={`Edit ${label.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              'bg-white/90 backdrop-blur-sm shadow-sm',
              'text-neutral-600 hover:text-red-600',
              'hover:bg-white active:bg-red-50',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
            )}
            aria-label={`Delete ${label.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* White bottom section with label info */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 text-center">
        {/* Label name */}
        <h3 className="font-semibold text-neutral-900 truncate w-full text-sm">
          {label.name}
        </h3>

        {/* Usage count */}
        <span className="text-xs text-neutral-500 mt-1">
          {label.usage_count === 0
            ? 'Not used'
            : label.usage_count === 1
            ? '1 item'
            : `${label.usage_count} items`}
        </span>

        {/* Badge preview */}
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium mt-2"
          style={{
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          {label.name.length > 10 ? label.name.slice(0, 10) + '...' : label.name}
        </span>
      </div>
    </div>
  )
}

export default LabelCard
