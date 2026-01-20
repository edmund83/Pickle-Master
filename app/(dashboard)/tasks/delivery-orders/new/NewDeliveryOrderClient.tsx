'use client'

import { useState, useCallback, useEffect } from 'react'
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
  XCircle,
  Package,
  Plus,
  Minus,
  Trash2,
  Camera,
  Zap,
  FileText,
  CheckCircle,
  Scale
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createDeliveryOrder, addDeliveryOrderItem, searchInventoryItemsForDO } from '@/app/actions/delivery-orders'
import type { Customer } from '@/app/actions/customers'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { Input } from '@/components/ui/input'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'
import { CollapsibleSection } from '@/components/ui/collapsible-section'

interface NewDeliveryOrderClientProps {
  customers: Customer[]
}

interface DeliveryItem {
  id: string // temp ID for new items
  item_id: string | null
  item_name: string
  sku: string | null
  quantity_shipped: number
  image_urls: string[] | null
  available_quantity: number
}

interface SearchResultItem {
  id: string
  name: string
  sku: string | null
  quantity: number
  image_urls: string[] | null
  unit: string | null
  price: number | null
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

  // New shipping fields
  const [shippingMethod, setShippingMethod] = useState('')
  const [totalPackages, setTotalPackages] = useState(1)
  const [totalWeight, setTotalWeight] = useState<string>('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb' | 'oz' | 'g'>('kg')

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

  // Items state
  const [items, setItems] = useState<DeliveryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const selectedCustomer = customers.find(c => c.id === customerId)
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  ).slice(0, 10)

