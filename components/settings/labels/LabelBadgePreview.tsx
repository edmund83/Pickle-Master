'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface LabelBadgePreviewProps {
  name: string
  color: string
  className?: string
}

export function LabelBadgePreview({
  name,
  color,
  className,
}: LabelBadgePreviewProps) {
  // Show placeholder when no name
  const displayName = name.trim() || 'Label Name'
  const isPlaceholder = !name.trim()

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium text-neutral-600">Preview</p>
      <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        {/* Badge as it appears on inventory items */}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
            'text-sm font-medium transition-all duration-200',
            isPlaceholder && 'opacity-50'
          )}
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          {displayName}
        </span>

        {/* Context text */}
        <span className="text-sm text-neutral-400">
          on inventory items
        </span>
      </div>
    </div>
  )
}

export default LabelBadgePreview
