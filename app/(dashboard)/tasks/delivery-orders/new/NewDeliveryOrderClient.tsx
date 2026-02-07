'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
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
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createDeliveryOrder, addDeliveryOrderItem, searchInventoryItemsForDO } from '@/app/actions/delivery-orders'
import type { Customer } from '@/app/actions/customers'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { TaskFormShell } from '@/components/task-form/TaskFormShell'

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
  /** Item weight per unit (from inventory) for total weight calculation */
  item_weight: number | null
  item_weight_unit: string | null
}

interface SearchResultItem {
  id: string
  name: string
  sku: string | null
  quantity: number
  image_urls: string[] | null
  unit: string | null
  price: number | null
  weight?: number | null
  weight_unit?: string | null
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
  const [totalWeightManual, setTotalWeightManual] = useState('')
  const [weightUnitManual, setWeightUnitManual] = useState<'kg' | 'lb' | 'oz' | 'g'>('kg')

  // Shipping address
  const [shipToName, setShipToName] = useState('')
  const [shipToAddress1, setShipToAddress1] = useState('')
  const [shipToAddress2, setShipToAddress2] = useState('')
  const [shipToCity, setShipToCity] = useState('')
  const [shipToState, setShipToState] = useState('')
  const [shipToPostalCode, setShipToPostalCode] = useState('')
  const [shipToCountry, setShipToCountry] = useState('')
  const [shipToPhone, setShipToPhone] = useState('')
  /** When false, we use customer address by default; full form only after "Use a different delivery address" */
  const [useDifferentDeliveryAddress, setUseDifferentDeliveryAddress] = useState(false)

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

  // Auto-fill delivery address when customer is selected; default to "use customer address" when they have one
  useEffect(() => {
    if (!customerId) {
      setShipToName('')
      setShipToAddress1('')
      setShipToAddress2('')
      setShipToCity('')
      setShipToState('')
      setShipToPostalCode('')
      setShipToCountry('')
      setShipToPhone('')
      setUseDifferentDeliveryAddress(false)
      return
    }
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return
    const hasShipping = customer.shipping_address1 || customer.shipping_city || customer.shipping_country
    if (!hasShipping) {
      setShipToName('')
      setShipToAddress1('')
      setShipToAddress2('')
      setShipToCity('')
      setShipToState('')
      setShipToPostalCode('')
      setShipToCountry('')
      setShipToPhone('')
      setUseDifferentDeliveryAddress(true)
      return
    }
    setShipToName(customer.name || '')
    setShipToAddress1(customer.shipping_address1 || '')
    setShipToAddress2(customer.shipping_address2 || '')
    setShipToCity(customer.shipping_city || '')
    setShipToState(customer.shipping_state || '')
    setShipToPostalCode(customer.shipping_postal_code || '')
    setShipToCountry(customer.shipping_country || '')
    setShipToPhone(customer.phone || '')
    setUseDifferentDeliveryAddress(false)
  }, [customerId, customers])

