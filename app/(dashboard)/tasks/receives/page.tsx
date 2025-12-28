import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReceivesClient } from '@/components/workflows/ReceivesClient'

interface ReceiveWithRelations {
  id: string
  display_id: string | null
  status: 'draft' | 'completed' | 'cancelled'
  received_date: string
  delivery_note_number: string | null
  carrier: string | null
  tracking_number: string | null
  completed_at: string | null
  created_at: string
  purchase_orders: {
    id: string
    display_id: string | null
    order_number: string | null
    vendors: { name: string } | null
  } | null
  profiles: { full_name: string | null } | null
}

async function getReceives(): Promise<ReceiveWithRelations[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('receives')
    .select(`
      id,
      display_id,
      status,
      received_date,
      delivery_note_number,
      carrier,
      tracking_number,
      completed_at,
      created_at,
      purchase_orders(
        id,
        display_id,
        order_number,
        vendors(name)
      ),
      profiles:received_by(full_name)
    `)
    .eq('tenant_id', profile.tenant_id)
    .order('received_date', { ascending: false })

  return (data || []) as ReceiveWithRelations[]
}

export default async function ReceivesPage() {
  const receives = await getReceives()

  return <ReceivesClient receives={receives} />
}
