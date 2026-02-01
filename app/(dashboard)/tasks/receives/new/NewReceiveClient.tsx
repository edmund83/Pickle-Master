'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Loader2,
  RotateCcw,
  Settings2,
  Calendar,
  Truck,
  MapPin,
  Search,
  Plus,
  Minus,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import {
  createStandaloneReceive,
  addStandaloneReceiveItem,
  searchInventoryItemsForReceive,
  type ReceiveSourceType,
  type ReturnReason
} from '@/app/actions/receives'

interface Location {
  id: string
  name: string
  type: string
}

interface NewReceiveClientProps {
  locations: Location[]
}

// Pending item to be added when receive is created
interface PendingItem {
  id: string // temp ID for list key
  item_id: string
  item_name: string
  item_sku: string | null
  item_image: string | null
  tracking_mode: string | null
  quantity_received: number
  return_reason: ReturnReason | ''
  condition: 'good' | 'damaged' | 'rejected'
}

const sourceTypeOptions: { value: ReceiveSourceType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'customer_return',
    label: 'Customer Return',
    description: 'Items returned by customers',
    icon: <RotateCcw className="h-5 w-5" />,
  },
  {
    value: 'stock_adjustment',
    label: 'Stock Adjustment',
    description: 'Manual stock corrections',
    icon: <Settings2 className="h-5 w-5" />,
  },
]

const returnReasonOptions: { value: ReturnReason; label: string }[] = [
  { value: 'defective', label: 'Defective' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'damaged_in_transit', label: 'Damaged in Transit' },
  { value: 'other', label: 'Other' },
]

