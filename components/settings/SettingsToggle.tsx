'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SettingsToggleProps {
  label: string
  description?: string
  icon?: LucideIcon
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function SettingsToggle({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
  disabled = false,
  className,
}: SettingsToggleProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4 transition-colors',
        disabled && 'opacity-60',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-medium text-neutral-900">{label}</p>
          {description && (
            <p className="mt-0.5 text-sm text-neutral-500">{description}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          checked ? 'bg-primary' : 'bg-neutral-200',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

// Compact version for inline use
export function SettingsToggleCompact({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: Omit<SettingsToggleProps, 'description' | 'icon'>) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-3 py-2',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          checked ? 'bg-primary' : 'bg-neutral-200',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </label>
  )
}
