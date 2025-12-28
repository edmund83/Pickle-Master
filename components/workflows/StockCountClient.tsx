'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, ClipboardCheck, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import { createStockCount } from '@/app/actions/stock-counts'
import type { StockCountWithRelations } from '@/app/actions/stock-counts'

interface StockCountClientProps {
  stockCounts: StockCountWithRelations[]
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

type SortColumn = 'display_id' | 'name' | 'status' | 'scope_type' | 'assigned_to' | 'due_date' | 'progress' | 'created_at'
type SortDirection = 'asc' | 'desc'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right' }[] = [
  { key: 'display_id', label: 'Stock Count #' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'scope_type', label: 'Scope' },
  { key: 'progress', label: 'Progress', align: 'right' },
  { key: 'assigned_to', label: 'Assigned To' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'created_at', label: 'Created' },
]

export function StockCountClient({ stockCounts }: StockCountClientProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [sortColumn, setSortColumn] = useState<SortColumn>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const sortedStockCounts = useMemo(() => {
    return [...stockCounts].sort((a, b) => {
      let aVal: string | number | null = null
      let bVal: string | number | null = null

      switch (sortColumn) {
        case 'display_id':
          aVal = a.display_id || ''
          bVal = b.display_id || ''
          break
        case 'name':
          aVal = a.name || ''
          bVal = b.name || ''
          break
        case 'status':
          aVal = a.status || ''
          bVal = b.status || ''
          break
        case 'scope_type':
          aVal = a.scope_type || ''
          bVal = b.scope_type || ''
          break
        case 'progress':
          aVal = a.total_items > 0 ? a.counted_items / a.total_items : 0
          bVal = b.total_items > 0 ? b.counted_items / b.total_items : 0
          break
        case 'assigned_to':
          aVal = a.assigned_to_profile?.full_name || ''
          bVal = b.assigned_to_profile?.full_name || ''
          break
        case 'due_date':
          aVal = a.due_date || ''
          bVal = b.due_date || ''
          break
        case 'created_at':
          aVal = a.created_at || ''
          bVal = b.created_at || ''
          break
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal || '')
      const bStr = String(bVal || '')
      const comparison = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [stockCounts, sortColumn, sortDirection])

  async function handleCreateNew() {
    setIsCreating(true)
    try {
      const result = await createStockCount({})
      if (result.success && result.id) {
        router.push(`/workflows/stock-count/${result.id}`)
      } else {
        console.error('Failed to create stock count:', result.error)
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating stock count:', error)
      setIsCreating(false)
    }
  }

  function handleRowClick(stockCountId: string) {
    router.push(`/workflows/stock-count/${stockCountId}`)
  }

  function getProgressDisplay(counted: number, total: number) {
    if (total === 0) return { text: '-', percent: 0 }
    const percent = Math.round((counted / total) * 100)
    return { text: `${counted}/${total}`, percent }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/workflows/inventory-operations">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Stock Count</h1>
              <p className="text-neutral-500">Conduct inventory audits and reconciliation</p>
            </div>
          </div>
          <Button onClick={handleCreateNew} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Stock Count
          </Button>
        </div>

        <div className="p-6">
          {stockCounts.length > 0 ? (
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
                          <div className={`flex items-center gap-1 ${header.align === 'right' ? 'justify-end' : ''}`}>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {sortedStockCounts.map((sc) => {
                      const progress = getProgressDisplay(sc.counted_items, sc.total_items)
                      return (
                        <tr
                          key={sc.id}
                          className="cursor-pointer hover:bg-neutral-50 transition-colors"
                          onClick={() => handleRowClick(sc.id)}
                        >
                          <td className="px-4 py-3 font-medium text-neutral-900">
                            {sc.display_id || `SC-${sc.id.slice(0, 8)}`}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {sc.name || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[sc.status]}`}
                            >
                              {statusLabels[sc.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {sc.scope_type === 'folder' && sc.scope_folder
                              ? sc.scope_folder.name
                              : scopeLabels[sc.scope_type]}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-neutral-600">{progress.text}</span>
                              {sc.total_items > 0 && (
                                <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-pickle-500 rounded-full transition-all"
                                    style={{ width: `${progress.percent}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {sc.assigned_to_profile?.full_name || '-'}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {sc.due_date ? <FormattedShortDate date={sc.due_date} /> : '-'}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {sc.created_at ? <FormattedShortDate date={sc.created_at} /> : '-'}
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
                  <ClipboardCheck className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-neutral-900">No stock counts yet</h3>
                <p className="mt-1 text-neutral-500">Create your first stock count to audit inventory.</p>
                <Button className="mt-4" onClick={handleCreateNew} disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create Stock Count
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
