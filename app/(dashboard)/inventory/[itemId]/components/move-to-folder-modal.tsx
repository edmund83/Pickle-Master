'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Folder, ChevronRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { moveItemToFolder } from '@/app/actions/inventory'
import { cn } from '@/lib/utils'

interface Folder {
  id: string
  name: string
  parent_id: string | null
  color: string | null
  depth: number
}

interface FolderNode extends Folder {
  children: FolderNode[]
}

interface MoveToFolderModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemName: string
  currentFolderId: string | null
  currentFolderName: string | null
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

function FolderTreeItem({
  folder,
  depth,
  selectedFolderId,
  currentFolderId,
  expandedIds,
  onToggleExpand,
  onSelect,
}: {
  folder: FolderNode
  depth: number
  selectedFolderId: string | null
  currentFolderId: string | null
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
  onSelect: (id: string | null) => void
}) {
  const hasChildren = folder.children.length > 0
  const isExpanded = expandedIds.has(folder.id)
  const isSelected = selectedFolderId === folder.id
  const isCurrent = currentFolderId === folder.id

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(folder.id)}
        disabled={isCurrent}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
          isSelected && !isCurrent && 'bg-pickle-50 text-pickle-700',
          isCurrent && 'cursor-not-allowed bg-neutral-100 text-neutral-400',
          !isSelected && !isCurrent && 'hover:bg-neutral-50'
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(folder.id)
            }}
            className="flex h-4 w-4 items-center justify-center rounded hover:bg-neutral-200"
          >
            <ChevronRight
              className={cn(
                'h-3 w-3 text-neutral-400 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        )}
        {!hasChildren && <span className="w-4" />}
        <Folder
          className="h-4 w-4 flex-shrink-0 text-neutral-400"
          fill="#e5e5e5"
          strokeWidth={1.5}
        />
        <span className="truncate">{folder.name}</span>
        {isCurrent && (
          <span className="ml-auto text-xs text-neutral-400">(current)</span>
        )}
      </button>
      {isExpanded && hasChildren && (
        <div>
          {folder.children.map(child => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              currentFolderId={currentFolderId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function MoveToFolderModal({
  isOpen,
  onClose,
  itemId,
  itemName,
  currentFolderId,
  currentFolderName,
}: MoveToFolderModalProps) {
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Load folders when modal opens
  useEffect(() => {
    if (!isOpen) return

    async function loadFolders() {
      setLoading(true)
      setError(null)
      try {
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
          .from('folders')
          .select('id, name, parent_id, color, depth')
          .eq('tenant_id', profile.tenant_id)
          .order('name')

        setFolders((data || []) as Folder[])

        // Auto-expand path to current folder
        if (currentFolderId && data) {
          const currentFolder = data.find((f: Folder) => f.id === currentFolderId)
          if (currentFolder?.parent_id) {
            setExpandedIds(new Set([currentFolder.parent_id]))
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadFolders()
  }, [isOpen, currentFolderId])

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(currentFolderId)
      setError(null)
    }
  }, [isOpen, currentFolderId])

  const handleToggleExpand = (folderId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const handleSave = async () => {
    if (selectedFolderId === currentFolderId) {
      onClose()
      return
    }

    setSaving(true)
    setError(null)

    try {
      const result = await moveItemToFolder(itemId, selectedFolderId)

      if (!result.success) {
        setError(result.error || 'Failed to move item')
        return
      }

      onClose()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = selectedFolderId !== currentFolderId
  const folderTree = buildFolderTree(folders)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Move to Folder
            </h2>
            <p className="text-sm text-neutral-500">
              Moving: {itemName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : (
            <div className="space-y-1">
              {/* Root option (no folder) */}
              <button
                type="button"
                onClick={() => setSelectedFolderId(null)}
                disabled={currentFolderId === null}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  selectedFolderId === null && currentFolderId !== null && 'bg-pickle-50 text-pickle-700',
                  currentFolderId === null && 'cursor-not-allowed bg-neutral-100 text-neutral-400',
                  selectedFolderId !== null && currentFolderId !== null && 'hover:bg-neutral-50'
                )}
              >
                <Home className="h-4 w-4 text-neutral-400" />
                <span>No Folder (Root)</span>
                {currentFolderId === null && (
                  <span className="ml-auto text-xs text-neutral-400">(current)</span>
                )}
              </button>

              {/* Folder tree */}
              {folderTree.map(folder => (
                <FolderTreeItem
                  key={folder.id}
                  folder={folder}
                  depth={0}
                  selectedFolderId={selectedFolderId}
                  currentFolderId={currentFolderId}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  onSelect={setSelectedFolderId}
                />
              ))}

              {folders.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-neutral-500">No folders available</p>
                  <p className="mt-1 text-sm text-neutral-400">
                    Create folders from the inventory sidebar
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-100 p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moving...
              </>
            ) : (
              'Move'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
