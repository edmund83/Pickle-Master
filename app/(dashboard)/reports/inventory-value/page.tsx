import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DollarSign, TrendingUp, Package, FolderOpen } from 'lucide-react'
import type { InventoryItem, Folder } from '@/types/database.types'

interface ValueByFolder {
  folder: Folder | null
  itemCount: number
  totalValue: number
  totalQuantity: number
}

async function getInventoryValueData() {
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
    return { items: [], folders: [], valueByFolder: [] }
  }

  const [itemsResult, foldersResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('inventory_items')
      .select('id, name, sku, quantity, price, folder_id')
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('folders')
      .select('*')
      .eq('tenant_id', profile.tenant_id),
  ])

  const items = (itemsResult.data || []) as Pick<InventoryItem, 'id' | 'name' | 'sku' | 'quantity' | 'price' | 'folder_id'>[]
  const folders = (foldersResult.data || []) as Folder[]

  // Calculate value by folder
  const folderMap = new Map<string | null, ValueByFolder>()

  // Initialize with all folders
  folderMap.set(null, {
    folder: null,
    itemCount: 0,
    totalValue: 0,
    totalQuantity: 0,
  })

  folders.forEach(folder => {
    folderMap.set(folder.id, {
      folder,
      itemCount: 0,
      totalValue: 0,
      totalQuantity: 0,
    })
  })

  // Aggregate items
  items.forEach(item => {
    const folderId = item.folder_id
    const existing = folderMap.get(folderId) || folderMap.get(null)!
    existing.itemCount++
    existing.totalQuantity += item.quantity
    existing.totalValue += item.quantity * (item.price ?? 0)
  })

  const valueByFolder = Array.from(folderMap.values())
    .filter(v => v.itemCount > 0)
    .sort((a, b) => b.totalValue - a.totalValue)

  return { items, folders, valueByFolder }
}

export default async function InventoryValuePage() {
  const { items, valueByFolder } = await getInventoryValueData()

  const totalValue = items.reduce((sum, item) => sum + item.quantity * (item.price ?? 0), 0)
  const totalItems = items.length
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
  const avgValuePerItem = totalItems > 0 ? totalValue / totalItems : 0

  // Top 10 valuable items
  const topItems = [...items]
    .map(item => ({ ...item, value: item.quantity * (item.price ?? 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Inventory Value Report</h1>
        <p className="mt-1 text-neutral-500">
          Analyze the total value of your inventory
        </p>
      </div>

      <div className="p-8">
        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Value"
            value={`RM ${totalValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Total Items"
            value={totalItems.toLocaleString()}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Total Quantity"
            value={totalQuantity.toLocaleString()}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Avg Value/Item"
            value={`RM ${avgValuePerItem.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="yellow"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Value by Folder */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Value by Folder</h2>
            </div>
            {valueByFolder.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {valueByFolder.map((entry, index) => {
                  const percentage = totalValue > 0 ? (entry.totalValue / totalValue) * 100 : 0

                  return (
                    <li key={entry.folder?.id || 'root'} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {entry.folder ? (
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: entry.folder.color || '#6b7280' }}
                            />
                          ) : (
                            <FolderOpen className="h-4 w-4 text-neutral-400" />
                          )}
                          <span className="font-medium text-neutral-900">
                            {entry.folder?.name || 'Uncategorized'}
                          </span>
                          <span className="text-sm text-neutral-500">
                            ({entry.itemCount} items)
                          </span>
                        </div>
                        <span className="font-semibold text-neutral-900">
                          RM {entry.totalValue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="h-full bg-pickle-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {percentage.toFixed(1)}% of total value
                      </p>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center text-neutral-500">
                No inventory data available
              </div>
            )}
          </div>

          {/* Top Valuable Items */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Top 10 Valuable Items</h2>
            </div>
            {topItems.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {topItems.map((item, index) => (
                  <li key={item.id} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-neutral-900">{item.name}</p>
                        <p className="text-xs text-neutral-500">
                          {item.quantity} × RM {(item.price ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-neutral-900">
                      RM {item.value.toLocaleString('en-MY', { minimumFractionDigits: 2 })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-12 text-center text-neutral-500">
                No items to display
              </div>
            )}
          </div>
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
  color: 'blue' | 'green' | 'yellow' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
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
