'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  X,
  Minus,
  Plus,
  Loader2,
  AlertTriangle,
  Package,
  Hash,
  Calendar,
  CheckCircle,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'

interface Batch {
  id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  quantity: number
  expiry_status: string
}

interface Serial {
  id: string
  serial_number: string
  status: string
  created_at: string
}

interface StockOutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  itemId: string
  itemName: string
  trackingMode: 'lot_expiry' | 'serialized' | 'none'
  currentQuantity?: number
}

const STOCK_OUT_REASONS = [
  { value: 'consumption', label: 'Consumption / Used' },
  { value: 'damaged', label: 'Damaged / Defective' },
  { value: 'expired', label: 'Expired' },
  { value: 'correction', label: 'Inventory Correction' },
  { value: 'sold', label: 'Sold' },
  { value: 'other', label: 'Other' },
]

export function StockOutModal({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
  trackingMode,
  currentQuantity = 0,
}: StockOutModalProps) {
  const router = useRouter()
  const { formatShortDate } = useFormatting()

  // Data state
  const [batches, setBatches] = useState<Batch[]>([])
  const [serials, setSerials] = useState<Serial[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [quantity, setQuantity] = useState(1)
  const [selectedMode, setSelectedMode] = useState<'auto' | 'manual'>('auto')
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedSerialIds, setSelectedSerialIds] = useState<Set<string>>(new Set())
  const [reason, setReason] = useState('consumption')
  const [notes, setNotes] = useState('')

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, submitting, onClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Load batches or serials
  useEffect(() => {
    if (isOpen) {
      loadData()
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId, trackingMode])

  async function loadData() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      if (trackingMode === 'lot_expiry') {
        const { data, error: rpcError } = await (supabase as any).rpc('get_item_lots', {
          p_item_id: itemId,
          p_include_depleted: false,
        })
        if (rpcError) throw rpcError
        // Sort by FEFO: earliest expiry first, then oldest created
        const sorted = ((data || []) as Batch[]).sort((a, b) => {
          if (a.expiry_date && b.expiry_date) {
            return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
          }
          if (a.expiry_date) return -1
          if (b.expiry_date) return 1
          return 0
        })
        setBatches(sorted)
      } else if (trackingMode === 'serialized') {
        const { data, error: rpcError } = await (supabase as any).rpc('get_item_serials', {
          p_item_id: itemId,
          p_include_unavailable: false,
        })
        if (rpcError) throw rpcError
        // Sort by FIFO: oldest first
        const sorted = ((data || []) as Serial[]).sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })
        setSerials(sorted)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setQuantity(1)
    setSelectedMode('auto')
    setSelectedBatchId(null)
    setSelectedSerialIds(new Set())
    setReason('consumption')
    setNotes('')
    setError(null)
  }

  function handleQuantityChange(delta: number) {
    const maxQty = trackingMode === 'lot_expiry'
      ? (selectedMode === 'manual' && selectedBatchId
          ? batches.find(b => b.id === selectedBatchId)?.quantity || currentQuantity
          : currentQuantity)
      : serials.length
    setQuantity(Math.max(1, Math.min(maxQty, quantity + delta)))
  }

  function toggleSerial(serialId: string) {
    setSelectedSerialIds(prev => {
      const next = new Set(prev)
      if (next.has(serialId)) {
        next.delete(serialId)
      } else {
        next.add(serialId)
      }
      return next
    })
    setSelectedMode('manual')
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const reasonText = notes ? `${reason}: ${notes}` : reason

    try {
      if (trackingMode === 'lot_expiry') {
        if (selectedMode === 'auto') {
          // Auto FEFO: use RPC that handles multi-batch deduction
          const { data, error: rpcError } = await (supabase as any).rpc('stock_out_fifo', {
            p_item_id: itemId,
            p_quantity: quantity,
            p_reason: reasonText,
          })
          if (rpcError) throw rpcError
          if (!data?.success) throw new Error(data?.error || 'Stock out failed')
        } else {
          // Manual: deduct from specific batch
          const { data, error: rpcError } = await (supabase as any).rpc('adjust_lot_quantity', {
            p_lot_id: selectedBatchId,
            p_quantity_delta: -quantity,
            p_reason: reasonText,
          })
          if (rpcError) throw rpcError
          if (!data?.success) throw new Error(data?.error || 'Stock out failed')
        }
      } else {
        // Serialized: update serial status
        const serialIdsToUpdate = selectedMode === 'auto'
          ? serials.slice(0, quantity).map(s => s.id)
          : Array.from(selectedSerialIds)

        const { data, error: rpcError } = await (supabase as any).rpc('stock_out_serials', {
          p_item_id: itemId,
          p_serial_ids: serialIdsToUpdate,
          p_reason: reasonText,
          p_new_status: reason === 'sold' ? 'sold' : reason === 'damaged' ? 'damaged' : 'sold',
        })
        if (rpcError) throw rpcError
        if (!data?.success) throw new Error(data?.error || 'Stock out failed')
      }

      onSuccess?.()
      onClose()
      router.refresh()
    } catch (err: any) {
      console.error('Stock out error:', err)
      setError(err.message || 'Failed to stock out')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isBatch = trackingMode === 'lot_expiry'
  const maxQuantity = isBatch
    ? (selectedMode === 'manual' && selectedBatchId
        ? batches.find(b => b.id === selectedBatchId)?.quantity || 0
        : currentQuantity)
    : (selectedMode === 'manual' ? selectedSerialIds.size : serials.length)

  const canSubmit = isBatch
    ? quantity > 0 && quantity <= maxQuantity
    : (selectedMode === 'auto' ? quantity > 0 && quantity <= serials.length : selectedSerialIds.size > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-out-title"
        aria-describedby="stock-out-description"
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 id="stock-out-title" className="text-lg font-semibold text-neutral-900">Stock Out</h2>
            <p id="stock-out-description" className="text-sm text-neutral-500">{itemName}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
          ) : (
            <>
              {/* Quantity Selector (for batch) or Serial Count (for serial auto) */}
              {isBatch || selectedMode === 'auto' ? (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    How many?
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <div className="w-24 text-center">
                      <Input
                        type="number"
                        min={1}
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
                        className="text-center text-2xl font-bold h-14"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxQuantity}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-neutral-500">
                  {selectedSerialIds.size} serial{selectedSerialIds.size !== 1 ? 's' : ''} selected
                </div>
              )}

              {/* Source Picker */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {isBatch ? 'From which batch?' : 'Select serials'}
                </label>

                <div className="space-y-2">
                  {/* Auto FIFO option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMode('auto')
                      setSelectedBatchId(null)
                      setSelectedSerialIds(new Set())
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                      selectedMode === 'auto'
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <div className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2',
                      selectedMode === 'auto' ? 'border-primary bg-primary' : 'border-neutral-300'
                    )}>
                      {selectedMode === 'auto' && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">Auto (FIFO)</span>
                      </div>
                      <p className="text-sm text-neutral-500">System picks oldest first</p>
                    </div>
                  </button>

                  {/* Manual options */}
                  {isBatch ? (
                    batches.map((batch) => (
                      <button
                        key={batch.id}
                        type="button"
                        onClick={() => {
                          setSelectedMode('manual')
                          setSelectedBatchId(batch.id)
                          setQuantity(Math.min(quantity, batch.quantity))
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                          selectedMode === 'manual' && selectedBatchId === batch.id
                            ? 'border-primary bg-primary/5'
                            : 'border-neutral-200 hover:border-neutral-300'
                        )}
                      >
                        <div className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full border-2',
                          selectedMode === 'manual' && selectedBatchId === batch.id
                            ? 'border-primary bg-primary'
                            : 'border-neutral-300'
                        )}>
                          {selectedMode === 'manual' && selectedBatchId === batch.id && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <Package className="h-5 w-5 text-neutral-400" />
                        <div className="flex-1">
                          <span className="font-medium">
                            {batch.lot_number || batch.batch_code || 'Unnamed batch'}
                          </span>
                          <div className="flex items-center gap-3 text-sm text-neutral-500">
                            {batch.expiry_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Exp: {formatShortDate(batch.expiry_date)}
                              </span>
                            )}
                            <span>Qty: {batch.quantity}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-neutral-200 p-2">
                      {serials.map((serial) => (
                        <button
                          key={serial.id}
                          type="button"
                          onClick={() => toggleSerial(serial.id)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all',
                            selectedSerialIds.has(serial.id)
                              ? 'bg-primary/10'
                              : 'hover:bg-neutral-50'
                          )}
                        >
                          <div className={cn(
                            'flex h-5 w-5 items-center justify-center rounded border',
                            selectedSerialIds.has(serial.id)
                              ? 'border-primary bg-primary'
                              : 'border-neutral-300 bg-white'
                          )}>
                            {selectedSerialIds.has(serial.id) && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <Hash className="h-4 w-4 text-neutral-400" />
                          <span className="font-mono">{serial.serial_number}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="stock-out-reason" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Reason
                </label>
                <select
                  id="stock-out-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {STOCK_OUT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="stock-out-notes" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
                  id="stock-out-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting || loading}
            variant="destructive"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Stock Out {isBatch ? quantity : (selectedMode === 'auto' ? quantity : selectedSerialIds.size)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
