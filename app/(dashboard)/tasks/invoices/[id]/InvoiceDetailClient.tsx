'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Calendar,
  Send,
  Check,
  MapPin,
  MoreVertical,
  Trash2,
  ExternalLink,
  DollarSign,
  CreditCard,
  Plus,
  User,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedShortDate, FormattedDateTime } from '@/components/formatting/FormattedDate'
import {
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  addInvoiceItem,
  removeInvoiceItem,
  recordPayment,
  setInvoiceItemTax,
} from '@/app/actions/invoices'
import type { InvoiceWithDetails, Customer } from './page'
import { ChatterPanel } from '@/components/chatter'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { TaxRateDropdown } from '@/components/tax/TaxRateSelector'

interface InvoiceDetailClientProps {
  invoice: InvoiceWithDetails
  customers: Customer[]
  createdByName: string | null
  sentByName: string | null
  currentUserId: string | null
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  draft: { icon: Clock, color: 'text-neutral-600', bgColor: 'bg-neutral-100', label: 'Draft' },
  pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'Pending' },
  sent: { icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Sent' },
  partial: { icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Partial' },
  paid: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Paid' },
  overdue: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Overdue' },
  cancelled: { icon: XCircle, color: 'text-neutral-600', bgColor: 'bg-neutral-200', label: 'Cancelled' },
  void: { icon: XCircle, color: 'text-neutral-600', bgColor: 'bg-neutral-300', label: 'Void' },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function InvoiceDetailClient({
  invoice,
  customers,
  createdByName,
  sentByName,
  currentUserId
}: InvoiceDetailClientProps) {
  const router = useRouter()
  const feedback = useFeedback()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number || '')
  const [invoiceDate, setInvoiceDate] = useState(invoice.invoice_date || '')
  const [dueDate, setDueDate] = useState(invoice.due_date || '')
  const [internalNotes, setInternalNotes] = useState(invoice.internal_notes || '')
  const [customerNotes, setCustomerNotes] = useState(invoice.customer_notes || '')

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'card' | 'check' | 'other'>('bank_transfer')
  const [paymentReference, setPaymentReference] = useState('')

  // Menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [sendToEmail, setSendToEmail] = useState(invoice.customer?.email || '')

  const status = invoice.status || 'draft'
  const isDraft = status === 'draft'
  const isPending = status === 'pending'
  const canEdit = ['draft', 'pending'].includes(status)
  const canRecordPayment = ['sent', 'partial', 'overdue'].includes(status)

  const StatusIcon = statusConfig[status]?.icon || Clock

  async function handleSave() {
    setActionLoading('save')
    setError(null)

    const result = await updateInvoice(invoice.id, {
      invoice_number: invoiceNumber || null,
      invoice_date: invoiceDate || null,
      due_date: dueDate || null,
      internal_notes: internalNotes || null,
      customer_notes: customerNotes || null,
    })

    if (result.success) {
      feedback.success('Changes saved')
      router.refresh()
    } else {
      const errorMsg = result.error || 'Failed to save changes'
      setError(errorMsg)
      feedback.error(errorMsg)
    }

    setActionLoading(null)
  }

  async function handleStatusChange(newStatus: string, additionalData?: { sent_to_email?: string }) {
    setActionLoading('status')
    setError(null)

    const result = await updateInvoiceStatus(invoice.id, newStatus, additionalData)

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

    const result = await deleteInvoice(invoice.id)

    if (result.success) {
      feedback.success('Invoice deleted')
      router.push('/tasks/invoices')
    } else {
      const errorMsg = result.error || 'Failed to delete invoice'
      setError(errorMsg)
      feedback.error(errorMsg)
      setActionLoading(null)
    }
  }

  async function handleSendInvoice() {
    setShowSendConfirm(false)
    await handleStatusChange('sent', { sent_to_email: sendToEmail || undefined })
  }

  async function handleRecordPayment() {
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      feedback.error('Please enter a valid payment amount')
      return
    }

    setActionLoading('payment')
    setError(null)

    const result = await recordPayment(invoice.id, {
      amount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_number: paymentReference || null,
    })

    if (result.success) {
      feedback.success('Payment recorded')
      setShowPaymentForm(false)
      setPaymentAmount('')
      setPaymentReference('')
      router.refresh()
    } else {
      const errorMsg = result.error || 'Failed to record payment'
      setError(errorMsg)
      feedback.error(errorMsg)
    }

    setActionLoading(null)
  }

  async function handleUpdateItemTax(itemId: string, taxRateId: string | null) {
    setActionLoading(`tax-${itemId}`)
    setError(null)

    const result = await setInvoiceItemTax(itemId, taxRateId)

    if (result.success) {
      router.refresh()
    } else {
      const errorMsg = result.error || 'Failed to update tax'
      setError(errorMsg)
      feedback.error(errorMsg)
    }

    setActionLoading(null)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/invoices">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-neutral-900">
                  {invoice.display_id || `INV-${invoice.id.slice(0, 8)}`}
                </h1>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[status]?.bgColor} ${statusConfig[status]?.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig[status]?.label || status}
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                Created {invoice.created_at && <FormattedShortDate date={invoice.created_at} />}
                {invoice.customer?.name && (
                  <span className="ml-2">
                    · For <span className="font-medium">{invoice.customer.name}</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'save' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            )}

            {isDraft && (
              <Button
                variant="outline"
                onClick={() => handleStatusChange('pending')}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'status' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="mr-2 h-4 w-4" />
                )}
                Mark Pending
              </Button>
            )}

            {isPending && (
              <Button
                onClick={() => setShowSendConfirm(true)}
                disabled={actionLoading !== null || invoice.items.length === 0}
              >
                {actionLoading === 'status' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Invoice
              </Button>
            )}

            {canRecordPayment && (
              <Button
                onClick={() => setShowPaymentForm(true)}
                disabled={actionLoading !== null}
                className="bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            )}

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
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    )}
                    {['sent', 'partial', 'overdue'].includes(status) && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false)
                          handleStatusChange('void')
                        }}
                        disabled={actionLoading !== null}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Void Invoice
                      </button>
                    )}
                    {['draft', 'pending'].includes(status) && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false)
                          handleStatusChange('cancelled')
                        }}
                        disabled={actionLoading !== null}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel
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

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Invoice Number (optional)
                    </label>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="Custom reference"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Invoice Date
                    </label>
                    <Input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Due Date
                    </label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items Card */}
            <Card>
              <CardHeader>
                <CardTitle>Line Items ({invoice.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.items.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600">Item</th>
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-20">Qty</th>
                          <th className="px-4 py-3 text-right font-medium text-neutral-600 w-28">Unit Price</th>
                          {canEdit && <th className="px-4 py-3 text-left font-medium text-neutral-600 w-40">Tax</th>}
                          <th className="px-4 py-3 text-right font-medium text-neutral-600 w-28">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {invoice.items.map((item) => {
                          const currentTaxRateId = item.line_item_taxes?.[0]?.tax_rate_id || null
                          const taxInfo = item.line_item_taxes?.[0]
                          return (
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
                                    {item.description && (
                                      <p className="text-xs text-neutral-500 mt-0.5">{item.description}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center font-medium">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-right text-neutral-600">
                                {formatCurrency(item.unit_price)}
                              </td>
                              {canEdit && (
                                <td className="px-4 py-3">
                                  <TaxRateDropdown
                                    value={currentTaxRateId}
                                    onChange={(taxRateId) => handleUpdateItemTax(item.id, taxRateId)}
                                    disabled={actionLoading === `tax-${item.id}`}
                                    className="h-8 text-xs"
                                  />
                                </td>
                              )}
                              <td className="px-4 py-3 text-right">
                                <p className="font-medium text-neutral-900">{formatCurrency(item.line_total)}</p>
                                {taxInfo && (
                                  <p className="text-xs text-neutral-500">
                                    +{formatCurrency(taxInfo.tax_amount)} tax
                                  </p>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <tfoot className="bg-neutral-50 border-t border-neutral-200">
                        {(() => {
                          const footerColSpan = canEdit ? 4 : 3
                          const totalTax = invoice.items.reduce((sum, item) => {
                            const itemTax = item.line_item_taxes?.reduce((t, tax) => t + tax.tax_amount, 0) || 0
                            return sum + itemTax
                          }, 0)
                          return (
                            <>
                              <tr>
                                <td colSpan={footerColSpan} className="px-4 py-2 text-right text-neutral-600">Subtotal</td>
                                <td className="px-4 py-2 text-right font-medium">{formatCurrency(invoice.subtotal)}</td>
                              </tr>
                              {invoice.discount_amount > 0 && (
                                <tr>
                                  <td colSpan={footerColSpan} className="px-4 py-2 text-right text-neutral-600">Discount</td>
                                  <td className="px-4 py-2 text-right font-medium text-red-600">-{formatCurrency(invoice.discount_amount)}</td>
                                </tr>
                              )}
                              {totalTax > 0 && (
                                <tr>
                                  <td colSpan={footerColSpan} className="px-4 py-2 text-right text-neutral-600">Tax</td>
                                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(totalTax)}</td>
                                </tr>
                              )}
                              <tr className="border-t border-neutral-200">
                                <td colSpan={footerColSpan} className="px-4 py-3 text-right font-semibold text-neutral-900">Total</td>
                                <td className="px-4 py-3 text-right font-bold text-lg">{formatCurrency(invoice.subtotal - invoice.discount_amount + totalTax)}</td>
                              </tr>
                              {invoice.amount_paid > 0 && (
                                <tr>
                                  <td colSpan={footerColSpan} className="px-4 py-2 text-right text-green-600 font-medium">Paid</td>
                                  <td className="px-4 py-2 text-right font-medium text-green-600">-{formatCurrency(invoice.amount_paid)}</td>
                                </tr>
                              )}
                              {(invoice.subtotal - invoice.discount_amount + totalTax - invoice.amount_paid) > 0 && (
                                <tr className="border-t border-neutral-200">
                                  <td colSpan={footerColSpan} className="px-4 py-3 text-right font-semibold text-amber-600">Balance Due</td>
                                  <td className="px-4 py-3 text-right font-bold text-lg text-amber-600">{formatCurrency(invoice.subtotal - invoice.discount_amount + totalTax - invoice.amount_paid)}</td>
                                </tr>
                              )}
                            </>
                          )
                        })()}
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
                    <FileText className="mx-auto h-10 w-10 text-neutral-400" />
                    <p className="mt-3 text-neutral-500">No items on this invoice</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payments Card */}
            {invoice.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payments ({invoice.payments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-neutral-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600">Date</th>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600">Method</th>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600">Reference</th>
                          <th className="px-4 py-3 text-right font-medium text-neutral-600">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {invoice.payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-neutral-50">
                            <td className="px-4 py-3">
                              <FormattedShortDate date={payment.payment_date} />
                            </td>
                            <td className="px-4 py-3 capitalize">
                              {payment.payment_method?.replace('_', ' ') || '—'}
                            </td>
                            <td className="px-4 py-3 text-neutral-600">
                              {payment.reference_number || '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-green-600">
                              {formatCurrency(payment.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Internal Notes (not shown on invoice)
                    </label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Internal notes..."
                      rows={2}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Customer Notes (shown on invoice)
                    </label>
                    <textarea
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Notes for customer..."
                      rows={2}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {!canEdit && (invoice.internal_notes || invoice.customer_notes) && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {invoice.internal_notes && (
                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-1">Internal Notes</p>
                      <p className="text-neutral-700 whitespace-pre-wrap">{invoice.internal_notes}</p>
                    </div>
                  )}
                  {invoice.customer_notes && (
                    <div>
                      <p className="text-sm font-medium text-neutral-500 mb-1">Customer Notes</p>
                      <p className="text-neutral-700 whitespace-pre-wrap">{invoice.customer_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bill To Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Bill To
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-neutral-700 space-y-1">
                  <p className="font-medium">{invoice.bill_to_name || invoice.customer?.name || 'No name'}</p>
                  {invoice.bill_to_address1 && <p>{invoice.bill_to_address1}</p>}
                  {invoice.bill_to_address2 && <p>{invoice.bill_to_address2}</p>}
                  <p>
                    {[
                      invoice.bill_to_city,
                      invoice.bill_to_state,
                      invoice.bill_to_postal_code
                    ].filter(Boolean).join(', ')}
                  </p>
                  {invoice.bill_to_country && <p>{invoice.bill_to_country}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            {invoice.customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link
                      href={`/partners/customers/${invoice.customer_id}`}
                      className="font-medium text-neutral-900 hover:text-primary"
                    >
                      {invoice.customer.name}
                    </Link>
                    {invoice.customer.email && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="text-neutral-400">Email:</span>
                        <a href={`mailto:${invoice.customer.email}`} className="hover:text-primary">
                          {invoice.customer.email}
                        </a>
                      </div>
                    )}
                    {invoice.customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <span className="text-neutral-400">Phone:</span>
                        <a href={`tel:${invoice.customer.phone}`} className="hover:text-primary">
                          {invoice.customer.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Documents */}
            {(invoice.sales_order || invoice.delivery_order) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Related
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {invoice.sales_order && (
                    <Link
                      href={`/tasks/sales-orders/${invoice.sales_order_id}`}
                      className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                    >
                      <span className="text-sm font-medium">
                        Sales Order: {invoice.sales_order.display_id}
                      </span>
                      <ExternalLink className="h-4 w-4 text-neutral-400" />
                    </Link>
                  )}
                  {invoice.delivery_order && (
                    <Link
                      href={`/tasks/delivery-orders/${invoice.delivery_order_id}`}
                      className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                    >
                      <span className="text-sm font-medium">
                        Delivery: {invoice.delivery_order.display_id}
                      </span>
                      <ExternalLink className="h-4 w-4 text-neutral-400" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Status</dt>
                    <dd className={`font-medium ${statusConfig[status]?.color}`}>
                      {statusConfig[status]?.label || status}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Invoice Date</dt>
                    <dd className="font-medium text-neutral-900">
                      <FormattedShortDate date={invoice.invoice_date} />
                    </dd>
                  </div>
                  {invoice.due_date && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Due Date</dt>
                      <dd className={`font-medium ${
                        status !== 'paid' && new Date(invoice.due_date) < new Date()
                          ? 'text-red-600'
                          : 'text-neutral-900'
                      }`}>
                        <FormattedShortDate date={invoice.due_date} />
                      </dd>
                    </div>
                  )}
                  {invoice.sent_at && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Sent At</dt>
                      <dd className="font-medium text-neutral-900">
                        <FormattedShortDate date={invoice.sent_at} />
                      </dd>
                    </div>
                  )}
                  {invoice.last_payment_date && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Last Payment</dt>
                      <dd className="font-medium text-green-600">
                        <FormattedShortDate date={invoice.last_payment_date} />
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-neutral-200 pt-3">
                    <dt className="text-neutral-500">Created by</dt>
                    <dd className="font-medium text-neutral-900">{createdByName || 'Unknown'}</dd>
                  </div>
                  {sentByName && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Sent by</dt>
                      <dd className="font-medium text-neutral-900">{sentByName}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chatter Panel */}
        {currentUserId && (
          <ChatterPanel
            entityType="invoice"
            entityId={invoice.id}
            entityName={invoice.display_id || `INV ${invoice.id.slice(0, 8)}`}
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
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Send Invoice Dialog */}
      {showSendConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSendConfirm(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Send Invoice</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Send To Email
                </label>
                <Input
                  type="email"
                  value={sendToEmail}
                  onChange={(e) => setSendToEmail(e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
              <p className="text-sm text-neutral-500">
                This will mark the invoice as sent. Total: <strong>{formatCurrency(invoice.total)}</strong>
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowSendConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendInvoice}>
                <Send className="mr-2 h-4 w-4" />
                Send Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Dialog */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentForm(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Record Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Amount (Balance: {formatCurrency(invoice.balance_due)})
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Payment Date
                </label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Reference Number (optional)
                </label>
                <Input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction ID, check number..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRecordPayment}
                disabled={actionLoading === 'payment'}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading === 'payment' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="mr-2 h-4 w-4" />
                )}
                Record Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
