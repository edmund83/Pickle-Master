import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, History, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface PageProps {
  params: Promise<{ itemId: string }>
}

interface ActivityLogItem {
  id: string
  action_type: string
  entity_name: string
  quantity_delta: number | null
  quantity_before: number | null
  quantity_after: number | null
  user_name: string | null
  created_at: string
  changes: Record<string, unknown> | null
}

const actionColors: Record<string, string> = {
  create: 'bg-green-500',
  update: 'bg-blue-500',
  adjust_quantity: 'bg-purple-500',
  quantity_adjustment: 'bg-purple-500',
  move: 'bg-orange-500',
  delete: 'bg-red-500',
  restore: 'bg-teal-500',
}

const actionLabels: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  adjust_quantity: 'Quantity Adjusted',
  quantity_adjustment: 'Quantity Adjusted',
  move: 'Moved',
  delete: 'Deleted',
  restore: 'Restored',
}

async function getActivityData(itemId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get item details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item, error: itemError } = await (supabase as any)
    .from('inventory_items')
    .select('id, name, tenant_id')
    .eq('id', itemId)
    .single()

  if (itemError || !item) {
    return null
  }

  // Get all activity logs for this item (no limit)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activityLogs } = await (supabase as any)
    .rpc('get_activity_logs', {
      p_entity_id: itemId,
      p_entity_type: 'item',
      p_limit: 100
    })

  return {
    item,
    activityLogs: (activityLogs || []) as ActivityLogItem[],
  }
}

export default async function ActivityHistoryPage({ params }: PageProps) {
  const { itemId } = await params
  const data = await getActivityData(itemId)

  if (!data) {
    notFound()
  }

  const { item, activityLogs } = data

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href={`/inventory/${itemId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Item
            </Button>
          </Link>
          <div className="h-6 w-px bg-neutral-200" />
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Activity History</h1>
            <p className="text-sm text-neutral-500">{item.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="h-5 w-5 text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-900">
                All Activity ({activityLogs.length})
              </h2>
            </div>

            {activityLogs.length > 0 ? (
              <div className="space-y-4">
                {activityLogs.map((log, index) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${actionColors[log.action_type] || 'bg-neutral-400'}`} />
                      {index < activityLogs.length - 1 && (
                        <div className="flex-1 w-px bg-neutral-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-neutral-900">
                            <span className="font-medium">
                              {actionLabels[log.action_type] || log.action_type.replace(/_/g, ' ')}
                            </span>
                            {log.quantity_delta ? (
                              <span className={`ml-2 font-medium ${log.quantity_delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({log.quantity_delta > 0 ? '+' : ''}{log.quantity_delta})
                              </span>
                            ) : null}
                          </p>
                          {log.quantity_before !== null && log.quantity_after !== null && (
                            <p className="text-xs text-neutral-500 mt-1">
                              Quantity: {log.quantity_before} → {log.quantity_after}
                            </p>
                          )}
                          {log.changes && typeof log.changes === 'object' && (
                            <div className="mt-2 text-xs text-neutral-500">
                              {Object.entries(log.changes)
                                .filter(([key]) => !['source'].includes(key))
                                .map(([key, value]) => (
                                  <div key={key} className="flex gap-2">
                                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <span className="text-neutral-700">{String(value)}</span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-neutral-500">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {format(new Date(log.created_at), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {format(new Date(log.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        by {log.user_name || 'System'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-neutral-300 mx-auto" />
                <p className="mt-4 text-neutral-500">No activity recorded yet</p>
                <p className="text-sm text-neutral-400">
                  Activity will appear here as changes are made to this item
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
