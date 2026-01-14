'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  ClipboardCheck,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Filter,
  X,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react'
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
import { StockCountWizard } from '@/components/stock-count/wizard/StockCountWizard'
import { type PaginatedStockCountsResult, type StockCountListItem } from '@/app/actions/stock-counts'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

interface Folder {
  id: string
  name: string
  color: string | null
  parent_id: string | null
}

interface StockCountListClientProps {
  initialData: PaginatedStockCountsResult
  teamMembers: TeamMember[]
  folders: Folder[]
  totalItemCount: number
  initialFilters: {
    status: string
    assignedTo: string
    search: string
    sortColumn: string
    sortDirection: 'asc' | 'desc'
  }
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

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="h-4 w-4 text-neutral-400" />,
  in_progress: <Clock className="h-4 w-4 text-blue-500" />,
  review: <Eye className="h-4 w-4 text-amber-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
}

const statusOptions = ['draft', 'in_progress', 'review', 'completed', 'cancelled']

const scopeLabels: Record<string, string> = {
  full: 'Full Inventory',
  folder: 'Folder',
  custom: 'Custom Selection',
}

type SortColumn = 'display_id' | 'name' | 'status' | 'scope_type' | 'due_date' | 'created_at' | 'total_items' | 'counted_items'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right' }[] = [
  { key: 'display_id', label: 'Stock Count #' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'scope_type', label: 'Scope' },
  { key: 'total_items', label: 'Progress', align: 'right' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'created_at', label: 'Created' },
]

export function StockCountListClient({
  initialData,
  teamMembers,
  folders,
  totalItemCount,
  initialFilters
}: StockCountListClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isWizardOpen, setIsWizardOpen] = useState(false)

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
    updateFilters({ status: undefined, assigned: undefined, search: undefined })
  }

  const goToPage = (page: number) => {
    updateFilters({ page: page.toString() })
  }

  const hasActiveFilters = initialFilters.status || initialFilters.assignedTo || initialFilters.search

  const getProgressDisplay = (counted: number, total: number) => {
    if (total === 0) return '0/0'
    const percent = Math.round((counted / total) * 100)
    return `${counted}/${total} (${percent}%)`
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/tasks">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="h-6 w-px bg-neutral-200" />
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Stock Counts</h1>
              <p className="mt-1 text-neutral-500">
                {initialData.total} count{initialData.total !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          </div>
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Stock Count
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search stock count #, name..."
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
                  <ClipboardCheck className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-neutral-900">
                  {hasActiveFilters ? 'No stock counts match your filters' : 'No stock counts yet'}
                </h3>
                <p className="mt-1 text-neutral-500">Create your first stock count to verify inventory accuracy.</p>
                <Button className="mt-4" onClick={() => setIsWizardOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Stock Count
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 sticky top-0 z-10">
              <tr>
                {columnHeaders.map(({ key, label, align }) => (
                  <th
                    key={key}
                    className={`px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 ${
                      align === 'right' ? 'text-right' : 'text-left'
                    }`}
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
              {initialData.data.map((stockCount) => (
                <tr
                  key={stockCount.id}
                  className="hover:bg-neutral-50 cursor-pointer"
                  onClick={() => router.push(`/tasks/stock-count/${stockCount.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {stockCount.display_id || stockCount.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {stockCount.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {statusIcons[stockCount.status]}
                      <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[stockCount.status] || 'bg-neutral-100 text-neutral-700'}`}>
                        {statusLabels[stockCount.status] || stockCount.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {scopeLabels[stockCount.scope_type] || stockCount.scope_type}
                    {stockCount.scope_folder_name && (
                      <span className="ml-1 text-neutral-400">({stockCount.scope_folder_name})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-600">
                    {getProgressDisplay(stockCount.counted_items, stockCount.total_items)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {stockCount.due_date ? <FormattedShortDate date={stockCount.due_date} /> : '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {stockCount.created_at ? <FormattedShortDate date={stockCount.created_at} /> : '—'}
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

      {/* Stock Count Wizard */}
      <StockCountWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        teamMembers={teamMembers}
        folders={folders}
        totalItemCount={totalItemCount}
      />
    </div>
  )
}
