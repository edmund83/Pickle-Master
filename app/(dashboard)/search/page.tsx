'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Search as SearchIcon, Package, Filter, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InventoryItem, Folder, Tag } from '@/types/database.types'

interface SearchFilters {
  status: string
  folderId: string
  tagId: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<InventoryItem[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    status: '',
    folderId: '',
    tagId: '',
  })

  // Load folders and tags for filters
  useEffect(() => {
    async function loadFilters() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return

      // Load folders and tags in parallel
      const [foldersResult, tagsResult] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from('folders').select('*').eq('tenant_id', profile.tenant_id),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).from('tags').select('*').eq('tenant_id', profile.tenant_id),
      ])

      setFolders((foldersResult.data || []) as Folder[])
      setTags((tagsResult.data || []) as Tag[])
    }

    loadFilters()
  }, [])

  const performSearch = useCallback(async () => {
    if (!query.trim() && !filters.status && !filters.folderId && !filters.tagId) {
      setResults([])
      return
    }

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

      // Build query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let searchQuery = (supabase as any)
        .from('inventory_items')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .is('deleted_at', null)

      // Text search
      if (query.trim()) {
        searchQuery = searchQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
      }

      // Apply filters
      if (filters.status) {
        searchQuery = searchQuery.eq('status', filters.status)
      }
      if (filters.folderId) {
        searchQuery = searchQuery.eq('folder_id', filters.folderId)
      }

      searchQuery = searchQuery.order('updated_at', { ascending: false }).limit(50)

      const { data: items } = await searchQuery
      setResults((items || []) as InventoryItem[])
    } finally {
      setLoading(false)
    }
  }, [query, filters])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(timer)
  }, [performSearch])

  const clearFilters = () => {
    setFilters({ status: '', folderId: '', tagId: '' })
  }

  const hasActiveFilters = filters.status || filters.folderId || filters.tagId

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Search</h1>
        <p className="mt-1 text-neutral-500">
          Find items across your entire inventory
        </p>
      </div>

      {/* Search Bar */}
      <div className="border-b border-neutral-200 bg-white px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search by name, SKU, or description..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 text-base"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 animate-spin" />
            )}
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-pickle-100 text-xs text-pickle-700">
                {[filters.status, filters.folderId, filters.tagId].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Status:</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="">All</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Folder:</label>
              <select
                value={filters.folderId}
                onChange={(e) => setFilters({ ...filters, folderId: e.target.value })}
                className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="">All Folders</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-neutral-700">Tag:</label>
              <select
                value={filters.tagId}
                onChange={(e) => setFilters({ ...filters, tagId: e.target.value })}
                className="h-9 rounded-lg border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-8">
        {results.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-neutral-500">
              Found {results.length} item{results.length !== 1 ? 's' : ''}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((item) => (
                <SearchResultCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : query || hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <SearchIcon className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">No results found</h3>
            <p className="mt-1 text-neutral-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <SearchIcon className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">Search your inventory</h3>
            <p className="mt-1 text-neutral-500">
              Enter a search term or use filters to find items
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SearchResultCard({ item }: { item: InventoryItem }) {
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
    <Link
      href={`/inventory/${item.id}`}
      className="group rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-neutral-100">
        {item.image_urls?.[0] ? (
          <img
            src={item.image_urls[0]}
            alt={item.name}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <Package className="h-10 w-10 text-neutral-300" />
        )}
      </div>

      <h3 className="font-medium text-neutral-900 group-hover:text-pickle-600 line-clamp-1">
        {item.name}
      </h3>
      {item.sku && (
        <p className="mt-0.5 text-xs text-neutral-500">SKU: {item.sku}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-900">
          {item.quantity} {item.unit}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            statusColors[item.status || 'in_stock'] || statusColors.in_stock
          }`}
        >
          {statusLabels[item.status || 'in_stock'] || 'In Stock'}
        </span>
      </div>
    </Link>
  )
}
