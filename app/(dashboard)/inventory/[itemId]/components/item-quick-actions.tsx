'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [quantity, setQuantity] = useState(currentQuantity)

  useEffect(() => {
    setQuantity(currentQuantity)
  }, [currentQuantity])

  const handleAdjust = async (adjustment: number) => {
    if (loading) return
    const previousQuantity = quantity
    const nextQuantity = Math.max(0, quantity + adjustment)
    if (nextQuantity === quantity) return

    setQuantity(nextQuantity)
    setLoading(true)
    try {
      const result = await updateItemQuantity(itemId, nextQuantity, 'quick_action')

      if (!result.success) {
        setQuantity(previousQuantity)
        console.error(result.error)
        return
      }

      router.refresh()
    } catch (error) {
      setQuantity(previousQuantity)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-neutral-900">On hand</span>
        <span className="text-xs text-neutral-500">Adjust quantity</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-neutral-200"
            onClick={() => handleAdjust(-1)}
            disabled={loading || quantity <= 0}
            aria-label="Decrease quantity"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Minus className="h-4 w-4" />
            )}
          </Button>

          <div className="min-w-[4.5rem] text-center">
            <div className="text-2xl font-bold tabular-nums text-neutral-900">
              {quantity}
            </div>
            <div className="text-xs text-neutral-500">{unit || 'units'}</div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-neutral-200"
            onClick={() => handleAdjust(1)}
            disabled={loading}
            aria-label="Increase quantity"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
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
