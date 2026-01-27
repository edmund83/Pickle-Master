'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { warningFeedback, deleteFeedback, tapFeedback } from '@/lib/utils/feedback'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'warning' | 'default'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onClose])

  // Prevent body scroll when open + haptic feedback on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Haptic feedback when dialog opens (warning for destructive, tap for others)
      if (variant === 'destructive') {
        warningFeedback()
      } else {
        tapFeedback()
      }
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, variant])

  async function handleConfirm() {
    // Haptic feedback on confirm
    if (variant === 'destructive') {
      deleteFeedback()
    } else {
      tapFeedback()
    }

    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const iconColors = {
    destructive: 'bg-red-100 text-red-500',
    warning: 'bg-amber-100 text-amber-500',
    default: 'bg-blue-100 text-blue-500',
  }

  const buttonVariant = variant === 'destructive' ? 'destructive' : 'default'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className={cn(
          'relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-xl',
          'animate-in duration-200 zoom-in-95 fade-in-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 id="confirm-dialog-title" className="text-lg font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
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
            <div className={cn('flex h-16 w-16 items-center justify-center rounded-full', iconColors[variant])}>
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>

          {/* Description */}
          <p id="confirm-dialog-description" className="text-center text-neutral-600">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-12"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
