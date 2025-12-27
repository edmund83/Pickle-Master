'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Package,
  MapPin,
  Loader2,
  Play,
  Check,
  Ban,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormattedShortDate, FormattedDateTime } from '@/components/formatting/FormattedDate'
import {
  pickItem,
  completePickList,
  startPickList,
  cancelPickList,
  deletePickList
} from '@/app/actions/pick-lists'

interface PickListWithItems {
  pick_list: {
    id: string
    name: string
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
}

interface PickListDetailClientProps {
  data: PickListWithItems
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


export function PickListDetailClient({ data }: PickListDetailClientProps) {
  const router = useRouter()
  const [pickingItemId, setPickingItemId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const pickList = data.pick_list
  const items = data.items
  const isEditable = pickList.status === 'draft' || pickList.status === 'in_progress'

  const totalRequested = items.reduce((sum, item) => sum + item.requested_quantity, 0)
  const totalPicked = items.reduce((sum, item) => sum + item.picked_quantity, 0)
  const allPicked = items.every((item) => item.picked_quantity >= item.requested_quantity)

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
        router.refresh()
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
        router.push('/workflows/pick-lists')
      }
    } catch (err) {
      console.error('Delete pick list error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const hasShipTo = pickList.ship_to_name || pickList.ship_to_address1

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/workflows/pick-lists">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {statusIcons[pickList.status]}
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">{pickList.name}</h1>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[pickList.status]}`}
                >
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
          {pickList.status === 'draft' && (
            <>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'delete' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
              <Button
                onClick={handleStartPicking}
                disabled={actionLoading !== null}
              >
                {actionLoading === 'start' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Start Picking
              </Button>
            </>
          )}

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
          {/* Assignment Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Assigned To</p>
                  <p className="text-base font-semibold text-neutral-900">
                    {data.assigned_to_name || 'Unassigned'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Due Date */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Due Date</p>
                  <p className="text-base font-semibold text-neutral-900">
                    {pickList.due_date ? (
                      <FormattedShortDate date={pickList.due_date} />
                    ) : (
                      'No due date'
                    )}
                  </p>
                </div>
              </div>
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
      </div>
    </div>
  )
}
