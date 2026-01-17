'use client'

import { useMemo, useCallback, useState, useRef, useEffect, useTransition } from 'react'
import { ChevronRight, Pencil, MoreHorizontal, Trash2, FolderPlus, Check, X, Loader2, Folder as FolderIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Folder } from '@/types/database.types'
import { renameFolder, deleteFolder } from '@/app/actions/folders'

// Types
export interface FolderStats {
  itemCount: number
  lowStockCount: number
  totalValue: number
}

interface FolderNode extends Folder {
  children: FolderNode[]
}

interface FolderTreeViewProps {
  folders: Folder[]
  folderStats: Map<string, FolderStats>
  selectedFolderId: string | null
  highlightedFolderId?: string | null
  onFolderSelect: (folderId: string | null) => void
  expandedFolderIds: Set<string>
  onToggleExpand: (folderId: string) => void
  onAddSubfolder?: (parentId: string) => void
}

interface FolderTreeItemProps {
  folder: FolderNode
  depth: number
  stats: FolderStats | undefined
  isExpanded: boolean
  isSelected: boolean
  isHighlighted: boolean
  hasChildren: boolean
  expandedFolderIds: Set<string>
  folderStats: Map<string, FolderStats>
  selectedFolderId: string | null
  highlightedFolderId?: string | null
  onToggle: (folderId: string) => void
  onSelect: (folderId: string) => void
  onAddSubfolder?: (parentId: string) => void
}

// Build tree structure from flat folder array
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
        // Orphan folder - add to roots
        roots.push(node)
      }
    }
  })

  // Sort roots and children by sort_order, then by name
  const sortFolders = (a: FolderNode, b: FolderNode) => {
    const orderA = a.sort_order ?? 999
    const orderB = b.sort_order ?? 999
    if (orderA !== orderB) return orderA - orderB
    return (a.name || '').localeCompare(b.name || '')
  }

  roots.sort(sortFolders)

  // Recursively sort children
  const sortChildren = (nodes: FolderNode[]) => {
    nodes.forEach(node => {
      node.children.sort(sortFolders)
      sortChildren(node.children)
    })
  }
  sortChildren(roots)

  return roots
}

