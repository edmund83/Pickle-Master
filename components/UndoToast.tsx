'use client'

import { useEffect, useState } from 'react'
import { Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUndo } from '@/lib/hooks/useUndo'

export function UndoToast() {
  const { currentAction, performUndo, dismissUndo } = useUndo()
  const [isUndoing, setIsUndoing] = useState(false)
  const [progress, setProgress] = useState(100)

  // Animate progress bar
  useEffect(() => {
    if (!currentAction) {
      setProgress(100)
      return
    }

    const startTime = currentAction.createdAt
    const duration = 10000 // 10 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
    }

    updateProgress()
    const interval = setInterval(updateProgress, 100)

    return () => clearInterval(interval)
  }, [currentAction])

  const handleUndo = async () => {
    setIsUndoing(true)
    try {
      await performUndo()
    } finally {
      setIsUndoing(false)
    }
  }

  if (!currentAction) return null

  return (
    <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="relative overflow-hidden rounded-lg bg-neutral-900 px-4 py-3 shadow-lg">
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center gap-4">
          <span className="text-sm text-white">{currentAction.label}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={isUndoing}
              className="text-primary/60 hover:text-primary/40 hover:bg-neutral-800"
            >
              <Undo2 className="mr-1 h-4 w-4" />
              {isUndoing ? 'Undoing...' : 'Undo'}
            </Button>
            <button
              onClick={dismissUndo}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
