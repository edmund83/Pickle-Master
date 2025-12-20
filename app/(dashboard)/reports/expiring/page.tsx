import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle, Calendar, Package, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface ExpiringLot {
  lot_id: string
  item_id: string
  item_name: string
  item_sku: string | null
  item_image: string | null
  lot_number: string | null
  batch_code: string | null
  expiry_date: string
  quantity: number
  status: string
  location_id: string | null
  location_name: string | null
  days_until_expiry: number
  urgency: 'expired' | 'critical' | 'warning' | 'upcoming'
}

interface ExpirySummary {
  expired_count: number
  expiring_7_days: number
  expiring_30_days: number
  total_value_at_risk: number
}

async function getExpiringItems() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if user has tenant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return {
      expiringLots: [],
      expiredLots: [],
      summary: { expired_count: 0, expiring_7_days: 0, expiring_30_days: 0, total_value_at_risk: 0 }
    }
  }

  // Use the proper RPC functions that query the lots table
  // Get all lots expiring within 30 days (includes expired ones)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allExpiringData } = await (supabase as any)
    .rpc('get_expiring_lots', { p_days: 30 })

  // Get the summary statistics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: summaryData } = await (supabase as any)
    .rpc('get_expiring_lots_summary')

  const allLots: ExpiringLot[] = allExpiringData || []
  const summary: ExpirySummary = summaryData || {
    expired_count: 0,
    expiring_7_days: 0,
    expiring_30_days: 0,
    total_value_at_risk: 0
  }

  // Separate expired from expiring
  const expiredLots = allLots.filter(lot => lot.urgency === 'expired')
  const expiringLots = allLots.filter(lot => lot.urgency !== 'expired')

  return { expiringLots, expiredLots, summary }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function getUrgencyBadge(urgency: string): { bg: string; text: string; label: string } {
  switch (urgency) {
    case 'expired':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' }
    case 'critical':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical (7 days)' }
    case 'warning':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Warning (14 days)' }
    default:
      return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Upcoming' }
  }
}

export default async function ExpiringItemsPage() {
  const { expiringLots, expiredLots, summary } = await getExpiringItems()

  const totalAtRisk = expiredLots.length + expiringLots.length

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Expiring Items Report</h1>
        <p className="mt-1 text-neutral-500">
          Track lots and batches that are expired or expiring soon
        </p>
      </div>

      <div className="p-8">
        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Expired</p>
                <p className="text-2xl font-semibold text-red-600">{summary.expired_count}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Expiring (7 days)</p>
                <p className="text-2xl font-semibold text-orange-600">{summary.expiring_7_days}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Expiring (30 days)</p>
                <p className="text-2xl font-semibold text-yellow-600">{summary.expiring_30_days}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Value at Risk</p>
                <p className="text-2xl font-semibold text-neutral-900">{formatCurrency(summary.total_value_at_risk)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expired Lots */}
        {expiredLots.length > 0 && (
          <div className="mb-8 rounded-xl border border-red-200 bg-white">
            <div className="border-b border-red-200 bg-red-50 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Expired Lots ({expiredLots.length})
              </h2>
            </div>
            <ul className="divide-y divide-neutral-200">
              {expiredLots.map((lot) => (
                <LotRow key={lot.lot_id} lot={lot} />
              ))}
            </ul>
          </div>
        )}

        {/* Expiring Soon */}
        {expiringLots.length > 0 && (
          <div className="rounded-xl border border-yellow-200 bg-white">
            <div className="border-b border-yellow-200 bg-yellow-50 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-yellow-700">
                <Clock className="h-5 w-5" />
                Expiring Within 30 Days ({expiringLots.length})
              </h2>
            </div>
            <ul className="divide-y divide-neutral-200">
              {expiringLots.map((lot) => (
                <LotRow key={lot.lot_id} lot={lot} />
              ))}
            </ul>
          </div>
        )}

        {/* Empty State */}
        {totalAtRisk === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">All clear!</h3>
            <p className="mt-1 text-center text-neutral-500">
              No lots are expired or expiring soon.
              <br />
              <span className="text-sm">
                To track expiry dates, enable lot tracking for items and create lots with expiry dates.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function LotRow({ lot }: { lot: ExpiringLot }) {
  const badge = getUrgencyBadge(lot.urgency)
  const expiryDate = new Date(lot.expiry_date)

  return (
    <li className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          lot.urgency === 'expired' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
        }`}>
          {lot.item_image ? (
            <img src={lot.item_image} alt={lot.item_name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <Package className="h-5 w-5" />
          )}
        </div>
        <div>
          <Link
            href={`/inventory/${lot.item_id}`}
            className="font-medium text-neutral-900 hover:text-pickle-600"
          >
            {lot.item_name}
          </Link>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            {lot.item_sku && <span>SKU: {lot.item_sku}</span>}
            {lot.lot_number && (
              <>
                {lot.item_sku && <span>•</span>}
                <span>Lot: {lot.lot_number}</span>
              </>
            )}
            {lot.batch_code && (
              <>
                <span>•</span>
                <span>Batch: {lot.batch_code}</span>
              </>
            )}
            {lot.location_name && (
              <>
                <span>•</span>
                <span>{lot.location_name}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>
        <p className={`mt-1 font-medium ${lot.urgency === 'expired' ? 'text-red-600' : 'text-yellow-600'}`}>
          {lot.urgency === 'expired'
            ? `Expired ${expiryDate.toLocaleDateString()}`
            : `${lot.days_until_expiry} day${lot.days_until_expiry !== 1 ? 's' : ''} left`
          }
        </p>
        <p className="text-sm text-neutral-500">Qty: {lot.quantity}</p>
      </div>
    </li>
  )
}
