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
            'flex items-center gap-2',
            'h-10 px-3',
            'rounded-lg',
            'bg-white',
            'border border-neutral-200',
            'text-left',
            'transition-all duration-200',
            'hover:border-neutral-300 hover:bg-neutral-50',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'cursor-pointer'
          )}
        >
          <MapPin
            className="h-4 w-4 flex-shrink-0"
            style={displayColor ? { color: displayColor } : { color: '#0EA5FF' }}
          />
          <span className="text-sm font-medium text-neutral-700 truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-xs text-neutral-400 tabular-nums">
            {itemCounts.get(selectedWarehouseId) ?? 0}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[calc(100vw-2rem)] max-w-sm">
        {/* All Locations option */}
        <DropdownMenuItem
          onClick={() => onWarehouseChange(null)}
          className={cn(
            'flex items-center justify-between gap-3 px-4 py-3',
            selectedWarehouseId === null && 'bg-primary/10'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-neutral-300" />
            <span className={cn(
              'font-medium',
              selectedWarehouseId === null ? 'text-primary' : 'text-neutral-700'
            )}>
              All Locations
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400 tabular-nums">
              {itemCounts.get(null) ?? 0}
            </span>
            {selectedWarehouseId === null && (
              <Check className="h-4 w-4 text-primary" />
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
              selectedWarehouseId === warehouse.id && 'bg-primary/10'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: warehouse.color || '#6b7280' }}
              />
              <span className={cn(
                'font-medium',
                selectedWarehouseId === warehouse.id ? 'text-primary' : 'text-neutral-700'
              )}>
                {warehouse.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400 tabular-nums">
                {itemCounts.get(warehouse.id) ?? 0}
              </span>
              {selectedWarehouseId === warehouse.id && (
                <Check className="h-4 w-4 text-primary" />
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
