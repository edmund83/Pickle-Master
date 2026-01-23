'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Search, Package, Clock, ArrowRight, Loader2 } from 'lucide-react'
import { cn, escapeSqlLike } from '@/lib/utils'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth-store'
import type { InventoryItem } from '@/types/database.types'

const RECENT_SEARCHES_KEY = 'stockzip-recent-searches'
const MAX_RECENT_SEARCHES = 5
const MAX_RESULTS = 8

// Explicit columns to select (avoid select('*'))
const SEARCH_COLUMNS = 'id, name, sku, quantity, unit, image_urls, status'

interface RecentSearch {
  query: string
  timestamp: number
}

export function GlobalSearchModal() {
  const { isOpen, closeSearch } = useGlobalSearch()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<InventoryItem[]>([])
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [mounted, setMounted] = useState(false)

  // Get tenantId from auth store (cached, no API call needed)
  const tenantId = useAuthStore((state) => state.tenantId)
  const fetchAuthIfNeeded = useAuthStore((state) => state.fetchAuthIfNeeded)

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
        if (stored) {
          setRecentSearches(JSON.parse(stored))
        }
      } catch {
        // Ignore parsing errors
      }
    }
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery('')
      setResults([])
      setSelectedIndex(-1)
    }
  }, [isOpen])

  // Save recent search to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return

    const newSearch: RecentSearch = {
      query: searchQuery.trim(),
      timestamp: Date.now(),
    }

    setRecentSearches((prev) => {
      // Remove duplicates and add new search at the beginning
      const filtered = prev.filter((s) => s.query.toLowerCase() !== searchQuery.toLowerCase())
      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES)

      // Save to localStorage
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage errors
      }

      return updated
    })
  }, [])

  // Search function - optimized to use cached tenantId
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      // Use cached tenantId from store, or fetch if needed (one-time)
      let currentTenantId = tenantId
      if (!currentTenantId) {
        const authResult = await fetchAuthIfNeeded()
        currentTenantId = authResult?.tenantId ?? null
      }

      if (!currentTenantId) {
        setResults([])
        return
      }

      // Single Supabase call with explicit columns (no auth.getUser, no profile query)
      // Escape SQL wildcards to prevent pattern injection
      const escapedQuery = escapeSqlLike(searchQuery)
      const { data: items } = await (supabase as any)
        .from('inventory_items')
        .select(SEARCH_COLUMNS)
        .eq('tenant_id', currentTenantId)
        .is('deleted_at', null)
        .or(`name.ilike.%${escapedQuery}%,sku.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%`)
        .order('updated_at', { ascending: false })
        .limit(MAX_RESULTS)

      setResults((items || []) as InventoryItem[])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [tenantId, fetchAuthIfNeeded])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const totalItems = results.length + recentSearches.length

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
        break
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0) {
          if (selectedIndex < results.length) {
            // Navigate to item
            const item = results[selectedIndex]
            saveRecentSearch(query)
            closeSearch()
            router.push(`/inventory/${item.id}`)
          } else {
            // Apply recent search
            const recentIndex = selectedIndex - results.length
            const recent = recentSearches[recentIndex]
            if (recent) {
              setQuery(recent.query)
              setSelectedIndex(-1)
            }
          }
        } else if (query.trim()) {
          // Navigate to full search page
          saveRecentSearch(query)
          closeSearch()
          router.push(`/search?q=${encodeURIComponent(query)}`)
        }
        break
    }
  }, [results, recentSearches, selectedIndex, query, closeSearch, router, saveRecentSearch])

  // Handle item click
  const handleItemClick = useCallback((item: InventoryItem) => {
    saveRecentSearch(query)
    closeSearch()
    router.push(`/inventory/${item.id}`)
  }, [query, closeSearch, router, saveRecentSearch])

  // Handle recent search click
  const handleRecentClick = useCallback((recent: RecentSearch) => {
    setQuery(recent.query)
    setSelectedIndex(-1)
  }, [])

  // Handle view all click
  const handleViewAll = useCallback(() => {
    if (query.trim()) {
      saveRecentSearch(query)
    }
    closeSearch()
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }, [query, closeSearch, router, saveRecentSearch])

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeSearch()
    }
  }, [closeSearch])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-lg mx-4',
          'bg-white rounded-2xl shadow-2xl',
          'overflow-hidden',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Search inventory"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search inventory..."
            className="flex-1 text-base bg-transparent outline-none placeholder:text-neutral-400"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {loading && <Loader2 className="h-5 w-5 text-neutral-400 animate-spin shrink-0" />}
          <button
            onClick={closeSearch}
            className="flex items-center justify-center h-6 px-2 text-xs font-medium text-neutral-500 bg-neutral-100 rounded hover:bg-neutral-200 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="px-4 py-3">
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Recent Searches
              </h3>
              <ul className="space-y-1">
                {recentSearches.map((recent, index) => (
                  <li key={recent.timestamp}>
                    <button
                      onClick={() => handleRecentClick(recent)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                        selectedIndex === results.length + index
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-neutral-100'
                      )}
                    >
                      <Clock className="h-4 w-4 text-neutral-400 shrink-0" />
                      <span className="text-sm text-neutral-700">{recent.query}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Search Results */}
          {query && (
            <div className="px-4 py-3">
              {results.length > 0 ? (
                <>
                  <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                    Results
                  </h3>
                  <ul className="space-y-1">
                    {results.map((item, index) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleItemClick(item)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                            selectedIndex === index
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-neutral-100'
                          )}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 shrink-0">
                            {item.image_urls?.[0] ? (
                              <img
                                src={item.image_urls[0]}
                                alt=""
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-neutral-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-neutral-500 truncate">
                              {item.sku && `SKU: ${item.sku} · `}
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : !loading ? (
                <div className="py-8 text-center">
                  <Package className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">No items found</p>
                </div>
              ) : null}
            </div>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Search className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm text-neutral-500">Start typing to search your inventory</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
          <button
            onClick={handleViewAll}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {query ? 'View all results' : 'Go to advanced search'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
