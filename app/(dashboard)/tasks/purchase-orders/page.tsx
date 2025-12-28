import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PurchaseOrdersClient } from '@/components/workflows/PurchaseOrdersClient'
import type { PurchaseOrderWithRelations } from '@/types/database.types'

async function getPurchaseOrders(): Promise<PurchaseOrderWithRelations[]> {
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
    .from('purchase_orders')
    .select(`
      *,
      vendors(id, name),
      created_by_profile:profiles!created_by(id, full_name),
      submitted_by_profile:profiles!submitted_by(id, full_name)
    `)
    .eq('tenant_id', profile.tenant_id)
    .order('updated_at', { ascending: false })

  return (data || []) as PurchaseOrderWithRelations[]
}

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await getPurchaseOrders()

  return <PurchaseOrdersClient purchaseOrders={purchaseOrders} />
}
