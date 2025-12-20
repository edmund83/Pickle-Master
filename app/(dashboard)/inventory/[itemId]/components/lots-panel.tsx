'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Package,
  Plus,
  Minus,
  Calendar,
  AlertTriangle,
  Loader2,
  Hash,
  Clock,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Lot {
  id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  manufactured_date: string | null
  received_at: string
  quantity: number
  status: 'active' | 'expired' | 'depleted' | 'blocked'
  location_id: string | null
  location_name: string | null
  days_until_expiry: number | null
  expiry_status: 'no_expiry' | 'expired' | 'expiring_soon' | 'expiring_month' | 'ok'
}

interface LotsPanelProps {
  itemId: string
  itemName: string
  trackingMode: 'none' | 'serialized' | 'lot_expiry'
  onCreateLot?: () => void
  onAdjustLot?: (lotId: string, lotNumber: string, quantity: number) => void
}

const EXPIRY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
  expiring_soon: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Expiring Soon' },
  expiring_month: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Expiring This Month' },
  ok: { bg: 'bg-green-100', text: 'text-green-700', label: 'OK' },
  no_expiry: { bg: 'bg-neutral-100', text: 'text-neutral-500', label: 'No Expiry' },
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  expired: { bg: 'bg-red-100', text: 'text-red-700' },
  depleted: { bg: 'bg-neutral-100', text: 'text-neutral-500' },
  blocked: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
}

export function LotsPanel({
  itemId,
  itemName,
  trackingMode,
  onCreateLot,
  onAdjustLot,
}: LotsPanelProps) {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDepleted, setShowDepleted] = useState(false)

  useEffect(() => {
    if (trackingMode === 'lot_expiry') {
      loadLots()
    }
  }, [itemId, trackingMode, showDepleted])

  async function loadLots() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('get_item_lots', { p_item_id: itemId, p_include_depleted: showDepleted })

      if (rpcError) {
        console.error('Error loading lots:', rpcError)
        setError('Failed to load lot data')
        return
      }

      setLots((data || []) as Lot[])
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Don't show if not lot-tracked
  if (trackingMode !== 'lot_expiry') {
    return null
  }

  const totalQuantity = lots.filter(l => l.status === 'active').reduce((sum, lot) => sum + lot.quantity, 0)
  const expiringCount = lots.filter(l => l.expiry_status === 'expiring_soon' || l.expiry_status === 'expiring_month').length
  const expiredCount = lots.filter(l => l.expiry_status === 'expired' || l.status === 'expired').length

  if (loading) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-neutral-400" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Lot Tracking
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-neutral-400" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Lot Tracking
          </h2>
        </div>
        <div className="flex items-center justify-center gap-2 py-8 text-red-500">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-neutral-400" />
          <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Lot Tracking
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">
            Total: <span className="font-semibold text-neutral-900">{totalQuantity}</span>
          </span>
          {onCreateLot && (
            <Button size="sm" onClick={onCreateLot}>
              <Plus className="mr-1 h-4 w-4" />
              Add Lot
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="flex gap-4 mb-4">
          {expiredCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{expiredCount} expired</span>
            </div>
          )}
          {expiringCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-700">{expiringCount} expiring soon</span>
            </div>
          )}
        </div>
      )}

      {/* Lots List */}
      {lots.length > 0 ? (
        <div className="space-y-3">
          {lots.map((lot) => {
            const expiryStyle = EXPIRY_STYLES[lot.expiry_status] || EXPIRY_STYLES.no_expiry
            const statusStyle = STATUS_STYLES[lot.status] || STATUS_STYLES.active

            return (
              <div
                key={lot.id}
                className={cn(
                  'group flex items-center gap-4 rounded-lg border p-3 transition-colors',
                  lot.status === 'active' ? 'border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50' : 'border-neutral-100 bg-neutral-50 opacity-60'
                )}
              >
                {/* Lot Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {lot.lot_number && (
                      <span className="flex items-center gap-1 text-sm font-medium text-neutral-900">
                        <Hash className="h-3 w-3" />
                        {lot.lot_number}
                      </span>
                    )}
                    {lot.batch_code && (
                      <span className="text-xs text-neutral-500">
                        Batch: {lot.batch_code}
                      </span>
                    )}
                    {!lot.lot_number && !lot.batch_code && (
                      <span className="text-sm text-neutral-400 italic">No lot number</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    {lot.expiry_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Exp: {new Date(lot.expiry_date).toLocaleDateString()}
                        {lot.days_until_expiry !== null && lot.days_until_expiry > 0 && (
                          <span className="text-neutral-400">({lot.days_until_expiry}d)</span>
                        )}
                      </span>
                    )}
                    {lot.location_name && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {lot.location_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div className="text-right">
                  <p className={cn('text-lg font-semibold', lot.status === 'active' ? 'text-neutral-900' : 'text-neutral-400')}>
                    {lot.quantity}
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2">
                  {lot.expiry_status !== 'no_expiry' && lot.expiry_status !== 'ok' && (
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', expiryStyle.bg, expiryStyle.text)}>
                      {expiryStyle.label}
                    </span>
                  )}
                  {lot.status !== 'active' && (
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', statusStyle.bg, statusStyle.text)}>
                      {lot.status}
                    </span>
                  )}
                </div>

                {/* Actions */}
                {onAdjustLot && lot.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onAdjustLot(lot.id, lot.lot_number || 'Unknown', lot.quantity)}
                    title="Adjust quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <Package className="h-10 w-10 text-neutral-300" />
          <p className="mt-2 text-sm text-neutral-500">No lots recorded</p>
          {onCreateLot && (
            <Button variant="outline" size="sm" className="mt-3" onClick={onCreateLot}>
              <Plus className="mr-1 h-4 w-4" />
              Add First Lot
            </Button>
          )}
        </div>
      )}

      {/* Show depleted toggle */}
      {lots.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <label className="flex items-center gap-2 text-sm text-neutral-500 cursor-pointer">
            <input
              type="checkbox"
              checked={showDepleted}
              onChange={(e) => setShowDepleted(e.target.checked)}
              className="rounded border-neutral-300"
            />
            Show depleted lots
          </label>
        </div>
      )}
    </div>
  )
}
