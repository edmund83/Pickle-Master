import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getStockCounts } from '@/app/actions/stock-counts'
import { StockCountClient } from '@/components/workflows/StockCountClient'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

interface Folder {
  id: string
  name: string
  color: string | null
  parent_id: string | null
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
    .select('id, name, color, parent_id')
    .eq('tenant_id', profile.tenant_id)
    .order('name')

  return data || []
}

async function getTotalItemCount(): Promise<number> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)

  return count || 0
}

export default async function StockCountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [stockCounts, teamMembers, folders, totalItemCount] = await Promise.all([
    getStockCounts(),
    getTeamMembers(),
    getFolders(),
    getTotalItemCount(),
  ])

  return (
    <StockCountClient
      stockCounts={stockCounts}
      teamMembers={teamMembers}
      folders={folders}
      totalItemCount={totalItemCount}
    />
  )
}
