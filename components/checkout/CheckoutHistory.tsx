'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench,
  XCircle,
  LogOut,
  LogIn,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import type { ItemCondition } from '@/types/database.types'

interface CheckoutHistoryItem {
  id: string
  quantity: number
  assignee_type: 'person' | 'job' | 'location'
  assignee_name: string | null
  checked_out_at: string
  due_date: string | null
  status: 'checked_out' | 'returned' | 'overdue'
  returned_at: string | null
  return_condition: ItemCondition | null
  return_notes: string | null
  checked_out_by_name: string | null
  returned_by_name: string | null
}

interface CheckoutHistoryProps {
  itemId: string
  limit?: number
}

const assigneeTypeIcons = {
  person: <User className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />
}

const conditionIcons: Record<ItemCondition, React.ReactNode> = {
  good: <CheckCircle className="h-4 w-4 text-green-500" />,
  damaged: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  needs_repair: <Wrench className="h-4 w-4 text-orange-500" />,
  lost: <XCircle className="h-4 w-4 text-red-500" />
}

const conditionLabels: Record<ItemCondition, string> = {
  good: 'Good',
  damaged: 'Damaged',
  needs_repair: 'Needs Repair',
  lost: 'Lost'
}

export function CheckoutHistory({ itemId, limit = 10 }: CheckoutHistoryProps) {
  const [history, setHistory] = useState<CheckoutHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [itemId])

  async function loadHistory() {
    setLoading(true)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: historyData } = await (supabase as any)
        .from('checkouts')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (historyData) {
        setHistory(historyData)
      }
    } catch (err) {
      console.error('Error loading checkout history:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
          <Clock className="h-6 w-6 text-neutral-400" />
        </div>
        <p className="text-sm text-neutral-500">No checkout history yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={item.id} className="relative flex gap-4">
          {/* Timeline line */}
          {index < history.length - 1 && (
            <div className="absolute left-[11px] top-8 h-full w-px bg-neutral-200" />
          )}

          {/* Timeline dot */}
          <div
            className={`relative z-10 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${item.status === 'returned'
                ? 'bg-green-100'
                : item.status === 'overdue'
                  ? 'bg-red-100'
                  : 'bg-amber-100'
              }`}
          >
            {item.status === 'returned' ? (
              <LogIn className={`h-3 w-3 ${item.return_condition === 'good' ? 'text-green-600' :
                  item.return_condition === 'lost' ? 'text-red-600' :
                    'text-yellow-600'
                }`} />
            ) : (
              <LogOut className={`h-3 w-3 ${item.status === 'overdue' ? 'text-red-600' : 'text-amber-600'
                }`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              {/* Header */}
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400">
                    {assigneeTypeIcons[item.assignee_type]}
                  </span>
                  <span className="font-medium text-neutral-900">
                    {item.assignee_name || 'Unknown'}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.status === 'returned'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'overdue'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                  >
                    {item.status === 'returned'
                      ? 'Returned'
                      : item.status === 'overdue'
                        ? 'Overdue'
                        : 'Checked Out'}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">
                  Qty: {item.quantity}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-500">Checked out:</span>
                  <p className="text-neutral-700">
                    {format(new Date(item.checked_out_at), 'MMM d, yyyy h:mm a')}
                  </p>
                  {item.checked_out_by_name && (
                    <p className="text-neutral-500">by {item.checked_out_by_name}</p>
                  )}
                </div>

                {item.status === 'returned' && item.returned_at ? (
                  <div>
                    <span className="text-neutral-500">Returned:</span>
                    <p className="text-neutral-700">
                      {format(new Date(item.returned_at), 'MMM d, yyyy h:mm a')}
                    </p>
                    {item.returned_by_name && (
                      <p className="text-neutral-500">by {item.returned_by_name}</p>
                    )}
                  </div>
                ) : item.due_date ? (
                  <div>
                    <span className="text-neutral-500">Due date:</span>
                    <p className={`${item.status === 'overdue' ? 'font-medium text-red-600' : 'text-neutral-700'
                      }`}>
                      {format(new Date(item.due_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Return condition */}
              {item.status === 'returned' && item.return_condition && (
                <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
                  {conditionIcons[item.return_condition]}
                  <span className="text-xs text-neutral-600">
                    Returned in {conditionLabels[item.return_condition].toLowerCase()} condition
                  </span>
                </div>
              )}

              {/* Return notes */}
              {item.return_notes && (
                <div className="mt-2 rounded bg-neutral-50 p-2 text-xs text-neutral-600">
                  {item.return_notes}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
