import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Filter, Package, ScanLine, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { InventoryItem, Folder } from '@/types/database.types'

async function getInventoryData(): Promise<{ items: InventoryItem[], folders: Folder[] }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const profile = profileData as { tenant_id: string | null } | null

  if (!profile?.tenant_id) {
    return { items: [], folders: [] }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items } = await (supabase as any)
    .from('inventory_items')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: folders } = await (supabase as any)
    .from('folders')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('sort_order', { ascending: true })

  return {
    items: (items || []) as InventoryItem[],
    folders: (folders || []) as Folder[]
  }
}

export default async function InventoryPage() {
  const { items, folders } = await getInventoryData()

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Secondary Sidebar - Folders */}
      <div className="flex w-56 flex-col border-r border-neutral-200 bg-white">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
          <h2 className="text-lg font-semibold text-neutral-900">Inventory</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <Link
            href="/inventory"
            className="flex items-center gap-3 rounded-lg bg-pickle-50 px-3 py-2 text-sm font-medium text-pickle-600"
          >
            <Package className="h-4 w-4" />
            All Items
            <span className="ml-auto text-xs text-pickle-400">{items.length}</span>
          </Link>
          {folders.map((folder) => (
            <Link
              key={folder.id}
              href={`/inventory/folder/${folder.id}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: folder.color || '#6b7280' }}
              />
              {folder.name}
            </Link>
          ))}
        </nav>
        <div className="border-t border-neutral-200 p-2">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search items..."
                className="h-9 w-64 rounded-lg border border-neutral-300 pl-9 pr-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/import">
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </Link>
            <Link href="/scan">
              <Button variant="outline" size="sm">
                <ScanLine className="mr-2 h-4 w-4" />
                Scan
              </Button>
            </Link>
            <Link href="/inventory/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-6">
          {items.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  )
}

function ItemCard({ item }: { item: InventoryItem }) {
  const statusColors: Record<string, string> = {
    in_stock: 'bg-green-100 text-green-700',
    low_stock: 'bg-yellow-100 text-yellow-700',
    out_of_stock: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  }

  return (
    <Link
      href={`/inventory/${item.id}`}
      className="group rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      {/* Image placeholder */}
      <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-neutral-100">
        {item.image_urls?.[0] ? (
          <img
            src={item.image_urls[0]}
            alt={item.name}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-neutral-300" />
        )}
      </div>

      {/* Info */}
      <h3 className="font-medium text-neutral-900 group-hover:text-pickle-600">
        {item.name}
      </h3>
      {item.sku && (
        <p className="mt-0.5 text-xs text-neutral-500">SKU: {item.sku}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-semibold text-neutral-900">
          {item.quantity} {item.unit}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            statusColors[item.status || 'in_stock'] || statusColors.in_stock
          }`}
        >
          {statusLabels[item.status || 'in_stock'] || 'In Stock'}
        </span>
      </div>

      {(item.price ?? 0) > 0 && (
        <p className="mt-1 text-sm text-neutral-500">
          RM {(item.price ?? 0).toFixed(2)} / {item.unit}
        </p>
      )}
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Package className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-neutral-900">No items yet</h3>
      <p className="mt-1 text-neutral-500">Get started by adding your first inventory item.</p>
      <Link href="/inventory/new" className="mt-4">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add your first item
        </Button>
      </Link>
    </div>
  )
}
