'use client'

import { AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdjustmentConfirmationProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  applyAdjustments: boolean
  netVariance: number
  varianceCount: number
  isLoading?: boolean
}

export function AdjustmentConfirmation({
  open,
  onClose,
  onConfirm,
  applyAdjustments,
  netVariance,
  varianceCount,
  isLoading = false,
}: AdjustmentConfirmationProps) {
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
                applyAdjustments && varianceCount > 0
                  ? 'bg-amber-100'
                  : 'bg-green-100'
              )}
            >
              {applyAdjustments && varianceCount > 0 ? (
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-neutral-900 text-center mb-2">
            {applyAdjustments && varianceCount > 0
              ? 'Confirm Inventory Adjustments'
              : 'Complete Stock Count'}
          </h2>

          {/* Description */}
          <p className="text-neutral-500 text-center mb-6">
            {applyAdjustments && varianceCount > 0 ? (
              <>
                You are about to adjust inventory quantities for{' '}
                <span className="font-semibold text-neutral-700">
                  {varianceCount} items
                </span>
                .
                {netVariance !== 0 && (
                  <>
                    {' '}
                    Net change:{' '}
                    <span
                      className={cn(
                        'font-semibold',
                        netVariance < 0 ? 'text-red-600' : 'text-green-600'
                      )}
                    >
                      {netVariance > 0 ? '+' : ''}
                      {netVariance} units
                    </span>
                    .
                  </>
                )}
              </>
            ) : varianceCount > 0 ? (
              <>
                The stock count will be completed without applying adjustments.{' '}
                <span className="font-semibold text-neutral-700">
                  {varianceCount} variances
                </span>{' '}
                will be recorded for review.
              </>
            ) : (
              'All items match expected quantities. The stock count will be marked as complete.'
            )}
          </p>

          {/* Warning for adjustments */}
          {applyAdjustments && varianceCount > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    This action cannot be undone
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Inventory quantities will be permanently updated and an
                    adjustment record will be created for audit purposes.
                  </p>
                </div>
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
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {applyAdjustments && varianceCount > 0
                ? 'Apply & Complete'
                : 'Complete'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
