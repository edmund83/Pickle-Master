'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Truck,
  Building2,
  MapPin,
  Check,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createDeliveryOrder } from '@/app/actions/delivery-orders'
import type { Customer } from '@/app/actions/customers'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { Input } from '@/components/ui/input'

interface NewDeliveryOrderClientProps {
  customers: Customer[]
}

export function NewDeliveryOrderClient({ customers }: NewDeliveryOrderClientProps) {
  const router = useRouter()
  const feedback = useFeedback()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [customerId, setCustomerId] = useState('')
  const [carrier, setCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [notes, setNotes] = useState('')

  // Shipping address
  const [shipToName, setShipToName] = useState('')
  const [shipToAddress1, setShipToAddress1] = useState('')
  const [shipToAddress2, setShipToAddress2] = useState('')
  const [shipToCity, setShipToCity] = useState('')
  const [shipToState, setShipToState] = useState('')
  const [shipToPostalCode, setShipToPostalCode] = useState('')
  const [shipToCountry, setShipToCountry] = useState('')
  const [shipToPhone, setShipToPhone] = useState('')

  // Customer search
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const selectedCustomer = customers.find(c => c.id === customerId)
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  )

  function useCustomerAddress() {
    if (!selectedCustomer) return

    setShipToName(selectedCustomer.name || '')
    setShipToAddress1(selectedCustomer.shipping_address1 || '')
    setShipToAddress2(selectedCustomer.shipping_address2 || '')
    setShipToCity(selectedCustomer.shipping_city || '')
    setShipToState(selectedCustomer.shipping_state || '')
    setShipToPostalCode(selectedCustomer.shipping_postal_code || '')
    setShipToCountry(selectedCustomer.shipping_country || '')
    setShipToPhone(selectedCustomer.phone || '')
  }

  async function handleSubmit() {
    if (!customerId) {
      feedback.error('Please select a customer')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const result = await createDeliveryOrder({
      customer_id: customerId,
      carrier: carrier || null,
      tracking_number: trackingNumber || null,
      scheduled_date: scheduledDate || null,
      ship_to_name: shipToName || null,
      ship_to_address1: shipToAddress1 || null,
      ship_to_address2: shipToAddress2 || null,
      ship_to_city: shipToCity || null,
      ship_to_state: shipToState || null,
      ship_to_postal_code: shipToPostalCode || null,
      ship_to_country: shipToCountry || null,
      ship_to_phone: shipToPhone || null,
      notes: notes || null,
    })

    if (result.success && result.delivery_order_id) {
      feedback.success('Delivery order created')
      router.push(`/tasks/delivery-orders/${result.delivery_order_id}`)
    } else {
      const errorMsg = result.error || 'Failed to create delivery order'
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
            <Link href="/tasks/delivery-orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">New Delivery Order</h1>
              <p className="text-sm text-neutral-500">Create a delivery for a customer</p>
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
            Create Delivery Order
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

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </CardTitle>
                {selectedCustomer && (
                  <Button variant="outline" size="sm" onClick={useCustomerAddress}>
                    Use customer address
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Recipient Name
                  </label>
                  <Input
                    value={shipToName}
                    onChange={(e) => setShipToName(e.target.value)}
                    placeholder="Name of person receiving delivery"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Address Line 1
                  </label>
                  <Input
                    value={shipToAddress1}
                    onChange={(e) => setShipToAddress1(e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Address Line 2
                  </label>
                  <Input
                    value={shipToAddress2}
                    onChange={(e) => setShipToAddress2(e.target.value)}
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      City
                    </label>
                    <Input
                      value={shipToCity}
                      onChange={(e) => setShipToCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      State/Province
                    </label>
                    <Input
                      value={shipToState}
                      onChange={(e) => setShipToState(e.target.value)}
                      placeholder="State"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Postal Code
                    </label>
                    <Input
                      value={shipToPostalCode}
                      onChange={(e) => setShipToPostalCode(e.target.value)}
                      placeholder="Postal code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Country
                    </label>
                    <Input
                      value={shipToCountry}
                      onChange={(e) => setShipToCountry(e.target.value)}
                      placeholder="Country"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Phone
                  </label>
                  <Input
                    value={shipToPhone}
                    onChange={(e) => setShipToPhone(e.target.value)}
                    placeholder="Contact phone number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipping Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Carrier
                  </label>
                  <Input
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g., FedEx, UPS, DHL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Tracking Number
                  </label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Tracking number (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Scheduled Date
                  </label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes about this delivery..."
                rows={3}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </CardContent>
          </Card>

          <div className="text-sm text-neutral-500">
            After creating the delivery order, you can add items on the detail page.
          </div>
        </div>
      </div>
    </div>
  )
}
