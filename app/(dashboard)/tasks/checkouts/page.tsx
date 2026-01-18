import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckoutsClient, CheckoutItem } from '@/components/workflows/CheckoutsClient'

async function getCheckouts(): Promise<{
  checkouts: CheckoutItem[]
  stats: {
    active: number
    overdue: number
    returned: number
  }
}> {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all checkouts
   
  const { data } = await (supabase as any).rpc('get_checkouts', {
    p_limit: 100
  })

  const checkouts: CheckoutItem[] = data?.checkouts
    ? typeof data.checkouts === 'string'
      ? JSON.parse(data.checkouts)
      : data.checkouts
    : []

  // Calculate stats
  const active = checkouts.filter(
    (c) => c.status === 'checked_out' && c.days_overdue === 0
  ).length
  const overdue = checkouts.filter(
    (c) => (c.status === 'overdue' || c.days_overdue > 0) && c.status !== 'returned'
  ).length
  const returned = checkouts.filter((c) => c.status === 'returned').length

  return {
    checkouts,
    stats: { active, overdue, returned }
  }
}

export default async function CheckoutsPage() {
  const { checkouts, stats } = await getCheckouts()

  return <CheckoutsClient checkouts={checkouts} stats={stats} />
}
