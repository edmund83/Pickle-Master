'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, FolderOpen, Tag, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useUndo } from '@/lib/hooks/useUndo'
import type { Folder, Tag as TagType } from '@/types/database.types'

interface BulkEditModalProps {
  selectedItemIds: string[]
  folders: Folder[]
  tags: TagType[]
  onClose: () => void
  onSuccess: () => void
}

type BulkAction = 'move' | 'tag' | 'delete'

export function BulkEditModal({
  selectedItemIds,
  folders,
  tags,
  onClose,
  onSuccess,
}: BulkEditModalProps) {
  const router = useRouter()
  const [action, setAction] = useState<BulkAction | null>(null)
  const [targetFolderId, setTargetFolderId] = useState<string>('')
  const [targetTagId, setTargetTagId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { addUndoAction } = useUndo()

  // Callback to refresh the page after undo
  const refreshAfterUndo = () => {
    router.refresh()
  }

  const handleApply = async () => {
    if (!action) return

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      if (action === 'move') {
        // Get original folder IDs before moving
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: originalItems } = await (supabase as any)
          .from('inventory_items')
          .select('id, folder_id')
          .in('id', selectedItemIds)
          .is('deleted_at', null)

        const originalFolderIds = new Map(
          (originalItems || []).map((item: { id: string; folder_id: string | null }) => [item.id, item.folder_id])
        )

        // Move items to folder
        const newFolderId = targetFolderId === 'root' ? null : targetFolderId
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('inventory_items')
          .update({ folder_id: newFolderId })
          .in('id', selectedItemIds)

        if (updateError) throw updateError

        // Add undo action
        const itemCount = selectedItemIds.length
        addUndoAction(
          `Moved ${itemCount} item${itemCount !== 1 ? 's' : ''}`,
          async () => {
            // Restore original folder IDs
            const supabaseClient = createClient()
            for (const [itemId, folderId] of originalFolderIds) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabaseClient as any)
                .from('inventory_items')
                .update({ folder_id: folderId })
                .eq('id', itemId)
            }
          },
          refreshAfterUndo
        )
      } else if (action === 'tag') {
        // Add tag to items
        const tagInserts = selectedItemIds.map((itemId) => ({
          item_id: itemId,
          tag_id: targetTagId,
        }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: tagError } = await (supabase as any)
          .from('item_tags')
          .upsert(tagInserts, { onConflict: 'item_id,tag_id', ignoreDuplicates: true })

        if (tagError) throw tagError

        // Add undo action
        const itemCount = selectedItemIds.length
        const tagName = tags.find((t) => t.id === targetTagId)?.name || 'tag'
        addUndoAction(
          `Added "${tagName}" to ${itemCount} item${itemCount !== 1 ? 's' : ''}`,
          async () => {
            // Remove the tag from items
            const supabaseClient = createClient()
            for (const itemId of selectedItemIds) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabaseClient as any)
                .from('item_tags')
                .delete()
                .match({ item_id: itemId, tag_id: targetTagId })
            }
          },
          refreshAfterUndo
        )
      } else if (action === 'delete') {
        // Soft delete items
        // Note: We cannot use .select() here because once deleted_at is set,
        // the RLS SELECT policy (which requires deleted_at IS NULL) blocks returning the row
        const deletedAt = new Date().toISOString()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: deleteError } = await (supabase as any)
          .from('inventory_items')
          .update({ deleted_at: deletedAt })
          .in('id', selectedItemIds)

        if (deleteError) throw deleteError

        // Add undo action
        const itemCount = selectedItemIds.length
        addUndoAction(
          `Deleted ${itemCount} item${itemCount !== 1 ? 's' : ''}`,
          async () => {
            // Restore deleted items
            const supabaseClient = createClient()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabaseClient as any)
              .from('inventory_items')
              .update({ deleted_at: null })
              .in('id', selectedItemIds)
          },
          refreshAfterUndo
        )
      }

      onSuccess()
    } catch (err) {
      // Supabase errors have code, message, details, hint properties
      const supabaseError = err as { code?: string; message?: string; details?: string; hint?: string }
      const errorMessage = supabaseError.message || supabaseError.details || supabaseError.hint ||
        (err instanceof Error ? err.message : 'An error occurred')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const canApply =
    (action === 'move' && targetFolderId) ||
    (action === 'tag' && targetTagId) ||
    action === 'delete'

  const handleDeleteClick = () => {
    if (action === 'delete') {
      setShowDeleteConfirm(true)
    } else {
      handleApply()
    }
  }

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false)
    handleApply()
  }

  // Delete confirmation modal
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              Confirm Deletion
            </h3>
            <p className="mb-6 text-sm text-neutral-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''}</span>?
              This action can be undone within 10 seconds.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Bulk Edit ({selectedItemIds.length} items)
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-neutral-100"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <p className="mb-4 text-sm text-neutral-600">
            Select an action to apply to all selected items:
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Move to Folder */}
            <div
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                action === 'move'
                  ? 'border-primary bg-primary/10'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
              onClick={() => setAction('move')}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-accent" fill="oklch(95% 0.08 85.79)" />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">Move to Folder</p>
                  <p className="text-sm text-neutral-500">
                    Move items to a different folder
                  </p>
                </div>
              </div>
              {action === 'move' && (
                <div className="mt-3">
                  <select
                    value={targetFolderId}
                    onChange={(e) => setTargetFolderId(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select folder...</option>
                    <option value="root">Root (No Folder)</option>
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Add Tag */}
            <div
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                action === 'tag'
                  ? 'border-primary bg-primary/10'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
              onClick={() => setAction('tag')}
            >
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-neutral-500" />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">Add Tag</p>
                  <p className="text-sm text-neutral-500">
                    Apply a tag to all selected items
                  </p>
                </div>
              </div>
              {action === 'tag' && (
                <div className="mt-3">
                  <select
                    value={targetTagId}
                    onChange={(e) => setTargetTagId(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select tag...</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Delete */}
            <div
              className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                action === 'delete'
                  ? 'border-red-500 bg-red-50'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
              onClick={() => setAction('delete')}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="font-medium text-red-700">Delete Items</p>
                  <p className="text-sm text-red-500">
                    Permanently remove selected items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteClick}
            disabled={loading || !canApply}
            variant={action === 'delete' ? 'destructive' : 'default'}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action === 'delete' ? 'Delete' : 'Apply'}
          </Button>
        </div>
      </div>
    </div>
  )
}
