'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Warehouse,
  Truck,
  Store,
  Briefcase,
  Package,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PendingTransfer {
  id: string
  item_id: string
  item_name: string
  item_sku: string | null
  item_image: string | null
  quantity: number
  from_location_id: string
  from_location_name: string
  from_location_type: string
  to_location_id: string
  to_location_name: string
  to_location_type: string
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  is_ai_suggested: boolean
  ai_suggestion_reason: string | null
  notes: string | null
  requested_at: string
  requested_by_name: string | null
}

interface TransferSuggestion {
  item_id: string
  item_name: string
  item_sku: string | null
  item_image: string | null
  to_location_id: string
  to_location_name: string
  to_location_type: string
  current_qty: number
  min_quantity: number
  from_location_id: string
  from_location_name: string
  from_location_type: string
  available_qty: number
  suggested_qty: number
  reason: string
}

const LOCATION_ICONS: Record<string, React.ElementType> = {
  warehouse: Warehouse,
  van: Truck,
  store: Store,
  job_site: Briefcase,
}

const LOCATION_COLORS: Record<string, string> = {
  warehouse: 'bg-blue-100 text-blue-600',
  van: 'bg-orange-100 text-orange-600',
  store: 'bg-green-100 text-green-600',
  job_site: 'bg-purple-100 text-purple-600',
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  in_transit: { bg: 'bg-blue-100', text: 'text-blue-700', icon: ArrowRight },
  completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  cancelled: { bg: 'bg-neutral-100', text: 'text-neutral-500', icon: XCircle },
}

