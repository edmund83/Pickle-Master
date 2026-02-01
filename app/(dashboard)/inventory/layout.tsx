import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Folder } from '@/types/database.types'
import type { FolderStats } from './components/folder-tree-view'
import { InventoryLayoutClient } from './components/inventory-layout-client'

interface FolderStatsRow {
  folder_id: string
  folder_name: string
  folder_color: string | null
  item_count: number
  low_stock_count: number
  total_value: number
}

async function getLayoutData(): Promise<{
  folders: Folder[]
  folderStatsObj: Record<string, FolderStats>
  totalItemCount: number
  userRole: 'owner' | 'staff' | 'viewer'
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')


  const { data: profileData } = await (supabase as any)
    .from('profiles')
    .select('tenant_id, role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { tenant_id: string | null; role: 'owner' | 'staff' | 'viewer' | null } | null

  if (!profile?.tenant_id) {
    return { folders: [], folderStatsObj: {}, totalItemCount: 0, userRole: 'viewer' }
  }

  // Fetch folders
   
  const { data: folders } = await (supabase as any)
    .from('folders')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('sort_order', { ascending: true })

  // Fetch folder stats using RPC function
   
  const { data: folderStatsData } = await (supabase as any)
    .rpc('get_folder_stats')

  // Convert to object for serialization
  const folderStatsObj: Record<string, FolderStats> = {}
  ;((folderStatsData || []) as FolderStatsRow[]).forEach((stat) => {
    folderStatsObj[stat.folder_id] = {
      itemCount: Number(stat.item_count) || 0,
      lowStockCount: Number(stat.low_stock_count) || 0,
      totalValue: Number(stat.total_value) || 0,
    }
  })

  // Get total item count
   
  const { count } = await (supabase as any)
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)

  return {
    folders: (folders || []) as Folder[],
    folderStatsObj,
    totalItemCount: count || 0,
    userRole: profile.role || 'viewer',
  }
}

export default async function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { folders, folderStatsObj, totalItemCount, userRole } = await getLayoutData()

  return (
    <InventoryLayoutClient
      folders={folders}
      folderStatsObj={folderStatsObj}
      totalItemCount={totalItemCount}
      userRole={userRole}
    >
      {children}
    </InventoryLayoutClient>
  )
}
