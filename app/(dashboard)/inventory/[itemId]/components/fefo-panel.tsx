'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles,
  Package,
  Calendar,
  Hash,
  MapPin,
  Loader2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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

interface FEFOPanelProps {
  itemId: string
  itemName: string
  trackingMode: 'none' | 'serialized' | 'lot_expiry'
  onPickLot?: (lotId: string, quantity: number) => void
}

export function FEFOPanel({
  itemId,
  itemName,
  trackingMode,
  onPickLot,
}: FEFOPanelProps) {
  const [quantityNeeded, setQuantityNeeded] = useState<string>('')
  const [suggestions, setSuggestions] = useState<FEFOSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Don't show if not lot-tracked
  if (trackingMode !== 'lot_expiry') {
    return null
  }

  async function handleGetSuggestions(e: React.FormEvent) {
    e.preventDefault()

    const qty = parseInt(quantityNeeded)
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('get_fefo_suggestion', {
          p_item_id: itemId,
          p_quantity_needed: qty,
          p_location_id: null, // Get from all locations
        })

      if (rpcError) {
        console.error('Error getting FEFO suggestion:', rpcError)
        setError('Failed to get picking suggestions')
        return
      }

      setSuggestions((data || []) as FEFOSuggestion[])
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const totalPickQuantity = suggestions.reduce((sum, s) => sum + s.pick_quantity, 0)
  const quantityNeededNum = parseInt(quantityNeeded) || 0
  const canFulfill = totalPickQuantity >= quantityNeededNum

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          FEFO Pick Suggestion
        </h2>
      </div>

      <p className="text-sm text-neutral-500 mb-4">
        Enter the quantity needed and get AI-powered suggestions for which lots to pick first
        (First Expired, First Out).
      </p>

      {/* Input Form */}
      <form onSubmit={handleGetSuggestions} className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="number"
            min="1"
            value={quantityNeeded}
            onChange={(e) => setQuantityNeeded(e.target.value)}
            placeholder="Quantity needed"
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading || !quantityNeeded}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Suggest
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {hasSearched && !loading && (
        <>
          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {/* Summary */}
              <div className={cn(
                'flex items-center justify-between rounded-lg px-4 py-3',
                canFulfill ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              )}>
                <span className="text-sm font-medium">
                  {canFulfill
                    ? `Can fulfill ${quantityNeededNum} from ${suggestions.length} lot${suggestions.length > 1 ? 's' : ''}`
                    : `Only ${totalPickQuantity} available (${quantityNeededNum} needed)`
                  }
                </span>
                <span className="font-bold">{totalPickQuantity} / {quantityNeededNum}</span>
              </div>

              {/* Suggestion Cards */}
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.lot_id}
                  className="group flex items-center gap-4 rounded-lg border border-neutral-100 p-3 hover:border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  {/* Order number */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Lot Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {suggestion.lot_number && (
                        <span className="flex items-center gap-1 text-sm font-medium text-neutral-900">
                          <Hash className="h-3 w-3" />
                          {suggestion.lot_number}
                        </span>
                      )}
                      {suggestion.batch_code && (
                        <span className="text-xs text-neutral-500">
                          Batch: {suggestion.batch_code}
                        </span>
                      )}
                      {!suggestion.lot_number && !suggestion.batch_code && (
                        <span className="text-sm text-neutral-400 italic">No lot number</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                      {suggestion.expiry_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Exp: {new Date(suggestion.expiry_date).toLocaleDateString()}
                        </span>
                      )}
                      {suggestion.location_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {suggestion.location_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pick Quantity */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-600">
                      Pick {suggestion.pick_quantity}
                    </p>
                    <p className="text-xs text-neutral-400">
                      of {suggestion.available_quantity} available
                    </p>
                  </div>

                  {/* Action */}
                  {onPickLot && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onPickLot(suggestion.lot_id, suggestion.pick_quantity)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Package className="h-10 w-10 text-neutral-300" />
              <p className="mt-2 text-sm text-neutral-500">No available lots to pick from</p>
              <p className="text-xs text-neutral-400 mt-1">
                All lots may be depleted, expired, or blocked
              </p>
            </div>
          )}
        </>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Sparkles className="h-6 w-6 text-amber-600" />
          </div>
          <p className="mt-3 text-sm text-neutral-500">
            Enter a quantity above to get FEFO picking suggestions
          </p>
        </div>
      )}
    </div>
  )
}
