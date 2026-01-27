'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Building2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VendorForm, emptyVendorFormData, type VendorFormData } from './VendorForm'
import type { Vendor } from '@/types/database.types'

interface PaymentTermOption {
  id: string
  name: string
}

interface VendorFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: VendorFormData) => Promise<void>
  vendor?: Vendor | null
  saving?: boolean
  paymentTerms?: PaymentTermOption[]
}

export function VendorFormDialog({
  isOpen,
  onClose,
  onSave,
  vendor,
  saving = false,
  paymentTerms = [],
}: VendorFormDialogProps) {
  const [formData, setFormData] = useState<VendorFormData>(emptyVendorFormData)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!vendor

  // Reset form when dialog opens/closes or vendor changes
  useEffect(() => {
    if (isOpen) {
      if (vendor) {
        setFormData({
          name: vendor.name,
          contact_name: vendor.contact_name || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          address_line1: vendor.address_line1 || '',
          city: vendor.city || '',
          country: vendor.country || '',
          payment_term_id: vendor.payment_term_id || '',
          notes: vendor.notes || '',
          tax_id: vendor.tax_id || '',
          tax_id_label: vendor.tax_id_label || '',
        })
      } else {
        setFormData(emptyVendorFormData)
      }
      setError(null)
    }
  }, [isOpen, vendor])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Vendor name is required')
      return
    }

    // Basic email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setError(null)

    try {
      await onSave(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vendor')
    }
  }

  function handleClose() {
    if (!saving) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                {isEdit ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
              <p className="text-sm text-neutral-500">
                {isEdit ? 'Update vendor information' : 'Create a new supplier/vendor'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 disabled:opacity-50"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <VendorForm
            formData={formData}
            setFormData={setFormData}
            error={error}
            paymentTerms={paymentTerms}
            autoFocusName={true}
          />
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving || !formData.name.trim()}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isEdit ? 'Save Changes' : 'Add Vendor'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { type VendorFormData } from './VendorForm'
