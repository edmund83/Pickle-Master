'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface SettingsFieldProps {
  label: string
  description?: string
  error?: string
  required?: boolean
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

export function SettingsField({
  label,
  description,
  error,
  required,
  disabled,
  children,
  className,
}: SettingsFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block">
        <span className="text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      </label>
      {children}
      {description && !error && (
        <p className="text-xs text-neutral-500">{description}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
  error?: string
}

export function SettingsInput({
  label,
  description,
  error,
  required,
  disabled,
  className,
  ...props
}: SettingsInputProps) {
  return (
    <SettingsField
      label={label}
      description={description}
      error={error}
      required={required}
      disabled={disabled}
    >
      <Input
        {...props}
        required={required}
        disabled={disabled}
        className={cn(
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          disabled && 'bg-neutral-50',
          className
        )}
      />
    </SettingsField>
  )
}

interface SettingsSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  description?: string
  error?: string
  options: { value: string; label: string }[]
}

export function SettingsSelect({
  label,
  description,
  error,
  required,
  disabled,
  options,
  className,
  ...props
}: SettingsSelectProps) {
  return (
    <SettingsField
      label={label}
      description={description}
      error={error}
      required={required}
      disabled={disabled}
    >
      <select
        {...props}
        required={required}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-50',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </SettingsField>
  )
}
