'use client'

import { useMemo, Fragment } from 'react'
import { Home, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Folder } from '@/types/database.types'

interface BreadcrumbsProps {
  folders: Folder[]
  currentFolderId: string | null
  onNavigate: (folderId: string | null) => void
}

export function Breadcrumbs({ folders, currentFolderId, onNavigate }: BreadcrumbsProps) {
  // Build path from current folder to root using the path array
  const pathSegments = useMemo(() => {
    if (!currentFolderId) return []

    const current = folders.find(f => f.id === currentFolderId)
    if (!current) return []

    // path array contains ancestor IDs in order (root first)
    const ancestorIds = current.path || []
    const ancestors = ancestorIds
      .map(id => folders.find(f => f.id === id))
      .filter((f): f is Folder => f !== undefined)

    return [...ancestors, current]
  }, [folders, currentFolderId])

  return (
    <nav className="flex items-center gap-1 text-sm">
      {/* Home / All Items */}
      <button
        onClick={() => onNavigate(null)}
        className={cn(
          'flex items-center gap-1.5 rounded px-2 py-1 transition-colors',
          'hover:bg-neutral-100',
          currentFolderId === null && 'font-medium text-pickle-600'
        )}
      >
        <Home className="h-4 w-4" />
        <span>All Items</span>
      </button>

      {/* Path segments */}
      {pathSegments.map((folder, index) => {
        const isLast = index === pathSegments.length - 1
        return (
          <Fragment key={folder.id}>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-neutral-300" />
            <button
              onClick={() => onNavigate(folder.id)}
              className={cn(
                'max-w-[150px] truncate rounded px-2 py-1 transition-colors',
                'hover:bg-neutral-100',
                isLast
                  ? 'font-medium text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900'
              )}
              title={folder.name}
            >
              {folder.name}
            </button>
          </Fragment>
        )
      })}
    </nav>
  )
}
