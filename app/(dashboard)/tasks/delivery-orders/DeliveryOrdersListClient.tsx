'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, Search, Filter, X, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import type { PaginatedDeliveryOrdersResult, DeliveryOrderListItem } from '@/app/actions/delivery-orders'

interface DeliveryOrdersListClientProps {
  initialData: PaginatedDeliveryOrdersResult
  initialFilters: {
    status: string
    search: string
    sortColumn: string
    sortDirection: 'asc' | 'desc'
  }
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  ready: 'Ready',
  dispatched: 'Dispatched',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  partial: 'Partial',
  failed: 'Failed',
  returned: 'Returned',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  ready: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-purple-100 text-purple-700',
  in_transit: 'bg-amber-100 text-amber-700',
  delivered: 'bg-green-100 text-green-700',
  partial: 'bg-orange-100 text-orange-700',
  failed: 'bg-red-100 text-red-700',
  returned: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-neutral-200 text-neutral-600',
}

const statusOptions = ['draft', 'ready', 'dispatched', 'in_transit', 'delivered', 'partial', 'failed', 'returned', 'cancelled']

type SortColumn = 'display_id' | 'status' | 'carrier' | 'scheduled_date' | 'updated_at' | 'created_at'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right'; hideOnMobile?: boolean }[] = [
  { key: 'display_id', label: 'DO #' },
  { key: 'status', label: 'Status' },
  { key: 'carrier', label: 'Carrier', hideOnMobile: true },
  { key: 'scheduled_date', label: 'Scheduled', hideOnMobile: true },
  { key: 'updated_at', label: 'Last Updated', hideOnMobile: true },
]

export function DeliveryOrdersListClient({
  initialData,
  initialFilters
}: DeliveryOrdersListClientProps) {
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

  const clearFilters = () => {
    setSearchInput('')
    updateFilters({ status: undefined, search: undefined })
  }

  const goToPage = (page: number) => {
    updateFilters({ page: page.toString() })
  }

  const hasActiveFilters = initialFilters.status || initialFilters.search

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks/fulfillment">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-neutral-200" />
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Delivery Orders</h1>
              <p className="mt-1 text-neutral-500">
                {initialData.total} order{initialData.total !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search DO #, tracking..."
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
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
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
      <div className="flex-1 overflow-auto relative">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

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
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-left hidden md:table-cell">
                Sales Order
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-left hidden md:table-cell">
                Destination
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {initialData.data.length === 0 ? (
              <tr>
                <td colSpan={columnHeaders.length + 2} className="px-4 py-12 text-center text-neutral-500">
                  {hasActiveFilters ? 'No delivery orders match your filters' : 'No delivery orders yet'}
                </td>
              </tr>
            ) : (
              initialData.data.map((doItem) => (
                <tr
                  key={doItem.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`View delivery order ${doItem.display_id || doItem.id.slice(0, 8)}`}
                  className="hover:bg-neutral-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset focus:bg-neutral-50"
                  onClick={() => router.push(`/tasks/delivery-orders/${doItem.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push(`/tasks/delivery-orders/${doItem.id}`)
                    }
                  }}
                >
                  <td className="px-4 py-4 md:py-3 font-medium text-neutral-900">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-neutral-400" />
                      {doItem.display_id || `DO-${doItem.id.slice(0, 8)}`}
                    </div>
                  </td>
                  <td className="px-4 py-4 md:py-3">
                    <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[doItem.status] || 'bg-neutral-100 text-neutral-700'}`}>
                      {statusLabels[doItem.status] || doItem.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    {doItem.carrier || '—'}
                    {doItem.tracking_number && (
                      <span className="ml-2 text-xs text-neutral-400">
                        ({doItem.tracking_number})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    {doItem.scheduled_date ? <FormattedShortDate date={doItem.scheduled_date} /> : '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    <FormattedShortDate date={doItem.updated_at} />
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    {doItem.sales_order_display_id || '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    <div>
                      {doItem.customer_name && (
                        <p className="text-sm font-medium text-neutral-900">{doItem.customer_name}</p>
                      )}
                      {doItem.ship_to_city && (
                        <p className="text-xs text-neutral-500">{doItem.ship_to_city}</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
