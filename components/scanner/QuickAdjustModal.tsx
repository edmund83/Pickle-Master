'use client'

import { useState } from 'react'
import { Minus, Plus, Check, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ScannedItem } from './ScanResultModal'

interface QuickAdjustModalProps {
  item: ScannedItem
  isSaving: boolean
  onSave: (newQuantity: number, adjustment: number) => Promise<void>
  onScanNext: () => void
  onDone: () => void
  className?: string
}

export function QuickAdjustModal({
  item,
  isSaving,
  onSave,
  onScanNext,
  onDone,
  className,
}: QuickAdjustModalProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const adjustment = quantity - item.quantity

  const handleQuickAdjust = (delta: number) => {
    setQuantity(prev => Math.max(0, prev + delta))
    setShowCustomInput(false)
    setCustomInput('')
  }

  const handleSetQuantity = (value: number) => {
    setQuantity(Math.max(0, value))
    setShowCustomInput(false)
    setCustomInput('')
  }

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d+$/.test(value)) {
      setCustomInput(value)
    }
  }

  const handleCustomInputSubmit = () => {
    if (customInput) {
      handleSetQuantity(parseInt(customInput, 10))
    }
  }

  const handleSaveAndScanNext = async () => {
    await onSave(quantity, adjustment)
    onScanNext()
  }

  const handleSaveAndDone = async () => {
    await onSave(quantity, adjustment)
    onDone()
  }

  return (
    <div className={cn('p-4', className)}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{item.name}</CardTitle>
          {item.sku && (
            <p className="text-sm text-neutral-500">SKU: {item.sku}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current vs New quantity */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-center">
              <p className="text-xs text-neutral-500 uppercase tracking-wide">Current</p>
              <p className="text-2xl font-bold text-neutral-400">{item.quantity}</p>
            </div>
            <div className="text-2xl text-neutral-300">→</div>
            <div className="text-center">
              <p className="text-xs text-neutral-500 uppercase tracking-wide">New</p>
              <p className={cn(
                'text-3xl font-bold',
                adjustment > 0 && 'text-green-600',
                adjustment < 0 && 'text-red-600',
                adjustment === 0 && 'text-neutral-900'
              )}>
                {quantity}
              </p>
            </div>
          </div>

          {/* Adjustment indicator */}
          {adjustment !== 0 && (
            <div className={cn(
              'text-center py-2 rounded-lg text-sm font-medium',
              adjustment > 0 && 'bg-green-50 text-green-700',
              adjustment < 0 && 'bg-red-50 text-red-700'
            )}>
              {adjustment > 0 ? '+' : ''}{adjustment} units
            </div>
          )}

          {/* Quick adjust buttons */}
          <div className="grid grid-cols-5 gap-2">
            <Button
              variant="outline"
              onClick={() => handleQuickAdjust(-10)}
              className="h-14 text-lg font-semibold"
              disabled={quantity < 10}
            >
              -10
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickAdjust(-1)}
              className="h-14 text-lg font-semibold"
              disabled={quantity < 1}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <Button
              variant={showCustomInput ? 'default' : 'outline'}
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="h-14 text-sm font-medium"
            >
              {showCustomInput ? 'Set' : 'Custom'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickAdjust(1)}
              className="h-14 text-lg font-semibold"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleQuickAdjust(10)}
              className="h-14 text-lg font-semibold"
            >
              +10
            </Button>
          </div>

          {/* Custom input */}
          {showCustomInput && (
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter quantity"
                value={customInput}
                onChange={handleCustomInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomInputSubmit()
                  }
                }}
                className="text-center text-xl h-12"
                autoFocus
              />
              <Button
                onClick={handleCustomInputSubmit}
                disabled={!customInput}
                className="h-12 px-6"
              >
                Set
              </Button>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleSaveAndScanNext}
              className="w-full gap-2"
              size="lg"
              disabled={isSaving || adjustment === 0}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {adjustment === 0 ? 'No Changes' : 'Save & Scan Next'}
            </Button>
            <Button
              onClick={adjustment === 0 ? onDone : handleSaveAndDone}
              variant="outline"
              className="w-full gap-2"
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
              {adjustment === 0 ? 'Done' : 'Save & Done'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
