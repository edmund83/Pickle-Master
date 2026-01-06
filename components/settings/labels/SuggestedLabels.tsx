'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Lightbulb, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SuggestedLabel {
  name: string
  color: string
  description: string
}

export const SUGGESTED_LABELS: SuggestedLabel[] = [
  { name: 'Fragile', color: '#ef4444', description: 'Breakable items requiring care' },
  { name: 'High Value', color: '#8b5cf6', description: 'Expensive assets worth tracking' },
  { name: 'Perishable', color: '#f97316', description: 'Food/items with expiry dates' },
  { name: 'Hazmat', color: '#ef4444', description: 'Hazardous materials' },
  { name: 'Refrigerate', color: '#14b8a6', description: 'Cold storage required' },
  { name: 'Damaged', color: '#eab308', description: 'Items needing repair' },
  { name: 'Overstock', color: '#3b82f6', description: 'Excess inventory' },
  { name: 'Returns', color: '#ec4899', description: 'Customer returns' },
  { name: 'Defective', color: '#6b7280', description: 'Manufacturing defects' },
  { name: 'On Hold', color: '#f97316', description: 'Items pending action' },
]

interface SuggestedLabelsProps {
  existingLabels: string[]
  onAddLabel: (label: SuggestedLabel) => Promise<void>
  className?: string
}

export function SuggestedLabels({
  existingLabels,
  onAddLabel,
  className,
}: SuggestedLabelsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [addingLabel, setAddingLabel] = useState<string | null>(null)

  // Normalize existing label names for comparison (lowercase)
  const existingNormalized = existingLabels.map((l) => l.toLowerCase())

  // Filter out already-created labels
  const availableLabels = SUGGESTED_LABELS.filter(
    (label) => !existingNormalized.includes(label.name.toLowerCase())
  )

  // Don't show section if all labels are already created
  if (availableLabels.length === 0) {
    return null
  }

  async function handleAdd(label: SuggestedLabel) {
    setAddingLabel(label.name)
    try {
      await onAddLabel(label)
    } finally {
      setAddingLabel(null)
    }
  }

  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-neutral-50', className)}>
      {/* Header - clickable to expand/collapse */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-neutral-900">Suggested Labels</h3>
            <p className="text-xs text-neutral-500">
              Quick-add common inventory labels ({availableLabels.length} available)
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-neutral-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-400" />
        )}
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {availableLabels.map((label) => {
              const isAdding = addingLabel === label.name

              return (
                <button
                  key={label.name}
                  type="button"
                  onClick={() => handleAdd(label)}
                  disabled={isAdding}
                  title={label.description}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-2',
                    'text-sm font-medium transition-all duration-200',
                    'border border-transparent',
                    'hover:scale-105 active:scale-95',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    'disabled:opacity-50 disabled:pointer-events-none',
                    // Use label color for styling
                    'hover:border-current'
                  )}
                  style={{
                    backgroundColor: `${label.color}15`,
                    color: label.color,
                  }}
                >
                  {isAdding ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  {label.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default SuggestedLabels
