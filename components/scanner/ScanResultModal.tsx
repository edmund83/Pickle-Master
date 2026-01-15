'use client'

import { Package, Plus, Search, Edit3, ExternalLink, Loader2 } from 'lucide-react'
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

interface ScanResultModalProps {
  barcode: string
  item: ScannedItem | null
  isLoading: boolean
  onAdjustQuantity: () => void
  onViewDetails: () => void
  onAddNew: () => void
  onScanAgain: () => void
  className?: string
}

export function ScanResultModal({
  barcode,
  item,
  isLoading,
  onAdjustQuantity,
  onViewDetails,
  onAddNew,
  onScanAgain,
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
      <div className={cn('p-4', className)}>
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
                <Button
                  onClick={onViewDetails}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Details
                </Button>
                <Button
                  onClick={onScanAgain}
                  variant="ghost"
                  className="flex-1 gap-2"
                >
                  <Search className="h-4 w-4" />
                  Scan Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Item not found
  return (
    <div className={cn('p-4', className)}>
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

          <div className="flex flex-col gap-2">
            <Button onClick={onAddNew} className="w-full gap-2" size="lg">
              <Plus className="h-4 w-4" />
              Add New Item
            </Button>
            <Button onClick={onScanAgain} variant="ghost" className="w-full gap-2">
              <Search className="h-4 w-4" />
              Scan Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
