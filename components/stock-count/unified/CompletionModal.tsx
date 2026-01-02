'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Loader2, X, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VarianceSummary {
  total: number
  short: number
  over: number
  netUnits: number
}

interface CompletionModalProps {
  open: boolean
  onClose: () => void
  onComplete: (applyAdjustments: boolean) => Promise<void>
  countedItems: number
  totalItems: number
  variances: VarianceSummary
}

export function CompletionModal({
  open,
  onClose,
  onComplete,
  countedItems,
  totalItems,
  variances,
}: CompletionModalProps) {
  const [applyAdjustments, setApplyAdjustments] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const allCounted = countedItems === totalItems
  const hasVariances = variances.total > 0

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await onComplete(applyAdjustments)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full',
                hasVariances ? 'bg-amber-100' : 'bg-green-100'
              )}
            >
              {hasVariances ? (
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-neutral-900 text-center mb-2">
            {allCounted ? 'Complete Stock Count' : 'Finish Early?'}
          </h2>

          {/* Description */}
          <p className="text-neutral-500 text-center mb-4">
            {!allCounted ? (
              <>
                You&apos;ve counted{' '}
                <span className="font-semibold text-neutral-700">
                  {countedItems} of {totalItems}
                </span>{' '}
                items. Uncounted items will remain unchanged.
              </>
            ) : hasVariances ? (
              <>
                Found{' '}
                <span className="font-semibold text-amber-700">
                  {variances.total} variance{variances.total !== 1 ? 's' : ''}
                </span>{' '}
                across your inventory.
              </>
            ) : (
              'All items match expected quantities. Great job!'
            )}
          </p>

          {/* Variance summary */}
          {hasVariances && (
            <div className="mb-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-red-600">-{variances.short}</p>
                  <p className="text-xs text-neutral-500">Short</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">+{variances.over}</p>
                  <p className="text-xs text-neutral-500">Over</p>
                </div>
                <div>
                  <p
                    className={cn(
                      'text-lg font-bold',
                      variances.netUnits < 0 ? 'text-red-600' : variances.netUnits > 0 ? 'text-green-600' : 'text-neutral-600'
                    )}
                  >
                    {variances.netUnits > 0 ? '+' : ''}{variances.netUnits}
                  </p>
                  <p className="text-xs text-neutral-500">Net</p>
                </div>
              </div>
            </div>
          )}

          {/* Apply adjustments toggle */}
          {hasVariances && (
            <label className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer mb-4 hover:bg-neutral-100 transition-colors">
              <input
                type="checkbox"
                checked={applyAdjustments}
                onChange={(e) => setApplyAdjustments(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-pickle-600 focus:ring-pickle-500"
              />
              <div>
                <p className="font-medium text-neutral-900 text-sm">
                  Apply adjustments to inventory
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Update actual quantities to match counted values
                </p>
              </div>
            </label>
          )}

          {/* Warning for adjustments */}
          {applyAdjustments && hasVariances && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Inventory quantities will be permanently updated. This cannot be undone.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : applyAdjustments ? (
                <Package className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {applyAdjustments ? 'Apply & Complete' : 'Complete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
