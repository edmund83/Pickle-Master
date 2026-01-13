'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Building2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Vendor } from '@/types/database.types'

interface VendorFormData {
  name: string
  contact_name: string
  email: string
  phone: string
  address_line1: string
  city: string
  country: string
  payment_terms: string
  notes: string
}

const emptyFormData: VendorFormData = {
  name: '',
  contact_name: '',
  email: '',
  phone: '',
  address_line1: '',
  city: '',
  country: '',
  payment_terms: '',
  notes: '',
}

interface VendorFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: VendorFormData) => Promise<void>
  vendor?: Vendor | null
  saving?: boolean
}

export function VendorFormDialog({
  isOpen,
  onClose,
  onSave,
  vendor,
  saving = false,
}: VendorFormDialogProps) {
  const [formData, setFormData] = useState<VendorFormData>(emptyFormData)
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
          payment_terms: vendor.payment_terms || '',
          notes: vendor.notes || '',
        })
      } else {
        setFormData(emptyFormData)
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Name (Required) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Acme Supplies Inc."
              autoFocus
            />
          </div>

          {/* Contact Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Contact Person
            </label>
            <Input
              value={formData.contact_name}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
              placeholder="John Doe"
            />
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@acme.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+60 12-345 6789"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Address
            </label>
            <Input
              value={formData.address_line1}
              onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
              placeholder="123 Main Street"
            />
          </div>

          {/* City and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                City
              </label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Kuala Lumpur"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Country
              </label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Malaysia"
              />
            </div>
          </div>

          {/* Payment Terms */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Payment Terms
            </label>
            <select
              value={formData.payment_terms}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="">Select payment terms...</option>
              <option value="COD">COD (Cash on Delivery)</option>
              <option value="Net 7">Net 7</option>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Net 60">Net 60</option>
              <option value="Net 90">Net 90</option>
              <option value="2/10 Net 30">2/10 Net 30 (2% discount if paid in 10 days)</option>
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Prepaid">Prepaid</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about this vendor..."
              rows={2}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
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

export type { VendorFormData }