export default function TransfersDashboardPage() {
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([])
  const [suggestions, setSuggestions] = useState<TransferSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Get pending transfers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: transfers } = await (supabase as any)
        .rpc('get_pending_transfers')

      // Get AI suggestions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: suggs } = await (supabase as any)
        .rpc('get_transfer_suggestions')

      setPendingTransfers((transfers || []) as PendingTransfer[])
      setSuggestions((suggs || []) as TransferSuggestion[])
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load transfer data')
    } finally {
      setLoading(false)
    }
  }

  async function executeTransfer(transferId: string) {
    setExecuting(transferId)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('execute_transfer', { p_transfer_id: transferId })

      if (rpcError) throw rpcError

      if (data?.success) {
        // Remove from pending list
        setPendingTransfers(prev => prev.filter(t => t.id !== transferId))
      } else {
        setError(data?.error || 'Failed to execute transfer')
      }
    } catch (err) {
      console.error('Error executing transfer:', err)
      setError('Failed to execute transfer')
    } finally {
      setExecuting(null)
    }
  }

  async function cancelTransfer(transferId: string) {
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('cancel_transfer', { p_transfer_id: transferId })

      if (rpcError) throw rpcError

      if (data?.success) {
        // Remove from pending list
        setPendingTransfers(prev => prev.filter(t => t.id !== transferId))
      } else {
        setError(data?.error || 'Failed to cancel transfer')
      }
    } catch (err) {
      console.error('Error cancelling transfer:', err)
      setError('Failed to cancel transfer')
    }
  }

  async function createSuggestedTransfer(suggestion: TransferSuggestion) {
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('request_transfer', {
          p_item_id: suggestion.item_id,
          p_quantity: suggestion.suggested_qty,
          p_from_location_id: suggestion.from_location_id,
          p_to_location_id: suggestion.to_location_id,
          p_is_ai_suggested: true,
          p_ai_reason: suggestion.reason,
        })

      if (rpcError) throw rpcError

      if (data?.success) {
        // Reload data to show the new pending transfer
        loadData()
      } else {
        setError(data?.error || 'Failed to create transfer')
      }
    } catch (err) {
      console.error('Error creating transfer:', err)
      setError('Failed to create transfer')
    }
  }

  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <div className="flex items-center gap-4">
          <Link href="/workflows/inventory-operations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-neutral-200" />
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Stock Transfers</h1>
            <p className="mt-1 text-neutral-500">
              Manage transfers between locations
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="rounded-xl border border-purple-200 bg-white">
                <div className="flex items-center gap-3 border-b border-purple-200 bg-purple-50 px-6 py-4">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-purple-700">
                    AI Transfer Suggestions
                  </h2>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {suggestions.length}
                  </span>
                </div>
                <div className="divide-y divide-neutral-100">
                  {suggestions.map((suggestion, index) => (
                    <SuggestionRow
                      key={`${suggestion.item_id}-${index}`}
                      suggestion={suggestion}
                      onAccept={() => createSuggestedTransfer(suggestion)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Transfers */}
            <div className="rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-neutral-400" />
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Pending Transfers
                  </h2>
                  {pendingTransfers.length > 0 && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      {pendingTransfers.length}
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={loadData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {pendingTransfers.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {pendingTransfers.map((transfer) => (
                    <TransferRow
                      key={transfer.id}
                      transfer={transfer}
                      onExecute={() => executeTransfer(transfer.id)}
                      onCancel={() => cancelTransfer(transfer.id)}
                      executing={executing === transfer.id}
                      formatTimeAgo={formatTimeAgo}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Package className="h-12 w-12 text-neutral-300" />
                  <p className="mt-3 text-neutral-500">No pending transfers</p>
                  <p className="text-sm text-neutral-400">
                    Create a transfer from an item&apos;s location panel
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TransferRow({
  transfer,
  onExecute,
  onCancel,
  executing,
  formatTimeAgo,
}: {
  transfer: PendingTransfer
  onExecute: () => void
  onCancel: () => void
  executing: boolean
  formatTimeAgo: (date: string) => string
}) {
  const FromIcon = LOCATION_ICONS[transfer.from_location_type] || Warehouse
  const ToIcon = LOCATION_ICONS[transfer.to_location_type] || Warehouse
  const statusStyle = STATUS_STYLES[transfer.status] || STATUS_STYLES.pending
  const StatusIcon = statusStyle.icon

  return (
    <div className="flex items-center gap-4 px-6 py-4">
      {/* Item Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
          {transfer.item_image ? (
            <img src={transfer.item_image} alt="" className="h-full w-full object-cover" />
          ) : (
            <Package className="h-5 w-5 text-neutral-400" />
          )}
        </div>
        <div className="min-w-0">
          <Link
            href={`/inventory/${transfer.item_id}`}
            className="font-medium text-neutral-900 hover:text-pickle-600 truncate block"
          >
            {transfer.item_name}
          </Link>
          <p className="text-sm text-neutral-500">
            {transfer.quantity} units
            {transfer.is_ai_suggested && (
              <span className="ml-2 inline-flex items-center gap-1 text-purple-600">
                <Sparkles className="h-3 w-3" /> AI
              </span>
            )}
          </p>
        </div>
      </div>

      {/* From Location */}
      <div className="flex items-center gap-2">
        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', LOCATION_COLORS[transfer.from_location_type])}>
          <FromIcon className="h-4 w-4" />
        </div>
        <span className="text-sm text-neutral-700">{transfer.from_location_name}</span>
      </div>

      {/* Arrow */}
      <ArrowRight className="h-5 w-5 text-neutral-300 flex-shrink-0" />

      {/* To Location */}
      <div className="flex items-center gap-2">
        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', LOCATION_COLORS[transfer.to_location_type])}>
          <ToIcon className="h-4 w-4" />
        </div>
        <span className="text-sm text-neutral-700">{transfer.to_location_name}</span>
      </div>

      {/* Status */}
      <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1', statusStyle.bg)}>
        <StatusIcon className={cn('h-3.5 w-3.5', statusStyle.text)} />
        <span className={cn('text-xs font-medium capitalize', statusStyle.text)}>
          {transfer.status.replace('_', ' ')}
        </span>
      </div>

      {/* Time */}
      <span className="text-xs text-neutral-400 w-16 text-right">
        {formatTimeAgo(transfer.requested_at)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onExecute}
          disabled={executing}
        >
          {executing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="mr-1.5 h-4 w-4" />
              Execute
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={executing}
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function SuggestionRow({
  suggestion,
  onAccept,
}: {
  suggestion: TransferSuggestion
  onAccept: () => void
}) {
  const FromIcon = LOCATION_ICONS[suggestion.from_location_type] || Warehouse
  const ToIcon = LOCATION_ICONS[suggestion.to_location_type] || Warehouse

  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50">
      {/* Item Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
          {suggestion.item_image ? (
            <img src={suggestion.item_image} alt="" className="h-full w-full object-cover" />
          ) : (
            <Package className="h-5 w-5 text-neutral-400" />
          )}
        </div>
        <div className="min-w-0">
          <Link
            href={`/inventory/${suggestion.item_id}`}
            className="font-medium text-neutral-900 hover:text-pickle-600 truncate block"
          >
            {suggestion.item_name}
          </Link>
          <p className="text-xs text-neutral-500 line-clamp-1">
            {suggestion.reason}
          </p>
        </div>
      </div>

      {/* From Location */}
      <div className="flex items-center gap-2">
        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', LOCATION_COLORS[suggestion.from_location_type])}>
          <FromIcon className="h-4 w-4" />
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-700">{suggestion.from_location_name}</p>
          <p className="text-xs text-green-600">{suggestion.available_qty} available</p>
        </div>
      </div>

      {/* Arrow with quantity */}
      <div className="flex flex-col items-center">
        <ArrowRight className="h-5 w-5 text-neutral-300" />
        <span className="text-xs font-medium text-purple-600">
          {suggestion.suggested_qty}
        </span>
      </div>

      {/* To Location */}
      <div className="flex items-center gap-2">
        <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', LOCATION_COLORS[suggestion.to_location_type])}>
          <ToIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm text-neutral-700">{suggestion.to_location_name}</p>
          <p className="text-xs text-red-600">
            {suggestion.current_qty} / min {suggestion.min_quantity}
          </p>
        </div>
      </div>

      {/* Action */}
      <Button size="sm" variant="outline" onClick={onAccept}>
        Accept
      </Button>
    </div>
  )
}
