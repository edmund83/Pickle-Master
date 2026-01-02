'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, ArrowRight, Warehouse, Truck, Store, Briefcase, Loader2, AlertTriangle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Location {
  id: string
  name: string
  type: 'warehouse' | 'van' | 'store' | 'job_site'
  item_count: number
  total_quantity: number
}

interface LocationStock {
  location_id: string
  location_name: string
  location_type: string
  quantity: number
  min_quantity: number
  status: string
}

interface StockTransferModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  itemId: string
  itemName: string
  fromLocationId?: string // Pre-selected source location
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

export function StockTransferModal({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
  fromLocationId,
}: StockTransferModalProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [itemLocations, setItemLocations] = useState<LocationStock[]>([])
  const [fromLocation, setFromLocation] = useState<string>(fromLocationId || '')
  const [toLocation, setToLocation] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
      if (fromLocationId) {
        setFromLocation(fromLocationId)
      }
    }
  }, [isOpen, fromLocationId])

  async function loadData() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Get all locations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: locData } = await (supabase as any)
        .rpc('get_locations', { p_include_inactive: false })

      // Get item's stock at each location
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: itemLocData } = await (supabase as any)
        .rpc('get_item_locations', { p_item_id: itemId })

      setLocations((locData || []) as Location[])
      setItemLocations((itemLocData || []) as LocationStock[])
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load location data')
    } finally {
      setLoading(false)
    }
  }

  const availableStock = itemLocations.find(l => l.location_id === fromLocation)?.quantity || 0
  const maxTransfer = availableStock

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fromLocation || !toLocation || !quantity) return

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    if (qty > availableStock) {
      setError(`Cannot transfer more than available (${availableStock})`)
      return
    }

    if (fromLocation === toLocation) {
      setError('Source and destination must be different')
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('request_transfer', {
          p_item_id: itemId,
          p_quantity: qty,
          p_from_location_id: fromLocation,
          p_to_location_id: toLocation,
          p_notes: notes || null,
        })

      if (rpcError) throw rpcError

      if (data?.success) {
        onSuccess?.()
        onClose()
        resetForm()
      } else {
        setError(data?.error || 'Failed to create transfer')
      }
    } catch (err) {
      console.error('Error creating transfer:', err)
      setError('Failed to create transfer request')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setFromLocation(fromLocationId || '')
    setToLocation('')
    setQuantity('')
    setNotes('')
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Transfer Stock</h2>
            <p className="text-sm text-neutral-500">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* From Location */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                From Location
              </label>
              <div className="grid grid-cols-2 gap-2">
                {itemLocations.filter(l => l.quantity > 0).map((loc) => {
                  const Icon = LOCATION_ICONS[loc.location_type] || Warehouse
                  const isSelected = fromLocation === loc.location_id

                  return (
                    <button
                      key={loc.location_id}
                      type="button"
                      onClick={() => setFromLocation(loc.location_id)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', LOCATION_COLORS[loc.location_type])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{loc.location_name}</p>
                        <p className="text-sm text-neutral-500">{loc.quantity} available</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              {itemLocations.filter(l => l.quantity > 0).length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No stock available to transfer
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <ArrowRight className="h-5 w-5 text-neutral-400" />
              </div>
            </div>

            {/* To Location */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                To Location
              </label>
              <div className="grid grid-cols-2 gap-2">
                {locations.filter(l => l.id !== fromLocation).map((loc) => {
                  const Icon = LOCATION_ICONS[loc.type] || Warehouse
                  const isSelected = toLocation === loc.id
                  const existingStock = itemLocations.find(il => il.location_id === loc.id)?.quantity || 0

                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setToLocation(loc.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', LOCATION_COLORS[loc.type])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{loc.name}</p>
                        <p className="text-sm text-neutral-500">
                          {existingStock > 0 ? `${existingStock} in stock` : 'No stock'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Quantity to Transfer
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min="1"
                  max={maxTransfer}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="text-lg font-medium"
                />
                <span className="text-sm text-neutral-500">
                  of {availableStock} available
                </span>
              </div>
              {/* Quick quantity buttons */}
              {availableStock > 0 && (
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map((pct) => {
                    const amt = Math.floor((availableStock * pct) / 100)
                    if (amt <= 0) return null
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setQuantity(amt.toString())}
                        className="px-2 py-1 text-xs rounded border border-neutral-200 hover:bg-neutral-50"
                      >
                        {pct === 100 ? 'All' : `${pct}%`} ({amt})
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes (optional)
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Restocking for weekend sale"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!fromLocation || !toLocation || !quantity || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Create Transfer
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
