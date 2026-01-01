'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  MapPin,
  Loader2,
  Play,
  Check,
  Ban,
  Trash2,
  Search,
  X,
  Info,
  Minus,
  Plus,
  Barcode,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedShortDate, FormattedDateTime } from '@/components/formatting/FormattedDate'
import {
  pickItem,
  completePickList,
  startPickList,
  cancelPickList,
  deletePickList,
  updatePickList,
  addPickListItem,
  removePickListItem,
  updatePickListItem,
  searchInventoryItems
} from '@/app/actions/pick-lists'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'
import { ChatterPanel } from '@/components/chatter'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

interface PickListWithItems {
  pick_list: {
    id: string
    name: string
    display_id: string | null
    pick_list_number: string | null
    status: string
    due_date: string | null
    item_outcome: string
    notes: string | null
    ship_to_name: string | null
    ship_to_address1: string | null
    ship_to_address2: string | null
    ship_to_city: string | null
    ship_to_state: string | null
    ship_to_postal_code: string | null
    ship_to_country: string | null
    assigned_to: string | null
    created_at: string
    created_by: string | null
    updated_at: string | null
    completed_at: string | null
  }
  items: Array<{
    id: string
    item_id: string
    item_name: string
    item_sku: string | null
    item_image: string | null
    available_quantity: number
    requested_quantity: number
    picked_quantity: number
    picked_at: string | null
    notes: string | null
  }>
  assigned_to_name: string | null
  created_by_name: string | null
}

interface PickListDetailClientProps {
  data: PickListWithItems
  teamMembers: TeamMember[]
  currentUserId: string | null
}

interface SearchResult {
  id: string
  name: string
  sku: string | null
  quantity: number
  image_urls: string[] | null
  unit: string | null
}

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="h-5 w-5 text-neutral-400" />,
  in_progress: <Clock className="h-5 w-5 text-blue-500" />,
  completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  cancelled: <XCircle className="h-5 w-5 text-red-500" />,
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const itemOutcomeOptions = [
  { value: 'decrement', label: 'Decrement Stock' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'transfer', label: 'Transfer' },
]

