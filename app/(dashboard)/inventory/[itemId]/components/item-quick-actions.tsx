'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Loader2, Package, ArrowDownCircle, ArrowUpCircle, HandHelping } from 'lucide-react'
import { updateItemQuantity } from '@/app/actions/inventory'
import { ItemDetailCard } from './item-detail-card'
import { Button } from '@/components/ui/button'
// These modals will be created in Tasks 2-4
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

  // Modal state for stock workflows
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

  // Helper to handle modal success
  const handleModalSuccess = () => {
    router.refresh()
  }

  // Determine if this is a tracked item (lot_expiry or serialized)
  const isTracked = trackingMode === 'lot_expiry' || trackingMode === 'serialized'

  // For tracked items (lot_expiry or serialized): Show Stock Out/Stock In buttons
  const trackedItemContent = (
    <div className="space-y-4">
      {/* Quantity display */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-neutral-900">On hand</span>
          <span className="text-xs text-neutral-500">
            {trackingMode === 'lot_expiry' ? 'Managed via lots' : 'Managed via serials'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2">
            <Package className="h-5 w-5 text-purple-500" />
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-neutral-900">
                {quantity}
              </div>
              <div className="text-xs text-purple-600">{unit || 'units'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Out / Stock In buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-11 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
          onClick={() => setShowStockOut(true)}
        >
          <ArrowDownCircle className="mr-2 h-4 w-4" />
          Stock Out
        </Button>
        <Button
          variant="outline"
          className="h-11 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
          onClick={() => setShowStockIn(true)}
        >
          <ArrowUpCircle className="mr-2 h-4 w-4" />
          Stock In
        </Button>
      </div>

      {/* Lend button */}
      <Button
        variant="outline"
        className="h-11 w-full"
        onClick={() => setShowBorrowOut(true)}
      >
        <HandHelping className="mr-2 h-4 w-4" />
        Lend
      </Button>
    </div>
  )

  // For non-tracked items: Keep existing +/- buttons + add Lend
  const nonTrackedContent = (
    <div className="space-y-2">
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

      {errorMessage ? (
        <p className="text-xs text-red-600" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {/* Lend button for non-tracked items */}
      <Button
        variant="outline"
        className="mt-3 h-11 w-full"
        onClick={() => setShowBorrowOut(true)}
      >
        <HandHelping className="mr-2 h-4 w-4" />
        Lend
      </Button>
    </div>
  )

  // Select appropriate content based on tracking mode
  const content = isTracked ? trackedItemContent : nonTrackedContent

  // Modal components
  const modals = (
    <>
      <StockOutModal
        itemId={itemId}
        itemName={itemName}
        trackingMode={trackingMode || 'none'}
        isOpen={showStockOut}
        onClose={() => setShowStockOut(false)}
        onSuccess={handleModalSuccess}
      />
      <StockInModal
        itemId={itemId}
        itemName={itemName}
        trackingMode={trackingMode || 'none'}
        isOpen={showStockIn}
        onClose={() => setShowStockIn(false)}
        onSuccess={handleModalSuccess}
      />
      <BorrowOutModal
        itemId={itemId}
        itemName={itemName}
        currentQuantity={quantity}
        trackingMode={trackingMode || 'none'}
        isOpen={showBorrowOut}
        onClose={() => setShowBorrowOut(false)}
        onSuccess={handleModalSuccess}
      />
    </>
  )

  if (variant === 'inline') {
    return (
      <div className={className}>
        {content}
        {modals}
      </div>
    )
  }

  return (
    <ItemDetailCard title="Quick Actions" className={className}>
      {content}
      {modals}
    </ItemDetailCard>
  )
}
