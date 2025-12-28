'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'

interface ReceiveWithRelations {
  id: string
  display_id: string | null
  status: 'draft' | 'completed' | 'cancelled'
  received_date: string
  delivery_note_number: string | null
  carrier: string | null
  tracking_number: string | null
  completed_at: string | null
  created_at: string
  purchase_orders: {
    id: string
    display_id: string | null
    order_number: string | null
    vendors: { name: string } | null
  } | null
  profiles: { full_name: string | null } | null
}

interface ReceivesClientProps {
  receives: ReceiveWithRelations[]
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

type SortColumn = 'display_id' | 'purchase_order' | 'vendor' | 'status' | 'received_date' | 'delivery_note'
type SortDirection = 'asc' | 'desc'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right' }[] = [
  { key: 'display_id', label: 'Receive #' },
  { key: 'purchase_order', label: 'Purchase Order' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'status', label: 'Status' },
  { key: 'received_date', label: 'Received Date' },
  { key: 'delivery_note', label: 'Delivery Note' },
]

export function ReceivesClient({ receives }: ReceivesClientProps) {
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState<SortColumn>('received_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const sortedReceives = useMemo(() => {
    return [...receives].sort((a, b) => {
      let aVal: string = ''
      let bVal: string = ''

      switch (sortColumn) {
        case 'display_id':
          aVal = a.display_id || a.id
          bVal = b.display_id || b.id
          break
        case 'purchase_order':
          aVal = a.purchase_orders?.display_id || a.purchase_orders?.order_number || ''
          bVal = b.purchase_orders?.display_id || b.purchase_orders?.order_number || ''
          break
        case 'vendor':
          aVal = a.purchase_orders?.vendors?.name || ''
          bVal = b.purchase_orders?.vendors?.name || ''
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        case 'received_date':
          aVal = a.received_date || ''
          bVal = b.received_date || ''
          break
        case 'delivery_note':
          aVal = a.delivery_note_number || ''
          bVal = b.delivery_note_number || ''
          break
      }

      const comparison = aVal.localeCompare(bVal)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [receives, sortColumn, sortDirection])

  function handleRowClick(receiveId: string) {
    router.push(`/tasks/receives/${receiveId}`)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/tasks/inbound">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Receiving</h1>
            <p className="text-neutral-500">Manage goods receiving documents from purchase orders</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {receives.length > 0 ? (
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
                  {sortedReceives.map((receive) => (
                    <tr
                      key={receive.id}
                      className="cursor-pointer hover:bg-neutral-50 transition-colors"
                      onClick={() => handleRowClick(receive.id)}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {receive.display_id || receive.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {receive.purchase_orders?.display_id || receive.purchase_orders?.order_number || '-'}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {receive.purchase_orders?.vendors?.name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[receive.status]}`}
                        >
                          {statusLabels[receive.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {receive.received_date ? <FormattedShortDate date={receive.received_date} /> : '-'}
                      </td>
                      <td className="px-4 py-3 text-neutral-600">
                        {receive.delivery_note_number || '-'}
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
                <Package className="h-8 w-8 text-neutral-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-neutral-900">No receives yet</h3>
              <p className="mt-1 text-neutral-500">Create a receive from a pending purchase order.</p>
              <Link href="/tasks/purchase-orders">
                <Button className="mt-4">
                  View Purchase Orders
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
