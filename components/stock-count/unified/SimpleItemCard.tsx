'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Package, Check, RotateCcw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuantityAdjuster } from '@/components/ui/QuantityAdjuster'
import { cn } from '@/lib/utils'

export interface SimpleItemCardItem {
  id: string
  item_id: string
  item_name: string
  item_sku: string | null
  item_image: string | null
  expected_quantity: number
  counted_quantity: number | null
  variance: number | null
  status: 'pending' | 'counted' | 'verified' | 'adjusted'
}

interface SimpleItemCardProps {
  item: SimpleItemCardItem
  isActive: boolean
  onSelect: () => void
  onCount: (quantity: number) => Promise<void>
  onClose: () => void
  disabled?: boolean
  isLoading?: boolean
}

type CardState = 'pending' | 'active' | 'counted-match' | 'counted-variance'

function getCardState(item: SimpleItemCardItem, isActive: boolean): CardState {
  if (isActive) return 'active'
  if (item.status === 'pending') return 'pending'
  if (item.variance !== null && item.variance !== 0) return 'counted-variance'
  return 'counted-match'
}

export function SimpleItemCard({
  item,
  isActive,
  onSelect,
  onCount,
  onClose,
  disabled = false,
  isLoading = false,
}: SimpleItemCardProps) {
  const [countValue, setCountValue] = useState(
    item.counted_quantity ?? item.expected_quantity
  )
  const [isSaving, setIsSaving] = useState(false)
  const collapsedRef = useRef<HTMLButtonElement>(null)
  const expandedRef = useRef<HTMLDivElement>(null)

  const cardState = getCardState(item, isActive)
  const hasVariance = item.variance !== null && item.variance !== 0
  const liveVariance = countValue - item.expected_quantity

  // Reset count value when item changes or becomes active
  useEffect(() => {
    if (isActive) {
      setCountValue(item.counted_quantity ?? item.expected_quantity)
    }
  }, [isActive, item.counted_quantity, item.expected_quantity])

  // Scroll into view when active
  useEffect(() => {
    if (isActive && expandedRef.current) {
      expandedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isActive])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onCount(countValue)
    } finally {
      setIsSaving(false)
    }
  }, [countValue, onCount])

  const handleUseExpected = useCallback(async () => {
    setIsSaving(true)
    try {
      await onCount(item.expected_quantity)
    } finally {
      setIsSaving(false)
    }
  }, [item.expected_quantity, onCount])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [handleSave, isSaving, onClose])

  // Collapsed states: pending, counted-match, counted-variance
  if (!isActive) {
    return (
      <button
        ref={collapsedRef}
        onClick={onSelect}
        disabled={disabled || isLoading}
        className={cn(
          'w-full text-left p-4 rounded-2xl bg-white border-2',
          'transition-all duration-200',
          'active:scale-[0.98]',
          'shadow-sm hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          disabled && 'opacity-50 pointer-events-none',
          // State-specific borders
          cardState === 'pending' && 'border-neutral-200',
          cardState === 'counted-match' && 'border-green-300 bg-green-50/50',
          cardState === 'counted-variance' && 'border-amber-300 bg-amber-50/50',
        )}
      >
        <div className="flex items-center gap-3">
          {/* Image */}
          <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center">
            {item.item_image ? (
              <Image
                src={item.item_image}
                alt={item.item_name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-neutral-300" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-neutral-900 truncate">
              {item.item_name}
            </p>
            {item.item_sku && (
              <p className="text-sm text-neutral-500 truncate">
                SKU: {item.item_sku}
              </p>
            )}

            {/* Count display */}
            <div className="flex items-center gap-2 mt-1">
              {cardState === 'pending' ? (
                <span className="text-sm text-neutral-500">
                  Expected: {item.expected_quantity}
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-neutral-500">
                    {item.expected_quantity}
                  </span>
                  <span className="text-neutral-300">→</span>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      cardState === 'counted-match' && 'text-green-600',
                      cardState === 'counted-variance' && (
                        item.variance! > 0 ? 'text-amber-600' : 'text-red-600'
                      )
                    )}
                  >
                    {item.counted_quantity}
                    {hasVariance && (
                      <span className="ml-1">
                        ({item.variance! > 0 ? '+' : ''}{item.variance})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex-shrink-0">
            {cardState === 'pending' && (
              <div className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                TAP TO COUNT
              </div>
            )}
            {cardState === 'counted-match' && (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
            )}
            {cardState === 'counted-variance' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                  {item.variance! > 0 ? '+' : ''}{item.variance}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
    )
  }

  // Active/Expanded state
  return (
    <div
      ref={expandedRef}
      className={cn(
        'p-4 rounded-2xl bg-white border-2 border-primary',
        'shadow-lg shadow-primary/10',
        'transition-all duration-200'
      )}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Image */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center">
          {item.item_image ? (
            <Image
              src={item.item_image}
              alt={item.item_name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="h-8 w-8 text-neutral-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-neutral-900 truncate">
            {item.item_name}
          </p>
          {item.item_sku && (
            <p className="text-sm text-neutral-500">SKU: {item.item_sku}</p>
          )}
          <div className="mt-2 inline-flex px-3 py-1 rounded-full bg-neutral-100">
            <span className="text-sm font-medium text-neutral-600">
              Expected: <span className="text-neutral-900">{item.expected_quantity}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quantity Adjuster */}
      <div className="py-4 border-t border-b border-neutral-100">
        <QuantityAdjuster
          value={countValue}
          onChange={setCountValue}
          min={0}
          showBigButtons={true}
          disabled={isSaving}
        />
      </div>

      {/* Live Variance Display */}
      {liveVariance !== 0 && (
        <div
          className={cn(
            'mt-4 p-3 rounded-xl text-center',
            liveVariance > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
          )}
        >
          <span className="text-sm font-medium">
            Variance:{' '}
            <span className="text-lg font-bold">
              {liveVariance > 0 ? '+' : ''}{liveVariance}
            </span>
          </span>
        </div>
      )}

      {/* Match indicator when count equals expected */}
      {liveVariance === 0 && (
        <div className="mt-4 p-3 rounded-xl text-center bg-green-50 text-green-700">
          <span className="text-sm font-medium flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4" />
            Matches expected
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUseExpected}
          disabled={isSaving}
          className="flex-1"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Use Expected
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          <Check className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Count'}
        </Button>
      </div>

      {/* Cancel hint */}
      <p className="mt-3 text-center text-xs text-neutral-400">
        Press Enter to save or Escape to cancel
      </p>
    </div>
  )
}
