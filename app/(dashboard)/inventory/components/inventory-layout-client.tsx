'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import type { Folder } from '@/types/database.types'
import type { FolderStats } from './folder-tree-view'
import { InventorySidebar } from './inventory-sidebar'
import { InventoryProvider, useOptionalInventoryContext } from './inventory-context'

interface InventoryLayoutClientProps {
  folders: Folder[]
  folderStatsObj: Record<string, FolderStats>
  totalItemCount: number
  children: React.ReactNode
}

function InventoryLayoutContent({
  folders,
  folderStatsObj,
  totalItemCount,
  children,
}: InventoryLayoutClientProps) {
  const searchParams = useSearchParams()
  const inventoryContext = useOptionalInventoryContext()

  // Get selected folder from URL params
  const selectedFolderId = searchParams.get('folder')

  // Get highlighted folder from context (set by item detail page)
  const highlightedFolderId = inventoryContext?.highlightedFolderId ?? null

  return (
    <>
      {/* Desktop: Show sidebar */}
      <div className="hidden lg:flex">
        <InventorySidebar
          folders={folders}
          folderStatsObj={folderStatsObj}
          totalItemCount={totalItemCount}
          selectedFolderId={selectedFolderId}
          highlightedFolderId={highlightedFolderId}
        />
      </div>
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </>
  )
}

export function InventoryLayoutClient(props: InventoryLayoutClientProps) {
  return (
    <InventoryProvider>
      <Suspense fallback={
        <>
          {/* Desktop: Show loading sidebar placeholder */}
          <div className="hidden lg:flex w-64 flex-col border-r border-neutral-200 bg-white animate-pulse">
            <div className="h-16 border-b border-neutral-200 px-4 flex items-center">
              <div className="h-6 w-24 bg-neutral-200 rounded" />
            </div>
            <div className="flex-1 p-2 space-y-2">
              <div className="h-8 bg-neutral-100 rounded" />
              <div className="h-8 bg-neutral-100 rounded" />
              <div className="h-8 bg-neutral-100 rounded" />
            </div>
          </div>
          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {props.children}
          </div>
        </>
      }>
        <InventoryLayoutContent {...props} />
      </Suspense>
    </InventoryProvider>
  )
}
