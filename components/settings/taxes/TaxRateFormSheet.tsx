'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { TAX_TYPES, type CreateTaxRateInput, type TaxRate } from '@/app/actions/tax-rates'

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
    const [formData, setFormData] = useState<CreateTaxRateInput>(DEFAULT_FORM_DATA)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Reset form when sheet opens/closes or initial data changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    code: initialData.code || '',
                    description: initialData.description || '',
                    tax_type: initialData.tax_type,
                    rate: initialData.rate,
                    country_code: initialData.country_code || '',
                    region_code: initialData.region_code || '',
                    is_default: initialData.is_default,
                    applies_to_shipping: initialData.applies_to_shipping,
                    is_compound: initialData.is_compound,
                    is_active: initialData.is_active,
                })
            } else {
                setFormData(DEFAULT_FORM_DATA)
            }
            setError(null)
            // Focus input after animation
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
        if (!formData.name.trim()) {
            setError('Tax rate name is required')
            return
        }
        if (formData.rate < 0 || formData.rate > 100) {
            setError('Rate must be between 0 and 100')
            return
        }

        setSaving(true)
        setError(null)

        try {
            await onSubmit(formData)
            onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save tax rate')
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
                className={cn(
                    'relative w-full bg-white overflow-hidden',
                    'animate-in duration-300',
                    // Mobile: bottom sheet style
                    'rounded-t-3xl sm:rounded-2xl',
                    'max-h-[90vh] sm:max-h-[85vh]',
                    'sm:max-w-lg sm:mx-4',
                    // Animation
                    'slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95'
                )}
            >
                {/* Drag handle for mobile */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="h-1 w-10 rounded-full bg-neutral-300" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <h2 id="tax-rate-form-title" className="text-lg font-semibold text-neutral-900">
                        {mode === 'create' ? 'Create Tax Rate' : 'Edit Tax Rate'}
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

                {/* Form Content */}
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
                        {/* Error Message */}
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="tax-rate-name"
                                className="mb-2 block text-sm font-medium text-neutral-700"
                            >
                                Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                ref={inputRef}
                                id="tax-rate-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="e.g., California Sales Tax, UK VAT"
                                className="h-11"
                                disabled={saving}
                            />
                        </div>

                        {/* Tax Type & Rate - side by side */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Tax Type */}
                            <div>
                                <label
                                    htmlFor="tax-rate-type"
                                    className="mb-2 block text-sm font-medium text-neutral-700"
                                >
                                    Type
                                </label>
                                <select
                                    id="tax-rate-type"
                                    value={formData.tax_type}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            tax_type: e.target.value as CreateTaxRateInput['tax_type'],
                                        }))
                                    }
                                    className="h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    disabled={saving}
                                >
                                    {TAX_TYPES.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Rate */}
                            <div>
                                <label
                                    htmlFor="tax-rate-rate"
                                    className="mb-2 block text-sm font-medium text-neutral-700"
                                >
                                    Rate (%) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="tax-rate-rate"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.01}
                                    value={formData.rate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            rate: parseFloat(e.target.value) || 0,
                                        }))
                                    }
                                    placeholder="e.g., 8.25"
                                    className="h-11"
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Code */}
                        <div>
                            <label
                                htmlFor="tax-rate-code"
                                className="mb-2 block text-sm font-medium text-neutral-700"
                            >
                                Code
                            </label>
                            <Input
                                id="tax-rate-code"
                                value={formData.code || ''}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                                }
                                placeholder="e.g., VAT-20, GST-10 (optional)"
                                className="h-11"
                                disabled={saving}
                            />
                        </div>

                        {/* Country & Region - side by side */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Country Code */}
                            <div>
                                <label
                                    htmlFor="tax-rate-country"
                                    className="mb-2 block text-sm font-medium text-neutral-700"
                                >
                                    Country Code
                                </label>
                                <Input
                                    id="tax-rate-country"
                                    value={formData.country_code || ''}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            country_code: e.target.value.toUpperCase().slice(0, 2),
                                        }))
                                    }
                                    placeholder="US, GB, AU"
                                    maxLength={2}
                                    className="h-11 uppercase"
                                    disabled={saving}
                                />
                            </div>

                            {/* Region Code */}
                            <div>
                                <label
                                    htmlFor="tax-rate-region"
                                    className="mb-2 block text-sm font-medium text-neutral-700"
                                >
                                    Region Code
                                </label>
                                <Input
                                    id="tax-rate-region"
                                    value={formData.region_code || ''}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            region_code: e.target.value.toUpperCase().slice(0, 10),
                                        }))
                                    }
                                    placeholder="CA, TX, ON"
                                    maxLength={10}
                                    className="h-11 uppercase"
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="tax-rate-description"
                                className="mb-2 block text-sm font-medium text-neutral-700"
                            >
                                Description
                            </label>
                            <Input
                                id="tax-rate-description"
                                value={formData.description || ''}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                                }
                                placeholder="e.g., State sales tax for California"
                                className="h-11"
                                disabled={saving}
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-3 pt-2">
                            {/* Is Default */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_default || false}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, is_default: e.target.checked }))
                                    }
                                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                    disabled={saving}
                                />
                                <div>
                                    <span className="text-sm font-medium text-neutral-700">Default tax rate</span>
                                    <p className="text-xs text-neutral-500">
                                        Automatically apply to new orders and invoices
                                    </p>
                                </div>
                            </label>

                            {/* Applies to Shipping */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.applies_to_shipping || false}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            applies_to_shipping: e.target.checked,
                                        }))
                                    }
                                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                    disabled={saving}
                                />
                                <div>
                                    <span className="text-sm font-medium text-neutral-700">Apply to shipping</span>
                                    <p className="text-xs text-neutral-500">
                                        Include shipping costs in taxable amount
                                    </p>
                                </div>
                            </label>

                            {/* Is Compound */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_compound || false}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, is_compound: e.target.checked }))
                                    }
                                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                    disabled={saving}
                                />
                                <div>
                                    <span className="text-sm font-medium text-neutral-700">Compound tax</span>
                                    <p className="text-xs text-neutral-500">
                                        Calculate on subtotal + other taxes (e.g., Quebec QST)
                                    </p>
                                </div>
                            </label>

                            {/* Is Active */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active !== false}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                                    }
                                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                    disabled={saving}
                                />
                                <div>
                                    <span className="text-sm font-medium text-neutral-700">Active</span>
                                    <p className="text-xs text-neutral-500">
                                        Show in tax rate selection dropdowns
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving || !formData.name.trim()}
                            className="flex-1 h-11"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    {mode === 'create' ? 'Create' : 'Save Changes'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TaxRateFormSheet
