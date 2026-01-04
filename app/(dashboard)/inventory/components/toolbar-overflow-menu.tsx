'use client'

import { MoreHorizontal, CheckSquare, Upload, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface ToolbarOverflowMenuProps {
  onSelect: () => void
  onExport: () => void
  itemCount: number
  isExportDisabled?: boolean
}

export function ToolbarOverflowMenu({
  onSelect,
  onExport,
  itemCount,
  isExportDisabled = false,
}: ToolbarOverflowMenuProps) {
  const canSelect = itemCount > 0
  const canExport = !isExportDisabled && itemCount > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={canSelect ? onSelect : undefined}
          className={!canSelect ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          Select Items
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/settings/bulk-import" className="flex items-center w-full">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={canExport ? onExport : undefined}
          className={!canExport ? 'opacity-50 cursor-not-allowed' : ''}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
