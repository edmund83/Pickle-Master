'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Loader2 } from 'lucide-react'
import { updateItemQuantity } from '@/app/actions/inventory'
import { ItemDetailCard } from './item-detail-card'

interface ItemQuickActionsProps {
  itemId: string
  currentQuantity: number
  unit: string
  variant?: 'card' | 'inline'
  className?: string
}

export function ItemQuickActions({
  itemId,
  currentQuantity,
  unit,
  variant = 'card',
  className,
}: ItemQuickActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(() => {
    const parsed = Number(currentQuantity)
    return Number.isFinite(parsed) ? parsed : 0
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const content = (
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
    </div>
  )

  if (variant === 'inline') {
    return <div className={className}>{content}</div>
  }

  return (
    <ItemDetailCard title="Quick Actions" className={className}>
      {content}
    </ItemDetailCard>
  )
}
