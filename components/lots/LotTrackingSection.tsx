'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Package,
  Plus,
  Calendar,
  Hash,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
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
  quantity: number
  status: 'active' | 'expired' | 'depleted' | 'blocked'
  location_name: string | null
  days_until_expiry: number | null
  expiry_status: 'no_expiry' | 'expired' | 'expiring_soon' | 'expiring_month' | 'ok'
}

interface LotTrackingSectionProps {
  itemId: string
  onTotalChange?: (total: number) => void
}

const EXPIRY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  expired: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  expiring_soon: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  expiring_month: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  ok: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  no_expiry: { bg: 'bg-neutral-50', text: 'text-neutral-500', dot: 'bg-neutral-400' },
}

export function LotTrackingSection({ itemId, onTotalChange }: LotTrackingSectionProps) {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { formatShortDate } = useFormatting()

  // Add lot form state
  const [newLot, setNewLot] = useState({
    quantity: '',
    lot_number: '',
    batch_code: '',
    expiry_date: '',
  })

  useEffect(() => {
    loadLots()
  }, [itemId])

  async function loadLots() {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('get_item_lots', { p_item_id: itemId, p_include_depleted: false })

      if (rpcError) {
        console.error('Error loading lots:', rpcError)
        setError('Failed to load lots')
        return
      }

      const lotsData = (data || []) as Lot[]
      setLots(lotsData)

      // Calculate and report total
      const total = lotsData
        .filter(l => l.status === 'active')
        .reduce((sum, lot) => sum + lot.quantity, 0)
      onTotalChange?.(total)
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddLot(e: React.FormEvent) {
    e.preventDefault()

    const qty = parseInt(newLot.quantity)
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('create_lot', {
          p_item_id: itemId,
          p_quantity: qty,
          p_lot_number: newLot.lot_number || null,
          p_batch_code: newLot.batch_code || null,
          p_expiry_date: newLot.expiry_date || null,
        })

      if (rpcError) throw rpcError

      if (data?.success) {
        // Reset form and reload lots
        setNewLot({ quantity: '', lot_number: '', batch_code: '', expiry_date: '' })
        setShowAddForm(false)
        await loadLots()
      } else {
        setError(data?.error || 'Failed to add lot')
      }
    } catch (err) {
      console.error('Error adding lot:', err)
      setError('Failed to add lot')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteLot(lotId: string) {
    if (!confirm('Are you sure you want to delete this lot?')) return

    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any)
        .from('lots')
        .delete()
        .eq('id', lotId)

      if (deleteError) throw deleteError

      await loadLots()
    } catch (err) {
      console.error('Error deleting lot:', err)
      setError('Failed to delete lot')
    }
  }

  const totalQuantity = lots
    .filter(l => l.status === 'active')
    .reduce((sum, lot) => sum + lot.quantity, 0)

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700">
            Lots ({lots.length})
          </span>
        </div>
        <span className="text-sm text-neutral-500">
          Total: <span className="font-semibold text-neutral-900">{totalQuantity}</span>
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Lots List */}
      {lots.length > 0 ? (
        <div className="divide-y divide-neutral-100">
          {lots.map((lot) => {
            const style = EXPIRY_STYLES[lot.expiry_status] || EXPIRY_STYLES.no_expiry

            return (
              <div
                key={lot.id}
                className={cn(
                  'group flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-neutral-50 transition-colors',
                  lot.status !== 'active' && 'opacity-50'
                )}
              >
                {/* Expiry indicator dot */}
                <div className={cn('h-2 w-2 rounded-full flex-shrink-0', style.dot)} />

                {/* Lot info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-neutral-900">
                      {lot.lot_number || lot.batch_code || 'Unnamed lot'}
                    </span>
                    {lot.batch_code && lot.lot_number && (
                      <span className="text-neutral-400 text-xs">({lot.batch_code})</span>
                    )}
                  </div>
                  {lot.expiry_date && (
                    <div className={cn('text-xs', style.text)}>
                      Exp: {formatShortDate(lot.expiry_date)}
                      {lot.days_until_expiry !== null && lot.days_until_expiry > 0 && (
                        <span className="text-neutral-400 ml-1">({lot.days_until_expiry}d)</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div className="text-sm font-semibold text-neutral-900 w-12 text-right">
                  {lot.quantity}
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteLot(lot.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete lot"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-neutral-500">
          No lots yet. Add your first lot below.
        </div>
      )}

      {/* Add Lot Section */}
      <div className="border-t border-neutral-200">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Lot
          </button>
        ) : (
          <form onSubmit={handleAddLot} className="p-4 bg-white space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Quantity */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  value={newLot.quantity}
                  onChange={(e) => setNewLot({ ...newLot, quantity: e.target.value })}
                  placeholder="0"
                  className="h-9"
                  required
                />
              </div>

              {/* Lot Number */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Lot Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <Input
                    type="text"
                    value={newLot.lot_number}
                    onChange={(e) => setNewLot({ ...newLot, lot_number: e.target.value })}
                    placeholder="LOT-001"
                    className="h-9 pl-8"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Expiry Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <Input
                    type="date"
                    value={newLot.expiry_date}
                    onChange={(e) => setNewLot({ ...newLot, expiry_date: e.target.value })}
                    className="h-9 pl-8"
                  />
                </div>
              </div>

              {/* Batch Code */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Batch Code
                </label>
                <Input
                  type="text"
                  value={newLot.batch_code}
                  onChange={(e) => setNewLot({ ...newLot, batch_code: e.target.value })}
                  placeholder="BATCH-A"
                  className="h-9"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false)
                  setNewLot({ quantity: '', lot_number: '', batch_code: '', expiry_date: '' })
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting || !newLot.quantity}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Lot
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
