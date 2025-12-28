'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Briefcase,
  MapPin,
  Package,
  ChevronUp,
  ChevronDown,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import { CheckoutActions } from '@/app/(dashboard)/tasks/checkouts/checkout-actions'

export interface CheckoutItem {
  id: string
  item_id: string
  item_name: string
  item_sku: string | null
  item_image: string | null
  quantity: number
  assignee_type: 'person' | 'job' | 'location'
  assignee_id: string | null
  assignee_name: string | null
  checked_out_at: string
  due_date: string | null
  status: 'checked_out' | 'returned' | 'overdue'
  returned_at: string | null
  return_condition: string | null
  checked_out_by_name: string | null
  days_overdue: number
}

interface CheckoutsClientProps {
  checkouts: CheckoutItem[]
  stats: {
    active: number
    overdue: number
    returned: number
  }
}

const statusLabels: Record<string, string> = {
  checked_out: 'Active',
  overdue: 'Overdue',
  returned: 'Returned'
}

const statusColors: Record<string, string> = {
  checked_out: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  returned: 'bg-green-100 text-green-700'
}

const assigneeTypeIcons: Record<string, React.ReactNode> = {
  person: <User className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />
}

type SortColumn =
  | 'item_name'
  | 'assignee_name'
  | 'assignee_type'
  | 'quantity'
  | 'checked_out_at'
  | 'due_date'
  | 'status'

type SortDirection = 'asc' | 'desc'
type StatusFilter = 'all' | 'active' | 'overdue' | 'returned'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right' }[] = [
  { key: 'item_name', label: 'Item' },
  { key: 'assignee_name', label: 'Assigned To' },
  { key: 'assignee_type', label: 'Type' },
  { key: 'quantity', label: 'Qty', align: 'right' },
  { key: 'checked_out_at', label: 'Checked Out' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'status', label: 'Status' }
]

const filterLabels: Record<StatusFilter, string> = {
  all: 'All Checkouts',
  active: 'Active',
  overdue: 'Overdue',
  returned: 'Returned'
}

