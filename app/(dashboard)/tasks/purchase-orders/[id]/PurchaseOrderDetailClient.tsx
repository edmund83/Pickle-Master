'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  Mail,
  Phone,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Send,
  Check,
  Minus,
  MapPin,
  FileText,
  Barcode,
  Search,
  X,
  Info,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedShortDate, FormattedDateTime } from '@/components/formatting/FormattedDate'
import { useFormatting } from '@/hooks/useFormatting'
import {
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
  addPurchaseOrderItem,
  removePurchaseOrderItem,
  updatePurchaseOrderItem,
  searchInventoryItemsForPO
} from '@/app/actions/purchase-orders'
import { createReceive } from '@/app/actions/receives'
import type { PurchaseOrderWithDetails, TeamMember, Vendor } from './page'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'
import { ChatterPanel } from '@/components/chatter'

interface PurchaseOrderDetailClientProps {
  purchaseOrder: PurchaseOrderWithDetails
  teamMembers: TeamMember[]
  vendors: Vendor[]
  createdByName: string | null
  currentUserId: string | null
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  draft: { icon: Clock, color: 'text-neutral-600', bgColor: 'bg-neutral-100', label: 'Draft' },
  submitted: { icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Submitted' },
  confirmed: { icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Confirmed' },
  partial: { icon: Truck, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Partially Received' },
  received: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Received' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' },
}

export function PurchaseOrderDetailClient({
  purchaseOrder,
  teamMembers,
  vendors,
  createdByName,
  currentUserId
}: PurchaseOrderDetailClientProps) {
  const router = useRouter()
  const { formatCurrency } = useFormatting()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state for draft mode
  const [orderNumber, setOrderNumber] = useState(purchaseOrder.order_number || '')
  const [expectedDate, setExpectedDate] = useState(purchaseOrder.expected_date || '')
  const [submittedBy, setSubmittedBy] = useState(purchaseOrder.submitted_by || '')
  const [approvedBy, setApprovedBy] = useState(purchaseOrder.approved_by || '')
  const [notes, setNotes] = useState(purchaseOrder.notes || '')

  // Vendor fields
  const [vendorId, setVendorId] = useState(purchaseOrder.vendor_id || '')
  const [vendorName, setVendorName] = useState(purchaseOrder.vendor?.name || '')
  const [vendorEmail, setVendorEmail] = useState(purchaseOrder.vendor?.email || '')
  const [vendorPhone, setVendorPhone] = useState(purchaseOrder.vendor?.phone || '')

  // Ship To fields
  const [shipToName, setShipToName] = useState(purchaseOrder.ship_to_name || '')
  const [shipToAddress1, setShipToAddress1] = useState(purchaseOrder.ship_to_address1 || '')
  const [shipToAddress2, setShipToAddress2] = useState(purchaseOrder.ship_to_address2 || '')
  const [shipToCity, setShipToCity] = useState(purchaseOrder.ship_to_city || '')
  const [shipToState, setShipToState] = useState(purchaseOrder.ship_to_state || '')
  const [shipToPostalCode, setShipToPostalCode] = useState(purchaseOrder.ship_to_postal_code || '')
  const [shipToCountry, setShipToCountry] = useState(purchaseOrder.ship_to_country || '')

  // Bill To fields
  const [billToName, setBillToName] = useState(purchaseOrder.bill_to_name || '')
  const [billToAddress1, setBillToAddress1] = useState(purchaseOrder.bill_to_address1 || '')
  const [billToAddress2, setBillToAddress2] = useState(purchaseOrder.bill_to_address2 || '')
  const [billToCity, setBillToCity] = useState(purchaseOrder.bill_to_city || '')
  const [billToState, setBillToState] = useState(purchaseOrder.bill_to_state || '')
  const [billToPostalCode, setBillToPostalCode] = useState(purchaseOrder.bill_to_postal_code || '')
  const [billToCountry, setBillToCountry] = useState(purchaseOrder.bill_to_country || '')

  // Same as Ship To state
  const [sameAsShipTo, setSameAsShipTo] = useState(false)

  // Menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    id: string
    name: string
    sku: string | null
    quantity: number
    image_urls: string[] | null
    unit: string | null
    price: number | null
  }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showLowStock, setShowLowStock] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const status = purchaseOrder.status || 'draft'
  const isDraft = status === 'draft'
  const canReceive = ['submitted', 'confirmed', 'partial'].includes(status)

