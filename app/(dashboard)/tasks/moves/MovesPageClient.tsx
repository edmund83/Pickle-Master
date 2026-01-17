'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Package, FolderOpen, Check, Loader2, Search, Folder as FolderIcon, ChevronRight, Filter, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { bulkMoveItemsToFolder, getMovePageData, type MovePageData, type MovePageFolder } from '@/app/actions/inventory'

interface FolderNode extends MovePageFolder {
  children: FolderNode[]
}

function buildFolderTree(folders: MovePageFolder[]): FolderNode[] {
  const folderMap = new Map<string, FolderNode>()

  // First pass: create nodes
  folders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, children: [] })
  })

  // Second pass: build hierarchy
  const roots: FolderNode[] = []
  folders.forEach(folder => {
    const node = folderMap.get(folder.id)!
    if (folder.parent_id === null) {
      roots.push(node)
    } else {
      const parent = folderMap.get(folder.parent_id)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    }
  })

  // Sort by name
  const sortFolders = (a: FolderNode, b: FolderNode) => a.name.localeCompare(b.name)
  roots.sort(sortFolders)
  const sortChildren = (nodes: FolderNode[]) => {
    nodes.forEach(node => {
      node.children.sort(sortFolders)
      sortChildren(node.children)
    })
  }
  sortChildren(roots)

  return roots
}

interface MovesPageClientProps {
  initialData: MovePageData
}

