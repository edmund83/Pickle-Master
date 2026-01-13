'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2, MoreHorizontal, Mail, Phone } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Vendor } from '@/types/database.types'

interface ColumnActions {
  onEdit: (vendor: Vendor) => void
  onDelete: (vendor: Vendor) => void
}

export function getVendorColumns(
  actions: ColumnActions,
  enableSelection: boolean = true
): ColumnDef<Vendor>[] {
  const columns: ColumnDef<Vendor>[] = []

  // Selection checkbox column
  if (enableSelection) {
    columns.push({
      id: 'select',
      header: ({ table }) => {
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
      cell: ({ row }) => (
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
    })
  }

  // Name column (sortable)
  columns.push({
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vendor Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-neutral-900">{row.original.name}</span>
    ),
  })

  // Contact column (sortable)
  columns.push({
    accessorKey: 'contact_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => {
      const contact = row.original.contact_name
      return contact ? (
        <span className="text-neutral-600">{contact}</span>
      ) : (
        <span className="text-neutral-400">-</span>
      )
    },
  })

  // Email column
  columns.push({
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => {
      const email = row.original.email
      return email ? (
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <Mail className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{email}</span>
          <span className="sm:hidden">Email</span>
        </a>
      ) : (
        <span className="text-neutral-400">-</span>
      )
    },
    enableSorting: false,
  })

  // Phone column
  columns.push({
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const phone = row.original.phone
      return phone ? (
        <a
          href={`tel:${phone}`}
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <Phone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{phone}</span>
          <span className="sm:hidden">Call</span>
        </a>
      ) : (
        <span className="text-neutral-400">-</span>
      )
    },
    enableSorting: false,
  })

  // Actions column
  columns.push({
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const vendor = row.original
      return (
        <div className="flex items-center justify-end gap-1">
          {/* Desktop: Show buttons directly */}
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => actions.onEdit(vendor)}
              className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
              aria-label={`Edit ${vendor.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => actions.onDelete(vendor)}
              className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50"
              aria-label={`Delete ${vendor.name}`}
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
                <DropdownMenuItem onClick={() => actions.onEdit(vendor)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onDelete(vendor)}
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
  })

  return columns
}
