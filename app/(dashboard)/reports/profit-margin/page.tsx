import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Percent, DollarSign, Package, AlertCircle } from 'lucide-react'
import type { InventoryItem } from '@/types/database.types'

interface ItemWithMargin {
  id: string
  name: string
  sku: string | null
  quantity: number
  price: number
  cost_price: number
  marginAmount: number
  marginPercent: number
  totalProfit: number
}

async function getProfitMarginData() {
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
    return { items: [], itemsWithCost: [], itemsWithoutCost: [] }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('inventory_items')
    .select('id, name, sku, quantity, price, cost_price')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching items:', error)
    return { items: [], itemsWithCost: [], itemsWithoutCost: [] }
  }

  const items = (data || []) as Pick<InventoryItem, 'id' | 'name' | 'sku' | 'quantity' | 'price' | 'cost_price'>[]

  // Separate items with and without cost
  const itemsWithCost: ItemWithMargin[] = items
    .filter(item => item.cost_price && item.cost_price > 0)
    .map(item => {
      const price = item.price || 0
      const costPrice = item.cost_price || 0
      const marginAmount = price - costPrice
      const marginPercent = costPrice > 0 ? (marginAmount / costPrice) * 100 : 0
      const totalProfit = item.quantity * marginAmount
      return {
        id: item.id,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price,
        cost_price: costPrice,
        marginAmount,
        marginPercent,
        totalProfit,
      }
    })

  const itemsWithoutCost = items.filter(item => !item.cost_price || item.cost_price <= 0)

  return { items, itemsWithCost, itemsWithoutCost }
}

export default async function ProfitMarginPage() {
  const { items, itemsWithCost, itemsWithoutCost } = await getProfitMarginData()

  // Calculate summary stats
  const totalPotentialProfit = itemsWithCost.reduce((sum, item) => sum + item.totalProfit, 0)
  const totalCost = itemsWithCost.reduce((sum, item) => sum + item.quantity * item.cost_price, 0)
  const totalRevenue = itemsWithCost.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const avgMarginPercent = itemsWithCost.length > 0
    ? itemsWithCost.reduce((sum, item) => sum + item.marginPercent, 0) / itemsWithCost.length
    : 0

  // Sort items by margin
  const highestMargin = [...itemsWithCost].sort((a, b) => b.marginPercent - a.marginPercent).slice(0, 10)
  const lowestMargin = [...itemsWithCost].sort((a, b) => a.marginPercent - b.marginPercent).slice(0, 10)
  const topProfitItems = [...itemsWithCost].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 10)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Profit Margin Report</h1>
        <p className="mt-1 text-neutral-500">
          Analyze margins and potential profit across your inventory
        </p>
      </div>

      <div className="p-8">
        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Potential Profit"
            value={`RM ${totalPotentialProfit.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            color={totalPotentialProfit >= 0 ? 'green' : 'red'}
          />
          <StatCard
            title="Average Margin"
            value={`${avgMarginPercent.toFixed(1)}%`}
            icon={Percent}
            color={avgMarginPercent >= 0 ? 'blue' : 'red'}
          />
          <StatCard
            title="Items with Cost Data"
            value={`${itemsWithCost.length} / ${items.length}`}
            icon={Package}
            color="purple"
          />
          <StatCard
            title="Total Cost Value"
            value={`RM ${totalCost.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`}
            icon={TrendingDown}
            color="yellow"
          />
        </div>

        {/* Missing Cost Data Warning */}
        {itemsWithoutCost.length > 0 && (
          <div className="mb-8 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                {itemsWithoutCost.length} items missing cost data
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Add cost prices to these items for accurate margin calculations:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {itemsWithoutCost.slice(0, 5).map(item => (
                  <Link
                    key={item.id}
                    href={`/inventory/${item.id}/edit`}
                    className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800 hover:bg-amber-200"
                  >
                    {item.name}
                  </Link>
                ))}
                {itemsWithoutCost.length > 5 && (
                  <span className="inline-flex items-center px-3 py-1 text-sm text-amber-600">
                    +{itemsWithoutCost.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Highest Margin Items */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-neutral-900">Highest Margin Items</h2>
              </div>
            </div>
            {highestMargin.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {highestMargin.map((item, index) => (
                  <li key={item.id} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                          {index + 1}
                        </span>
                        <div>
                          <Link
                            href={`/inventory/${item.id}`}
                            className="font-medium text-neutral-900 hover:text-pickle-600 hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-neutral-500">
                            Cost: RM {item.cost_price.toFixed(2)} → Price: RM {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-green-600">
                        {item.marginPercent.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center text-neutral-500">
                No items with cost data
              </div>
            )}
          </div>

          {/* Lowest Margin Items */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold text-neutral-900">Lowest Margin Items</h2>
              </div>
            </div>
            {lowestMargin.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {lowestMargin.map((item, index) => (
                  <li key={item.id} className="px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${item.marginPercent < 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <Link
                            href={`/inventory/${item.id}`}
                            className="font-medium text-neutral-900 hover:text-pickle-600 hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-neutral-500">
                            Cost: RM {item.cost_price.toFixed(2)} → Price: RM {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${item.marginPercent < 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {item.marginPercent.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center text-neutral-500">
                No items with cost data
              </div>
            )}
          </div>
        </div>

        {/* Top Profit Contributors */}
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-pickle-500" />
              <h2 className="text-lg font-semibold text-neutral-900">Top Profit Contributors</h2>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Items generating the most profit (quantity × margin)
            </p>
          </div>
          {topProfitItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-neutral-600">#</th>
                    <th className="px-6 py-3 text-left font-medium text-neutral-600">Item</th>
                    <th className="px-6 py-3 text-right font-medium text-neutral-600">Qty</th>
                    <th className="px-6 py-3 text-right font-medium text-neutral-600">Cost</th>
                    <th className="px-6 py-3 text-right font-medium text-neutral-600">Price</th>
                    <th className="px-6 py-3 text-right font-medium text-neutral-600">Margin %</th>
                    <th className="px-6 py-3 text-right font-medium text-neutral-600">Total Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {topProfitItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-3 text-neutral-500">{index + 1}</td>
                      <td className="px-6 py-3">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="font-medium text-neutral-900 hover:text-pickle-600 hover:underline"
                        >
                          {item.name}
                        </Link>
                        {item.sku && (
                          <p className="text-xs text-neutral-500">{item.sku}</p>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right text-neutral-900">{item.quantity}</td>
                      <td className="px-6 py-3 text-right text-neutral-600">RM {item.cost_price.toFixed(2)}</td>
                      <td className="px-6 py-3 text-right text-neutral-900">RM {item.price.toFixed(2)}</td>
                      <td className={`px-6 py-3 text-right font-medium ${item.marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.marginPercent.toFixed(1)}%
                      </td>
                      <td className={`px-6 py-3 text-right font-semibold ${item.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        RM {item.totalProfit.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-neutral-500">
              No items with cost data. Add cost prices to see profit analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