// Individual folder item in the tree
function FolderTreeItem({
  folder,
  depth,
  stats,
  isExpanded,
  isSelected,
  isHighlighted,
  hasChildren,
  expandedFolderIds,
  folderStats,
  selectedFolderId,
  highlightedFolderId,
  onToggle,
  onSelect,
  onAddSubfolder,
}: FolderTreeItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(folder.name)
  const [showMenu, setShowMenu] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggle(folder.id)
  }, [folder.id, onToggle])

  const handleSelect = useCallback(() => {
    if (!isEditing) {
      onSelect(folder.id)
    }
  }, [folder.id, onSelect, isEditing])

  const handleStartEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setEditName(folder.name)
    setIsEditing(true)
    setShowMenu(false)
  }, [folder.name])

  const handleSaveEdit = useCallback(() => {
    if (editName.trim() && editName.trim() !== folder.name) {
      startTransition(async () => {
        await renameFolder(folder.id, editName.trim())
      })
    }
    setIsEditing(false)
  }, [folder.id, folder.name, editName])

  const handleCancelEdit = useCallback(() => {
    setEditName(folder.name)
    setIsEditing(false)
  }, [folder.name])

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }, [handleSaveEdit, handleCancelEdit])

  const handleDelete = useCallback(() => {
    if (confirm(`Delete folder "${folder.name}"?`)) {
      startTransition(async () => {
        const result = await deleteFolder(folder.id)
        if (!result.success) {
          alert(result.error)
        }
      })
    }
    setShowMenu(false)
  }, [folder.id, folder.name])

  const handleAddSubfolder = useCallback(() => {
    onAddSubfolder?.(folder.id)
    setShowMenu(false)
  }, [folder.id, onAddSubfolder])

  const hasLowStock = stats && stats.lowStockCount > 0
  const itemCount = stats?.itemCount ?? 0

  // Determine visual state: highlighted (current item's folder) takes priority styling
  const isActive = isSelected || isHighlighted

  return (
    <div>
      <div
        className={cn(
          'group flex w-full cursor-pointer items-center rounded-md py-1.5 text-[13px] transition-all duration-150',
          'hover:bg-neutral-100/80',
          isActive && 'bg-primary/10/80 text-primary',
          isHighlighted && !isSelected && 'border-l-2 border-primary',
          !isActive && 'text-neutral-700'
        )}
        style={{ paddingLeft: `${8 + depth * 16}px`, paddingRight: '8px' }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Toggle */}
        <div className="mr-1 flex h-5 w-5 flex-shrink-0 items-center justify-center">
          {hasChildren ? (
            <button
              onClick={handleToggle}
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded transition-colors',
                'hover:bg-neutral-200/80',
                isActive && 'hover:bg-primary/20'
              )}
              aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
            >
              <ChevronRight
                className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  isExpanded && 'rotate-90',
                  isActive ? 'text-primary' : 'text-neutral-400'
                )}
              />
            </button>
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Folder Icon */}
        <FolderIcon
          className="mr-1.5 h-4 w-4 flex-shrink-0 text-accent"
          fill="oklch(95% 0.08 85.79)"
          strokeWidth={1.5}
        />

        {/* Folder Name */}
        {isEditing ? (
          <div className="flex flex-1 items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={handleSaveEdit}
              className="flex-1 rounded border border-primary/30 bg-white px-2 py-0.5 text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
              disabled={isPending}
            />
            <button
              onClick={handleSaveEdit}
              disabled={isPending}
              className="flex h-5 w-5 items-center justify-center rounded text-primary hover:bg-primary/20"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isPending}
              className="flex h-5 w-5 items-center justify-center rounded text-neutral-400 hover:bg-neutral-200"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              isActive && 'font-medium'
            )}
            title={folder.name}
            onDoubleClick={handleStartEdit}
          >
            {folder.name}
          </span>
        )}

        {/* Stats & Actions Container */}
        <div className="ml-auto flex items-center gap-1 pl-2">
          {/* Hover Actions */}
          {!isEditing && (
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={handleStartEdit}
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded transition-colors',
                  'text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600',
                  isActive && 'hover:bg-primary/20 hover:text-primary'
                )}
                title="Rename"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                  }}
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded transition-colors',
                    'text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600',
                    isActive && 'hover:bg-primary/20 hover:text-primary'
                  )}
                  title="More options"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={handleAddSubfolder}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                      Add subfolder
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Item Count - always visible but styled subtly */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity',
            !isEditing && 'group-hover:opacity-0'
          )}>
            {hasLowStock && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-700">
                {stats.lowStockCount}
              </span>
            )}
            <span className={cn(
              'min-w-5 text-right text-xs tabular-nums',
              isActive ? 'text-primary/60' : 'text-neutral-400'
            )}>
              {itemCount}
            </span>
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {folder.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              stats={folderStats.get(child.id)}
              isExpanded={expandedFolderIds.has(child.id)}
              isSelected={selectedFolderId === child.id}
              isHighlighted={highlightedFolderId === child.id}
              hasChildren={child.children.length > 0}
              expandedFolderIds={expandedFolderIds}
              folderStats={folderStats}
              selectedFolderId={selectedFolderId}
              highlightedFolderId={highlightedFolderId}
              onToggle={onToggle}
              onSelect={onSelect}
              onAddSubfolder={onAddSubfolder}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Main FolderTreeView component
export function FolderTreeView({
  folders,
  folderStats,
  selectedFolderId,
  highlightedFolderId,
  onFolderSelect,
  expandedFolderIds,
  onToggleExpand,
  onAddSubfolder,
}: FolderTreeViewProps) {
  // Build tree structure
  const tree = useMemo(() => buildFolderTree(folders), [folders])

  // Recursive render function to handle selection state properly
  const renderTree = useCallback((nodes: FolderNode[], depth: number) => {
    return nodes.map(node => (
      <FolderTreeItem
        key={node.id}
        folder={node}
        depth={depth}
        stats={folderStats.get(node.id)}
        isExpanded={expandedFolderIds.has(node.id)}
        isSelected={selectedFolderId === node.id}
        isHighlighted={highlightedFolderId === node.id}
        hasChildren={node.children.length > 0}
        expandedFolderIds={expandedFolderIds}
        folderStats={folderStats}
        selectedFolderId={selectedFolderId}
        highlightedFolderId={highlightedFolderId}
        onToggle={onToggleExpand}
        onSelect={onFolderSelect}
        onAddSubfolder={onAddSubfolder}
      />
    ))
  }, [folderStats, expandedFolderIds, selectedFolderId, highlightedFolderId, onToggleExpand, onFolderSelect, onAddSubfolder])

  if (tree.length === 0) {
    return (
      <p className="px-3 py-2 text-sm text-neutral-500">
        No folders yet
      </p>
    )
  }

  return <div className="space-y-0.5">{renderTree(tree, 0)}</div>
}
