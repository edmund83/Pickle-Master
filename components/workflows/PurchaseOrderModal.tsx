'use client'

import { useState, useEffect } from 'react'
import {
  createPurchaseOrder,
  getVendors,
  searchInventoryItemsForPO,
  type CreatePurchaseOrderInput
} from '@/app/actions/purchase-orders'
import {
  X,
  Plus,
  Trash2,
  Loader2,
  Search,
  Package,
  Minus,
  ShoppingCart,
  Building2,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VendorModal } from './VendorModal'
import Image from 'next/image'

interface PurchaseOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Vendor {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
}

interface InventoryItem {
  id: string
  name: string
  sku: string | null
  quantity: number
  image_urls: string[] | null
  unit: string | null
  price: number | null
}

interface SelectedItem {
  item: InventoryItem | null // null for custom items
  item_name: string
  sku: string | null
  part_number: string | null
  ordered_quantity: number
  unit_price: number
}

interface AddressFields {
  name: string
  address1: string
  address2: string
  city: string
  state: string
  postal_code: string
  country: string
}

const emptyAddress: AddressFields = {
  name: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postal_code: '',
  country: ''
}

export function PurchaseOrderModal({ isOpen, onClose, onSuccess }: PurchaseOrderModalProps) {
  // Form state
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')

  // Ship To / Bill To address state
  const [shipTo, setShipTo] = useState<AddressFields>(emptyAddress)
  const [billTo, setBillTo] = useState<AddressFields>(emptyAddress)
  const [showAddresses, setShowAddresses] = useState(false)
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)

  // Items state
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [showItemSearch, setShowItemSearch] = useState(false)
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Vendors
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [showVendorModal, setShowVendorModal] = useState(false)

  // UI state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load vendors on mount
  useEffect(() => {
    if (isOpen) {
      loadVendors()
    }
  }, [isOpen])

  // Search items with debounce
  useEffect(() => {
    if (!showItemSearch) return

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const results = await searchInventoryItemsForPO(itemSearchQuery, showLowStockOnly)
        // Filter out already selected items
        const selectedIds = new Set(selectedItems.filter(s => s.item).map(s => s.item!.id))
        setSearchResults(results.filter((item: InventoryItem) => !selectedIds.has(item.id)))
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [itemSearchQuery, showItemSearch, selectedItems, showLowStockOnly])

  async function loadVendors() {
    try {
      const data = await getVendors()
      setVendors(data)
    } catch (err) {
      console.error('Error loading vendors:', err)
    }
  }

  function handleVendorCreated(newVendorId: string, newVendorName: string) {
    setVendorId(newVendorId)
    setVendors(prev => [...prev, { id: newVendorId, name: newVendorName, contact_name: null, email: null, phone: null }])
  }

  function addItem(item: InventoryItem) {
    setSelectedItems(prev => [...prev, {
      item,
      item_name: item.name,
      sku: item.sku,
      part_number: null,
      ordered_quantity: 1,
      unit_price: item.price || 0
    }])
    setShowItemSearch(false)
    setItemSearchQuery('')
  }

  function addCustomItem() {
    setSelectedItems(prev => [...prev, {
      item: null,
      item_name: '',
      sku: null,
      part_number: null,
      ordered_quantity: 1,
      unit_price: 0
    }])
  }

  function removeItem(index: number) {
    setSelectedItems(prev => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, updates: Partial<SelectedItem>) {
    setSelectedItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
    )
  }

  function resetForm() {
    setVendorId(null)
    setOrderNumber('')
    setExpectedDate('')
    setNotes('')
    setShipTo(emptyAddress)
    setBillTo(emptyAddress)
    setShowAddresses(false)
    setShowLowStockOnly(false)
    setSelectedItems([])
    setError(null)
  }

  // Calculate totals
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.ordered_quantity * item.unit_price), 0)

  async function handleSubmit() {
    if (selectedItems.length === 0) {
      setError('Please add at least one item to the purchase order')
      return
    }

    // Validate all items have names
    const invalidItems = selectedItems.filter(item => !item.item_name.trim())
    if (invalidItems.length > 0) {
      setError('All items must have a name')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const input: CreatePurchaseOrderInput = {
        vendor_id: vendorId,
        order_number: orderNumber.trim() || null,
        expected_date: expectedDate || null,
        notes: notes.trim() || null,
        // Ship To address
        ship_to_name: shipTo.name.trim() || null,
        ship_to_address1: shipTo.address1.trim() || null,
        ship_to_address2: shipTo.address2.trim() || null,
        ship_to_city: shipTo.city.trim() || null,
        ship_to_state: shipTo.state.trim() || null,
        ship_to_postal_code: shipTo.postal_code.trim() || null,
        ship_to_country: shipTo.country.trim() || null,
        // Bill To address
        bill_to_name: billTo.name.trim() || null,
        bill_to_address1: billTo.address1.trim() || null,
        bill_to_address2: billTo.address2.trim() || null,
        bill_to_city: billTo.city.trim() || null,
        bill_to_state: billTo.state.trim() || null,
        bill_to_postal_code: billTo.postal_code.trim() || null,
        bill_to_country: billTo.country.trim() || null,
        items: selectedItems.map(s => ({
          item_id: s.item?.id || null,
          item_name: s.item_name.trim(),
          sku: s.sku?.trim() || null,
          part_number: s.part_number?.trim() || null,
          ordered_quantity: s.ordered_quantity,
          unit_price: s.unit_price
        }))
      }

      const result = await createPurchaseOrder(input)

      if (result.success) {
        resetForm()
        onSuccess()
        onClose()
      } else {
        setError(result.error || 'Failed to create purchase order')
      }
    } catch (err) {
      console.error('Create purchase order error:', err)
      setError('An error occurred while creating the purchase order')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Create Purchase Order</h2>
                <p className="text-sm text-neutral-500">Order items from a vendor</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Vendor Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Vendor / Supplier
              </label>
              <div className="flex gap-2">
                <select
                  value={vendorId || ''}
                  onChange={(e) => setVendorId(e.target.value || null)}
                  className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowVendorModal(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  New
                </Button>
              </div>
            </div>

            {/* Order Info Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Order Number */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Order Number
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                />
              </div>

              {/* Expected Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                />
              </div>
            </div>

            {/* Ship To / Bill To Addresses (Collapsible) */}
            <div className="rounded-lg border border-neutral-200">
              <button
                type="button"
                onClick={() => setShowAddresses(!showAddresses)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium text-neutral-700">Ship To / Bill To Addresses</span>
                  {(shipTo.name || billTo.name) && (
                    <span className="rounded-full bg-pickle-100 px-2 py-0.5 text-xs text-pickle-700">
                      {[shipTo.name, billTo.name].filter(Boolean).length} configured
                    </span>
                  )}
                </div>
                {showAddresses ? (
                  <ChevronUp className="h-4 w-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                )}
              </button>

              {showAddresses && (
                <div className="border-t border-neutral-200 p-4 space-y-6">
                  {/* Ship To */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-neutral-700">Ship To</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={shipTo.name}
                          onChange={(e) => setShipTo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Name"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={shipTo.address1}
                          onChange={(e) => setShipTo(prev => ({ ...prev, address1: e.target.value }))}
                          placeholder="Address Line 1"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={shipTo.address2}
                          onChange={(e) => setShipTo(prev => ({ ...prev, address2: e.target.value }))}
                          placeholder="Address Line 2 (optional)"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={shipTo.city}
                          onChange={(e) => setShipTo(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="City"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={shipTo.state}
                          onChange={(e) => setShipTo(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="State"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={shipTo.postal_code}
                          onChange={(e) => setShipTo(prev => ({ ...prev, postal_code: e.target.value }))}
                          placeholder="Postal Code"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={shipTo.country}
                          onChange={(e) => setShipTo(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="Country"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bill To */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-neutral-700">Bill To</h4>
                      <button
                        type="button"
                        onClick={() => setBillTo(shipTo)}
                        className="text-xs text-pickle-600 hover:text-pickle-700"
                      >
                        Same as Ship To
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={billTo.name}
                          onChange={(e) => setBillTo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Name"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={billTo.address1}
                          onChange={(e) => setBillTo(prev => ({ ...prev, address1: e.target.value }))}
                          placeholder="Address Line 1"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={billTo.address2}
                          onChange={(e) => setBillTo(prev => ({ ...prev, address2: e.target.value }))}
                          placeholder="Address Line 2 (optional)"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={billTo.city}
                          onChange={(e) => setBillTo(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="City"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={billTo.state}
                          onChange={(e) => setBillTo(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="State"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={billTo.postal_code}
                          onChange={(e) => setBillTo(prev => ({ ...prev, postal_code: e.target.value }))}
                          placeholder="Postal Code"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={billTo.country}
                          onChange={(e) => setBillTo(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="Country"
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Items Section */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">
                  Order Items
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomItem}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Custom Item
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowItemSearch(true)}
                  >
                    <Search className="mr-1 h-4 w-4" />
                    From Inventory
                  </Button>
                </div>
              </div>

              {/* Item Search */}
              {showItemSearch && (
                <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  {/* Low Stock Filter */}
                  <label className="mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showLowStockOnly}
                      onChange={(e) => setShowLowStockOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-pickle-600 focus:ring-pickle-500"
                    />
                    <span className="flex items-center gap-1 text-sm text-neutral-600">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      Only show low-stock items
                    </span>
                  </label>

                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      placeholder="Search items by name or SKU..."
                      autoFocus
                      className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                    />
                    <button
                      onClick={() => {
                        setShowItemSearch(false)
                        setItemSearchQuery('')
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {searchLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addItem(item)}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-white"
                        >
                          {item.image_urls?.[0] ? (
                            <Image
                              src={item.image_urls[0]}
                              alt={item.name}
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100">
                              <Package className="h-4 w-4 text-neutral-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                            <p className="text-xs text-neutral-500">
                              {item.sku && `SKU: ${item.sku} · `}
                              Current stock: {item.quantity} {item.unit || 'units'}
                            </p>
                          </div>
                          <Plus className="h-4 w-4 text-pickle-600" />
                        </button>
                      ))}
                    </div>
                  ) : itemSearchQuery ? (
                    <p className="py-4 text-center text-sm text-neutral-500">No items found</p>
                  ) : (
                    <p className="py-4 text-center text-sm text-neutral-500">Type to search items</p>
                  )}
                </div>
              )}

              {/* Selected Items Table */}
              {selectedItems.length > 0 ? (
                <div className="rounded-lg border border-neutral-200 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-neutral-600">Item</th>
                        <th className="px-3 py-2 text-left font-medium text-neutral-600 w-24">Part #</th>
                        <th className="px-3 py-2 text-center font-medium text-neutral-600 w-24">Qty</th>
                        <th className="px-3 py-2 text-right font-medium text-neutral-600 w-28">Unit Price</th>
                        <th className="px-3 py-2 text-right font-medium text-neutral-600 w-28">Total</th>
                        <th className="px-3 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedItems.map((selected, index) => (
                        <tr key={index} className="hover:bg-neutral-50">
                          <td className="px-3 py-2">
                            {selected.item ? (
                              <div className="flex items-center gap-2">
                                {selected.item.image_urls?.[0] ? (
                                  <Image
                                    src={selected.item.image_urls[0]}
                                    alt={selected.item_name}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-100">
                                    <Package className="h-4 w-4 text-neutral-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-neutral-900">{selected.item_name}</p>
                                  {selected.sku && (
                                    <p className="text-xs text-neutral-500">SKU: {selected.sku}</p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={selected.item_name}
                                onChange={(e) => updateItem(index, { item_name: e.target.value })}
                                placeholder="Enter item name"
                                className="w-full rounded border border-neutral-300 px-2 py-1 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                              />
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={selected.part_number || ''}
                              onChange={(e) => updateItem(index, { part_number: e.target.value || null })}
                              placeholder="Part #"
                              className="w-full rounded border border-neutral-300 px-2 py-1 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => updateItem(index, { ordered_quantity: Math.max(1, selected.ordered_quantity - 1) })}
                                disabled={selected.ordered_quantity <= 1}
                                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={selected.ordered_quantity}
                                onChange={(e) => updateItem(index, { ordered_quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                                className="w-14 rounded border border-neutral-300 px-2 py-1 text-center text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                              />
                              <button
                                onClick={() => updateItem(index, { ordered_quantity: selected.ordered_quantity + 1 })}
                                className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end">
                              <span className="mr-1 text-neutral-400">$</span>
                              <input
                                type="number"
                                min={0}
                                step={0.01}
                                value={selected.unit_price}
                                onChange={(e) => updateItem(index, { unit_price: Math.max(0, parseFloat(e.target.value) || 0) })}
                                className="w-20 rounded border border-neutral-300 px-2 py-1 text-right text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                              />
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-neutral-900">
                            ${(selected.ordered_quantity * selected.unit_price).toFixed(2)}
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => removeItem(index)}
                              className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-neutral-200 bg-neutral-50">
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right font-medium text-neutral-700">
                          Subtotal:
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-neutral-900">
                          ${subtotal.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-neutral-300 py-8 text-center">
                  <Package className="mx-auto h-8 w-8 text-neutral-400" />
                  <p className="mt-2 text-sm text-neutral-500">No items added yet</p>
                  <div className="mt-2 flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addCustomItem}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Custom Item
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowItemSearch(true)}
                    >
                      <Search className="mr-1 h-4 w-4" />
                      From Inventory
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex gap-3 border-t border-neutral-200 bg-white px-6 py-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting || selectedItems.length === 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Create Purchase Order
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Vendor Modal */}
      <VendorModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        onSuccess={handleVendorCreated}
      />
    </>
  )
}