  // Item search handler with debounce
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await searchInventoryItemsForDO(query)
      // Filter out items already added
      const existingIds = new Set(items.filter(i => i.item_id).map(i => i.item_id))
      setSearchResults(results.filter((item: SearchResultItem) => !existingIds.has(item.id)))
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }, [items])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  function handleAddItem(item: SearchResultItem) {
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, {
      id: tempId,
      item_id: item.id,
      item_name: item.name,
      sku: item.sku,
      quantity_shipped: 1,
      image_urls: item.image_urls,
      available_quantity: item.quantity
    }])
    setSearchQuery('')
    setSearchResults([])
  }

  function handleRemoveItem(itemId: string) {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  function handleUpdateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item
      // Don't exceed available quantity
      const newQuantity = Math.min(quantity, item.available_quantity)
      return { ...item, quantity_shipped: newQuantity }
    }))
  }

  async function handleBarcodeScan(result: ScanResult) {
    setIsScannerOpen(false)
    const results = await searchInventoryItemsForDO(result.code)
    const existingIds = new Set(items.filter(i => i.item_id).map(i => i.item_id))
    const filtered = results.filter((item: SearchResultItem) => !existingIds.has(item.id))

    if (filtered.length === 1) {
      handleAddItem(filtered[0])
      feedback.success(`Added: ${filtered[0].name}`)
    } else if (filtered.length > 1) {
      setSearchQuery(result.code)
      setSearchResults(filtered)
      feedback.warning('Multiple items found - please select one')
    } else if (results.length > 0) {
      feedback.warning(`Item "${result.code}" is already added`)
    } else {
      feedback.warning(`No item found with code: ${result.code}`)
    }
  }

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
    if (items.length === 0) {
      feedback.error('Please add at least one item')
      return
    }

    setIsSubmitting(true)
    setError(null)

    // Create delivery order
    const result = await createDeliveryOrder({
      customer_id: customerId,
      carrier: carrier || null,
      tracking_number: trackingNumber || null,
      shipping_method: shippingMethod || null,
      scheduled_date: scheduledDate || null,
      ship_to_name: shipToName || null,
      ship_to_address1: shipToAddress1 || null,
      ship_to_address2: shipToAddress2 || null,
      ship_to_city: shipToCity || null,
      ship_to_state: shipToState || null,
      ship_to_postal_code: shipToPostalCode || null,
      ship_to_country: shipToCountry || null,
      ship_to_phone: shipToPhone || null,
      total_packages: totalPackages,
      total_weight: totalWeight ? parseFloat(totalWeight) : undefined,
      weight_unit: weightUnit,
      notes: notes || null,
    })

    if (result.success && result.delivery_order_id) {
      // Add items to the delivery order
      for (const item of items) {
        await addDeliveryOrderItem(result.delivery_order_id, {
          item_id: item.item_id,
          item_name: item.item_name,
          sku: item.sku,
          quantity_shipped: item.quantity_shipped,
        })
      }

      feedback.success('Delivery order created')
      router.push(`/tasks/delivery-orders/${result.delivery_order_id}`)
    } else {
      const errorMsg = result.error || 'Failed to create delivery order'
      setError(errorMsg)
      feedback.error(errorMsg)
      setIsSubmitting(false)
    }
  }

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity_shipped, 0)
  const isFormValid = customerId && items.length > 0
  const hasAddress = Boolean(shipToName || shipToAddress1)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/delivery-orders" className="text-neutral-500 hover:text-neutral-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">New Delivery Order</h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                {items.length > 0 ? `${items.length} item${items.length !== 1 ? 's' : ''} (${totalItemsCount} units)` : 'Create a delivery for a customer'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
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
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 shrink-0">
          <AlertTriangle className="h-4 w-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Customer + Items (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Selection Card */}
            <Card className={`border-2 shadow-md ${!customerId ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/30' : 'border-primary/10 bg-gradient-to-br from-white to-primary/5'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Customer <span className="text-red-500">*</span>
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
                    className={selectedCustomer ? 'border-green-300 bg-green-50/50' : ''}
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
                  <div className="mt-3 p-3 rounded-lg bg-white border border-neutral-200 text-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">{selectedCustomer.name}</p>
                        {selectedCustomer.email && <p className="text-neutral-600">{selectedCustomer.email}</p>}
                        {selectedCustomer.phone && <p className="text-neutral-600">{selectedCustomer.phone}</p>}
                      </div>
                      <button
                        onClick={() => {
                          setCustomerId('')
                          setCustomerSearch('')
                        }}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items Card */}
            <Card className={`border-2 shadow-md ${items.length === 0 ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/30' : 'border-primary/10'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Delivery Items <span className="text-red-500">*</span>
                  {items.length > 0 && (
                    <span className="ml-auto text-sm font-normal text-neutral-500">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Smart Search Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items to add..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-neutral-400" />
                    )}
                    {searchQuery && !isSearching && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
                    <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleAddItem(item)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                        >
                          <ItemThumbnail src={item.image_urls?.[0]} alt={item.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-neutral-900 truncate">{item.name}</p>
                            <p className="text-xs text-neutral-500">
                              {item.sku && `SKU: ${item.sku} · `}
                              {item.quantity} in stock
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-primary shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-white">
                      <ItemThumbnail src={item.image_urls?.[0]} alt={item.item_name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-neutral-900 truncate">{item.item_name}</p>
                        <p className="text-xs text-neutral-500">
                          {item.sku && `SKU: ${item.sku} · `}
                          {item.available_quantity} available
                        </p>
                      </div>
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity_shipped - 1)}
                          disabled={item.quantity_shipped <= 1}
                          className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium tabular-nums">{item.quantity_shipped}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity_shipped + 1)}
                          disabled={item.quantity_shipped >= item.available_quantity}
                          className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                      <p className="text-neutral-500">No items added yet</p>
                      <p className="text-sm text-neutral-400 mt-1">Search above or scan barcode to add items</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Shipping Details, Package Info, Address, Notes (1/3 width) */}
          <div className="space-y-4">
            {/* Validation Status */}
            {!isFormValid && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {!customerId ? 'Select a customer' : 'Add at least one item'}
                </span>
              </div>
            )}
            {isFormValid && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Ready to create delivery order</span>
              </div>
            )}

            {/* Shipping Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Carrier</label>
                    <Input
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="DHL, FedEx..."
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Tracking #</label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Optional"
                      className="h-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Shipping Method</label>
                  <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="w-full h-9 rounded-lg border border-neutral-200 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select method</option>
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="overnight">Overnight</option>
                    <option value="same_day">Same Day</option>
                    <option value="pickup">Customer Pickup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Scheduled Date</label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="h-9"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Package Info Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Package Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Total Packages</label>
                  <Input
                    type="number"
                    min={1}
                    value={totalPackages}
                    onChange={(e) => setTotalPackages(parseInt(e.target.value) || 1)}
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Total Weight</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={totalWeight}
                      onChange={(e) => setTotalWeight(e.target.value)}
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Unit</label>
                    <select
                      value={weightUnit}
                      onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lb' | 'oz' | 'g')}
                      className="w-full h-9 rounded-lg border border-neutral-200 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ship To Section - Collapsible */}
            <CollapsibleSection
              title="Delivery Address"
              icon={MapPin}
              defaultExpanded={hasAddress}
              hasContent={hasAddress}
            >
              <div className="space-y-3">
                {selectedCustomer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={useCustomerAddress}
                    className="w-full"
                  >
                    Use customer address
                  </Button>
                )}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Recipient Name</label>
                  <Input
                    value={shipToName}
                    onChange={(e) => setShipToName(e.target.value)}
                    placeholder="Name of person receiving"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 1</label>
                  <Input
                    value={shipToAddress1}
                    onChange={(e) => setShipToAddress1(e.target.value)}
                    placeholder="Street address"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 2</label>
                  <Input
                    value={shipToAddress2}
                    onChange={(e) => setShipToAddress2(e.target.value)}
                    placeholder="Apt, suite, etc. (optional)"
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">City</label>
                    <Input
                      value={shipToCity}
                      onChange={(e) => setShipToCity(e.target.value)}
                      placeholder="City"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">State</label>
                    <Input
                      value={shipToState}
                      onChange={(e) => setShipToState(e.target.value)}
                      placeholder="State"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Postal Code</label>
                    <Input
                      value={shipToPostalCode}
                      onChange={(e) => setShipToPostalCode(e.target.value)}
                      placeholder="Postal code"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Country</label>
                    <select
                      value={shipToCountry}
                      onChange={(e) => setShipToCountry(e.target.value)}
                      className="w-full h-9 rounded-lg border border-neutral-200 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select country</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Philippines">Philippines</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Phone</label>
                  <Input
                    value={shipToPhone}
                    onChange={(e) => setShipToPhone(e.target.value)}
                    placeholder="Contact phone"
                    className="h-9"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Notes Section - Collapsible */}
            <CollapsibleSection
              title="Notes"
              icon={FileText}
              defaultExpanded={Boolean(notes)}
              hasContent={Boolean(notes)}
            >
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Delivery instructions, special handling..."
                rows={3}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </CollapsibleSection>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-neutral-200 bg-white px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isFormValid ? (
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Ready to create</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Complete required fields</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">
              {items.length} item{items.length !== 1 ? 's' : ''} · {totalItemsCount} unit{totalItemsCount !== 1 ? 's' : ''}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
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
      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black">
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setIsScannerOpen(false)}
            className="h-full"
          />
        </div>
      )}
    </div>
  )
}
