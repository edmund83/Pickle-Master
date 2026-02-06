import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, History, Clock, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import { formatTime } from '@/lib/formatting'

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
  from_folder_id: string | null
  to_folder_id: string | null
  from_folder_name: string | null
  to_folder_name: string | null
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value)
}

async function getActivityData(itemId: string) {
  if (!isValidUUID(itemId)) return null

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile for tenant_id (explicit tenant check for defense in depth)
  const { data: profileData } = await (supabase as any)
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const profile = profileData as { tenant_id: string | null } | null
  if (!profile?.tenant_id) return null

  // Get item scoped to current tenant and not deleted
  const { data: item, error: itemError } = await (supabase as any)
    .from('inventory_items')
    .select('id, name, tenant_id')
    .eq('id', itemId)
    .eq('tenant_id', profile.tenant_id)
    .is('deleted_at', null)
    .single()

  if (itemError || !item) return null

  // Get all activity logs for this item (no limit)
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
                          {log.action_type === 'move' && (log.from_folder_name !== null || log.to_folder_name !== null) && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                              <div className="flex items-center gap-1">
                                <Folder className="h-3 w-3 text-accent" fill="oklch(95% 0.08 85.79)" />
                                <span className="text-neutral-500">
                                  {log.from_folder_name || 'No Folder'}
                                </span>
                              </div>
                              <ArrowRight className="h-3 w-3 text-orange-500" />
                              <div className="flex items-center gap-1">
                                <Folder className="h-3 w-3 text-accent" fill="oklch(95% 0.08 85.79)" />
                                <span className="font-medium text-neutral-700">
                                  {log.to_folder_name || 'No Folder'}
                                </span>
                              </div>
                            </div>
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
                            <FormattedShortDate date={log.created_at} />
                          </p>
                          <p className="text-xs text-neutral-400">
                            {formatTime(log.created_at)}
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
