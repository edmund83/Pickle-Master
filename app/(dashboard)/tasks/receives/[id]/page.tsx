import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ReceiveDetailClient } from './ReceiveDetailClient'
import { getReceive, getLocations } from '@/app/actions/receives'
import { ChatterPanel } from '@/components/chatter'

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

  const entityName = receive.display_id || `Receive ${id.slice(0, 8)}`

  return (
    <div className="flex flex-col h-full">
      <ReceiveDetailClient
        receive={receive}
        locations={locations as Location[]}
      />
      <div className="px-4 pb-6 lg:px-6">
        <ChatterPanel
          entityType="receive"
          entityId={receive.id}
          entityName={entityName}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
