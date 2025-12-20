'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Filter, Package, ScanLine, Upload, CheckSquare, Square, X, Edit3, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { InventoryItem, Folder, Tag } from '@/types/database.types'
import { SearchInput } from '@/components/ui/search-input'
import { InventoryTable } from './inventory-table'
import { ViewToggle } from './view-toggle'
import { WarehouseSelector } from './warehouse-selector'
import { FolderTreeView, type FolderStats } from './folder-tree-view'
import { Breadcrumbs } from './breadcrumbs'
import { FolderSummaryStats } from './folder-summary-stats'
import { InlineFolderForm } from './inline-folder-form'
import { BulkEditModal } from './bulk-edit-modal'
import { createClient } from '@/lib/supabase/client'

const EXPANDED_FOLDERS_KEY = 'pickle-expanded-folders'

interface InventoryDesktopViewProps {
  items: InventoryItem[]
  folders: Folder[]
  view: string
  folderStatsObj: Record<string, FolderStats>
}

export function InventoryDesktopView({ items, folders, view, folderStatsObj }: InventoryDesktopViewProps) {
  const router = useRouter()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [createFolderParentId, setCreateFolderParentId] = useState<string | null>(null)

  // Bulk selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [showBulkEditModal, setShowBulkEditModal] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])

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

  // Select all / deselect all - will be defined after filteredItems

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

  // Convert folderStatsObj back to Map
  const folderStats = useMemo(() => new Map(Object.entries(folderStatsObj)), [folderStatsObj])

  // Track if we've loaded from localStorage (to avoid hydration mismatch)
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize with empty Set to match server render, then load from localStorage after hydration
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => new Set())

  // Load expanded folders from localStorage after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(EXPANDED_FOLDERS_KEY)
      if (stored) {
        setExpandedFolderIds(new Set(JSON.parse(stored)))
      }
    } catch {
      // Ignore storage errors
    }
    setIsHydrated(true)
  }, [])

  // Persist expanded state to localStorage (only after hydration)
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(EXPANDED_FOLDERS_KEY, JSON.stringify([...expandedFolderIds]))
    } catch {
      // Ignore storage errors
    }
  }, [expandedFolderIds, isHydrated])

  // Toggle folder expand/collapse
  const toggleExpand = useCallback((folderId: string) => {
    setExpandedFolderIds(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }, [])

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

  // Filter items by selected folder (including children)
  const filteredItems = useMemo(() => {
    if (selectedFolderId === null) return items

    // Get the selected folder
    const selectedFolder = folders.find(f => f.id === selectedFolderId)
    if (!selectedFolder) return items

    // Include items directly in this folder
    // OR items in any sub-folder (where path includes selectedFolderId)
    return items.filter(item => {
      if (!item.folder_id) return false
      if (item.folder_id === selectedFolderId) return true

      // Check if item's folder is a descendant
      const itemFolder = folders.find(f => f.id === item.folder_id)
      if (itemFolder?.path?.includes(selectedFolderId)) return true

      return false
    })
  }, [items, selectedFolderId, folders])

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

    // CSV Rows
    const rows = filteredItems.map((item) => [
      item.name || '',
      item.sku || '',
      item.barcode || '',
      item.quantity?.toString() || '0',
      item.unit || 'pcs',
      item.min_quantity?.toString() || '0',
      item.price?.toFixed(2) || '0.00',
      item.cost_price?.toFixed(2) || '',
      item.status || 'in_stock',
      item.description?.replace(/"/g, '""') || '',
      item.notes?.replace(/"/g, '""') || '',
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
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

  // Handle starting folder creation
  const handleStartCreateFolder = useCallback((parentId: string | null = null) => {
    setCreateFolderParentId(parentId)
    setIsCreatingFolder(true)
    // Auto-expand parent if creating subfolder
    if (parentId) {
      setExpandedFolderIds(prev => {
        const next = new Set(prev)
        next.add(parentId)
        return next
      })
    }
  }, [])

  // Handle folder creation success
  const handleFolderCreated = useCallback(() => {
    setIsCreatingFolder(false)
    setCreateFolderParentId(null)
  }, [])

  // Handle add subfolder from tree context menu
  const handleAddSubfolder = useCallback((parentId: string) => {
    handleStartCreateFolder(parentId)
  }, [handleStartCreateFolder])

  return (
    <>
      {/* Secondary Sidebar - Folders */}
      <div className="flex w-64 flex-col border-r border-neutral-200 bg-white">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
          <h2 className="text-lg font-semibold text-neutral-900">Inventory</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {/* All Items Link */}
          <button
            onClick={() => setSelectedFolderId(null)}
            className={cn(
              'group flex w-full items-center rounded-md py-1.5 pl-3 pr-2 text-[13px] transition-all duration-150',
              'hover:bg-neutral-100/80',
              selectedFolderId === null
                ? 'bg-pickle-50/80 font-medium text-pickle-700'
                : 'text-neutral-700'
            )}
          >
            <Package className="mr-2 h-4 w-4 flex-shrink-0 text-neutral-500" />
            <span className="flex-1 text-left">All Items</span>
            <span className={cn(
              'min-w-5 text-right text-xs tabular-nums',
              selectedFolderId === null ? 'text-pickle-400' : 'text-neutral-400'
            )}>
              {items.length}
            </span>
          </button>

          {/* Folder Tree */}
          <div className="mt-2">
            <FolderTreeView
              folders={folders}
              folderStats={folderStats}
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
              expandedFolderIds={expandedFolderIds}
              onToggleExpand={toggleExpand}
              onAddSubfolder={handleAddSubfolder}
            />
          </div>

          {/* Inline Folder Form (when creating at root level) */}
          {isCreatingFolder && createFolderParentId === null && (
            <InlineFolderForm
              parentId={null}
              onSuccess={handleFolderCreated}
              onCancel={() => {
                setIsCreatingFolder(false)
                setCreateFolderParentId(null)
              }}
              className="mt-2"
            />
          )}
        </nav>
        <div className="border-t border-neutral-200 p-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={() => handleStartCreateFolder(null)}
            disabled={isCreatingFolder}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Breadcrumbs */}
        <div className="border-b border-neutral-100 bg-white px-6 py-2">
          <Breadcrumbs
            folders={folders}
            currentFolderId={selectedFolderId}
            onNavigate={setSelectedFolderId}
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
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <div className="w-56">
                <WarehouseSelector
                  warehouses={warehouses}
                  selectedWarehouseId={selectedFolderId}
                  onWarehouseChange={setSelectedFolderId}
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
              <Link href="/import">
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
            <EmptyState selectedFolderId={selectedFolderId} onClearFilter={() => setSelectedFolderId(null)} />
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

      {/* Inline Folder Form (when creating subfolder - shown as modal overlay for subfolders) */}
      {isCreatingFolder && createFolderParentId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-64">
            <InlineFolderForm
              parentId={createFolderParentId}
              onSuccess={handleFolderCreated}
              onCancel={() => {
                setIsCreatingFolder(false)
                setCreateFolderParentId(null)
              }}
            />
          </div>
        </div>
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
          RM {(item.price ?? 0).toFixed(2)} / {item.unit}
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