export function NewReceiveClient({ locations }: NewReceiveClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state - matching detail page fields
  const [sourceType, setSourceType] = useState<ReceiveSourceType>('customer_return')
  const [notes, setNotes] = useState('')
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0])
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('')
  const [carrier, setCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [defaultLocationId, setDefaultLocationId] = useState('')

  // Items state
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])

  // Item search state
  const [itemSearch, setItemSearch] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{
    id: string
    name: string
    sku: string | null
    quantity: number
    image_url: string | null
    tracking_mode: string | null
  }>>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Search for items using server action
  async function handleItemSearch(query: string) {
    setItemSearch(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const results = await searchInventoryItemsForReceive(query)
      setSearchResults(results)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  // Add item to pending list
  function handleAddItem(item: typeof searchResults[0]) {
    const newItem: PendingItem = {
      id: crypto.randomUUID(), // temp ID for list key
      item_id: item.id,
      item_name: item.name,
      item_sku: item.sku,
      item_image: item.image_url,
      tracking_mode: item.tracking_mode,
      quantity_received: 1,
      return_reason: sourceType === 'customer_return' ? 'defective' : '',
      condition: 'good',
    }
    setPendingItems(prev => [...prev, newItem])
    setItemSearch('')
    setSearchResults([])
  }

  // Update item quantity
  function handleUpdateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return
    setPendingItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity_received: newQuantity } : item
      )
    )
  }

  // Update item return reason
  function handleUpdateReason(itemId: string, reason: ReturnReason | '') {
    setPendingItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, return_reason: reason } : item
      )
    )
  }

  // Update item condition
  function handleUpdateCondition(itemId: string, condition: 'good' | 'damaged' | 'rejected') {
    setPendingItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, condition } : item
      )
    )
  }

  // Remove item from pending list
  function handleRemoveItem(itemId: string) {
    setPendingItems(prev => prev.filter(item => item.id !== itemId))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    // Validation for customer returns
    if (sourceType === 'customer_return') {
      if (pendingItems.length === 0) {
        setError('Add at least one item to this return')
        setIsSubmitting(false)
        return
      }
      const missingReason = pendingItems.find(item => !item.return_reason)
      if (missingReason) {
        setError(`Return reason is required for "${missingReason.item_name}"`)
        setIsSubmitting(false)
        return
      }
    }

    try {
      // 1. Create the receive
      const createResult = await createStandaloneReceive({
        source_type: sourceType,
        notes: notes || null,
        default_location_id: defaultLocationId || null,
        received_date: receivedDate || null,
        delivery_note_number: deliveryNoteNumber || null,
        carrier: carrier || null,
        tracking_number: trackingNumber || null,
      })

      if (!createResult.success) {
        setError(createResult.error || 'Failed to create receive')
        setIsSubmitting(false)
        return
      }

      // 2. Add items one by one
      for (const item of pendingItems) {
        const addResult = await addStandaloneReceiveItem(createResult.receive_id!, {
          item_id: item.item_id,
          quantity_received: item.quantity_received,
          return_reason: item.return_reason || undefined,
          condition: item.condition,
          location_id: defaultLocationId || undefined,
        })
        if (!addResult.success) {
          // Log but continue - user can fix on detail page
          console.error('Failed to add item:', addResult.error)
        }
      }

      // 3. Redirect to the new receive detail page
      router.push(`/tasks/receives/${createResult.receive_id}`)
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
      setIsSubmitting(false)
    }
  }

  const SourceIcon = sourceType === 'customer_return' ? RotateCcw : Settings2
  const totalQuantity = pendingItems.reduce((sum, item) => sum + item.quantity_received, 0)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/receives">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">New Receive</h1>
              <p className="text-sm text-neutral-500">Create a standalone receive for returns or adjustments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/tasks/receives">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Receive
            </Button>
          </div>
        </div>
      </div>

      {/* Error message at top */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Receive Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Receive Type
                </CardTitle>
                <CardDescription>
                  Select the type of receive.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sourceTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSourceType(option.value)
                        // Reset return reasons when switching types
                        if (option.value !== 'customer_return') {
                          setPendingItems(prev =>
                            prev.map(item => ({ ...item, return_reason: '' }))
                          )
                        } else {
                          setPendingItems(prev =>
                            prev.map(item => ({ ...item, return_reason: item.return_reason || 'defective' }))
                          )
                        }
                      }}
                      className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                        sourceType === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className={`rounded-lg p-2 ${
                        sourceType === option.value
                          ? 'bg-primary/10 text-primary'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {option.icon}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{option.label}</div>
                        <div className="text-sm text-neutral-500">{option.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Items to Receive */}
            <Card>
              <CardHeader>
                <CardTitle>Items to Receive ({pendingItems.length})</CardTitle>
                <CardDescription>
                  {sourceType === 'customer_return'
                    ? 'Add items being returned. Return reason is required for each item.'
                    : 'Add items to adjust. You can also add more items after creating.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Item Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => handleItemSearch(e.target.value)}
                    placeholder="Search items by name or SKU..."
                    className="pl-9"
                  />

                  {/* Search Results Dropdown */}
                  {(searchLoading || searchResults.length > 0) && itemSearch.length >= 2 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg max-h-64 overflow-y-auto">
                      {searchLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-neutral-100">
                          {searchResults.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleAddItem(item)}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 text-left"
                            >
                              <ItemThumbnail
                                src={item.image_url}
                                alt={item.name}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-neutral-900 truncate">{item.name}</p>
                                <p className="text-xs text-neutral-500">
                                  {item.sku && `SKU: ${item.sku} • `}
                                  Stock: {item.quantity}
                                </p>
                              </div>
                              <Plus className="h-4 w-4 text-neutral-400" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-500 py-4 text-center">
                          No items found
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Items Table */}
                {pendingItems.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600">Item</th>
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-32">Qty</th>
                          {sourceType === 'customer_return' && (
                            <th className="px-4 py-3 text-left font-medium text-neutral-600 w-40">Reason</th>
                          )}
                          <th className="px-4 py-3 text-left font-medium text-neutral-600 w-32">Condition</th>
                          <th className="px-4 py-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {pendingItems.map((item) => (
                          <tr key={item.id} className="hover:bg-neutral-50">
                            {/* Item cell */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <ItemThumbnail
                                  src={item.item_image}
                                  alt={item.item_name}
                                  size="md"
                                />
                                <div>
                                  <p className="font-medium text-neutral-900">{item.item_name}</p>
                                  {item.item_sku && (
                                    <p className="text-xs text-neutral-500">SKU: {item.item_sku}</p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Quantity */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity_received - 1)}
                                  disabled={item.quantity_received <= 1}
                                  className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity_received}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1
                                    if (val > 0) handleUpdateQuantity(item.id, val)
                                  }}
                                  className="w-12 text-center rounded-lg border border-neutral-200 py-1 text-sm focus:border-neutral-400 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity_received + 1)}
                                  className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </td>

                            {/* Return Reason (customer returns only) */}
                            {sourceType === 'customer_return' && (
                              <td className="px-4 py-3">
                                <select
                                  value={item.return_reason}
                                  onChange={(e) => handleUpdateReason(item.id, e.target.value as ReturnReason)}
                                  className={`w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none ${
                                    !item.return_reason
                                      ? 'border-red-300 bg-red-50'
                                      : 'border-neutral-200 focus:border-neutral-400'
                                  }`}
                                >
                                  <option value="">Select...</option>
                                  {returnReasonOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </td>
                            )}

                            {/* Condition */}
                            <td className="px-4 py-3">
                              <select
                                value={item.condition}
                                onChange={(e) => handleUpdateCondition(item.id, e.target.value as 'good' | 'damaged' | 'rejected')}
                                className="w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-sm focus:border-neutral-400 focus:outline-none"
                              >
                                <option value="good">Good</option>
                                <option value="damaged">Damaged</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>

                            {/* Remove */}
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-neutral-200 bg-neutral-50">
                        <tr>
                          <td colSpan={sourceType === 'customer_return' ? 5 : 4} className="px-4 py-3 text-right font-medium text-neutral-700">
                            Total: {pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''}, {totalQuantity} units
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-neutral-400" />
                    <p className="mt-3 text-neutral-500">No items added yet</p>
                    <p className="mt-1 text-sm text-neutral-400">
                      Search above to add items to this receive
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add receiving notes..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-neutral-400 focus:outline-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Receive Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Receive Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  {/* Received Date */}
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Received Date</dt>
                    <dd className="font-medium text-neutral-900">
                      <input
                        type="date"
                        value={receivedDate}
                        onChange={(e) => setReceivedDate(e.target.value)}
                        className="rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                      />
                    </dd>
                  </div>

                  {/* Delivery Note */}
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Delivery Note #</dt>
                    <dd className="font-medium text-neutral-900">
                      <input
                        type="text"
                        value={deliveryNoteNumber}
                        onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                        placeholder="—"
                        className="w-32 text-right rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                      />
                    </dd>
                  </div>

                  {/* Carrier */}
                  <div className="flex justify-between">
                    <dt className="text-neutral-500 flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Carrier
                    </dt>
                    <dd className="font-medium text-neutral-900">
                      <input
                        type="text"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        placeholder="—"
                        className="w-32 text-right rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                      />
                    </dd>
                  </div>

                  {/* Tracking Number */}
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Tracking #</dt>
                    <dd className="font-medium text-neutral-900">
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="—"
                        className="w-32 text-right rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                      />
                    </dd>
                  </div>

                  {/* Default Location */}
                  <div className="flex justify-between">
                    <dt className="text-neutral-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </dt>
                    <dd className="font-medium text-neutral-900">
                      <select
                        value={defaultLocationId}
                        onChange={(e) => setDefaultLocationId(e.target.value)}
                        className="w-32 text-right rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                      >
                        <option value="">Select...</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Receive Type Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SourceIcon className="h-4 w-4" />
                  Receive Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${
                    sourceType === 'customer_return'
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <SourceIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">
                      {sourceType === 'customer_return' ? 'Customer Return' : 'Stock Adjustment'}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {sourceType === 'customer_return'
                        ? 'Items returned by customers'
                        : 'Manual stock corrections'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900">What happens next?</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      {sourceType === 'customer_return'
                        ? 'After creating, you can add more items or complete the receive to update stock levels.'
                        : 'After creating, you can add items from your inventory. Complete the receive to update stock levels.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
