import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewReceiveClient } from './NewReceiveClient'
import { getLocations } from '@/app/actions/receives'

export default async function NewReceivePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const locations = await getLocations()

  return (
    <NewReceiveClient
      locations={locations as { id: string; name: string; type: string }[]}
    />
  )
}
