import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, ClipboardList, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PickList } from '@/types/database.types'
import { format } from 'date-fns'

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

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="h-4 w-4 text-neutral-400" />,
  in_progress: <Clock className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function PickListsPage() {
  const pickLists = await getPickLists()

  const grouped = {
    active: pickLists.filter((p) => ['draft', 'in_progress'].includes(p.status || '')),
    completed: pickLists.filter((p) => p.status === 'completed'),
    cancelled: pickLists.filter((p) => p.status === 'cancelled'),
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/workflows">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Pick Lists</h1>
            <p className="text-neutral-500">Create and manage picking lists</p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Pick List
        </Button>
      </div>

      <div className="p-6">
        {pickLists.length > 0 ? (
          <div className="space-y-6">
            {/* Active */}
            {grouped.active.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active ({grouped.active.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {grouped.active.map((list) => (
                      <PickListRow key={list.id} list={list} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Completed */}
            {grouped.completed.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed ({grouped.completed.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    {grouped.completed.map((list) => (
                      <PickListRow key={list.id} list={list} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <ClipboardList className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900">No pick lists yet</h3>
              <p className="mt-1 text-neutral-500">Create your first pick list to get started.</p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Pick List
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function PickListRow({ list }: { list: PickList }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        {statusIcons[list.status || 'draft']}
        <div>
          <p className="font-medium text-neutral-900">{list.name || `Pick List #${list.id.slice(0, 8)}`}</p>
          <p className="text-sm text-neutral-500">
            Created {list.created_at ? format(new Date(list.created_at), 'MMM d, yyyy') : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[list.status || 'draft']}`}
        >
          {statusLabels[list.status || 'draft']}
        </span>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </div>
    </div>
  )
}
