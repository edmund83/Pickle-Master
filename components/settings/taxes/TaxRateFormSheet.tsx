'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type CreateTaxRateInput, type TaxRate } from '@/app/actions/tax-rates'

interface TaxRateFormSheetProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CreateTaxRateInput) => Promise<void>
    initialData?: TaxRate
    mode: 'create' | 'edit'
}

const DEFAULT_FORM_DATA: CreateTaxRateInput = {
    name: '',
    code: '',
    description: '',
    tax_type: 'sales_tax',
    rate: 0,
    country_code: '',
    region_code: '',
    is_default: false,
    applies_to_shipping: false,
    is_compound: false,
    is_active: true,
}

export function TaxRateFormSheet({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode,
}: TaxRateFormSheetProps) {
    const [name, setName] = useState('')
    const [rate, setRate] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Reset form when sheet opens/closes or initial data changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name)
                setRate(String(initialData.rate))
            } else {
                setName('')
                setRate('')
            }
            setError(null)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, initialData])

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim()) {
            setError('Name is required')
            return
        }

        const rateNum = parseFloat(rate)
        if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
            setError('Rate must be 0-100')
            return
        }

        setSaving(true)
        setError(null)

        try {
            await onSubmit({
                ...DEFAULT_FORM_DATA,
                name: name.trim(),
                rate: rateNum,
            })
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sheet / Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="tax-rate-form-title"
                className="relative w-full bg-white overflow-hidden animate-in duration-300 rounded-t-3xl sm:rounded-2xl max-h-[90vh] sm:max-h-[85vh] sm:max-w-sm sm:mx-4 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95"
            >
                {/* Drag handle for mobile */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="h-1 w-10 rounded-full bg-neutral-300" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <h2 id="tax-rate-form-title" className="text-lg font-semibold text-neutral-900">
                        {mode === 'create' ? 'Add Tax Rate' : 'Edit Tax Rate'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label htmlFor="tax-name" className="mb-1.5 block text-sm font-medium text-neutral-700">
                            Name
                        </label>
                        <Input
                            ref={inputRef}
                            id="tax-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., GST, VAT, Sales Tax"
                            disabled={saving}
                        />
                    </div>

                    {/* Rate */}
                    <div>
                        <label htmlFor="tax-rate" className="mb-1.5 block text-sm font-medium text-neutral-700">
                            Rate (%)
                        </label>
                        <Input
                            id="tax-rate"
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            placeholder="e.g., 8"
                            disabled={saving}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving || !name.trim() || !rate} className="flex-1">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'create' ? 'Add' : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TaxRateFormSheet
