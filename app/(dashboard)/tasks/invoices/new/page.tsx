import { getCustomers } from '@/app/actions/customers'
import { createClient } from '@/lib/supabase/server'
import { NewInvoiceClient } from './NewInvoiceClient'

export interface PaymentTerm {
  id: string
  name: string
  days: number | null
  is_default: boolean
}

async function getPaymentTerms(): Promise<PaymentTerm[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get user's tenant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return []

  // Get payment terms for tenant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('payment_terms')
    .select('id, name, days, is_default')
    .eq('tenant_id', profile.tenant_id)
    .eq('is_active', true)
    .order('days', { ascending: true, nullsFirst: true })

  return data || []
}

export default async function NewInvoicePage() {
  const [customers, paymentTerms] = await Promise.all([
    getCustomers(),
    getPaymentTerms()
  ])

  return <NewInvoiceClient customers={customers} paymentTerms={paymentTerms} />
}
