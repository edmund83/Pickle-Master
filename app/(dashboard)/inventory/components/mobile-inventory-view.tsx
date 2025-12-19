'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Package, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InventoryItem, Folder } from '@/types/database.types'
import { MultiFAB } from '@/components/layout/mobile/MultiFAB'
import { WarehouseSelector } from './warehouse-selector'

interface MobileInventoryViewProps {
  items: InventoryItem[]
  folders: Folder[]
}

const statusConfig = {
  in_stock: {
    label: 'In Stock',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  low_stock: {
    label: 'Low Stock',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  out_of_stock: {
    label: 'Out',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
}

export function MobileInventoryView({ items, folders }: MobileInventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'out'>('all')
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)

  // Get warehouses (top-level folders only)
  const warehouses = useMemo(() =>
    folders.filter(f => f.parent_id === null), [folders])

  // Map each folder to its root warehouse using the path array
  const folderToWarehouse = useMemo(() => {
    const map = new Map<string, string>()
    folders.forEach(folder => {
      if (folder.parent_id === null) {
        map.set(folder.id, folder.id) // warehouse maps to itself
      } else if (folder.path && folder.path.length > 0) {
        map.set(folder.id, folder.path[0]) // first element is root warehouse
      }
    })
    return map
  }, [folders])

  // Calculate warehouse counts (including sub-folder items)
  const warehouseCounts = useMemo(() => {
    const counts = new Map<string | null, number>()
    counts.set(null, items.length) // "All" count

    warehouses.forEach(wh => {
      const count = items.filter(item => {
        if (!item.folder_id) return false
        return folderToWarehouse.get(item.folder_id) === wh.id
      }).length
      counts.set(wh.id, count)
    })
    return counts
  }, [items, warehouses, folderToWarehouse])

  // Filter items
  const filteredItems = items.filter((item) => {
    // Search filter
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus =
      activeFilter === 'all' ||
      (activeFilter === 'low' && item.status === 'low_stock') ||
      (activeFilter === 'out' && item.status === 'out_of_stock')

    // Warehouse filter
    const matchesWarehouse =
      selectedWarehouseId === null ||
      (item.folder_id && folderToWarehouse.get(item.folder_id) === selectedWarehouseId)

    return matchesSearch && matchesStatus && matchesWarehouse
  })

  // Count by status (from filtered by warehouse items)
  const warehouseFilteredItems = selectedWarehouseId === null
    ? items
    : items.filter(item => item.folder_id && folderToWarehouse.get(item.folder_id) === selectedWarehouseId)

  const lowStockCount = warehouseFilteredItems.filter((i) => i.status === 'low_stock').length
  const outOfStockCount = warehouseFilteredItems.filter((i) => i.status === 'out_of_stock').length

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Warehouse Selector */}
      <div className="bg-white px-4 py-3 border-b border-neutral-100">
        <WarehouseSelector
          warehouses={warehouses}
          selectedWarehouseId={selectedWarehouseId}
          onWarehouseChange={setSelectedWarehouseId}
          itemCounts={warehouseCounts}
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-neutral-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full h-14 pl-12 pr-4',
              'rounded-2xl',
              'bg-neutral-100',
              'text-lg',
              'placeholder:text-neutral-400',
              'focus:outline-none focus:ring-2 focus:ring-pickle-500/20 focus:bg-white focus:border-pickle-500',
              'border-2 border-transparent',
              'transition-all duration-200'
            )}
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b border-neutral-100 overflow-x-auto">
        <FilterPill
          label="All"
          count={warehouseFilteredItems.length}
          active={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        />
        <FilterPill
          label="Low Stock"
          count={lowStockCount}
          active={activeFilter === 'low'}
          onClick={() => setActiveFilter('low')}
          variant="warning"
        />
        <FilterPill
          label="Out of Stock"
          count={outOfStockCount}
          active={activeFilter === 'out'}
          onClick={() => setActiveFilter('out')}
          variant="danger"
        />
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length > 0 ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <MobileItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <MobileEmptyState
            hasItems={items.length > 0}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Multi-purpose Floating Action Button */}
      <MultiFAB />
    </div>
  )
}

interface FilterPillProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
  variant?: 'default' | 'warning' | 'danger'
}

function FilterPill({ label, count, active, onClick, variant = 'default' }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2',
        'h-12 px-5',
        'rounded-full',
        'font-medium text-base',
        'whitespace-nowrap',
        'transition-all duration-200',
        'active:scale-95',
        active
          ? variant === 'warning'
            ? 'bg-amber-500 text-white'
            : variant === 'danger'
            ? 'bg-red-500 text-white'
            : 'bg-pickle-500 text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
      )}
    >
      {label}
      <span
        className={cn(
          'px-2 py-0.5 rounded-full text-sm font-semibold',
          active ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-500'
        )}
      >
        {count}
      </span>
    </button>
  )
}

interface MobileItemCardProps {
  item: InventoryItem
}

function MobileItemCard({ item }: MobileItemCardProps) {
  const status = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.in_stock

  return (
    <Link
      href={`/inventory/${item.id}`}
      className={cn(
        'flex items-center gap-4',
        'p-4',
        'rounded-3xl',
        'bg-white',
        'border-2',
        status.borderColor,
        'transition-all duration-200',
        'active:scale-[0.98]',
        'shadow-sm hover:shadow-md'
      )}
    >
      {/* Image */}
      <div
        className={cn(
          'flex-shrink-0',
          'w-20 h-20',
          'rounded-2xl',
          'bg-neutral-100',
          'flex items-center justify-center',
          'overflow-hidden'
        )}
      >
        {item.image_urls?.[0] ? (
          <img
            src={item.image_urls[0]}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-10 w-10 text-neutral-300" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-neutral-900 truncate">
          {item.name}
        </h3>
        {item.sku && (
          <p className="text-sm text-neutral-500 truncate">SKU: {item.sku}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-2xl font-bold tabular-nums text-neutral-900">
            {item.quantity}
          </span>
          {item.unit && (
            <span className="text-base text-neutral-500">{item.unit}</span>
          )}
        </div>
      </div>

      {/* Status & Arrow */}
      <div className="flex flex-col items-end gap-2">
        <span
          className={cn(
            'px-3 py-1',
            'rounded-full',
            'text-xs font-semibold',
            status.bgColor,
            status.textColor
          )}
        >
          {status.label}
        </span>
        <ChevronRight className="h-6 w-6 text-neutral-300" />
      </div>
    </Link>
  )
}

interface MobileEmptyStateProps {
  hasItems: boolean
  searchQuery: string
}

function MobileEmptyState({ hasItems, searchQuery }: MobileEmptyStateProps) {
  if (hasItems && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
          <Search className="h-10 w-10 text-neutral-400" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-neutral-900">No matches</h3>
        <p className="mt-2 text-neutral-500 text-center">
          No items match "{searchQuery}"
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-pickle-50">
        <Package className="h-12 w-12 text-pickle-400" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-neutral-900">No items yet</h3>
      <p className="mt-2 text-neutral-500 text-center">
        Tap the + button to add your first item
      </p>
    </div>
  )
}
