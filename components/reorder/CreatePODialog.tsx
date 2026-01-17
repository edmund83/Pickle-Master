'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'

interface POItem {
    item_id: string
    item_name: string
    quantity: number
    unit_cost: number | null
}

interface CreatePODialogProps {
    isOpen: boolean
    onClose: () => void
    vendorName: string
    items: POItem[]
    onConfirm: () => Promise<{ success: boolean; display_id?: string; error?: string }>
}

export function CreatePODialog({
    isOpen,
    onClose,
    vendorName,
    items,
    onConfirm,
}: CreatePODialogProps) {
    const { formatCurrency, currencySymbol } = useFormatting()
    const [status, setStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle')
    const [result, setResult] = useState<{ display_id?: string; error?: string }>({})

    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setStatus('idle')
            setResult({})
        }
    }, [isOpen])

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && status !== 'creating') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, status, onClose])

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

    const total = items.reduce((sum, item) => {
        return sum + (item.unit_cost || 0) * item.quantity
    }, 0)

    const handleConfirm = async () => {
        setStatus('creating')
        try {
            const response = await onConfirm()
            if (response.success) {
                setStatus('success')
                setResult({ display_id: response.display_id })
            } else {
                setStatus('error')
                setResult({ error: response.error || 'Failed to create purchase order' })
            }
        } catch (err) {
            setStatus('error')
            setResult({ error: err instanceof Error ? err.message : 'An error occurred' })
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={status !== 'creating' ? onClose : undefined}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                        <h2 className="text-lg font-semibold text-neutral-900">
                            Create Purchase Order
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={status === 'creating'}
                            className="p-1 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
                        >
                            <X className="h-5 w-5 text-neutral-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {status === 'success' ? (
                            <div className="text-center py-6">
                                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                    Purchase Order Created
                                </h3>
                                <p className="text-sm text-neutral-500 mb-4">
                                    {result.display_id} has been created as a draft.
                                </p>
                                <Button onClick={onClose}>Done</Button>
                            </div>
                        ) : status === 'error' ? (
                            <div className="text-center py-6">
                                <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                    Failed to Create PO
                                </h3>
                                <p className="text-sm text-red-600 mb-4">{result.error}</p>
                                <div className="flex gap-2 justify-center">
                                    <Button variant="outline" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleConfirm}>Try Again</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Vendor */}
                                <div className="mb-4">
                                    <span className="text-sm text-neutral-500">Vendor</span>
                                    <p className="font-medium text-neutral-900">{vendorName}</p>
                                </div>

                                {/* Items Summary */}
                                <div className="mb-4">
                                    <span className="text-sm text-neutral-500">
                                        Items ({items.length})
                                    </span>
                                    <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
                                        {items.map((item) => (
                                            <div
                                                key={item.item_id}
                                                className="flex items-center justify-between text-sm py-2 px-3 bg-neutral-50 rounded-lg"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-medium text-neutral-900 truncate block">
                                                        {item.item_name}
                                                    </span>
                                                    <span className="text-neutral-500">
                                                        Qty: {item.quantity}
                                                        {item.unit_cost !== null &&
                                                            ` @ ${formatCurrency(item.unit_cost)}`}
                                                    </span>
                                                </div>
                                                {item.unit_cost !== null && (
                                                    <span className="font-medium text-neutral-900 ml-2">
                                                        {formatCurrency(item.quantity * item.unit_cost)}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between py-3 border-t border-neutral-200">
                                    <span className="font-medium text-neutral-900">
                                        Estimated Total
                                    </span>
                                    <span className="text-lg font-semibold text-neutral-900">
                                        {formatCurrency(total)}
                                    </span>
                                </div>

                                {/* Note */}
                                <p className="text-xs text-neutral-500 mt-2">
                                    This will create a draft purchase order. You can review and
                                    edit it before submitting.
                                </p>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {status !== 'success' && status !== 'error' && (
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-neutral-200 bg-neutral-50">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={status === 'creating'}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={status === 'creating'}
                            >
                                {status === 'creating' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Create Draft PO
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
