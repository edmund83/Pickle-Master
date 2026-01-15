'use client'

import * as React from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'
import { getCustomerColumns } from './columns'
import type { CustomerListItem } from '@/app/actions/customers'

interface CustomersDataTableProps {
  customers: CustomerListItem[]
  onEdit: (customer: CustomerListItem) => void
  onDelete: (customer: CustomerListItem) => void
  onToggleActive?: (customer: CustomerListItem) => void
  onBulkDelete?: (customers: CustomerListItem[]) => void
  enableSelection?: boolean
}

export function CustomersDataTable({
  customers,
  onEdit,
  onDelete,
  onToggleActive,
  onBulkDelete,
  enableSelection = true,
}: CustomersDataTableProps) {
  const [selectedCustomers, setSelectedCustomers] = React.useState<CustomerListItem[]>([])
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = React.useState(false)

  const columns = React.useMemo(
    () => getCustomerColumns({ onEdit, onDelete, onToggleActive }, enableSelection),
    [onEdit, onDelete, onToggleActive, enableSelection]
  )

  const handleSelectionChange = React.useCallback((selected: CustomerListItem[]) => {
    setSelectedCustomers(selected)
  }, [])

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedCustomers.length > 0) {
      onBulkDelete(selectedCustomers)
      setShowBulkDeleteConfirm(false)
      setSelectedCustomers([])
    }
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={customers}
        searchKey="name"
        searchPlaceholder="Search customers..."
        pageSize={10}
        enableRowSelection={enableSelection}
        onRowSelectionChange={handleSelectionChange}
      />

      {/* Bulk action bar */}
      {enableSelection && selectedCustomers.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <span className="text-sm text-neutral-600">
            {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
          </span>

          {showBulkDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Delete {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''}?
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                Yes, Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomersDataTable
