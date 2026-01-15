'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Users, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CustomerListItem } from '@/app/actions/customers'

interface CustomerFormData {
  name: string
  customer_code: string
  contact_name: string
  email: string
  phone: string
  billing_address_line1: string
  billing_address_line2: string
  billing_city: string
  billing_state: string
  billing_postal_code: string
  billing_country: string
  shipping_address_line1: string
  shipping_address_line2: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  shipping_same_as_billing: boolean
  payment_term_id: string
  credit_limit: number
  notes: string
}

const emptyFormData: CustomerFormData = {
  name: '',
  customer_code: '',
  contact_name: '',
  email: '',
  phone: '',
  billing_address_line1: '',
  billing_address_line2: '',
  billing_city: '',
  billing_state: '',
  billing_postal_code: '',
  billing_country: '',
  shipping_address_line1: '',
  shipping_address_line2: '',
  shipping_city: '',
  shipping_state: '',
  shipping_postal_code: '',
  shipping_country: '',
  shipping_same_as_billing: false,
  payment_term_id: '',
  credit_limit: 0,
  notes: '',
}

interface PaymentTermOption {
  id: string
  name: string
}

interface CustomerFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CustomerFormData) => Promise<void>
  customer?: CustomerListItem | null
  saving?: boolean
  paymentTerms?: PaymentTermOption[]
}

export function CustomerFormDialog({
  isOpen,
  onClose,
  onSave,
  customer,
  saving = false,
  paymentTerms = [],
}: CustomerFormDialogProps) {
  const [formData, setFormData] = useState<CustomerFormData>(emptyFormData)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'basic' | 'billing' | 'shipping'>('basic')

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
        })
      } else {
        setFormData(emptyFormData)
      }
      setError(null)
      setActiveTab('basic')
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

  // Copy billing to shipping when checkbox is checked
  function handleShippingSameAsBilling(checked: boolean) {
    setFormData(prev => ({
      ...prev,
      shipping_same_as_billing: checked,
      ...(checked ? {
        shipping_address_line1: prev.billing_address_line1,
        shipping_address_line2: prev.billing_address_line2,
        shipping_city: prev.billing_city,
        shipping_state: prev.billing_state,
        shipping_postal_code: prev.billing_postal_code,
        shipping_country: prev.billing_country,
      } : {})
    }))
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

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 px-6">
          <button
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'basic'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'billing'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('billing')}
          >
            Billing Address
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
              activeTab === 'shipping'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping Address
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <>
              {/* Name (Required) */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ABC Company Sdn Bhd"
                  autoFocus
                />
              </div>

              {/* Customer Code */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Customer Code
                </label>
                <Input
                  value={formData.customer_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_code: e.target.value }))}
                  placeholder="CUST-001"
                />
                <p className="mt-1 text-xs text-neutral-500">Optional unique reference code</p>
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
                    placeholder="contact@abc.com"
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

              {/* Payment Terms and Credit Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Payment Terms
                  </label>
                  <select
                    value={formData.payment_term_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_term_id: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="">Select payment terms...</option>
                    {paymentTerms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Credit Limit
                  </label>
                  <Input
                    type="number"
                    value={formData.credit_limit || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information about this customer..."
                  rows={2}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          )}

          {/* Billing Address Tab */}
          {activeTab === 'billing' && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Address Line 1
                </label>
                <Input
                  value={formData.billing_address_line1}
                  onChange={(e) => setFormData(prev => ({ ...prev, billing_address_line1: e.target.value }))}
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Address Line 2
                </label>
                <Input
                  value={formData.billing_address_line2}
                  onChange={(e) => setFormData(prev => ({ ...prev, billing_address_line2: e.target.value }))}
                  placeholder="Suite 456"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    City
                  </label>
                  <Input
                    value={formData.billing_city}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_city: e.target.value }))}
                    placeholder="Kuala Lumpur"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    State
                  </label>
                  <Input
                    value={formData.billing_state}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_state: e.target.value }))}
                    placeholder="Wilayah Persekutuan"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Postal Code
                  </label>
                  <Input
                    value={formData.billing_postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_postal_code: e.target.value }))}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Country
                  </label>
                  <Input
                    value={formData.billing_country}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_country: e.target.value }))}
                    placeholder="Malaysia"
                  />
                </div>
              </div>
            </>
          )}

          {/* Shipping Address Tab */}
          {activeTab === 'shipping' && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="shipping_same_as_billing"
                  checked={formData.shipping_same_as_billing}
                  onChange={(e) => handleShippingSameAsBilling(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <label htmlFor="shipping_same_as_billing" className="text-sm text-neutral-700">
                  Same as billing address
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Address Line 1
                </label>
                <Input
                  value={formData.shipping_address_line1}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping_address_line1: e.target.value }))}
                  placeholder="123 Main Street"
                  disabled={formData.shipping_same_as_billing}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Address Line 2
                </label>
                <Input
                  value={formData.shipping_address_line2}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping_address_line2: e.target.value }))}
                  placeholder="Suite 456"
                  disabled={formData.shipping_same_as_billing}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    City
                  </label>
                  <Input
                    value={formData.shipping_city}
                    onChange={(e) => setFormData(prev => ({ ...prev, shipping_city: e.target.value }))}
                    placeholder="Kuala Lumpur"
                    disabled={formData.shipping_same_as_billing}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    State
                  </label>
                  <Input
                    value={formData.shipping_state}
                    onChange={(e) => setFormData(prev => ({ ...prev, shipping_state: e.target.value }))}
                    placeholder="Wilayah Persekutuan"
                    disabled={formData.shipping_same_as_billing}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Postal Code
                  </label>
                  <Input
                    value={formData.shipping_postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, shipping_postal_code: e.target.value }))}
                    placeholder="50000"
                    disabled={formData.shipping_same_as_billing}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Country
                  </label>
                  <Input
                    value={formData.shipping_country}
                    onChange={(e) => setFormData(prev => ({ ...prev, shipping_country: e.target.value }))}
                    placeholder="Malaysia"
                    disabled={formData.shipping_same_as_billing}
                  />
                </div>
              </div>
            </>
          )}
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

export type { CustomerFormData }
