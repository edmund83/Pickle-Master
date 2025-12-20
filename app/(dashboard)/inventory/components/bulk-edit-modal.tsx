'use client'

import { useState } from 'react'
import { X, Loader2, FolderOpen, Tag, Trash2 } from 'lucide-react'
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
  const [action, setAction] = useState<BulkAction | null>(null)
  const [targetFolderId, setTargetFolderId] = useState<string>('')
  const [targetTagId, setTargetTagId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addUndoAction } = useUndo()

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
            for (const [itemId, folderId] of originalFolderIds) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase as any)
                .from('inventory_items')
                .update({ folder_id: folderId })
                .eq('id', itemId)
            }
          }
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
            for (const itemId of selectedItemIds) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase as any)
                .from('item_tags')
                .delete()
                .match({ item_id: itemId, tag_id: targetTagId })
            }
          }
        )
      } else if (action === 'delete') {
        // Soft delete items
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from('inventory_items')
              .update({ deleted_at: null })
              .in('id', selectedItemIds)
          }
        )
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const canApply =
    (action === 'move' && targetFolderId) ||
    (action === 'tag' && targetTagId) ||
    action === 'delete'

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
                  ? 'border-pickle-500 bg-pickle-50'
                  : 'border-neutral-200 hover:bg-neutral-50'
              }`}
              onClick={() => setAction('move')}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-neutral-500" />
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
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
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
                  ? 'border-pickle-500 bg-pickle-50'
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
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
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
            onClick={handleApply}
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
