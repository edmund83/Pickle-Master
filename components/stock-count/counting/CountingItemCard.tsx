'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Package, Check, RotateCcw, ScanBarcode, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuantityAdjuster } from '@/components/ui/QuantityAdjuster'
import { cn } from '@/lib/utils'
import { TeamMemberAvatar } from '../shared/TeamMemberAvatar'

interface CountingItemCardProps {
  item: {
    id: string
    item_id: string
    item_name: string
    item_sku: string | null
    item_image: string | null
    expected_quantity: number
    counted_quantity: number | null
    variance: number | null
    status: 'pending' | 'counted' | 'verified' | 'adjusted'
    counted_by_name?: string | null
  }
  isActive: boolean
  onSelect: () => void
  onCount: (quantity: number) => void
  onScan?: () => void
  disabled?: boolean
}

const statusConfig = {
  pending: {
    badge: 'Pending',
    bgColor: 'bg-neutral-100',
    textColor: 'text-neutral-600',
    borderColor: 'border-neutral-200',
  },
  counted: {
    badge: 'Counted',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  verified: {
    badge: 'Verified',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  adjusted: {
    badge: 'Adjusted',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
}

export function CountingItemCard({
  item,
  isActive,
  onSelect,
  onCount,
  onScan,
  disabled = false,
}: CountingItemCardProps) {
  const [countValue, setCountValue] = useState(
    item.counted_quantity ?? item.expected_quantity
  )
  const [hasChanged, setHasChanged] = useState(false)

  const status = statusConfig[item.status]
  const hasVariance = item.variance !== null && item.variance !== 0
  const isCounted = item.status !== 'pending'

  const handleQuantityChange = useCallback((value: number) => {
    setCountValue(value)
    setHasChanged(true)
  }, [])

  const handleSave = useCallback(() => {
    onCount(countValue)
    setHasChanged(false)
  }, [countValue, onCount])

  const handleUseExpected = useCallback(() => {
    setCountValue(item.expected_quantity)
    onCount(item.expected_quantity)
    setHasChanged(false)
  }, [item.expected_quantity, onCount])

  // Collapsed view when not active
  if (!isActive) {
    return (
      <button
        onClick={onSelect}
        disabled={disabled}
        className={cn(
          'w-full text-left p-4 rounded-2xl bg-white border-2',
          isCounted ? status.borderColor : 'border-neutral-200',
          hasVariance && 'border-amber-300 bg-amber-50/50',
          'transition-all duration-200',
          'active:scale-[0.98]',
          'shadow-sm hover:shadow-md',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Image */}
          <div
            className={cn(
              'flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden',
              'bg-neutral-100 flex items-center justify-center'
            )}
          >
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
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-neutral-500">
                Expected: {item.expected_quantity}
              </span>
              {isCounted && (
                <>
                  <span className="text-neutral-300">→</span>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      hasVariance
                        ? item.variance! > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                        : 'text-neutral-900'
                    )}
                  >
                    {item.counted_quantity}
                    {hasVariance && (
                      <span className="ml-1">
                        ({item.variance! > 0 ? '+' : ''}{item.variance})
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status, Avatar & Arrow */}
          <div className="flex items-center gap-2">
            {/* Counted By Avatar */}
            {isCounted && item.counted_by_name && (
              <TeamMemberAvatar name={item.counted_by_name} size="sm" />
            )}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                status.bgColor,
                status.textColor
              )}
            >
              {status.badge}
            </span>
            <ChevronRight className="h-5 w-5 text-neutral-300" />
          </div>
        </div>
      </button>
    )
  }

  // Expanded/Active view
  return (
    <div
      className={cn(
        'p-4 rounded-2xl bg-white border-2 border-primary',
        'shadow-lg shadow-primary/10',
        'transition-all duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Image */}
        <div
          className={cn(
            'flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden',
            'bg-neutral-100 flex items-center justify-center'
          )}
        >
          {item.item_image ? (
            <Image
              src={item.item_image}
              alt={item.item_name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="h-10 w-10 text-neutral-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-neutral-900">
            {item.item_name}
          </p>
          {item.item_sku && (
            <p className="text-sm text-neutral-500">SKU: {item.item_sku}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <div className="px-3 py-1 rounded-full bg-neutral-100">
              <span className="text-sm font-medium text-neutral-600">
                Expected: <span className="text-neutral-900">{item.expected_quantity}</span>
              </span>
            </div>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                status.bgColor,
                status.textColor
              )}
            >
              {status.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Quantity Adjuster */}
      <div className="py-4 border-t border-b border-neutral-100">
        <QuantityAdjuster
          value={countValue}
          onChange={handleQuantityChange}
          min={0}
          showBigButtons={true}
        />
      </div>

      {/* Variance Display */}
      {countValue !== item.expected_quantity && (
        <div
          className={cn(
            'mt-4 p-3 rounded-xl text-center',
            countValue > item.expected_quantity
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          )}
        >
          <span className="text-sm font-medium">
            Variance:{' '}
            <span className="text-lg font-bold">
              {countValue > item.expected_quantity ? '+' : ''}
              {countValue - item.expected_quantity}
            </span>
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        {onScan && (
          <Button
            variant="outline"
            size="sm"
            onClick={onScan}
            className="flex-1"
          >
            <ScanBarcode className="mr-2 h-4 w-4" />
            Scan
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleUseExpected}
          className="flex-1"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Use Expected
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanged && isCounted}
          className="flex-1"
        >
          <Check className="mr-2 h-4 w-4" />
          {isCounted ? 'Update' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
