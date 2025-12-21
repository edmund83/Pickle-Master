'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, HelpCircle } from 'lucide-react'
import type { DetailField } from '@/lib/labels/pdf-generator'

interface DetailsSelectorProps {
  selected: DetailField[]
  onChange: (selected: DetailField[]) => void
  disabled?: boolean
  maxSelections?: number
}

const DETAIL_OPTIONS: { value: DetailField; label: string; description: string }[] = [
  { value: 'notes', label: 'Notes', description: 'Item notes/description' },
  { value: 'price', label: 'Price', description: 'Unit price' },
  { value: 'min_level', label: 'Min Level', description: 'Minimum stock level' },
  { value: 'tags', label: 'Tags', description: 'Item tags' },
  { value: 'total_value', label: 'Total Value', description: 'Price × Quantity' },
  { value: 'sku', label: 'SKU', description: 'Stock keeping unit' },
]

export default function DetailsSelector({ selected, onChange, disabled, maxSelections }: DetailsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (value: DetailField) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      // Check if we've reached the maximum selections
      if (maxSelections && selected.length >= maxSelections) {
        // Replace the last selected item
        onChange([...selected.slice(0, -1), value])
      } else {
        onChange([...selected, value])
      }
    }
  }

  const isAtMaxSelections = maxSelections !== undefined && selected.length >= maxSelections

  const getDisplayText = () => {
    if (selected.length === 0) return 'Select details...'
    if (selected.length === 1) {
      const option = DETAIL_OPTIONS.find((o) => o.value === selected[0])
      return option?.label || selected[0]
    }
    return `${selected.length} details selected`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between rounded-lg border bg-white px-3 py-2.5 text-sm font-medium text-left transition-colors ${
          disabled
            ? 'border-neutral-200 text-neutral-400 cursor-not-allowed'
            : 'border-neutral-300 text-neutral-700 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-pickle-500'
        }`}
      >
        <span className={selected.length === 0 ? 'text-neutral-400' : ''}>{getDisplayText()}</span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pickle-100 text-xs font-semibold text-pickle-700">
              {selected.length}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          <div className="px-3 py-2 border-b border-neutral-100">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <HelpCircle className="h-3 w-3" />
              <span>
                {maxSelections === 1
                  ? 'Select 1 field to display'
                  : maxSelections
                    ? `Select up to ${maxSelections} fields to display`
                    : 'Select fields to display on label'}
              </span>
            </div>
          </div>

          {DETAIL_OPTIONS.map((option) => {
            const isSelected = selected.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-neutral-50 transition-colors ${
                  isSelected ? 'bg-pickle-50' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isSelected ? 'text-pickle-700' : 'text-neutral-700'}`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-neutral-400">{option.description}</span>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    isSelected
                      ? 'border-pickle-500 bg-pickle-500 text-white'
                      : 'border-neutral-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </button>
            )
          })}

          {selected.length > 0 && (
            <div className="border-t border-neutral-100 px-3 py-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-neutral-500 hover:text-neutral-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
