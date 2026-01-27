'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Users, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomerForm, emptyCustomerFormData, type CustomerFormData } from './CustomerForm'
import type { CustomerListItem } from '@/app/actions/customers'

interface PaymentTermOption {
  id: string
  name: string
}

interface TaxRateOption {
  id: string
  name: string
  rate: number
}

interface CustomerFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CustomerFormData) => Promise<void>
  customer?: CustomerListItem | null
  saving?: boolean
  paymentTerms?: PaymentTermOption[]
  taxRates?: TaxRateOption[]
}

export function CustomerFormDialog({
  isOpen,
  onClose,
  onSave,
  customer,
  saving = false,
  paymentTerms = [],
  taxRates = [],
}: CustomerFormDialogProps) {
  const [formData, setFormData] = useState<CustomerFormData>(emptyCustomerFormData)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!customer

  // Reset form when dialog opens/closes or customer changes
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        // We need to fetch full customer data for edit mode
        // For now, use what we have from the list item
        setFormData({
          name: customer.name || '',
          customer_code: customer.customer_code || '',
          contact_name: customer.contact_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          billing_address_line1: '',
          billing_address_line2: '',
          billing_city: customer.billing_city || '',
          billing_state: '',
          billing_postal_code: '',
          billing_country: customer.billing_country || '',
          shipping_address_line1: '',
          shipping_address_line2: '',
          shipping_city: '',
          shipping_state: '',
          shipping_postal_code: '',
          shipping_country: '',
          shipping_same_as_billing: false,
          payment_term_id: '',
          credit_limit: customer.credit_limit || 0,
          notes: '',
          tax_id: '',
          tax_id_label: '',
          is_tax_exempt: false,
          default_tax_rate_id: '',
        })
      } else {
        setFormData(emptyCustomerFormData)
      }
      setError(null)
    }
  }, [isOpen, customer])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Customer name is required')
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
      setError(err instanceof Error ? err.message : 'Failed to save customer')
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
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                {isEdit ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <p className="text-sm text-neutral-500">
                {isEdit ? 'Update customer information' : 'Create a new customer/client'}
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
          <CustomerForm
            formData={formData}
            setFormData={setFormData}
            error={error}
            paymentTerms={paymentTerms}
            taxRates={taxRates}
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
                {isEdit ? 'Save Changes' : 'Add Customer'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { type CustomerFormData } from './CustomerForm'
