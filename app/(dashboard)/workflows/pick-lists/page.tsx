import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PickListsClient } from '@/components/workflows/PickListsClient'
import type { PickListWithRelations } from '@/types/database.types'

async function getPickLists(): Promise<PickListWithRelations[]> {
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
    .from('pick_lists')
    .select(`
      *,
      assigned_to_profile:profiles!assigned_to(id, full_name),
      created_by_profile:profiles!created_by(id, full_name)
    `)
    .eq('tenant_id', profile.tenant_id)
    .order('updated_at', { ascending: false })

  return (data || []) as PickListWithRelations[]
}

export default async function PickListsPage() {
  const pickLists = await getPickLists()

  return <PickListsClient pickLists={pickLists} />
}
