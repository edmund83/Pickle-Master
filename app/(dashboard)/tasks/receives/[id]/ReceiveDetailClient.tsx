'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  Trash2,
  Loader2,
  MapPin,
  FileText,
  AlertTriangle,
  Minus,
  Plus,
  Pencil,
  X,
  Tag,
  Barcode,
  List,
  Search,
  RotateCcw,
  Settings2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import {
  updateReceiveItem,
  removeReceiveItem,
  completeReceive,
  cancelReceive,
  updateReceive,
  addReceiveItemSerial,
  removeReceiveItemSerial,
  bulkAddReceiveItemSerials,
  addStandaloneReceiveItem,
  type ReceiveWithDetails,
  type ReceiveItemWithDetails,
  type ReceiveItemSerial,
  type ReturnReason
} from '@/app/actions/receives'
import { Input } from '@/components/ui/input'
import type { Location } from './page'
import { ChatterPanel } from '@/components/chatter'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'

interface ReceiveDetailClientProps {
  receive: ReceiveWithDetails
  locations: Location[]
  currentUserId: string
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  draft: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Draft' },
  completed: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' },
}

const sourceTypeConfig: Record<string, { icon: React.ElementType; label: string; description: string }> = {
  purchase_order: { icon: FileText, label: 'Purchase Order', description: 'From PO' },
  customer_return: { icon: RotateCcw, label: 'Customer Return', description: 'Customer return' },
  stock_adjustment: { icon: Settings2, label: 'Stock Adjustment', description: 'Stock adjustment' },
}

const returnReasonLabels: Record<ReturnReason, string> = {
  defective: 'Defective',
  wrong_item: 'Wrong Item',
  changed_mind: 'Changed Mind',
  damaged_in_transit: 'Damaged in Transit',
  other: 'Other',
}

