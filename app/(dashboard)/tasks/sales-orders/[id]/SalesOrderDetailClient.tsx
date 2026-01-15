'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
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
  Camera,
  X,
  MoreVertical,
  Zap,
  ClipboardList,
  Flag,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import { useFormatting } from '@/hooks/useFormatting'
import {
  updateSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
  addSalesOrderItem,
  removeSalesOrderItem,
  updateSalesOrderItem,
  searchInventoryItemsForSO,
} from '@/app/actions/sales-orders'
import { createCustomer, type CustomerFormData } from '@/app/actions/customers'
import type { SalesOrderWithDetails, TeamMember, Customer, Location } from './page'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'
import { ChatterPanel } from '@/components/chatter'
import { CustomerFormDialog } from '@/components/partners/customers/CustomerFormDialog'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface SalesOrderDetailClientProps {
  salesOrder: SalesOrderWithDetails
  teamMembers: TeamMember[]
  customers: Customer[]
  locations: Location[]
  createdByName: string | null
  assignedToName: string | null
  currentUserId: string | null
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  draft: { icon: Clock, color: 'text-neutral-600', bgColor: 'bg-neutral-100', label: 'Draft' },
  submitted: { icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Submitted' },
  confirmed: { icon: Check, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Confirmed' },
  picking: { icon: ClipboardList, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Picking' },
  picked: { icon: Package, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Picked' },
  partial_shipped: { icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Partial Shipped' },
  shipped: { icon: Truck, color: 'text-cyan-600', bgColor: 'bg-cyan-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-teal-600', bgColor: 'bg-teal-100', label: 'Delivered' },
  completed: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Cancelled' },
}

const priorityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  low: { color: 'text-neutral-600', bgColor: 'bg-neutral-100', label: 'Low' },
  normal: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Normal' },
  high: { color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'High' },
  urgent: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Urgent' },
}

export function SalesOrderDetailClient({
  salesOrder,
  teamMembers,
  customers,
  locations,
  createdByName,
  assignedToName,
  currentUserId
}: SalesOrderDetailClientProps) {
  const router = useRouter()
  const { formatCurrency } = useFormatting()
  const feedback = useFeedback()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state for draft mode
  const [orderNumber, setOrderNumber] = useState(salesOrder.order_number || '')
  const [orderDate, setOrderDate] = useState(salesOrder.order_date || '')
  const [requestedDate, setRequestedDate] = useState(salesOrder.requested_date || '')
  const [promisedDate, setPromisedDate] = useState(salesOrder.promised_date || '')
  const [priority, setPriority] = useState(salesOrder.priority || 'normal')
  const [internalNotes, setInternalNotes] = useState(salesOrder.internal_notes || '')
  const [customerNotes, setCustomerNotes] = useState(salesOrder.customer_notes || '')
  const [sourceLocationId, setSourceLocationId] = useState(salesOrder.source_location_id || '')

  // Customer fields
  const [customerId, setCustomerId] = useState(salesOrder.customer_id || '')
  const [customerName, setCustomerName] = useState(salesOrder.customer?.name || '')
  const [customerEmail, setCustomerEmail] = useState(salesOrder.customer?.email || '')
  const [customerPhone, setCustomerPhone] = useState(salesOrder.customer?.phone || '')

  // Ship To fields
  const [shipToName, setShipToName] = useState(salesOrder.ship_to_name || '')
  const [shipToAddress1, setShipToAddress1] = useState(salesOrder.ship_to_address1 || '')
  const [shipToAddress2, setShipToAddress2] = useState(salesOrder.ship_to_address2 || '')
  const [shipToCity, setShipToCity] = useState(salesOrder.ship_to_city || '')
  const [shipToState, setShipToState] = useState(salesOrder.ship_to_state || '')
  const [shipToPostalCode, setShipToPostalCode] = useState(salesOrder.ship_to_postal_code || '')
  const [shipToCountry, setShipToCountry] = useState(salesOrder.ship_to_country || '')
  const [shipToPhone, setShipToPhone] = useState(salesOrder.ship_to_phone || '')

  // Bill To fields
  const [billToName, setBillToName] = useState(salesOrder.bill_to_name || '')
  const [billToAddress1, setBillToAddress1] = useState(salesOrder.bill_to_address1 || '')
  const [billToAddress2, setBillToAddress2] = useState(salesOrder.bill_to_address2 || '')
  const [billToCity, setBillToCity] = useState(salesOrder.bill_to_city || '')
  const [billToState, setBillToState] = useState(salesOrder.bill_to_state || '')
  const [billToPostalCode, setBillToPostalCode] = useState(salesOrder.bill_to_postal_code || '')
  const [billToCountry, setBillToCountry] = useState(salesOrder.bill_to_country || '')

  // Same as Ship To state
  const [sameAsShipTo, setSameAsShipTo] = useState(false)

  // Menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Customer search state
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [savingCustomer, setSavingCustomer] = useState(false)

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
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  // Debounced save state
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const status = salesOrder.status || 'draft'
  const isDraft = status === 'draft'
  const isSubmitted = status === 'submitted'
  const canEdit = ['draft', 'submitted'].includes(status)

  // Filter customers based on search query
  const filteredCustomers = customerSearchQuery.trim()
    ? customers.filter(c =>
        c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(customerSearchQuery.toLowerCase())) ||
        (c.customer_code && c.customer_code.toLowerCase().includes(customerSearchQuery.toLowerCase()))
      )
    : customers

  // Calculate totals
  const subtotal = salesOrder.items.reduce(
    (sum, item) => sum + item.line_total,
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
      const results = await searchInventoryItemsForSO(query)
      // Filter out items already in the SO
      const existingIds = new Set(salesOrder.items.filter(i => i.item_id).map(i => i.item_id))
      setSearchResults(results.filter((item: { id: string }) => !existingIds.has(item.id)))
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }, [salesOrder.items])

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
        order_date: orderDate || null,
        requested_date: requestedDate || null,
        promised_date: promisedDate || null,
        priority: priority || null,
        internal_notes: internalNotes || null,
        customer_notes: customerNotes || null,
        source_location_id: sourceLocationId || null,
        customer_id: customerId || null,
        ship_to_name: shipToName || null,
        ship_to_address1: shipToAddress1 || null,
        ship_to_address2: shipToAddress2 || null,
        ship_to_city: shipToCity || null,
        ship_to_state: shipToState || null,
        ship_to_postal_code: shipToPostalCode || null,
        ship_to_country: shipToCountry || null,
        ship_to_phone: shipToPhone || null,
        bill_to_name: billToName || null,
        bill_to_address1: billToAddress1 || null,
        bill_to_address2: billToAddress2 || null,
        bill_to_city: billToCity || null,
        bill_to_state: billToState || null,
        bill_to_postal_code: billToPostalCode || null,
        bill_to_country: billToCountry || null,
      }

      await updateSalesOrder(salesOrder.id, updates)
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
    isDirty, salesOrder.id, router, feedback,
    orderNumber, orderDate, requestedDate, promisedDate, priority,
    internalNotes, customerNotes, sourceLocationId, customerId,
    shipToName, shipToAddress1, shipToAddress2, shipToCity, shipToState, shipToPostalCode, shipToCountry, shipToPhone,
    billToName, billToAddress1, billToAddress2, billToCity, billToState, billToPostalCode, billToCountry
  ])

  // Trigger debounced save when any field changes
  const scheduleSave = useCallback(() => {
    setIsDirty(true)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      performSave()
    }, 1500)
  }, [performSave])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  // Save immediately on certain actions
  async function saveFieldImmediate(field: string, value: string | null) {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    setIsSaving(true)
    try {
      const updates: Record<string, string | null> = {}
      if (field === 'customer') {
        updates.customer_id = value
      }
      await updateSalesOrder(salesOrder.id, updates)
      setIsDirty(false)
      router.refresh()
    } catch (err) {
      console.error('Save field error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCustomerSelect(selectedCustomerId: string) {
    const customer = customers.find(c => c.id === selectedCustomerId)
    if (customer) {
      setCustomerId(customer.id)
      setCustomerName(customer.name)
      setCustomerEmail(customer.email || '')
      setCustomerPhone(customer.phone || '')

      // Auto-fill shipping address from customer
      if (customer.shipping_address_line1 || customer.billing_address_line1) {
        const useShipping = !!customer.shipping_address_line1
        setShipToName(customer.name)
        setShipToAddress1(useShipping ? customer.shipping_address_line1 || '' : customer.billing_address_line1 || '')
        setShipToAddress2(useShipping ? customer.shipping_address_line2 || '' : customer.billing_address_line2 || '')
        setShipToCity(useShipping ? customer.shipping_city || '' : customer.billing_city || '')
        setShipToState(useShipping ? customer.shipping_state || '' : customer.billing_state || '')
        setShipToPostalCode(useShipping ? customer.shipping_postal_code || '' : customer.billing_postal_code || '')
        setShipToCountry(useShipping ? customer.shipping_country || '' : customer.billing_country || '')
        setShipToPhone(customer.phone || '')

        // Also set billing
        setBillToName(customer.name)
        setBillToAddress1(customer.billing_address_line1 || '')
        setBillToAddress2(customer.billing_address_line2 || '')
        setBillToCity(customer.billing_city || '')
        setBillToState(customer.billing_state || '')
        setBillToPostalCode(customer.billing_postal_code || '')
        setBillToCountry(customer.billing_country || '')
      }

      await saveFieldImmediate('customer', customer.id)
    }
  }

  async function handleCreateCustomer(data: CustomerFormData) {
    setSavingCustomer(true)
    try {
      const result = await createCustomer({
        name: data.name,
        customer_code: data.customer_code || null,
        contact_name: data.contact_name || null,
        email: data.email || null,
        phone: data.phone || null,
        billing_address_line1: data.billing_address_line1 || null,
        billing_address_line2: data.billing_address_line2 || null,
        billing_city: data.billing_city || null,
        billing_state: data.billing_state || null,
        billing_postal_code: data.billing_postal_code || null,
        billing_country: data.billing_country || null,
        shipping_address_line1: data.shipping_same_as_billing ? data.billing_address_line1 || null : data.shipping_address_line1 || null,
        shipping_address_line2: data.shipping_same_as_billing ? data.billing_address_line2 || null : data.shipping_address_line2 || null,
        shipping_city: data.shipping_same_as_billing ? data.billing_city || null : data.shipping_city || null,
        shipping_state: data.shipping_same_as_billing ? data.billing_state || null : data.shipping_state || null,
        shipping_postal_code: data.shipping_same_as_billing ? data.billing_postal_code || null : data.shipping_postal_code || null,
        shipping_country: data.shipping_same_as_billing ? data.billing_country || null : data.shipping_country || null,
        payment_term_id: data.payment_term_id || null,
        credit_limit: data.credit_limit || null,
        notes: data.notes || null,
      })

      if (result.success && result.customer_id) {
        setCustomerId(result.customer_id)
        setCustomerName(data.name)
        setCustomerEmail(data.email || '')
        setCustomerPhone(data.phone || '')
        setCustomerSearchQuery('')
        setShowCustomerForm(false)
        await saveFieldImmediate('customer', result.customer_id)
        router.refresh()
      } else {
        throw new Error(result.error || 'Failed to create customer')
      }
    } finally {
      setSavingCustomer(false)
    }
  }

  async function handleSameAsShipTo(checked: boolean) {
    setSameAsShipTo(checked)
    if (checked) {
      setBillToName(shipToName)
      setBillToAddress1(shipToAddress1)
      setBillToAddress2(shipToAddress2)
      setBillToCity(shipToCity)
      setBillToState(shipToState)
      setBillToPostalCode(shipToPostalCode)
      setBillToCountry(shipToCountry)
      await updateSalesOrder(salesOrder.id, {
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
      const result = await addSalesOrderItem(salesOrder.id, {
        item_id: item.id,
        item_name: item.name,
        sku: item.sku,
        quantity_ordered: 1,
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

    const foundItems = await searchInventoryItemsForSO(result.code)
    const existingIds = new Set(salesOrder.items.filter(i => i.item_id).map(i => i.item_id))
    const filtered = foundItems.filter((item: { id: string }) => !existingIds.has(item.id))

    if (filtered.length === 1) {
      await handleAddItem(filtered[0])
    } else if (filtered.length > 1) {
      setSearchQuery(result.code)
      setSearchResults(filtered)
    } else if (foundItems.length > 0) {
      feedback.warning(`Item with barcode "${result.code}" is already in the order`)
    } else {
      feedback.warning(`No item found with barcode: ${result.code}`)
    }
  }

  async function handleRemoveItem(itemId: string) {
    setActionLoading(`remove-${itemId}`)
    try {
      const result = await removeSalesOrderItem(itemId)
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
      const result = await updateSalesOrderItem(itemId, { quantity_ordered: quantity })
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

    const result = await updateSalesOrderStatus(salesOrder.id, newStatus)

    if (result.success) {
      feedback.success('Status updated')
      // If transitioning to picking, redirect to the pick list
      if (newStatus === 'picking' && result.pick_list_id) {
        router.push(`/tasks/pick-lists/${result.pick_list_id}`)
        return
      }
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

    const result = await deleteSalesOrder(salesOrder.id)

    if (result.success) {
      feedback.success('Sales order deleted')
      router.push('/tasks/sales-orders')
    } else {
      const errorMsg = result.error || 'Failed to delete sales order'
      setError(errorMsg)
      feedback.error(errorMsg)
      setActionLoading(null)
    }
  }

  async function handleCancel() {
    setShowCancelConfirm(false)
    await handleStatusChange('cancelled')
  }

  // Validation for draft mode
  const isValid = customerId && salesOrder.items.length > 0
  const missingFields: string[] = []
  if (!customerId) missingFields.push('Customer')

  // Draft Mode UI - Two Column Layout
  if (isDraft || (isSubmitted && canEdit)) {
    return (
      <div className="flex-1 overflow-y-auto bg-neutral-50">
        {/* Header */}
        <div className="border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tasks/sales-orders" className="text-neutral-500 hover:text-neutral-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-neutral-900">
                    {salesOrder.display_id || orderNumber || 'New Sales Order'}
                  </h1>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[status]?.bgColor} ${statusConfig[status]?.color}`}>
                    {statusConfig[status]?.label || status}
                  </span>
                  {priority && priority !== 'normal' && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConfig[priority]?.bgColor} ${priorityConfig[priority]?.color}`}>
                      <Flag className="inline h-3 w-3 mr-1" />
                      {priorityConfig[priority]?.label}
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {salesOrder.items.length} item{salesOrder.items.length !== 1 ? 's' : ''} · {formatCurrency(subtotal)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* More menu */}
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
                      {isDraft && (
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
                      )}
                      {isSubmitted && (
                        <button
                          onClick={() => {
                            setShowMoreMenu(false)
                            handleStatusChange('draft')
                          }}
                          disabled={actionLoading !== null}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Draft
                        </button>
                      )}
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

        {/* Two Column Layout */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Customer + Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Customer Card */}
              <Card className={`border-2 shadow-md ${!customerId ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/30' : 'border-primary/10 bg-gradient-to-br from-white to-primary/5'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Customer <span className="text-red-500">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customerId ? (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-neutral-900">{customerName}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                            {customerEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {customerEmail}
                              </span>
                            )}
                            {customerPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {customerPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerId('')
                          setCustomerName('')
                          setCustomerEmail('')
                          setCustomerPhone('')
                          setCustomerSearchQuery('')
                          saveFieldImmediate('customer', '')
                        }}
                        className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          value={customerSearchQuery}
                          onChange={(e) => {
                            setCustomerSearchQuery(e.target.value)
                            setShowCustomerDropdown(e.target.value.trim().length > 0)
                          }}
                          placeholder="Type to search customers..."
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${!customerId ? 'border-amber-300' : 'border-neutral-200'}`}
                        />
                      </div>

                      {showCustomerDropdown && customerSearchQuery.trim() && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowCustomerDropdown(false)}
                          />
                          <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white rounded-lg border border-neutral-200 shadow-lg max-h-72 overflow-y-auto">
                            {filteredCustomers.length > 0 && (
                              <>
                                {filteredCustomers.slice(0, 10).map((customer) => (
                                  <button
                                    key={customer.id}
                                    type="button"
                                    onClick={() => {
                                      handleCustomerSelect(customer.id)
                                      setShowCustomerDropdown(false)
                                      setCustomerSearchQuery('')
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-left border-b border-neutral-100"
                                  >
                                    <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                                      <Users className="h-4 w-4 text-neutral-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-neutral-900 truncate">{customer.name}</p>
                                      {customer.email && (
                                        <p className="text-xs text-neutral-500 truncate">{customer.email}</p>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomerDropdown(false)
                                setShowCustomerForm(true)
                              }}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 text-left border-t border-neutral-200 bg-neutral-50"
                            >
                              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Plus className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-primary">Create new customer</p>
                                <p className="text-xs text-neutral-500">
                                  {filteredCustomers.length === 0
                                    ? `Add "${customerSearchQuery}" as a new customer`
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
                  {/* Search Input */}
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

                  {/* Items List */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {salesOrder.items.map((item) => (
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
                            onClick={() => handleUpdateItemQuantity(item.id, item.quantity_ordered - 1)}
                            disabled={item.quantity_ordered <= 1 || actionLoading === `qty-${item.id}`}
                            className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity_ordered}</span>
                          <button
                            onClick={() => handleUpdateItemQuantity(item.id, item.quantity_ordered + 1)}
                            disabled={actionLoading === `qty-${item.id}`}
                            className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Amount and Remove */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-medium text-neutral-900">{formatCurrency(item.line_total)}</p>
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

                    {salesOrder.items.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-neutral-500">No items added yet</p>
                        <p className="text-sm text-neutral-400 mt-1">Search above to add items to order</p>
                      </div>
                    )}
                  </div>

                  {/* Subtotal */}
                  {salesOrder.items.length > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                      <span className="text-sm font-medium text-neutral-600">
                        Subtotal ({salesOrder.items.length} item{salesOrder.items.length !== 1 ? 's' : ''})
                      </span>
                      <span className="text-lg font-semibold text-neutral-900">{formatCurrency(subtotal)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Options */}
            <div className="space-y-4">
              {/* Validation Alert */}
              {!isValid && missingFields.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Required to submit:</p>
                    <p className="text-sm text-amber-700">{missingFields.join(', ')}</p>
                    {salesOrder.items.length === 0 && (
                      <p className="text-sm text-amber-700">At least 1 item</p>
                    )}
                  </div>
                </div>
              )}

              {/* Priority & Dates */}
              <Card>
                <CardContent className="py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      <Flag className="h-4 w-4 inline mr-1.5" />
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => { setPriority(e.target.value); scheduleSave() }}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      <Calendar className="h-4 w-4 inline mr-1.5" />
                      Requested Date
                    </label>
                    <input
                      type="date"
                      value={requestedDate}
                      onChange={(e) => { setRequestedDate(e.target.value); scheduleSave() }}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Promised Date
                    </label>
                    <input
                      type="date"
                      value={promisedDate}
                      onChange={(e) => { setPromisedDate(e.target.value); scheduleSave() }}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Ship To Section */}
              <CollapsibleSection
                title="Ship To"
                icon={MapPin}
                defaultExpanded={Boolean(shipToName || shipToAddress1)}
                hasContent={Boolean(shipToName || shipToAddress1)}
              >
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={shipToName}
                    onChange={(e) => { setShipToName(e.target.value); scheduleSave() }}
                    placeholder="Name"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={shipToAddress1}
                    onChange={(e) => { setShipToAddress1(e.target.value); scheduleSave() }}
                    placeholder="Address"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={shipToAddress2}
                    onChange={(e) => { setShipToAddress2(e.target.value); scheduleSave() }}
                    placeholder="Apt, suite (optional)"
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
                    <input
                      type="text"
                      value={shipToCountry}
                      onChange={(e) => { setShipToCountry(e.target.value); scheduleSave() }}
                      placeholder="Country"
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    value={shipToPhone}
                    onChange={(e) => { setShipToPhone(e.target.value); scheduleSave() }}
                    placeholder="Phone"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>
              </CollapsibleSection>

              {/* Bill To Section */}
              <CollapsibleSection
                title="Bill To"
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
                    Same as Ship To
                  </label>

                  {!sameAsShipTo && (
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

              {/* Notes Section */}
              <CollapsibleSection
                title="Notes"
                icon={FileText}
                defaultExpanded={Boolean(internalNotes || customerNotes)}
                hasContent={Boolean(internalNotes || customerNotes)}
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Internal Notes</label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => { setInternalNotes(e.target.value); scheduleSave() }}
                      placeholder="Notes for internal use..."
                      rows={2}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Customer Notes</label>
                    <textarea
                      value={customerNotes}
                      onChange={(e) => { setCustomerNotes(e.target.value); scheduleSave() }}
                      placeholder="Notes visible to customer..."
                      rows={2}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none"
                    />
                  </div>
                </div>
              </CollapsibleSection>

              {/* Save Status */}
              {canEdit && (isDirty || isSaving) && (
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
                <p>Last updated: <FormattedShortDate date={salesOrder.updated_at || salesOrder.created_at || new Date().toISOString()} /></p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
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

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-neutral-500">{salesOrder.items.length} item{salesOrder.items.length !== 1 ? 's' : ''}</p>
                <p className="text-lg font-semibold text-neutral-900">{formatCurrency(subtotal)}</p>
              </div>
              {isDraft && (
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
              )}
              {isSubmitted && (
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
              )}
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

        {/* Customer Form Dialog */}
        <CustomerFormDialog
          isOpen={showCustomerForm}
          onClose={() => setShowCustomerForm(false)}
          onSave={handleCreateCustomer}
          saving={savingCustomer}
        />
      </div>
    )
  }

  // Non-draft view (Confirmed onwards)
  const StatusIcon = statusConfig[status]?.icon || Clock

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/sales-orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-neutral-900">
                  {salesOrder.display_id || salesOrder.order_number || `SO-${salesOrder.id.slice(0, 8)}`}
                </h1>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[status]?.bgColor} ${statusConfig[status]?.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig[status]?.label || status}
                </span>
                {salesOrder.priority && salesOrder.priority !== 'normal' && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityConfig[salesOrder.priority]?.bgColor} ${priorityConfig[salesOrder.priority]?.color}`}>
                    {priorityConfig[salesOrder.priority]?.label}
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-500">
                Created {salesOrder.created_at && <FormattedShortDate date={salesOrder.created_at} />}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {status === 'confirmed' && (
              <Button
                onClick={() => handleStatusChange('picking')}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'status' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ClipboardList className="mr-2 h-4 w-4" />
                )}
                Start Picking
              </Button>
            )}

            {salesOrder.pick_list && (
              <Link href={`/tasks/pick-lists/${salesOrder.pick_list.id}`}>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Pick List
                </Button>
              </Link>
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

            {['confirmed', 'picking', 'picked'].includes(status) && (
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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({salesOrder.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {salesOrder.items.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600">Item</th>
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Ordered</th>
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Picked</th>
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Shipped</th>
                          <th className="px-4 py-3 text-right font-medium text-neutral-600 w-24">Unit Price</th>
                          <th className="px-4 py-3 text-right font-medium text-neutral-600 w-24">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {salesOrder.items.map((item) => (
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
                            <td className="px-4 py-3 text-center font-medium">
                              {item.quantity_ordered}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={item.quantity_picked >= item.quantity_ordered ? 'text-green-600 font-medium' : ''}>
                                {item.quantity_picked}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={item.quantity_shipped >= item.quantity_ordered ? 'text-green-600 font-medium' : ''}>
                                {item.quantity_shipped}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-neutral-700">
                              {formatCurrency(item.unit_price)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-neutral-900">
                              {formatCurrency(item.line_total)}
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
            {(salesOrder.internal_notes || salesOrder.customer_notes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {salesOrder.internal_notes && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">Internal Notes</p>
                      <p className="text-neutral-700 whitespace-pre-wrap">{salesOrder.internal_notes}</p>
                    </div>
                  )}
                  {salesOrder.customer_notes && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">Customer Notes</p>
                      <p className="text-neutral-700 whitespace-pre-wrap">{salesOrder.customer_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesOrder.customer ? (
                  <div className="space-y-3">
                    <p className="font-medium text-neutral-900">{salesOrder.customer.name}</p>
                    {salesOrder.customer.contact_name && (
                      <p className="text-sm text-neutral-600">{salesOrder.customer.contact_name}</p>
                    )}
                    {salesOrder.customer.email && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <a href={`mailto:${salesOrder.customer.email}`} className="hover:text-primary">
                          {salesOrder.customer.email}
                        </a>
                      </div>
                    )}
                    {salesOrder.customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        <a href={`tel:${salesOrder.customer.phone}`} className="hover:text-primary">
                          {salesOrder.customer.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No customer assigned</p>
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
                      {salesOrder.display_id || salesOrder.order_number || `SO-${salesOrder.id.slice(0, 8)}`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Status</dt>
                    <dd className={`font-medium ${statusConfig[status]?.color}`}>
                      {statusConfig[status]?.label || status}
                    </dd>
                  </div>
                  {salesOrder.priority && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Priority</dt>
                      <dd className={`font-medium ${priorityConfig[salesOrder.priority]?.color}`}>
                        {priorityConfig[salesOrder.priority]?.label}
                      </dd>
                    </div>
                  )}
                  {salesOrder.requested_date && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Requested Date</dt>
                      <dd className="font-medium text-neutral-900">
                        <FormattedShortDate date={salesOrder.requested_date} />
                      </dd>
                    </div>
                  )}
                  {salesOrder.submitted_at && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Submitted</dt>
                      <dd className="font-medium text-neutral-900">
                        <FormattedShortDate date={salesOrder.submitted_at} />
                      </dd>
                    </div>
                  )}
                  {salesOrder.confirmed_at && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Confirmed</dt>
                      <dd className="font-medium text-neutral-900">
                        <FormattedShortDate date={salesOrder.confirmed_at} />
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
            {salesOrder.ship_to_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ship To
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-neutral-700 space-y-1">
                    <p className="font-medium">{salesOrder.ship_to_name}</p>
                    {salesOrder.ship_to_address1 && <p>{salesOrder.ship_to_address1}</p>}
                    {salesOrder.ship_to_address2 && <p>{salesOrder.ship_to_address2}</p>}
                    <p>
                      {[
                        salesOrder.ship_to_city,
                        salesOrder.ship_to_state,
                        salesOrder.ship_to_postal_code
                      ].filter(Boolean).join(', ')}
                    </p>
                    {salesOrder.ship_to_country && <p>{salesOrder.ship_to_country}</p>}
                    {salesOrder.ship_to_phone && (
                      <p className="flex items-center gap-1 pt-1">
                        <Phone className="h-3 w-3" />
                        {salesOrder.ship_to_phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Chatter Panel */}
        {currentUserId && (
          <ChatterPanel
            entityType="sales_order"
            entityId={salesOrder.id}
            entityName={salesOrder.display_id || salesOrder.order_number || `SO ${salesOrder.id.slice(0, 8)}`}
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
        title="Delete Sales Order"
        description="Are you sure you want to delete this sales order? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Cancel Sales Order"
        description="Are you sure you want to cancel this sales order? This will mark it as cancelled."
        confirmLabel="Cancel Order"
        variant="warning"
      />
    </div>
  )
}
