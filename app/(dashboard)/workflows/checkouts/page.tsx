import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Briefcase,
  MapPin,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckoutActions } from './checkout-actions'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'

interface CheckoutItem {
  id: string
  item_id: string
  item_name: string
  item_sku: string | null
  item_image: string | null
  quantity: number
  assignee_type: 'person' | 'job' | 'location'
  assignee_id: string | null
  assignee_name: string | null
  checked_out_at: string
  due_date: string | null
  status: 'checked_out' | 'returned' | 'overdue'
  returned_at: string | null
  return_condition: string | null
  checked_out_by_name: string | null
  days_overdue: number
}

async function getCheckouts(): Promise<{
  active: CheckoutItem[]
  overdue: CheckoutItem[]
  returned: CheckoutItem[]
}> {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all checkouts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).rpc('get_checkouts', {
    p_limit: 100
  })

  const checkouts: CheckoutItem[] = data?.checkouts
    ? typeof data.checkouts === 'string'
      ? JSON.parse(data.checkouts)
      : data.checkouts
    : []

  // Group by status
  const active = checkouts.filter(
    (c) => c.status === 'checked_out' && c.days_overdue === 0
  )
  const overdue = checkouts.filter(
    (c) => (c.status === 'overdue' || c.days_overdue > 0) && c.status !== 'returned'
  )
  const returned = checkouts.filter((c) => c.status === 'returned')

  return { active, overdue, returned }
}

const assigneeTypeIcons = {
  person: <User className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />
}

const statusColors = {
  checked_out: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  returned: 'bg-green-100 text-green-700'
}

const statusIcons = {
  checked_out: <Clock className="h-4 w-4 text-amber-500" />,
  overdue: <AlertTriangle className="h-4 w-4 text-red-500" />,
  returned: <CheckCircle className="h-4 w-4 text-green-500" />
}

export default async function CheckoutsPage() {
  const { active, overdue, returned } = await getCheckouts()

  const totalActive = active.length + overdue.length

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/workflows">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Check-In / Check-Out</h1>
            <p className="text-neutral-500">Track items assigned to people, jobs, and locations</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{active.length}</p>
                <p className="text-sm text-amber-600">Active Checkouts</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{overdue.length}</p>
                <p className="text-sm text-red-600">Overdue Items</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{returned.length}</p>
                <p className="text-sm text-green-600">Returned Recently</p>
              </div>
            </div>
          </div>
        </div>

        {totalActive > 0 || returned.length > 0 ? (
          <div className="space-y-6">
            {/* Overdue Items */}
            {overdue.length > 0 && (
              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Overdue ({overdue.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {overdue.map((checkout) => (
                      <CheckoutRow key={checkout.id} checkout={checkout} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Items */}
            {active.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Active Checkouts ({active.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {active.map((checkout) => (
                      <CheckoutRow key={checkout.id} checkout={checkout} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Returned Items */}
            {returned.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neutral-600">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Recently Returned ({returned.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {returned.slice(0, 10).map((checkout) => (
                      <CheckoutRow key={checkout.id} checkout={checkout} />
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
                <Package className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900">No checkouts yet</h3>
              <p className="mt-1 text-center text-neutral-500">
                Check out items from the inventory page to track assignments.
              </p>
              <Link href="/inventory">
                <Button className="mt-4">Go to Inventory</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function CheckoutRow({ checkout }: { checkout: CheckoutItem }) {
  const isOverdue = checkout.status === 'overdue' || checkout.days_overdue > 0
  const isReturned = checkout.status === 'returned'

  return (
    <div className="flex items-center justify-between p-4 hover:bg-neutral-50">
      <div className="flex items-center gap-4">
        {/* Item Image */}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
          {checkout.item_image ? (
            <img
              src={checkout.item_image}
              alt={checkout.item_name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <Package className="h-6 w-6 text-neutral-400" />
          )}
        </div>

        {/* Item Info */}
        <div>
          <Link
            href={`/inventory/${checkout.item_id}`}
            className="font-medium text-neutral-900 hover:text-pickle-600"
          >
            {checkout.item_name}
          </Link>
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              {assigneeTypeIcons[checkout.assignee_type]}
              {checkout.assignee_name || 'Unknown'}
            </span>
            <span>Qty: {checkout.quantity}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date Info */}
        <div className="text-right text-sm">
          {isReturned ? (
            <>
              <p className="text-neutral-500">Returned</p>
              <p className="text-neutral-700">
                {checkout.returned_at
                  ? <FormattedShortDate date={checkout.returned_at} />
                  : '-'}
              </p>
            </>
          ) : checkout.due_date ? (
            <>
              <p className={isOverdue ? 'font-medium text-red-600' : 'text-neutral-500'}>
                {isOverdue ? `${checkout.days_overdue} days overdue` : 'Due'}
              </p>
              <p className={isOverdue ? 'text-red-600' : 'text-neutral-700'}>
                <FormattedShortDate date={checkout.due_date} />
              </p>
            </>
          ) : (
            <>
              <p className="text-neutral-500">No due date</p>
              <p className="text-neutral-700">
                <FormattedShortDate date={checkout.checked_out_at} />
              </p>
            </>
          )}
        </div>

        {/* Status Badge */}
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            isReturned
              ? statusColors.returned
              : isOverdue
              ? statusColors.overdue
              : statusColors.checked_out
          }`}
        >
          {isReturned
            ? statusIcons.returned
            : isOverdue
            ? statusIcons.overdue
            : statusIcons.checked_out}
          {isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Active'}
        </span>

        {/* Actions */}
        {!isReturned && (
          <CheckoutActions
            checkout={{
              id: checkout.id,
              item_id: checkout.item_id,
              item_name: checkout.item_name,
              quantity: checkout.quantity,
              assignee_type: checkout.assignee_type,
              assignee_name: checkout.assignee_name,
              checked_out_at: checkout.checked_out_at,
              due_date: checkout.due_date,
              is_overdue: isOverdue
            }}
          />
        )}
      </div>
    </div>
  )
}
