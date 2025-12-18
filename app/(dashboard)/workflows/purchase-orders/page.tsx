import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, ShoppingCart, Clock, CheckCircle, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PurchaseOrder } from '@/types/database.types'
import { format } from 'date-fns'

async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('purchase_orders')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  return (data || []) as PurchaseOrder[]
}

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="h-4 w-4 text-neutral-400" />,
  submitted: <Clock className="h-4 w-4 text-blue-500" />,
  confirmed: <Truck className="h-4 w-4 text-purple-500" />,
  received: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <Clock className="h-4 w-4 text-red-500" />,
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  received: 'Received',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  submitted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function PurchaseOrdersPage() {
  const orders = await getPurchaseOrders()

  const grouped = {
    active: orders.filter((o) => ['draft', 'submitted', 'confirmed'].includes(o.status)),
    received: orders.filter((o) => o.status === 'received'),
  }

  return (
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      <div className="p-6">
        {orders.length > 0 ? (
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
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <ShoppingCart className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900">No purchase orders yet</h3>
              <p className="mt-1 text-neutral-500">Create your first purchase order to track incoming stock.</p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Purchase Order
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function OrderRow({ order }: { order: PurchaseOrder }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        {statusIcons[order.status]}
        <div>
          <p className="font-medium text-neutral-900">
            {order.order_number || `PO-${order.id.slice(0, 8)}`}
          </p>
          <p className="text-sm text-neutral-500">
            {order.expected_date
              ? `Expected ${format(new Date(order.expected_date), 'MMM d, yyyy')}`
              : `Created ${format(new Date(order.created_at), 'MMM d, yyyy')}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {order.total_amount > 0 && (
          <span className="font-medium text-neutral-900">
            RM {order.total_amount.toFixed(2)}
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </div>
    </div>
  )
}
