'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface InventoryContextType {
  highlightedFolderId: string | null
  setHighlightedFolderId: (folderId: string | null) => void
}

const InventoryContext = createContext<InventoryContextType | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [highlightedFolderId, setHighlightedFolderIdState] = useState<string | null>(null)

  const setHighlightedFolderId = useCallback((folderId: string | null) => {
    setHighlightedFolderIdState(folderId)
  }, [])

  return (
    <InventoryContext.Provider value={{ highlightedFolderId, setHighlightedFolderId }}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventoryContext() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventoryContext must be used within an InventoryProvider')
  }
  return context
}

// Hook that safely returns null if not in context (for optional usage)
export function useOptionalInventoryContext() {
  return useContext(InventoryContext)
}
