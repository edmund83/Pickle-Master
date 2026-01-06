'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DeleteLabelDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  labelName: string
  labelColor: string
  usageCount: number
}

export function DeleteLabelDialog({
  isOpen,
  onClose,
  onConfirm,
  labelName,
  labelColor,
  usageCount,
}: DeleteLabelDialogProps) {
  const [deleting, setDeleting] = useState(false)

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !deleting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, deleting, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  if (!isOpen) return null

  const hasUsage = usageCount > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={deleting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className={cn(
          'relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-xl',
          'animate-in duration-200 zoom-in-95 fade-in-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 id="delete-dialog-title" className="text-lg font-semibold text-neutral-900">
            Delete Label
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          {/* Label preview */}
          <div className="flex justify-center">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: `${labelColor}20`,
                color: labelColor,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: labelColor }}
              />
              {labelName}
            </span>
          </div>

          {/* Description */}
          <p id="delete-dialog-description" className="text-center text-neutral-600">
            Are you sure you want to delete this label?
            {hasUsage && (
              <span className="block mt-2 text-red-600 font-medium">
                This label is currently used on {usageCount} {usageCount === 1 ? 'item' : 'items'}.
                Deleting it will remove it from all items.
              </span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 h-12"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Label'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteLabelDialog
