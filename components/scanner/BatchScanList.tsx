'use client'

import { useState } from 'react'
import { Package, Check, X, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ScannedItem } from './ScanResultModal'

export interface BatchScanItem {
  barcode: string
  item: ScannedItem | null
  scannedAt: Date
  verified: boolean
  expectedQuantity?: number
  actualQuantity?: number
}

interface BatchScanListProps {
  items: BatchScanItem[]
  isSaving: boolean
  onVerifyItem: (barcode: string, actualQuantity: number) => void
  onRemoveItem: (barcode: string) => void
  onSaveAll: () => Promise<void>
  onClear: () => void
  onContinueScanning: () => void
  className?: string
}

export function BatchScanList({
  items,
  isSaving,
  onVerifyItem,
  onRemoveItem,
  onSaveAll,
  onClear,
  onContinueScanning,
  className,
}: BatchScanListProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const foundItems = items.filter(i => i.item !== null)
  const missingItems = items.filter(i => i.item === null)
  const verifiedCount = items.filter(i => i.verified).length

  const toggleExpand = (barcode: string) => {
    setExpandedItem(prev => prev === barcode ? null : barcode)
  }

  if (items.length === 0) {
    return (
      <div className={cn('p-4', className)}>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Items Scanned</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Start scanning items to build your inventory count checklist.
            </p>
            <Button onClick={onContinueScanning} className="w-full">
              Start Scanning
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header stats */}
      <div className="p-4 bg-neutral-50 border-b">
        <div className="flex justify-between text-sm">
          <div>
            <span className="text-neutral-500">Scanned: </span>
            <span className="font-semibold">{items.length}</span>
          </div>
          <div>
            <span className="text-neutral-500">Found: </span>
            <span className="font-semibold text-green-600">{foundItems.length}</span>
          </div>
          <div>
            <span className="text-neutral-500">Missing: </span>
            <span className="font-semibold text-red-600">{missingItems.length}</span>
          </div>
          <div>
            <span className="text-neutral-500">Verified: </span>
            <span className="font-semibold text-primary">{verifiedCount}</span>
          </div>
        </div>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.map((scanItem) => (
          <Card
            key={scanItem.barcode}
            className={cn(
              'transition-colors',
              scanItem.verified && 'bg-green-50 border-green-200',
              !scanItem.item && 'bg-red-50 border-red-200'
            )}
          >
            <CardContent className="p-3">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => scanItem.item && toggleExpand(scanItem.barcode)}
              >
                {/* Status icon */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  scanItem.verified && 'bg-green-100',
                  !scanItem.item && 'bg-red-100',
                  scanItem.item && !scanItem.verified && 'bg-neutral-100'
                )}>
                  {scanItem.verified ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : !scanItem.item ? (
                    <X className="h-5 w-5 text-red-600" />
                  ) : (
                    <Package className="h-5 w-5 text-neutral-400" />
                  )}
                </div>

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  {scanItem.item ? (
                    <>
                      <p className="font-medium truncate">{scanItem.item.name}</p>
                      <p className="text-xs text-neutral-500">
                        Qty: {scanItem.item.quantity}
                        {scanItem.item.sku && ` • SKU: ${scanItem.item.sku}`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-red-600">Not Found</p>
                      <p className="text-xs text-neutral-500 font-mono">{scanItem.barcode}</p>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveItem(scanItem.barcode)
                    }}
                    className="h-8 w-8 text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {scanItem.item && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      {expandedItem === scanItem.barcode ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Expanded verification section */}
              {expandedItem === scanItem.barcode && scanItem.item && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-neutral-500 block mb-1">
                        Verify Actual Count
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={scanItem.actualQuantity ?? scanItem.item.quantity}
                          className="w-20 px-3 py-2 border rounded-lg text-center"
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10)
                            if (!isNaN(value)) {
                              onVerifyItem(scanItem.barcode, value)
                            }
                          }}
                        />
                        <span className="text-sm text-neutral-500">
                          (System: {scanItem.item.quantity})
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={scanItem.verified ? 'outline' : 'default'}
                      onClick={() => onVerifyItem(
                        scanItem.barcode,
                        scanItem.actualQuantity ?? scanItem.item!.quantity
                      )}
                    >
                      {scanItem.verified ? 'Verified' : 'Verify'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t bg-white space-y-2">
        <div className="flex gap-2">
          <Button
            onClick={onContinueScanning}
            variant="outline"
            className="flex-1"
          >
            Continue Scanning
          </Button>
          <Button
            onClick={onClear}
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Clear All
          </Button>
        </div>
        <Button
          onClick={onSaveAll}
          className="w-full"
          disabled={isSaving || foundItems.length === 0}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            `Save Count (${foundItems.length} items)`
          )}
        </Button>
      </div>
    </div>
  )
}
