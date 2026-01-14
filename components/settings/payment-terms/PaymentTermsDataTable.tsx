'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface PaymentTermWithUsage {
  id: string
  name: string
  description: string | null
  days: number | null
  sort_order: number
  usage_count: number
}

interface PaymentTermsDataTableProps {
  paymentTerms: PaymentTermWithUsage[]
  onEdit: (term: PaymentTermWithUsage) => void
  onDelete: (term: PaymentTermWithUsage) => void
  onSelectionChange?: (selectedTerms: PaymentTermWithUsage[]) => void
  enableSelection?: boolean
}

export function PaymentTermsDataTable({
  paymentTerms,
  onEdit,
  onDelete,
  onSelectionChange,
  enableSelection = true,
}: PaymentTermsDataTableProps) {
  const columns: ColumnDef<PaymentTermWithUsage>[] = React.useMemo(
    () => [
      // Selection checkbox column
      ...(enableSelection
        ? [
            {
              id: 'select',
              header: ({ table }: { table: import('@tanstack/react-table').Table<PaymentTermWithUsage> }) => {
                const isAllSelected = table.getIsAllPageRowsSelected()
                const isSomeSelected = table.getIsSomePageRowsSelected()
                return (
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected && !isAllSelected
                    }}
                    onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
                    aria-label="Select all"
                  />
                )
              },
              cell: ({ row }: { row: import('@tanstack/react-table').Row<PaymentTermWithUsage> }) => (
                <input
                  type="checkbox"
                  checked={row.getIsSelected()}
                  onChange={(e) => row.toggleSelected(!!e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
                  aria-label={`Select ${row.original.name}`}
                />
              ),
              enableSorting: false,
              enableHiding: false,
              size: 40,
            } as ColumnDef<PaymentTermWithUsage>,
          ]
        : []),

      // Name column (sortable)
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-neutral-900">{row.original.name}</span>
        ),
      },

      // Description column
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-neutral-500 text-sm">
            {row.original.description || '-'}
          </span>
        ),
      },

      // Days column (sortable)
      {
        accessorKey: 'days',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Days" />
        ),
        cell: ({ row }) => {
          const days = row.original.days
          return (
            <span className="text-sm text-neutral-600">
              {days === null ? '-' : `${days} days`}
            </span>
          )
        },
      },

      // Usage count column (sortable)
      {
        accessorKey: 'usage_count',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Usage" />
        ),
        cell: ({ row }) => {
          const count = row.original.usage_count
          return (
            <span
              className={cn(
                'text-sm',
                count === 0 ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              {count === 0
                ? 'Unused'
                : `${count} vendor${count === 1 ? '' : 's'}`}
            </span>
          )
        },
      },

      // Actions column
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const term = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              {/* Desktop: Show buttons directly */}
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(term)}
                  className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
                  aria-label={`Edit ${term.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(term)}
                  className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                  aria-label={`Delete ${term.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile: Dropdown menu */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-400"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(term)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(term)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        },
        size: 100,
        enableSorting: false,
      },
    ],
    [onEdit, onDelete, enableSelection]
  )

  return (
    <DataTable
      columns={columns}
      data={paymentTerms}
      searchKey="name"
      searchPlaceholder="Search payment terms..."
      pageSize={15}
      enableRowSelection={enableSelection}
      onRowSelectionChange={onSelectionChange}
    />
  )
}

export default PaymentTermsDataTable
