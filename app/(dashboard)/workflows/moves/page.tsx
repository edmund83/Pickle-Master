'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Package, FolderOpen, Check, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InventoryItem, Folder } from '@/types/database.types'

export default function StockMovesPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [targetFolderId, setTargetFolderId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [moving, setMoving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      const [itemsResult, foldersResult] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('inventory_items')
          .select('*, folders(name, color)')
          .eq('tenant_id', profile.tenant_id)
          .is('deleted_at', null)
          .order('name', { ascending: true }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('folders')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('name', { ascending: true }),
      ])

      setItems((itemsResult.data || []) as InventoryItem[])
      setFolders((foldersResult.data || []) as Folder[])
    } finally {
      setLoading(false)
    }
  }

  function toggleItem(id: string) {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  function selectAll() {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
    }
  }

  async function handleMove() {
    if (selectedItems.size === 0 || !targetFolderId) return

    setMoving(true)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('inventory_items')
        .update({ folder_id: targetFolderId === 'root' ? null : targetFolderId })
        .in('id', Array.from(selectedItems))

      if (!error) {
        setSuccess(true)
        setSelectedItems(new Set())
        setTargetFolderId('')
        loadData()
        setTimeout(() => setSuccess(false), 3000)
      }
    } finally {
      setMoving(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const targetFolder = folders.find(f => f.id === targetFolderId)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Stock Moves</h1>
        <p className="mt-1 text-neutral-500">
          Move items between folders or locations
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-8 mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <Check className="h-5 w-5" />
          Items moved successfully!
        </div>
      )}

      <div className="p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Source Selection */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-900">Select Items</h2>
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                </div>
              ) : filteredItems.length > 0 ? (
                <ul className="divide-y divide-neutral-200">
                  {filteredItems.map((item) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const folder = (item as any).folders as { name: string; color: string } | null
                    return (
                      <li
                        key={item.id}
                        className={`flex cursor-pointer items-center gap-4 px-6 py-3 hover:bg-neutral-50 ${
                          selectedItems.has(item.id) ? 'bg-pickle-50' : ''
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-neutral-300 text-pickle-600"
                        />
                        <Package className="h-5 w-5 text-neutral-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-900 truncate">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            {item.sku && <span>SKU: {item.sku}</span>}
                            <span>Qty: {item.quantity}</span>
                            {folder && (
                              <span className="flex items-center gap-1">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: folder.color }}
                                />
                                {folder.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="py-12 text-center text-neutral-500">
                  No items found
                </div>
              )}
            </div>

            {selectedItems.size > 0 && (
              <div className="border-t border-neutral-200 px-6 py-3 bg-neutral-50">
                <span className="text-sm font-medium text-neutral-700">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
              </div>
            )}
          </div>

          {/* Target Selection */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Move To</h2>
            </div>

            <div className="p-6">
              <div className="space-y-2">
                <button
                  onClick={() => setTargetFolderId('root')}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                    targetFolderId === 'root'
                      ? 'border-pickle-500 bg-pickle-50'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <FolderOpen className="h-5 w-5 text-neutral-400" />
                  <span className="font-medium text-neutral-900">Root (No Folder)</span>
                </button>

                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setTargetFolderId(folder.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                      targetFolderId === folder.id
                        ? 'border-pickle-500 bg-pickle-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    <span className="font-medium text-neutral-900">{folder.name}</span>
                  </button>
                ))}
              </div>

              {/* Move Button */}
              <div className="mt-6">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedItems.size === 0 || !targetFolderId || moving}
                  onClick={handleMove}
                >
                  {moving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Move {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
                  {targetFolder && ` to ${targetFolder.name}`}
                  {targetFolderId === 'root' && ' to Root'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
