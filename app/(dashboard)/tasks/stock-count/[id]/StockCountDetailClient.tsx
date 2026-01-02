'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
  Search,
  ClipboardCheck,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import {
  startStockCount,
  recordCount,
  submitForReview,
  completeStockCount,
  cancelStockCount
} from '@/app/actions/stock-counts'
import type { StockCountWithRelations, StockCountItemWithDetails } from '@/app/actions/stock-counts'
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

interface StockCountDetailClientProps {
  data: StockCountData
  teamMembers: TeamMember[]
  folders: Folder[]
  currentUserId: string | null
}

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="h-5 w-5 text-neutral-400" />,
  in_progress: <Clock className="h-5 w-5 text-blue-500" />,
  review: <Eye className="h-5 w-5 text-amber-500" />,
  completed: <CheckCircle className="h-5 w-5 text-green-500" />,
  cancelled: <XCircle className="h-5 w-5 text-red-500" />,
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

export function StockCountDetailClient({ data, teamMembers, folders, currentUserId }: StockCountDetailClientProps) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [countingItemId, setCountingItemId] = useState<string | null>(null)
  const [countValue, setCountValue] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [applyAdjustments, setApplyAdjustments] = useState(false)

  const stockCount = data.stock_count
  const items = data.items || []

  const isDraft = stockCount.status === 'draft'
  const isInProgress = stockCount.status === 'in_progress'
  const isReview = stockCount.status === 'review'
  const isCompleted = stockCount.status === 'completed'
  const isCancelled = stockCount.status === 'cancelled'
  const isActive = isInProgress || isReview

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item =>
      item.item_name.toLowerCase().includes(query) ||
      (item.item_sku && item.item_sku.toLowerCase().includes(query))
    )
  }, [items, searchQuery])

  // Calculate stats
  const totalItems = items.length
  const countedItems = items.filter(item => item.status !== 'pending').length
  const varianceItems = items.filter(item => item.variance !== null && item.variance !== 0).length
  const pendingItems = items.filter(item => item.status === 'pending').length

  async function handleStart() {
    setActionLoading('start')
    try {
      const result = await startStockCount(stockCount.id)
      if (result.success) {
        router.refresh()
      } else {
        console.error('Failed to start stock count:', result.error)
      }
    } catch (error) {
      console.error('Error starting stock count:', error)
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
      } else {
        console.error('Failed to submit for review:', result.error)
      }
    } catch (error) {
      console.error('Error submitting for review:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleComplete() {
    setActionLoading('complete')
    try {
      const result = await completeStockCount(stockCount.id, applyAdjustments)
      if (result.success) {
        router.refresh()
      } else {
        console.error('Failed to complete stock count:', result.error)
      }
    } catch (error) {
      console.error('Error completing stock count:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this stock count? This action cannot be undone.')) {
      return
    }
    setActionLoading('cancel')
    try {
      const result = await cancelStockCount(stockCount.id)
      if (result.success) {
        router.push('/tasks/stock-count')
      } else {
        console.error('Failed to cancel stock count:', result.error)
      }
    } catch (error) {
      console.error('Error cancelling stock count:', error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRecordCount(itemId: string) {
    const quantity = parseInt(countValue, 10)
    if (isNaN(quantity) || quantity < 0) {
      return
    }

    setActionLoading(`count-${itemId}`)
    try {
      const result = await recordCount(itemId, quantity)
      if (result.success) {
        setCountingItemId(null)
        setCountValue('')
        router.refresh()
      } else {
        console.error('Failed to record count:', result.error)
      }
    } catch (error) {
      console.error('Error recording count:', error)
    } finally {
      setActionLoading(null)
    }
  }

  function startCounting(item: StockCountItemWithDetails) {
    setCountingItemId(item.id)
    setCountValue(item.counted_quantity?.toString() || '')
  }

  function getVarianceClass(variance: number | null) {
    if (variance === null || variance === 0) return 'text-neutral-600'
    return variance > 0 ? 'text-green-600' : 'text-red-600'
  }

  function getVarianceText(variance: number | null) {
    if (variance === null) return '-'
    if (variance === 0) return '0'
    return variance > 0 ? `+${variance}` : `${variance}`
  }

  return (
    <div className="flex-1 w-full overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/stock-count">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              {statusIcons[stockCount.status]}
              <div>
                <h1 className="text-xl font-semibold text-neutral-900">
                  {stockCount.display_id || `SC-${stockCount.id.slice(0, 8)}`}
                </h1>
                {stockCount.name && (
                  <p className="text-neutral-500">{stockCount.name}</p>
                )}
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[stockCount.status]}`}>
                {statusLabels[stockCount.status]}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isDraft && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'cancel' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Ban className="mr-2 h-4 w-4" />
                  )}
                  Cancel
                </Button>
                <Button
                  onClick={handleStart}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'start' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Start Counting
                </Button>
              </>
            )}
            {isInProgress && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={actionLoading !== null}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitForReview}
                  disabled={actionLoading !== null || pendingItems > 0}
                >
                  {actionLoading === 'review' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  Submit for Review
                </Button>
              </>
            )}
            {isReview && (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={applyAdjustments}
                    onChange={(e) => setApplyAdjustments(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  Apply adjustments to inventory
                </label>
                <Button
                  onClick={handleComplete}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'complete' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Complete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                  <Package className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{totalItems}</p>
                  <p className="text-sm text-neutral-500">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{countedItems}</p>
                  <p className="text-sm text-green-600">Counted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{pendingItems}</p>
                  <p className="text-sm text-blue-600">Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">{varianceItems}</p>
                  <p className="text-sm text-amber-600">Variances</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {totalItems > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">Progress</span>
                <span className="text-sm text-neutral-600">
                  {countedItems} of {totalItems} ({Math.round((countedItems / totalItems) * 100)}%)
                </span>
              </div>
              <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(countedItems / totalItems) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Cards - horizontal layout with details inline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-neutral-500 block mb-1">Scope</span>
                <span className="text-neutral-900 font-medium">
                  {stockCount.scope_type === 'folder' && stockCount.scope_folder
                    ? stockCount.scope_folder.name
                    : scopeLabels[stockCount.scope_type]}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Assigned To</span>
                <span className="text-neutral-900 font-medium">
                  {stockCount.assigned_to_profile?.full_name || '-'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Due Date</span>
                <span className="text-neutral-900 font-medium">
                  {stockCount.due_date ? <FormattedShortDate date={stockCount.due_date} /> : '-'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Created By</span>
                <span className="text-neutral-900 font-medium">
                  {stockCount.created_by_profile?.full_name || '-'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Created At</span>
                <span className="text-neutral-900 font-medium">
                  {stockCount.created_at ? <FormattedShortDate date={stockCount.created_at} /> : '-'}
                </span>
              </div>
            </div>
            {stockCount.notes && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <span className="text-neutral-500 text-sm block mb-1">Notes</span>
                <p className="text-sm text-neutral-900">{stockCount.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Items List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Items to Count ({filteredItems.length})
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredItems.length > 0 ? (
              <>
                {/* Table Header */}
                <div className="hidden sm:grid sm:grid-cols-[auto_1fr_100px_100px_100px_100px] gap-4 px-4 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  <div className="w-12"></div>
                  <div>Item</div>
                  <div className="text-center">Expected</div>
                  <div className="text-center">Counted</div>
                  <div className="text-center">Status</div>
                  <div className="text-center">Action</div>
                </div>
                <div className="divide-y divide-neutral-200">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-1 sm:grid-cols-[auto_1fr_100px_100px_100px_100px] gap-4 p-4 items-center hover:bg-neutral-50 ${
                        item.status !== 'pending' ? 'bg-neutral-50/50' : ''
                      }`}
                    >
                      {/* Item Image */}
                      <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 flex-shrink-0">
                        {item.item_image ? (
                          <Image
                            src={item.item_image}
                            alt={item.item_name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-neutral-400" />
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="min-w-0">
                        <Link
                          href={`/inventory/${item.item_id}`}
                          className="font-medium text-neutral-900 hover:text-primary truncate block"
                        >
                          {item.item_name}
                        </Link>
                        {item.item_sku && (
                          <span className="text-sm text-neutral-500">SKU: {item.item_sku}</span>
                        )}
                      </div>

                      {/* Expected */}
                      <div className="text-center">
                        <span className="sm:hidden text-xs text-neutral-500 mr-1">Expected:</span>
                        <span className="font-medium text-neutral-700">{item.expected_quantity}</span>
                      </div>

                      {/* Counted */}
                      <div className="text-center">
                        {isInProgress && countingItemId === item.id ? (
                          <div className="flex items-center gap-1 justify-center">
                            <Input
                              type="number"
                              min="0"
                              value={countValue}
                              onChange={(e) => setCountValue(e.target.value)}
                              className="w-20 h-8 text-center text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleRecordCount(item.id)
                                } else if (e.key === 'Escape') {
                                  setCountingItemId(null)
                                  setCountValue('')
                                }
                              }}
                            />
                          </div>
                        ) : item.counted_quantity !== null ? (
                          <div>
                            <span className="font-semibold text-neutral-900">{item.counted_quantity}</span>
                            {item.variance !== null && item.variance !== 0 && (
                              <span className={`ml-1 text-sm ${getVarianceClass(item.variance)}`}>
                                ({getVarianceText(item.variance)})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.status === 'pending'
                              ? 'bg-neutral-100 text-neutral-600'
                              : item.status === 'counted'
                              ? 'bg-blue-100 text-blue-700'
                              : item.status === 'verified'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="text-center">
                        {isInProgress && countingItemId === item.id ? (
                          <div className="flex items-center gap-1 justify-center">
                            <Button
                              size="sm"
                              className="h-8 px-3"
                              onClick={() => handleRecordCount(item.id)}
                              disabled={actionLoading === `count-${item.id}`}
                            >
                              {actionLoading === `count-${item.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() => {
                                setCountingItemId(null)
                                setCountValue('')
                              }}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : isInProgress ? (
                          <Button
                            size="sm"
                            variant={item.counted_quantity !== null ? 'ghost' : 'default'}
                            className="h-8"
                            onClick={() => startCounting(item)}
                          >
                            {item.counted_quantity !== null ? 'Recount' : 'Count'}
                          </Button>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-neutral-500">
                {searchQuery ? 'No items match your search' : 'No items in this stock count'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chatter Panel - only show for non-draft (started) counts */}
        {!isDraft && currentUserId && (
          <ChatterPanel
            entityType="stock_count"
            entityId={stockCount.id}
            entityName={stockCount.display_id || stockCount.name || `Stock Count ${stockCount.id.slice(0, 8)}`}
            currentUserId={currentUserId}
            className="mt-6"
          />
        )}
      </div>
    </div>
  )
}
