'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[]
  error?: string
  label?: string
  placeholder?: string
}

/**
 * Defer useId() until after mount so server and initial client render match
 * (no id/htmlFor), avoiding Next.js/React 19 hydration mismatch when no explicit id is passed.
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, label, placeholder, id, ...props }, ref) => {
    const generatedId = React.useId()
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])
    const inputId = id ?? (mounted ? generatedId : undefined)

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-xs font-medium text-neutral-500"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          {...props}
          id={inputId}
        >
          {placeholder != null && (
            <option value="">{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="mt-1 text-sm text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