export function ReceiveDetailClient({
  receive,
  locations,
  currentUserId
}: ReceiveDetailClientProps) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form state for draft mode
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState(receive.delivery_note_number || '')
  const [carrier, setCarrier] = useState(receive.carrier || '')
  const [trackingNumber, setTrackingNumber] = useState(receive.tracking_number || '')
  const [defaultLocationId, setDefaultLocationId] = useState(receive.default_location_id || '')
  const [receivedDate, setReceivedDate] = useState(receive.received_date || new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState(receive.notes || '')

  // Items state
  const [items, setItems] = useState<ReceiveItemWithDetails[]>(receive.items)

  // Edit item modal state (for lot-tracked or non-tracked items)
  const [editingItem, setEditingItem] = useState<ReceiveItemWithDetails | null>(null)
  const [editForm, setEditForm] = useState({
    quantity_received: 0,
    return_reason: '' as ReturnReason | '',
    lot_number: '',
    batch_code: '',
    expiry_date: '',
    location_id: '',
    condition: 'good' as 'good' | 'damaged' | 'rejected'
  })

  // Serial entry modal state (for serialized items)
  const [serialEditItem, setSerialEditItem] = useState<ReceiveItemWithDetails | null>(null)
  const [serials, setSerials] = useState<ReceiveItemSerial[]>([])
  const [serialInput, setSerialInput] = useState('')
  const [serialError, setSerialError] = useState<string | null>(null)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkInput, setBulkInput] = useState('')
  const [serialSaving, setSerialSaving] = useState(false)
  const [serialForm, setSerialForm] = useState({
    location_id: '',
    condition: 'good' as 'good' | 'damaged' | 'rejected',
    expiry_date: ''
  })
  const serialInputRef = useRef<HTMLInputElement>(null)

  // Add Item modal state (for standalone receives)
  const [showAddItemModal, setShowAddItemModal] = useState(false)
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
  const [selectedItem, setSelectedItem] = useState<{
    id: string
    name: string
    sku: string | null
    image_url: string | null
    tracking_mode: string | null
  } | null>(null)
  const [addItemForm, setAddItemForm] = useState({
    quantity_received: 1,
    return_reason: '' as ReturnReason | '',
    lot_number: '',
    batch_code: '',
    expiry_date: '',
    location_id: '',
    condition: 'good' as 'good' | 'damaged' | 'rejected',
    notes: ''
  })
  const [addItemLoading, setAddItemLoading] = useState(false)

  const status = receive.status
  const isDraft = status === 'draft'
  const isStandalone = receive.source_type !== 'purchase_order'
  const StatusIcon = statusConfig[status]?.icon || Clock
  const SourceIcon = sourceTypeConfig[receive.source_type]?.icon || Package

  // Calculate totals
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity_received, 0)

  // Save field on blur
  async function saveField() {
    if (!isDraft) return

    try {
      await updateReceive(receive.id, {
        delivery_note_number: deliveryNoteNumber || null,
        carrier: carrier || null,
        tracking_number: trackingNumber || null,
        default_location_id: defaultLocationId || null,
        received_date: receivedDate || null,
        notes: notes || null
      })
    } catch (err) {
      console.error('Save error:', err)
    }
  }

  // Remove item from receive
  async function handleRemoveItem(itemId: string) {
    if (!isDraft) return

    setActionLoading(`remove-${itemId}`)
    setError(null)

    const result = await removeReceiveItem(itemId)

    setActionLoading(null)

    if (!result.success) {
      setError(result.error || 'Failed to remove item')
      return
    }

    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Update item quantity
  async function handleUpdateItemQuantity(itemId: string, newQuantity: number) {
    if (!isDraft || newQuantity <= 0) return

    setActionLoading(`update-${itemId}`)

    const result = await updateReceiveItem(itemId, { quantity_received: newQuantity })

    setActionLoading(null)

    if (result.success) {
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity_received: newQuantity } : item
      ))
    }
  }

  // Open edit modal for an item - routes to appropriate modal based on tracking_mode
  function openEditModal(item: ReceiveItemWithDetails) {
    if (item.item_tracking_mode === 'serialized') {
      // Open serial entry modal for serialized items
      setSerialEditItem(item)
      setSerials(item.serials || [])
      setSerialInput('')
      setSerialError(null)
      setBulkMode(false)
      setBulkInput('')
      setSerialForm({
        location_id: item.location_id || '',
        condition: (item.condition as 'good' | 'damaged' | 'rejected') || 'good',
        expiry_date: item.expiry_date || ''
      })
    } else {
      // Open lot/batch modal for lot-tracked or non-tracked items
      setEditingItem(item)
      setEditForm({
        quantity_received: item.quantity_received,
        return_reason: item.return_reason || '',
        lot_number: item.lot_number || '',
        batch_code: item.batch_code || '',
        expiry_date: item.expiry_date || '',
        location_id: item.location_id || '',
        condition: (item.condition as 'good' | 'damaged' | 'rejected') || 'good'
      })
    }
  }

  // Focus serial input when modal opens
  useEffect(() => {
    if (serialEditItem && !bulkMode && serialInputRef.current) {
      serialInputRef.current.focus()
    }
  }, [serialEditItem, bulkMode])

  // Add a single serial number
  async function handleAddSerial() {
    if (!serialEditItem || !serialInput.trim()) return

    const trimmed = serialInput.trim()

    // Check for local duplicate
    if (serials.some(s => s.serial_number === trimmed)) {
      setSerialError('This serial number is already in the list')
      return
    }

    setSerialSaving(true)
    setSerialError(null)

    const result = await addReceiveItemSerial(serialEditItem.id, trimmed)

    setSerialSaving(false)

    if (!result.success) {
      setSerialError(result.error || 'Failed to add serial number')
      return
    }

    if (result.serial) {
      setSerials(prev => [...prev, result.serial!])
      setSerialInput('')
      // Update item quantity to match serial count
      await updateReceiveItem(serialEditItem.id, { quantity_received: serials.length + 1 })
      setItems(prev => prev.map(item =>
        item.id === serialEditItem.id
          ? { ...item, quantity_received: serials.length + 1, serials: [...(item.serials || []), result.serial!] }
          : item
      ))
    }

    // Re-focus input for next scan
    serialInputRef.current?.focus()
  }

  // Handle enter key for serial input
  function handleSerialKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSerial()
    }
  }

  // Remove a serial number
  async function handleRemoveSerial(serialId: string) {
    setSerialSaving(true)
    setSerialError(null)

    const result = await removeReceiveItemSerial(serialId)

    setSerialSaving(false)

    if (!result.success) {
      setSerialError(result.error || 'Failed to remove serial number')
      return
    }

    const newSerials = serials.filter(s => s.id !== serialId)
    setSerials(newSerials)

    // Update item quantity to match serial count
    if (serialEditItem) {
      await updateReceiveItem(serialEditItem.id, { quantity_received: Math.max(1, newSerials.length) })
      setItems(prev => prev.map(item =>
        item.id === serialEditItem.id
          ? { ...item, quantity_received: Math.max(1, newSerials.length), serials: newSerials }
          : item
      ))
    }
  }

  // Parse and add bulk serials
  async function handleBulkAdd() {
    if (!serialEditItem || !bulkInput.trim()) return

    // Parse input - split by newlines, commas, or tabs
    const parsed = bulkInput
      .split(/[\n,\t]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)

    if (parsed.length === 0) {
      setSerialError('No valid serial numbers found')
      return
    }

    setSerialSaving(true)
    setSerialError(null)

    const result = await bulkAddReceiveItemSerials(serialEditItem.id, parsed)

    setSerialSaving(false)

    if (!result.success && result.added === 0) {
      setSerialError(result.error || 'Failed to add serial numbers')
      return
    }

    // Refresh serials list
    const updatedItem = items.find(i => i.id === serialEditItem.id)
    const newSerialCount = serials.length + result.added

    // Fetch fresh serials (since we don't have the IDs from bulk add)
    // For now, switch back to scan mode and let user see the updated count
    setBulkMode(false)
    setBulkInput('')

    if (result.duplicates.length > 0) {
      setSerialError(`Added ${result.added} serials. Skipped duplicates: ${result.duplicates.slice(0, 3).join(', ')}${result.duplicates.length > 3 ? '...' : ''}`)
    }

    // Update quantity
    await updateReceiveItem(serialEditItem.id, { quantity_received: newSerialCount })
    setItems(prev => prev.map(item =>
      item.id === serialEditItem.id
        ? { ...item, quantity_received: newSerialCount }
        : item
    ))

    // Close and reopen to refresh serials
    router.refresh()
  }

  // Save serial modal (additional fields like location, condition)
  async function handleSaveSerialModal() {
    if (!serialEditItem) return

    setSerialSaving(true)
    setSerialError(null)

    const result = await updateReceiveItem(serialEditItem.id, {
      quantity_received: serials.length,
      location_id: serialForm.location_id || null,
      condition: serialForm.condition,
      expiry_date: serialForm.expiry_date || null
    })

    setSerialSaving(false)

    if (!result.success) {
      setSerialError(result.error || 'Failed to save')
      return
    }

    // Update local state
    const locationName = locations.find(l => l.id === serialForm.location_id)?.name || null
    setItems(prev => prev.map(item =>
      item.id === serialEditItem.id
        ? {
            ...item,
            quantity_received: serials.length,
            location_id: serialForm.location_id || null,
            location_name: locationName,
            condition: serialForm.condition,
            expiry_date: serialForm.expiry_date || null,
            serials
          }
        : item
    ))

    setSerialEditItem(null)
  }

  // Save item from edit modal
  async function handleSaveItem() {
    if (!editingItem) return

    setActionLoading('save-item')
    setError(null)

    const result = await updateReceiveItem(editingItem.id, {
      quantity_received: editForm.quantity_received,
      lot_number: editForm.lot_number || null,
      batch_code: editForm.batch_code || null,
      expiry_date: editForm.expiry_date || null,
      location_id: editForm.location_id || null,
      condition: editForm.condition
    })

    setActionLoading(null)

    if (!result.success) {
      setError(result.error || 'Failed to update item')
      return
    }

    // Update local state with the new values
    const locationName = locations.find(l => l.id === editForm.location_id)?.name || null
    setItems(prev => prev.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            quantity_received: editForm.quantity_received,
            lot_number: editForm.lot_number || null,
            batch_code: editForm.batch_code || null,
            expiry_date: editForm.expiry_date || null,
            location_id: editForm.location_id || null,
            location_name: locationName,
            condition: editForm.condition
          }
        : item
    ))
    setEditingItem(null)
  }

  // Complete receive
  async function handleComplete() {
    if (!isDraft || items.length === 0) return

    setActionLoading('complete')
    setError(null)

    const result = await completeReceive(receive.id)

    setActionLoading(null)

    if (!result.success) {
      setError(result.error || 'Failed to complete receive')
      return
    }

    setSuccessMessage(
      `Receive completed! ${result.items_processed} items processed` +
      (result.lots_created ? `, ${result.lots_created} lots created` : '') +
      (result.po_fully_received ? '. PO fully received!' : '')
    )

    setTimeout(() => router.refresh(), 1500)
  }

  // Cancel receive
  async function handleCancel() {
    if (!isDraft) return

    if (!confirm('Are you sure you want to cancel this receive?')) return

    setActionLoading('cancel')
    setError(null)

    const result = await cancelReceive(receive.id)

    setActionLoading(null)

    if (!result.success) {
      setError(result.error || 'Failed to cancel receive')
      return
    }

    router.refresh()
  }

  // Search for items (for standalone receives)
  async function handleItemSearch(query: string) {
    setItemSearch(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, sku, quantity, image_url, tracking_mode')
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(10)

      if (!error && data) {
        setSearchResults(data)
      }
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  // Select an item from search results
  function handleSelectItem(item: typeof searchResults[0]) {
    setSelectedItem({
      id: item.id,
      name: item.name,
      sku: item.sku,
      image_url: item.image_url,
      tracking_mode: item.tracking_mode
    })
    setItemSearch('')
    setSearchResults([])
    // Reset form for the new item
    setAddItemForm({
      quantity_received: 1,
      return_reason: receive.source_type === 'customer_return' ? 'defective' : '',
      lot_number: '',
      batch_code: '',
      expiry_date: '',
      location_id: defaultLocationId || '',
      condition: 'good',
      notes: ''
    })
  }

  // Add item to standalone receive
  async function handleAddItem() {
    if (!selectedItem) return

    // Validate return reason for customer returns
    if (receive.source_type === 'customer_return' && !addItemForm.return_reason) {
      setError('Return reason is required for customer returns')
      return
    }

    setAddItemLoading(true)
    setError(null)

    const result = await addStandaloneReceiveItem(receive.id, {
      item_id: selectedItem.id,
      quantity_received: addItemForm.quantity_received,
      return_reason: addItemForm.return_reason as ReturnReason || undefined,
      lot_number: addItemForm.lot_number || undefined,
      batch_code: addItemForm.batch_code || undefined,
      expiry_date: addItemForm.expiry_date || undefined,
      location_id: addItemForm.location_id || undefined,
      condition: addItemForm.condition,
      notes: addItemForm.notes || undefined
    })

    setAddItemLoading(false)

    if (!result.success) {
      setError(result.error || 'Failed to add item')
      return
    }

    // Close modal and refresh to get updated items
    setShowAddItemModal(false)
    setSelectedItem(null)
    router.refresh()
  }

  // Reset add item modal
  function closeAddItemModal() {
    setShowAddItemModal(false)
    setSelectedItem(null)
    setItemSearch('')
    setSearchResults([])
    setAddItemForm({
      quantity_received: 1,
      return_reason: '',
      lot_number: '',
      batch_code: '',
      expiry_date: '',
      location_id: '',
      condition: 'good',
      notes: ''
    })
  }

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
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-neutral-900">
                  {receive.display_id || 'Receive'}
                </h1>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[status]?.bgColor} ${statusConfig[status]?.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig[status]?.label || status}
                </span>
                {isStandalone && (
                  <span className="flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-600">
                    <SourceIcon className="h-3.5 w-3.5" />
                    {sourceTypeConfig[receive.source_type]?.label}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500">
                {receive.purchase_order ? (
                  <>
                    from {receive.purchase_order.display_id || receive.purchase_order.order_number}
                    {receive.purchase_order.vendor_name && ` • ${receive.purchase_order.vendor_name}`}
                  </>
                ) : (
                  sourceTypeConfig[receive.source_type]?.description || 'Standalone receive'
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isDraft && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'cancel' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Cancel
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={actionLoading !== null || items.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading === 'complete' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Complete Receive
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Items Table */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Items to Receive ({items.length})</CardTitle>
                {isDraft && isStandalone && (
                  <Button
                    size="sm"
                    onClick={() => setShowAddItemModal(true)}
                    disabled={actionLoading !== null}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {items.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600">Item</th>
                          {!isStandalone && (
                            <>
                              <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Ordered</th>
                              <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Already Rcvd</th>
                            </>
                          )}
                          {isStandalone && receive.source_type === 'customer_return' && (
                            <th className="px-4 py-3 text-left font-medium text-neutral-600 w-32">Reason</th>
                          )}
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-32">Receiving</th>
                          {isDraft && <th className="px-4 py-3 w-12"></th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {items.map((item) => (
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
                                  {/* Lot/Batch indicator */}
                                  {(item.lot_number || item.batch_code) && (
                                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-0.5">
                                      <Tag className="h-3 w-3" />
                                      {item.lot_number || item.batch_code}
                                    </span>
                                  )}
                                  {/* Serial indicator for serialized items */}
                                  {item.item_tracking_mode === 'serialized' && (
                                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-0.5">
                                      <Barcode className="h-3 w-3" />
                                      {item.serials?.length || 0} serial{(item.serials?.length || 0) !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Ordered (PO-linked only) */}
                            {!isStandalone && (
                              <>
                                <td className="px-4 py-3 text-center font-medium">
                                  {item.ordered_quantity}
                                </td>

                                {/* Already Received */}
                                <td className="px-4 py-3 text-center">
                                  {item.already_received}
                                </td>
                              </>
                            )}

                            {/* Return Reason (Customer returns only) */}
                            {isStandalone && receive.source_type === 'customer_return' && (
                              <td className="px-4 py-3">
                                {item.return_reason ? (
                                  <span className="text-sm text-neutral-700">
                                    {returnReasonLabels[item.return_reason] || item.return_reason}
                                  </span>
                                ) : (
                                  <span className="text-neutral-400">—</span>
                                )}
                              </td>
                            )}

                            {/* Receiving Quantity */}
                            <td className="px-4 py-3">
                              {isDraft ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity_received - 1)}
                                    disabled={item.quantity_received <= 1 || actionLoading !== null}
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
                                      if (val > 0) {
                                        handleUpdateItemQuantity(item.id, val)
                                      }
                                    }}
                                    className="w-12 text-center rounded-lg border border-neutral-200 py-1 text-sm focus:border-neutral-400 focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleUpdateItemQuantity(item.id, item.quantity_received + 1)}
                                    disabled={actionLoading !== null}
                                    className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="font-medium text-center block">{item.quantity_received}</span>
                              )}
                            </td>

                            {/* Actions: Edit & Delete */}
                            {isDraft && (
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    disabled={actionLoading !== null}
                                    className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded disabled:opacity-50"
                                    title="Edit item details"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    disabled={actionLoading !== null}
                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                                    title="Remove item"
                                  >
                                    {actionLoading === `remove-${item.id}` ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="border-t-2 border-neutral-200 bg-neutral-50">
                        <tr>
                          <td colSpan={
                            // Calculate colspan based on visible columns
                            1 + // Item column
                            (isStandalone ? 0 : 2) + // Ordered + Already Rcvd (PO only)
                            (isStandalone && receive.source_type === 'customer_return' ? 1 : 0) + // Return reason
                            1 // Receiving column
                          } className="px-4 py-3 text-right font-medium text-neutral-700">
                            Total: {items.length} item{items.length !== 1 ? 's' : ''}, {totalQuantity} units
                          </td>
                          {isDraft && <td></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-neutral-400" />
                    <p className="mt-3 text-neutral-500">No items to receive</p>
                    {isDraft && isStandalone && (
                      <Button
                        className="mt-4"
                        onClick={() => setShowAddItemModal(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Item
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes Card (if notes exist or in draft mode) */}
            {(notes || isDraft) && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDraft ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={saveField}
                      placeholder="Add receiving notes..."
                      rows={3}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-neutral-400 focus:outline-none"
                    />
                  ) : (
                    <p className="text-neutral-700 whitespace-pre-wrap">{notes || 'No notes'}</p>
                  )}
                </CardContent>
              </Card>
            )}
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
                      {isDraft ? (
                        <input
                          type="date"
                          value={receivedDate}
                          onChange={(e) => setReceivedDate(e.target.value)}
                          onBlur={saveField}
                          className="rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                        />
                      ) : (
                        <FormattedShortDate date={receive.received_date} />
                      )}
                    </dd>
                  </div>

                  {/* Delivery Note */}
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Delivery Note #</dt>
                    <dd className="font-medium text-neutral-900">
                      {isDraft ? (
                        <input
                          type="text"
                          value={deliveryNoteNumber}
                          onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                          onBlur={saveField}
                          placeholder="—"
                          className="w-32 text-right rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                        />
                      ) : (
                        receive.delivery_note_number || '—'
                      )}
                    </dd>
                  </div>

                  {/* Carrier */}
                  <div className="flex justify-between">
                    <dt className="text-neutral-500 flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      Carrier
                    </dt>
                    <dd className="font-medium text-neutral-900">
                      {isDraft ? (
                        <input
                          type="text"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          onBlur={saveField}
                          placeholder="—"
                          className="w-32 text-right rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                        />
                      ) : (
                        receive.carrier || '—'
                      )}
                    </dd>
                  </div>

                  {/* Tracking Number */}
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Tracking #</dt>
                    <dd className="font-medium text-neutral-900">
                      {isDraft ? (
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          onBlur={saveField}
                          placeholder="—"
                          className="w-32 text-right rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                        />
                      ) : (
                        receive.tracking_number || '—'
                      )}
                    </dd>
                  </div>

                  {/* Default Folder */}
                  <div className="flex justify-between">
                    <dt className="text-neutral-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Folder
                    </dt>
                    <dd className="font-medium text-neutral-900">
                      {isDraft ? (
                        <select
                          value={defaultLocationId}
                          onChange={(e) => {
                            setDefaultLocationId(e.target.value)
                            saveField()
                          }}
                          className="w-32 text-right rounded border border-neutral-200 px-2 py-0.5 text-sm focus:border-neutral-400 focus:outline-none"
                        >
                          <option value="">Select...</option>
                          {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      ) : (
                        receive.default_location_name || '—'
                      )}
                    </dd>
                  </div>

                  {/* Status */}
                  <div className="flex justify-between border-t border-neutral-200 pt-3">
                    <dt className="text-neutral-500">Status</dt>
                    <dd className={`font-medium ${statusConfig[status]?.color}`}>
                      {statusConfig[status]?.label || status}
                    </dd>
                  </div>

                  {/* Completed At (if completed) */}
                  {receive.completed_at && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Completed</dt>
                      <dd className="font-medium text-green-600">
                        <FormattedShortDate date={receive.completed_at} />
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* Source PO (only for PO-linked receives) */}
            {receive.purchase_order && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Source PO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/tasks/purchase-orders/${receive.purchase_order.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {receive.purchase_order.display_id || receive.purchase_order.order_number}
                  </Link>
                  {receive.purchase_order.vendor_name && (
                    <p className="text-sm text-neutral-500 mt-2">
                      Vendor: {receive.purchase_order.vendor_name}
                    </p>
                  )}
                  <p className="text-sm text-neutral-500">
                    Status: <span className="capitalize">{receive.purchase_order.status}</span>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Source Type Info (for standalone receives) */}
            {isStandalone && (
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
                      receive.source_type === 'customer_return'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <SourceIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {sourceTypeConfig[receive.source_type]?.label}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {receive.source_type === 'customer_return'
                          ? 'Items returned by customers'
                          : 'Manual stock corrections'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Chatter Panel - only show for non-draft (completed) receives */}
        {!isDraft && (
          <ChatterPanel
            entityType="receive"
            entityId={receive.id}
            entityName={receive.display_id || `Receive ${receive.id.slice(0, 8)}`}
            currentUserId={currentUserId}
            className="mt-6"
          />
        )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 sticky top-0 bg-white">
              <h3 className="font-semibold text-neutral-900">Edit Receive Item</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Item Info (read-only) */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <ItemThumbnail
                  src={editingItem.item_image}
                  alt={editingItem.item_name}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-neutral-900">{editingItem.item_name}</p>
                  {editingItem.item_sku && (
                    <p className="text-sm text-neutral-500">SKU: {editingItem.item_sku}</p>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Quantity Receiving
                </label>
                <input
                  type="number"
                  min={1}
                  value={editForm.quantity_received}
                  onChange={(e) => setEditForm({ ...editForm, quantity_received: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              {/* Return Reason (for customer returns) */}
              {isStandalone && receive.source_type === 'customer_return' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Return Reason
                  </label>
                  <select
                    value={editForm.return_reason}
                    onChange={(e) => setEditForm({ ...editForm, return_reason: e.target.value as ReturnReason | '' })}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  >
                    <option value="">Select reason...</option>
                    <option value="defective">Defective</option>
                    <option value="wrong_item">Wrong Item</option>
                    <option value="changed_mind">Changed Mind</option>
                    <option value="damaged_in_transit">Damaged in Transit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* Lot Number */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Lot Number
                </label>
                <input
                  type="text"
                  value={editForm.lot_number}
                  onChange={(e) => setEditForm({ ...editForm, lot_number: e.target.value })}
                  placeholder="e.g., LOT-2024-001"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              {/* Batch Code */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Batch Code
                </label>
                <input
                  type="text"
                  value={editForm.batch_code}
                  onChange={(e) => setEditForm({ ...editForm, batch_code: e.target.value })}
                  placeholder="e.g., BATCH-A1"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={editForm.expiry_date}
                  onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>

              {/* Folder */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Folder
                </label>
                <select
                  value={editForm.location_id}
                  onChange={(e) => setEditForm({ ...editForm, location_id: e.target.value })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                >
                  <option value="">Use default folder</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Condition
                </label>
                <select
                  value={editForm.condition}
                  onChange={(e) => setEditForm({ ...editForm, condition: e.target.value as 'good' | 'damaged' | 'rejected' })}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                >
                  <option value="good">Good</option>
                  <option value="damaged">Damaged</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t px-4 py-3 sticky bottom-0 bg-white">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                disabled={actionLoading === 'save-item'}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveItem}
                disabled={actionLoading === 'save-item'}
              >
                {actionLoading === 'save-item' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Serial Number Entry Modal */}
      {serialEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-semibold text-neutral-900">Enter Serial Numbers</h3>
                <p className="text-sm text-neutral-500">{serialEditItem.item_name}</p>
              </div>
              <button
                onClick={() => setSerialEditItem(null)}
                className="p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Item Info */}
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <ItemThumbnail
                  src={serialEditItem.item_image}
                  alt={serialEditItem.item_name}
                  size="lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{serialEditItem.item_name}</p>
                  {serialEditItem.item_sku && (
                    <p className="text-xs text-neutral-500">SKU: {serialEditItem.item_sku}</p>
                  )}
                  <p className="text-xs text-neutral-500">
                    Ordered: {serialEditItem.ordered_quantity} • Already received: {serialEditItem.already_received}
                  </p>
                </div>
              </div>

              {/* Error message */}
              {serialError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{serialError}</span>
                  <button onClick={() => setSerialError(null)} className="ml-auto text-red-500 hover:text-red-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Mode toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setBulkMode(false); setBulkInput('') }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !bulkMode
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Barcode className="h-4 w-4" />
                  Scan Mode
                </button>
                <button
                  onClick={() => setBulkMode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    bulkMode
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <List className="h-4 w-4" />
                  Bulk Entry
                </button>
              </div>

              {/* Scan Mode */}
              {!bulkMode && (
                <>
                  {/* Serial input */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Scan or type serial number
                    </label>
                    <div className="flex gap-2">
                      <input
                        ref={serialInputRef}
                        type="text"
                        value={serialInput}
                        onChange={(e) => {
                          setSerialInput(e.target.value)
                          setSerialError(null)
                        }}
                        onKeyDown={handleSerialKeyDown}
                        placeholder="Scan barcode or type serial..."
                        className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        disabled={serialSaving}
                      />
                      <Button
                        onClick={handleAddSerial}
                        disabled={!serialInput.trim() || serialSaving}
                      >
                        {serialSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Progress indicator (only for PO-linked items with ordered quantity) */}
                  {serialEditItem.ordered_quantity !== null && serialEditItem.already_received !== null && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-neutral-600">
                          Progress: {serials.length} of {serialEditItem.ordered_quantity - serialEditItem.already_received} serials entered
                        </span>
                        <span className="font-medium text-neutral-900">
                          {Math.round((serials.length / Math.max(1, serialEditItem.ordered_quantity - serialEditItem.already_received)) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (serials.length / Math.max(1, serialEditItem.ordered_quantity - serialEditItem.already_received)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Serial count (for standalone items) */}
                  {(serialEditItem.ordered_quantity === null || serialEditItem.already_received === null) && (
                    <div className="text-sm text-neutral-600">
                      {serials.length} serial{serials.length !== 1 ? 's' : ''} entered
                    </div>
                  )}

                  {/* Serial list */}
                  {serials.length > 0 && (
                    <div className="border border-neutral-200 rounded-lg max-h-48 overflow-y-auto">
                      <div className="divide-y divide-neutral-100">
                        {serials.map((serial, index) => (
                          <div key={serial.id} className="flex items-center justify-between px-3 py-2 hover:bg-neutral-50">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-400 w-6">{index + 1}.</span>
                              <span className="text-sm font-mono text-neutral-900">{serial.serial_number}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveSerial(serial.id)}
                              disabled={serialSaving}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {serials.length === 0 && (
                    <div className="text-center py-6 text-neutral-500 text-sm border border-dashed border-neutral-300 rounded-lg">
                      <Barcode className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                      <p>No serial numbers entered yet</p>
                      <p className="text-xs mt-1">Scan or type to add</p>
                    </div>
                  )}
                </>
              )}

              {/* Bulk Mode */}
              {bulkMode && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Paste serial numbers (one per line)
                  </label>
                  <textarea
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="SN-001-ABC-123&#10;SN-001-ABC-124&#10;SN-001-ABC-125"
                    rows={6}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 resize-none"
                    disabled={serialSaving}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={handleBulkAdd}
                      disabled={!bulkInput.trim() || serialSaving}
                    >
                      {serialSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Parse & Add Serials
                    </Button>
                  </div>
                </div>
              )}

              {/* Additional Options */}
              <div className="border-t border-neutral-200 pt-4 mt-4">
                <p className="text-sm font-medium text-neutral-700 mb-3">Additional Options</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Folder */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Folder
                    </label>
                    <select
                      value={serialForm.location_id}
                      onChange={(e) => setSerialForm({ ...serialForm, location_id: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
                    >
                      <option value="">Default folder</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Condition
                    </label>
                    <select
                      value={serialForm.condition}
                      onChange={(e) => setSerialForm({ ...serialForm, condition: e.target.value as 'good' | 'damaged' | 'rejected' })}
                      className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
                    >
                      <option value="good">Good</option>
                      <option value="damaged">Damaged</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Expiry Date */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-neutral-600 mb-1">
                      Expiry Date (optional)
                    </label>
                    <input
                      type="date"
                      value={serialForm.expiry_date}
                      onChange={(e) => setSerialForm({ ...serialForm, expiry_date: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center border-t px-4 py-3 sticky bottom-0 bg-white">
              <span className="text-sm text-neutral-600">
                {serials.length} serial{serials.length !== 1 ? 's' : ''} entered
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSerialEditItem(null)}
                  disabled={serialSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSerialModal}
                  disabled={serialSaving || serials.length === 0}
                >
                  {serialSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal (for standalone receives) */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-neutral-900">Add Item to Receive</h3>
              <button
                onClick={closeAddItemModal}
                className="p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Item Search (when no item selected) */}
              {!selectedItem && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Search for an item
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      type="text"
                      value={itemSearch}
                      onChange={(e) => handleItemSearch(e.target.value)}
                      placeholder="Search by name or SKU..."
                      className="pl-9"
                    />
                  </div>

                  {/* Search Results */}
                  {searchLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                    </div>
                  )}

                  {!searchLoading && searchResults.length > 0 && (
                    <div className="mt-2 border border-neutral-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-neutral-100">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
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
                        </button>
                      ))}
                    </div>
                  )}

                  {!searchLoading && itemSearch.length >= 2 && searchResults.length === 0 && (
                    <p className="text-sm text-neutral-500 mt-2 text-center py-4">
                      No items found matching "{itemSearch}"
                    </p>
                  )}
                </div>
              )}

              {/* Selected Item */}
              {selectedItem && (
                <>
                  {/* Item Info */}
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                    <ItemThumbnail
                      src={selectedItem.image_url}
                      alt={selectedItem.name}
                      size="lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{selectedItem.name}</p>
                      {selectedItem.sku && (
                        <p className="text-xs text-neutral-500">SKU: {selectedItem.sku}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-1 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 rounded"
                      title="Change item"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Quantity
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={addItemForm.quantity_received}
                      onChange={(e) => setAddItemForm({
                        ...addItemForm,
                        quantity_received: parseInt(e.target.value) || 1
                      })}
                    />
                  </div>

                  {/* Return Reason (for customer returns) */}
                  {receive.source_type === 'customer_return' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Return Reason <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={addItemForm.return_reason}
                        onChange={(e) => setAddItemForm({
                          ...addItemForm,
                          return_reason: e.target.value as ReturnReason
                        })}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                      >
                        <option value="">Select reason...</option>
                        <option value="defective">Defective</option>
                        <option value="wrong_item">Wrong Item</option>
                        <option value="changed_mind">Changed Mind</option>
                        <option value="damaged_in_transit">Damaged in Transit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  {/* Folder */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Folder
                    </label>
                    <select
                      value={addItemForm.location_id}
                      onChange={(e) => setAddItemForm({ ...addItemForm, location_id: e.target.value })}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    >
                      <option value="">Use default folder</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Condition
                    </label>
                    <select
                      value={addItemForm.condition}
                      onChange={(e) => setAddItemForm({
                        ...addItemForm,
                        condition: e.target.value as 'good' | 'damaged' | 'rejected'
                      })}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    >
                      <option value="good">Good</option>
                      <option value="damaged">Damaged</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Lot/Batch (collapsible) */}
                  {selectedItem.tracking_mode === 'lot_expiry' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Lot Number
                        </label>
                        <Input
                          type="text"
                          value={addItemForm.lot_number}
                          onChange={(e) => setAddItemForm({ ...addItemForm, lot_number: e.target.value })}
                          placeholder="e.g., LOT-2024-001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Batch Code
                        </label>
                        <Input
                          type="text"
                          value={addItemForm.batch_code}
                          onChange={(e) => setAddItemForm({ ...addItemForm, batch_code: e.target.value })}
                          placeholder="e.g., BATCH-A1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Expiry Date
                        </label>
                        <Input
                          type="date"
                          value={addItemForm.expiry_date}
                          onChange={(e) => setAddItemForm({ ...addItemForm, expiry_date: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={addItemForm.notes}
                      onChange={(e) => setAddItemForm({ ...addItemForm, notes: e.target.value })}
                      placeholder="Add any notes..."
                      rows={2}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm resize-none focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t px-4 py-3 sticky bottom-0 bg-white">
              <Button
                variant="outline"
                onClick={closeAddItemModal}
                disabled={addItemLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddItem}
                disabled={addItemLoading || !selectedItem}
              >
                {addItemLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
