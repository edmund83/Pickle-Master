'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

interface UndoAction {
  id: string
  label: string
  undo: () => Promise<void>
  onComplete?: () => void
  createdAt: number
}

interface UndoContextType {
  // Add an undoable action (will show toast)
  addUndoAction: (label: string, undoFn: () => Promise<void>, onComplete?: () => void) => void
  // Current undo action (if any)
  currentAction: UndoAction | null
  // Perform the undo
  performUndo: () => Promise<void>
  // Dismiss current undo action
  dismissUndo: () => void
}

const UndoContext = createContext<UndoContextType | undefined>(undefined)

const UNDO_TIMEOUT_MS = 10000 // 10 seconds to undo

export function UndoProvider({ children }: { children: ReactNode }) {
  const [currentAction, setCurrentAction] = useState<UndoAction | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  const addUndoAction = useCallback((label: string, undoFn: () => Promise<void>, onComplete?: () => void) => {
    // Clear any existing timeout
    if (timeoutId) clearTimeout(timeoutId)

    const action: UndoAction = {
      id: crypto.randomUUID(),
      label,
      undo: undoFn,
      onComplete,
      createdAt: Date.now(),
    }

    setCurrentAction(action)

    // Auto-dismiss after timeout
    const newTimeoutId = setTimeout(() => {
      setCurrentAction((current) => (current?.id === action.id ? null : current))
    }, UNDO_TIMEOUT_MS)

    setTimeoutId(newTimeoutId)
  }, [timeoutId])

  const performUndo = useCallback(async () => {
    if (!currentAction) return

    try {
      await currentAction.undo()
      // Call onComplete callback if provided (e.g., to refresh the UI)
      currentAction.onComplete?.()
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      setCurrentAction(null)
    }
  }, [currentAction, timeoutId])

  const dismissUndo = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId)
    setCurrentAction(null)
  }, [timeoutId])

  return (
    <UndoContext.Provider value={{ addUndoAction, currentAction, performUndo, dismissUndo }}>
      {children}
    </UndoContext.Provider>
  )
}

export function useUndo() {
  const context = useContext(UndoContext)
  if (!context) {
    throw new Error('useUndo must be used within an UndoProvider')
  }
  return context
}
