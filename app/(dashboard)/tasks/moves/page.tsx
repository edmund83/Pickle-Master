'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Package, FolderOpen, Check, Loader2, Search, Folder as FolderIcon, ChevronRight, Filter } from 'lucide-react'
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
import type { InventoryItem, Folder } from '@/types/database.types'
import { cn } from '@/lib/utils'

interface FolderNode extends Folder {
  children: FolderNode[]
}

function buildFolderTree(folders: Folder[]): FolderNode[] {
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

export default function StockMovesPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [targetFolderId, setTargetFolderId] = useState<string>('')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [moving, setMoving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [success, setSuccess] = useState(false)
  const [filterFolderIds, setFilterFolderIds] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      const [itemsResult, foldersResult] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('inventory_items')
          .select('*, folders(name, color)')
          .eq('tenant_id', profile.tenant_id)
          .is('deleted_at', null)
          .order('name', { ascending: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('folders')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('name', { ascending: true }),
      ])

      setItems((itemsResult.data || []) as InventoryItem[])
      setFolders((foldersResult.data || []) as Folder[])
    } finally {
      setLoading(false)
    }
  }

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
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    }
  }

  async function handleMove() {
    if (selectedItems.size === 0 || !targetFolderId) return

    setMoving(true)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('inventory_items')
        .update({ folder_id: targetFolderId === 'root' ? null : targetFolderId })
        .in('id', Array.from(selectedItems))

      if (!error) {
        setSuccess(true)
        setSelectedItems(new Set())
        setTargetFolderId('')
        loadData()
        setTimeout(() => setSuccess(false), 3000)
      }
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
      return next
    })
  }

  function clearFilters() {
    setFilterFolderIds(new Set())
    setFilterStatus(new Set())
  }

  const filteredItems = items.filter(item => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))

    // Folder filter
    const matchesFolder = filterFolderIds.size === 0 ||
      (item.folder_id && filterFolderIds.has(item.folder_id)) ||
      (item.folder_id === null && filterFolderIds.has('root'))

    // Status filter
    const matchesStatus = filterStatus.size === 0 || (item.status && filterStatus.has(item.status))

    return matchesSearch && matchesFolder && matchesStatus
  })

  const activeFilterCount = filterFolderIds.size + filterStatus.size

  const targetFolder = folders.find(f => f.id === targetFolderId)
  const folderTree = buildFolderTree(folders)

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
        <button
          onClick={() => setTargetFolderId(folder.id)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg border px-4 py-3 text-left transition-colors',
            isSelected
              ? 'border-pickle-500 bg-pickle-50'
              : 'border-neutral-200 hover:bg-neutral-50'
          )}
          style={{ marginLeft: `${depth * 20}px`, width: `calc(100% - ${depth * 20}px)` }}
        >
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolderExpand(folder.id)
              }}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-neutral-200"
            >
              <ChevronRight
                className={cn(
                  'h-4 w-4 text-neutral-400 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          )}
          {!hasChildren && <span className="w-5" />}
          <FolderIcon
            className="h-5 w-5 flex-shrink-0"
            style={{ color: folder.color || '#6b7280' }}
            fill={folder.color || '#e5e5e5'}
            strokeWidth={1.5}
          />
          <span className="font-medium text-neutral-900 truncate">{folder.name}</span>
        </button>
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2">
            {folder.children.map(child => renderFolderItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
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
        <div className="mx-8 mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <Check className="h-5 w-5" />
          Items moved successfully!
        </div>
      )}

      <div className="p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Source Selection */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Select Items</h2>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="default" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                      {activeFilterCount > 0 && (
                        <span className="rounded-full bg-pickle-500 px-1.5 text-xs text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filter by Folder</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                      checked={filterFolderIds.has('root')}
                      onCheckedChange={() => toggleFolderFilter('root')}
                    >
                      No Folder (Root)
                    </DropdownMenuCheckboxItem>
                    {folders.map(folder => (
                      <DropdownMenuCheckboxItem
                        key={folder.id}
                        checked={filterFolderIds.has(folder.id)}
                        onCheckedChange={() => toggleFolderFilter(folder.id)}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: folder.color || '#6b7280' }}
                          />
                          {folder.name}
                        </span>
                      </DropdownMenuCheckboxItem>
                    ))}
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

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                </div>
              ) : filteredItems.length > 0 ? (
                <ul className="divide-y divide-neutral-200">
                  {filteredItems.map((item) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const folder = (item as any).folders as { name: string; color: string } | null
                    return (
                      <li
                        key={item.id}
                        className={`flex cursor-pointer items-center gap-4 px-6 py-3 hover:bg-neutral-50 ${
                          selectedItems.has(item.id) ? 'bg-pickle-50' : ''
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-neutral-300 text-pickle-600"
                        />
                        <Package className="h-5 w-5 text-neutral-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 truncate">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            {item.sku && <span>SKU: {item.sku}</span>}
                            <span>Qty: {item.quantity}</span>
                            {folder && (
                              <span className="flex items-center gap-1">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: folder.color }}
                                />
                                {folder.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="py-12 text-center text-neutral-500">
                  No items found
                </div>
              )}
            </div>

            {selectedItems.size > 0 && (
              <div className="border-t border-neutral-200 px-6 py-3 bg-neutral-50">
                <span className="text-sm font-medium text-neutral-700">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
              </div>
            )}
          </div>

          {/* Target Selection */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Move To</h2>
            </div>

            <div className="p-6">
              <div className="space-y-2">
                <button
                  onClick={() => setTargetFolderId('root')}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                    targetFolderId === 'root'
                      ? 'border-pickle-500 bg-pickle-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  )}
                >
                  <FolderOpen className="h-5 w-5 text-neutral-400" />
                  <span className="font-medium text-neutral-900">Root (No Folder)</span>
                </button>

                {folderTree.map(folder => renderFolderItem(folder))}
              </div>

              {/* Move Button */}
              <div className="mt-6">
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
    </div>
  )
}
