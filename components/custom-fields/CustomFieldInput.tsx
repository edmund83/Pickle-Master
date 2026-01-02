'use client'

import { Input } from '@/components/ui/input'
import type { CustomFieldDefinition } from '@/types/database.types'

interface CustomFieldInputProps {
  field: CustomFieldDefinition
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
}

export function CustomFieldInput({ field, value, onChange, disabled }: CustomFieldInputProps) {
  const fieldType = field.field_type
  const options = Array.isArray(field.options) ? field.options as string[] : []

  switch (fieldType) {
    case 'text':
      return (
        <Input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.name.toLowerCase()}`}
          disabled={disabled}
        />
      )

    case 'number':
      return (
        <Input
          type="number"
          value={(value as number) ?? ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          placeholder="0"
          disabled={disabled}
        />
      )

    case 'date':
      return (
        <Input
          type="date"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )

    case 'datetime':
      return (
        <Input
          type="datetime-local"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )

    case 'boolean':
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(value as boolean) || false}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-neutral-700">Yes</span>
        </label>
      )

    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-neutral-100"
        >
          <option value="">Select {field.name.toLowerCase()}...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )

    case 'multi_select':
      const selectedValues = Array.isArray(value) ? value as string[] : []
      return (
        <div className="space-y-2">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selectedValues, option])
                  } else {
                    onChange(selectedValues.filter((v) => v !== option))
                  }
                }}
                disabled={disabled}
                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-neutral-700">{option}</span>
            </label>
          ))}
          {options.length === 0 && (
            <p className="text-sm text-neutral-500 italic">No options configured</p>
          )}
        </div>
      )

    case 'url':
      return (
        <Input
          type="url"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com"
          disabled={disabled}
        />
      )

    case 'email':
      return (
        <Input
          type="email"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="email@example.com"
          disabled={disabled}
        />
      )

    case 'phone':
      return (
        <Input
          type="tel"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="+60 12-345 6789"
          disabled={disabled}
        />
      )

    case 'currency':
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            RM
          </span>
          <Input
            type="number"
            step="0.01"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0.00"
            disabled={disabled}
            className="pl-10"
          />
        </div>
      )

    case 'percentage':
      return (
        <div className="relative">
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="0"
            disabled={disabled}
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
            %
          </span>
        </div>
      )

    default:
      return (
        <Input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${field.name.toLowerCase()}`}
          disabled={disabled}
        />
      )
  }
}
