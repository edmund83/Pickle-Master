'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  FileText,
  Building2,
  Check,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createInvoice } from '@/app/actions/invoices'
import type { Customer } from '@/app/actions/customers'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { Input } from '@/components/ui/input'

interface NewInvoiceClientProps {
  customers: Customer[]
}

export function NewInvoiceClient({ customers }: NewInvoiceClientProps) {
  const router = useRouter()
  const feedback = useFeedback()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [customerId, setCustomerId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')

  // Customer search
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const selectedCustomer = customers.find(c => c.id === customerId)
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  )

  async function handleSubmit() {
    if (!customerId) {
      feedback.error('Please select a customer')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createInvoice({
      customer_id: customerId,
      invoice_number: invoiceNumber || null,
      invoice_date: invoiceDate || null,
      due_date: dueDate || null,
      customer_notes: customerNotes || null,
    })

    if (result.success && result.invoice_id) {
      feedback.success('Invoice created')
      router.push(`/tasks/invoices/${result.invoice_id}`)
    } else {
      const errorMsg = result.error || 'Failed to create invoice'
      setError(errorMsg)
      feedback.error(errorMsg)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/invoices">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">New Invoice</h1>
              <p className="text-sm text-neutral-500">Create a new invoice for a customer</p>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !customerId}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="p-6">
        <div className="max-w-2xl space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Customer *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  value={selectedCustomer ? selectedCustomer.name : customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value)
                    setCustomerId('')
                    setShowCustomerDropdown(true)
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Search for a customer..."
                />
                {showCustomerDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowCustomerDropdown(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 max-h-64 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
                      {filteredCustomers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-neutral-500">
                          No customers found
                        </div>
                      ) : (
                        filteredCustomers.map(customer => (
                          <button
                            key={customer.id}
                            onClick={() => {
                              setCustomerId(customer.id)
                              setCustomerSearch('')
                              setShowCustomerDropdown(false)
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900">{customer.name}</p>
                              {customer.email && (
                                <p className="text-sm text-neutral-500">{customer.email}</p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {selectedCustomer && (
                <div className="mt-4 p-3 rounded-lg bg-neutral-50 text-sm">
                  <p className="font-medium text-neutral-900">{selectedCustomer.name}</p>
                  {selectedCustomer.email && <p className="text-neutral-600">{selectedCustomer.email}</p>}
                  {selectedCustomer.phone && <p className="text-neutral-600">{selectedCustomer.phone}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Invoice Number (optional)
                  </label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Custom reference"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Invoice Date
                  </label>
                  <Input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Notes that will appear on the invoice..."
                rows={3}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </CardContent>
          </Card>

          <div className="text-sm text-neutral-500">
            After creating the invoice, you can add line items on the detail page.
          </div>
        </div>
      </div>
    </div>
  )
}
