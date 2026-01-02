import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, TrendingDown, Minus, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { InventoryItem, ActivityLog } from '@/types/database.types'

async function getTrendsData() {
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
    return { items: [], activities: [], trends: [] }
  }

  // Get current inventory
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase as any)
    .from('inventory_items')
    .select('id, name, sku, quantity, status, updated_at')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)

  // Get activity logs for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activities } = await (supabase as any)
    .from('activity_logs')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  return {
    items: (items || []) as Pick<InventoryItem, 'id' | 'name' | 'sku' | 'quantity' | 'status' | 'updated_at'>[],
    activities: (activities || []) as ActivityLog[],
  }
}

export default async function TrendsPage() {
  const { items, activities } = await getTrendsData()

  // Calculate trends
  const totalItems = items.length
  const lowStockItems = items.filter(i => i.status === 'low_stock').length
  const outOfStockItems = items.filter(i => i.status === 'out_of_stock').length

  // Activity by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const activityByDay = last7Days.map(day => ({
    date: day,
    count: activities.filter(a => a.created_at?.split('T')[0] === day).length,
  }))

  // Action type breakdown
  const actionCounts = activities.reduce((acc, a) => {
    acc[a.action_type] = (acc[a.action_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Most active items (by activity count)
  const itemActivityCounts = activities
    .filter(a => a.entity_type === 'item' && a.entity_id)
    .reduce((acc, a) => {
      acc[a.entity_id!] = {
        count: (acc[a.entity_id!]?.count || 0) + 1,
        name: a.entity_name || 'Unknown',
      }
      return acc
    }, {} as Record<string, { count: number; name: string }>)

  const mostActiveItems = Object.entries(itemActivityCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)

  // Calculate week-over-week change
  const thisWeekActivities = activities.filter(a => {
    if (!a.created_at) return false
    const date = new Date(a.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return date >= weekAgo
  }).length

  const lastWeekActivities = activities.filter(a => {
    if (!a.created_at) return false
    const date = new Date(a.created_at)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    return date >= twoWeeksAgo && date < weekAgo
  }).length

  const weekChange = lastWeekActivities > 0
    ? ((thisWeekActivities - lastWeekActivities) / lastWeekActivities) * 100
    : 0

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Inventory Trends</h1>
        <p className="mt-1 text-neutral-500">
          Analyze patterns and trends in your inventory over time
        </p>
      </div>

      <div className="p-8">
        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Total Items</p>
                <p className="text-2xl font-semibold text-neutral-900">{totalItems}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Weekly Activity</p>
                <p className="text-2xl font-semibold text-neutral-900">{thisWeekActivities}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                weekChange > 0 ? 'text-green-600' : weekChange < 0 ? 'text-red-600' : 'text-neutral-600'
              }`}>
                {weekChange > 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : weekChange < 0 ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                {Math.abs(weekChange).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Low Stock</p>
                <p className="text-2xl font-semibold text-yellow-600">{lowStockItems}</p>
              </div>
              <TrendingDown className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-red-600">{outOfStockItems}</p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Activity Chart (Simple Bar Representation) */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Activity Last 7 Days</h2>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between gap-2 h-40">
                {activityByDay.map((day, index) => {
                  const maxCount = Math.max(...activityByDay.map(d => d.count), 1)
                  const height = (day.count / maxCount) * 100

                  return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                      <div className="relative w-full flex justify-center">
                        <div
                          className="w-8 rounded-t-lg bg-primary"
                          style={{ height: `${Math.max(height, 4)}px` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-xs font-medium text-neutral-700">{day.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Breakdown */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Action Breakdown</h2>
            </div>
            <div className="p-6">
              {Object.entries(actionCounts).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(actionCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([action, count]) => {
                      const total = Object.values(actionCounts).reduce((a, b) => a + b, 0)
                      const percentage = (count / total) * 100

                      return (
                        <div key={action}>
                          <div className="flex items-center justify-between text-sm">
                            <span className="capitalize text-neutral-700">{action.replace('_', ' ')}</span>
                            <span className="font-medium text-neutral-900">{count}</span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="py-8 text-center text-neutral-500">
                  No activity in the selected period
                </div>
              )}
            </div>
          </div>

          {/* Most Active Items */}
          <div className="rounded-xl border border-neutral-200 bg-white lg:col-span-2">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Most Active Items</h2>
            </div>
            {mostActiveItems.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {mostActiveItems.map(([id, data], index) => (
                  <li key={id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium text-neutral-900">{data.name}</span>
                    </div>
                    <span className="text-sm text-neutral-500">
                      {data.count} action{data.count !== 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center text-neutral-500">
                No item activity in the selected period
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
