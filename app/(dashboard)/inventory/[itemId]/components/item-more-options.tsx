'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, FolderOpen, Copy, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { DeleteItemDialog } from './delete-item-dialog'
import { MoveToFolderModal } from './move-to-folder-modal'
import { duplicateItem } from '@/app/actions/inventory'

interface ItemMoreOptionsProps {
  itemId: string
  itemName: string
  currentFolderId: string | null
  currentFolderName: string | null
}

export function ItemMoreOptions({
  itemId,
  itemName,
  currentFolderId,
  currentFolderName,
}: ItemMoreOptionsProps) {
  const router = useRouter()
  const [openModal, setOpenModal] = useState<'move' | 'delete' | null>(null)
  const [isDuplicating, startDuplicateTransition] = useTransition()

  const handleDuplicate = () => {
    startDuplicateTransition(async () => {
      const result = await duplicateItem(itemId)
      if (result.success && result.data?.newItemId) {
        router.push(`/inventory/${result.data.newItemId}`)
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isDuplicating}>
            {isDuplicating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpenModal('move')}>
            <FolderOpen className="h-4 w-4 text-accent" fill="oklch(95% 0.08 85.79)" />
            Move to Folder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 text-neutral-500" />
            Duplicate Item
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenModal('delete')}
            className="text-red-600 hover:!bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MoveToFolderModal
        isOpen={openModal === 'move'}
        onClose={() => setOpenModal(null)}
        itemId={itemId}
        itemName={itemName}
        currentFolderId={currentFolderId}
        currentFolderName={currentFolderName}
      />

      <DeleteItemDialog
        isOpen={openModal === 'delete'}
        onClose={() => setOpenModal(null)}
        itemId={itemId}
        itemName={itemName}
      />
    </>
  )
}
