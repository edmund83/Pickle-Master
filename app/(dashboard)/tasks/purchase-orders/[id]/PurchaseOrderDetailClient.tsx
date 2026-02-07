'use client'

/**
 * Layout tested at tablet benchmark:
 * - Portrait: 820×1180 (iPad) — below lg, uses bottom nav + FAB; pb-16 / pb-28 so FAB does not overlap.
 * - Landscape: 1180×820 — at/above lg uses desktop sidebar (no bottom nav); 820px height needs scroll.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  Download,
  Camera,
  X,
  Info,
  MoreVertical,
  Zap,
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { FormattedShortDate, FormattedDateTime } from '@/components/formatting/FormattedDate'
import { useFormatting } from '@/hooks/useFormatting'
import { useTenantCompanyDetails, useTenantName, useTenantLogoUrl } from '@/contexts/TenantSettingsContext'
import {
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
  addPurchaseOrderItem,
  removePurchaseOrderItem,
  updatePurchaseOrderItem,
  searchInventoryItemsForPO,
  createVendor
} from '@/app/actions/purchase-orders'
import { createReceive } from '@/app/actions/receives'
import type { PurchaseOrderWithDetails, TeamMember, Vendor } from './page'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'
import { ChatterPanel } from '@/components/chatter'
import { VendorFormDialog, type VendorFormData } from '@/components/settings/vendors/VendorFormDialog'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { buildCompanyBranding, downloadPdfBlob, fetchImageDataUrl, generatePurchaseOrderPDF } from '@/lib/documents/pdf-generator'

interface Location {
  id: string
  name: string
  type: string
}

interface PurchaseOrderDetailClientProps {
  purchaseOrder: PurchaseOrderWithDetails
  teamMembers: TeamMember[]
  vendors: Vendor[]
  locations: Location[]
  createdByName: string | null
  currentUserId: string | null
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  draft: { icon: Clock, color: 'text-neutral-600', bgColor: 'bg-neutral-100', label: 'Draft' },
  submitted: { icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Submitted' },
  pending_approval: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Pending Approval' },
  confirmed: { icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Confirmed' },
  partial: { icon: Truck, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Partially Received' },
  received: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Received' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' },
}

export function PurchaseOrderDetailClient({
  purchaseOrder,
  teamMembers,
  vendors,
  locations,
  createdByName,
  currentUserId
}: PurchaseOrderDetailClientProps) {
  const router = useRouter()
  const { formatCurrency, formatDate, formatShortDate } = useFormatting()
  const tenantName = useTenantName()
  const tenantLogoUrl = useTenantLogoUrl()
  const companyDetails = useTenantCompanyDetails()
  const feedback = useFeedback()
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
  const [vendorPaymentTerms, setVendorPaymentTerms] = useState(purchaseOrder.vendor?.payment_terms || '')

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
  // When false, show vendor address as delivery summary; when true, show full delivery form
  const [useDifferentShipTo, setUseDifferentShipTo] = useState(true)

  // Menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Vendor search state
  const [vendorSearchQuery, setVendorSearchQuery] = useState('')
  const [showVendorDropdown, setShowVendorDropdown] = useState(false)
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [savingVendor, setSavingVendor] = useState(false)

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

  // Debounced save state
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const performSaveRef = useRef<() => void>(() => {})

  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  // Create Receive modal – optional receive options
  const [showCreateReceiveModal, setShowCreateReceiveModal] = useState(false)
  const [receiveDeliveryNote, setReceiveDeliveryNote] = useState('')
  const [receiveCarrier, setReceiveCarrier] = useState('')
  const [receiveTracking, setReceiveTracking] = useState('')
  const [receiveDefaultLocationId, setReceiveDefaultLocationId] = useState('')
  const [receiveNotes, setReceiveNotes] = useState('')

  const status = purchaseOrder.status || 'draft'
  const isDraft = status === 'draft'
  const canReceive = ['submitted', 'confirmed', 'partial'].includes(status)
  const canDownloadPdf = purchaseOrder.items.length > 0

  // Filter vendors based on search query
  const filteredVendors = vendorSearchQuery.trim()
    ? vendors.filter(v =>
        v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) ||
        (v.email && v.email.toLowerCase().includes(vendorSearchQuery.toLowerCase()))
      )
    : vendors

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

  // Collect all updates and save (called by debounced timer or explicit save)
  const performSave = useCallback(async () => {
    if (!isDirty) return

    setIsSaving(true)
    try {
      const updates: Record<string, string | null> = {
        order_number: orderNumber || null,
        expected_date: expectedDate || null,
        notes: notes || null,
        vendor_id: vendorId || null,
        ship_to_name: shipToName || null,
        ship_to_address1: shipToAddress1 || null,
        ship_to_address2: shipToAddress2 || null,
        ship_to_city: shipToCity || null,
        ship_to_state: shipToState || null,
        ship_to_postal_code: shipToPostalCode || null,
        ship_to_country: shipToCountry || null,
        bill_to_name: billToName || null,
        bill_to_address1: billToAddress1 || null,
        bill_to_address2: billToAddress2 || null,
        bill_to_city: billToCity || null,
        bill_to_state: billToState || null,
        bill_to_postal_code: billToPostalCode || null,
        bill_to_country: billToCountry || null,
      }

      await updatePurchaseOrder(purchaseOrder.id, updates)
      setIsDirty(false)
      router.refresh()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save changes')
      feedback.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }, [
    isDirty, purchaseOrder.id, router,
    orderNumber, expectedDate, notes, vendorId,
    shipToName, shipToAddress1, shipToAddress2, shipToCity, shipToState, shipToPostalCode, shipToCountry,
    billToName, billToAddress1, billToAddress2, billToCity, billToState, billToPostalCode, billToCountry
  ])

  // Keep ref in sync so the debounce timer always calls the latest version
  useEffect(() => {
    performSaveRef.current = performSave
  }, [performSave])

  // Trigger debounced save when any field changes
  const scheduleSave = useCallback(() => {
    setIsDirty(true)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      performSaveRef.current()
    }, 1500) // Save after 1.5s of no changes
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  // Save immediately on certain actions (vendor select, immediate save needed)
  async function saveFieldImmediate(field: string, value: string | null) {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    setIsSaving(true)
    try {
      const updates: Record<string, string | null> = {}
      if (field === 'vendor') {
        updates.vendor_id = value
      }
      await updatePurchaseOrder(purchaseOrder.id, updates)
      setIsDirty(false)
      router.refresh()
    } catch (err) {
      console.error('Save field error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedVendor = vendorId ? vendors.find(v => v.id === vendorId) : null
  const vendorHasAddress = selectedVendor && (selectedVendor.address_line1 || selectedVendor.city || selectedVendor.country)
  const showShipToSummaryOnly = vendorHasAddress && !useDifferentShipTo

  function useVendorAddress() {
    if (!selectedVendor) return
    setShipToName(selectedVendor.name || '')
    setShipToAddress1(selectedVendor.address_line1 || '')
    setShipToAddress2(selectedVendor.address_line2 || '')
    setShipToCity(selectedVendor.city || '')
    setShipToState(selectedVendor.state || '')
    setShipToPostalCode(selectedVendor.postal_code || '')
    setShipToCountry(selectedVendor.country || '')
    setUseDifferentShipTo(false)
    scheduleSave()
  }

  async function handleVendorSelect(selectedVendorId: string) {
    const vendor = vendors.find(v => v.id === selectedVendorId)
    if (vendor) {
      setVendorId(vendor.id)
      setVendorName(vendor.name)
      setVendorEmail(vendor.email || '')
      setVendorPhone(vendor.phone || '')
      setVendorPaymentTerms(vendor.payment_terms || '')
      if (vendor.address_line1 || vendor.city || vendor.country) {
        setShipToName(vendor.name || '')
        setShipToAddress1(vendor.address_line1 || '')
        setShipToAddress2(vendor.address_line2 || '')
        setShipToCity(vendor.city || '')
        setShipToState(vendor.state || '')
        setShipToPostalCode(vendor.postal_code || '')
        setShipToCountry(vendor.country || '')
        setUseDifferentShipTo(false)
      } else {
        setUseDifferentShipTo(true)
      }
      await saveFieldImmediate('vendor', vendor.id)
    }
  }

  async function handleCreateVendor(data: VendorFormData) {
    setSavingVendor(true)
    try {
      const result = await createVendor({
        name: data.name,
        contact_name: data.contact_name || null,
        email: data.email || null,
        phone: data.phone || null,
        address_line1: data.address_line1 || null,
        city: data.city || null,
        country: data.country || null,
        notes: data.notes || null
      })

      if (result.success && result.vendor_id) {
        // Set the new vendor as selected
        setVendorId(result.vendor_id)
        setVendorName(data.name)
        setVendorEmail(data.email || '')
        setVendorPhone(data.phone || '')
        setVendorPaymentTerms('')
        setVendorSearchQuery('')
        setShowVendorForm(false)
        await saveFieldImmediate('vendor', result.vendor_id)
        router.refresh() // Refresh to get updated vendors list
      } else {
        throw new Error(result.error || 'Failed to create vendor')
      }
    } finally {
      setSavingVendor(false)
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
        feedback.success('Item added')
        router.refresh()
        setSearchQuery('')
        setSearchResults([])
      } else {
        const errorMsg = result.error || 'Failed to add item'
        setError(errorMsg)
        feedback.error(errorMsg)
      }
    } catch (err) {
      console.error('Add item error:', err)
      feedback.error('Failed to add item')
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
      feedback.warning(`Item with barcode "${result.code}" is already in the purchase order`)
    } else {
      // No match found
      feedback.warning(`No item found with barcode: ${result.code}`)
    }
  }

  async function handleRemoveItem(itemId: string) {
    setActionLoading(`remove-${itemId}`)
    try {
      const result = await removePurchaseOrderItem(itemId)
      if (result.success) {
        feedback.success('Item removed')
        router.refresh()
      } else {
        const errorMsg = result.error || 'Failed to remove item'
        setError(errorMsg)
        feedback.error(errorMsg)
      }
    } catch (err) {
      console.error('Remove item error:', err)
      feedback.error('Failed to remove item')
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
        const errorMsg = result.error || 'Failed to update item'
        setError(errorMsg)
        feedback.error(errorMsg)
      }
    } catch (err) {
      console.error('Update item error:', err)
      feedback.error('Failed to update item')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleStatusChange(newStatus: string) {
    setActionLoading('status')
    setError(null)

    const result = await updatePurchaseOrderStatus(purchaseOrder.id, newStatus)

    if (result.success) {
      feedback.success('Status updated')
      router.refresh()
    } else {
      const errorMsg = result.error || 'Failed to update status'
      setError(errorMsg)
      feedback.error(errorMsg)
    }

    setActionLoading(null)
  }

  async function handleDelete() {
    setShowDeleteConfirm(false)
    setActionLoading('delete')
    setError(null)

    const result = await deletePurchaseOrder(purchaseOrder.id)

    if (result.success) {
      feedback.success('Purchase order deleted')
      router.push('/tasks/purchase-orders')
    } else {
      const errorMsg = result.error || 'Failed to delete purchase order'
      setError(errorMsg)
      feedback.error(errorMsg)
      setActionLoading(null)
    }
  }

  async function handleCancel() {
    setShowCancelConfirm(false)
    await handleStatusChange('cancelled')
  }

  async function handleCreateReceive(opts?: {
    delivery_note_number?: string
    carrier?: string
    tracking_number?: string
    default_location_id?: string
    notes?: string
  }) {
    setActionLoading('create-receive')
    setError(null)

    const result = await createReceive({
      purchase_order_id: purchaseOrder.id,
      delivery_note_number: opts?.delivery_note_number || null,
      carrier: opts?.carrier || null,
      tracking_number: opts?.tracking_number || null,
      default_location_id: opts?.default_location_id || null,
      notes: opts?.notes || null
    })

    if (result.success && result.receive_id) {
      setShowCreateReceiveModal(false)
      setReceiveDeliveryNote('')
      setReceiveCarrier('')
      setReceiveTracking('')
      setReceiveDefaultLocationId('')
      setReceiveNotes('')
      feedback.success('Receive created')
      router.push(`/tasks/receives/${result.receive_id}`)
    } else {
      const errorMsg = result.error || 'Failed to create receive'
      setError(errorMsg)
      feedback.error(errorMsg)
      setActionLoading(null)
    }
  }

  function openCreateReceiveModal() {
    setReceiveNotes(purchaseOrder.notes || '')
    setShowCreateReceiveModal(true)
  }

  async function handleDownloadPDF() {
    if (!canDownloadPdf) return
    setActionLoading('download-pdf')
    try {
      const logoDataUrl = tenantLogoUrl ? await fetchImageDataUrl(tenantLogoUrl) : null
      const branding = buildCompanyBranding(tenantName, logoDataUrl, companyDetails)
      const pdfBlob = generatePurchaseOrderPDF(
        purchaseOrder,
        {
          formatCurrency,
          formatDate,
          formatShortDate,
        },
        branding
      )
      const baseName = purchaseOrder.display_id || purchaseOrder.order_number || purchaseOrder.id
      const safeName = baseName.replace(/\s+/g, '-').toLowerCase()
      downloadPdfBlob(pdfBlob, `purchase-order-${safeName}.pdf`)
    } catch (err) {
      console.error('Failed to generate purchase order PDF:', err)
      feedback.error('Failed to generate PDF')
    } finally {
      setActionLoading(null)
    }
  }

  // Validation for draft mode
  const isValid = vendorId && purchaseOrder.items.length > 0
  const missingFields: string[] = []
  if (!vendorId) missingFields.push('Vendor')

  // Draft Mode UI - Two Column Layout (matching Pick List)
  if (isDraft) {
    return (
      <div className="flex-1 overflow-y-auto bg-neutral-50 pb-16 lg:pb-0">
        {/* Header - Streamlined */}
        <div className="border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/tasks/purchase-orders" className="text-neutral-500 hover:text-neutral-700 flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-base sm:text-xl font-semibold text-neutral-900 min-w-0 max-w-[200px] truncate sm:max-w-none sm:overflow-visible sm:whitespace-normal">
                    {purchaseOrder.display_id || orderNumber || 'New Purchase Order'}
                  </h1>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium flex-shrink-0 ${statusConfig[status]?.bgColor} ${statusConfig[status]?.color}`}>
                    {statusConfig[status]?.label || status}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-0.5 truncate">
                  {purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? 's' : ''} · {formatCurrency(subtotal)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={!canDownloadPdf || actionLoading !== null}
                className="px-2 sm:px-3"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden min-[400px]:inline">Download PDF</span>
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
                          setShowDeleteConfirm(true)
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

        {/* Single column layout - same UX as SO/DO/Invoice. Extra bottom padding on mobile/tablet so FAB does not overlap form fields. */}
        <div className="p-4 sm:p-6 pb-28 lg:pb-6">
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Validation */}
            {!isValid && missingFields.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Required to submit:</p>
                  <p className="text-sm text-amber-700">{missingFields.join(', ')}</p>
                  {purchaseOrder.items.length === 0 && (
                    <p className="text-sm text-amber-700">At least 1 item</p>
                  )}
                </div>
              </div>
            )}

            {/* Vendor Card */}
              <Card className={`border-2 shadow-md ${!vendorId ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/30' : 'border-primary/10 bg-gradient-to-br from-white to-primary/5'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Vendor <span className="text-red-500">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vendorId ? (
                    // Selected vendor display
                    <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-neutral-900">{vendorName}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                            {vendorEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {vendorEmail}
                              </span>
                            )}
                            {vendorPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {vendorPhone}
                              </span>
                            )}
                            {vendorPaymentTerms && (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <CreditCard className="h-3 w-3" />
                                {vendorPaymentTerms}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVendorId('')
                          setVendorName('')
                          setVendorEmail('')
                          setVendorPhone('')
                          setVendorPaymentTerms('')
                          setVendorSearchQuery('')
                          saveFieldImmediate('vendor', '')
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    // Searchable vendor selector
                    <div className="relative">
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          value={vendorSearchQuery}
                          onChange={(e) => {
                            setVendorSearchQuery(e.target.value)
                            setShowVendorDropdown(e.target.value.trim().length > 0)
                          }}
                          placeholder="Type to search vendors..."
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${!vendorId ? 'border-amber-300' : 'border-neutral-200'}`}
                        />
                      </div>

                      {/* Vendor Dropdown - only show when typing */}
                      {showVendorDropdown && vendorSearchQuery.trim() && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowVendorDropdown(false)}
                          />
                          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white rounded-lg border border-neutral-200 shadow-lg max-h-72 overflow-y-auto">
                            {filteredVendors.length > 0 && (
                              <>
                                {filteredVendors.slice(0, 10).map((vendor) => (
                                  <button
                                    key={vendor.id}
                                    type="button"
                                    onClick={() => {
                                      handleVendorSelect(vendor.id)
                                      setShowVendorDropdown(false)
                                      setVendorSearchQuery('')
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-left border-b border-neutral-100"
                                  >
                                    <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                                      <Building2 className="h-4 w-4 text-neutral-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-neutral-900 truncate">{vendor.name}</p>
                                      {vendor.email && (
                                        <p className="text-xs text-neutral-500 truncate">{vendor.email}</p>
                                      )}
                                    </div>
                                  </button>
                                ))}
                                {filteredVendors.length > 10 && (
                                  <div className="px-4 py-2 text-xs text-neutral-500 bg-neutral-50 border-t border-neutral-100">
                                    +{filteredVendors.length - 10} more results. Type more to narrow down.
                                  </div>
                                )}
                              </>
                            )}
                            {/* Create new vendor option */}
                            <button
                              type="button"
                              onClick={() => {
                                setShowVendorDropdown(false)
                                setShowVendorForm(true)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 text-left border-t border-neutral-200 bg-neutral-50"
                            >
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Plus className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-primary">Create new vendor</p>
                                <p className="text-xs text-neutral-500">
                                  {filteredVendors.length === 0
                                    ? `Add "${vendorSearchQuery}" as a new vendor`
                                    : "Can't find what you're looking for?"}
                                </p>
                              </div>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Items Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items
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
                      title="Scan barcode"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="bg-white rounded-lg border border-neutral-200 shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleAddItem(item)}
                          disabled={actionLoading === 'add-item'}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-left border-b border-neutral-100 last:border-0"
                        >
                          <ItemThumbnail
                            src={item.image_urls?.[0]}
                            alt={item.name}
                            size="sm"
                          />
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
                  <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLowStock}
                      onChange={(e) => setShowLowStock(e.target.checked)}
                      className="rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    Only show low-stock items
                  </label>

                  {/* Items List */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {purchaseOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors"
                      >
                        <ItemThumbnail
                          src={item.inventory_item?.image_urls?.[0]}
                          alt={item.item_name}
                          size="md"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-neutral-900 truncate">{item.item_name}</p>
                          {item.sku && <p className="text-xs text-neutral-500 truncate">SKU: {item.sku}</p>}
                          <p className="text-xs text-neutral-500">{formatCurrency(item.unit_price)} each</p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 flex-shrink-0">
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

                        {/* Amount and Remove */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-medium text-neutral-900">{formatCurrency(item.ordered_quantity * item.unit_price)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={actionLoading === `remove-${item.id}`}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {actionLoading === `remove-${item.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}

                    {purchaseOrder.items.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-neutral-500">No items added yet</p>
                        <p className="text-sm text-neutral-400 mt-1">Search above to add items to order</p>
                      </div>
                    )}
                  </div>

                  {/* Subtotal */}
                  {purchaseOrder.items.length > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                      <span className="text-sm font-medium text-neutral-600">
                        Subtotal ({purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-lg font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

            {/* Delivery address (Ship To) - vendor default when available */}
            <CollapsibleSection
              title="Delivery address"
              icon={MapPin}
              defaultExpanded={Boolean(!showShipToSummaryOnly && (shipToName || shipToAddress1))}
              hasContent={Boolean(shipToName || shipToAddress1 || showShipToSummaryOnly)}
            >
              {showShipToSummaryOnly ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700">
                    <p className="font-medium text-neutral-900">{shipToName || selectedVendor?.name}</p>
                    {shipToAddress1 && <p>{shipToAddress1}</p>}
                    {shipToAddress2 && <p>{shipToAddress2}</p>}
                    {[shipToCity, shipToState, shipToPostalCode, shipToCountry].filter(Boolean).length > 0 && (
                      <p>{[shipToCity, shipToState, shipToPostalCode, shipToCountry].filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseDifferentShipTo(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Use a different delivery address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorHasAddress && (
                    <button
                      type="button"
                      onClick={useVendorAddress}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Use vendor address
                    </button>
                  )}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={shipToName}
                        onChange={(e) => { setShipToName(e.target.value); scheduleSave() }}
                        placeholder="Enter name"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-500 mb-1">Address</label>
                      <input
                        type="text"
                        value={shipToAddress1}
                        onChange={(e) => { setShipToAddress1(e.target.value); scheduleSave() }}
                        placeholder="Street address"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      value={shipToAddress2}
                      onChange={(e) => { setShipToAddress2(e.target.value); scheduleSave() }}
                      placeholder="Apt, suite, unit (optional)"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={shipToCity}
                        onChange={(e) => { setShipToCity(e.target.value); scheduleSave() }}
                        placeholder="City"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={shipToState}
                        onChange={(e) => { setShipToState(e.target.value); scheduleSave() }}
                        placeholder="State"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={shipToPostalCode}
                        onChange={(e) => { setShipToPostalCode(e.target.value); scheduleSave() }}
                        placeholder="Postal Code"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      />
                      <select
                        value={shipToCountry}
                        onChange={(e) => { setShipToCountry(e.target.value); scheduleSave() }}
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
                  </div>
                </div>
              )}
            </CollapsibleSection>

            {/* Billing address (Bill To) */}
            <CollapsibleSection
              title="Billing address"
              icon={FileText}
              defaultExpanded={false}
              hasContent={Boolean(billToName || billToAddress1)}
            >
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsShipTo}
                    onChange={(e) => handleSameAsShipTo(e.target.checked)}
                    className="rounded border-neutral-300 text-primary focus:ring-primary"
                  />
                  Same as delivery address
                </label>

                {sameAsShipTo ? (
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm text-neutral-600">
                    <p className="font-medium text-neutral-700">{billToName || 'No name provided'}</p>
                    {billToAddress1 && <p>{billToAddress1}</p>}
                    {[billToCity, billToState, billToPostalCode].filter(Boolean).length > 0 && (
                      <p>{[billToCity, billToState, billToPostalCode].filter(Boolean).join(', ')}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={billToName}
                      onChange={(e) => { setBillToName(e.target.value); scheduleSave() }}
                      placeholder="Name"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={billToAddress1}
                      onChange={(e) => { setBillToAddress1(e.target.value); scheduleSave() }}
                      placeholder="Address"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={billToCity}
                        onChange={(e) => { setBillToCity(e.target.value); scheduleSave() }}
                        placeholder="City"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={billToPostalCode}
                        onChange={(e) => { setBillToPostalCode(e.target.value); scheduleSave() }}
                        placeholder="Postal Code"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Expected Date */}
            <Card>
              <CardContent className="py-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  <Calendar className="h-4 w-4 inline mr-1.5" />
                  Expected Date
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => { setExpectedDate(e.target.value); scheduleSave() }}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </CardContent>
            </Card>

            {/* Notes - last before save/metadata */}
            <CollapsibleSection
              title="Notes"
              icon={FileText}
              defaultExpanded={Boolean(notes)}
              hasContent={Boolean(notes)}
            >
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); scheduleSave() }}
                placeholder="Message to vendor..."
                rows={3}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none"
              />
            </CollapsibleSection>

            {/* Save Status Indicator */}
            {isDraft && (isDirty || isSaving) && (
              <div className="flex items-center justify-between px-1 py-2 text-xs">
                {isSaving ? (
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving...
                  </span>
                ) : isDirty ? (
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <Clock className="h-3 w-3" />
                    Unsaved changes
                  </span>
                ) : null}
                {isDirty && !isSaving && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={performSave}
                    className="h-6 text-xs"
                  >
                    Save now
                  </Button>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-neutral-500 space-y-1 px-1">
              <p>Created by: {createdByName || 'Unknown'}</p>
              <p>Last updated: <FormattedShortDate date={purchaseOrder.updated_at || purchaseOrder.created_at || new Date().toISOString()} /></p>
            </div>
          </div>
        </div>

        {/* Footer Actions - pb-16 on scroll container above keeps this above bottom nav when scrolled to end on mobile/tablet */}
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-4 py-4 sm:px-6 safe-area-inset-bottom">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - validation status */}
            <div className="flex items-center gap-3">
              {isValid ? (
                <div className="flex items-center gap-1.5 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Ready to submit</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Complete required fields</span>
                </div>
              )}
            </div>

            {/* Right side - actions */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-neutral-500">{purchaseOrder.items.length} item{purchaseOrder.items.length !== 1 ? 's' : ''}</p>
                <p className="text-lg font-semibold text-neutral-900">{formatCurrency(subtotal)}</p>
              </div>
              <Button
                onClick={() => handleStatusChange('submitted')}
                disabled={actionLoading !== null || !isValid}
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

        {/* Vendor Form Dialog */}
        <VendorFormDialog
          isOpen={showVendorForm}
          onClose={() => setShowVendorForm(false)}
          onSave={handleCreateVendor}
          saving={savingVendor}
        />
      </div>
    )
  }

  // Non-draft view (Submitted, Confirmed, Received, Cancelled)
  const StatusIcon = statusConfig[status]?.icon || Clock

  return (
    <div className="flex-1 overflow-y-auto pb-16 lg:pb-0">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-4 py-4 sm:px-6">
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
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={!canDownloadPdf || actionLoading !== null}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            {(status === 'submitted' || status === 'pending_approval') && (
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
                  Approve Order
                </Button>
              </>
            )}

            {canReceive && (
              <Button
                onClick={openCreateReceiveModal}
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

            {['submitted', 'pending_approval', 'confirmed'].includes(status) && (
              <Button
                variant="ghost"
                onClick={() => setShowCancelConfirm(true)}
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
        <div className="mx-auto max-w-2xl space-y-6">
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
                                <ItemThumbnail
                                  src={item.inventory_item?.image_urls?.[0]}
                                  alt={item.item_name}
                                  size="md"
                                />
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

            {/* Delivery address */}
            {purchaseOrder.ship_to_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery address
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

            {/* Billing address */}
            {purchaseOrder.bill_to_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Billing address
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

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Purchase Order"
        description="Are you sure you want to delete this purchase order? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Cancel Purchase Order"
        description="Are you sure you want to cancel this purchase order? This will mark it as cancelled."
        confirmLabel="Cancel Order"
        variant="warning"
      />

      {/* Create Receive modal – optional receive options */}
      {showCreateReceiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-neutral-900">Create Receive</h2>
              <button
                type="button"
                onClick={() => setShowCreateReceiveModal(false)}
                disabled={actionLoading === 'create-receive'}
                className="p-1.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-neutral-600">
                Optionally fill in delivery details below. You can also edit them on the receive page after creation.
              </p>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Delivery note #</label>
                <input
                  type="text"
                  value={receiveDeliveryNote}
                  onChange={(e) => setReceiveDeliveryNote(e.target.value)}
                  placeholder="Supplier delivery note ref"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Carrier</label>
                <input
                  type="text"
                  value={receiveCarrier}
                  onChange={(e) => setReceiveCarrier(e.target.value)}
                  placeholder="e.g. DHL, FedEx"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Tracking #</label>
                <input
                  type="text"
                  value={receiveTracking}
                  onChange={(e) => setReceiveTracking(e.target.value)}
                  placeholder="Shipment tracking number"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Default folder</label>
                <select
                  value={receiveDefaultLocationId}
                  onChange={(e) => setReceiveDefaultLocationId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  <option value="">Select...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Notes</label>
                <textarea
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  placeholder="Receiving notes..."
                  rows={2}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none"
                />
              </div>
            </div>
            <div className="border-t border-neutral-200 px-4 py-3 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateReceiveModal(false)}
                disabled={actionLoading === 'create-receive'}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCreateReceive({
                  delivery_note_number: receiveDeliveryNote.trim() || undefined,
                  carrier: receiveCarrier.trim() || undefined,
                  tracking_number: receiveTracking.trim() || undefined,
                  default_location_id: receiveDefaultLocationId || undefined,
                  notes: receiveNotes.trim() || undefined
                })}
                disabled={actionLoading === 'create-receive'}
              >
                {actionLoading === 'create-receive' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Package className="mr-2 h-4 w-4" />
                )}
                Create Receive
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
