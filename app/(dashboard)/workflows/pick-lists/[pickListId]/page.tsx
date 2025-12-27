import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PickListDetailClient } from './PickListDetailClient'

interface PickListWithItems {
  pick_list: {
    id: string
    name: string
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

  return data
}

export default async function PickListDetailPage({
  params
}: {
  params: Promise<{ pickListId: string }>
}) {
  const { pickListId } = await params
  const data = await getPickListWithItems(pickListId)

  if (!data || !data.pick_list) {
    notFound()
  }

  return <PickListDetailClient data={data} />
}
