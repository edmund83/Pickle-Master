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
  X,
  Info,
  Minus,
  Plus,
  Camera,
  MoreVertical,
  Zap,
  FileText,
  AlertCircle,
  Download,
  Truck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
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
import { createDeliveryOrderFromSO } from '@/app/actions/delivery-orders'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'
import { ChatterPanel } from '@/components/chatter'
import { PickListItemTracking } from '@/components/pick-lists/PickListItemTracking'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { useFormatting } from '@/hooks/useFormatting'
import { useTenantCompanyDetails, useTenantName, useTenantLogoUrl } from '@/contexts/TenantSettingsContext'
import { buildCompanyBranding, downloadPdfBlob, fetchImageDataUrl, generatePickListPDF } from '@/lib/documents/pdf-generator'

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
    source_entity_type: string | null
    source_entity_id: string | null
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
    tracking_mode: 'none' | 'serialized' | 'lot_expiry'
    locations: Array<{
      location_id: string
      location_name: string
      location_type: 'warehouse' | 'van' | 'store' | 'job_site'
      quantity: number
    }>
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
  { value: 'decrement', label: 'Remove from inventory' },
  { value: 'checkout', label: 'Lend out (return later)' },
  { value: 'transfer', label: 'Move to another location' },
]

export function PickListDetailClient({ data, teamMembers, currentUserId }: PickListDetailClientProps) {
  const router = useRouter()
  const feedback = useFeedback()
  const { formatCurrency, formatDate, formatShortDate } = useFormatting()
  const tenantName = useTenantName()
  const tenantLogoUrl = useTenantLogoUrl()
  const companyDetails = useTenantCompanyDetails()
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

  // Partial pick state - track quantity to pick for each item
  const [pickQuantities, setPickQuantities] = useState<Record<string, number>>({})

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  // Delivery order creation state
  const [isCreatingDO, setIsCreatingDO] = useState(false)

  // Track serial/lot allocation completion status for each tracked item
  const [trackingComplete, setTrackingComplete] = useState<Record<string, boolean>>({})

  // Handler for when tracking allocation changes
  const handleTrackingChange = (itemId: string, isComplete: boolean) => {
    setTrackingComplete(prev => ({ ...prev, [itemId]: isComplete }))
  }

  // Helper to convert tracking_mode to tracking type for the component
  const getTrackingType = (mode: 'none' | 'serialized' | 'lot_expiry'): 'none' | 'serial' | 'lot' => {
    if (mode === 'serialized') return 'serial'
    if (mode === 'lot_expiry') return 'lot'
    return 'none'
  }

  const pickList = data.pick_list
  const items = data.items

  // Check if all tracked items have complete allocations
  const trackedItems = items.filter(i => i.tracking_mode !== 'none')
  const allTrackingComplete = trackedItems.length === 0 ||
    trackedItems.every(i => trackingComplete[i.id] === true)
  const isDraft = pickList.status === 'draft'
  const isEditable = isDraft || pickList.status === 'in_progress'

  const totalRequested = items.reduce((sum, item) => sum + item.requested_quantity, 0)
  const totalPicked = items.reduce((sum, item) => sum + item.picked_quantity, 0)
  const allPicked = items.every((item) => item.picked_quantity >= item.requested_quantity)
  const canDownloadPdf = items.length > 0

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
      feedback.warning(`Item with barcode "${result.code}" is already in the pick list`)
    } else {
      // No match found
      feedback.warning(`No item found with barcode: ${result.code}`)
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

  // Get the pick quantity for an item (defaults to remaining quantity)
  function getPickQuantity(itemId: string, requested: number, alreadyPicked: number) {
    if (pickQuantities[itemId] !== undefined) {
      return pickQuantities[itemId]
    }
    return Math.max(0, requested - alreadyPicked)
  }

  // Update pick quantity for an item
  function updatePickQuantity(itemId: string, quantity: number, maxQuantity: number) {
    const clampedQty = Math.max(1, Math.min(quantity, maxQuantity))
    setPickQuantities(prev => ({ ...prev, [itemId]: clampedQty }))
  }

  async function handlePickItem(itemId: string, quantity: number) {
    if (quantity < 1) return
    setPickingItemId(itemId)
    try {
      const result = await pickItem(itemId, quantity)
      if (result.success) {
        // Clear the pick quantity state for this item
        setPickQuantities(prev => {
          const next = { ...prev }
          delete next[itemId]
          return next
        })
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

  async function handleDownloadPDF() {
    if (!canDownloadPdf) return
    setActionLoading('download-pdf')
    try {
      const logoDataUrl = tenantLogoUrl ? await fetchImageDataUrl(tenantLogoUrl) : null
      const branding = buildCompanyBranding(tenantName, logoDataUrl, companyDetails)
      const pdfBlob = generatePickListPDF(
        data,
        {
          formatCurrency,
          formatDate,
          formatShortDate,
        },
        branding
      )
      const baseName = pickList.display_id || pickList.pick_list_number || pickList.name || pickList.id
      const safeName = baseName.replace(/\s+/g, '-').toLowerCase()
      downloadPdfBlob(pdfBlob, `pick-list-${safeName}.pdf`)
    } catch (err) {
      console.error('Failed to generate pick list PDF:', err)
      feedback.error('Failed to generate PDF')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCreateDeliveryOrder() {
    if (!pickList.source_entity_id || pickList.source_entity_type !== 'sales_order') return

    setIsCreatingDO(true)
    try {
      const result = await createDeliveryOrderFromSO(pickList.source_entity_id)
      if (result.success && result.delivery_order_id) {
        feedback.success(`Delivery Order ${result.display_id || ''} created`)
        router.push(`/tasks/delivery-orders/${result.delivery_order_id}`)
      } else {
        feedback.error(result.error || 'Failed to create delivery order')
      }
    } catch (err) {
      console.error('Failed to create delivery order:', err)
      feedback.error('Failed to create delivery order')
    } finally {
      setIsCreatingDO(false)
    }
  }

  // Computed values for draft mode
  const hasNotesData = Boolean(notes)
  const missingFields: string[] = []
  if (!assignedTo) missingFields.push('Assign To')
  if (!itemOutcome) missingFields.push('What happens to stock')

  // Draft Mode UI - Two Column Layout
  if (isDraft) {
    return (
      <div className="flex-1 overflow-y-auto bg-neutral-50">
        {/* Header - Streamlined */}
        <div className="border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tasks/pick-lists" className="text-sm text-neutral-500 hover:text-neutral-700">
                Pick Lists
              </Link>
              <span className="text-neutral-300">/</span>
              <h1 className="text-xl font-semibold text-neutral-900">
                {pickList.display_id || pickList.pick_list_number || pickList.name || `PL-${pickList.id.slice(0, 8).toUpperCase()}`}
              </h1>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[pickList.status]}`}>
                {statusLabels[pickList.status]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={!canDownloadPdf || actionLoading !== null}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
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
        </div>

        {/* Two Column Layout */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area - Items (2/3 width on desktop) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Ship To Card - Prominent at top */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ship To
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    Select Address
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={shipToName}
                        onChange={(e) => setShipToName(e.target.value)}
                        onBlur={() => saveField('ship_to', shipToName)}
                        placeholder="Recipient name"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={shipToAddress1}
                        onChange={(e) => setShipToAddress1(e.target.value)}
                        onBlur={() => saveField('ship_to', shipToAddress1)}
                        placeholder="Street address"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      value={shipToCity}
                      onChange={(e) => setShipToCity(e.target.value)}
                      onBlur={() => saveField('ship_to', shipToCity)}
                      placeholder="City"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={shipToState}
                      onChange={(e) => setShipToState(e.target.value)}
                      onBlur={() => saveField('ship_to', shipToState)}
                      placeholder="State"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={shipToPostalCode}
                      onChange={(e) => setShipToPostalCode(e.target.value)}
                      onBlur={() => saveField('ship_to', shipToPostalCode)}
                      placeholder="Postal code"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    />
                    <select
                      value={shipToCountry}
                      onChange={(e) => {
                        setShipToCountry(e.target.value)
                        saveField('ship_to', e.target.value)
                      }}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    >
                      <option value="">Country</option>
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
                </CardContent>
              </Card>

              {/* Summary Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-neutral-200">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
                  <Package className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full">
                  <span className="text-sm font-medium">{totalRequested} units to pick</span>
                </div>
                {!isValid && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Missing: {missingFields.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <div className="flex items-center justify-between text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    <span>Items to Pick</span>
                    <span>Qty</span>
                  </div>
                </div>

                {/* Smart Search Input */}
                <div className="px-4 py-4 bg-neutral-50 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type name, SKU, or paste barcode"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      {isSearching ? (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-neutral-400" />
                      ) : searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-neutral-200 hover:bg-neutral-300 flex items-center justify-center transition-colors"
                        >
                          <X className="h-3 w-3 text-neutral-600" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
                      title="Open camera to scan"
                    >
                      <Camera className="h-5 w-5" />
                      <span className="text-sm font-medium hidden sm:inline">Scan</span>
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

                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-100">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={actionLoading === `remove-${item.id}`}
                          className="text-neutral-400 hover:text-red-500 flex-shrink-0"
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
                            className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-neutral-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 truncate">{item.item_name}</p>
                          {item.item_sku && <p className="text-xs text-neutral-500 truncate">SKU: {item.item_sku}</p>}
                          {/* Location badge */}
                          {item.locations && item.locations.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span className="text-xs text-primary font-medium truncate">
                                {item.locations[0].location_name}
                              </span>
                              {item.locations.length > 1 && (
                                <span className="text-xs text-neutral-400">
                                  +{item.locations.length - 1}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.requested_quantity - 1)}
                          disabled={item.requested_quantity <= 1 || actionLoading === `qty-${item.id}`}
                          className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-medium">{item.requested_quantity}</span>
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
                    <div className="px-6 py-12 text-center">
                      <Package className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                      <p className="text-neutral-500">No items added yet</p>
                      <p className="text-sm text-neutral-400 mt-1">Search above to add items to pick</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Pick Options & Optional Details (1/3 width on desktop) */}
            <div className="space-y-4">
              {/* Required Pick Options Card - Emphasized */}
              <Card className={`border-2 shadow-md ${!isValid ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/30' : 'border-primary/10 bg-gradient-to-br from-white to-primary/5'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Pick Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Assign To */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Assign To <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={assignedTo}
                      onChange={(e) => {
                        setAssignedTo(e.target.value)
                        saveField('assigned_to', e.target.value)
                      }}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary ${!assignedTo ? 'border-amber-300' : 'border-neutral-200'}`}
                    >
                      <option value="">Select team member...</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.full_name || member.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* What happens to stock? */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      What happens to stock? <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={itemOutcome}
                      onChange={(e) => {
                        setItemOutcome(e.target.value)
                        saveField('item_outcome', e.target.value)
                      }}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      {itemOutcomeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value)
                        saveField('due_date', e.target.value)
                      }}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Optional: Notes - Collapsible */}
              <CollapsibleSection
                title="Notes"
                icon={FileText}
                hasContent={hasNotesData}
                defaultExpanded={false}
              >
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => saveField('notes', notes)}
                  placeholder="Leave a note here for your team"
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none"
                />
              </CollapsibleSection>

              {/* Metadata */}
              <div className="text-xs text-neutral-500 space-y-1 px-1">
                <p>Created by: {data.created_by_name || 'Unknown'}</p>
                <p>Last updated: <FormattedShortDate date={pickList.updated_at || pickList.created_at} /></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Enhanced */}
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">{items.length}</span> item{items.length !== 1 ? 's' : ''} · <span className="font-medium">{totalRequested}</span> units
            </div>
            <div className="flex items-center gap-3">
              {!isValid && (
                <span className="text-sm text-amber-600 hidden sm:block">
                  Complete required fields to continue
                </span>
              )}
              <Button
                onClick={handleStartPicking}
                disabled={actionLoading !== null || !isValid || items.length === 0}
                size="lg"
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
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={!canDownloadPdf || actionLoading !== null}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
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
                disabled={actionLoading !== null || totalPicked === 0 || !allTrackingComplete}
                title={!allTrackingComplete ? 'Please assign serial/lot numbers for all tracked items' : undefined}
              >
                {actionLoading === 'complete' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {allPicked ? 'Complete' : 'Complete Partial'}
              </Button>
            </>
          )}
          {pickList.status === 'completed' &&
            pickList.source_entity_type === 'sales_order' &&
            pickList.source_entity_id && (
              <Button
                onClick={handleCreateDeliveryOrder}
                disabled={isCreatingDO}
              >
                {isCreatingDO ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="mr-2 h-4 w-4" />
                )}
                {isCreatingDO ? 'Creating...' : 'Create Delivery Order'}
              </Button>
            )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Progress Bar */}
        {pickList.status === 'in_progress' && (
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Pick Progress</span>
              <span className="text-sm font-medium text-neutral-900">
                {totalPicked}/{totalRequested} units ({totalRequested > 0 ? Math.round((totalPicked / totalRequested) * 100) : 0}%)
              </span>
            </div>
            <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${allPicked ? 'bg-green-500' : 'bg-primary'}`}
                style={{ width: `${totalRequested > 0 ? Math.min(100, (totalPicked / totalRequested) * 100) : 0}%` }}
              />
            </div>
            {!allPicked && totalPicked > 0 && (
              <p className="text-xs text-amber-600 mt-2">
                {totalRequested - totalPicked} units remaining - you can complete with partial picks
              </p>
            )}
          </div>
        )}

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
              <p className="text-sm font-medium text-neutral-500">What happens to stock</p>
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
                      const trackingType = getTrackingType(item.tracking_mode)
                      const hasTracking = trackingType !== 'none'

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
                                  className="font-medium text-neutral-900 hover:text-primary"
                                >
                                  {item.item_name}
                                </Link>
                                {item.item_sku && (
                                  <p className="text-xs text-neutral-500">SKU: {item.item_sku}</p>
                                )}
                                {/* Location badge for picking */}
                                {item.locations && item.locations.length > 0 && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3 w-3 text-primary" />
                                    <span className="text-xs text-primary font-medium">
                                      {item.locations[0].location_name}
                                    </span>
                                    {item.locations.length > 1 && (
                                      <span className="text-xs text-neutral-400">
                                        +{item.locations.length - 1} more
                                      </span>
                                    )}
                                  </div>
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
                                <div className="flex items-center justify-end gap-2">
                                  {/* Quantity input for partial picking */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = getPickQuantity(item.id, item.requested_quantity, item.picked_quantity)
                                        const remaining = item.requested_quantity - item.picked_quantity
                                        updatePickQuantity(item.id, current - 1, remaining)
                                      }}
                                      disabled={pickingItemId === item.id || getPickQuantity(item.id, item.requested_quantity, item.picked_quantity) <= 1}
                                      className="h-7 w-7 rounded border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <input
                                      type="number"
                                      min={1}
                                      max={item.requested_quantity - item.picked_quantity}
                                      value={getPickQuantity(item.id, item.requested_quantity, item.picked_quantity)}
                                      onChange={(e) => {
                                        const remaining = item.requested_quantity - item.picked_quantity
                                        updatePickQuantity(item.id, parseInt(e.target.value) || 1, remaining)
                                      }}
                                      className="w-14 h-7 text-center text-sm border border-neutral-200 rounded focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const current = getPickQuantity(item.id, item.requested_quantity, item.picked_quantity)
                                        const remaining = item.requested_quantity - item.picked_quantity
                                        updatePickQuantity(item.id, current + 1, remaining)
                                      }}
                                      disabled={pickingItemId === item.id || getPickQuantity(item.id, item.requested_quantity, item.picked_quantity) >= (item.requested_quantity - item.picked_quantity)}
                                      className="h-7 w-7 rounded border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handlePickItem(item.id, getPickQuantity(item.id, item.requested_quantity, item.picked_quantity))}
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
                                </div>
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

            {/* Serial/Lot Tracking Section for tracked items */}
            {items.filter(item => item.tracking_mode !== 'none').length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium text-neutral-700">Serial/Lot Allocation</h4>
                <div className="space-y-2">
                  {items.filter(item => item.tracking_mode !== 'none').map((item) => (
                    <PickListItemTracking
                      key={item.id}
                      pickListItemId={item.id}
                      itemId={item.item_id}
                      itemName={item.item_name}
                      itemSku={item.item_sku || undefined}
                      requestedQuantity={item.requested_quantity}
                      trackingType={getTrackingType(item.tracking_mode)}
                      isEditable={isEditable}
                      onAllocationChange={(complete) => handleTrackingChange(item.id, complete)}
                    />
                  ))}
                </div>
                {!allTrackingComplete && isEditable && (
                  <p className="text-xs text-amber-600 mt-2">
                    Please assign serial/lot numbers for all tracked items before completing the pick list.
                  </p>
                )}
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