  function handleAddItem(item: SearchResultItem) {
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, {
      id: tempId,
      item_id: item.id,
      item_name: item.name,
      sku: item.sku,
      quantity_shipped: 1,
      image_urls: item.image_urls,
      available_quantity: item.quantity,
      item_weight: item.weight ?? null,
      item_weight_unit: item.weight_unit ?? null,
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
    setUseDifferentDeliveryAddress(false)
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

    const customerHasAddress = selectedCustomer && (selectedCustomer.shipping_address1 || selectedCustomer.shipping_city || selectedCustomer.shipping_country)
    const useCustomerShipTo = !useDifferentDeliveryAddress && customerHasAddress
    const shipTo = useCustomerShipTo && selectedCustomer
      ? {
          ship_to_name: selectedCustomer.name || null,
          ship_to_address1: selectedCustomer.shipping_address1 || null,
          ship_to_address2: selectedCustomer.shipping_address2 || null,
          ship_to_city: selectedCustomer.shipping_city || null,
          ship_to_state: selectedCustomer.shipping_state || null,
          ship_to_postal_code: selectedCustomer.shipping_postal_code || null,
          ship_to_country: selectedCustomer.shipping_country || null,
          ship_to_phone: selectedCustomer.phone || null,
        }
      : {
          ship_to_name: shipToName || null,
          ship_to_address1: shipToAddress1 || null,
          ship_to_address2: shipToAddress2 || null,
          ship_to_city: shipToCity || null,
          ship_to_state: shipToState || null,
          ship_to_postal_code: shipToPostalCode || null,
          ship_to_country: shipToCountry || null,
          ship_to_phone: shipToPhone || null,
        }

    // Create delivery order
    const result = await createDeliveryOrder({
      customer_id: customerId,
      carrier: carrier || null,
      tracking_number: trackingNumber || null,
      shipping_method: shippingMethod || null,
      scheduled_date: scheduledDate || null,
      ...shipTo,
      total_packages: totalPackages,
      ...(finalTotalWeightKg != null && finalTotalWeightKg > 0 && { total_weight: finalTotalWeightKg, weight_unit: 'kg' as const }),
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
  const customerHasAddress = selectedCustomer && Boolean(selectedCustomer.shipping_address1 || selectedCustomer.shipping_city || selectedCustomer.shipping_country)
  const showDeliverySummaryOnly = customerHasAddress && !useDifferentDeliveryAddress

  // Total weight from items' dimensions (items have weight per unit in inventory)
  const totalWeightFromItemsKg = (() => {
    let totalKg = 0
    for (const item of items) {
      const w = item.item_weight
      if (w == null || w <= 0) continue
      const qty = item.quantity_shipped
      const unit = (item.item_weight_unit || 'kg').toLowerCase()
      let kg = w * qty
      if (unit === 'lb') kg *= 0.453592
      else if (unit === 'oz') kg *= 0.0283495
      else if (unit === 'g') kg *= 0.001
      totalKg += kg
    }
    return totalKg
  })()

  const shippingMethodOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'express', label: 'Express' },
    { value: 'overnight', label: 'Overnight' },
    { value: 'same_day', label: 'Same Day' },
    { value: 'pickup', label: 'Customer Pickup' },
  ]
  const weightUnitOptions = [
    { value: 'kg', label: 'kg' },
    { value: 'lb', label: 'lb' },
    { value: 'oz', label: 'oz' },
    { value: 'g', label: 'g' },
  ]

  // Use manual weight if entered, otherwise use calculated from items (convert manual to kg for API)
  const manualWeightKg = (() => {
    const v = parseFloat(totalWeightManual)
    if (!totalWeightManual.trim() || Number.isNaN(v) || v <= 0) return null
    const u = weightUnitManual.toLowerCase()
    if (u === 'lb') return v * 0.453592
    if (u === 'oz') return v * 0.0283495
    if (u === 'g') return v * 0.001
    return v
  })()
  const finalTotalWeightKg = manualWeightKg ?? (totalWeightFromItemsKg > 0 ? totalWeightFromItemsKg : null)

  const countryOptions = [
    { value: 'Malaysia', label: 'Malaysia' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Thailand', label: 'Thailand' },
    { value: 'Vietnam', label: 'Vietnam' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
  ]

  return (
    <>
    <TaskFormShell
      backHref="/tasks/delivery-orders"
      title="New Delivery Order"
      subtitle={items.length > 0 ? `${items.length} item${items.length !== 1 ? 's' : ''} (${totalItemsCount} units)` : 'Create a delivery for a customer'}
      headerAction={
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
      }
      errorBanner={
        error ? (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">{error}</span>
            <button onClick={() => setError(null)} className="shrink-0 text-red-500 hover:text-red-700" aria-label="Dismiss error">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ) : null
      }
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
      }
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* 1. Status */}
        {!isFormValid && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{!customerId ? 'Select a customer' : 'Add at least one item'}</span>
          </div>
        )}
        {isFormValid && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Ready to create delivery order</span>
          </div>
        )}

        {/* 2. Customer */}
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
                    id="delivery-order-customer-search"
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

        {/* 3. Delivery items */}
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
                      <div className="flex items-center gap-1" role="group" aria-label={`Quantity for ${item.item_name}`}>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity_shipped - 1)}
                          disabled={item.quantity_shipped <= 1}
                          className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium tabular-nums" aria-live="polite">{item.quantity_shipped}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity_shipped + 1)}
                          disabled={item.quantity_shipped >= item.available_quantity}
                          className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${item.item_name}`}
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

        {/* 4. Delivery address — default is customer address; show form only when "Use a different delivery address" */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
            <h3 className="text-sm font-medium text-neutral-900">Delivery address</h3>
          </div>
          {showDeliverySummaryOnly ? (
            <>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm text-neutral-700">
                <p className="font-medium text-neutral-900">{selectedCustomer?.name}</p>
                <p className="mt-0.5">
                  {[selectedCustomer?.shipping_address1, selectedCustomer?.shipping_address2].filter(Boolean).join(', ')}
                </p>
                <p className="mt-0.5">
                  {[selectedCustomer?.shipping_city, selectedCustomer?.shipping_state, selectedCustomer?.shipping_postal_code].filter(Boolean).join(', ')}
                  {selectedCustomer?.shipping_country ? ` ${selectedCustomer.shipping_country}` : ''}
                </p>
                {selectedCustomer?.phone && (
                  <p className="mt-1 text-neutral-600">Phone: {selectedCustomer.phone}</p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUseDifferentDeliveryAddress(true)}
              >
                Use a different delivery address
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              {customerHasAddress && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useCustomerAddress}
                  className="w-full"
                >
                  Use customer delivery address
                </Button>
              )}
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Recipient Name</label>
                <Input
                  id="delivery-order-ship-name"
                  value={shipToName}
                  onChange={(e) => setShipToName(e.target.value)}
                  placeholder="Name of person receiving"
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 1</label>
                <Input
                  id="delivery-order-ship-address1"
                  value={shipToAddress1}
                  onChange={(e) => setShipToAddress1(e.target.value)}
                  placeholder="Street address"
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 2</label>
                <Input
                  id="delivery-order-ship-address2"
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
                    id="delivery-order-ship-city"
                    value={shipToCity}
                    onChange={(e) => setShipToCity(e.target.value)}
                    placeholder="City"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">State</label>
                  <Input
                    id="delivery-order-ship-state"
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
                    id="delivery-order-ship-postal-code"
                    value={shipToPostalCode}
                    onChange={(e) => setShipToPostalCode(e.target.value)}
                    placeholder="Postal code"
                    className="h-9"
                  />
                </div>
                <Select
                  id="delivery-order-ship-country"
                  label="Country"
                  placeholder="Select country"
                  options={countryOptions}
                  value={shipToCountry}
                  onChange={(e) => setShipToCountry(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Phone</label>
                <Input
                  id="delivery-order-ship-phone"
                  value={shipToPhone}
                  onChange={(e) => setShipToPhone(e.target.value)}
                  placeholder="Contact phone"
                  className="h-9"
                />
              </div>
            </div>
          )}
        </section>

        {/* 5. When to send & courier (optional) — collapsed by default to keep form simple */}
        <CollapsibleSection
          title="When to send & courier (optional)"
          icon={Truck}
          defaultExpanded={Boolean(scheduledDate || shippingMethod || carrier || trackingNumber || totalPackages > 1 || totalWeightFromItemsKg > 0 || totalWeightManual.trim())}
          hasContent={Boolean(scheduledDate || shippingMethod || carrier || trackingNumber || totalPackages > 1 || totalWeightFromItemsKg > 0 || totalWeightManual.trim())}
        >
          <p className="mb-4 text-xs text-neutral-500">Add when you know the date and how you&apos;re sending.</p>

          {/* Block A: When & how */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-neutral-700">When & how</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">Delivery date</label>
                <Input
                  id="delivery-order-scheduled-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <Select
                id="delivery-order-shipping-method"
                label="How you're sending"
                placeholder="e.g. Standard, Express"
                options={shippingMethodOptions}
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Block B: Courier details — only when not customer pickup */}
          {shippingMethod !== 'pickup' && (
            <div className="space-y-3 border-t border-neutral-100 pt-4">
              <p className="text-xs text-neutral-500">If you&apos;re using a courier, add their name and tracking when you have it.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Courier name</label>
                  <Input
                    id="delivery-order-carrier"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. DHL, FedEx"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-500">Tracking number</label>
                  <Input
                    id="delivery-order-tracking-number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Optional"
                    className="h-9"
                  />
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-neutral-500">Parcel info <span className="font-normal text-neutral-400">(for labels)</span></p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-500">Number of parcels</label>
                    <Input
                      id="delivery-order-total-packages"
                      type="number"
                      min={1}
                      value={totalPackages}
                      onChange={(e) => setTotalPackages(parseInt(e.target.value) || 1)}
                      className="h-9"
                    />
                  </div>
                  {totalWeightFromItemsKg > 0 && !totalWeightManual.trim() && (
                    <p className="text-xs text-neutral-500">
                      Total weight <span className="font-medium text-neutral-700">{(totalWeightFromItemsKg).toFixed(2)} kg</span>
                      <span className="ml-1 text-neutral-400">(from items)</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-0 max-w-32 flex-1">
                      <label className="mb-1 block text-xs font-medium text-neutral-500">Or enter weight manually</label>
                      <Input
                        id="delivery-order-total-weight"
                        type="number"
                        step="0.01"
                        min="0"
                        value={totalWeightManual}
                        onChange={(e) => setTotalWeightManual(e.target.value)}
                        placeholder="Optional"
                        className="h-9"
                      />
                    </div>
                    <div className="w-24 shrink-0">
                      <Select
                        id="delivery-order-weight-unit"
                        label="Unit"
                        options={weightUnitOptions}
                        value={weightUnitManual}
                        onChange={(e) => setWeightUnitManual(e.target.value as 'kg' | 'lb' | 'oz' | 'g')}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CollapsibleSection>

        {/* 6. Notes (last) */}
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
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </CollapsibleSection>
      </div>
    </TaskFormShell>

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
    </>
  )
}
