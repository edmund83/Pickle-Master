'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, Search, Filter, X, FileText, Plus, Building2, Receipt } from 'lucide-react'
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
import { useFormatting } from '@/hooks/useFormatting'
import type { PaginatedInvoicesResult, InvoiceListItem } from '@/app/actions/invoices'
import type { Customer } from '@/app/actions/customers'

interface InvoicesListClientProps {
  initialData: PaginatedInvoicesResult
  customers: Customer[]
  initialFilters: {
    status: string
    customerId: string
    search: string
    sortColumn: string
    sortDirection: 'asc' | 'desc'
    invoiceType: 'invoice' | 'credit_note' | 'all'
  }
}

const typeLabels: Record<string, string> = {
  all: 'All Types',
  invoice: 'Invoices',
  credit_note: 'Credit Notes',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  sent: 'Sent',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  void: 'Void',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  pending: 'bg-amber-100 text-amber-700',
  sent: 'bg-blue-100 text-blue-700',
  partial: 'bg-purple-100 text-purple-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-neutral-200 text-neutral-600',
  void: 'bg-neutral-300 text-neutral-700',
}

const statusOptions = ['draft', 'pending', 'sent', 'partial', 'paid', 'overdue', 'cancelled', 'void']

type SortColumn = 'display_id' | 'status' | 'invoice_date' | 'due_date' | 'total' | 'balance_due' | 'updated_at' | 'created_at'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right'; hideOnMobile?: boolean }[] = [
  { key: 'display_id', label: 'Invoice #' },
  { key: 'status', label: 'Status' },
  { key: 'invoice_date', label: 'Date', hideOnMobile: true },
  { key: 'due_date', label: 'Due Date', hideOnMobile: true },
  { key: 'total', label: 'Total', align: 'right', hideOnMobile: true },
  { key: 'balance_due', label: 'Balance', align: 'right' },
]

export function InvoicesListClient({
  initialData,
  customers,
  initialFilters
}: InvoicesListClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const { formatCurrency } = useFormatting()

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

  const handleCustomerFilter = (customerId: string | undefined) => {
    updateFilters({ customer: customerId })
  }

  const handleTypeFilter = (type: string | undefined) => {
    updateFilters({ type: type === 'all' ? undefined : type })
  }

  const clearFilters = () => {
    setSearchInput('')
    updateFilters({ status: undefined, customer: undefined, search: undefined, type: undefined })
  }

  const goToPage = (page: number) => {
    updateFilters({ page: page.toString() })
  }

  const hasActiveFilters = initialFilters.status || initialFilters.customerId || initialFilters.search || (initialFilters.invoiceType && initialFilters.invoiceType !== 'all')

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
              <h1 className="text-2xl font-semibold text-neutral-900">Invoices</h1>
              <p className="mt-1 text-neutral-500">
                {initialData.total} invoice{initialData.total !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          </div>
          <Link href="/tasks/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search invoice #..."
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

          {/* Customer Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Building2 className="h-4 w-4" />
                Customer
                {selectedCustomer && (
                  <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-white truncate max-w-[100px]">
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

          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Receipt className="h-4 w-4" />
                Type
                {initialFilters.invoiceType && initialFilters.invoiceType !== 'all' && (
                  <span className="rounded bg-primary px-1.5 py-0.5 text-xs text-white">
                    {typeLabels[initialFilters.invoiceType]}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleTypeFilter('all')}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeFilter('invoice')}>
                <FileText className="mr-2 h-4 w-4" />
                Invoices
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTypeFilter('credit_note')}>
                <Receipt className="mr-2 h-4 w-4 text-red-500" />
                Credit Notes
              </DropdownMenuItem>
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
                Customer
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-left hidden lg:table-cell">
                Sales Order
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {initialData.data.length === 0 ? (
              <tr>
                <td colSpan={columnHeaders.length + 2} className="px-4 py-12 text-center text-neutral-500">
                  {hasActiveFilters ? 'No invoices match your filters' : 'No invoices yet'}
                </td>
              </tr>
            ) : (
              initialData.data.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  onClick={() => router.push(`/tasks/invoices/${invoice.id}`)}
                  formatCurrency={formatCurrency}
                />
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

interface InvoiceRowProps {
  invoice: InvoiceListItem
  onClick: () => void
  formatCurrency: (value: number | null | undefined) => string
}

function InvoiceRow({ invoice, onClick, formatCurrency }: InvoiceRowProps) {
  const isOverdue = invoice.status !== 'paid' && invoice.due_date && new Date(invoice.due_date) < new Date()

  return (
    <tr
      tabIndex={0}
      role="button"
      aria-label={`View invoice ${invoice.display_id || invoice.id.slice(0, 8)}`}
      className="hover:bg-neutral-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset focus:bg-neutral-50"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <td className="px-4 py-4 md:py-3 font-medium text-neutral-900">
        <div className="flex items-center gap-2">
          {invoice.invoice_type === 'credit_note' ? (
            <Receipt className="h-4 w-4 text-red-500" />
          ) : (
            <FileText className="h-4 w-4 text-neutral-400" />
          )}
          <span className={invoice.invoice_type === 'credit_note' ? 'text-red-700' : ''}>
            {invoice.display_id || `INV-${invoice.id.slice(0, 8)}`}
          </span>
          {invoice.invoice_type === 'credit_note' && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
              Credit
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 md:py-3">
        <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[invoice.status] || 'bg-neutral-100 text-neutral-700'}`}>
          {statusLabels[invoice.status] || invoice.status}
        </span>
      </td>
      <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
        <FormattedShortDate date={invoice.invoice_date} />
      </td>
      <td className={`px-4 py-3 hidden md:table-cell ${isOverdue ? 'text-red-600 font-medium' : 'text-neutral-600'}`}>
        {invoice.due_date ? <FormattedShortDate date={invoice.due_date} /> : '—'}
      </td>
      <td className="px-4 py-3 text-neutral-600 text-right hidden md:table-cell">
        {formatCurrency(invoice.total)}
      </td>
      <td className={`px-4 py-3 text-right ${invoice.balance_due > 0 ? 'text-amber-600 font-medium' : 'text-green-600'}`}>
        {formatCurrency(invoice.balance_due)}
      </td>
      <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
        {invoice.customer_name || '—'}
      </td>
      <td className="px-4 py-3 text-neutral-600 hidden lg:table-cell">
        {invoice.sales_order_display_id || '—'}
      </td>
    </tr>
  )
}