export function PickListDetailClient({ data, teamMembers, currentUserId }: PickListDetailClientProps) {
  const router = useRouter()
  const [pickingItemId, setPickingItemId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Form state for draft mode
  // pick_list_number is display-only (auto-generated)
  const [assignedTo, setAssignedTo] = useState(data.pick_list.assigned_to || '')
  const [dueDate, setDueDate] = useState(data.pick_list.due_date || '')
  const [itemOutcome, setItemOutcome] = useState(data.pick_list.item_outcome || 'decrement')
  const [notes, setNotes] = useState(data.pick_list.notes || '')
  const [shipToName, setShipToName] = useState(data.pick_list.ship_to_name || '')
  const [shipToAddress1, setShipToAddress1] = useState(data.pick_list.ship_to_address1 || '')
  const [shipToAddress2, setShipToAddress2] = useState(data.pick_list.ship_to_address2 || '')
  const [shipToCity, setShipToCity] = useState(data.pick_list.ship_to_city || '')
  const [shipToState, setShipToState] = useState(data.pick_list.ship_to_state || '')
  const [shipToPostalCode, setShipToPostalCode] = useState(data.pick_list.ship_to_postal_code || '')
  const [shipToCountry, setShipToCountry] = useState(data.pick_list.ship_to_country || '')

  // Menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showLowStock, setShowLowStock] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const pickList = data.pick_list
  const items = data.items
  const isDraft = pickList.status === 'draft'
  const isEditable = isDraft || pickList.status === 'in_progress'

  const totalRequested = items.reduce((sum, item) => sum + item.requested_quantity, 0)
  const totalPicked = items.reduce((sum, item) => sum + item.picked_quantity, 0)
  const allPicked = items.every((item) => item.picked_quantity >= item.requested_quantity)

  // Validation for draft mode
  const isValid = assignedTo && itemOutcome

  // Search items
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await searchInventoryItems(query)
      // Filter out items already in the list
      const existingItemIds = items.map(i => i.item_id)
      const filtered = results.filter((r: SearchResult) => !existingItemIds.includes(r.id))
      setSearchResults(filtered)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }, [items])

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
  async function saveField(field: string, value: string | null) {
    try {
      const updates: Record<string, string | null> = {}

      switch (field) {
        case 'assigned_to':
          updates.assigned_to = value || null
          break
        case 'due_date':
          updates.due_date = value || null
          break
        case 'item_outcome':
          break
        case 'notes':
          updates.notes = value || null
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
      }

      if (field === 'item_outcome') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updatePickList(pickList.id, { item_outcome: value } as any)
      } else if (Object.keys(updates).length > 0) {
        await updatePickList(pickList.id, updates)
      }

      router.refresh()
    } catch (err) {
      console.error('Save field error:', err)
    }
  }

  async function handleAddItem(item: SearchResult) {
    setActionLoading('add-item')
    try {
      await addPickListItem(pickList.id, item.id, 1)
      setSearchQuery('')
      setSearchResults([])
      router.refresh()
    } catch (err) {
      console.error('Add item error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleBarcodeScan(result: ScanResult) {
    setIsScannerOpen(false)

    // Search for item by barcode (SKU)
    const foundItems = await searchInventoryItems(result.code)

    // Filter out items already in the list
    const existingItemIds = items.map(i => i.item_id)
    const filtered = foundItems.filter((r: SearchResult) => !existingItemIds.includes(r.id))

    if (filtered.length === 1) {
      // Single match - add directly
      await handleAddItem(filtered[0])
    } else if (filtered.length > 1) {
      // Multiple matches - show in search results
      setSearchQuery(result.code)
      setSearchResults(filtered)
    } else if (foundItems.length > 0) {
      // Items found but all already in list
      alert(`Item with barcode "${result.code}" is already in the pick list`)
    } else {
      // No match found
      alert(`No item found with barcode: ${result.code}`)
    }
  }

  async function handleRemoveItem(itemId: string) {
    setActionLoading(`remove-${itemId}`)
    try {
      await removePickListItem(itemId)
      router.refresh()
    } catch (err) {
      console.error('Remove item error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUpdateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return
    setActionLoading(`qty-${itemId}`)
    try {
      await updatePickListItem(itemId, quantity)
      router.refresh()
    } catch (err) {
      console.error('Update quantity error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handlePickItem(itemId: string, requestedQty: number) {
    setPickingItemId(itemId)
    try {
      const result = await pickItem(itemId, requestedQty)
      if (result.success) {
        router.refresh()
      }
    } catch (err) {
      console.error('Pick item error:', err)
    } finally {
      setPickingItemId(null)
    }
  }

  async function handleStartPicking() {
    if (!isValid) return

    setActionLoading('start')
    try {
      const result = await startPickList(pickList.id)
      if (result.success) {
        router.refresh()
      }
    } catch (err) {
      console.error('Start pick list error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleComplete() {
    setActionLoading('complete')
    try {
      const result = await completePickList(pickList.id)
      if (result.success) {
        router.refresh()
      }
    } catch (err) {
      console.error('Complete pick list error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this pick list?')) return

    setActionLoading('cancel')
    try {
      const result = await cancelPickList(pickList.id)
      if (result.success) {
        router.push('/tasks/pick-lists')
      }
    } catch (err) {
      console.error('Cancel pick list error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this pick list? This cannot be undone.')) return

    setActionLoading('delete')
    try {
      const result = await deletePickList(pickList.id)
      if (result.success) {
        router.push('/tasks/pick-lists')
      }
    } catch (err) {
      console.error('Delete pick list error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Draft Mode UI
  if (isDraft) {
    return (
      <div className="flex-1 overflow-y-auto bg-neutral-50">
        {/* Header */}
        <div className="border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tasks/pick-lists" className="text-sm text-neutral-500 hover:text-neutral-700">
                Pick Lists
              </Link>
              <span className="text-neutral-300">/</span>
              <span className="text-sm text-neutral-500">Last Updated: <FormattedDateTime date={pickList.updated_at || pickList.created_at} /></span>
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
                        Delete Pick List
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
            <h1 className="text-2xl font-semibold text-neutral-900">
              {/* Prefer display_id (new format: PL-ACM01-00001), fallback to pick_list_number */}
              {pickList.display_id || pickList.pick_list_number || pickList.name || `PL-${pickList.id.slice(0, 8).toUpperCase()}`}
            </h1>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[pickList.status]}`}>
              {statusLabels[pickList.status]}
            </span>
            {!isValid && (
              <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                <Info className="h-4 w-4" />
                Fill out required fields before proceeding.
              </div>
            )}
          </div>

          <div className="mt-2 text-sm text-neutral-500">
            <span>Created By: <strong>{data.created_by_name || 'Unknown'}</strong></span>
            <span className="mx-3">·</span>
            <span>Date Created: <FormattedDateTime date={pickList.created_at} /></span>
          </div>
        </div>

        {/* Form Fields Row */}
        <div className="border-b border-neutral-200 bg-white px-6 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Assign To */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Assign To <span className="text-red-500">*</span>
                <Info className="inline h-3.5 w-3.5 ml-1 text-neutral-400" />
              </label>
              <select
                value={assignedTo}
                onChange={(e) => {
                  setAssignedTo(e.target.value)
                  saveField('assigned_to', e.target.value)
                }}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pickle-500 focus:ring-1 focus:ring-pickle-500"
              >
                <option value="">Assign To*</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || member.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  saveField('due_date', e.target.value)
                }}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pickle-500 focus:ring-1 focus:ring-pickle-500"
              />
            </div>

            {/* Item Outcome */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Item Outcome when Picked <span className="text-red-500">*</span>
                <Info className="inline h-3.5 w-3.5 ml-1 text-neutral-400" />
              </label>
              <select
                value={itemOutcome}
                onChange={(e) => {
                  setItemOutcome(e.target.value)
                  saveField('item_outcome', e.target.value)
                }}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-pickle-500 focus:ring-1 focus:ring-pickle-500"
              >
                {itemOutcomeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="border-b border-neutral-200 bg-white">
          <div className="px-6 py-3 border-b border-neutral-100">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-500 uppercase tracking-wider">
              <span>Item Description</span>
              <span>Pick Quantity</span>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-4 bg-neutral-50">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search to add items to the pick list"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 text-sm focus:border-pickle-500 focus:ring-1 focus:ring-pickle-500"
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
                className="rounded border-neutral-300 text-pickle-600 focus:ring-pickle-500"
              />
              Only show low-stock items
            </label>
          </div>

          {/* Items List */}
          <div className="divide-y divide-neutral-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
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
                  {item.item_image ? (
                    <Image
                      src={item.item_image}
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
                    {item.item_sku && <p className="text-xs text-neutral-500">SKU: {item.item_sku}</p>}
                  </div>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.requested_quantity - 1)}
                    disabled={item.requested_quantity <= 1 || actionLoading === `qty-${item.id}`}
                    className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{item.requested_quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, item.requested_quantity + 1)}
                    disabled={actionLoading === `qty-${item.id}`}
                    className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="px-6 py-8 text-center text-neutral-500">
                No items added yet. Search above to add items.
              </div>
            )}
          </div>

          {/* Summary row */}
          {items.length > 0 && (
            <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200">
              <div className="flex items-center justify-end">
                <span className="text-sm font-medium text-neutral-600">
                  {items.length} item{items.length !== 1 ? 's' : ''} to pick
                </span>
              </div>
            </div>
          )}
        </div>

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
                  onBlur={() => saveField('ship_to', shipToName)}
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
                  onBlur={() => saveField('ship_to', shipToAddress1)}
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
                  onBlur={() => saveField('ship_to', shipToAddress2)}
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
                  onBlur={() => saveField('ship_to', shipToCity)}
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
                  onBlur={() => saveField('ship_to', shipToState)}
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
                  onBlur={() => saveField('ship_to', shipToPostalCode)}
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
                    saveField('ship_to', e.target.value)
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

        {/* Notes Section */}
        <Card className="mx-6 mt-6 mb-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => saveField('notes', notes)}
              placeholder="Leave a note here for your team"
              rows={4}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none"
            />
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center justify-end gap-4">
            <div className="text-right">
              <p className="text-xs text-neutral-500">{items.length} item{items.length !== 1 ? 's' : ''}</p>
            </div>
            <Button
              onClick={handleStartPicking}
              disabled={actionLoading !== null || !isValid || items.length === 0}
            >
              {actionLoading === 'start' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Start Picking
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

  // Non-draft (In Progress, Completed, Cancelled) - Read-only view with pick actions
  const hasShipTo = pickList.ship_to_name || pickList.ship_to_address1

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/tasks/pick-lists">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {statusIcons[pickList.status]}
            <div>
              {/* Prefer display_id (new format: PL-ACM01-00001), fallback to pick_list_number */}
              <h1 className="text-xl font-semibold text-neutral-900">{pickList.display_id || pickList.pick_list_number || pickList.name || `PL-${pickList.id.slice(0, 8).toUpperCase()}`}</h1>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[pickList.status]}`}>
                  {statusLabels[pickList.status]}
                </span>
                <span>·</span>
                <span>{totalPicked}/{totalRequested} items picked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {pickList.status === 'in_progress' && (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'cancel' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                disabled={actionLoading !== null || !allPicked}
              >
                {actionLoading === 'complete' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Complete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Info Cards Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-neutral-500">Assigned To</p>
              <p className="text-base font-semibold text-neutral-900">
                {data.assigned_to_name || 'Unassigned'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-neutral-500">Due Date</p>
              <p className="text-base font-semibold text-neutral-900">
                {pickList.due_date ? <FormattedShortDate date={pickList.due_date} /> : 'No due date'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-neutral-500">Item Outcome</p>
              <p className="text-base font-semibold text-neutral-900">
                {itemOutcomeOptions.find(o => o.value === pickList.item_outcome)?.label || pickList.item_outcome}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Items to Pick ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-neutral-200">
                <table className="w-full text-sm">
                  <thead className="border-b border-neutral-200 bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-neutral-600">Item</th>
                      <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Requested</th>
                      <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Picked</th>
                      <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Status</th>
                      {isEditable && (
                        <th className="px-4 py-3 text-right font-medium text-neutral-600 w-32">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {items.map((item) => {
                      const isPicked = item.picked_quantity >= item.requested_quantity
                      const isPartial = item.picked_quantity > 0 && item.picked_quantity < item.requested_quantity

                      return (
                        <tr key={item.id} className={isPicked ? 'bg-green-50' : ''}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.item_image ? (
                                <Image
                                  src={item.item_image}
                                  alt={item.item_name}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                                  <Package className="h-5 w-5 text-neutral-400" />
                                </div>
                              )}
                              <div>
                                <Link
                                  href={`/inventory/${item.item_id}`}
                                  className="font-medium text-neutral-900 hover:text-pickle-600"
                                >
                                  {item.item_name}
                                </Link>
                                {item.item_sku && (
                                  <p className="text-xs text-neutral-500">SKU: {item.item_sku}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-neutral-900">
                            {item.requested_quantity}
                          </td>
                          <td className="px-4 py-3 text-center font-medium text-neutral-900">
                            {item.picked_quantity}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isPicked ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                <CheckCircle className="h-3 w-3" />
                                Picked
                              </span>
                            ) : isPartial ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                <Clock className="h-3 w-3" />
                                Partial
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                                Pending
                              </span>
                            )}
                          </td>
                          {isEditable && (
                            <td className="px-4 py-3 text-right">
                              {!isPicked && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePickItem(item.id, item.requested_quantity)}
                                  disabled={pickingItemId === item.id}
                                >
                                  {pickingItemId === item.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="mr-1 h-4 w-4" />
                                      Pick
                                    </>
                                  )}
                                </Button>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-500">
                No items in this pick list
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ship To Address */}
        {hasShipTo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ship To
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {pickList.ship_to_name && (
                  <p className="font-medium text-neutral-900">{pickList.ship_to_name}</p>
                )}
                {pickList.ship_to_address1 && (
                  <p className="text-neutral-600">{pickList.ship_to_address1}</p>
                )}
                {pickList.ship_to_address2 && (
                  <p className="text-neutral-600">{pickList.ship_to_address2}</p>
                )}
                <p className="text-neutral-600">
                  {[pickList.ship_to_city, pickList.ship_to_state, pickList.ship_to_postal_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {pickList.ship_to_country && (
                  <p className="text-neutral-600">{pickList.ship_to_country}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {pickList.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-neutral-600">{pickList.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <div className="flex items-center gap-6 text-xs text-neutral-500">
          <span>
            Created: <FormattedDateTime date={pickList.created_at} />
          </span>
          {pickList.completed_at && (
            <span>
              Completed: <FormattedDateTime date={pickList.completed_at} />
            </span>
          )}
        </div>

        {/* Chatter Panel */}
        {currentUserId && (
          <ChatterPanel
            entityType="pick_list"
            entityId={pickList.id}
            entityName={pickList.display_id || pickList.name || `Pick List ${pickList.id.slice(0, 8)}`}
            currentUserId={currentUserId}
            className="mt-6"
          />
        )}
      </div>
    </div>
  )
}
