'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Plus, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Folder } from '@/types/database.types'
import { FolderTreeView, type FolderStats } from './folder-tree-view'
import { InlineFolderForm } from './inline-folder-form'

const EXPANDED_FOLDERS_KEY = 'stockzip-expanded-folders'

interface InventorySidebarProps {
  folders: Folder[]
  folderStatsObj: Record<string, FolderStats>
  totalItemCount: number
  selectedFolderId: string | null
  highlightedFolderId?: string | null
  userRole: 'owner' | 'staff' | 'viewer'
}

export function InventorySidebar({
  folders,
  folderStatsObj,
  totalItemCount,
  selectedFolderId,
  highlightedFolderId,
  userRole,
}: InventorySidebarProps) {
  // Viewers cannot create folders
  const canCreateFolder = userRole !== 'viewer'
  const router = useRouter()
  const pathname = usePathname()
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [createFolderParentId, setCreateFolderParentId] = useState<string | null>(null)

  // Convert folderStatsObj to Map
  const folderStats = new Map(Object.entries(folderStatsObj))

  // Track if we've loaded from localStorage (to avoid hydration mismatch)
  const [isHydrated, setIsHydrated] = useState(false)

  // Initialize with empty Set to match server render, then load from localStorage after hydration
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => new Set())

  // Load expanded folders from localStorage after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(EXPANDED_FOLDERS_KEY)
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: hydration from localStorage
        setExpandedFolderIds(new Set(JSON.parse(stored)))
      }
    } catch {
      // Ignore storage errors
    }
    setIsHydrated(true)
  }, [])

  // Auto-expand ancestors when highlightedFolderId changes
  useEffect(() => {
    if (!highlightedFolderId || !isHydrated) return

    // Find the highlighted folder and expand all its ancestors
    const highlightedFolder = folders.find(f => f.id === highlightedFolderId)
    if (highlightedFolder?.path && highlightedFolder.path.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: expand ancestors for navigation highlight
      setExpandedFolderIds(prev => {
        const next = new Set(prev)
        highlightedFolder.path!.forEach(ancestorId => next.add(ancestorId))
        return next
      })
    }
  }, [highlightedFolderId, folders, isHydrated])

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

  // Handle folder selection - navigate to inventory list with folder filter
  const handleFolderSelect = useCallback((folderId: string | null) => {
    if (folderId === null) {
      router.push('/inventory')
    } else {
      router.push(`/inventory?folder=${folderId}`)
    }
  }, [router])

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
    router.refresh()
  }, [router])

  // Handle add subfolder from tree context menu
  const handleAddSubfolder = useCallback((parentId: string) => {
    handleStartCreateFolder(parentId)
  }, [handleStartCreateFolder])

  // Determine if "All Items" should be highlighted
  // It's selected when no folder is selected AND we're on the main inventory page
  const isAllItemsSelected = selectedFolderId === null && pathname === '/inventory'

  return (
    <>
      <div className="flex w-64 flex-col border-r border-neutral-200 bg-white">
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
          <h2 className="text-lg font-semibold text-neutral-900">Inventory</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {/* All Items Link */}
          <button
            onClick={() => handleFolderSelect(null)}
            className={cn(
              'group flex w-full items-center rounded-md py-1.5 pl-3 pr-2 text-[13px] transition-all duration-150',
              'hover:bg-neutral-100/80',
              isAllItemsSelected
                ? 'bg-primary/10/80 font-medium text-primary'
                : 'text-neutral-700'
            )}
          >
            <Package className="mr-2 h-4 w-4 flex-shrink-0 text-neutral-500" />
            <span className="flex-1 text-left">All Items</span>
            <span className={cn(
              'min-w-5 text-right text-xs tabular-nums',
              isAllItemsSelected ? 'text-primary/60' : 'text-neutral-400'
            )}>
              {totalItemCount}
            </span>
          </button>

          {/* Folder Tree */}
          <div className="mt-2">
            <FolderTreeView
              folders={folders}
              folderStats={folderStats}
              selectedFolderId={selectedFolderId}
              highlightedFolderId={highlightedFolderId}
              onFolderSelect={handleFolderSelect}
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
        {canCreateFolder && (
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
        )}
      </div>

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
