'use client'

import { Package, Plus, Edit3, ExternalLink, Loader2, AlertTriangle, CircleOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ScannedItem {
  id: string
  name: string
  sku: string | null
  barcode: string | null
  quantity: number
  min_stock_level: number | null
  unit_cost: number | null
  photo_url: string | null
  folder_name: string | null
  updated_at?: string | null
}

export interface ValidationWarning {
  /** Whether the check digit validation failed */
  isInvalid: boolean
  /** Error message explaining the validation failure */
  message?: string
  /** The barcode format that was validated */
  format?: string
}

interface ScanResultModalProps {
  barcode: string
  item: ScannedItem | null
  isLoading: boolean
  /** Validation warning for invalid check digit */
  validationWarning?: ValidationWarning
  onAdjustQuantity: () => void
  onViewDetails: () => void
  onAddNew: () => void
  onScanAgain: () => void
  /** Quick action to set quantity to zero (stocktake) */
  onSetToZero?: () => void
  className?: string
}

export function ScanResultModal({
  barcode,
  item,
  isLoading,
  validationWarning,
  onAdjustQuantity,
  onViewDetails,
  onAddNew,
  onScanAgain,
  onSetToZero,
  className,
}: ScanResultModalProps) {
  if (isLoading) {
    return (
      <div className={cn('p-6 flex flex-col items-center justify-center', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-neutral-500">Looking up item...</p>
      </div>
    )
  }

  // Validation warning banner
  const validationBanner = validationWarning?.isInvalid ? (
    <div className="mx-4 mt-4 mb-0 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-800">
          Check digit validation failed
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          {validationWarning.message || 'The barcode may be damaged or misread. Consider rescanning.'}
        </p>
        {validationWarning.format && (
          <p className="text-xs text-amber-600 mt-1">
            Format: {validationWarning.format}
          </p>
        )}
      </div>
    </div>
  ) : null

  // Item found
  if (item) {
    const stockStatus = item.min_stock_level
      ? item.quantity <= 0
        ? 'out'
        : item.quantity <= item.min_stock_level
        ? 'low'
        : 'ok'
      : 'ok'

    return (
      <div className={cn('pb-4', className)}>
        {validationBanner}
        <div className="p-4 pt-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex gap-4 p-4">
              {/* Item image or placeholder */}
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden">
                {item.photo_url ? (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-8 w-8 text-neutral-400" />
                )}
              </div>

              {/* Item details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                {item.sku && (
                  <p className="text-sm text-neutral-500">SKU: {item.sku}</p>
                )}
                {item.folder_name && (
                  <p className="text-xs text-neutral-400">{item.folder_name}</p>
                )}
              </div>
            </div>

            {/* Quantity display */}
            <div className={cn(
              'px-4 py-3 border-t',
              stockStatus === 'out' && 'bg-red-50 border-red-100',
              stockStatus === 'low' && 'bg-yellow-50 border-yellow-100',
              stockStatus === 'ok' && 'bg-neutral-50'
            )}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-600">Current Quantity</span>
                <span className={cn(
                  'text-2xl font-bold',
                  stockStatus === 'out' && 'text-red-600',
                  stockStatus === 'low' && 'text-yellow-600',
                  stockStatus === 'ok' && 'text-neutral-900'
                )}>
                  {item.quantity}
                </span>
              </div>
              {stockStatus !== 'ok' && (
                <p className={cn(
                  'text-xs mt-1',
                  stockStatus === 'out' && 'text-red-600',
                  stockStatus === 'low' && 'text-yellow-600'
                )}>
                  {stockStatus === 'out' ? 'Out of stock!' : `Low stock (min: ${item.min_stock_level})`}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t flex flex-col gap-2">
              <Button
                onClick={onAdjustQuantity}
                className="w-full gap-2"
                size="lg"
              >
                <Edit3 className="h-4 w-4" />
                Adjust Quantity
              </Button>
              <div className="flex gap-2">
                {/* Set to 0 - common stocktake action */}
                {onSetToZero && item.quantity > 0 && (
                  <Button
                    onClick={onSetToZero}
                    variant="outline"
                    className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <CircleOff className="h-4 w-4" />
                    Set to 0
                  </Button>
                )}
                <Button
                  onClick={onViewDetails}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    )
  }

  // Item not found
  return (
    <div className={cn('pb-4', className)}>
      {validationBanner}
      <div className="p-4 pt-4">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
            <Package className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Item Not Found</h3>
          <p className="text-sm text-neutral-500 mb-1">
            No item matches this barcode:
          </p>
          <p className="font-mono text-sm bg-neutral-100 px-3 py-1 rounded inline-block mb-6">
            {barcode}
          </p>

          <Button onClick={onAddNew} className="w-full gap-2" size="lg">
            <Plus className="h-4 w-4" />
            Add New Item
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