export function CheckoutsClient({ checkouts, stats }: CheckoutsClientProps) {
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState<SortColumn>('checked_out_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const filteredAndSortedCheckouts = useMemo(() => {
    // First filter
    let filtered = checkouts
    if (statusFilter !== 'all') {
      filtered = checkouts.filter((c) => {
        const isOverdue = c.status === 'overdue' || c.days_overdue > 0
        const isReturned = c.status === 'returned'
        const isActive = c.status === 'checked_out' && c.days_overdue === 0

        switch (statusFilter) {
          case 'active':
            return isActive
          case 'overdue':
            return isOverdue && !isReturned
          case 'returned':
            return isReturned
          default:
            return true
        }
      })
    }

    // Then sort
    return [...filtered].sort((a, b) => {
      let aVal: string | number | null = null
      let bVal: string | number | null = null

      switch (sortColumn) {
        case 'item_name':
          aVal = a.item_name
          bVal = b.item_name
          break
        case 'assignee_name':
          aVal = a.assignee_name || ''
          bVal = b.assignee_name || ''
          break
        case 'assignee_type':
          aVal = a.assignee_type
          bVal = b.assignee_type
          break
        case 'quantity':
          aVal = a.quantity
          bVal = b.quantity
          break
        case 'checked_out_at':
          aVal = a.checked_out_at
          bVal = b.checked_out_at
          break
        case 'due_date':
          aVal = a.due_date || ''
          bVal = b.due_date || ''
          break
        case 'status': {
          // Custom order: overdue > active > returned
          const getStatusOrder = (c: CheckoutItem) => {
            if (c.status === 'returned') return 2
            if (c.status === 'overdue' || c.days_overdue > 0) return 0
            return 1
          }
          aVal = getStatusOrder(a)
          bVal = getStatusOrder(b)
          break
        }
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal || '')
      const bStr = String(bVal || '')
      const comparison = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [checkouts, sortColumn, sortDirection, statusFilter])

  const getDisplayStatus = (checkout: CheckoutItem) => {
    if (checkout.status === 'returned') return 'returned'
    if (checkout.status === 'overdue' || checkout.days_overdue > 0) return 'overdue'
    return 'checked_out'
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/tasks/inventory-operations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Check-In / Check-Out</h1>
            <p className="text-neutral-500">Track items assigned to people, jobs, and locations</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              {filterLabels[statusFilter]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(filterLabels) as StatusFilter[]).map((filter) => (
              <DropdownMenuItem
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={statusFilter === filter ? 'bg-neutral-100' : ''}
              >
                {filterLabels[filter]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-6">
        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Active Checkouts</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Overdue Items</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.overdue}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Returned Recently</p>
                <p className="text-2xl font-bold text-neutral-900">{stats.returned}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Datatable */}
        {filteredAndSortedCheckouts.length > 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-neutral-500">
                  <tr>
                    {columnHeaders.map((header) => (
                      <th
                        key={header.key}
                        className={`px-4 py-3 font-medium cursor-pointer hover:bg-neutral-100 transition-colors ${
                          header.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                        onClick={() => handleSort(header.key)}
                      >
                        <div
                          className={`flex items-center gap-1 ${header.align === 'right' ? 'justify-end' : ''}`}
                        >
                          {header.label}
                          {sortColumn === header.key ? (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : (
                            <span className="w-4" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredAndSortedCheckouts.map((checkout) => {
                    const displayStatus = getDisplayStatus(checkout)
                    const isOverdue = displayStatus === 'overdue'
                    const isReturned = displayStatus === 'returned'

                    return (
                      <tr key={checkout.id} className="hover:bg-neutral-50 transition-colors">
                        {/* Item Column */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                              {checkout.item_image ? (
                                <img
                                  src={checkout.item_image}
                                  alt={checkout.item_name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-neutral-400" />
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/inventory/${checkout.item_id}`}
                                className="font-medium text-neutral-900 hover:text-pickle-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {checkout.item_name}
                              </Link>
                              {checkout.item_sku && (
                                <p className="text-xs text-neutral-500">{checkout.item_sku}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Assignee Column */}
                        <td className="px-4 py-3 text-neutral-600">
                          <div className="flex items-center gap-2">
                            {assigneeTypeIcons[checkout.assignee_type]}
                            {checkout.assignee_name || 'Unknown'}
                          </div>
                        </td>

                        {/* Assignee Type Column */}
                        <td className="px-4 py-3 text-neutral-600 capitalize">
                          {checkout.assignee_type}
                        </td>

                        {/* Quantity Column */}
                        <td className="px-4 py-3 text-right text-neutral-600">{checkout.quantity}</td>

                        {/* Checked Out Date Column */}
                        <td className="px-4 py-3 text-neutral-600">
                          <FormattedShortDate date={checkout.checked_out_at} />
                        </td>

                        {/* Due Date Column */}
                        <td className="px-4 py-3">
                          {checkout.due_date ? (
                            <span className={isOverdue ? 'font-medium text-red-600' : 'text-neutral-600'}>
                              <FormattedShortDate date={checkout.due_date} />
                              {isOverdue && (
                                <span className="block text-xs">
                                  {checkout.days_overdue} day{checkout.days_overdue !== 1 ? 's' : ''}{' '}
                                  overdue
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-neutral-400">-</span>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[displayStatus]}`}
                          >
                            {statusLabels[displayStatus]}
                          </span>
                        </td>

                        {/* Actions Column */}
                        <td className="px-4 py-3">
                          {!isReturned && (
                            <CheckoutActions
                              checkout={{
                                id: checkout.id,
                                item_id: checkout.item_id,
                                item_name: checkout.item_name,
                                quantity: checkout.quantity,
                                assignee_type: checkout.assignee_type,
                                assignee_name: checkout.assignee_name,
                                checked_out_at: checkout.checked_out_at,
                                due_date: checkout.due_date,
                                is_overdue: isOverdue
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <Package className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900">
                {statusFilter !== 'all' ? `No ${filterLabels[statusFilter].toLowerCase()}` : 'No checkouts yet'}
              </h3>
              <p className="mt-1 text-center text-neutral-500">
                Check out items from the inventory page to track assignments.
              </p>
              <Link href="/inventory">
                <Button className="mt-4">Go to Inventory</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
