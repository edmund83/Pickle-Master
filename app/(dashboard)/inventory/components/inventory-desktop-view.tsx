'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, Filter, Package, ScanLine, Upload, CheckSquare, Square, X, Edit3, Download, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import type { InventoryItem, Folder, Tag } from '@/types/database.types'
import { SearchInput } from '@/components/ui/search-input'
import { InventoryTable } from './inventory-table'
import { ViewToggle } from './view-toggle'
import { WarehouseSelector } from './warehouse-selector'
import { Breadcrumbs } from './breadcrumbs'
import { FolderSummaryStats } from './folder-summary-stats'
import { BulkEditModal } from './bulk-edit-modal'
import { createClient } from '@/lib/supabase/client'
import { useFormatting } from '@/hooks/useFormatting'

// Properly escape CSV values
function escapeCSV(value: string | number | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  // Escape if contains comma, newline, or quote
  if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

interface FilterState {
  status: string[]
  hasImages: boolean | null
}

interface InventoryDesktopViewProps {
  items: InventoryItem[]
  folders: Folder[]
  view: string
}

export function InventoryDesktopView({ items, folders, view }: InventoryDesktopViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get selected folder from URL
  const selectedFolderId = searchParams.get('folder')

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    hasImages: null,
  })

  // Bulk selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])

  // Get search query from URL
  const searchQuery = searchParams.get('q') || ''

  // Navigate to folder
  const navigateToFolder = useCallback((folderId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (folderId === null) {
      params.delete('folder')
    } else {
      params.set('folder', folderId)
    }
    const queryString = params.toString()
    router.push(`/inventory${queryString ? `?${queryString}` : ''}`)
  }, [router, searchParams])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.status.length > 0) count += filters.status.length
    if (filters.hasImages !== null) count += 1
    return count
  }, [filters])

  // Toggle status filter
  const toggleStatusFilter = useCallback((status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }))
  }, [])

  // Toggle has images filter
  const toggleHasImagesFilter = useCallback((value: boolean | null) => {
    setFilters(prev => ({
      ...prev,
      hasImages: prev.hasImages === value ? null : value
    }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({ status: [], hasImages: null })
  }, [])

  // Load tags for bulk edit
  useEffect(() => {
    async function loadTags() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('tags')
        .select('*')
        .eq('tenant_id', profile.tenant_id)

      setTags((data || []) as Tag[])
    }
    loadTags()
  }, [])

  // Toggle item selection
  const toggleItemSelection = useCallback((itemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setSelectedItemIds(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }, [])

  // Exit selection mode
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false)
    setSelectedItemIds(new Set())
  }, [])

  // Handle bulk edit success
  const handleBulkEditSuccess = useCallback(() => {
    setShowBulkEditModal(false)
    setSelectedItemIds(new Set())
    setIsSelectionMode(false)
    router.refresh()
  }, [router])

  // Get warehouses (top-level folders only) - still needed for warehouse selector
  const warehouses = useMemo(() =>
    folders.filter(f => f.parent_id === null), [folders])

  // Map each folder to its root warehouse using the path array
  const folderToWarehouse = useMemo(() => {
    const map = new Map<string, string>()
    folders.forEach(folder => {
      if (folder.parent_id === null) {
        map.set(folder.id, folder.id)
      } else if (folder.path && folder.path.length > 0) {
        map.set(folder.id, folder.path[0])
      }
    })
    return map
  }, [folders])

  // Calculate warehouse counts (including sub-folder items)
  const warehouseCounts = useMemo(() => {
    const counts = new Map<string | null, number>()
    counts.set(null, items.length)
    warehouses.forEach(wh => {
      const count = items.filter(item => {
        if (!item.folder_id) return false
        return folderToWarehouse.get(item.folder_id) === wh.id
      }).length
      counts.set(wh.id, count)
    })
    return counts
  }, [items, warehouses, folderToWarehouse])

  // Filter items by selected folder (including children), search query, and filters
  const filteredItems = useMemo(() => {
    let result = items

    // Filter by folder
    if (selectedFolderId !== null) {
      const selectedFolder = folders.find(f => f.id === selectedFolderId)
      if (selectedFolder) {
        result = result.filter(item => {
          if (!item.folder_id) return false
          if (item.folder_id === selectedFolderId) return true
          // Check if item's folder is a descendant
          const itemFolder = folders.find(f => f.id === item.folder_id)
          if (itemFolder?.path?.includes(selectedFolderId)) return true
          return false
        })
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.sku?.toLowerCase().includes(query) ||
        item.barcode?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (filters.status.length > 0) {
      result = result.filter(item => filters.status.includes(item.status || 'in_stock'))
    }

    // Filter by has images
    if (filters.hasImages !== null) {
      result = result.filter(item => {
        const hasImages = item.image_urls && item.image_urls.length > 0
        return filters.hasImages ? hasImages : !hasImages
      })
    }

    return result
  }, [items, selectedFolderId, folders, searchQuery, filters])

  // Select all / deselect all (defined after filteredItems)
  const toggleSelectAll = useCallback(() => {
    if (selectedItemIds.size === filteredItems.length) {
      setSelectedItemIds(new Set())
    } else {
      setSelectedItemIds(new Set(filteredItems.map(item => item.id)))
    }
  }, [selectedItemIds.size, filteredItems])

  // Export items to CSV
  const handleExportCSV = useCallback(() => {
    if (filteredItems.length === 0) return

    // CSV Headers
    const headers = [
      'Name',
      'SKU',
      'Barcode',
      'Quantity',
      'Unit',
      'Min Quantity',
      'Price',
      'Cost Price',
      'Status',
      'Description',
      'Notes',
    ]

    // CSV Rows - use escapeCSV for proper escaping
    const rows = filteredItems.map((item) => [
      escapeCSV(item.name),
      escapeCSV(item.sku),
      escapeCSV(item.barcode),
      escapeCSV(item.quantity?.toString() || '0'),
      escapeCSV(item.unit || 'pcs'),
      escapeCSV(item.min_quantity?.toString() || '0'),
      escapeCSV(item.price?.toFixed(2) || '0.00'),
      escapeCSV(item.cost_price?.toFixed(2) || ''),
      escapeCSV(item.status || 'in_stock'),
      escapeCSV(item.description),
      escapeCSV(item.notes),
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredItems])

  // Calculate summary stats for current view
  const summaryStats = useMemo(() => {
    const currentItems = filteredItems
    const currentFolders = selectedFolderId === null
      ? folders
      : folders.filter(f =>
          f.id === selectedFolderId ||
          f.path?.includes(selectedFolderId)
        )

    return {
      folderCount: currentFolders.length,
      itemCount: currentItems.length,
      totalQuantity: currentItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
      totalValue: currentItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0),
    }
  }, [filteredItems, folders, selectedFolderId])

  return (
    <>
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Breadcrumbs */}
        <div className="border-b border-neutral-100 bg-white px-6 py-2">
          <Breadcrumbs
            folders={folders}
            currentFolderId={selectedFolderId}
            onNavigate={navigateToFolder}
          />
        </div>

        {/* Summary Stats Bar */}
        <FolderSummaryStats
          folderCount={summaryStats.folderCount}
          itemCount={summaryStats.itemCount}
          totalQuantity={summaryStats.totalQuantity}
          totalValue={summaryStats.totalValue}
        />

        {/* Header - Selection Mode or Normal */}
        {isSelectionMode ? (
          <div className="flex items-center justify-between border-b border-neutral-200 bg-pickle-50 px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSelectAll}
                className="text-pickle-700"
              >
                {selectedItemIds.size === filteredItems.length ? (
                  <CheckSquare className="mr-2 h-4 w-4" />
                ) : (
                  <Square className="mr-2 h-4 w-4" />
                )}
                {selectedItemIds.size === filteredItems.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm font-medium text-pickle-700">
                {selectedItemIds.size} item{selectedItemIds.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowBulkEditModal(true)}
                disabled={selectedItemIds.size === 0}
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Bulk Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exitSelectionMode}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <SearchInput placeholder="Search items..." className="w-64" />
              </div>
              <ViewToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-pickle-500 text-xs text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filters.status.includes('in_stock')}
                    onCheckedChange={() => toggleStatusFilter('in_stock')}
                  >
                    <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                    In Stock
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.status.includes('low_stock')}
                    onCheckedChange={() => toggleStatusFilter('low_stock')}
                  >
                    <span className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                    Low Stock
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.status.includes('out_of_stock')}
                    onCheckedChange={() => toggleStatusFilter('out_of_stock')}
                  >
                    <span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                    Out of Stock
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Images</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filters.hasImages === true}
                    onCheckedChange={() => toggleHasImagesFilter(true)}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Has Images
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.hasImages === false}
                    onCheckedChange={() => toggleHasImagesFilter(false)}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    No Images
                  </DropdownMenuCheckboxItem>
                  {activeFilterCount > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <button
                        onClick={clearFilters}
                        className="w-full px-2 py-1.5 text-sm text-red-600 hover:bg-neutral-100 text-left"
                      >
                        Clear all filters
                      </button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="w-56">
                <WarehouseSelector
                  warehouses={warehouses}
                  selectedWarehouseId={selectedFolderId}
                  onWarehouseChange={navigateToFolder}
                  itemCounts={warehouseCounts}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSelectionMode(true)}
                disabled={filteredItems.length === 0}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Select
              </Button>
              <Link href="/settings/bulk-import">
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={filteredItems.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Link href="/scan">
                <Button variant="outline" size="sm">
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan
                </Button>
              </Link>
              <Link href="/inventory/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Items Grid/Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length > 0 ? (
            view === 'table' ? (
              <InventoryTable items={filteredItems} folders={folders} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedItemIds.has(item.id)}
                    onToggleSelect={toggleItemSelection}
                  />
                ))}
              </div>
            )
          ) : (
            <EmptyState selectedFolderId={selectedFolderId} onClearFilter={() => navigateToFolder(null)} />
          )}
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <BulkEditModal
          selectedItemIds={Array.from(selectedItemIds)}
          folders={folders}
          tags={tags}
          onClose={() => setShowBulkEditModal(false)}
          onSuccess={handleBulkEditSuccess}
        />
      )}
    </>
  )
}

