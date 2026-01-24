import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPaginatedStockCounts } from '@/app/actions/stock-counts'
import { StockCountListClient } from './StockCountListClient'
import { checkFeatureAccess } from '@/lib/features/gating.server'
import { FeatureUpgradePrompt } from '@/components/FeatureUpgradePrompt'

interface SearchParams {
  page?: string
  status?: string
  assigned?: string
  search?: string
  sort?: string
  order?: string
}

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

   
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

   
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

   
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

   
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

   
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return 0

   
  const { count } = await (supabase as any)
    .from('inventory_items')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)

  return count || 0
}

export default async function StockCountPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  // Feature gate: Stock counts require Growth+ plan
  const featureCheck = await checkFeatureAccess('stock_counts')
  if (!featureCheck.allowed) {
    return <FeatureUpgradePrompt feature="stock_counts" />
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const params = await searchParams

  // Parse and validate URL parameters
  const page = parseInt(params.page || '1', 10)
  const status = params.status as 'draft' | 'in_progress' | 'review' | 'completed' | 'cancelled' | undefined
  const assignedTo = params.assigned || undefined
  const search = params.search || undefined
  const sortColumn = params.sort || 'created_at'
  const sortDirection = (params.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  const [stockCountsData, teamMembers, folders, totalItemCount] = await Promise.all([
    getPaginatedStockCounts({
      page,
      pageSize: 20,
      status,
      assignedTo,
      search,
      sortColumn,
      sortDirection,
    }),
    getTeamMembers(),
    getFolders(),
    getTotalItemCount(),
  ])

  return (
    <StockCountListClient
      initialData={stockCountsData}
      teamMembers={teamMembers}
      folders={folders}
      totalItemCount={totalItemCount}
      initialFilters={{
        status: status || '',
        assignedTo: assignedTo || '',
        search: search || '',
        sortColumn,
        sortDirection,
      }}
    />
  )
}
