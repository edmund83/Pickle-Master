import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { InventoryItem, Folder } from '@/types/database.types'
import { InventoryValueStats, ValueByFolderRow, TopValueItemRow } from '@/components/reports/FormattedReportStats'

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
        <InventoryValueStats
          totalValue={totalValue}
          totalItems={totalItems}
          totalQuantity={totalQuantity}
          avgValuePerItem={avgValuePerItem}
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Value by Folder */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Value by Folder</h2>
            </div>
            {valueByFolder.length > 0 ? (
              <ul className="divide-y divide-neutral-200">
                {valueByFolder.map((entry) => {
                  const percentage = totalValue > 0 ? (entry.totalValue / totalValue) * 100 : 0

                  return (
                    <ValueByFolderRow
                      key={entry.folder?.id || 'root'}
                      folderName={entry.folder?.name || 'Uncategorized'}
                      folderColor={entry.folder?.color || null}
                      itemCount={entry.itemCount}
                      totalValue={entry.totalValue}
                      percentage={percentage}
                      isRoot={!entry.folder}
                    />
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
                  <TopValueItemRow
                    key={item.id}
                    index={index}
                    id={item.id}
                    name={item.name}
                    quantity={item.quantity}
                    price={item.price ?? 0}
                    totalValue={item.value}
                  />
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

