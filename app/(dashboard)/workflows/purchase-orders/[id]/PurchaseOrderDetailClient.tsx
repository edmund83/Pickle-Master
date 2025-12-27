'use client'

import { useState } from 'react'
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
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import {
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
  addPurchaseOrderItem,
  removePurchaseOrderItem,
  updatePurchaseOrderItem,
  searchInventoryItemsForPO
} from '@/app/actions/purchase-orders'
import type { PurchaseOrderWithDetails } from './page'

interface PurchaseOrderDetailClientProps {
  purchaseOrder: PurchaseOrderWithDetails
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  draft: { icon: Clock, color: 'text-neutral-600', bgColor: 'bg-neutral-100', label: 'Draft' },
  submitted: { icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Submitted' },
  confirmed: { icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Confirmed' },
  partial: { icon: Truck, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Partially Received' },
  received: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Received' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' },
}

export function PurchaseOrderDetailClient({ purchaseOrder }: PurchaseOrderDetailClientProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add item state
  const [showAddItem, setShowAddItem] = useState(false)
  const [itemSearchQuery, setItemSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    id: string
    name: string
    sku: string | null
    quantity: number
    image_urls: string[] | null
    unit: string | null
    price: number | null
  }>>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const status = purchaseOrder.status || 'draft'
  const StatusIcon = statusConfig[status]?.icon || Clock
  const isDraft = status === 'draft'
  const canReceive = ['submitted', 'confirmed', 'partial'].includes(status)

  // Calculate totals
  const subtotal = purchaseOrder.items.reduce(
    (sum, item) => sum + (item.ordered_quantity * item.unit_price),
    0
  )

  async function handleStatusChange(newStatus: string) {
    setUpdating(true)
    setError(null)

    const result = await updatePurchaseOrderStatus(purchaseOrder.id, newStatus)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to update status')
    }

    setUpdating(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this purchase order?')) return

    setDeleting(true)
    setError(null)

    const result = await deletePurchaseOrder(purchaseOrder.id)

    if (result.success) {
      router.push('/workflows/purchase-orders')
    } else {
      setError(result.error || 'Failed to delete purchase order')
      setDeleting(false)
    }
  }

  async function handleSearch(query: string) {
    setItemSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const results = await searchInventoryItemsForPO(query)
      // Filter out items already in the PO
      const existingIds = new Set(purchaseOrder.items.filter(i => i.item_id).map(i => i.item_id))
      setSearchResults(results.filter((item: { id: string }) => !existingIds.has(item.id)))
    } catch {
      console.error('Search error')
    } finally {
      setSearchLoading(false)
    }
  }

  async function handleAddItem(item: { id: string; name: string; sku: string | null; price: number | null }) {
    const result = await addPurchaseOrderItem(purchaseOrder.id, {
      item_id: item.id,
      item_name: item.name,
      sku: item.sku,
      ordered_quantity: 1,
      unit_price: item.price || 0
    })

    if (result.success) {
      router.refresh()
      setShowAddItem(false)
      setItemSearchQuery('')
      setSearchResults([])
    } else {
      setError(result.error || 'Failed to add item')
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!confirm('Remove this item from the purchase order?')) return

    const result = await removePurchaseOrderItem(itemId)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to remove item')
    }
  }

  async function handleUpdateItemQuantity(itemId: string, quantity: number) {
    const result = await updatePurchaseOrderItem(itemId, { ordered_quantity: quantity })

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to update item')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/workflows/purchase-orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-neutral-900">
                  {purchaseOrder.order_number || `PO-${purchaseOrder.id.slice(0, 8)}`}
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
            {isDraft && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-600 hover:bg-red-50"
                >
                  {deleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
                <Button
                  onClick={() => handleStatusChange('submitted')}
                  disabled={updating || purchaseOrder.items.length === 0}
                >
                  {updating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit Order
                </Button>
              </>
            )}

            {status === 'submitted' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('draft')}
                  disabled={updating}
                >
                  Back to Draft
                </Button>
                <Button
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={updating}
                >
                  {updating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Confirm Order
                </Button>
              </>
            )}

            {canReceive && (
              <Link href="/workflows/receives">
                <Button>
                  <Package className="mr-2 h-4 w-4" />
                  Receive Items
                </Button>
              </Link>
            )}

            {status === 'cancelled' && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('draft')}
                disabled={updating}
              >
                Restore to Draft
              </Button>
            )}

            {['draft', 'submitted', 'confirmed'].includes(status) && (
              <Button
                variant="ghost"
                onClick={() => handleStatusChange('cancelled')}
                disabled={updating}
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Items ({purchaseOrder.items.length})</CardTitle>
                {isDraft && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddItem(!showAddItem)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Item
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {/* Add Item Search */}
                {showAddItem && isDraft && (
                  <div className="mb-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <input
                      type="text"
                      value={itemSearchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search items by name or SKU..."
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                      autoFocus
                    />
                    {searchLoading && (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                      </div>
                    )}
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                        {searchResults.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleAddItem(item)}
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
                                {item.sku && `SKU: ${item.sku}`}
                              </p>
                            </div>
                            <Plus className="h-4 w-4 text-pickle-600" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
                          {isDraft && <th className="px-4 py-3 w-10"></th>}
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
                            <td className="px-4 py-3 text-center">
                              {isDraft ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleUpdateItemQuantity(item.id, Math.max(1, item.ordered_quantity - 1))}
                                    disabled={item.ordered_quantity <= 1}
                                    className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-50"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="w-8 text-center font-medium">{item.ordered_quantity}</span>
                                  <button
                                    onClick={() => handleUpdateItemQuantity(item.id, item.ordered_quantity + 1)}
                                    className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="font-medium">{item.ordered_quantity}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={item.received_quantity >= item.ordered_quantity ? 'text-green-600 font-medium' : ''}>
                                {item.received_quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-neutral-700">
                              ${item.unit_price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-neutral-900">
                              ${(item.ordered_quantity * item.unit_price).toFixed(2)}
                            </td>
                            {isDraft && (
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-neutral-200 bg-neutral-50">
                        <tr>
                          <td colSpan={isDraft ? 4 : 3} className="px-4 py-3 text-right font-medium text-neutral-700">
                            Subtotal:
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                            ${subtotal.toFixed(2)}
                          </td>
                          {isDraft && <td></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-neutral-400" />
                    <p className="mt-3 text-neutral-500">No items in this order</p>
                    {isDraft && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowAddItem(true)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Item
                      </Button>
                    )}
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
                        <a href={`mailto:${purchaseOrder.vendor.email}`} className="hover:text-pickle-600">
                          {purchaseOrder.vendor.email}
                        </a>
                      </div>
                    )}
                    {purchaseOrder.vendor.phone && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        <a href={`tel:${purchaseOrder.vendor.phone}`} className="hover:text-pickle-600">
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
                      {purchaseOrder.order_number || `PO-${purchaseOrder.id.slice(0, 8)}`}
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
                      ${subtotal.toFixed(2)}
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
      </div>
    </div>
  )
}
