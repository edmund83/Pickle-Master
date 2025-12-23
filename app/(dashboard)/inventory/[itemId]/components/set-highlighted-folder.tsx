'use client'

import { useEffect } from 'react'
import { useOptionalInventoryContext } from '../../components/inventory-context'

interface SetHighlightedFolderProps {
  folderId: string | null
}

export function SetHighlightedFolder({ folderId }: SetHighlightedFolderProps) {
  const context = useOptionalInventoryContext()

  useEffect(() => {
    if (context) {
      context.setHighlightedFolderId(folderId)
    }

    // Cleanup: reset highlighted folder when unmounting
    return () => {
      if (context) {
        context.setHighlightedFolderId(null)
      }
    }
  }, [folderId, context])

  // This component doesn't render anything
  return null
}
