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
  Calendar,
  CheckCircle,
  Sparkles,
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
}

interface StockInModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  itemId: string
  itemName: string
  trackingMode: 'lot_expiry' | 'serialized' | 'none'
}

const STOCK_IN_REASONS = [
  { value: 'received', label: 'Received / Purchased' },
  { value: 'returned', label: 'Returned to Stock' },
  { value: 'correction', label: 'Inventory Correction' },
  { value: 'found', label: 'Found / Recovered' },
  { value: 'other', label: 'Other' },
]

export function StockInModal({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
  trackingMode,
}: StockInModalProps) {
  const router = useRouter()
  const { formatShortDate } = useFormatting()

  // Data state
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [quantity, setQuantity] = useState(1)
  const [selectedMode, setSelectedMode] = useState<'new' | 'existing'>('new')
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)

  // New batch fields
  const [lotNumber, setLotNumber] = useState('')
  const [batchCode, setBatchCode] = useState('')
  const [expiryDate, setExpiryDate] = useState('')

  // New serial fields
  const [serialNumbers, setSerialNumbers] = useState('')

  const [reason, setReason] = useState('received')
  const [notes, setNotes] = useState('')

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isBatch = trackingMode === 'lot_expiry'

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

  useEffect(() => {
    if (isOpen) {
      if (isBatch) {
        loadBatches()
      } else {
        setLoading(false)
      }
      resetForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId, trackingMode])

  async function loadBatches() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error: rpcError } = await (supabase as any).rpc('get_item_lots', {
        p_item_id: itemId,
        p_include_depleted: false,
      })
      if (rpcError) throw rpcError
      setBatches((data || []) as Batch[])
    } catch (err) {
      console.error('Error loading batches:', err)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setQuantity(1)
    setSelectedMode('new')
    setSelectedBatchId(null)
    setLotNumber('')
    setBatchCode('')
    setExpiryDate('')
    setSerialNumbers('')
    setReason('received')
    setNotes('')
    setError(null)
  }

  function handleQuantityChange(delta: number) {
    setQuantity(Math.max(1, quantity + delta))
  }

  // Parse serial numbers from textarea
  const parsedSerials = serialNumbers
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const reasonText = notes ? `${reason}: ${notes}` : reason

    try {
      if (isBatch) {
        if (selectedMode === 'new') {
          // Create new batch
          const { data, error: rpcError } = await (supabase as any).rpc('create_lot', {
            p_item_id: itemId,
            p_quantity: quantity,
            p_lot_number: lotNumber || null,
            p_batch_code: batchCode || null,
            p_expiry_date: expiryDate || null,
            p_manufactured_date: null,
            p_location_id: null,
            p_notes: reasonText,
          })
          if (rpcError) throw rpcError
          if (!data?.success) throw new Error(data?.error || 'Failed to create batch')
        } else {
          // Add to existing batch
          const { data, error: rpcError } = await (supabase as any).rpc('adjust_lot_quantity', {
            p_lot_id: selectedBatchId,
            p_quantity_delta: quantity,
            p_reason: reasonText,
          })
          if (rpcError) throw rpcError
          if (!data?.success) throw new Error(data?.error || 'Failed to add to batch')
        }
      } else {
        // Add serials
        if (parsedSerials.length === 0) {
          throw new Error('Please enter at least one serial number')
        }

        const { data, error: rpcError } = await (supabase as any).rpc('stock_in_serials', {
          p_item_id: itemId,
          p_serials: parsedSerials,
          p_notes: notes || null,
        })
        if (rpcError) throw rpcError
        if (!data?.success) throw new Error(data?.error || 'Failed to add serials')
      }

      onSuccess?.()
      onClose()
      router.refresh()
    } catch (err: any) {
      console.error('Stock in error:', err)
      setError(err.message || 'Failed to stock in')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const canSubmit = isBatch
    ? quantity > 0 && (selectedMode === 'new' || selectedBatchId)
    : parsedSerials.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-in-title"
        aria-describedby="stock-in-description"
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 id="stock-in-title" className="text-lg font-semibold text-neutral-900">Stock In</h2>
            <p id="stock-in-description" className="text-sm text-neutral-500">{itemName}</p>
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
          ) : isBatch ? (
            <>
              {/* Quantity Selector */}
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
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="text-center text-2xl font-bold h-14"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Batch Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Add to which batch?
                </label>

                <div className="space-y-2">
                  {/* New Batch option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMode('new')
                      setSelectedBatchId(null)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                      selectedMode === 'new'
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <div className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2',
                      selectedMode === 'new' ? 'border-primary bg-primary' : 'border-neutral-300'
                    )}>
                      {selectedMode === 'new' && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                    <Sparkles className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <span className="font-medium">New Batch</span>
                      <p className="text-sm text-neutral-500">Create new lot/batch</p>
                    </div>
                  </button>

                  {/* Existing batches */}
                  {batches.map((batch) => (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() => {
                        setSelectedMode('existing')
                        setSelectedBatchId(batch.id)
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                        selectedMode === 'existing' && selectedBatchId === batch.id
                          ? 'border-primary bg-primary/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <div className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2',
                        selectedMode === 'existing' && selectedBatchId === batch.id
                          ? 'border-primary bg-primary'
                          : 'border-neutral-300'
                      )}>
                        {selectedMode === 'existing' && selectedBatchId === batch.id && (
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
                  ))}
                </div>
              </div>

              {/* New Batch Fields */}
              {selectedMode === 'new' && (
                <div className="space-y-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <div>
                    <label htmlFor="stock-in-lot" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Lot Number (optional)
                    </label>
                    <Input
                      id="stock-in-lot"
                      type="text"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      placeholder="e.g., LOT-2024-001"
                    />
                  </div>
                  <div>
                    <label htmlFor="stock-in-expiry" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Expiry Date (optional)
                    </label>
                    <Input
                      id="stock-in-expiry"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label htmlFor="stock-in-reason" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Reason
                </label>
                <select
                  id="stock-in-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {STOCK_IN_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* Serial Input */
            <>
              <div>
                <label htmlFor="stock-in-serials" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Serial Numbers (one per line)
                </label>
                <textarea
                  id="stock-in-serials"
                  value={serialNumbers}
                  onChange={(e) => setSerialNumbers(e.target.value)}
                  placeholder={"SN-001\nSN-002\nSN-003"}
                  rows={6}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {parsedSerials.length} serial number{parsedSerials.length !== 1 ? 's' : ''} entered
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="stock-in-notes" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              id="stock-in-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={2}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting || loading}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Stock In {isBatch ? quantity : parsedSerials.length}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