export function MovesPageClient({ initialData }: MovesPageClientProps) {
  const [data, setData] = useState<MovePageData>(initialData)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [targetFolderId, setTargetFolderId] = useState<string>('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [moving, setMoving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [success, setSuccess] = useState(false)
  const [filterFolderIds, setFilterFolderIds] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set())
  const [folderSearchQuery, setFolderSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  // Debounced search function
  const refreshData = useCallback((params: {
    page?: number
    search?: string
    folderIds?: string[]
    statuses?: string[]
  }) => {
    startTransition(async () => {
      const newData = await getMovePageData({
        page: params.page || data.page,
        pageSize: data.pageSize,
        search: params.search !== undefined ? params.search : searchQuery,
        folderIds: params.folderIds !== undefined ? params.folderIds : Array.from(filterFolderIds),
        statuses: params.statuses !== undefined ? params.statuses : Array.from(filterStatus)
      })
      setData(newData)
      // Clear selection when data changes
      if (params.page !== data.page || params.search !== searchQuery) {
        setSelectedItems(new Set())
      }
    })
  }, [data.page, data.pageSize, searchQuery, filterFolderIds, filterStatus])

  // Handle search with debounce
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    // Debounce search by using a small timeout
    const timer = setTimeout(() => {
      refreshData({ search: query, page: 1 })
    }, 300)
    return () => clearTimeout(timer)
  }, [refreshData])

  function toggleItem(id: string) {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  function selectAll() {
    if (selectedItems.size === data.items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(data.items.map(item => item.id)))
    }
  }

  async function handleMove() {
    if (selectedItems.size === 0 || !targetFolderId) return

    setMoving(true)

    try {
      const result = await bulkMoveItemsToFolder(
        Array.from(selectedItems),
        targetFolderId === 'root' ? null : targetFolderId
      )

      if (result.success) {
        setSuccess(true)
        setSelectedItems(new Set())
        setTargetFolderId('')
        // Refresh data after move
        refreshData({})
        setTimeout(() => setSuccess(false), 3000)
      } else {
        console.error('Move failed:', result.error)
      }
    } catch (error) {
      console.error('Move error:', error)
    } finally {
      setMoving(false)
    }
  }

  function toggleFolderFilter(folderId: string) {
    setFilterFolderIds(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      // Apply filter
      refreshData({ folderIds: Array.from(next), page: 1 })
      return next
    })
  }

  function toggleStatusFilter(status: string) {
    setFilterStatus(prev => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      // Apply filter
      refreshData({ statuses: Array.from(next), page: 1 })
      return next
    })
  }

  function clearFilters() {
    setFilterFolderIds(new Set())
    setFilterStatus(new Set())
    refreshData({ folderIds: [], statuses: [], page: 1 })
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= data.totalPages) {
      refreshData({ page })
    }
  }

  const activeFilterCount = filterFolderIds.size + filterStatus.size

  // Filter folders for the dropdown search
  const filteredFolders = data.folders.filter(folder =>
    folder.name.toLowerCase().includes(folderSearchQuery.toLowerCase())
  )

  const targetFolder = data.folders.find(f => f.id === targetFolderId)
  const folderTree = buildFolderTree(data.folders)

  function toggleFolderExpand(folderId: string) {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  function renderFolderItem(folder: FolderNode, depth: number = 0): React.ReactNode {
    const hasChildren = folder.children.length > 0
    const isExpanded = expandedFolders.has(folder.id)
    const isSelected = targetFolderId === folder.id

    return (
      <div key={folder.id}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setTargetFolderId(folder.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setTargetFolderId(folder.id)
            }
          }}
          className={cn(
            'flex w-full cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-left transition-colors',
            isSelected
              ? 'border-primary bg-primary/10'
              : 'border-neutral-200 hover:bg-neutral-50'
          )}
          style={{ marginLeft: `${depth * 20}px`, width: `calc(100% - ${depth * 20}px)` }}
        >
          {hasChildren && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                toggleFolderExpand(folder.id)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleFolderExpand(folder.id)
                }
              }}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-neutral-200"
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-neutral-400 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </span>
          )}
          {!hasChildren && <span className="w-5" />}
          <FolderIcon
            className="h-5 w-5 flex-shrink-0 text-accent"
            fill="oklch(95% 0.08 85.79)"
            strokeWidth={1.5}
          />
          <span className="font-medium text-neutral-900 truncate">{folder.name}</span>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2">
            {folder.children.map(child => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-neutral-200 bg-white px-8 py-6">
        <div className="flex items-center gap-4">
          <Link href="/tasks/inventory-operations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="h-6 w-px bg-neutral-200" />
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Stock Moves</h1>
            <p className="mt-1 text-neutral-500">
              Move items between folders or locations
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-8 mt-4 flex-shrink-0 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <Check className="h-5 w-5" />
          Items moved successfully!
        </div>
      )}

      <div className="flex-1 overflow-hidden px-8 py-6">
        <div className="grid h-full w-full gap-6 lg:grid-cols-2">
          {/* Source Selection */}
          <div className="flex min-w-0 flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="flex-shrink-0 border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Select Items</h2>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedItems.size === data.items.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                      {activeFilterCount > 0 && (
                        <span className="rounded-full bg-primary px-1.5 text-xs text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Filter by Folder</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Search folders..."
                        value={folderSearchQuery}
                        onChange={(e) => setFolderSearchQuery(e.target.value)}
                        className="h-8 text-sm"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {!folderSearchQuery && (
                        <DropdownMenuCheckboxItem
                          checked={filterFolderIds.has('root')}
                          onCheckedChange={() => toggleFolderFilter('root')}
                        >
                          No Folder (Root)
                        </DropdownMenuCheckboxItem>
                      )}
                      {filteredFolders.length > 0 ? (
                        filteredFolders.map(folder => (
                          <DropdownMenuCheckboxItem
                            key={folder.id}
                            checked={filterFolderIds.has(folder.id)}
                            onCheckedChange={() => toggleFolderFilter(folder.id)}
                          >
                            <span className="truncate">{folder.name}</span>
                          </DropdownMenuCheckboxItem>
                        ))
                      ) : (
                        <div className="px-2 py-2 text-sm text-neutral-500">
                          No folders found
                        </div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.has('in_stock')}
                      onCheckedChange={() => toggleStatusFilter('in_stock')}
                    >
                      In Stock
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.has('low_stock')}
                      onCheckedChange={() => toggleStatusFilter('low_stock')}
                    >
                      Low Stock
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.has('out_of_stock')}
                      onCheckedChange={() => toggleStatusFilter('out_of_stock')}
                    >
                      Out of Stock
                    </DropdownMenuCheckboxItem>
                    {activeFilterCount > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <button
                          onClick={clearFilters}
                          className="w-full px-2 py-1.5 text-left text-sm text-red-600 hover:bg-neutral-50"
                        >
                          Clear all filters
                        </button>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isPending ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                </div>
              ) : data.items.length > 0 ? (
                <ul className="divide-y divide-neutral-200">
                  {data.items.map((item) => (
                    <li
                      key={item.id}
                      className={`flex cursor-pointer items-center gap-4 px-6 py-3 hover:bg-neutral-50 ${
                        selectedItems.has(item.id) ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-neutral-300 text-primary"
                      />
                      <Package className="h-5 w-5 text-neutral-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 truncate">{item.name}</p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          {item.sku && <span>SKU: {item.sku}</span>}
                          <span>Qty: {item.quantity}</span>
                          {item.folder_name && (
                            <span>{item.folder_name}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-12 text-center text-neutral-500">
                  No items found
                </div>
              )}
            </div>

            {/* Pagination and selection info */}
            <div className="flex-shrink-0 border-t border-neutral-200 px-6 py-3 bg-neutral-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">
                  {selectedItems.size > 0 ? (
                    <span className="font-medium">{selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected</span>
                  ) : (
                    <span>Showing {data.items.length} of {data.total} items</span>
                  )}
                </span>
                {data.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(data.page - 1)}
                      disabled={data.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-neutral-600">
                      Page {data.page} of {data.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(data.page + 1)}
                      disabled={data.page === data.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Target Selection */}
          <div className="flex min-w-0 flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="flex-shrink-0 border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Move To</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                <button
                  onClick={() => setTargetFolderId('root')}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                    targetFolderId === 'root'
                      ? 'border-primary bg-primary/10'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  )}
                >
                  <FolderOpen className="h-5 w-5 text-accent" fill="oklch(95% 0.08 85.79)" />
                  <span className="font-medium text-neutral-900">Root (No Folder)</span>
                </button>

                {folderTree.map(folder => renderFolderItem(folder))}
              </div>
            </div>

            {/* Move Button */}
            <div className="flex-shrink-0 border-t border-neutral-200 p-6">
              <Button
                className="w-full"
                size="lg"
                disabled={selectedItems.size === 0 || !targetFolderId || moving}
                onClick={handleMove}
              >
                {moving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Move {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
                {targetFolder && ` to ${targetFolder.name}`}
                {targetFolderId === 'root' && ' to Root'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
