'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  FileText,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AdjustmentConfirmation } from './AdjustmentConfirmation'
import { completeStockCount } from '@/app/actions/stock-counts'
import type { StockCountItemWithDetails } from '@/app/actions/stock-counts'

interface StockCount {
  id: string
  display_id: string | null
  name: string | null
  status: string
}

interface CompletionSummaryProps {
  stockCount: StockCount
  items: StockCountItemWithDetails[]
  onBack?: () => void
}

export function CompletionSummary({
  stockCount,
  items,
  onBack,
}: CompletionSummaryProps) {
  const router = useRouter()
  const [applyAdjustments, setApplyAdjustments] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    const total = items.length
    const counted = items.filter((i) => i.status !== 'pending').length
    const pending = items.filter((i) => i.status === 'pending').length
    const varianceItems = items.filter(
      (i) => i.variance !== null && i.variance !== 0
    )
    const negativeVariances = varianceItems.filter((i) => (i.variance ?? 0) < 0)
    const positiveVariances = varianceItems.filter((i) => (i.variance ?? 0) > 0)

    const totalNegative = negativeVariances.reduce(
      (sum, i) => sum + Math.abs(i.variance ?? 0),
      0
    )
    const totalPositive = positiveVariances.reduce(
      (sum, i) => sum + (i.variance ?? 0),
      0
    )
    const netVariance = totalPositive - totalNegative

    return {
      total,
      counted,
      pending,
      varianceCount: varianceItems.length,
      negativeCount: negativeVariances.length,
      positiveCount: positiveVariances.length,
      totalNegative,
      totalPositive,
      netVariance,
      completionPercent: total > 0 ? Math.round((counted / total) * 100) : 0,
    }
  }, [items])

  // Handle complete
  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      const result = await completeStockCount(stockCount.id, applyAdjustments)
      if (result.success) {
        router.push(`/tasks/stock-count/${stockCount.id}`)
      } else {
        console.error('Failed to complete:', result.error)
        alert('Failed to complete stock count: ' + result.error)
      }
    } catch (error) {
      console.error('Error completing:', error)
      alert('An error occurred while completing the stock count')
    } finally {
      setIsCompleting(false)
      setShowConfirmation(false)
    }
  }

  // Handle export PDF (placeholder)
  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export coming soon!')
  }

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3 safe-area-inset-top">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-neutral-500 hover:text-neutral-700 rounded-full hover:bg-neutral-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="font-semibold text-neutral-900">
              Complete Stock Count
            </h1>
            <p className="text-sm text-neutral-500">
              {stockCount.display_id || 'Stock Count'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Success Card */}
        <div className="p-6 rounded-2xl bg-green-50 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-green-800 mb-1">
            Count Complete!
          </h2>
          <p className="text-green-700">
            {stats.completionPercent}% of items have been counted
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <Package className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900 tabular-nums">
                  {stats.total}
                </p>
                <p className="text-xs text-neutral-500">Total Items</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 tabular-nums">
                  {stats.counted}
                </p>
                <p className="text-xs text-green-600">Counted</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 tabular-nums">
                  {stats.varianceCount}
                </p>
                <p className="text-xs text-amber-600">Variances</p>
              </div>
            </div>
          </div>

          <div
            className={cn(
              'p-4 rounded-2xl border',
              stats.netVariance < 0
                ? 'bg-red-50 border-red-200'
                : stats.netVariance > 0
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-neutral-200'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full',
                  stats.netVariance < 0
                    ? 'bg-red-100'
                    : stats.netVariance > 0
                    ? 'bg-green-100'
                    : 'bg-neutral-100'
                )}
              >
                {stats.netVariance < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                ) : stats.netVariance > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <Package className="h-5 w-5 text-neutral-600" />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    'text-2xl font-bold tabular-nums',
                    stats.netVariance < 0
                      ? 'text-red-700'
                      : stats.netVariance > 0
                      ? 'text-green-700'
                      : 'text-neutral-900'
                  )}
                >
                  {stats.netVariance > 0 ? '+' : ''}
                  {stats.netVariance}
                </p>
                <p
                  className={cn(
                    'text-xs',
                    stats.netVariance < 0
                      ? 'text-red-600'
                      : stats.netVariance > 0
                      ? 'text-green-600'
                      : 'text-neutral-500'
                  )}
                >
                  Net Adjustment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Variance Breakdown */}
        {stats.varianceCount > 0 && (
          <div className="p-4 rounded-2xl bg-white border border-neutral-200 space-y-3">
            <h3 className="font-medium text-neutral-900">Variance Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-red-50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    Short
                  </span>
                </div>
                <p className="text-lg font-bold text-red-700 tabular-nums">
                  -{stats.totalNegative} units
                </p>
                <p className="text-xs text-red-600">
                  {stats.negativeCount} items
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Over
                  </span>
                </div>
                <p className="text-lg font-bold text-green-700 tabular-nums">
                  +{stats.totalPositive} units
                </p>
                <p className="text-xs text-green-600">
                  {stats.positiveCount} items
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Apply Adjustments Toggle */}
        {stats.varianceCount > 0 && (
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-neutral-200 cursor-pointer">
            <input
              type="checkbox"
              checked={applyAdjustments}
              onChange={(e) => setApplyAdjustments(e.target.checked)}
              className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-pickle-500 focus:ring-pickle-500"
            />
            <div className="flex-1">
              <span className="font-medium text-neutral-900">
                Apply adjustments to inventory
              </span>
              <p className="text-sm text-neutral-500 mt-0.5">
                Update item quantities to match counted values. This will create
                inventory adjustment records for audit purposes.
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-neutral-200 px-4 py-4 safe-area-inset-bottom space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="flex-1"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={isCompleting}
            className="flex-1"
          >
            {isCompleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Complete Count
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AdjustmentConfirmation
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleComplete}
        applyAdjustments={applyAdjustments}
        netVariance={stats.netVariance}
        varianceCount={stats.varianceCount}
        isLoading={isCompleting}
      />
    </div>
  )
}
