'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Package, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { InventoryItemWithTags, Folder } from '@/types/database.types'
import { EditableCell } from './editable-cell'
import { deleteItem } from '@/app/actions/inventory'

interface InventoryTableProps {
    items: InventoryItemWithTags[]
    folders: Folder[]
}

export function InventoryTable({ items, folders }: InventoryTableProps) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

    // Create a map of folder IDs to folder names for quick lookup
    const folderMap = new Map(folders.map(f => [f.id, f]))

    const handleDelete = async (itemId: string) => {
        setDeletingId(itemId)
        try {
            const result = await deleteItem(itemId)
            if (result.success) {
                router.refresh()
            } else {
                console.error('Delete failed:', result.error)
            }
        } finally {
            setDeletingId(null)
            setShowDeleteConfirm(null)
        }
    }

    const statusColors: Record<string, string> = {
        in_stock: 'bg-green-100 text-green-700',
        low_stock: 'bg-yellow-100 text-yellow-700',
        out_of_stock: 'bg-red-100 text-red-700',
    }

    const statusLabels: Record<string, string> = {
        in_stock: 'In Stock',
        low_stock: 'Low Stock',
        out_of_stock: 'Out of Stock',
    }

    return (
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-500">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium">Item</th>
                            <th className="px-4 py-3 text-left font-medium">SKU</th>
                            <th className="px-4 py-3 text-left font-medium">Category</th>
                            <th className="px-4 py-3 text-left font-medium">Location</th>
                            <th className="px-4 py-3 text-right font-medium">Stock</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-right font-medium">Price</th>
                            <th className="px-4 py-3 text-right font-medium">Cost</th>
                            <th className="px-4 py-3 text-right font-medium">Margin</th>
                            <th className="w-10 px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {items.map((item) => (
                            <tr key={item.id} className="group hover:bg-neutral-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-lg border border-neutral-200 bg-neutral-100">
                                            {item.image_urls?.[0] ? (
                                                <img
                                                    src={item.image_urls[0]}
                                                    alt={item.name || 'Item'}
                                                    className="h-full w-full rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <Package className="h-5 w-5 text-neutral-300" />
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            href={`/inventory/${item.id}`}
                                            className="font-medium text-neutral-900 hover:text-pickle-600 hover:underline"
                                        >
                                            {item.name}
                                        </Link>
                                    </div>
                                </td>
                                <td className="px-4 py-3 font-mono text-neutral-500">
                                    <EditableCell
                                        itemId={item.id || ''}
                                        field="sku"
                                        value={item.sku || ''}
                                    />
                                </td>
                                <td className="px-4 py-3 text-neutral-600">
                                    {item.folder_id && folderMap.has(item.folder_id) ? (
                                        <span
                                            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                                            style={{
                                                backgroundColor: `${folderMap.get(item.folder_id)?.color || '#6b7280'}20`,
                                                color: folderMap.get(item.folder_id)?.color || '#6b7280'
                                            }}
                                        >
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ backgroundColor: folderMap.get(item.folder_id)?.color || '#6b7280' }}
                                            />
                                            {folderMap.get(item.folder_id)?.name}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                                            Uncategorized
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-neutral-600">
                                    <EditableCell
                                        itemId={item.id || ''}
                                        field="location"
                                        value={item.location || ''}
                                    />
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-neutral-900">
                                    <div className="flex items-center justify-end gap-2">
                                        <EditableCell
                                            itemId={item.id || ''}
                                            field="quantity"
                                            value={item.quantity || 0}
                                            type="number"
                                            align="right"
                                            className="w-20"
                                        />
                                        <span className="text-neutral-500 text-xs">{item.unit}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[item.status || 'in_stock'] || statusColors.in_stock
                                            }`}
                                    >
                                        {statusLabels[item.status || 'in_stock'] || 'In Stock'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-neutral-600">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-xs text-neutral-400">RM</span>
                                        <EditableCell
                                            itemId={item.id || ''}
                                            field="price"
                                            value={item.price || 0}
                                            type="number"
                                            align="right"
                                            className="w-24"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right text-neutral-600">
                                    <div className="flex items-center justify-end gap-1">
                                        <span className="text-xs text-neutral-400">RM</span>
                                        <EditableCell
                                            itemId={item.id || ''}
                                            field="cost_price"
                                            value={item.cost_price || 0}
                                            type="number"
                                            align="right"
                                            className="w-24"
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {item.cost_price && item.cost_price > 0 ? (
                                        <span className={`font-medium ${((item.price || 0) - item.cost_price) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {((((item.price || 0) - item.cost_price) / item.cost_price) * 100).toFixed(1)}%
                                        </span>
                                    ) : (
                                        <span className="text-neutral-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-neutral-400 opacity-0 group-hover:opacity-100"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <Link href={`/inventory/${item.id}`}>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                            </Link>
                                            <Link href={`/inventory/${item.id}/edit`}>
                                                <DropdownMenuItem>Edit Item</DropdownMenuItem>
                                            </Link>
                                            <Link href={`/inventory/${item.id}#checkout`}>
                                                <DropdownMenuItem>Check In/Out</DropdownMenuItem>
                                            </Link>
                                            {showDeleteConfirm === item.id ? (
                                                <div className="px-2 py-1.5">
                                                    <p className="text-xs text-neutral-500 mb-2">Delete this item?</p>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-7 text-xs"
                                                            onClick={() => item.id && handleDelete(item.id)}
                                                            disabled={deletingId === item.id}
                                                        >
                                                            {deletingId === item.id ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                'Confirm'
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 text-xs"
                                                            onClick={() => setShowDeleteConfirm(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => setShowDeleteConfirm(item.id)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
