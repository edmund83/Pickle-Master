import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle, Calendar, Package, Clock } from 'lucide-react'
import Link from 'next/link'
import type { InventoryItem } from '@/types/database.types'

async function getExpiringItems() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return { expiringItems: [], expiredItems: [] }
  }

  const today = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  // Get items with expiry dates
  // Note: This assumes an expiry_date column exists in inventory_items
  // If not, this will return empty results gracefully
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase as any)
    .from('inventory_items')
    .select('id, name, sku, quantity, status, custom_fields')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .order('name', { ascending: true })

  const allItems = (items || []) as (Pick<InventoryItem, 'id' | 'name' | 'sku' | 'quantity' | 'status'> & { custom_fields: Record<string, unknown> | null })[]

  // Check for expiry_date in custom_fields or direct column
  const itemsWithExpiry = allItems
    .map(item => {
      const expiryDate = item.custom_fields?.expiry_date || item.custom_fields?.expiryDate
      return {
        ...item,
        expiry_date: expiryDate ? new Date(expiryDate as string) : null,
      }
    })
    .filter(item => item.expiry_date && !isNaN(item.expiry_date.getTime()))

  const expiredItems = itemsWithExpiry.filter(item => item.expiry_date! < today)
  const expiringItems = itemsWithExpiry.filter(
    item => item.expiry_date! >= today && item.expiry_date! <= thirtyDaysFromNow
  )

  return { expiringItems, expiredItems }
}

export default async function ExpiringItemsPage() {
  const { expiringItems, expiredItems } = await getExpiringItems()

  const totalAtRisk = expiringItems.length + expiredItems.length

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Expiring Items Report</h1>
        <p className="mt-1 text-neutral-500">
          Track items that are expired or expiring soon
        </p>
      </div>

      <div className="p-8">
        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Expired</p>
                <p className="text-2xl font-semibold text-red-600">{expiredItems.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Expiring (30 days)</p>
                <p className="text-2xl font-semibold text-yellow-600">{expiringItems.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total at Risk</p>
                <p className="text-2xl font-semibold text-neutral-900">{totalAtRisk}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expired Items */}
        {expiredItems.length > 0 && (
          <div className="mb-8 rounded-xl border border-red-200 bg-white">
            <div className="border-b border-red-200 bg-red-50 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Expired Items
              </h2>
            </div>
            <ul className="divide-y divide-neutral-200">
              {expiredItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <Link
                        href={`/inventory/${item.id}`}
                        className="font-medium text-neutral-900 hover:text-pickle-600"
                      >
                        {item.name}
                      </Link>
                      {item.sku && (
                        <p className="text-sm text-neutral-500">SKU: {item.sku}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      Expired {item.expiry_date?.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expiring Soon */}
        {expiringItems.length > 0 && (
          <div className="rounded-xl border border-yellow-200 bg-white">
            <div className="border-b border-yellow-200 bg-yellow-50 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-yellow-700">
                <Clock className="h-5 w-5" />
                Expiring Within 30 Days
              </h2>
            </div>
            <ul className="divide-y divide-neutral-200">
              {expiringItems.map((item) => {
                const daysUntilExpiry = Math.ceil(
                  (item.expiry_date!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )

                return (
                  <li key={item.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <Link
                          href={`/inventory/${item.id}`}
                          className="font-medium text-neutral-900 hover:text-pickle-600"
                        >
                          {item.name}
                        </Link>
                        {item.sku && (
                          <p className="text-sm text-neutral-500">SKU: {item.sku}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-yellow-600">
                        {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''} left
                      </p>
                      <p className="text-sm text-neutral-500">
                        Expires {item.expiry_date?.toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                )
              })}
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
              No items are expired or expiring soon.
              <br />
              <span className="text-sm">
                To track expiry dates, add an &quot;expiry_date&quot; field to your items&apos; custom fields.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