  // Calculate totals
  const subtotal = purchaseOrder.items.reduce(
    (sum, item) => sum + (item.ordered_quantity * item.unit_price),
    0
  )

  // Search items
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await searchInventoryItemsForPO(query, showLowStock)
      // Filter out items already in the PO
      const existingIds = new Set(purchaseOrder.items.filter(i => i.item_id).map(i => i.item_id))
      setSearchResults(results.filter((item: { id: string }) => !existingIds.has(item.id)))
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }, [purchaseOrder.items, showLowStock])

  // Debounced search
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

  // Save field on blur
  async function saveField(field: string, value?: string | null) {
    try {
      const updates: Record<string, string | null> = {}

      switch (field) {
        case 'order_number':
          updates.order_number = (value ?? orderNumber) || null
          break
        case 'expected_date':
          updates.expected_date = (value ?? expectedDate) || null
          break
        case 'notes':
          updates.notes = (value ?? notes) || null
          break
        case 'vendor':
          updates.vendor_id = (value ?? vendorId) || null
          break
        case 'ship_to':
          Object.assign(updates, {
            ship_to_name: shipToName || null,
            ship_to_address1: shipToAddress1 || null,
            ship_to_address2: shipToAddress2 || null,
            ship_to_city: shipToCity || null,
            ship_to_state: shipToState || null,
            ship_to_postal_code: shipToPostalCode || null,
            ship_to_country: shipToCountry || null,
          })
          break
        case 'bill_to':
          Object.assign(updates, {
            bill_to_name: billToName || null,
            bill_to_address1: billToAddress1 || null,
            bill_to_address2: billToAddress2 || null,
            bill_to_city: billToCity || null,
            bill_to_state: billToState || null,
            bill_to_postal_code: billToPostalCode || null,
            bill_to_country: billToCountry || null,
          })
          break
      }

      if (Object.keys(updates).length > 0) {
        await updatePurchaseOrder(purchaseOrder.id, updates)
        router.refresh()
      }
    } catch (err) {
      console.error('Save field error:', err)
    }
  }

  async function handleVendorSelect(selectedVendorId: string) {
    const vendor = vendors.find(v => v.id === selectedVendorId)
    if (vendor) {
      setVendorId(vendor.id)
      setVendorName(vendor.name)
      setVendorEmail(vendor.email || '')
      setVendorPhone(vendor.phone || '')
      await saveField('vendor', vendor.id)
    }
  }

  async function handleSameAsShipTo(checked: boolean) {
    setSameAsShipTo(checked)
    if (checked) {
      // Copy Ship To values to Bill To
      setBillToName(shipToName)
      setBillToAddress1(shipToAddress1)
      setBillToAddress2(shipToAddress2)
      setBillToCity(shipToCity)
      setBillToState(shipToState)
      setBillToPostalCode(shipToPostalCode)
      setBillToCountry(shipToCountry)
      // Save the copied values
      await updatePurchaseOrder(purchaseOrder.id, {
        bill_to_name: shipToName || null,
        bill_to_address1: shipToAddress1 || null,
        bill_to_address2: shipToAddress2 || null,
        bill_to_city: shipToCity || null,
        bill_to_state: shipToState || null,
        bill_to_postal_code: shipToPostalCode || null,
        bill_to_country: shipToCountry || null,
      })
      router.refresh()
    }
  }

  async function handleAddItem(item: { id: string; name: string; sku: string | null; price: number | null }) {
    setActionLoading('add-item')
    try {
      const result = await addPurchaseOrderItem(purchaseOrder.id, {
        item_id: item.id,
        item_name: item.name,
        sku: item.sku,
        ordered_quantity: 1,
        unit_price: item.price || 0
      })

      if (result.success) {
        router.refresh()
        setSearchQuery('')
        setSearchResults([])
      } else {
        setError(result.error || 'Failed to add item')
      }
    } catch (err) {
      console.error('Add item error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleBarcodeScan(result: ScanResult) {
    setIsScannerOpen(false)

    // Search for item by barcode (SKU)
    const foundItems = await searchInventoryItemsForPO(result.code)

    // Filter out items already in the PO
    const existingIds = new Set(purchaseOrder.items.filter(i => i.item_id).map(i => i.item_id))
    const filtered = foundItems.filter((item: { id: string }) => !existingIds.has(item.id))

    if (filtered.length === 1) {
      // Single match - add directly
      await handleAddItem(filtered[0])
    } else if (filtered.length > 1) {
      // Multiple matches - show in search results
      setSearchQuery(result.code)
      setSearchResults(filtered)
    } else if (foundItems.length > 0) {
      // Items found but all already in PO
      alert(`Item with barcode "${result.code}" is already in the purchase order`)
    } else {
      // No match found
      alert(`No item found with barcode: ${result.code}`)
    }
  }

  async function handleRemoveItem(itemId: string) {
    setActionLoading(`remove-${itemId}`)
    try {
      const result = await removePurchaseOrderItem(itemId)
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || 'Failed to remove item')
      }
    } catch (err) {
      console.error('Remove item error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUpdateItemQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return
    setActionLoading(`qty-${itemId}`)
    try {
      const result = await updatePurchaseOrderItem(itemId, { ordered_quantity: quantity })
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || 'Failed to update item')
      }
    } catch (err) {
      console.error('Update item error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleStatusChange(newStatus: string) {
    setActionLoading('status')
    setError(null)

    const result = await updatePurchaseOrderStatus(purchaseOrder.id, newStatus)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to update status')
    }

    setActionLoading(null)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this purchase order? This cannot be undone.')) return

    setActionLoading('delete')
    setError(null)

    const result = await deletePurchaseOrder(purchaseOrder.id)

    if (result.success) {
      router.push('/tasks/purchase-orders')
    } else {
      setError(result.error || 'Failed to delete purchase order')
      setActionLoading(null)
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this purchase order?')) return
    await handleStatusChange('cancelled')
  }

  async function handleCreateReceive() {
    setActionLoading('create-receive')
    setError(null)

    const result = await createReceive({ purchase_order_id: purchaseOrder.id })

    if (result.success && result.receive_id) {
      router.push(`/tasks/receives/${result.receive_id}`)
    } else {
      setError(result.error || 'Failed to create receive')
      setActionLoading(null)
    }
  }

  // Draft Mode UI - Single column form layout matching Pick List
  if (isDraft) {
    return (
      <div className="flex-1 overflow-y-auto bg-neutral-50">
        {/* Header */}
        <div className="border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tasks/purchase-orders" className="text-sm text-neutral-500 hover:text-neutral-700">
                Purchase Orders
              </Link>
              <span className="text-neutral-300">/</span>
              <span className="text-sm text-neutral-500">
                Last Updated: <FormattedDateTime date={purchaseOrder.updated_at || purchaseOrder.created_at || new Date().toISOString()} />
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* More menu with Delete option */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
                {showMoreMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="absolute top-full right-0 mt-1 z-20 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg py-1">
                      <button
                        onClick={() => {
                          setShowMoreMenu(false)
                          handleDelete()
                        }}
                        disabled={actionLoading !== null}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionLoading === 'delete' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Delete Order
                      </button>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={actionLoading !== null}
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onBlur={() => saveField('order_number')}
              className="text-2xl font-semibold text-neutral-900 bg-transparent border-b-2 border-dashed border-neutral-200 focus:border-primary outline-none px-2 py-1"
              placeholder="PO Number"
            />
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusConfig[status]?.bgColor} ${statusConfig[status]?.color}`}>
              {statusConfig[status]?.label || status}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
            <span>Order Total: <strong className="text-neutral-900">{formatCurrency(subtotal)}</strong></span>
            <span>·</span>
            <span>Created By: <strong>{createdByName || 'Unknown'}</strong></span>
            <span>·</span>
            <span>Date Created: <FormattedDateTime date={purchaseOrder.created_at || new Date().toISOString()} /></span>
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

        {/* Dates Row */}
        <div className="border-b border-neutral-200 bg-white px-6 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Submitted By */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Submitted By
                <Info className="inline h-3.5 w-3.5 ml-1 text-neutral-400" />
              </label>
              <select
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Select...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || member.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Expected */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date Expected
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => {
                  setExpectedDate(e.target.value)
                  saveField('expected_date', e.target.value)
                }}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Approved By */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Approved By
                <Info className="inline h-3.5 w-3.5 ml-1 text-neutral-400" />
              </label>
              <select
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Select...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || member.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="border-b border-neutral-200 bg-white">
          <div className="px-6 py-3 border-b border-neutral-100">
            <div className="grid grid-cols-6 gap-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
              <span className="col-span-2">Line Item</span>
              <span>Part #</span>
              <span className="text-center">Order Qty</span>
              <span className="text-right">Unit Rate</span>
              <span className="text-right">Amount</span>
            </div>
          </div>

          {/* Items List */}
          <div className="divide-y divide-neutral-100">
            {purchaseOrder.items.map((item) => (
              <div key={item.id} className="grid grid-cols-6 gap-4 items-center px-6 py-4">
                <div className="col-span-2 flex items-center gap-3">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={actionLoading === `remove-${item.id}`}
                    className="text-neutral-400 hover:text-red-500"
                  >
                    {actionLoading === `remove-${item.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                  {item.inventory_item?.image_urls?.[0] ? (
                    <Image
                      src={item.inventory_item.image_urls[0]}
                      alt={item.item_name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-neutral-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-neutral-900">{item.item_name}</p>
                    {item.sku && <p className="text-xs text-neutral-500">SKU: {item.sku}</p>}
                  </div>
                </div>

                <div className="text-neutral-600">
                  {item.part_number || '-'}
                </div>

                {/* Quantity controls */}
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => handleUpdateItemQuantity(item.id, item.ordered_quantity - 1)}
                    disabled={item.ordered_quantity <= 1 || actionLoading === `qty-${item.id}`}
                    className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{item.ordered_quantity}</span>
                  <button
                    onClick={() => handleUpdateItemQuantity(item.id, item.ordered_quantity + 1)}
                    disabled={actionLoading === `qty-${item.id}`}
                    className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right text-neutral-700">
                  {formatCurrency(item.unit_price)}
                </div>

                <div className="text-right font-medium text-neutral-900">
                  {formatCurrency(item.ordered_quantity * item.unit_price)}
                </div>
              </div>
            ))}

            {purchaseOrder.items.length === 0 && (
              <div className="px-6 py-8 text-center text-neutral-500">
                No items added yet. Search below to add items.
              </div>
            )}
          </div>

          {/* Subtotal row */}
          {purchaseOrder.items.length > 0 && (
            <div className="grid grid-cols-6 gap-4 items-center px-6 py-3 bg-neutral-50 border-t border-neutral-200">
              <div className="col-span-4 text-right text-sm font-medium text-neutral-600">
                Subtotal ({purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? 's' : ''}):
              </div>
              <div className="col-span-2 text-right text-lg font-semibold text-neutral-900">
                {formatCurrency(subtotal)}
              </div>
            </div>
          )}

          {/* Search to add items */}
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search to add items to the purchase order"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-neutral-400" />
                )}
              </div>
              <button
                onClick={() => setIsScannerOpen(true)}
                className="p-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                title="Scan barcode"
              >
                <Barcode className="h-5 w-5" />
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-lg border border-neutral-200 shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    disabled={actionLoading === 'add-item'}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-left border-b border-neutral-100 last:border-0"
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
                      <div className="h-8 w-8 rounded bg-neutral-100 flex items-center justify-center">
                        <Package className="h-4 w-4 text-neutral-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                      {item.sku && <p className="text-xs text-neutral-500">SKU: {item.sku}</p>}
                    </div>
                    <span className="text-xs text-neutral-500">{item.quantity} {item.unit || 'units'}</span>
                    <Plus className="h-4 w-4 text-primary" />
                  </button>
                ))}
              </div>
            )}

            {/* Low stock toggle */}
            <label className="mt-3 flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="rounded border-neutral-300 text-primary focus:ring-primary"
              />
              Only show low-stock items
            </label>
          </div>
        </div>

        {/* Vendor Section */}
        <Card className="mx-6 mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor
            </CardTitle>
            <select
              value={vendorId}
              onChange={(e) => handleVendorSelect(e.target.value)}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Name"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  disabled
                />
              </div>
              <input
                type="email"
                value={vendorEmail}
                onChange={(e) => setVendorEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                disabled
              />
              <input
                type="tel"
                value={vendorPhone}
                onChange={(e) => setVendorPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Ship To Section */}
        <Card className="mx-6 mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ship To
            </CardTitle>
            <Button variant="outline" size="sm">
              Select Address
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-neutral-500 mb-1">Name</label>
                <input
                  type="text"
                  value={shipToName}
                  onChange={(e) => setShipToName(e.target.value)}
                  onBlur={() => saveField('ship_to')}
                  placeholder="Enter name"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 1</label>
                <input
                  type="text"
                  value={shipToAddress1}
                  onChange={(e) => setShipToAddress1(e.target.value)}
                  onBlur={() => saveField('ship_to')}
                  placeholder="Street address"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={shipToAddress2}
                  onChange={(e) => setShipToAddress2(e.target.value)}
                  onBlur={() => saveField('ship_to')}
                  placeholder="Apt, suite, unit (optional)"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">City</label>
                <input
                  type="text"
                  value={shipToCity}
                  onChange={(e) => setShipToCity(e.target.value)}
                  onBlur={() => saveField('ship_to')}
                  placeholder="Enter city"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">State / Province</label>
                <input
                  type="text"
                  value={shipToState}
                  onChange={(e) => setShipToState(e.target.value)}
                  onBlur={() => saveField('ship_to')}
                  placeholder="Enter state or province"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={shipToPostalCode}
                  onChange={(e) => setShipToPostalCode(e.target.value)}
                  onBlur={() => saveField('ship_to')}
                  placeholder="Enter postal code"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Country</label>
                <select
                  value={shipToCountry}
                  onChange={(e) => {
                    setShipToCountry(e.target.value)
                    saveField('ship_to')
                  }}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  <option value="">Select country</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill To Section */}
        <Card className="mx-6 mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bill To
            </CardTitle>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipTo}
                  onChange={(e) => handleSameAsShipTo(e.target.checked)}
                  className="rounded border-neutral-300 text-primary focus:ring-primary"
                />
                Same as Ship To
              </label>
              <Button variant="outline" size="sm">
                Select Address
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sameAsShipTo ? (
              <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm text-neutral-600">
                <p className="font-medium text-neutral-700">{billToName || 'No name provided'}</p>
                {billToAddress1 && <p>{billToAddress1}</p>}
                {billToAddress2 && <p>{billToAddress2}</p>}
                <p>
                  {[billToCity, billToState, billToPostalCode].filter(Boolean).join(', ')}
                </p>
                {billToCountry && <p>{billToCountry}</p>}
                {!billToName && !billToAddress1 && (
                  <p className="text-neutral-400 italic">Fill in Ship To address first</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={billToName}
                    onChange={(e) => setBillToName(e.target.value)}
                    onBlur={() => saveField('bill_to')}
                    placeholder="Enter name"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={billToAddress1}
                    onChange={(e) => setBillToAddress1(e.target.value)}
                    onBlur={() => saveField('bill_to')}
                    placeholder="Street address"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={billToAddress2}
                    onChange={(e) => setBillToAddress2(e.target.value)}
                    onBlur={() => saveField('bill_to')}
                    placeholder="Apt, suite, unit (optional)"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">City</label>
                  <input
                    type="text"
                    value={billToCity}
                    onChange={(e) => setBillToCity(e.target.value)}
                    onBlur={() => saveField('bill_to')}
                    placeholder="Enter city"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={billToState}
                    onChange={(e) => setBillToState(e.target.value)}
                    onBlur={() => saveField('bill_to')}
                    placeholder="Enter state or province"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={billToPostalCode}
                    onChange={(e) => setBillToPostalCode(e.target.value)}
                    onBlur={() => saveField('bill_to')}
                    placeholder="Enter postal code"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Country</label>
                  <select
                    value={billToCountry}
                    onChange={(e) => {
                      setBillToCountry(e.target.value)
                      saveField('bill_to')
                    }}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  >
                    <option value="">Select country</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card className="mx-6 mt-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => saveField('notes')}
              placeholder="Write a message to the vendor..."
              rows={4}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none"
            />
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center justify-end gap-4">
            <div className="text-right">
              <p className="text-xs text-neutral-500">{purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? 's' : ''}</p>
              <p className="text-lg font-semibold text-neutral-900">{formatCurrency(subtotal)}</p>
            </div>
            <Button
              onClick={() => handleStatusChange('submitted')}
              disabled={actionLoading !== null || purchaseOrder.items.length === 0}
            >
              {actionLoading === 'status' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Order
            </Button>
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

  // Non-draft view (Submitted, Confirmed, Received, Cancelled)
  const StatusIcon = statusConfig[status]?.icon || Clock

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/purchase-orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-neutral-900">
                  {/* Prefer display_id (new format: PO-ACM01-00001), fallback to order_number */}
                  {purchaseOrder.display_id || purchaseOrder.order_number || `PO-${purchaseOrder.id.slice(0, 8)}`}
                </h1>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[status]?.bgColor} ${statusConfig[status]?.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig[status]?.label || status}
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                Created {purchaseOrder.created_at && <FormattedShortDate date={purchaseOrder.created_at} />}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {status === 'submitted' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('draft')}
                  disabled={actionLoading !== null}
                >
                  Back to Draft
                </Button>
                <Button
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'status' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Confirm Order
                </Button>
              </>
            )}

            {canReceive && (
              <Button
                onClick={handleCreateReceive}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'create-receive' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Package className="mr-2 h-4 w-4" />
                )}
                Receive Items
              </Button>
            )}

            {status === 'cancelled' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('draft')}
                disabled={actionLoading !== null}
              >
                Restore to Draft
              </Button>
            )}

            {['submitted', 'confirmed'].includes(status) && (
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={actionLoading !== null}
                className="text-red-600 hover:bg-red-50"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({purchaseOrder.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {purchaseOrder.items.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600">Item</th>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600 w-24">Part #</th>
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Ordered</th>
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Received</th>
                          <th className="px-4 py-3 text-right font-medium text-neutral-600 w-24">Unit Price</th>
                          <th className="px-4 py-3 text-right font-medium text-neutral-600 w-24">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {purchaseOrder.items.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {item.inventory_item?.image_urls?.[0] ? (
                                  <Image
                                    src={item.inventory_item.image_urls[0]}
                                    alt={item.item_name}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100">
                                    <Package className="h-5 w-5 text-neutral-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-neutral-900">{item.item_name}</p>
                                  {item.sku && (
                                    <p className="text-xs text-neutral-500">SKU: {item.sku}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-neutral-600">
                              {item.part_number || '-'}
                            </td>
                            <td className="px-4 py-3 text-center font-medium">
                              {item.ordered_quantity}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={item.received_quantity >= item.ordered_quantity ? 'text-green-600 font-medium' : ''}>
                                {item.received_quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-neutral-700">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-neutral-900">
                              {formatCurrency(item.ordered_quantity * item.unit_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-neutral-200 bg-neutral-50">
                        <tr>
                          <td colSpan={5} className="px-4 py-3 text-right font-medium text-neutral-700">
                            Subtotal:
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                            {formatCurrency(subtotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-neutral-400" />
                    <p className="mt-3 text-neutral-500">No items in this order</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {purchaseOrder.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 whitespace-pre-wrap">{purchaseOrder.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vendor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Vendor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchaseOrder.vendor ? (
                  <div className="space-y-3">
                    <p className="font-medium text-neutral-900">{purchaseOrder.vendor.name}</p>
                    {purchaseOrder.vendor.contact_name && (
                      <p className="text-sm text-neutral-600">{purchaseOrder.vendor.contact_name}</p>
                    )}
                    {purchaseOrder.vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <a href={`mailto:${purchaseOrder.vendor.email}`} className="hover:text-primary">
                          {purchaseOrder.vendor.email}
                        </a>
                      </div>
                    )}
                    {purchaseOrder.vendor.phone && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        <a href={`tel:${purchaseOrder.vendor.phone}`} className="hover:text-primary">
                          {purchaseOrder.vendor.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No vendor assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Order Number</dt>
                    <dd className="font-medium text-neutral-900">
                      {/* Prefer display_id (new format: PO-ACM01-00001), fallback to order_number */}
                      {purchaseOrder.display_id || purchaseOrder.order_number || `PO-${purchaseOrder.id.slice(0, 8)}`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Status</dt>
                    <dd className={`font-medium ${statusConfig[status]?.color}`}>
                      {statusConfig[status]?.label || status}
                    </dd>
                  </div>
                  {purchaseOrder.expected_date && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Expected Date</dt>
                      <dd className="font-medium text-neutral-900">
                        <FormattedShortDate date={purchaseOrder.expected_date} />
                      </dd>
                    </div>
                  )}
                  {purchaseOrder.submitted_at && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Submitted</dt>
                      <dd className="font-medium text-neutral-900">
                        <FormattedShortDate date={purchaseOrder.submitted_at} />
                      </dd>
                    </div>
                  )}
                  {purchaseOrder.approved_at && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Approved</dt>
                      <dd className="font-medium text-neutral-900">
                        <FormattedShortDate date={purchaseOrder.approved_at} />
                      </dd>
                    </div>
                  )}
                  {purchaseOrder.received_date && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Received Date</dt>
                      <dd className="font-medium text-green-600">
                        <FormattedShortDate date={purchaseOrder.received_date} />
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-neutral-200 pt-3">
                    <dt className="font-medium text-neutral-700">Total</dt>
                    <dd className="font-semibold text-neutral-900">
                      {formatCurrency(subtotal)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Ship To Address */}
            {purchaseOrder.ship_to_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ship To
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-neutral-700 space-y-1">
                    <p className="font-medium">{purchaseOrder.ship_to_name}</p>
                    {purchaseOrder.ship_to_address1 && <p>{purchaseOrder.ship_to_address1}</p>}
                    {purchaseOrder.ship_to_address2 && <p>{purchaseOrder.ship_to_address2}</p>}
                    <p>
                      {[
                        purchaseOrder.ship_to_city,
                        purchaseOrder.ship_to_state,
                        purchaseOrder.ship_to_postal_code
                      ].filter(Boolean).join(', ')}
                    </p>
                    {purchaseOrder.ship_to_country && <p>{purchaseOrder.ship_to_country}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bill To Address */}
            {purchaseOrder.bill_to_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bill To
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-neutral-700 space-y-1">
                    <p className="font-medium">{purchaseOrder.bill_to_name}</p>
                    {purchaseOrder.bill_to_address1 && <p>{purchaseOrder.bill_to_address1}</p>}
                    {purchaseOrder.bill_to_address2 && <p>{purchaseOrder.bill_to_address2}</p>}
                    <p>
                      {[
                        purchaseOrder.bill_to_city,
                        purchaseOrder.bill_to_state,
                        purchaseOrder.bill_to_postal_code
                      ].filter(Boolean).join(', ')}
                    </p>
                    {purchaseOrder.bill_to_country && <p>{purchaseOrder.bill_to_country}</p>}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Chatter Panel */}
        {currentUserId && (
          <ChatterPanel
            entityType="purchase_order"
            entityId={purchaseOrder.id}
            entityName={purchaseOrder.display_id || purchaseOrder.order_number || `PO ${purchaseOrder.id.slice(0, 8)}`}
            currentUserId={currentUserId}
            className="mt-6"
          />
        )}
      </div>
    </div>
  )
}
