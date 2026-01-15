'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Truck,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Mail,
  Phone,
  Loader2,
  AlertTriangle,
  Send,
  Check,
  MapPin,
  FileText,
  MoreVertical,
  Trash2,
  ExternalLink,
  User,
  Hash
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedShortDate, FormattedDateTime } from '@/components/formatting/FormattedDate'
import { useFormatting } from '@/hooks/useFormatting'
import {
  updateDeliveryOrder,
  updateDeliveryOrderStatus,
  deleteDeliveryOrder,
} from '@/app/actions/delivery-orders'
import type { DeliveryOrderWithDetails } from './page'
import { ChatterPanel } from '@/components/chatter'
import { ItemThumbnail } from '@/components/ui/item-thumbnail'
import { useFeedback } from '@/components/feedback/FeedbackProvider'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'

interface DeliveryOrderDetailClientProps {
  deliveryOrder: DeliveryOrderWithDetails
  createdByName: string | null
  dispatchedByName: string | null
  currentUserId: string | null
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  draft: { icon: Clock, color: 'text-neutral-600', bgColor: 'bg-neutral-100', label: 'Draft' },
  ready: { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Ready' },
  dispatched: { icon: Truck, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Dispatched' },
  in_transit: { icon: Truck, color: 'text-amber-600', bgColor: 'bg-amber-100', label: 'In Transit' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Delivered' },
  partial: { icon: Package, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Partial' },
  failed: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Failed' },
  returned: { icon: ArrowLeft, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Returned' },
  cancelled: { icon: XCircle, color: 'text-neutral-600', bgColor: 'bg-neutral-200', label: 'Cancelled' },
}

export function DeliveryOrderDetailClient({
  deliveryOrder,
  createdByName,
  dispatchedByName,
  currentUserId
}: DeliveryOrderDetailClientProps) {
  const router = useRouter()
  const feedback = useFeedback()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [carrier, setCarrier] = useState(deliveryOrder.carrier || '')
  const [trackingNumber, setTrackingNumber] = useState(deliveryOrder.tracking_number || '')
  const [shippingMethod, setShippingMethod] = useState(deliveryOrder.shipping_method || '')
  const [scheduledDate, setScheduledDate] = useState(deliveryOrder.scheduled_date || '')
  const [totalPackages, setTotalPackages] = useState(deliveryOrder.total_packages || 1)
  const [notes, setNotes] = useState(deliveryOrder.notes || '')

  // Delivery confirmation state
  const [receivedBy, setReceivedBy] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')

  // Menu state
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  // Confirmation dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeliveryConfirm, setShowDeliveryConfirm] = useState(false)

  const status = deliveryOrder.status || 'draft'
  const isDraft = status === 'draft'
  const isReady = status === 'ready'
  const canEdit = ['draft', 'ready'].includes(status)

  const StatusIcon = statusConfig[status]?.icon || Clock

  async function handleSave() {
    setActionLoading('save')
    setError(null)

    const result = await updateDeliveryOrder(deliveryOrder.id, {
      carrier: carrier || null,
      tracking_number: trackingNumber || null,
      shipping_method: shippingMethod || null,
      scheduled_date: scheduledDate || null,
      total_packages: totalPackages,
      notes: notes || null,
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

  async function handleStatusChange(newStatus: string, additionalData?: { received_by?: string; delivery_notes?: string }) {
    setActionLoading('status')
    setError(null)

    const result = await updateDeliveryOrderStatus(deliveryOrder.id, newStatus, additionalData)

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

    const result = await deleteDeliveryOrder(deliveryOrder.id)

    if (result.success) {
      feedback.success('Delivery order deleted')
      router.push('/tasks/delivery-orders')
    } else {
      const errorMsg = result.error || 'Failed to delete delivery order'
      setError(errorMsg)
      feedback.error(errorMsg)
      setActionLoading(null)
    }
  }

  async function handleConfirmDelivery() {
    setShowDeliveryConfirm(false)
    await handleStatusChange('delivered', {
      received_by: receivedBy || undefined,
      delivery_notes: deliveryNotes || undefined,
    })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/delivery-orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-neutral-900">
                  {deliveryOrder.display_id || `DO-${deliveryOrder.id.slice(0, 8)}`}
                </h1>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[status]?.bgColor} ${statusConfig[status]?.color}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig[status]?.label || status}
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                Created {deliveryOrder.created_at && <FormattedShortDate date={deliveryOrder.created_at} />}
                {deliveryOrder.sales_order?.display_id && (
                  <span className="ml-2">
                    · From{' '}
                    <Link href={`/tasks/sales-orders/${deliveryOrder.sales_order_id}`} className="text-primary hover:underline">
                      {deliveryOrder.sales_order.display_id}
                    </Link>
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
                onClick={() => handleStatusChange('ready')}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'status' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Package className="mr-2 h-4 w-4" />
                )}
                Mark Ready
              </Button>
            )}

            {isReady && (
              <Button
                onClick={() => handleStatusChange('dispatched')}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'status' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="mr-2 h-4 w-4" />
                )}
                Dispatch
              </Button>
            )}

            {status === 'dispatched' && (
              <Button
                onClick={() => handleStatusChange('in_transit')}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'status' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Truck className="mr-2 h-4 w-4" />
                )}
                In Transit
              </Button>
            )}

            {['dispatched', 'in_transit'].includes(status) && (
              <Button
                onClick={() => setShowDeliveryConfirm(true)}
                disabled={actionLoading !== null}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading === 'status' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Confirm Delivery
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
                    {['dispatched', 'in_transit'].includes(status) && (
                      <button
                        onClick={() => {
                          setShowMoreMenu(false)
                          handleStatusChange('failed')
                        }}
                        disabled={actionLoading !== null}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Mark Failed
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
            {/* Shipping Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Carrier
                    </label>
                    <Input
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="e.g., DHL, FedEx"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Tracking Number
                    </label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Tracking number"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Shipping Method
                    </label>
                    <Input
                      value={shippingMethod}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      placeholder="e.g., Standard, Express"
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Scheduled Date
                    </label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Total Packages
                    </label>
                    <Input
                      type="number"
                      value={totalPackages}
                      onChange={(e) => setTotalPackages(parseInt(e.target.value) || 1)}
                      min={1}
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Card */}
            <Card>
              <CardHeader>
                <CardTitle>Items ({deliveryOrder.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {deliveryOrder.items.length > 0 ? (
                  <div className="rounded-lg border border-neutral-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600">Item</th>
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Shipped</th>
                          <th className="px-4 py-3 text-center font-medium text-neutral-600 w-24">Delivered</th>
                          <th className="px-4 py-3 text-left font-medium text-neutral-600 w-24">Condition</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {deliveryOrder.items.map((item) => (
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
                              {item.quantity_shipped}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={item.quantity_delivered >= item.quantity_shipped ? 'text-green-600 font-medium' : ''}>
                                {item.quantity_delivered}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-neutral-600">
                              {item.condition || 'good'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
                    <Package className="mx-auto h-10 w-10 text-neutral-400" />
                    <p className="mt-3 text-neutral-500">No items in this delivery</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Delivery instructions or notes..."
                    rows={3}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </CardContent>
              </Card>
            )}

            {!canEdit && deliveryOrder.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 whitespace-pre-wrap">{deliveryOrder.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Delivery Confirmation Details */}
            {deliveryOrder.delivered_at && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Delivery Confirmed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Delivered At</dt>
                      <dd className="font-medium text-neutral-900">
                        <FormattedDateTime date={deliveryOrder.delivered_at} />
                      </dd>
                    </div>
                    {deliveryOrder.received_by && (
                      <div className="flex justify-between">
                        <dt className="text-neutral-500">Received By</dt>
                        <dd className="font-medium text-neutral-900">{deliveryOrder.received_by}</dd>
                      </div>
                    )}
                    {deliveryOrder.delivery_notes && (
                      <div>
                        <dt className="text-neutral-500 mb-1">Delivery Notes</dt>
                        <dd className="text-neutral-700">{deliveryOrder.delivery_notes}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ship To Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ship To
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-neutral-700 space-y-1">
                  <p className="font-medium">{deliveryOrder.ship_to_name || 'No name'}</p>
                  {deliveryOrder.ship_to_address1 && <p>{deliveryOrder.ship_to_address1}</p>}
                  {deliveryOrder.ship_to_address2 && <p>{deliveryOrder.ship_to_address2}</p>}
                  <p>
                    {[
                      deliveryOrder.ship_to_city,
                      deliveryOrder.ship_to_state,
                      deliveryOrder.ship_to_postal_code
                    ].filter(Boolean).join(', ')}
                  </p>
                  {deliveryOrder.ship_to_country && <p>{deliveryOrder.ship_to_country}</p>}
                  {deliveryOrder.ship_to_phone && (
                    <p className="flex items-center gap-1 pt-1">
                      <Phone className="h-3 w-3" />
                      {deliveryOrder.ship_to_phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            {deliveryOrder.sales_order?.customers && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="font-medium text-neutral-900">{deliveryOrder.sales_order.customers.name}</p>
                    {deliveryOrder.sales_order.customers.email && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Mail className="h-4 w-4 text-neutral-400" />
                        <a href={`mailto:${deliveryOrder.sales_order.customers.email}`} className="hover:text-primary">
                          {deliveryOrder.sales_order.customers.email}
                        </a>
                      </div>
                    )}
                    {deliveryOrder.sales_order.customers.phone && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Phone className="h-4 w-4 text-neutral-400" />
                        <a href={`tel:${deliveryOrder.sales_order.customers.phone}`} className="hover:text-primary">
                          {deliveryOrder.sales_order.customers.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Related
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {deliveryOrder.sales_order && (
                  <Link
                    href={`/tasks/sales-orders/${deliveryOrder.sales_order_id}`}
                    className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                  >
                    <span className="text-sm font-medium">
                      Sales Order: {deliveryOrder.sales_order.display_id}
                    </span>
                    <ExternalLink className="h-4 w-4 text-neutral-400" />
                  </Link>
                )}
                {deliveryOrder.pick_list && (
                  <Link
                    href={`/tasks/pick-lists/${deliveryOrder.pick_list_id}`}
                    className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                  >
                    <span className="text-sm font-medium">
                      Pick List: {deliveryOrder.pick_list.display_id}
                    </span>
                    <ExternalLink className="h-4 w-4 text-neutral-400" />
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
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
                  {deliveryOrder.dispatched_at && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Dispatched</dt>
                      <dd className="font-medium text-neutral-900">
                        <FormattedShortDate date={deliveryOrder.dispatched_at} />
                      </dd>
                    </div>
                  )}
                  {deliveryOrder.delivered_at && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Delivered</dt>
                      <dd className="font-medium text-green-600">
                        <FormattedShortDate date={deliveryOrder.delivered_at} />
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-neutral-200 pt-3">
                    <dt className="text-neutral-500">Created by</dt>
                    <dd className="font-medium text-neutral-900">{createdByName || 'Unknown'}</dd>
                  </div>
                  {dispatchedByName && (
                    <div className="flex justify-between">
                      <dt className="text-neutral-500">Dispatched by</dt>
                      <dd className="font-medium text-neutral-900">{dispatchedByName}</dd>
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
            entityType="delivery_order"
            entityId={deliveryOrder.id}
            entityName={deliveryOrder.display_id || `DO ${deliveryOrder.id.slice(0, 8)}`}
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
        title="Delete Delivery Order"
        description="Are you sure you want to delete this delivery order? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Delivery Confirmation Dialog */}
      {showDeliveryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeliveryConfirm(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl mx-4 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Confirm Delivery</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Received By
                </label>
                <Input
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  placeholder="Name of person who received"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Delivery Notes
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Any notes about the delivery..."
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowDeliveryConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDelivery} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Delivery
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
