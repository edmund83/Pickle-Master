import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PurchaseOrder } from '@/types/database.types'
import { PurchaseOrdersClient } from '@/components/workflows/PurchaseOrdersClient'

async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
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
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })

  return (data || []) as PurchaseOrder[]
}

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await getPurchaseOrders()

  return <PurchaseOrdersClient purchaseOrders={purchaseOrders} />
}
