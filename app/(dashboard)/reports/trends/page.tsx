import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingDown, Minus, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react'

// RPC response types
interface ActivityByDay {
  activity_date: string
  activity_count: number
}

interface ActionBreakdown {
  action_type: string
  action_count: number
  percentage: number
}

interface MostActiveItem {
  entity_id: string
  entity_name: string
  activity_count: number
}

interface WeeklyComparison {
  this_week_count: number
  last_week_count: number
  change_percent: number
}

interface InventoryStatusCounts {
  total: number
  lowStock: number
  outOfStock: number
}

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
    return {
      inventoryCounts: { total: 0, lowStock: 0, outOfStock: 0 },
      activityByDay: [],
      actionBreakdown: [],
      mostActiveItems: [],
      weeklyComparison: { this_week_count: 0, last_week_count: 0, change_percent: 0 },
    }
  }

  const tenantId = profile.tenant_id

  // Execute all queries in parallel for better performance
  const [
    inventoryResult,
    activityByDayResult,
    actionBreakdownResult,
    mostActiveItemsResult,
    weeklyComparisonResult,
  ] = await Promise.all([
    // Get inventory status counts (only id and status needed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('inventory_items')
      .select('id, status')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null),

    // Get activity by day for last 7 days via RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_activity_by_day', {
      p_tenant_id: tenantId,
      p_days: 7,
    }),

    // Get action breakdown for last 30 days via RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_action_breakdown', {
      p_tenant_id: tenantId,
      p_days: 30,
    }),

    // Get most active items for last 30 days via RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_most_active_items', {
      p_tenant_id: tenantId,
      p_days: 30,
      p_limit: 5,
    }),

    // Get weekly comparison via RPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('get_weekly_comparison', {
      p_tenant_id: tenantId,
    }),
  ])

  // Process inventory counts
  const items = (inventoryResult.data || []) as { id: string; status: string }[]
  const inventoryCounts: InventoryStatusCounts = {
    total: items.length,
    lowStock: items.filter(i => i.status === 'low_stock').length,
    outOfStock: items.filter(i => i.status === 'out_of_stock').length,
  }

  // Get RPC results (already aggregated in SQL)
  const activityByDay = (activityByDayResult.data || []) as ActivityByDay[]
  const actionBreakdown = (actionBreakdownResult.data || []) as ActionBreakdown[]
  const mostActiveItems = (mostActiveItemsResult.data || []) as MostActiveItem[]
  const weeklyComparisonData = (weeklyComparisonResult.data || []) as WeeklyComparison[]

  return {
    inventoryCounts,
    activityByDay,
    actionBreakdown,
    mostActiveItems,
    weeklyComparison: weeklyComparisonData[0] || {
      this_week_count: 0,
      last_week_count: 0,
      change_percent: 0,
    },
  }
}

export default async function TrendsPage() {
  const {
    inventoryCounts,
    activityByDay,
    actionBreakdown,
    mostActiveItems,
    weeklyComparison,
  } = await getTrendsData()

  // All aggregation is now done in SQL via RPC functions
  // No JS processing of activity logs needed

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
                <p className="text-2xl font-semibold text-neutral-900">{inventoryCounts.total}</p>
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
                <p className="text-2xl font-semibold text-neutral-900">{weeklyComparison.this_week_count}</p>
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                weeklyComparison.change_percent > 0 ? 'text-green-600' : weeklyComparison.change_percent < 0 ? 'text-red-600' : 'text-neutral-600'
              }`}>
                {weeklyComparison.change_percent > 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : weeklyComparison.change_percent < 0 ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                {Math.abs(weeklyComparison.change_percent).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Low Stock</p>
                <p className="text-2xl font-semibold text-yellow-600">{inventoryCounts.lowStock}</p>
              </div>
              <TrendingDown className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Out of Stock</p>
                <p className="text-2xl font-semibold text-red-600">{inventoryCounts.outOfStock}</p>
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
              {activityByDay.length > 0 ? (
                <div className="flex items-end justify-between gap-2 h-40">
                  {activityByDay.map((day) => {
                    const maxCount = Math.max(...activityByDay.map(d => d.activity_count), 1)
                    const height = (day.activity_count / maxCount) * 100

                    return (
                      <div key={day.activity_date} className="flex flex-1 flex-col items-center gap-2">
                        <div className="relative w-full flex justify-center">
                          <div
                            className="w-8 rounded-t-lg bg-primary"
                            style={{ height: `${Math.max(height, 4)}px` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500">
                          {new Date(day.activity_date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-xs font-medium text-neutral-700">{day.activity_count}</span>
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

          {/* Action Breakdown */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Action Breakdown</h2>
            </div>
            <div className="p-6">
              {actionBreakdown.length > 0 ? (
                <div className="space-y-4">
                  {actionBreakdown.map((action) => (
                    <div key={action.action_type}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-neutral-700">{action.action_type.replace('_', ' ')}</span>
                        <span className="font-medium text-neutral-900">{action.action_count}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${action.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
                {mostActiveItems.map((item, index) => (
                  <li key={item.entity_id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium text-neutral-900">{item.entity_name}</span>
                    </div>
                    <span className="text-sm text-neutral-500">
                      {item.activity_count} action{item.activity_count !== 1 ? 's' : ''}
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
