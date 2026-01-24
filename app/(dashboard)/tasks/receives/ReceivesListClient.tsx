'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, Search, Filter, X, Plus, RotateCcw, FileText, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import { type PaginatedReceivesResult, type ReceiveListItem, type ReceiveSourceType } from '@/app/actions/receives'

interface ReceivesListClientProps {
  initialData: PaginatedReceivesResult
  initialFilters: {
    status: string
    sourceType: string
    purchaseOrderId: string
    search: string
    sortColumn: string
    sortDirection: 'asc' | 'desc'
  }
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusOptions = ['draft', 'completed', 'cancelled']

const sourceTypeLabels: Record<string, string> = {
  purchase_order: 'From PO',
  customer_return: 'Return',
  stock_adjustment: 'Adjustment',
}

const sourceTypeColors: Record<string, string> = {
  purchase_order: 'bg-purple-100 text-purple-700',
  customer_return: 'bg-orange-100 text-orange-700',
  stock_adjustment: 'bg-cyan-100 text-cyan-700',
}

const sourceTypeOptions: ReceiveSourceType[] = ['purchase_order', 'customer_return', 'stock_adjustment']

type SortColumn = 'display_id' | 'po_display_id' | 'vendor_name' | 'status' | 'received_date' | 'delivery_note_number' | 'created_at'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right'; hideOnMobile?: boolean }[] = [
  { key: 'display_id', label: 'Receive #' },
  { key: 'po_display_id', label: 'Source' },
  { key: 'vendor_name', label: 'Vendor', hideOnMobile: true },
  { key: 'status', label: 'Status' },
  { key: 'received_date', label: 'Received Date', hideOnMobile: true },
  { key: 'delivery_note_number', label: 'Delivery Note', hideOnMobile: true },
  { key: 'created_at', label: 'Created', hideOnMobile: true },
]

export function ReceivesListClient({
  initialData,
  initialFilters
}: ReceivesListClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Local state for inputs
  const [searchInput, setSearchInput] = useState(initialFilters.search)

  // Create URL with updated params
  const createUrl = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Reset to page 1 when filters change (except when changing page itself)
    if (!('page' in updates)) {
      params.delete('page')
    }

    return `${pathname}?${params.toString()}`
  }, [pathname, searchParams])

  // Navigation helpers
  const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
    startTransition(() => {
      router.push(createUrl(updates))
    })
  }, [router, createUrl])

  const handleSort = (column: SortColumn) => {
    const newDirection = initialFilters.sortColumn === column && initialFilters.sortDirection === 'desc' ? 'asc' : 'desc'
    updateFilters({ sort: column, order: newDirection })
  }

  const handleSearch = useCallback(() => {
    updateFilters({ search: searchInput || undefined })
  }, [searchInput, updateFilters])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleStatusFilter = (status: string | undefined) => {
    updateFilters({ status })
  }

  const handleSourceTypeFilter = (sourceType: string | undefined) => {
    updateFilters({ source: sourceType })
  }

  const clearFilters = () => {
    setSearchInput('')
    updateFilters({ status: undefined, source: undefined, po: undefined, search: undefined })
  }

  const goToPage = (page: number) => {
    updateFilters({ page: page.toString() })
  }

  const hasActiveFilters = initialFilters.status || initialFilters.sourceType || initialFilters.purchaseOrderId || initialFilters.search

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/inbound">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-neutral-200" />
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Receiving</h1>
              <p className="mt-1 text-neutral-500">
                {initialData.total} receive{initialData.total !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          </div>
          <Link href="/tasks/receives/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Receive
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search receive #, delivery note..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={handleSearch}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
                {initialFilters.status && (
                  <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-white">
                    {statusLabels[initialFilters.status]}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusFilter(undefined)}>
                All Statuses
              </DropdownMenuItem>
              {statusOptions.map(status => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                >
                  <span className={`mr-2 rounded px-1.5 py-0.5 text-xs ${statusColors[status]}`}>
                    {statusLabels[status]}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Source Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Package className="h-4 w-4" />
                Type
                {initialFilters.sourceType && (
                  <span className={`rounded px-1.5 py-0.5 text-xs ${sourceTypeColors[initialFilters.sourceType]}`}>
                    {sourceTypeLabels[initialFilters.sourceType]}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSourceTypeFilter(undefined)}>
                All Types
              </DropdownMenuItem>
              {sourceTypeOptions.map(sourceType => (
                <DropdownMenuItem
                  key={sourceType}
                  onClick={() => handleSourceTypeFilter(sourceType)}
                >
                  <span className={`mr-2 rounded px-1.5 py-0.5 text-xs ${sourceTypeColors[sourceType]}`}>
                    {sourceTypeLabels[sourceType]}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {initialData.data.length === 0 ? (
          <div className="p-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <Package className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-neutral-900">
                  {hasActiveFilters ? 'No receives match your filters' : 'No receives yet'}
                </h3>
                <p className="mt-1 text-center text-neutral-500 max-w-sm">
                  Create a receive from a purchase order, or start a new receive for customer returns and adjustments.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link href="/tasks/purchase-orders">
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      From Purchase Order
                    </Button>
                  </Link>
                  <Link href="/tasks/receives/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Receive
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0 z-10">
              <tr>
                {columnHeaders.map(({ key, label, align, hideOnMobile }) => (
                  <th
                    key={key}
                    className={`px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 ${
                      align === 'right' ? 'text-right' : 'text-left'
                    } ${hideOnMobile ? 'hidden md:table-cell' : ''}`}
                    onClick={() => handleSort(key)}
                  >
                    <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
                      {label}
                      {initialFilters.sortColumn === key && (
                        initialFilters.sortDirection === 'asc'
                          ? <ChevronUp className="h-4 w-4" />
                          : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {initialData.data.map((receive) => (
                <tr
                  key={receive.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`View receive ${receive.display_id || receive.id.slice(0, 8)}`}
                  className="hover:bg-neutral-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset focus:bg-neutral-50"
                  onClick={() => router.push(`/tasks/receives/${receive.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push(`/tasks/receives/${receive.id}`)
                    }
                  }}
                >
                  <td className="px-4 py-4 md:py-3 font-medium text-neutral-900">
                    {receive.display_id || receive.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-4 md:py-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${sourceTypeColors[receive.source_type] || 'bg-neutral-100 text-neutral-700'}`}>
                        {sourceTypeLabels[receive.source_type] || 'PO'}
                      </span>
                      {receive.po_display_id && (
                        <span className="text-neutral-600 text-sm">{receive.po_display_id}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    {receive.vendor_name || '—'}
                  </td>
                  <td className="px-4 py-4 md:py-3">
                    <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[receive.status] || 'bg-neutral-100 text-neutral-700'}`}>
                      {statusLabels[receive.status] || receive.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    {receive.received_date ? <FormattedShortDate date={receive.received_date} /> : '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    {receive.delivery_note_number || '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    <FormattedShortDate date={receive.created_at} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {initialData.totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-neutral-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">
              Showing {((initialData.page - 1) * initialData.pageSize) + 1}–
              {Math.min(initialData.page * initialData.pageSize, initialData.total)} of {initialData.total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(initialData.page - 1)}
                disabled={initialData.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-neutral-600">
                Page {initialData.page} of {initialData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(initialData.page + 1)}
                disabled={initialData.page === initialData.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
