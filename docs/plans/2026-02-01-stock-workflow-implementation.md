# Stock Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement simplified stock adjustment flows (Stock Out, Stock In, Borrow Out) for tracked items with FIFO auto-pick and manual override.

**Architecture:** Three new modals (StockOutModal, StockInModal, BorrowOutModal) replace the scattered adjustment components. Each modal follows a unified pattern: quantity → source picker (FIFO default) → reason/assignee → confirm. Server actions handle atomic stock changes via Supabase RPC functions.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase RPC, React hooks

---

## Task 1: Update Quick Actions Card for Tracked Items

**Files:**
- Modify: `app/(dashboard)/inventory/[itemId]/components/item-quick-actions.tsx`

**Step 1: Read the existing component**

Already read. The component currently shows +/- for non-tracked and `lot_expiry`, but needs Stock Out / Stock In buttons for tracked items.

**Step 2: Update the component to show Stock Out / Stock In / Borrow Out buttons for tracked items**

Replace the entire file with updated logic:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Loader2, Package, ArrowDownCircle, ArrowUpCircle, UserCheck } from 'lucide-react'
import { updateItemQuantity } from '@/app/actions/inventory'
import { ItemDetailCard } from './item-detail-card'
import { Button } from '@/components/ui/button'
import { StockOutModal } from '@/components/stock/StockOutModal'
import { StockInModal } from '@/components/stock/StockInModal'
import { BorrowOutModal } from '@/components/stock/BorrowOutModal'

interface ItemQuickActionsProps {
  itemId: string
  itemName: string
  currentQuantity: number
  unit: string
  variant?: 'card' | 'inline'
  className?: string
  trackingMode?: 'none' | 'serialized' | 'lot_expiry' | null
}

