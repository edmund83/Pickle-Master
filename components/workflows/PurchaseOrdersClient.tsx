'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, ShoppingCart, ChevronUp, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { PurchaseOrderWithRelations } from '@/types/database.types'
import { FormattedShortDate } from '@/components/formatting/FormattedDate'
import { FormattedOrderAmount } from './FormattedOrderAmount'
import { createDraftPurchaseOrder } from '@/app/actions/purchase-orders'

interface PurchaseOrdersClientProps {
  purchaseOrders: PurchaseOrderWithRelations[]
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  confirmed: 'Confirmed',
  partial: 'Partial',
  received: 'Received',
  cancelled: 'Cancelled',
}

const statusColors: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  submitted: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-purple-100 text-purple-700',
  partial: 'bg-yellow-100 text-yellow-700',
  received: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

type SortColumn = 'order_number' | 'vendor' | 'total_amount' | 'status' | 'updated_at' | 'created_at' | 'expected_date' | 'received_date' | 'ship_to_name' | 'created_by' | 'submitted_by'
type SortDirection = 'asc' | 'desc'

const columnHeaders: { key: SortColumn; label: string; align?: 'left' | 'right' }[] = [
  { key: 'order_number', label: 'PO #' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'total_amount', label: 'Order Total', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'updated_at', label: 'Last Updated' },
  { key: 'created_at', label: 'Date Ordered' },
  { key: 'expected_date', label: 'Date Expected' },
  { key: 'received_date', label: 'Date Received' },
  { key: 'ship_to_name', label: 'Ship To' },
  { key: 'created_by', label: 'Created By' },
  { key: 'submitted_by', label: 'Submitted By' },
]

export function PurchaseOrdersClient({ purchaseOrders }: PurchaseOrdersClientProps) {
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

  const sortedOrders = useMemo(() => {
    return [...purchaseOrders].sort((a, b) => {
      let aVal: string | number | null = null
      let bVal: string | number | null = null

      switch (sortColumn) {
        case 'order_number':
          aVal = a.order_number || `PO-${a.id.slice(0, 8)}`
          bVal = b.order_number || `PO-${b.id.slice(0, 8)}`
          break
        case 'vendor':
          aVal = a.vendors?.name || ''
          bVal = b.vendors?.name || ''
          break
        case 'total_amount':
          aVal = a.total_amount ?? 0
          bVal = b.total_amount ?? 0
          break
        case 'status':
          aVal = a.status || ''
          bVal = b.status || ''
          break
        case 'updated_at':
          aVal = a.updated_at || ''
          bVal = b.updated_at || ''
          break
        case 'created_at':
          aVal = a.created_at || ''
          bVal = b.created_at || ''
          break
        case 'expected_date':
          aVal = a.expected_date || ''
          bVal = b.expected_date || ''
          break
        case 'received_date':
          aVal = a.received_date || ''
          bVal = b.received_date || ''
          break
        case 'ship_to_name':
          aVal = a.ship_to_name || ''
          bVal = b.ship_to_name || ''
          break
        case 'created_by':
          aVal = a.created_by_profile?.full_name || ''
          bVal = b.created_by_profile?.full_name || ''
          break
        case 'submitted_by':
          aVal = a.submitted_by_profile?.full_name || ''
          bVal = b.submitted_by_profile?.full_name || ''
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
  }, [purchaseOrders, sortColumn, sortDirection])

  async function handleCreateNew() {
    setIsCreating(true)
    try {
      const result = await createDraftPurchaseOrder()
      if (result.success && result.purchase_order_id) {
        router.push(`/workflows/purchase-orders/${result.purchase_order_id}`)
      } else {
        console.error('Failed to create draft PO:', result.error)
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error creating draft PO:', error)
      setIsCreating(false)
    }
  }

  function handleRowClick(orderId: string) {
    router.push(`/workflows/purchase-orders/${orderId}`)
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/workflows/inbound">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Purchase Orders</h1>
              <p className="text-neutral-500">Track incoming stock from suppliers</p>
            </div>
          </div>
          <Button onClick={handleCreateNew} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Order
          </Button>
        </div>

        <div className="p-6">
          {purchaseOrders.length > 0 ? (
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
                    {sortedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="cursor-pointer hover:bg-neutral-50 transition-colors"
                        onClick={() => handleRowClick(order.id)}
                      >
                        <td className="px-4 py-3 font-medium text-neutral-900">
                          {order.order_number || `PO-${order.id.slice(0, 8)}`}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {order.vendors?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <FormattedOrderAmount amount={order.total_amount ?? 0} />
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status || 'draft']}`}
                          >
                            {statusLabels[order.status || 'draft']}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {order.updated_at ? <FormattedShortDate date={order.updated_at} /> : '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {order.created_at ? <FormattedShortDate date={order.created_at} /> : '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {order.expected_date ? <FormattedShortDate date={order.expected_date} /> : '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {order.received_date ? <FormattedShortDate date={order.received_date} /> : '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {order.ship_to_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {order.created_by_profile?.full_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-neutral-600">
                          {order.submitted_by_profile?.full_name || '-'}
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
                  <ShoppingCart className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-neutral-900">No purchase orders yet</h3>
                <p className="mt-1 text-neutral-500">Create your first purchase order to track incoming stock.</p>
                <Button className="mt-4" onClick={handleCreateNew} disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Create Purchase Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
