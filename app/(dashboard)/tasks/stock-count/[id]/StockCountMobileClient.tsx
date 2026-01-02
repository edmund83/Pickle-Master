'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Loader2,
  Play,
  Check,
  Ban,
  Eye,
  Info,
  X,
  RotateCcw,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuantityAdjuster } from '@/components/ui/QuantityAdjuster'
import { CompletionModal } from '@/components/stock-count/unified/CompletionModal'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import {
  startStockCount,
  recordCount,
  submitForReview,
  completeStockCount,
  cancelStockCount
} from '@/app/actions/stock-counts'
import type { StockCountWithRelations, StockCountItemWithDetails } from '@/app/actions/stock-counts'
import { cn } from '@/lib/utils'
import { ChatterPanel } from '@/components/chatter'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

interface Folder {
  id: string
  name: string
  color: string | null
}

interface StockCountData {
  stock_count: StockCountWithRelations
  items: StockCountItemWithDetails[]
}

interface StockCountMobileClientProps {
  data: StockCountData
  teamMembers: TeamMember[]
  folders: Folder[]
  currentUserId: string | null
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  review: 'Under Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const scopeLabels: Record<string, string> = {
  full: 'Full Inventory',
  folder: 'Folder',
  custom: 'Custom Selection',
}

export function StockCountMobileClient({ data, teamMembers, folders, currentUserId }: StockCountMobileClientProps) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [countValue, setCountValue] = useState<number>(0)
  const [showDetails, setShowDetails] = useState(false)
  const [showCounted, setShowCounted] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)

  const stockCount = data.stock_count
  const items = data.items || []

  const isDraft = stockCount.status === 'draft'
  const isInProgress = stockCount.status === 'in_progress'
  const isReview = stockCount.status === 'review'
  const isCompleted = stockCount.status === 'completed'
  const isCancelled = stockCount.status === 'cancelled'

  // Calculate stats
  const totalItems = items.length
  const countedItemsCount = items.filter(item => item.status !== 'pending').length
  const pendingItemsCount = items.filter(item => item.status === 'pending').length
  const progress = totalItems > 0 ? Math.round((countedItemsCount / totalItems) * 100) : 0

  // Separate pending and counted items
  const pendingItems = useMemo(() => items.filter(item => item.status === 'pending'), [items])
  const countedItems = useMemo(() => items.filter(item => item.status !== 'pending'), [items])

  // Get active item
  const activeItem = useMemo(() =>
    activeItemId ? items.find(item => item.id === activeItemId) : null,
    [activeItemId, items]
  )

  // Calculate variance summary for completion modal
  const varianceSummary = useMemo(() => {
    let short = 0
    let over = 0
    let total = 0

    items.forEach(item => {
      if (item.variance !== null && item.variance !== 0) {
        total++
        if (item.variance > 0) over += item.variance
        else short += Math.abs(item.variance)
      }
    })

    return {
      total,
      short,
      over,
      netUnits: over - short
    }
  }, [items])

  // Handlers
  async function handleStart() {
    setActionLoading('start')
    try {
      const result = await startStockCount(stockCount.id)
      if (result.success) {
        router.refresh()
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function handleSubmitForReview() {
    setActionLoading('review')
    try {
      const result = await submitForReview(stockCount.id)
      if (result.success) {
        router.refresh()
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function handleComplete(applyAdjustments: boolean) {
    const result = await completeStockCount(stockCount.id, applyAdjustments)
    if (result.success) {
      setShowCompletion(false)
      router.refresh()
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this stock count?')) return
    setActionLoading('cancel')
    try {
      const result = await cancelStockCount(stockCount.id)
      if (result.success) {
        router.push('/tasks/stock-count')
      }
    } finally {
      setActionLoading(null)
    }
  }

  const openFocusMode = useCallback((item: StockCountItemWithDetails) => {
    setActiveItemId(item.id)
    setCountValue(item.counted_quantity ?? item.expected_quantity)
  }, [])

  const closeFocusMode = useCallback(() => {
    setActiveItemId(null)
    setCountValue(0)
  }, [])

  const handleSaveAndAdvance = useCallback(async () => {
    if (!activeItemId) return

    setActionLoading(`count-${activeItemId}`)
    try {
      const result = await recordCount(activeItemId, countValue)

      if (result.success) {
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([50, 30, 50])
        }

        // Show success animation
        setShowSaveSuccess(true)

        // Find next pending item
        const currentIndex = items.findIndex(i => i.id === activeItemId)
        const nextPending = items.slice(currentIndex + 1).find(i => i.status === 'pending')
          || items.slice(0, currentIndex).find(i => i.status === 'pending')

        // Brief delay for animation
        await new Promise(resolve => setTimeout(resolve, 400))
        setShowSaveSuccess(false)

        if (nextPending) {
          // Advance to next item
          setActiveItemId(nextPending.id)
          setCountValue(nextPending.expected_quantity)
        } else {
          // All done
          setActiveItemId(null)
          setShowCompletion(true)
        }

        router.refresh()
      }
    } finally {
      setActionLoading(null)
    }
  }, [activeItemId, countValue, items, router])

  const handleUseExpected = useCallback(() => {
    if (!activeItem) return
    setCountValue(activeItem.expected_quantity)
  }, [activeItem])

  // Calculate variance for active item
  const activeVariance = activeItem ? countValue - activeItem.expected_quantity : 0

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Back button */}
          <Link href="/tasks/stock-count">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          {/* Center: Title + Status */}
          <div className="text-center">
            <h1 className="font-semibold text-neutral-900">
              {isInProgress ? 'Counting' : statusLabels[stockCount.status]}
            </h1>
            <span className="text-xs text-neutral-500">
              {stockCount.display_id || stockCount.name}
            </span>
          </div>

          {/* Right: Progress chip + Info */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-semibold',
              isCompleted ? 'bg-green-100 text-green-700' :
              isInProgress ? 'bg-primary/20 text-primary' :
              'bg-neutral-100 text-neutral-700'
            )}>
              {countedItemsCount}/{totalItems}
            </div>
            <button
              onClick={() => setShowDetails(true)}
              className="p-2 rounded-full hover:bg-neutral-100"
            >
              <Info className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-neutral-100">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {/* Draft State */}
        {isDraft && (
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Ready to start</h3>
            <p className="mt-2 text-neutral-600 text-sm">
              {totalItems} item{totalItems !== 1 ? 's' : ''} to count
            </p>
            <Button
              onClick={handleStart}
              disabled={actionLoading !== null}
              className="mt-4 w-full"
              size="lg"
            >
              {actionLoading === 'start' ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              Start Counting
            </Button>
          </div>
        )}

        {/* Empty state when starting to count */}
        {isInProgress && pendingItems.length > 0 && countedItemsCount === 0 && (
          <div className="p-6 rounded-2xl bg-primary/10 border-2 border-primary/30 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Ready to count</h3>
            <p className="mt-2 text-neutral-600">
              Tap an item below to start counting
            </p>
          </div>
        )}

        {/* Pending Items */}
        {isInProgress && pendingItems.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wide">
              <Clock className="h-4 w-4" />
              To Count ({pendingItems.length})
            </h3>
            <div className="space-y-3">
              {pendingItems.map((item, index) => (
                <PendingItemCard
                  key={item.id}
                  item={item}
                  isNext={index === 0}
                  onTap={() => openFocusMode(item)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Counted Items */}
        {countedItems.length > 0 && (
          <section>
            <button
              onClick={() => setShowCounted(!showCounted)}
              className="flex items-center gap-2 mb-3 text-sm font-semibold text-neutral-500 uppercase tracking-wide w-full"
            >
              <CheckCircle className="h-4 w-4 text-green-500" />
              Counted ({countedItems.length})
              <ChevronDown className={cn(
                "h-4 w-4 ml-auto transition-transform",
                showCounted && "rotate-180"
              )} />
            </button>
            {showCounted && (
              <div className="space-y-2">
                {countedItems.map(item => (
                  <CountedItemRow
                    key={item.id}
                    item={item}
                    onTap={isInProgress ? () => openFocusMode(item) : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Completed State */}
        {isCompleted && (
          <div className="p-6 rounded-2xl bg-green-50 border border-green-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Count Complete</h3>
            <p className="mt-2 text-neutral-600 text-sm">
              {varianceSummary.total > 0
                ? `${varianceSummary.total} variance${varianceSummary.total !== 1 ? 's' : ''} found`
                : 'All items matched expected quantities'
              }
            </p>
          </div>
        )}

        {/* Cancelled State */}
        {isCancelled && (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Count Cancelled</h3>
          </div>
        )}

        {/* Review State */}
        {isReview && (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Eye className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Under Review</h3>
            <p className="mt-2 text-neutral-600 text-sm">
              {varianceSummary.total > 0
                ? `${varianceSummary.total} variance${varianceSummary.total !== 1 ? 's' : ''} to review`
                : 'All items matched'
              }
            </p>
            <Button
              onClick={() => setShowCompletion(true)}
              className="mt-4 w-full"
              size="lg"
            >
              <Check className="mr-2 h-5 w-5" />
              Complete Count
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {isInProgress && pendingItemsCount === 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 safe-area-bottom">
          <Button
            onClick={handleSubmitForReview}
            disabled={actionLoading !== null}
            className="w-full"
            size="lg"
          >
            {actionLoading === 'review' ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Eye className="mr-2 h-5 w-5" />
            )}
            Submit for Review
          </Button>
        </div>
      )}

      {/* Cancel button for draft/in_progress */}
      {(isDraft || isInProgress) && pendingItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 safe-area-bottom">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={actionLoading !== null}
            className="w-full"
          >
            {actionLoading === 'cancel' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            Cancel Count
          </Button>
        </div>
      )}

      {/* Focus Mode Overlay */}
      {activeItem && isInProgress && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Close button */}
          <button
            onClick={closeFocusMode}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-neutral-100 hover:bg-neutral-200"
          >
            <X className="h-6 w-6 text-neutral-600" />
          </button>

          <div className="flex flex-col h-full p-6 pt-16">
            {/* Item info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-neutral-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {activeItem.item_image ? (
                  <Image
                    src={activeItem.item_image}
                    alt={activeItem.item_name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="h-10 w-10 text-neutral-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-neutral-900 leading-tight">
                  {activeItem.item_name}
                </h2>
                {activeItem.item_sku && (
                  <p className="text-neutral-500 mt-1">SKU: {activeItem.item_sku}</p>
                )}
                <div className="mt-3 inline-flex px-4 py-1.5 rounded-full bg-neutral-100">
                  <span className="text-base font-medium text-neutral-600">
                    Expected: <span className="font-bold text-neutral-900">{activeItem.expected_quantity}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Adjuster */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-sm text-neutral-500 mb-6 uppercase tracking-wide font-medium">
                Count this item
              </p>
              <QuantityAdjuster
                value={countValue}
                onChange={setCountValue}
                min={0}
                showBigButtons={true}
              />

              {/* Variance indicator */}
              {activeVariance !== 0 && (
                <div className={cn(
                  "mt-8 px-6 py-3 rounded-2xl text-center",
                  activeVariance > 0 ? "bg-amber-50" : "bg-red-50"
                )}>
                  <span className={cn(
                    "text-lg font-bold",
                    activeVariance > 0 ? "text-amber-700" : "text-red-700"
                  )}>
                    {activeVariance > 0 ? '+' : ''}{activeVariance}
                  </span>
                  <span className={cn(
                    "ml-2",
                    activeVariance > 0 ? "text-amber-600" : "text-red-600"
                  )}>
                    variance
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 safe-area-bottom">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={handleUseExpected}
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Use Expected
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleSaveAndAdvance}
                disabled={actionLoading !== null}
              >
                {actionLoading?.startsWith('count-') ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Check className="mr-2 h-5 w-5" />
                )}
                Save
              </Button>
            </div>
          </div>

          {/* Success Animation Overlay */}
          {showSaveSuccess && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
              <div className="animate-bounce">
                <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                  <Check className="h-12 w-12 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Bottom Sheet */}
      {showDetails && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl animate-slide-up">
            {/* Handle */}
            <div className="w-12 h-1.5 rounded-full bg-neutral-300 mx-auto mt-3" />

            <div className="p-6 pb-safe space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Details</h3>

              <div className="space-y-3">
                <DetailRow label="Status" value={
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    statusColors[stockCount.status]
                  )}>
                    {statusLabels[stockCount.status]}
                  </span>
                } />
                <DetailRow
                  label="Scope"
                  value={stockCount.scope_type === 'folder' && stockCount.scope_folder
                    ? stockCount.scope_folder.name
                    : scopeLabels[stockCount.scope_type]}
                />
                <DetailRow
                  label="Assigned To"
                  value={stockCount.assigned_to_profile?.full_name || '-'}
                />
                <DetailRow
                  label="Due Date"
                  value={stockCount.due_date ? <FormattedShortDate date={stockCount.due_date} /> : '-'}
                />
                <DetailRow
                  label="Created By"
                  value={stockCount.created_by_profile?.full_name || '-'}
                />
              </div>

              {stockCount.notes && (
                <div className="pt-4 border-t border-neutral-200">
                  <p className="text-sm text-neutral-500 mb-1">Notes</p>
                  <p className="text-neutral-900">{stockCount.notes}</p>
                </div>
              )}

              <Button variant="outline" className="w-full mt-4" onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Chatter Panel - only show for non-draft (started) counts */}
      {!isDraft && currentUserId && (
        <div className="px-4 py-6">
          <ChatterPanel
            entityType="stock_count"
            entityId={stockCount.id}
            entityName={stockCount.display_id || stockCount.name || `Stock Count ${stockCount.id.slice(0, 8)}`}
            currentUserId={currentUserId}
          />
        </div>
      )}

      {/* Completion Modal */}
      <CompletionModal
        open={showCompletion}
        onClose={() => setShowCompletion(false)}
        onComplete={handleComplete}
        countedItems={countedItemsCount}
        totalItems={totalItems}
        variances={varianceSummary}
      />
    </div>
  )
}

// Sub-components

function PendingItemCard({
  item,
  isNext,
  onTap
}: {
  item: StockCountItemWithDetails
  isNext: boolean
  onTap: () => void
}) {
  return (
    <button
      onClick={onTap}
      className={cn(
        "relative w-full p-4 rounded-2xl bg-white border-2 text-left",
        isNext
          ? "border-primary/30 shadow-lg shadow-primary/10"
          : "border-neutral-200 shadow-sm",
        "transition-all active:scale-[0.98]"
      )}
    >
      {/* Next indicator */}
      {isNext && (
        <div className="absolute -left-[2px] top-1/2 -translate-y-1/2">
          <div className="w-1.5 h-10 rounded-r-full bg-primary" />
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Image */}
        <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {item.item_image ? (
            <Image
              src={item.item_image}
              alt={item.item_name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="h-7 w-7 text-neutral-300" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 truncate">{item.item_name}</p>
          {item.item_sku && (
            <p className="text-sm text-neutral-500 truncate">SKU: {item.item_sku}</p>
          )}
          <p className="mt-1 text-sm text-neutral-600">
            Expected: <span className="font-semibold">{item.expected_quantity}</span>
          </p>
        </div>

        {/* Tap prompt */}
        <div className="flex-shrink-0">
          <div className={cn(
            "px-3 py-1.5 rounded-full font-semibold text-xs uppercase tracking-wide",
            isNext
              ? "bg-primary text-white"
              : "bg-neutral-100 text-neutral-600"
          )}>
            {isNext ? 'Count' : 'Tap'}
          </div>
        </div>
      </div>
    </button>
  )
}

function CountedItemRow({
  item,
  onTap
}: {
  item: StockCountItemWithDetails
  onTap?: () => void
}) {
  const hasVariance = item.variance !== null && item.variance !== 0

  return (
    <button
      onClick={onTap}
      disabled={!onTap}
      className={cn(
        "w-full p-3 rounded-xl bg-white border text-left flex items-center gap-3",
        hasVariance ? "border-amber-200 bg-amber-50/50" : "border-neutral-200",
        onTap && "hover:bg-neutral-50 active:scale-[0.99]",
        !onTap && "cursor-default"
      )}
    >
      {/* Image */}
      <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {item.item_image ? (
          <Image
            src={item.item_image}
            alt={item.item_name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-5 w-5 text-neutral-300" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-neutral-900 truncate text-sm">{item.item_name}</p>
        <p className="text-xs text-neutral-500">
          Expected: {item.expected_quantity}
        </p>
      </div>

      {/* Count result */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-neutral-900">{item.counted_quantity}</p>
        {hasVariance && (
          <p className={cn(
            "text-xs font-medium",
            item.variance! > 0 ? "text-amber-600" : "text-red-600"
          )}>
            {item.variance! > 0 ? '+' : ''}{item.variance}
          </p>
        )}
      </div>

      {/* Status */}
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
    </button>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-neutral-500 text-sm">{label}</span>
      <span className="text-neutral-900 text-sm font-medium">{value}</span>
    </div>
  )
}
