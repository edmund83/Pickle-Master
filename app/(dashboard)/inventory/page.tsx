import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { InventoryItemWithTags, Folder } from '@/types/database.types'
import { MobileInventoryView } from './components/mobile-inventory-view'
import { InventoryDesktopView } from './components/inventory-desktop-view'
import { escapeSqlLike } from '@/lib/utils'

function sanitizeSearchTerm(value?: string): string {
  const sanitized = String(value ?? '')
    .replace(/[(),]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100)
  // Escape SQL LIKE wildcards (% and _) to prevent pattern injection
  return escapeSqlLike(sanitized)
}

async function getInventoryData(query?: string): Promise<{
  items: InventoryItemWithTags[],
  folders: Folder[],
  userRole: 'owner' | 'staff' | 'viewer',
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
    return { items: [], folders: [], userRole: 'viewer' }
  }

  // Use items_with_tags view to get tag details
   
  let queryBuilder = (supabase as any)
    .from('items_with_tags')
    .select('id, name, sku, barcode, quantity, min_quantity, price, cost_price, status, description, notes, unit, folder_id, tag_list, image_urls, location, updated_at')
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (query) {
    const sanitizedQuery = sanitizeSearchTerm(query)
    if (sanitizedQuery) {
      queryBuilder = queryBuilder.or(`name.ilike.%${sanitizedQuery}%,sku.ilike.%${sanitizedQuery}%,barcode.eq.${sanitizedQuery}`)
    }
  }

  const { data: items } = await queryBuilder

   
  const { data: folders } = await (supabase as any)
    .from('folders')
    .select('id, name, parent_id, color, path, depth, sort_order')
    .eq('tenant_id', profile.tenant_id)
    .order('sort_order', { ascending: true })

  return {
    items: (items || []) as InventoryItemWithTags[],
    folders: (folders || []) as Folder[],
    userRole: profile.role || 'viewer',
  }
}

export default async function InventoryPage(props: { searchParams?: Promise<{ q?: string; view?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams?.q
  const view = searchParams?.view || 'grid'
  const { items, folders, userRole } = await getInventoryData(query)

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <InventoryDesktopView
          items={items}
          folders={folders}
          view={view}
          userRole={userRole}
        />
      </div>

      {/* Mobile View */}
      <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
        <MobileInventoryView items={items} folders={folders} userRole={userRole} />
      </div>
    </>
  )
}
