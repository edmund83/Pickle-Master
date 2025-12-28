'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, ClipboardList, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { PickListWithRelations } from '@/types/database.types'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import { createDraftPickList } from '@/app/actions/pick-lists'

interface PickListsClientProps {
  pickLists: PickListWithRelations[]
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const itemOutcomeLabels: Record<string, string> = {
  decrement: 'Decrement',
  checkout: 'Checkout',
  transfer: 'Transfer',
}

type SortColumn = 'name' | 'assigned_to' | 'due_date' | 'status' | 'item_outcome' | 'updated_at' | 'ship_to_name' | 'assigned_at' | 'created_by' | 'completed_at'
type SortDirection = 'asc' | 'desc'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right' }[] = [
  { key: 'name', label: 'Pick List #' },
  { key: 'assigned_to', label: 'Assigned To' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'status', label: 'Status' },
  { key: 'item_outcome', label: 'Item Outcome' },
  { key: 'updated_at', label: 'Last Updated' },
  { key: 'ship_to_name', label: 'Ship To' },
  { key: 'assigned_at', label: 'Assigned Date' },
  { key: 'created_by', label: 'Created By' },
  { key: 'completed_at', label: 'Picked Date' },
]

export function PickListsClient({ pickLists }: PickListsClientProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [sortColumn, setSortColumn] = useState<SortColumn>('updated_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const sortedPickLists = useMemo(() => {
    return [...pickLists].sort((a, b) => {
      let aVal: string | number | null = null
      let bVal: string | number | null = null

      switch (sortColumn) {
        case 'name':
          aVal = a.pick_list_number || a.name || `PL-${a.id.slice(0, 8)}`
          bVal = b.pick_list_number || b.name || `PL-${b.id.slice(0, 8)}`
          break
        case 'assigned_to':
          aVal = a.assigned_to_profile?.full_name || ''
          bVal = b.assigned_to_profile?.full_name || ''
          break
        case 'due_date':
          aVal = a.due_date || ''
          bVal = b.due_date || ''
          break
        case 'status':
          aVal = a.status || ''
          bVal = b.status || ''
          break
        case 'item_outcome':
          aVal = a.item_outcome || ''
          bVal = b.item_outcome || ''
          break
        case 'updated_at':
          aVal = a.updated_at || ''
          bVal = b.updated_at || ''
          break
        case 'ship_to_name':
          aVal = a.ship_to_name || ''
          bVal = b.ship_to_name || ''
          break
        case 'assigned_at':
          aVal = a.assigned_at || ''
          bVal = b.assigned_at || ''
          break
        case 'created_by':
          aVal = a.created_by_profile?.full_name || ''
          bVal = b.created_by_profile?.full_name || ''
          break
        case 'completed_at':
          aVal = a.completed_at || ''
          bVal = b.completed_at || ''
          break
      }

      const aStr = String(aVal || '')
      const bStr = String(bVal || '')
      const comparison = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [pickLists, sortColumn, sortDirection])

  async function handleCreateNew() {
    setIsCreating(true)
    try {
      const result = await createDraftPickList()
      if (result.success && result.pick_list_id) {
        router.push(`/workflows/pick-lists/${result.pick_list_id}`)
      } else {
        console.error('Failed to create draft pick list:', result.error)
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating draft pick list:', error)
      setIsCreating(false)
    }
  }

  function handleRowClick(pickListId: string) {
    router.push(`/workflows/pick-lists/${pickListId}`)
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/workflows">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Pick Lists</h1>
              <p className="text-neutral-500">Create and manage picking lists</p>
            </div>
          </div>
          <Button onClick={handleCreateNew} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Pick List
          </Button>
        </div>

        <div className="p-6">
          {pickLists.length > 0 ? (
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
                    {sortedPickLists.map((list) => (
                      <tr
                        key={list.id}
                        className="cursor-pointer hover:bg-neutral-50 transition-colors"
                        onClick={() => handleRowClick(list.id)}
                      >
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {list.pick_list_number || list.name || `PL-${list.id.slice(0, 8)}`}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {list.assigned_to_profile?.full_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {list.due_date ? <FormattedShortDate date={list.due_date} /> : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[list.status || 'draft']}`}
                          >
                            {statusLabels[list.status || 'draft']}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {list.item_outcome ? itemOutcomeLabels[list.item_outcome] || list.item_outcome : '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {list.updated_at ? <FormattedShortDate date={list.updated_at} /> : '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {list.ship_to_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {list.assigned_at ? <FormattedShortDate date={list.assigned_at} /> : '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {list.created_by_profile?.full_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {list.completed_at ? <FormattedShortDate date={list.completed_at} /> : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <ClipboardList className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-neutral-900">No pick lists yet</h3>
                <p className="mt-1 text-neutral-500">Create your first pick list to get started.</p>
                <Button className="mt-4" onClick={handleCreateNew} disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create Pick List
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
