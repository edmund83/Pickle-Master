'use client'

import { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteItem } from '@/app/actions/inventory'
import { useRouter } from 'next/navigation'

interface DeleteItemDialogProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemName: string
}

export function DeleteItemDialog({
  isOpen,
  onClose,
  itemId,
  itemName,
}: DeleteItemDialogProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteItem(itemId)

      if (!result.success) {
        setError(result.error || 'Failed to delete item')
        return
      }

      onClose()
      router.push('/inventory')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Delete Item
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-700">
                Are you sure you want to delete{' '}
                <span className="font-semibold">{itemName}</span>?
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                This action can be undone from the activity log.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
