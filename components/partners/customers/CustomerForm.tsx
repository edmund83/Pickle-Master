'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'

export interface CustomerFormData {
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
  tax_id: string
  tax_id_label: string
  is_tax_exempt: boolean
  default_tax_rate_id: string
}

export const emptyCustomerFormData: CustomerFormData = {
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
  tax_id: '',
  tax_id_label: '',
  is_tax_exempt: false,
  default_tax_rate_id: '',
}

interface PaymentTermOption {
  id: string
  name: string
}

interface TaxRateOption {
  id: string
  name: string
  rate: number
}

interface CustomerFormProps {
  formData: CustomerFormData
  setFormData: React.Dispatch<React.SetStateAction<CustomerFormData>>
  error: string | null
  paymentTerms?: PaymentTermOption[]
  taxRates?: TaxRateOption[]
  autoFocusName?: boolean
  initialTab?: 'basic' | 'billing' | 'shipping' | 'tax'
}

export function CustomerForm({
  formData,
  setFormData,
  error,
  paymentTerms = [],
  taxRates = [],
  autoFocusName = true,
  initialTab = 'basic',
}: CustomerFormProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'billing' | 'shipping' | 'tax'>(initialTab)

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

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs - Scrollable on mobile */}
      <div className="-mx-4 sm:mx-0 overflow-x-auto border-b border-neutral-200">
        <div className="flex min-w-max px-4 sm:px-0">
          <button
            type="button"
            className={`min-w-[90px] px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'basic'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            type="button"
            className={`min-w-[90px] px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'billing'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('billing')}
          >
            Billing
          </button>
          <button
            type="button"
            className={`min-w-[90px] px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('shipping')}
          >
            Shipping
          </button>
          <button
            type="button"
            className={`min-w-[90px] px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              activeTab === 'tax'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            onClick={() => setActiveTab('tax')}
          >
            Tax
          </button>
        </div>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          {/* Name (Required) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ABC Company Sdn Bhd"
              autoFocus={autoFocusName}
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

          {/* Email and Phone - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Payment Terms and Credit Limit - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      )}

      {/* Billing Address Tab */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      )}

      {/* Shipping Address Tab */}
      {activeTab === 'shipping' && (
        <div className="space-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      )}

      {/* Tax Tab */}
      {activeTab === 'tax' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 mb-4">
            <p className="text-sm text-blue-700">
              Configure tax settings for this customer. Tax-exempt customers won&apos;t have tax applied to their orders.
            </p>
          </div>

          {/* Tax ID and Label - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Tax ID / VAT Number
              </label>
              <Input
                value={formData.tax_id}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                placeholder="e.g., GB123456789"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Tax ID Label
              </label>
              <Input
                value={formData.tax_id_label}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_id_label: e.target.value }))}
                placeholder="e.g., VAT Number"
              />
              <p className="mt-1 text-xs text-neutral-500">Label shown on invoices</p>
            </div>
          </div>

          {/* Default Tax Rate */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              Default Tax Rate
            </label>
            <select
              value={formData.default_tax_rate_id}
              onChange={(e) => setFormData(prev => ({ ...prev, default_tax_rate_id: e.target.value }))}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="">Use tenant default</option>
              {taxRates.map((rate) => (
                <option key={rate.id} value={rate.id}>
                  {rate.name} ({rate.rate}%)
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Tax rate to apply by default on orders for this customer
            </p>
          </div>

          {/* Tax Exempt Checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              id="is_tax_exempt"
              checked={formData.is_tax_exempt}
              onChange={(e) => setFormData(prev => ({ ...prev, is_tax_exempt: e.target.checked }))}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <div>
              <label htmlFor="is_tax_exempt" className="text-sm font-medium text-neutral-700">
                Tax Exempt Customer
              </label>
              <p className="text-xs text-neutral-500">
                No tax will be applied to orders for this customer
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
