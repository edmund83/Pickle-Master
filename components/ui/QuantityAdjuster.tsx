'use client'

import { useState, useCallback } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { increaseFeedback, decreaseFeedback, boundaryFeedback } from '@/lib/utils/feedback'

interface QuantityAdjusterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  unit?: string
  disabled?: boolean
  showBigButtons?: boolean
  className?: string
}

export function QuantityAdjuster({
  value,
  onChange,
  min = 0,
  max = 99999,
  unit = '',
  disabled = false,
  showBigButtons = true,
  className,
}: QuantityAdjusterProps) {
  const [isAnimating, setIsAnimating] = useState<'increase' | 'decrease' | null>(null)

  const handleChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(min, Math.min(max, value + delta))
      if (newValue !== value) {
        setIsAnimating(delta > 0 ? 'increase' : 'decrease')
        onChange(newValue)

        // Trigger appropriate haptic + sound feedback
        if (delta > 0) {
          increaseFeedback()
        } else {
          decreaseFeedback()
        }

        // Reset animation
        setTimeout(() => setIsAnimating(null), 200)
      } else {
        // Hit boundary - provide feedback
        boundaryFeedback()
      }
    },
    [value, min, max, onChange]
  )

  const buttonBaseClass = cn(
    'flex items-center justify-center',
    'rounded-2xl',
    'font-bold text-2xl',
    'transition-all duration-150',
    'active:scale-90',
    'disabled:opacity-40 disabled:pointer-events-none',
    'shadow-md'
  )

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      {/* Big -10 button */}
      {showBigButtons && (
        <button
          onClick={() => handleChange(-10)}
          disabled={disabled || value <= min}
          className={cn(
            buttonBaseClass,
            'h-14 w-14',
            'bg-red-100 text-red-600 hover:bg-red-200',
            'border-2 border-red-200'
          )}
          aria-label="Decrease by 10"
        >
          -10
        </button>
      )}

      {/* -1 button */}
      <button
        onClick={() => handleChange(-1)}
        disabled={disabled || value <= min}
        className={cn(
          buttonBaseClass,
          'h-16 w-16',
          'bg-red-500 text-white hover:bg-red-600',
          'shadow-red-500/30'
        )}
        aria-label="Decrease by 1"
      >
        <Minus className="h-8 w-8" strokeWidth={3} />
      </button>

      {/* Quantity display */}
      <div
        className={cn(
          'flex flex-col items-center justify-center',
          'min-w-24 px-4 py-2',
          'rounded-2xl',
          'bg-white border-2 border-neutral-200',
          'transition-all duration-200',
          isAnimating === 'increase' && 'border-green-400 bg-green-50 scale-105',
          isAnimating === 'decrease' && 'border-red-400 bg-red-50 scale-105'
        )}
      >
        <span
          className={cn(
            'text-4xl font-bold tabular-nums',
            'transition-colors duration-200',
            isAnimating === 'increase' && 'text-green-600',
            isAnimating === 'decrease' && 'text-red-600',
            !isAnimating && 'text-neutral-900'
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm text-neutral-500 font-medium mt-0.5">
            {unit}
          </span>
        )}
      </div>

      {/* +1 button */}
      <button
        onClick={() => handleChange(1)}
        disabled={disabled || value >= max}
        className={cn(
          buttonBaseClass,
          'h-16 w-16',
          'bg-green-500 text-white hover:bg-green-600',
          'shadow-green-500/30'
        )}
        aria-label="Increase by 1"
      >
        <Plus className="h-8 w-8" strokeWidth={3} />
      </button>

      {/* Big +10 button */}
      {showBigButtons && (
        <button
          onClick={() => handleChange(10)}
          disabled={disabled || value >= max}
          className={cn(
            buttonBaseClass,
            'h-14 w-14',
            'bg-green-100 text-green-600 hover:bg-green-200',
            'border-2 border-green-200'
          )}
          aria-label="Increase by 10"
        >
          +10
        </button>
      )}
    </div>
  )
}

/**
 * Compact version for inline use
 */
export function QuantityAdjusterCompact({
  value,
  onChange,
  min = 0,
  max = 99999,
  disabled = false,
  className,
}: Omit<QuantityAdjusterProps, 'unit' | 'showBigButtons'>) {
  const handleChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(min, Math.min(max, value + delta))
      if (newValue !== value) {
        onChange(newValue)
        // Trigger appropriate haptic + sound feedback
        if (delta > 0) {
          increaseFeedback()
        } else {
          decreaseFeedback()
        }
      } else {
        // Hit boundary - provide feedback
        boundaryFeedback()
      }
    },
    [value, min, max, onChange]
  )

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        onClick={() => handleChange(-1)}
        disabled={disabled || value <= min}
        className={cn(
          'flex items-center justify-center',
          'h-12 w-12 rounded-xl',
          'bg-red-100 text-red-600 hover:bg-red-200',
          'font-bold text-xl',
          'transition-all active:scale-90',
          'disabled:opacity-40'
        )}
        aria-label="Decrease"
      >
        <Minus className="h-6 w-6" strokeWidth={2.5} />
      </button>

      <span className="min-w-12 text-center text-2xl font-bold tabular-nums">
        {value}
      </span>

      <button
        onClick={() => handleChange(1)}
        disabled={disabled || value >= max}
        className={cn(
          'flex items-center justify-center',
          'h-12 w-12 rounded-xl',
          'bg-green-100 text-green-600 hover:bg-green-200',
          'font-bold text-xl',
          'transition-all active:scale-90',
          'disabled:opacity-40'
        )}
        aria-label="Increase"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </div>
  )
}
