import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReceiveDetailClient } from './ReceiveDetailClient'
import { getReceive, getLocations } from '@/app/actions/receives'

export interface Location {
  id: string
  name: string
  type: string
}

export default async function ReceiveDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [receive, locations] = await Promise.all([
    getReceive(id),
    getLocations()
  ])

  if (!receive) {
    notFound()
  }

  return (
    <ReceiveDetailClient
      receive={receive}
      locations={locations as Location[]}
    />
  )
}
