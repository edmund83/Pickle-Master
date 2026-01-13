'use client'

import * as React from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'
import { getVendorColumns } from './columns'
import type { Vendor } from '@/types/database.types'

interface VendorsDataTableProps {
  vendors: Vendor[]
  onEdit: (vendor: Vendor) => void
  onDelete: (vendor: Vendor) => void
  onBulkDelete?: (vendors: Vendor[]) => void
  enableSelection?: boolean
}

export function VendorsDataTable({
  vendors,
  onEdit,
  onDelete,
  onBulkDelete,
  enableSelection = true,
}: VendorsDataTableProps) {
  const [selectedVendors, setSelectedVendors] = React.useState<Vendor[]>([])
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = React.useState(false)

  const columns = React.useMemo(
    () => getVendorColumns({ onEdit, onDelete }, enableSelection),
    [onEdit, onDelete, enableSelection]
  )

  const handleSelectionChange = React.useCallback((selected: Vendor[]) => {
    setSelectedVendors(selected)
  }, [])

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedVendors.length > 0) {
      onBulkDelete(selectedVendors)
      setShowBulkDeleteConfirm(false)
      setSelectedVendors([])
    }
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={vendors}
        searchKey="name"
        searchPlaceholder="Search vendors..."
        pageSize={10}
        enableRowSelection={enableSelection}
        onRowSelectionChange={handleSelectionChange}
      />

      {/* Bulk action bar */}
      {enableSelection && selectedVendors.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <span className="text-sm text-neutral-600">
            {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''} selected
          </span>

          {showBulkDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Delete {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''}?
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

export default VendorsDataTable
