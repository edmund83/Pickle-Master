'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, ShoppingCart, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PurchaseOrder } from '@/types/database.types'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import { PurchaseOrderModal } from './PurchaseOrderModal'
import { FormattedOrderAmount } from './FormattedOrderAmount'

interface PurchaseOrdersClientProps {
  purchaseOrders: PurchaseOrder[]
}

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="h-4 w-4 text-neutral-400" />,
  submitted: <Clock className="h-4 w-4 text-blue-500" />,
  confirmed: <Truck className="h-4 w-4 text-purple-500" />,
  partial: <Truck className="h-4 w-4 text-yellow-500" />,
  received: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  partial: 'Partial',
  received: 'Received',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  submitted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  partial: 'bg-yellow-100 text-yellow-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function PurchaseOrdersClient({ purchaseOrders }: PurchaseOrdersClientProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const grouped = {
    active: purchaseOrders.filter((o) => ['draft', 'submitted', 'confirmed', 'partial'].includes(o.status || '')),
    received: purchaseOrders.filter((o) => o.status === 'received'),
    cancelled: purchaseOrders.filter((o) => o.status === 'cancelled'),
  }

  function handleSuccess() {
    router.refresh()
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/workflows">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Purchase Orders</h1>
              <p className="text-neutral-500">Track incoming stock from suppliers</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        <div className="p-6">
          {purchaseOrders.length > 0 ? (
            <div className="space-y-6">
              {/* Active */}
              {grouped.active.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Active ({grouped.active.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {grouped.active.map((order) => (
                        <OrderRow key={order.id} order={order} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Received */}
              {grouped.received.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Received ({grouped.received.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {grouped.received.map((order) => (
                        <OrderRow key={order.id} order={order} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cancelled */}
              {grouped.cancelled.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-neutral-500">Cancelled ({grouped.cancelled.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {grouped.cancelled.map((order) => (
                        <OrderRow key={order.id} order={order} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <ShoppingCart className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-neutral-900">No purchase orders yet</h3>
                <p className="mt-1 text-neutral-500">Create your first purchase order to track incoming stock.</p>
                <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Purchase Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <PurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}

function OrderRow({ order }: { order: PurchaseOrder }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        {statusIcons[order.status || 'draft']}
        <div>
          <p className="font-medium text-neutral-900">
            {order.order_number || `PO-${order.id.slice(0, 8)}`}
          </p>
          <p className="text-sm text-neutral-500">
            {order.expected_date
              ? <>Expected <FormattedShortDate date={order.expected_date} /></>
              : order.created_at ? <>Created <FormattedShortDate date={order.created_at} /></> : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <FormattedOrderAmount amount={order.total_amount ?? 0} />
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status || 'draft']}`}
        >
          {statusLabels[order.status || 'draft']}
        </span>
        <Link href={`/workflows/purchase-orders/${order.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      </div>
    </div>
  )
}
