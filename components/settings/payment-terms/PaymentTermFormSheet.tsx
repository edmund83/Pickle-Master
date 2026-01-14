'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface PaymentTermFormData {
  name: string
  description: string
  days: number | null
}

interface PaymentTermFormSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PaymentTermFormData) => Promise<void>
  initialData?: PaymentTermFormData
  mode: 'create' | 'edit'
}

const DEFAULT_FORM_DATA: PaymentTermFormData = {
  name: '',
  description: '',
  days: null,
}

export function PaymentTermFormSheet({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: PaymentTermFormSheetProps) {
  const [formData, setFormData] = useState<PaymentTermFormData>(
    initialData || DEFAULT_FORM_DATA
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset form when sheet opens/closes or initial data changes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || DEFAULT_FORM_DATA)
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
      setError('Payment term name is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onSubmit(formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment term')
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
        aria-labelledby="payment-term-form-title"
        className={cn(
          'relative w-full bg-white overflow-hidden',
          'animate-in duration-300',
          // Mobile: bottom sheet style
          'rounded-t-3xl sm:rounded-2xl',
          'max-h-[90vh] sm:max-h-[85vh]',
          'sm:max-w-md sm:mx-4',
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
          <h2 id="payment-term-form-title" className="text-lg font-semibold text-neutral-900">
            {mode === 'create' ? 'Create Payment Term' : 'Edit Payment Term'}
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
                htmlFor="payment-term-name"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                ref={inputRef}
                id="payment-term-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Net 30, COD, Prepaid"
                className="h-11"
                disabled={saving}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="payment-term-description"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Description
              </label>
              <Input
                id="payment-term-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="e.g., Payment due within 30 days"
                className="h-11"
                disabled={saving}
              />
            </div>

            {/* Days */}
            <div>
              <label
                htmlFor="payment-term-days"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Days Until Due
              </label>
              <Input
                id="payment-term-days"
                type="number"
                min={0}
                value={formData.days ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    days: e.target.value === '' ? null : parseInt(e.target.value, 10),
                  }))
                }
                placeholder="Leave empty for COD, Prepaid, etc."
                className="h-11"
                disabled={saving}
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                Number of days from invoice date until payment is due. Leave empty for terms like COD or Prepaid.
              </p>
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

export default PaymentTermFormSheet
