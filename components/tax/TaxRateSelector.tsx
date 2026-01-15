'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Check, ChevronDown, Percent, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTaxRates, type TaxRate } from '@/app/actions/tax-rates'

interface TaxRateSelectorProps {
    value?: string | string[] | null
    onChange: (value: string | string[] | null) => void
    multiple?: boolean
    placeholder?: string
    disabled?: boolean
    showRate?: boolean
    className?: string
}

function formatRate(rate: number): string {
    return rate.toFixed(2).replace(/\.?0+$/, '') + '%'
}

export function TaxRateSelector({
    value,
    onChange,
    multiple = false,
    placeholder = 'Select tax rate...',
    disabled = false,
    showRate = true,
    className,
}: TaxRateSelectorProps) {
    const [open, setOpen] = useState(false)
    const [taxRates, setTaxRates] = useState<TaxRate[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    // Convert value to array for consistent handling
    const selectedIds = Array.isArray(value) ? value : value ? [value] : []

    const loadTaxRates = useCallback(async () => {
        setLoading(true)
        try {
            const rates = await getTaxRates()
            setTaxRates(rates)
        } catch (error) {
            console.error('Failed to load tax rates:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTaxRates()
    }, [loadTaxRates])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close on escape
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [open])

    const selectedRates = taxRates.filter((rate) => selectedIds.includes(rate.id))

    const filteredRates = taxRates.filter((rate) => {
        const searchLower = search.toLowerCase()
        return (
            rate.name.toLowerCase().includes(searchLower) ||
            rate.tax_type.toLowerCase().includes(searchLower) ||
            (rate.code && rate.code.toLowerCase().includes(searchLower))
        )
    })

    function handleSelect(rateId: string) {
        if (multiple) {
            const newValue = selectedIds.includes(rateId)
                ? selectedIds.filter((id) => id !== rateId)
                : [...selectedIds, rateId]
            onChange(newValue.length > 0 ? newValue : null)
        } else {
            onChange(rateId === selectedIds[0] ? null : rateId)
            setOpen(false)
        }
    }

    function handleRemove(rateId: string, e: React.MouseEvent) {
        e.stopPropagation()
        if (multiple) {
            const newValue = selectedIds.filter((id) => id !== rateId)
            onChange(newValue.length > 0 ? newValue : null)
        } else {
            onChange(null)
        }
    }

    function handleClear(e: React.MouseEvent) {
        e.stopPropagation()
        onChange(null)
    }

    // Display text for button
    const displayText =
        selectedRates.length === 0
            ? placeholder
            : multiple
              ? `${selectedRates.length} tax rate${selectedRates.length === 1 ? '' : 's'} selected`
              : showRate
                ? `${selectedRates[0].name} (${formatRate(selectedRates[0].rate)})`
                : selectedRates[0].name

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && !loading && setOpen(!open)}
                disabled={disabled || loading}
                className={cn(
                    'flex w-full items-center justify-between h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    !selectedRates.length && 'text-neutral-500'
                )}
            >
                <span className="flex items-center gap-2 truncate">
                    <Percent className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                    <span className="truncate">{loading ? 'Loading...' : displayText}</span>
                </span>
                <div className="flex items-center gap-1">
                    {selectedIds.length > 0 && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-0.5 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
                            aria-label="Clear selection"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 text-neutral-400 transition-transform',
                            open && 'rotate-180'
                        )}
                    />
                </div>
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
                    {/* Search Input */}
                    <div className="p-2 border-b border-neutral-100">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search tax rates..."
                                className="w-full h-9 rounded-md border border-neutral-200 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredRates.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-neutral-500">
                                No tax rates found.
                            </div>
                        ) : (
                            filteredRates.map((rate) => {
                                const isSelected = selectedIds.includes(rate.id)
                                return (
                                    <button
                                        key={rate.id}
                                        type="button"
                                        onClick={() => handleSelect(rate.id)}
                                        className={cn(
                                            'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm',
                                            'hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none',
                                            isSelected && 'bg-primary/5'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'flex h-4 w-4 items-center justify-center rounded border flex-shrink-0',
                                                isSelected
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-neutral-300'
                                            )}
                                        >
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-neutral-900 truncate">
                                                    {rate.name}
                                                </span>
                                                {rate.is_default && (
                                                    <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                <span className="font-mono">
                                                    {formatRate(rate.rate)}
                                                </span>
                                                <span>•</span>
                                                <span className="capitalize">
                                                    {rate.tax_type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Selected items chips (for multiple selection) */}
            {multiple && selectedRates.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedRates.map((rate) => (
                        <span
                            key={rate.id}
                            className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-sm"
                        >
                            <span className="font-medium text-neutral-700">{rate.name}</span>
                            <span className="text-neutral-500 font-mono text-xs">
                                {formatRate(rate.rate)}
                            </span>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => handleRemove(rate.id, e)}
                                    className="ml-0.5 p-0.5 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
                                    aria-label={`Remove ${rate.name}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * Simple single-select tax rate dropdown
 */
export function TaxRateDropdown({
    value,
    onChange,
    disabled = false,
    className,
}: {
    value?: string | null
    onChange: (value: string | null) => void
    disabled?: boolean
    className?: string
}) {
    const [taxRates, setTaxRates] = useState<TaxRate[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadRates() {
            try {
                const rates = await getTaxRates()
                setTaxRates(rates)
            } catch (error) {
                console.error('Failed to load tax rates:', error)
            } finally {
                setLoading(false)
            }
        }
        loadRates()
    }, [])

    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value || null)}
            disabled={disabled || loading}
            className={cn(
                'h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className
            )}
        >
            <option value="">No tax</option>
            {taxRates.map((rate) => (
                <option key={rate.id} value={rate.id}>
                    {rate.name} ({formatRate(rate.rate)})
                    {rate.is_default ? ' ★' : ''}
                </option>
            ))}
        </select>
    )
}

export default TaxRateSelector
