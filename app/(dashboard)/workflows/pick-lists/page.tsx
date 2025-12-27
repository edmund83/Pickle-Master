import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PickList } from '@/types/database.types'
import { PickListsClient } from '@/components/workflows/PickListsClient'

async function getPickLists(): Promise<PickList[]> {
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
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  return (data || []) as PickList[]
}

export default async function PickListsPage() {
  const pickLists = await getPickLists()

  return <PickListsClient pickLists={pickLists} />
}
