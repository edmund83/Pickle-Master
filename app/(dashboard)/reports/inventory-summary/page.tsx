import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InventoryItem, Folder as FolderType } from '@/types/database.types'
import { formatCurrency, TenantSettings, DEFAULT_TENANT_SETTINGS } from '@/lib/formatting'

interface SummaryData {
  items: InventoryItem[]
  folders: FolderType[]
  totalItems: number
  totalValue: number
  byStatus: {
    in_stock: number
    low_stock: number
    out_of_stock: number
  }
  settings: Partial<TenantSettings>
}

async function getSummaryData(): Promise<SummaryData> {
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
      items: [],
      folders: [],
      totalItems: 0,
      totalValue: 0,
      byStatus: { in_stock: 0, low_stock: 0, out_of_stock: 0 },
      settings: DEFAULT_TENANT_SETTINGS,
    }
  }

  // Fetch tenant settings for currency formatting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant } = await (supabase as any)
    .from('tenants')
    .select('settings')
    .eq('id', profile.tenant_id)
    .single()

  const settings = tenant?.settings || DEFAULT_TENANT_SETTINGS

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase as any)
    .from('inventory_items')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: folders } = await (supabase as any)
    .from('folders')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('sort_order', { ascending: true })

  const itemsList = (items || []) as InventoryItem[]

  return {
    items: itemsList,
    folders: (folders || []) as FolderType[],
    totalItems: itemsList.length,
    totalValue: itemsList.reduce((sum, item) => sum + item.quantity * (item.price ?? 0), 0),
    byStatus: {
      in_stock: itemsList.filter((i) => i.status === 'in_stock').length,
      low_stock: itemsList.filter((i) => i.status === 'low_stock').length,
      out_of_stock: itemsList.filter((i) => i.status === 'out_of_stock').length,
    },
    settings,
  }
}

export default async function InventorySummaryPage() {
  const data = await getSummaryData()

  const itemsByFolder = data.folders.map((folder) => ({
    folder,
    items: data.items.filter((item) => item.folder_id === folder.id),
    value: data.items
      .filter((item) => item.folder_id === folder.id)
      .reduce((sum, item) => sum + item.quantity * (item.price ?? 0), 0),
  }))

  const uncategorized = data.items.filter((item) => !item.folder_id)
  const uncategorizedValue = uncategorized.reduce(
    (sum, item) => sum + item.quantity * (item.price ?? 0),
    0
  )

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-4">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Inventory Summary</h1>
          <p className="text-neutral-500">Overview of all inventory</p>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-neutral-500">Total Items</p>
              <p className="text-2xl font-semibold text-neutral-900">{data.totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-neutral-500">Total Value</p>
              <p className="text-2xl font-semibold text-neutral-900">
                {formatCurrency(data.totalValue, data.settings)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-neutral-500">In Stock</p>
              <p className="text-2xl font-semibold text-green-600">{data.byStatus.in_stock}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-neutral-500">Need Attention</p>
              <p className="text-2xl font-semibold text-red-600">
                {data.byStatus.low_stock + data.byStatus.out_of_stock}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* By Category */}
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {itemsByFolder.map(({ folder, items, value }) => (
                <div key={folder.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: (folder.color || '#6b7280') + '20' }}
                    >
                      <Folder className="h-4 w-4" style={{ color: folder.color || '#6b7280' }} />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{folder.name}</p>
                      <p className="text-sm text-neutral-500">{items.length} items</p>
                    </div>
                  </div>
                  <p className="font-medium text-neutral-900">
                    {formatCurrency(value, data.settings)}
                  </p>
                </div>
              ))}
              {uncategorized.length > 0 && (
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                      <Package className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Uncategorized</p>
                      <p className="text-sm text-neutral-500">{uncategorized.length} items</p>
                    </div>
                  </div>
                  <p className="font-medium text-neutral-900">
                    {formatCurrency(uncategorizedValue, data.settings)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
