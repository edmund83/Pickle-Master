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
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'

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

interface FEFOSuggestion {
  lot_id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  available_quantity: number
  location_id: string | null
  location_name: string | null
  pick_quantity: number
}

interface LotsPanelProps {
  itemId: string
  itemName: string
  trackingMode: 'none' | 'serialized' | 'lot_expiry'
  onCreateLot?: () => void
  onAdjustLot?: (lotId: string, lotNumber: string, quantity: number) => void
  onPickLot?: (lotId: string, quantity: number) => void
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
  onPickLot,
}: LotsPanelProps) {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDepleted, setShowDepleted] = useState(false)
  const { formatShortDate } = useFormatting()

  // FEFO state
  const [showFEFO, setShowFEFO] = useState(false)
  const [fefoQuantity, setFefoQuantity] = useState<string>('')
  const [fefoSuggestions, setFefoSuggestions] = useState<FEFOSuggestion[]>([])
  const [fefoLoading, setFefoLoading] = useState(false)
  const [fefoError, setFefoError] = useState<string | null>(null)
  const [hasSearchedFEFO, setHasSearchedFEFO] = useState(false)

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

  // FEFO suggestion handler
  async function handleGetFEFOSuggestions(e: React.FormEvent) {
    e.preventDefault()

    const qty = parseInt(fefoQuantity)
    if (isNaN(qty) || qty <= 0) {
      setFefoError('Please enter a valid quantity')
      return
    }

    setFefoLoading(true)
    setFefoError(null)
    setHasSearchedFEFO(true)

    const supabase = createClient()

    try {
      const { data, error: rpcError } = await (supabase as any)
        .rpc('get_fefo_suggestion', {
          p_item_id: itemId,
          p_quantity_needed: qty,
          p_location_id: null,
        })

      if (rpcError) {
        console.error('Error getting FEFO suggestion:', rpcError)
        setFefoError('Failed to get picking suggestions')
        return
      }

      setFefoSuggestions((data || []) as FEFOSuggestion[])
    } catch (err) {
      console.error('Error:', err)
      setFefoError('An unexpected error occurred')
    } finally {
      setFefoLoading(false)
    }
  }

  // Don't show if not lot-tracked
  if (trackingMode !== 'lot_expiry') {
    return null
  }

  const totalQuantity = lots.filter(l => l.status === 'active').reduce((sum, lot) => sum + lot.quantity, 0)
  const expiringCount = lots.filter(l => l.expiry_status === 'expiring_soon' || l.expiry_status === 'expiring_month').length
  const expiredCount = lots.filter(l => l.expiry_status === 'expired' || l.status === 'expired').length

  // FEFO computed values
  const fefoTotalPick = fefoSuggestions.reduce((sum, s) => sum + s.pick_quantity, 0)
  const fefoQuantityNeeded = parseInt(fefoQuantity) || 0
  const fefoCanFulfill = fefoTotalPick >= fefoQuantityNeeded

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
          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
            Lot / Expiry
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">
            Total: <span className="font-semibold text-neutral-900">{totalQuantity}</span>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFEFO(!showFEFO)}
            className={cn(
              'text-amber-600 border-amber-200 hover:bg-amber-50',
              showFEFO && 'bg-amber-50'
            )}
          >
            <Package className="mr-1 h-4 w-4" />
            Pick Helper
          </Button>
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
                        Exp: {formatShortDate(lot.expiry_date)}
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

      {/* FEFO Pick Helper - Collapsible */}
      {showFEFO && (
        <div className="mt-4 pt-4 border-t border-amber-200 bg-amber-50/50 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">FEFO Pick Helper</span>
          </div>
          <p className="text-xs text-amber-600 mb-3">
            Enter quantity needed and we&apos;ll calculate which lots to pick first (earliest expiry first).
          </p>

          {/* FEFO Input */}
          <form onSubmit={handleGetFEFOSuggestions} className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="number"
                min="1"
                value={fefoQuantity}
                onChange={(e) => setFefoQuantity(e.target.value)}
                placeholder="Quantity needed"
                className="pl-10 bg-white"
              />
            </div>
            <Button
              type="submit"
              disabled={fefoLoading || !fefoQuantity}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {fefoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Calculate'
              )}
            </Button>
          </form>

          {fefoError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 mb-3">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              {fefoError}
            </div>
          )}

          {/* FEFO Results */}
          {hasSearchedFEFO && !fefoLoading && (
            <>
              {fefoSuggestions.length > 0 ? (
                <div className="space-y-2">
                  {/* Summary */}
                  <div className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                    fefoCanFulfill ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  )}>
                    <span className="font-medium">
                      {fefoCanFulfill
                        ? `Can fulfill from ${fefoSuggestions.length} lot${fefoSuggestions.length > 1 ? 's' : ''}`
                        : `Only ${fefoTotalPick} available`
                      }
                    </span>
                    <span className="font-bold">{fefoTotalPick} / {fefoQuantityNeeded}</span>
                  </div>

                  {/* Suggestion Cards */}
                  {fefoSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.lot_id}
                      className="group flex items-center gap-3 rounded-lg border border-amber-200 bg-white p-2"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          {suggestion.lot_number && (
                            <span className="flex items-center gap-1 font-medium text-neutral-900">
                              <Hash className="h-3 w-3" />
                              {suggestion.lot_number}
                            </span>
                          )}
                          {suggestion.expiry_date && (
                            <span className="flex items-center gap-1 text-xs text-neutral-500">
                              <Calendar className="h-3 w-3" />
                              {formatShortDate(suggestion.expiry_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-amber-600">
                          Pick {suggestion.pick_quantity}
                        </span>
                        <span className="text-xs text-neutral-400 ml-1">
                          / {suggestion.available_quantity}
                        </span>
                      </div>
                      {onPickLot && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 opacity-0 group-hover:opacity-100"
                          onClick={() => onPickLot(suggestion.lot_id, suggestion.pick_quantity)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Package className="h-8 w-8 text-amber-300" />
                  <p className="mt-2 text-sm text-amber-600">No available lots to pick from</p>
                </div>
              )}
            </>
          )}

          {!hasSearchedFEFO && (
            <div className="flex items-center justify-center py-3 text-xs text-amber-500">
              Enter quantity to calculate which lots to pick
            </div>
          )}
        </div>
      )}
    </div>
  )
}
