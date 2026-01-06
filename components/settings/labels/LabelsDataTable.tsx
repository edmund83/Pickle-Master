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
import type { LabelWithUsage } from './LabelCard'
import { cn } from '@/lib/utils'

interface LabelsDataTableProps {
  labels: LabelWithUsage[]
  onEdit: (label: LabelWithUsage) => void
  onDelete: (label: LabelWithUsage) => void
  onSelectionChange?: (selectedLabels: LabelWithUsage[]) => void
  enableSelection?: boolean
}

export function LabelsDataTable({
  labels,
  onEdit,
  onDelete,
  onSelectionChange,
  enableSelection = true,
}: LabelsDataTableProps) {
  const columns: ColumnDef<LabelWithUsage>[] = React.useMemo(
    () => [
      // Selection checkbox column
      ...(enableSelection
        ? [
            {
              id: 'select',
              header: ({ table }: { table: import('@tanstack/react-table').Table<LabelWithUsage> }) => {
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
              cell: ({ row }: { row: import('@tanstack/react-table').Row<LabelWithUsage> }) => (
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
            } as ColumnDef<LabelWithUsage>,
          ]
        : []),

      // Color indicator column
      {
        id: 'color',
        header: '',
        cell: ({ row }) => {
          const color = row.original.color || '#6b7280'
          return (
            <div
              className="h-4 w-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
              title={color}
            />
          )
        },
        size: 40,
        enableSorting: false,
      },

      // Name column (sortable)
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Label Name" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-neutral-900">{row.original.name}</span>
        ),
      },

      // Preview badge column
      {
        id: 'preview',
        header: 'Preview',
        cell: ({ row }) => {
          const label = row.original
          const color = label.color || '#6b7280'
          return (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${color}15`,
                color: color,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label.name.length > 15 ? label.name.slice(0, 15) + '...' : label.name}
            </span>
          )
        },
        enableSorting: false,
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
                : `${count} item${count === 1 ? '' : 's'}`}
            </span>
          )
        },
      },

      // Actions column
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const label = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              {/* Desktop: Show buttons directly */}
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(label)}
                  className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
                  aria-label={`Edit ${label.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(label)}
                  className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                  aria-label={`Delete ${label.name}`}
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
                    <DropdownMenuItem onClick={() => onEdit(label)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(label)}
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
      data={labels}
      searchKey="name"
      searchPlaceholder="Search labels..."
      pageSize={15}
      enableRowSelection={enableSelection}
      onRowSelectionChange={onSelectionChange}
    />
  )
}

export default LabelsDataTable
