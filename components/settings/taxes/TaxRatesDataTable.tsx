'use client'

import * as React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2, MoreHorizontal, Star, Check, X as XIcon } from 'lucide-react'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { type TaxRate } from '@/app/actions/tax-rates'
import { TAX_TYPES } from '@/lib/constants/tax'

interface TaxRatesDataTableProps {
    taxRates: TaxRate[]
    onEdit: (rate: TaxRate) => void
    onDelete: (rate: TaxRate) => void
    onSetDefault: (rate: TaxRate) => void
    onToggleActive: (rate: TaxRate) => void
    onSelectionChange?: (selectedRates: TaxRate[]) => void
    enableSelection?: boolean
}

function getTaxTypeLabel(value: string): string {
    const type = TAX_TYPES.find((t) => t.value === value)
    return type?.label || value
}

function formatRate(rate: number): string {
    // Remove trailing zeros
    return rate.toFixed(2).replace(/\.?0+$/, '') + '%'
}

export function TaxRatesDataTable({
    taxRates,
    onEdit,
    onDelete,
    onSetDefault,
    onToggleActive,
    onSelectionChange,
    enableSelection = true,
}: TaxRatesDataTableProps) {
    const columns: ColumnDef<TaxRate>[] = React.useMemo(
        () => [
            // Selection checkbox column
            ...(enableSelection
                ? [
                      {
                          id: 'select',
                          header: ({
                              table,
                          }: {
                              table: import('@tanstack/react-table').Table<TaxRate>
                          }) => {
                              const isAllSelected = table.getIsAllPageRowsSelected()
                              const isSomeSelected = table.getIsSomePageRowsSelected()
                              return (
                                  <input
                                      type="checkbox"
                                      checked={isAllSelected}
                                      ref={(el) => {
                                          if (el)
                                              el.indeterminate = isSomeSelected && !isAllSelected
                                      }}
                                      onChange={(e) =>
                                          table.toggleAllPageRowsSelected(!!e.target.checked)
                                      }
                                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
                                      aria-label="Select all"
                                  />
                              )
                          },
                          cell: ({ row }: { row: import('@tanstack/react-table').Row<TaxRate> }) => (
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
                      } as ColumnDef<TaxRate>,
                  ]
                : []),

            // Name column (sortable)
            {
                accessorKey: 'name',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900">{row.original.name}</span>
                        {row.original.is_default && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                <Star className="h-3 w-3" />
                                Default
                            </span>
                        )}
                        {!row.original.is_active && (
                            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                                Inactive
                            </span>
                        )}
                    </div>
                ),
            },

            // Type column
            {
                accessorKey: 'tax_type',
                header: 'Type',
                cell: ({ row }) => (
                    <span className="text-sm text-neutral-600">
                        {getTaxTypeLabel(row.original.tax_type)}
                    </span>
                ),
            },

            // Rate column (sortable)
            {
                accessorKey: 'rate',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Rate" />,
                cell: ({ row }) => (
                    <span className="font-mono text-sm font-medium text-neutral-900">
                        {formatRate(row.original.rate)}
                    </span>
                ),
            },

            // Region column
            {
                id: 'region',
                header: 'Region',
                cell: ({ row }) => {
                    const country = row.original.country_code
                    const region = row.original.region_code
                    if (!country && !region) {
                        return <span className="text-neutral-400 text-sm">-</span>
                    }
                    return (
                        <span className="text-sm text-neutral-600">
                            {[country, region].filter(Boolean).join(' / ')}
                        </span>
                    )
                },
            },

            // Options column (compound, shipping)
            {
                id: 'options',
                header: 'Options',
                cell: ({ row }) => {
                    const options = []
                    if (row.original.is_compound) options.push('Compound')
                    if (row.original.applies_to_shipping) options.push('Shipping')

                    if (options.length === 0) {
                        return <span className="text-neutral-400 text-sm">-</span>
                    }

                    return (
                        <div className="flex flex-wrap gap-1">
                            {options.map((opt) => (
                                <span
                                    key={opt}
                                    className="inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600"
                                >
                                    {opt}
                                </span>
                            ))}
                        </div>
                    )
                },
            },

            // Actions column
            {
                id: 'actions',
                header: '',
                cell: ({ row }) => {
                    const rate = row.original
                    return (
                        <div className="flex items-center justify-end gap-1">
                            {/* Desktop: Show buttons directly */}
                            <div className="hidden sm:flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(rate)}
                                    className="h-8 w-8 text-neutral-400 hover:text-neutral-600"
                                    aria-label={`Edit ${rate.name}`}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(rate)}
                                    className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                                    aria-label={`Delete ${rate.name}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Mobile + overflow menu */}
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
                                    <DropdownMenuItem
                                        onClick={() => onEdit(rate)}
                                        className="sm:hidden"
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    {!rate.is_default && rate.is_active && (
                                        <DropdownMenuItem onClick={() => onSetDefault(rate)}>
                                            <Star className="mr-2 h-4 w-4" />
                                            Set as Default
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => onToggleActive(rate)}>
                                        {rate.is_active ? (
                                            <>
                                                <XIcon className="mr-2 h-4 w-4" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Activate
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <div className="sm:hidden">
                                        <DropdownMenuSeparator />
                                    </div>
                                    <DropdownMenuItem
                                        onClick={() => onDelete(rate)}
                                        className={cn(
                                            'text-red-600 focus:text-red-600',
                                            'sm:hidden'
                                        )}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                },
                size: 120,
                enableSorting: false,
            },
        ],
        [onEdit, onDelete, onSetDefault, onToggleActive, enableSelection]
    )

    return (
        <DataTable
            columns={columns}
            data={taxRates}
            searchKey="name"
            searchPlaceholder="Search tax rates..."
            pageSize={15}
            enableRowSelection={enableSelection}
            onRowSelectionChange={onSelectionChange}
        />
    )
}

export default TaxRatesDataTable
