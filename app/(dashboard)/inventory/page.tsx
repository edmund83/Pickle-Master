import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { InventoryItemWithTags, Folder } from '@/types/database.types'
import { MobileInventoryView } from './components/mobile-inventory-view'
import { InventoryDesktopView } from './components/inventory-desktop-view'

async function getInventoryData(query?: string): Promise<{
  items: InventoryItemWithTags[],
  folders: Folder[],
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
    return { items: [], folders: [] }
  }

  // Use items_with_tags view to get tag details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryBuilder = (supabase as any)
    .from('items_with_tags')
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

  return {
    items: (items || []) as InventoryItemWithTags[],
    folders: (folders || []) as Folder[],
  }
}

export default async function InventoryPage(props: { searchParams?: Promise<{ q?: string; view?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams?.q
  const view = searchParams?.view || 'grid'
  const { items, folders } = await getInventoryData(query)

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <InventoryDesktopView
          items={items}
          folders={folders}
          view={view}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
        <MobileInventoryView items={items} folders={folders} />
      </div>
    </>
  )
}
