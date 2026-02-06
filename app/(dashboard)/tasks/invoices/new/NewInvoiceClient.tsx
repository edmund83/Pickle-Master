'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  FileText,
  Building2,
  Check,
  AlertTriangle,
  XCircle,
  Package,
  Plus,
  Minus,
  Trash2,
  Camera,
  Zap,
  CheckCircle,
  MapPin,
  CreditCard,
  DollarSign,
  StickyNote
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createInvoiceWithItems, searchInventoryItemsForInvoice } from '@/app/actions/invoices'
import type { Customer } from '@/app/actions/customers'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { Input } from '@/components/ui/input'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'
import { CollapsibleSection } from '@/components/ui/collapsible-section'
import type { PaymentTerm } from './page'

interface NewInvoiceClientProps {
  customers: Customer[]
  paymentTerms: PaymentTerm[]
}

interface InvoiceLineItem {
  id: string // temp ID for local state
  item_id: string | null
  item_name: string
  sku: string | null
  quantity: number
  unit_price: number
  discount_percent: number
  discount_amount: number
  tax_rate: number
  image_urls: string[] | null
}

interface SearchResultItem {
  id: string
  name: string
  sku: string | null
  quantity: number
  image_urls: string[] | null
  unit: string | null
  price: number | null
}

export function NewInvoiceClient({ customers, paymentTerms }: NewInvoiceClientProps) {
  const router = useRouter()
  const feedback = useFeedback()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Customer selection
  const [customerId, setCustomerId] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  // Invoice details
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [paymentTermId, setPaymentTermId] = useState('')

  // Billing address
  const [billToName, setBillToName] = useState('')
  const [billToAddress1, setBillToAddress1] = useState('')
  const [billToAddress2, setBillToAddress2] = useState('')
  const [billToCity, setBillToCity] = useState('')
  const [billToState, setBillToState] = useState('')
  const [billToPostalCode, setBillToPostalCode] = useState('')
  const [billToCountry, setBillToCountry] = useState('')

  // Line items
  const [items, setItems] = useState<InvoiceLineItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  // Notes
  const [internalNotes, setInternalNotes] = useState('')
  const [customerNotes, setCustomerNotes] = useState('')
  const [termsAndConditions, setTermsAndConditions] = useState('')

  const selectedCustomer = customers.find(c => c.id === customerId)
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase())
  ).slice(0, 10)

  // Calculate due date when payment term changes
  useEffect(() => {
    if (paymentTermId && invoiceDate) {
      const term = paymentTerms.find(t => t.id === paymentTermId)
      if (term?.days !== null && term?.days !== undefined) {
        const date = new Date(invoiceDate)
        date.setDate(date.getDate() + term.days)
        setDueDate(date.toISOString().split('T')[0])
      }
    }
  }, [paymentTermId, invoiceDate, paymentTerms])

  // Item search handler with debounce
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await searchInventoryItemsForInvoice(query)
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

  function handleAddItem(item: SearchResultItem) {
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, {
      id: tempId,
      item_id: item.id,
      item_name: item.name,
      sku: item.sku,
      quantity: 1,
      unit_price: item.price || 0,
      discount_percent: 0,
      discount_amount: 0,
      tax_rate: 0,
      image_urls: item.image_urls
    }])
    setSearchQuery('')
    setSearchResults([])
  }

  function handleRemoveItem(itemId: string) {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  function handleUpdateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) return
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ))
  }

  function handleUpdatePrice(itemId: string, price: number) {
    if (price < 0) return
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, unit_price: price } : item
    ))
  }

  async function handleBarcodeScan(result: ScanResult) {
    setIsScannerOpen(false)
    const results = await searchInventoryItemsForInvoice(result.code)
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

  function useCustomerBillingAddress() {
    if (!selectedCustomer) return

    setBillToName(selectedCustomer.name || '')
    setBillToAddress1(selectedCustomer.billing_address1 || '')
    setBillToAddress2(selectedCustomer.billing_address2 || '')
    setBillToCity(selectedCustomer.billing_city || '')
    setBillToState(selectedCustomer.billing_state || '')
    setBillToPostalCode(selectedCustomer.billing_postal_code || '')
    setBillToCountry(selectedCustomer.billing_country || '')
  }

  // Calculate totals
  const calculateLineTotal = (item: InvoiceLineItem) => {
    const base = item.quantity * item.unit_price
    const discountAmt = item.discount_amount || (base * item.discount_percent / 100)
    return base - discountAmt
  }

  const subtotal = items.reduce((sum, item) => sum + calculateLineTotal(item), 0)
  const totalTax = items.reduce((sum, item) => {
    const lineTotal = calculateLineTotal(item)
    return sum + (lineTotal * item.tax_rate / 100)
  }, 0)
  const total = subtotal + totalTax

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

    const result = await createInvoiceWithItems({
      customer_id: customerId,
      invoice_number: invoiceNumber || null,
      invoice_date: invoiceDate || null,
      due_date: dueDate || null,
      payment_term_id: paymentTermId || null,
      bill_to_name: billToName || null,
      bill_to_address1: billToAddress1 || null,
      bill_to_address2: billToAddress2 || null,
      bill_to_city: billToCity || null,
      bill_to_state: billToState || null,
      bill_to_postal_code: billToPostalCode || null,
      bill_to_country: billToCountry || null,
      internal_notes: internalNotes || null,
      customer_notes: customerNotes || null,
      terms_and_conditions: termsAndConditions || null,
      items: items.map(item => ({
        item_id: item.item_id,
        item_name: item.item_name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        discount_amount: item.discount_amount,
        tax_rate: item.tax_rate,
      }))
    })

    if (result.success && result.invoice_id) {
      feedback.success('Invoice created')
      router.push(`/tasks/invoices/${result.invoice_id}`)
    } else {
      const errorMsg = result.error || 'Failed to create invoice'
      setError(errorMsg)
      feedback.error(errorMsg)
      setIsSubmitting(false)
    }
  }

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const isFormValid = customerId && items.length > 0
  const hasAddress = Boolean(billToName || billToAddress1)
  const hasNotes = Boolean(internalNotes || customerNotes || termsAndConditions)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/invoices" className="text-neutral-500 hover:text-neutral-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">New Invoice</h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                {items.length > 0 ? `${items.length} item${items.length !== 1 ? 's' : ''} (${totalItemsCount} units) · $${total.toFixed(2)}` : 'Create a new invoice for a customer'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 shrink-0">
          <AlertTriangle className="h-4 w-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Customer + Items (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Customer Selection Card */}
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

            {/* Items Card */}
            <Card className={`border-2 shadow-md ${items.length === 0 ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/30' : 'border-primary/10'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Invoice Items <span className="text-red-500">*</span>
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
                              ${item.price?.toFixed(2) || '0.00'}
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
                          {item.sku && `SKU: ${item.sku}`}
                        </p>
                      </div>
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-medium tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      {/* Price input */}
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-500">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 px-2 rounded-lg border border-neutral-200 text-right text-sm tabular-nums focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      {/* Line total */}
                      <div className="w-24 text-right font-medium tabular-nums">
                        ${calculateLineTotal(item).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
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

                {/* Totals */}
                {items.length > 0 && (
                  <div className="border-t border-neutral-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Subtotal</span>
                      <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Tax</span>
                      <span className="font-medium tabular-nums">${totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold border-t border-neutral-200 pt-2">
                      <span>Total</span>
                      <span className="tabular-nums">${total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Internal Notes - Collapsible */}
            <CollapsibleSection
              title="Internal Notes"
              icon={StickyNote}
              defaultExpanded={Boolean(internalNotes)}
              hasContent={Boolean(internalNotes)}
            >
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Team-only notes (not visible on invoice)</p>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Notes for your team..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </CollapsibleSection>
          </div>

          {/* Right Column - Invoice Details, Address, Notes (1/3 width) */}
          <div className="space-y-4">
            {/* Validation Status */}
            {!isFormValid && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {!customerId ? 'Select a customer' : 'Add at least one item'}
                </span>
              </div>
            )}
            {isFormValid && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Ready to create invoice</span>
              </div>
            )}

            {/* Invoice Details Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Invoice Number (optional)</label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Leave blank to auto-generate"
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Invoice Date</label>
                    <Input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Due Date</label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Payment Terms</label>
                  <select
                    value={paymentTermId}
                    onChange={(e) => setPaymentTermId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-neutral-200 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select terms</option>
                    {paymentTerms.map(term => (
                      <option key={term.id} value={term.id}>
                        {term.name} {term.days !== null && `(${term.days} days)`}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Billing Address - Collapsible */}
            <CollapsibleSection
              title="Billing Address (optional)"
              icon={MapPin}
              defaultExpanded={hasAddress}
              hasContent={hasAddress}
            >
              <div className="space-y-3">
                {selectedCustomer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={useCustomerBillingAddress}
                    className="w-full"
                  >
                    Use customer billing address
                  </Button>
                )}
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Name</label>
                  <Input
                    value={billToName}
                    onChange={(e) => setBillToName(e.target.value)}
                    placeholder="Billing name"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 1</label>
                  <Input
                    value={billToAddress1}
                    onChange={(e) => setBillToAddress1(e.target.value)}
                    placeholder="Street address"
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1">Address Line 2</label>
                  <Input
                    value={billToAddress2}
                    onChange={(e) => setBillToAddress2(e.target.value)}
                    placeholder="Apt, suite, etc."
                    className="h-9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">City</label>
                    <Input
                      value={billToCity}
                      onChange={(e) => setBillToCity(e.target.value)}
                      placeholder="City"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">State</label>
                    <Input
                      value={billToState}
                      onChange={(e) => setBillToState(e.target.value)}
                      placeholder="State"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Postal Code</label>
                    <Input
                      value={billToPostalCode}
                      onChange={(e) => setBillToPostalCode(e.target.value)}
                      placeholder="Postal code"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Country</label>
                    <Input
                      value={billToCountry}
                      onChange={(e) => setBillToCountry(e.target.value)}
                      placeholder="Country"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Customer Notes - Collapsible */}
            <CollapsibleSection
              title="Customer Notes"
              icon={CreditCard}
              defaultExpanded={Boolean(customerNotes)}
              hasContent={Boolean(customerNotes)}
            >
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Notes that appear on the invoice</p>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Notes for customer..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </CollapsibleSection>

            {/* Terms & Conditions - Collapsible */}
            <CollapsibleSection
              title="Terms & Conditions"
              icon={DollarSign}
              defaultExpanded={Boolean(termsAndConditions)}
              hasContent={Boolean(termsAndConditions)}
            >
              <div className="space-y-2">
                <p className="text-xs text-neutral-500">Payment terms shown on invoice</p>
                <textarea
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  placeholder="Payment terms and conditions..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  )
}
