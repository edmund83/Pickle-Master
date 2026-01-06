'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LabelWithUsage } from './LabelCard'

interface LabelListItemProps {
  label: LabelWithUsage
  selected: boolean
  onSelect: (selected: boolean) => void
  onEdit: () => void
  onDelete: () => void
  selectionMode: boolean
}

export function LabelListItem({
  label,
  selected,
  onSelect,
  onEdit,
  onDelete,
  selectionMode,
}: LabelListItemProps) {
  const color = label.color || '#6b7280'

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5',
        'border-b border-neutral-100 last:border-b-0',
        'transition-colors duration-150',
        selected ? 'bg-primary/5' : 'hover:bg-neutral-50',
        selectionMode && 'cursor-pointer'
      )}
      onClick={selectionMode ? () => onSelect(!selected) : undefined}
    >
      {/* Checkbox - always visible in selection mode, hidden otherwise */}
      <div className={cn('flex-shrink-0', !selectionMode && 'hidden sm:block')}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation()
            onSelect(e.target.checked)
          }}
          className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
          aria-label={`Select ${label.name}`}
        />
      </div>

      {/* Color indicator */}
      <div
        className="h-4 w-4 flex-shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />

      {/* Label name - takes most space */}
      <span className="flex-1 font-medium text-neutral-900 truncate text-sm">
        {label.name}
      </span>

      {/* Badge preview - hidden on small screens */}
      <span
        className="hidden md:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
        style={{
          backgroundColor: `${color}15`,
          color: color,
        }}
      >
        {label.name.length > 12 ? label.name.slice(0, 12) + '...' : label.name}
      </span>

      {/* Usage count */}
      <span className="flex-shrink-0 text-xs text-neutral-400 w-16 text-right">
        {label.usage_count === 0
          ? 'Unused'
          : `${label.usage_count} item${label.usage_count === 1 ? '' : 's'}`}
      </span>

      {/* Actions - hidden in selection mode */}
      {!selectionMode && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-neutral-400 hover:text-neutral-600',
              'hover:bg-neutral-100 active:bg-neutral-200',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
            aria-label={`Edit ${label.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md',
              'text-neutral-400 hover:text-red-500',
              'hover:bg-red-50 active:bg-red-100',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
            )}
            aria-label={`Delete ${label.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default LabelListItem