interface ItemCardProps {
  item: InventoryItem
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (itemId: string, e?: React.MouseEvent) => void
}

function ItemCard({ item, isSelectionMode, isSelected, onToggleSelect }: ItemCardProps) {
  const { formatCurrency } = useFormatting()
  const statusColors: Record<string, string> = {
    in_stock: 'bg-green-100 text-green-700',
    low_stock: 'bg-yellow-100 text-yellow-700',
    out_of_stock: 'bg-red-100 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionMode && onToggleSelect) {
      e.preventDefault()
      onToggleSelect(item.id, e)
    }
  }

  const cardClassName = cn(
    'group relative rounded-xl border bg-white p-4 transition-all',
    isSelectionMode
      ? 'cursor-pointer'
      : 'hover:shadow-md',
    isSelected
      ? 'border-pickle-500 bg-pickle-50 ring-2 ring-pickle-500'
      : 'border-neutral-200'
  )

  const cardContent = (
    <>
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div className="absolute right-3 top-3 z-10">
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors',
              isSelected
                ? 'border-pickle-500 bg-pickle-500 text-white'
                : 'border-neutral-300 bg-white'
            )}
          >
            {isSelected && <CheckSquare className="h-4 w-4" />}
          </div>
        </div>
      )}

      {/* Image placeholder */}
      <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-neutral-100">
        {item.image_urls?.[0] ? (
          <img
            src={item.image_urls[0]}
            alt={item.name}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-neutral-300" />
        )}
      </div>

      {/* Info */}
      <h3 className={cn(
        'font-medium',
        isSelected ? 'text-pickle-700' : 'text-neutral-900 group-hover:text-pickle-600'
      )}>
        {item.name}
      </h3>
      {item.sku && (
        <p className="mt-0.5 text-xs text-neutral-500">SKU: {item.sku}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-semibold text-neutral-900">
          {item.quantity} {item.unit}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status || 'in_stock'] || statusColors.in_stock
            }`}
        >
          {statusLabels[item.status || 'in_stock'] || 'In Stock'}
        </span>
      </div>

      {(item.price ?? 0) > 0 && (
        <p className="mt-1 text-sm text-neutral-500">
          {formatCurrency(item.price)} / {item.unit}
        </p>
      )}
    </>
  )

  if (isSelectionMode) {
    return (
      <div onClick={handleClick} className={cardClassName}>
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={`/inventory/${item.id}`} className={cardClassName}>
      {cardContent}
    </Link>
  )
}

interface EmptyStateProps {
  selectedFolderId: string | null
  onClearFilter: () => void
}

function EmptyState({ selectedFolderId, onClearFilter }: EmptyStateProps) {
  if (selectedFolderId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <Package className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-neutral-900">No items in this folder</h3>
        <p className="mt-1 text-neutral-500">This folder doesn&apos;t have any items yet.</p>
        <Button variant="outline" className="mt-4" onClick={onClearFilter}>
          View all items
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <Package className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-neutral-900">No items yet</h3>
      <p className="mt-1 text-neutral-500">Get started by adding your first inventory item.</p>
      <Link href="/inventory/new" className="mt-4">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add your first item
        </Button>
      </Link>
    </div>
  )
}
