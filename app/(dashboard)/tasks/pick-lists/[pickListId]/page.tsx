import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PickListDetailClient } from './PickListDetailClient'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

interface PickListWithItems {
  pick_list: {
    id: string
    name: string
    display_id: string | null
    pick_list_number: string | null
    status: string
    due_date: string | null
    item_outcome: string
    notes: string | null
    ship_to_name: string | null
    ship_to_address1: string | null
    ship_to_address2: string | null
    ship_to_city: string | null
    ship_to_state: string | null
    ship_to_postal_code: string | null
    ship_to_country: string | null
    assigned_to: string | null
    created_at: string
    created_by: string | null
    updated_at: string | null
    completed_at: string | null
  }
  items: Array<{
    id: string
    item_id: string
    item_name: string
    item_sku: string | null
    item_image: string | null
    available_quantity: number
    requested_quantity: number
    picked_quantity: number
    picked_at: string | null
    notes: string | null
  }>
  assigned_to_name: string | null
  created_by_name: string | null
}

async function getPickListWithItems(pickListId: string): Promise<PickListWithItems | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('get_pick_list_with_items', {
    p_pick_list_id: pickListId
  })

  if (error) {
    console.error('Error fetching pick list:', error)
    return null
  }

  // Get the created_by user name if we have the pick list
  if (data?.pick_list?.created_by) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: creator } = await (supabase as any)
      .from('profiles')
      .select('full_name')
      .eq('id', data.pick_list.created_by)
      .single()

    data.created_by_name = creator?.full_name || null
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

async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

export default async function PickListDetailPage({
  params
}: {
  params: Promise<{ pickListId: string }>
}) {
  const { pickListId } = await params
  const [data, teamMembers, userId] = await Promise.all([
    getPickListWithItems(pickListId),
    getTeamMembers(),
    getCurrentUserId()
  ])

  if (!data || !data.pick_list) {
    notFound()
  }

  return (
    <PickListDetailClient data={data} teamMembers={teamMembers} currentUserId={userId} />
  )
}
