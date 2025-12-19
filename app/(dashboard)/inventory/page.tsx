import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { InventoryItem, Folder } from '@/types/database.types'
import { MobileInventoryView } from './components/mobile-inventory-view'
import { InventoryDesktopView } from './components/inventory-desktop-view'
import type { FolderStats } from './components/folder-tree-view'

interface FolderStatsRow {
  folder_id: string
  folder_name: string
  folder_color: string | null
  item_count: number
  low_stock_count: number
  total_value: number
}

async function getInventoryData(query?: string): Promise<{
  items: InventoryItem[],
  folders: Folder[],
  folderStats: Map<string, FolderStats>
}> {
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
    return { items: [], folders: [], folderStats: new Map() }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryBuilder = (supabase as any)
    .from('inventory_items')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.eq.${query}`)
  }

  const { data: items } = await queryBuilder

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: folders } = await (supabase as any)
    .from('folders')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('sort_order', { ascending: true })

  // Fetch folder stats using RPC function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: folderStatsData } = await (supabase as any)
    .rpc('get_folder_stats')

  // Convert to Map for efficient lookup
  const folderStats = new Map<string, FolderStats>(
    ((folderStatsData || []) as FolderStatsRow[]).map((stat) => [
      stat.folder_id,
      {
        itemCount: Number(stat.item_count) || 0,
        lowStockCount: Number(stat.low_stock_count) || 0,
        totalValue: Number(stat.total_value) || 0,
      },
    ])
  )

  return {
    items: (items || []) as InventoryItem[],
    folders: (folders || []) as Folder[],
    folderStats,
  }
}

export default async function InventoryPage(props: { searchParams?: Promise<{ q?: string; view?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams?.q
  const view = searchParams?.view || 'grid'
  const { items, folders, folderStats } = await getInventoryData(query)

  // Convert Map to serializable object for client component
  const folderStatsObj = Object.fromEntries(folderStats)

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <InventoryDesktopView
          items={items}
          folders={folders}
          view={view}
          folderStatsObj={folderStatsObj}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
        <MobileInventoryView items={items} folders={folders} />
      </div>
    </>
  )
}
