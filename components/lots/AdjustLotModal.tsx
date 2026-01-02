'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Minus, Plus, Loader2, AlertTriangle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AdjustLotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  lotId: string
  lotNumber: string
  currentQuantity: number
  itemName: string
}

const ADJUSTMENT_REASONS = [
  { value: 'consumption', label: 'Consumption / Used' },
  { value: 'waste', label: 'Waste / Damaged' },
  { value: 'expired', label: 'Expired' },
  { value: 'correction', label: 'Inventory Correction' },
  { value: 'return', label: 'Returned to Stock' },
  { value: 'other', label: 'Other' },
]

export function AdjustLotModal({
  isOpen,
  onClose,
  onSuccess,
  lotId,
  lotNumber,
  currentQuantity,
  itemName,
}: AdjustLotModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<'decrease' | 'increase'>('decrease')
  const [quantity, setQuantity] = useState<string>('')
  const [reason, setReason] = useState<string>('consumption')
  const [notes, setNotes] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    if (adjustmentType === 'decrease' && qty > currentQuantity) {
      setError(`Cannot remove more than available (${currentQuantity})`)
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    // Calculate delta (negative for decrease, positive for increase)
    const delta = adjustmentType === 'decrease' ? -qty : qty
    const reasonText = notes ? `${reason}: ${notes}` : reason

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = await (supabase as any)
        .rpc('adjust_lot_quantity', {
          p_lot_id: lotId,
          p_quantity_delta: delta,
          p_reason: reasonText,
        })

      if (rpcError) throw rpcError

      if (data?.success) {
        onSuccess?.()
        onClose()
        resetForm()
      } else {
        setError(data?.error || 'Failed to adjust lot quantity')
      }
    } catch (err) {
      console.error('Error adjusting lot:', err)
      setError('Failed to adjust lot quantity')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setAdjustmentType('decrease')
    setQuantity('')
    setReason('consumption')
    setNotes('')
    setError(null)
  }

  if (!isOpen) return null

  const newQuantity = adjustmentType === 'decrease'
    ? currentQuantity - (parseInt(quantity) || 0)
    : currentQuantity + (parseInt(quantity) || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Adjust Lot Quantity</h2>
            <p className="text-sm text-neutral-500">
              {lotNumber || 'Unnamed lot'} • {itemName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Current Quantity Display */}
          <div className="flex items-center justify-center gap-4 rounded-lg bg-neutral-50 p-4">
            <div className="text-center">
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Current</p>
              <p className="text-2xl font-bold text-neutral-900">{currentQuantity}</p>
            </div>
            <div className="text-neutral-300">→</div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 uppercase tracking-wide">New</p>
              <p className={`text-2xl font-bold ${newQuantity < 0 ? 'text-red-500' : newQuantity === 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {Math.max(0, newQuantity)}
              </p>
            </div>
          </div>

          {/* Adjustment Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('decrease')}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  adjustmentType === 'decrease'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Minus className="h-4 w-4" />
                Decrease
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('increase')}
                className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                  adjustmentType === 'increase'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <Plus className="h-4 w-4" />
                Increase
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="number"
                min="1"
                max={adjustmentType === 'decrease' ? currentQuantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="pl-10 text-lg"
                required
              />
            </div>
            {/* Quick quantity buttons for decrease */}
            {adjustmentType === 'decrease' && currentQuantity > 0 && (
              <div className="flex gap-2 mt-2">
                {[25, 50, 75, 100].map((pct) => {
                  const amt = Math.floor((currentQuantity * pct) / 100)
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

          {/* Reason Selector */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {ADJUSTMENT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details about this adjustment..."
              rows={2}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Warning for depleted lot */}
          {adjustmentType === 'decrease' && newQuantity === 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              This will deplete the lot completely
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!quantity || submitting}
            variant={adjustmentType === 'decrease' ? 'destructive' : 'default'}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adjusting...
              </>
            ) : (
              <>
                {adjustmentType === 'decrease' ? (
                  <Minus className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {adjustmentType === 'decrease' ? 'Decrease' : 'Increase'} Quantity
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
