'use client'

import { MapPin, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Folder } from '@/types/database.types'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface WarehouseSelectorProps {
  warehouses: Folder[]
  selectedWarehouseId: string | null
  onWarehouseChange: (warehouseId: string | null) => void
  itemCounts: Map<string | null, number>
}

export function WarehouseSelector({
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
  itemCounts,
}: WarehouseSelectorProps) {
  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId)
  const displayName = selectedWarehouse?.name || 'All Locations'
  const displayColor = selectedWarehouse?.color || null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className={cn(
            'flex items-center justify-between gap-2',
            'w-full',
            'h-12 px-4',
            'rounded-xl',
            'bg-white',
            'border border-neutral-200',
            'text-left',
            'transition-all duration-200',
            'hover:border-neutral-300 hover:shadow-sm',
            'active:scale-[0.99]',
            'focus:outline-none focus:ring-2 focus:ring-pickle-500/20 focus:border-pickle-500',
            'cursor-pointer'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'flex items-center justify-center',
                'w-8 h-8 rounded-lg',
                displayColor ? '' : 'bg-pickle-100'
              )}
              style={displayColor ? { backgroundColor: `${displayColor}20` } : undefined}
            >
              <MapPin
                className="h-4 w-4"
                style={displayColor ? { color: displayColor } : undefined}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-neutral-500 font-medium">Location</span>
              <span className="text-sm font-semibold text-neutral-900 truncate">
                {displayName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400 tabular-nums">
              {itemCounts.get(selectedWarehouseId) ?? 0}
            </span>
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] max-w-sm">
        {/* All Locations option */}
        <DropdownMenuItem
          onClick={() => onWarehouseChange(null)}
          className={cn(
            'flex items-center justify-between gap-3 px-4 py-3',
            selectedWarehouseId === null && 'bg-pickle-50'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-neutral-300" />
            <span className={cn(
              'font-medium',
              selectedWarehouseId === null ? 'text-pickle-700' : 'text-neutral-700'
            )}>
              All Locations
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400 tabular-nums">
              {itemCounts.get(null) ?? 0}
            </span>
            {selectedWarehouseId === null && (
              <Check className="h-4 w-4 text-pickle-600" />
            )}
          </div>
        </DropdownMenuItem>

        {/* Divider */}
        {warehouses.length > 0 && (
          <div className="h-px bg-neutral-100 my-1" />
        )}

        {/* Warehouse options */}
        {warehouses.map((warehouse) => (
          <DropdownMenuItem
            key={warehouse.id}
            onClick={() => onWarehouseChange(warehouse.id)}
            className={cn(
              'flex items-center justify-between gap-3 px-4 py-3',
              selectedWarehouseId === warehouse.id && 'bg-pickle-50'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: warehouse.color || '#6b7280' }}
              />
              <span className={cn(
                'font-medium',
                selectedWarehouseId === warehouse.id ? 'text-pickle-700' : 'text-neutral-700'
              )}>
                {warehouse.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400 tabular-nums">
                {itemCounts.get(warehouse.id) ?? 0}
              </span>
              {selectedWarehouseId === warehouse.id && (
                <Check className="h-4 w-4 text-pickle-600" />
              )}
            </div>
          </DropdownMenuItem>
        ))}

        {/* Empty state */}
        {warehouses.length === 0 && (
          <div className="px-4 py-6 text-center">
            <MapPin className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
            <p className="text-sm text-neutral-500">No locations yet</p>
            <p className="text-xs text-neutral-400 mt-1">
              Create a folder to organize items by location
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
