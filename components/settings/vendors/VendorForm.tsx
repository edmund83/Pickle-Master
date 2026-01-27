'use client'

import { Input } from '@/components/ui/input'

export interface VendorFormData {
  name: string
  contact_name: string
  email: string
  phone: string
  address_line1: string
  city: string
  country: string
  payment_term_id: string
  notes: string
  tax_id: string
  tax_id_label: string
}

export const emptyVendorFormData: VendorFormData = {
  name: '',
  contact_name: '',
  email: '',
  phone: '',
  address_line1: '',
  city: '',
  country: '',
  payment_term_id: '',
  notes: '',
  tax_id: '',
  tax_id_label: '',
}

interface PaymentTermOption {
  id: string
  name: string
}

interface VendorFormProps {
  formData: VendorFormData
  setFormData: React.Dispatch<React.SetStateAction<VendorFormData>>
  error: string | null
  paymentTerms?: PaymentTermOption[]
  autoFocusName?: boolean
}

export function VendorForm({
  formData,
  setFormData,
  error,
  paymentTerms = [],
  autoFocusName = true,
}: VendorFormProps) {
  return (
    <div className="space-y-4">
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
          autoFocus={autoFocusName}
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

      {/* City and Country - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Tax Information - Responsive */}
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
          placeholder="Any additional information about this vendor..."
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  )
}