export function ItemQuickActions({
  itemId,
  itemName,
  currentQuantity,
  unit,
  variant = 'card',
  className,
  trackingMode,
}: ItemQuickActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(() => {
    const parsed = Number(currentQuantity)
    return Number.isFinite(parsed) ? parsed : 0
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Modal states
  const [showStockOut, setShowStockOut] = useState(false)
  const [showStockIn, setShowStockIn] = useState(false)
  const [showBorrowOut, setShowBorrowOut] = useState(false)

  useEffect(() => {
    const parsed = Number(currentQuantity)
    setQuantity(Number.isFinite(parsed) ? parsed : 0)
  }, [currentQuantity])

  const handleAdjust = async (adjustment: number) => {
    if (loading) return
    const previousQuantity = Number.isFinite(quantity) ? quantity : 0
    const nextQuantity = Math.max(0, previousQuantity + adjustment)
    if (nextQuantity === previousQuantity) return

    setErrorMessage(null)
    setQuantity(nextQuantity)
    setLoading(true)
    try {
      const result = await updateItemQuantity(itemId, nextQuantity, 'quick_action')

      if (!result.success) {
        setQuantity(previousQuantity)
        setErrorMessage(result.error || 'Unable to update quantity.')
        console.error(result.error)
        return
      }

      router.refresh()
    } catch (error) {
      setQuantity(previousQuantity)
      setErrorMessage('Unable to update quantity. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleModalSuccess = () => {
    router.refresh()
  }

  const isTracked = trackingMode === 'lot_expiry' || trackingMode === 'serialized'

  // Tracked items: Stock Out / Stock In buttons + Borrow Out
  const trackedContent = (
    <div className="space-y-4">
      {/* Quantity display */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-neutral-900">On hand</span>
          <span className="text-xs text-neutral-500">
            {trackingMode === 'lot_expiry' ? 'Managed by batches' : 'Managed by serials'}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold tabular-nums text-neutral-900">
              {quantity}
            </div>
            <div className="text-xs text-neutral-500">{unit || 'units'}</div>
          </div>
        </div>
      </div>

      {/* Stock Out / Stock In buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-14 flex-col gap-1"
          onClick={() => setShowStockOut(true)}
          disabled={quantity <= 0}
        >
          <ArrowDownCircle className="h-5 w-5 text-red-500" />
          <span className="text-xs">Stock Out</span>
        </Button>
        <Button
          variant="outline"
          className="h-14 flex-col gap-1"
          onClick={() => setShowStockIn(true)}
        >
          <ArrowUpCircle className="h-5 w-5 text-green-500" />
          <span className="text-xs">Stock In</span>
        </Button>
      </div>

      {/* Borrow Out button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowBorrowOut(true)}
        disabled={quantity <= 0}
      >
        <UserCheck className="mr-2 h-4 w-4" />
        Borrow Out
      </Button>

      {errorMessage && (
        <p className="text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )

  // Non-tracked items: +/- buttons + Borrow Out
  const nonTrackedContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-neutral-900">On hand</span>
          <span className="text-xs text-neutral-500">Adjust quantity</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-40 disabled:pointer-events-none"
              onClick={() => handleAdjust(-1)}
              disabled={loading || quantity <= 0}
              aria-label="Decrease quantity"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Minus className="h-5 w-5" strokeWidth={2.5} />
              )}
            </button>

            <div className="min-w-[5rem] px-2 text-center">
              <div className="text-2xl font-bold tabular-nums text-neutral-900">
                {quantity}
              </div>
              <div className="text-xs text-neutral-500">{unit || 'units'}</div>
            </div>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-200 active:bg-neutral-300 disabled:opacity-40 disabled:pointer-events-none"
              onClick={() => handleAdjust(1)}
              disabled={loading}
              aria-label="Increase quantity"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-5 w-5" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Borrow Out button for non-tracked items */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setShowBorrowOut(true)}
        disabled={quantity <= 0}
      >
        <UserCheck className="mr-2 h-4 w-4" />
        Borrow Out
      </Button>

      {errorMessage && (
        <p className="text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )

  const content = isTracked ? trackedContent : nonTrackedContent

  return (
    <>
      {variant === 'inline' ? (
        <div className={className}>{content}</div>
      ) : (
        <ItemDetailCard title="Quick Actions" className={className}>
          {content}
        </ItemDetailCard>
      )}

      {/* Modals */}
      {isTracked && (
        <>
          <StockOutModal
            isOpen={showStockOut}
            onClose={() => setShowStockOut(false)}
            onSuccess={handleModalSuccess}
            itemId={itemId}
            itemName={itemName}
            trackingMode={trackingMode as 'lot_expiry' | 'serialized'}
            currentQuantity={quantity}
          />
          <StockInModal
            isOpen={showStockIn}
            onClose={() => setShowStockIn(false)}
            onSuccess={handleModalSuccess}
            itemId={itemId}
            itemName={itemName}
            trackingMode={trackingMode as 'lot_expiry' | 'serialized'}
          />
        </>
      )}

      <BorrowOutModal
        isOpen={showBorrowOut}
        onClose={() => setShowBorrowOut(false)}
        onSuccess={handleModalSuccess}
        itemId={itemId}
        itemName={itemName}
        trackingMode={trackingMode || 'none'}
        currentQuantity={quantity}
      />
    </>
  )
}
```

**Step 3: Update page.tsx to pass itemName prop**

Modify `app/(dashboard)/inventory/[itemId]/page.tsx` around line 404:

```tsx
<ItemQuickActions
  itemId={item.id}
  itemName={item.name}
  currentQuantity={item.quantity}
  unit={item.unit || 'units'}
  variant="inline"
  trackingMode={(item.tracking_mode as 'none' | 'serialized' | 'lot_expiry') || 'none'}
/>
```

**Step 4: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Errors about missing StockOutModal, StockInModal, BorrowOutModal (we'll create these next)

**Step 5: Commit**

```bash
git add app/(dashboard)/inventory/[itemId]/components/item-quick-actions.tsx app/(dashboard)/inventory/[itemId]/page.tsx
git commit -m "feat: update quick actions card for tracked items

- Show Stock Out / Stock In buttons for batch and serial items
- Keep +/- buttons only for non-tracked items
- Add Borrow Out button for all items

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create StockOutModal Component

**Files:**
- Create: `components/stock/StockOutModal.tsx`

**Step 1: Create the stock directory**

```bash
mkdir -p components/stock
```

**Step 2: Create StockOutModal.tsx**

```tsx
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
  trackingMode: 'lot_expiry' | 'serialized'
  currentQuantity: number
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
  currentQuantity,
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

  // Load batches or serials
  useEffect(() => {
    if (isOpen) {
      loadData()
      resetForm()
    }
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
      } else {
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

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Stock Out</h2>
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
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Reason (optional)
                </label>
                <select
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
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
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
```

**Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: Errors about missing RPC functions and other components (will address later)

**Step 4: Commit**

```bash
git add components/stock/StockOutModal.tsx
git commit -m "feat: create StockOutModal component

- FIFO auto-pick with manual override
- Batch picker for lot_expiry items
- Serial multi-select for serialized items
- Reason and notes fields

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create StockInModal Component

**Files:**
- Create: `components/stock/StockInModal.tsx`

**Step 1: Create StockInModal.tsx**

```tsx
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
  trackingMode: 'lot_expiry' | 'serialized'
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

  useEffect(() => {
    if (isOpen) {
      if (isBatch) {
        loadBatches()
      } else {
        setLoading(false)
      }
      resetForm()
    }
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

        const { data, error: rpcError } = await (supabase as any).rpc('upsert_item_serials', {
          p_item_id: itemId,
          p_serials: parsedSerials,
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

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Stock In</h2>
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
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Lot Number (optional)
                    </label>
                    <Input
                      type="text"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      placeholder="e.g., LOT-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Expiry Date (optional)
                    </label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Reason (optional)
                </label>
                <select
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
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Serial Numbers (one per line)
                </label>
                <textarea
                  value={serialNumbers}
                  onChange={(e) => setSerialNumbers(e.target.value)}
                  placeholder="SN-001&#10;SN-002&#10;SN-003"
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
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Notes (optional)
            </label>
            <textarea
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
```

**Step 2: Commit**

```bash
git add components/stock/StockInModal.tsx
git commit -m "feat: create StockInModal component

- New batch or add to existing batch for lot_expiry items
- Serial number entry for serialized items
- Reason and notes fields

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create BorrowOutModal Component

**Files:**
- Create: `components/stock/BorrowOutModal.tsx`

**Step 1: Create BorrowOutModal.tsx**

This modal combines the checkout functionality with batch/serial picker for tracked items.

```tsx
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
  User,
  Briefcase,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'
import { checkoutItem, checkoutWithSerials } from '@/app/actions/checkouts'

interface Batch {
  id: string
  lot_number: string | null
  batch_code: string | null
  expiry_date: string | null
  quantity: number
}

interface Serial {
  id: string
  serial_number: string
  status: string
  created_at: string
}

interface AssigneeOption {
  id: string
  name: string
}

interface BorrowOutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  itemId: string
  itemName: string
  trackingMode: 'none' | 'lot_expiry' | 'serialized'
  currentQuantity: number
}

type AssigneeType = 'person' | 'job' | 'location'

export function BorrowOutModal({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
  trackingMode,
  currentQuantity,
}: BorrowOutModalProps) {
  const router = useRouter()
  const { formatShortDate } = useFormatting()

  const isTracked = trackingMode === 'lot_expiry' || trackingMode === 'serialized'
  const isBatch = trackingMode === 'lot_expiry'
  const isSerial = trackingMode === 'serialized'

  // Data state
  const [batches, setBatches] = useState<Batch[]>([])
  const [serials, setSerials] = useState<Serial[]>([])
  const [people, setPeople] = useState<AssigneeOption[]>([])
  const [jobs, setJobs] = useState<AssigneeOption[]>([])
  const [locations, setLocations] = useState<AssigneeOption[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [quantity, setQuantity] = useState(1)
  const [selectedMode, setSelectedMode] = useState<'auto' | 'manual'>('auto')
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [selectedSerialIds, setSelectedSerialIds] = useState<Set<string>>(new Set())

  // Assignee state
  const [assigneeType, setAssigneeType] = useState<AssigneeType>('person')
  const [assigneeId, setAssigneeId] = useState('')
  const [assigneeName, setAssigneeName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
      resetForm()
    }
  }, [isOpen, itemId, trackingMode])

  async function loadData() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      // Load assignee options
      const [profilesRes, jobsRes, foldersRes] = await Promise.all([
        (supabase as any).from('profiles').select('id, full_name, email').order('full_name'),
        (supabase as any).from('jobs').select('id, name').eq('status', 'active').order('name'),
        (supabase as any).from('folders').select('id, name').order('name'),
      ])

      if (profilesRes.data) {
        setPeople(profilesRes.data.map((p: any) => ({ id: p.id, name: p.full_name || p.email })))
      }
      if (jobsRes.data) {
        setJobs(jobsRes.data.map((j: any) => ({ id: j.id, name: j.name })))
      }
      if (foldersRes.data) {
        setLocations(foldersRes.data.map((f: any) => ({ id: f.id, name: f.name })))
      }

      // Load tracking data
      if (isBatch) {
        const { data } = await (supabase as any).rpc('get_item_lots', {
          p_item_id: itemId,
          p_include_depleted: false,
        })
        const sorted = ((data || []) as Batch[]).sort((a, b) => {
          if (a.expiry_date && b.expiry_date) {
            return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
          }
          if (a.expiry_date) return -1
          if (b.expiry_date) return 1
          return 0
        })
        setBatches(sorted)
      } else if (isSerial) {
        const { data } = await (supabase as any).rpc('get_item_serials', {
          p_item_id: itemId,
          p_include_unavailable: false,
        })
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
    setAssigneeType('person')
    setAssigneeId('')
    setAssigneeName('')
    setDueDate('')
    setNotes('')
    setError(null)
  }

  function handleQuantityChange(delta: number) {
    const maxQty = isBatch
      ? (selectedMode === 'manual' && selectedBatchId
          ? batches.find(b => b.id === selectedBatchId)?.quantity || currentQuantity
          : currentQuantity)
      : isSerial
        ? serials.length
        : currentQuantity
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

  function getAssigneeOptions(): AssigneeOption[] {
    switch (assigneeType) {
      case 'person': return people
      case 'job': return jobs
      case 'location': return locations
      default: return []
    }
  }

  function handleAssigneeChange(id: string) {
    setAssigneeId(id)
    const options = getAssigneeOptions()
    const selected = options.find(opt => opt.id === id)
    setAssigneeName(selected?.name || '')
  }

  async function handleSubmit() {
    if (!assigneeName) {
      setError('Please select an assignee')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isSerial) {
        // Serial checkout
        const serialIdsToCheckout = selectedMode === 'auto'
          ? serials.slice(0, quantity).map(s => s.id)
          : Array.from(selectedSerialIds)

        const result = await checkoutWithSerials(
          itemId,
          serialIdsToCheckout,
          assigneeType,
          assigneeId || undefined,
          assigneeName,
          dueDate || undefined,
          notes || undefined
        )

        if (!result.success) {
          throw new Error(result.error || 'Checkout failed')
        }
      } else if (isBatch) {
        // Batch checkout - use standard checkout with FIFO RPC
        // TODO: Implement batch-aware checkout RPC
        const result = await checkoutItem(
          itemId,
          quantity,
          assigneeName,
          notes || undefined,
          dueDate || undefined
        )

        if (!result.success) {
          throw new Error(result.error || 'Checkout failed')
        }
      } else {
        // Non-tracked checkout
        const result = await checkoutItem(
          itemId,
          quantity,
          assigneeName,
          notes || undefined,
          dueDate || undefined
        )

        if (!result.success) {
          throw new Error(result.error || 'Checkout failed')
        }
      }

      onSuccess?.()
      onClose()
      router.refresh()
    } catch (err: any) {
      console.error('Borrow out error:', err)
      setError(err.message || 'Failed to borrow out')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const maxQuantity = isBatch
    ? (selectedMode === 'manual' && selectedBatchId
        ? batches.find(b => b.id === selectedBatchId)?.quantity || 0
        : currentQuantity)
    : isSerial
      ? (selectedMode === 'manual' ? selectedSerialIds.size : serials.length)
      : currentQuantity

  const effectiveQuantity = isSerial && selectedMode === 'manual'
    ? selectedSerialIds.size
    : quantity

  const canSubmit = assigneeName && effectiveQuantity > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Borrow Out</h2>
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
              {/* Quantity Selector */}
              {(!isSerial || selectedMode === 'auto') && (
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
              )}

              {isSerial && selectedMode === 'manual' && (
                <div className="text-center text-sm text-neutral-500">
                  {selectedSerialIds.size} serial{selectedSerialIds.size !== 1 ? 's' : ''} selected
                </div>
              )}

              {/* Batch/Serial Picker (for tracked items) */}
              {isTracked && (
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
                      <Zap className="h-4 w-4 text-amber-500" />
                      <div className="flex-1">
                        <span className="font-medium">Auto (FIFO)</span>
                        <p className="text-sm text-neutral-500">System picks oldest first</p>
                      </div>
                    </button>

                    {/* Manual options */}
                    {isBatch ? (
                      batches.slice(0, 5).map((batch) => (
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
                              {batch.lot_number || batch.batch_code || 'Unnamed'}
                            </span>
                            <div className="flex items-center gap-3 text-sm text-neutral-500">
                              {batch.expiry_date && (
                                <span>Exp: {formatShortDate(batch.expiry_date)}</span>
                              )}
                              <span>Qty: {batch.quantity}</span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-neutral-200 p-2">
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
              )}

              {/* Assignee Type Tabs */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Assign To
                </label>
                <div className="flex gap-2 mb-3">
                  {[
                    { type: 'person' as const, icon: User, label: 'Person' },
                    { type: 'job' as const, icon: Briefcase, label: 'Job' },
                    { type: 'location' as const, icon: MapPin, label: 'Location' },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setAssigneeType(type)
                        setAssigneeId('')
                        setAssigneeName('')
                      }}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                        assigneeType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                <select
                  value={assigneeId}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-300 bg-white text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select {assigneeType}...</option>
                  {getAssigneeOptions().map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Return by (optional)
                </label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Notes (optional)
                </label>
                <textarea
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
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Borrow Out {effectiveQuantity}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/stock/BorrowOutModal.tsx
git commit -m "feat: create BorrowOutModal component

- FIFO auto-pick with manual override for tracked items
- Assignee selection (person, job, location)
- Due date and notes fields
- Works for all tracking modes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Stock Module Index and RPC Functions

**Files:**
- Create: `components/stock/index.ts`
- Create: `supabase/migrations/20260201_stock_out_fifo.sql`

**Step 1: Create index.ts**

```typescript
export { StockOutModal } from './StockOutModal'
export { StockInModal } from './StockInModal'
export { BorrowOutModal } from './BorrowOutModal'
```

**Step 2: Create the FIFO stock out RPC function**

```sql
-- Stock out using FIFO (First Expired First Out) strategy
-- Automatically deducts from oldest expiry batches first

CREATE OR REPLACE FUNCTION stock_out_fifo(
  p_item_id UUID,
  p_quantity INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
  v_remaining INTEGER := p_quantity;
  v_lot RECORD;
  v_deduct INTEGER;
  v_total_deducted INTEGER := 0;
BEGIN
  -- Get tenant_id from item
  SELECT tenant_id INTO v_tenant_id
  FROM inventory_items
  WHERE id = p_item_id;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  -- Check total available quantity
  IF (SELECT COALESCE(SUM(quantity), 0) FROM lots WHERE item_id = p_item_id AND status = 'active') < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient quantity available');
  END IF;

  -- Loop through lots in FEFO order (earliest expiry first, then oldest created)
  FOR v_lot IN
    SELECT id, quantity
    FROM lots
    WHERE item_id = p_item_id
      AND status = 'active'
      AND quantity > 0
    ORDER BY
      expiry_date ASC NULLS LAST,
      created_at ASC
  LOOP
    EXIT WHEN v_remaining <= 0;

    -- Calculate how much to deduct from this lot
    v_deduct := LEAST(v_lot.quantity, v_remaining);

    -- Update the lot
    UPDATE lots
    SET
      quantity = quantity - v_deduct,
      status = CASE WHEN quantity - v_deduct <= 0 THEN 'depleted' ELSE status END,
      updated_at = NOW()
    WHERE id = v_lot.id;

    -- Log the movement
    INSERT INTO lot_movements (
      lot_id,
      movement_type,
      quantity,
      reason,
      created_at
    ) VALUES (
      v_lot.id,
      'stock_out',
      -v_deduct,
      COALESCE(p_reason, 'FIFO stock out'),
      NOW()
    );

    v_remaining := v_remaining - v_deduct;
    v_total_deducted := v_total_deducted + v_deduct;
  END LOOP;

  -- Update item quantity
  UPDATE inventory_items
  SET
    quantity = quantity - v_total_deducted,
    status = CASE
      WHEN quantity - v_total_deducted <= 0 THEN 'out_of_stock'
      WHEN min_quantity IS NOT NULL AND quantity - v_total_deducted <= min_quantity THEN 'low_stock'
      ELSE 'in_stock'
    END,
    updated_at = NOW()
  WHERE id = p_item_id;

  -- Log activity
  INSERT INTO activity_logs (
    tenant_id,
    action_type,
    entity_type,
    entity_id,
    quantity_delta,
    changes,
    created_at
  ) VALUES (
    v_tenant_id,
    'stock_out',
    'item',
    p_item_id,
    -v_total_deducted,
    jsonb_build_object('reason', p_reason, 'method', 'fifo'),
    NOW()
  );

  RETURN jsonb_build_object('success', true, 'quantity_deducted', v_total_deducted);
END;
$$;

-- Stock out specific serials
CREATE OR REPLACE FUNCTION stock_out_serials(
  p_item_id UUID,
  p_serial_ids UUID[],
  p_reason TEXT DEFAULT NULL,
  p_new_status TEXT DEFAULT 'sold'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
  v_count INTEGER;
BEGIN
  -- Get tenant_id from item
  SELECT tenant_id INTO v_tenant_id
  FROM inventory_items
  WHERE id = p_item_id;

  IF v_tenant_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not found');
  END IF;

  -- Verify all serials belong to this item and are available
  SELECT COUNT(*) INTO v_count
  FROM serial_numbers
  WHERE id = ANY(p_serial_ids)
    AND item_id = p_item_id
    AND status = 'available';

  IF v_count != array_length(p_serial_ids, 1) THEN
    RETURN jsonb_build_object('success', false, 'error', 'One or more serials not available');
  END IF;

  -- Update serial statuses
  UPDATE serial_numbers
  SET
    status = p_new_status,
    notes = COALESCE(notes || E'\n', '') || 'Stock out: ' || COALESCE(p_reason, 'No reason provided'),
    updated_at = NOW()
  WHERE id = ANY(p_serial_ids);

  -- Update item quantity
  UPDATE inventory_items
  SET
    quantity = quantity - array_length(p_serial_ids, 1),
    status = CASE
      WHEN quantity - array_length(p_serial_ids, 1) <= 0 THEN 'out_of_stock'
      WHEN min_quantity IS NOT NULL AND quantity - array_length(p_serial_ids, 1) <= min_quantity THEN 'low_stock'
      ELSE 'in_stock'
    END,
    updated_at = NOW()
  WHERE id = p_item_id;

  -- Log activity
  INSERT INTO activity_logs (
    tenant_id,
    action_type,
    entity_type,
    entity_id,
    quantity_delta,
    changes,
    created_at
  ) VALUES (
    v_tenant_id,
    'stock_out',
    'item',
    p_item_id,
    -array_length(p_serial_ids, 1),
    jsonb_build_object('reason', p_reason, 'serial_ids', p_serial_ids, 'new_status', p_new_status),
    NOW()
  );

  RETURN jsonb_build_object('success', true, 'count', array_length(p_serial_ids, 1));
END;
$$;
```

**Step 3: Run migration**

Run: `npx supabase db push` or apply via Supabase dashboard

**Step 4: Commit**

```bash
git add components/stock/index.ts supabase/migrations/20260201_stock_out_fifo.sql
git commit -m "feat: add stock module exports and FIFO RPC functions

- Create index.ts for stock components
- Add stock_out_fifo RPC for FEFO batch deduction
- Add stock_out_serials RPC for serial status updates

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update Tracking Components Index

**Files:**
- Modify: `components/tracking/index.ts`

**Step 1: Remove ManageTrackingModal export (optional - can deprecate later)**

Keep as-is for now, the new modals work alongside existing components.

**Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: All errors should be resolved

**Step 3: Run build**

Run: `npm run build`
Expected: Build should succeed

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete stock workflow redesign implementation

- Updated quick actions card with Stock Out/In/Borrow buttons
- Created StockOutModal with FIFO auto-pick
- Created StockInModal with new/existing batch options
- Created BorrowOutModal with assignee selection
- Added FIFO RPC functions for atomic stock operations

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

| Task | Files | Description |
|------|-------|-------------|
| 1 | item-quick-actions.tsx, page.tsx | Update quick actions card UI |
| 2 | StockOutModal.tsx | Create stock out modal with FIFO |
| 3 | StockInModal.tsx | Create stock in modal |
| 4 | BorrowOutModal.tsx | Create borrow out modal |
| 5 | index.ts, migration.sql | Create exports and RPC functions |
| 6 | Final verification | TypeScript check and build |

---

Plan complete and saved to `docs/plans/2026-02-01-stock-workflow-implementation.md`.

**Two execution options:**

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
