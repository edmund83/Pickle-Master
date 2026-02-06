'use client'

import { useState, useCallback, useTransition, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, Search, Filter, X } from 'lucide-react'
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
import { FormattedOrderAmount } from '@/components/workflows/FormattedOrderAmount'
import { createDraftSalesOrder, type PaginatedSalesOrdersResult, type SalesOrderListItem } from '@/app/actions/sales-orders'

interface Customer {
  id: string
  name: string
}

interface SalesOrdersListClientProps {
  initialData: PaginatedSalesOrdersResult
  customers: Customer[]
  initialFilters: {
    status: string
    customerId: string
    priority: string
    search: string
    sortColumn: string
    sortDirection: 'asc' | 'desc'
  }
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  picking: 'Picking',
  picked: 'Picked',
  partial_shipped: 'Partial Shipped',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  submitted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  picking: 'bg-amber-100 text-amber-700',
  picked: 'bg-yellow-100 text-yellow-700',
  partial_shipped: 'bg-orange-100 text-orange-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-teal-100 text-teal-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const priorityLabels: Record<string, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
}

const priorityColors: Record<string, string> = {
  low: 'bg-neutral-100 text-neutral-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const statusOptions = ['draft', 'submitted', 'confirmed', 'picking', 'picked', 'partial_shipped', 'shipped', 'delivered', 'completed', 'cancelled']
const priorityOptions = ['low', 'normal', 'high', 'urgent']

type SortColumn = 'order_number' | 'customer' | 'total' | 'status' | 'priority' | 'updated_at' | 'created_at' | 'order_date' | 'requested_date'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right'; hideOnMobile?: boolean }[] = [
  { key: 'order_number', label: 'SO #' },
  { key: 'customer', label: 'Customer' },
  { key: 'total', label: 'Order Total', align: 'right', hideOnMobile: true },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority', hideOnMobile: true },
  { key: 'updated_at', label: 'Last Updated', hideOnMobile: true },
  { key: 'requested_date', label: 'Requested', hideOnMobile: true },
]

export function SalesOrdersListClient({
  initialData,
  customers,
  initialFilters
}: SalesOrdersListClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isCreating, setIsCreating] = useState(false)

  // Local state for inputs
  const [searchInput, setSearchInput] = useState(initialFilters.search)
  const isFirstRender = useRef(true)

  // Debounced search: auto-filter as user types
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (searchInput) {
          params.set('search', searchInput)
        } else {
          params.delete('search')
        }
        params.delete('page')
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleStatusFilter = (status: string | undefined) => {
    updateFilters({ status })
  }

  const handleCustomerFilter = (customerId: string | undefined) => {
    updateFilters({ customer: customerId })
  }

  const handlePriorityFilter = (priority: string | undefined) => {
    updateFilters({ priority })
  }

  const clearFilters = () => {
    setSearchInput('')
    updateFilters({ status: undefined, customer: undefined, priority: undefined, search: undefined })
  }

  const goToPage = (page: number) => {
    updateFilters({ page: page.toString() })
  }

  async function handleCreateSalesOrder() {
    setIsCreating(true)
    try {
      const result = await createDraftSalesOrder()
      if (result.success && result.sales_order_id) {
        router.push(`/tasks/sales-orders/${result.sales_order_id}`)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const hasActiveFilters = initialFilters.status || initialFilters.customerId || initialFilters.priority || initialFilters.search
  const selectedCustomer = customers.find(c => c.id === initialFilters.customerId)

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
              <h1 className="text-2xl font-semibold text-neutral-900">Sales Orders</h1>
              <p className="mt-1 text-neutral-500">
                {initialData.total} order{initialData.total !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          </div>
          <Button onClick={handleCreateSalesOrder} disabled={isCreating}>
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            New Sales Order
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search SO #, display ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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

          {/* Customer Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Customer
                {selectedCustomer && (
                  <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-white">
                    {selectedCustomer.name}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              <DropdownMenuLabel>Filter by Customer</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCustomerFilter(undefined)}>
                All Customers
              </DropdownMenuItem>
              {customers.map(customer => (
                <DropdownMenuItem
                  key={customer.id}
                  onClick={() => handleCustomerFilter(customer.id)}
                >
                  {customer.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Priority
                {initialFilters.priority && (
                  <span className={`rounded px-1.5 py-0.5 text-xs ${priorityColors[initialFilters.priority]}`}>
                    {priorityLabels[initialFilters.priority]}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlePriorityFilter(undefined)}>
                All Priorities
              </DropdownMenuItem>
              {priorityOptions.map(priority => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => handlePriorityFilter(priority)}
                >
                  <span className={`mr-2 rounded px-1.5 py-0.5 text-xs ${priorityColors[priority]}`}>
                    {priorityLabels[priority]}
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
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {initialData.data.length === 0 ? (
              <tr>
                <td colSpan={columnHeaders.length} className="px-4 py-12 text-center text-neutral-500">
                  {hasActiveFilters ? 'No sales orders match your filters' : 'No sales orders yet'}
                </td>
              </tr>
            ) : (
              initialData.data.map((so) => (
                <tr
                  key={so.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`View sales order ${so.display_id || so.order_number || so.id.slice(0, 8)}`}
                  className="hover:bg-neutral-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset focus:bg-neutral-50"
                  onClick={() => router.push(`/tasks/sales-orders/${so.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      router.push(`/tasks/sales-orders/${so.id}`)
                    }
                  }}
                >
                  <td className="px-4 py-4 md:py-3 font-medium text-neutral-900">
                    {so.display_id || so.order_number || `SO-${so.id.slice(0, 8)}`}
                  </td>
                  <td className="px-4 py-4 md:py-3 text-neutral-600">
                    {so.customer_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <FormattedOrderAmount amount={so.total ?? 0} />
                  </td>
                  <td className="px-4 py-4 md:py-3">
                    <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[so.status] || 'bg-neutral-100 text-neutral-700'}`}>
                      {statusLabels[so.status] || so.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {so.priority && (
                      <span className={`rounded px-2 py-1 text-xs font-medium ${priorityColors[so.priority] || 'bg-neutral-100 text-neutral-600'}`}>
                        {priorityLabels[so.priority] || so.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    <FormattedShortDate date={so.updated_at} />
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    {so.requested_date ? <FormattedShortDate date={so.requested_date} /> : '—'}
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
