import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { StockCountDetailClient } from './StockCountDetailClient'
import { StockCountMobileClient } from './StockCountMobileClient'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

interface Folder {
  id: string
  name: string
  color: string | null
}

async function getStockCountWithItems(stockCountId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_stock_count_with_items', {
    p_stock_count_id: stockCountId
  })

  if (error) {
    console.error('Error fetching stock count:', error)
    return null
  }

  return data
}

async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, email')
    .eq('tenant_id', profile.tenant_id)
    .order('full_name')

  return data || []
}

async function getFolders(): Promise<Folder[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('folders')
    .select('id, name, color')
    .eq('tenant_id', profile.tenant_id)
    .order('name')

  return data || []
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export default async function StockCountDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [data, teamMembers, folders, userId] = await Promise.all([
    getStockCountWithItems(id),
    getTeamMembers(),
    getFolders(),
    getCurrentUserId()
  ])

  if (!data || !data.stock_count) {
    notFound()
  }

  return (
    <>
      {/* Desktop view */}
      <div className="hidden lg:flex lg:flex-1 h-full w-full">
        <StockCountDetailClient data={data} teamMembers={teamMembers} folders={folders} currentUserId={userId} />
      </div>

      {/* Mobile view */}
      <div className="lg:hidden h-full w-full">
        <StockCountMobileClient data={data} teamMembers={teamMembers} folders={folders} currentUserId={userId} />
      </div>
    </>
  )
}
