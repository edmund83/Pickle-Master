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
import type { ItemCondition } from '@/types/database.types'
import { useFormatting } from '@/hooks/useFormatting'

interface CheckoutSerial {
  serial_number: string
  return_condition: ItemCondition | null
}

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
  serials?: CheckoutSerial[]
}

interface CheckoutHistoryProps {
  itemId: string
  limit?: number
  refreshTrigger?: number
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

export function CheckoutHistory({ itemId, limit = 10, refreshTrigger = 0 }: CheckoutHistoryProps) {
  const [history, setHistory] = useState<CheckoutHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const { formatDateTime, formatDate } = useFormatting()

  useEffect(() => {
    loadHistory()
  }, [itemId, refreshTrigger])

  async function loadHistory() {
    setLoading(true)
    const supabase = createClient()

    try {
      // Query checkouts directly with RLS instead of RPC
      const { data: checkoutsData, error } = await supabase
        .from('checkouts')
        .select(`
          id,
          quantity,
          assignee_type,
          assignee_name,
          checked_out_at,
          due_date,
          status,
          returned_at,
          return_condition,
          return_notes,
          checked_out_by,
          returned_by
        `)
        .eq('item_id', itemId)
        .order('checked_out_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error loading checkout history:', error)
        setHistory([])
        return
      }

      if (checkoutsData) {
        // Map the data to match the expected interface
        const historyItems: CheckoutHistoryItem[] = checkoutsData.map(checkout => ({
          id: checkout.id,
          quantity: checkout.quantity,
          assignee_type: checkout.assignee_type,
          assignee_name: checkout.assignee_name,
          checked_out_at: checkout.checked_out_at,
          due_date: checkout.due_date,
          status: checkout.status,
          returned_at: checkout.returned_at,
          return_condition: checkout.return_condition,
          return_notes: checkout.return_notes,
          checked_out_by_name: null, // Would need a join to get this
          returned_by_name: null, // Would need a join to get this
          serials: [] // Would need a separate query for serials
        }))
        setHistory(historyItems)
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
                    {formatDateTime(item.checked_out_at)}
                  </p>
                  {item.checked_out_by_name && (
                    <p className="text-neutral-500">by {item.checked_out_by_name}</p>
                  )}
                </div>

                {item.status === 'returned' && item.returned_at ? (
                  <div>
                    <span className="text-neutral-500">Returned:</span>
                    <p className="text-neutral-700">
                      {formatDateTime(item.returned_at)}
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
                      {formatDate(item.due_date)}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Serials (if any) */}
              {item.serials && item.serials.length > 0 && (
                <div className="mt-3 border-t border-neutral-100 pt-3">
                  <span className="text-xs font-medium text-neutral-500">Serial Numbers:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.serials.map((serial, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-xs ${
                          item.status === 'returned' && serial.return_condition
                            ? serial.return_condition === 'good'
                              ? 'bg-green-50 text-green-700'
                              : serial.return_condition === 'lost'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-yellow-50 text-yellow-700'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {serial.serial_number}
                        {item.status === 'returned' && serial.return_condition && serial.return_condition !== 'good' && (
                          <span className="ml-1">
                            {conditionIcons[serial.return_condition]}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Return condition (for non-serialized items) */}
              {item.status === 'returned' && item.return_condition && (!item.serials || item.serials.length === 0) && (
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
