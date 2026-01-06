'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface LabelColor {
  value: string
  label: string
}

export const LABEL_COLORS: LabelColor[] = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6b7280', label: 'Gray' },
]

interface LabelColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
  disabled?: boolean
}

export function LabelColorPicker({
  value,
  onChange,
  className,
  disabled,
}: LabelColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="radiogroup" aria-label="Label color">
      {LABEL_COLORS.map((color) => {
        const isSelected = value === color.value
        return (
          <button
            key={color.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${color.label} color`}
            disabled={disabled}
            onClick={() => onChange(color.value)}
            className={cn(
              // Base: 44px touch target for mobile accessibility
              'relative h-11 w-11 rounded-full',
              'transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50',
              // Hover/active states
              'hover:scale-105 active:scale-95',
              // Selected state - ring indicator
              isSelected && 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
            )}
            style={{ backgroundColor: color.value }}
          >
            {/* Checkmark for selected state */}
            {isSelected && (
              <Check
                className={cn(
                  'absolute inset-0 m-auto h-5 w-5',
                  // Use white or dark text based on color brightness
                  ['#eab308', '#22c55e'].includes(color.value)
                    ? 'text-neutral-900'
                    : 'text-white'
                )}
                strokeWidth={3}
              />
            )}
            {/* Screen reader text */}
            <span className="sr-only">{color.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default LabelColorPicker
