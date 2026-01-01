import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'

/**
 * Saved Search Tests
 *
 * Tests for saving and loading search criteria:
 * - Save search persists criteria
 * - Load search applies saved criteria
 */

interface SearchCriteria {
  query?: string
  status?: 'in_stock' | 'low_stock' | 'out_of_stock'
  folderId?: string
  tagIds?: string[]
  sortBy?: 'name' | 'quantity' | 'price' | 'date'
  sortOrder?: 'asc' | 'desc'
}

interface SavedSearch {
  id: string
  tenant_id: string
  user_id: string
  name: string
  criteria: SearchCriteria
  created_at: string
  updated_at: string
}

// Saved search storage
const savedSearches = new Map<string, SavedSearch>()

// Save search criteria
function saveSearch(params: {
  tenantId: string
  userId: string
  name: string
  criteria: SearchCriteria
}): { success: boolean; savedSearch?: SavedSearch; error?: string } {
  if (!params.name || params.name.trim() === '') {
    return { success: false, error: 'Search name is required' }
  }

  // Check for duplicate name for this user
  const existing = Array.from(savedSearches.values()).find(
    (s) =>
      s.tenant_id === params.tenantId &&
      s.user_id === params.userId &&
      s.name === params.name
  )

  if (existing) {
    // Update existing
    existing.criteria = params.criteria
    existing.updated_at = new Date().toISOString()
    return { success: true, savedSearch: existing }
  }

  const savedSearch: SavedSearch = {
    id: `search-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tenant_id: params.tenantId,
    user_id: params.userId,
    name: params.name,
    criteria: params.criteria,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  savedSearches.set(savedSearch.id, savedSearch)
  return { success: true, savedSearch }
}

// Load saved search
function loadSearch(
  searchId: string,
  userId: string,
  tenantId: string
): { success: boolean; criteria?: SearchCriteria; error?: string } {
  const savedSearch = savedSearches.get(searchId)

  if (!savedSearch) {
    return { success: false, error: 'Saved search not found' }
  }

  if (savedSearch.tenant_id !== tenantId || savedSearch.user_id !== userId) {
    return { success: false, error: 'Saved search not found' }
  }

  return { success: true, criteria: savedSearch.criteria }
}

// Get user's saved searches
function getUserSavedSearches(userId: string, tenantId: string): SavedSearch[] {
  return Array.from(savedSearches.values()).filter(
    (s) => s.user_id === userId && s.tenant_id === tenantId
  )
}

// Delete saved search
function deleteSavedSearch(
  searchId: string,
  userId: string,
  tenantId: string
): { success: boolean; error?: string } {
  const savedSearch = savedSearches.get(searchId)

  if (!savedSearch) {
    return { success: false, error: 'Saved search not found' }
  }

  if (savedSearch.tenant_id !== tenantId || savedSearch.user_id !== userId) {
    return { success: false, error: 'Saved search not found' }
  }

  savedSearches.delete(searchId)
  return { success: true }
}

// Apply saved criteria to search
function applySearchCriteria(
  criteria: SearchCriteria,
  items: Array<{ name: string; status: string; folderId: string | null }>
): typeof items {
  let results = [...items]

  if (criteria.query) {
    const q = criteria.query.toLowerCase()
    results = results.filter((item) => item.name.toLowerCase().includes(q))
  }

  if (criteria.status) {
    results = results.filter((item) => item.status === criteria.status)
  }

  if (criteria.folderId) {
    results = results.filter((item) => item.folderId === criteria.folderId)
  }

  return results
}

// Helper to clear state
function clearSavedSearches() {
  savedSearches.clear()
}

describe('Saved Search', () => {
  beforeEach(() => {
    clearSavedSearches()
  })

  describe('Save Search', () => {
    it('persists search criteria', () => {
      const criteria: SearchCriteria = {
        query: 'laptop',
        status: 'in_stock',
        sortBy: 'name',
        sortOrder: 'asc',
      }

      const result = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: 'My Laptops',
        criteria,
      })

      expect(result.success).toBe(true)
      expect(result.savedSearch!.name).toBe('My Laptops')
      expect(result.savedSearch!.criteria).toEqual(criteria)
    })

    it('stores all criteria fields', () => {
      const criteria: SearchCriteria = {
        query: 'electronics',
        status: 'low_stock',
        folderId: 'folder-1',
        tagIds: ['tag-1', 'tag-2'],
        sortBy: 'quantity',
        sortOrder: 'desc',
      }

      const result = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: 'Low Stock Electronics',
        criteria,
      })

      expect(result.savedSearch!.criteria.query).toBe('electronics')
      expect(result.savedSearch!.criteria.status).toBe('low_stock')
      expect(result.savedSearch!.criteria.folderId).toBe('folder-1')
      expect(result.savedSearch!.criteria.tagIds).toEqual(['tag-1', 'tag-2'])
    })

    it('updates existing search with same name', () => {
      // Save initial
      saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: 'My Search',
        criteria: { query: 'old query' },
      })

      // Save with same name
      const result = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: 'My Search',
        criteria: { query: 'new query' },
      })

      expect(result.success).toBe(true)
      expect(result.savedSearch!.criteria.query).toBe('new query')

      // Should only have one search
      const userSearches = getUserSavedSearches(TEST_USER_ID, TEST_TENANT_ID)
      expect(userSearches.length).toBe(1)
    })

    it('requires search name', () => {
      const result = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: '',
        criteria: { query: 'test' },
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('name is required')
    })
  })

  describe('Load Search', () => {
    it('applies saved search criteria', () => {
      // Save a search
      const saveResult = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: 'In Stock Items',
        criteria: {
          status: 'in_stock',
          sortBy: 'name',
        },
      })

      // Load it
      const loadResult = loadSearch(
        saveResult.savedSearch!.id,
        TEST_USER_ID,
        TEST_TENANT_ID
      )

      expect(loadResult.success).toBe(true)
      expect(loadResult.criteria!.status).toBe('in_stock')
      expect(loadResult.criteria!.sortBy).toBe('name')
    })

    it('returns error for non-existent search', () => {
      const result = loadSearch('non-existent-id', TEST_USER_ID, TEST_TENANT_ID)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('prevents loading other users searches', () => {
      const saveResult = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: 'other-user',
        name: 'Other User Search',
        criteria: { query: 'test' },
      })

      const loadResult = loadSearch(
        saveResult.savedSearch!.id,
        TEST_USER_ID,
        TEST_TENANT_ID
      )

      expect(loadResult.success).toBe(false)
      expect(loadResult.error).toContain('not found')
    })

    it('can apply loaded criteria to filter items', () => {
      const items = [
        { name: 'Laptop', status: 'in_stock', folderId: null },
        { name: 'Mouse', status: 'low_stock', folderId: null },
        { name: 'Keyboard', status: 'in_stock', folderId: 'folder-1' },
      ]

      const saveResult = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: 'In Stock Search',
        criteria: { status: 'in_stock' },
      })

      const loadResult = loadSearch(
        saveResult.savedSearch!.id,
        TEST_USER_ID,
        TEST_TENANT_ID
      )

      const filtered = applySearchCriteria(loadResult.criteria!, items)

      expect(filtered.length).toBe(2)
      expect(filtered.every((i) => i.status === 'in_stock')).toBe(true)
    })
  })

  describe('User Saved Searches', () => {
    it('lists all saved searches for user', () => {
      // Clear any previous state
      clearSavedSearches()

      const result1 = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: 'Search 1',
        criteria: { query: 'one' },
      })
      expect(result1.success).toBe(true)

      const result2 = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: 'Search 2',
        criteria: { query: 'two' },
      })
      expect(result2.success).toBe(true)

      // Verify both are different entries
      expect(result1.savedSearch!.id).not.toBe(result2.savedSearch!.id)

      const searches = getUserSavedSearches(TEST_USER_ID, TEST_TENANT_ID)

      expect(searches.length).toBe(2)
    })

    it('does not include other users searches', () => {
      // Clear any previous state
      clearSavedSearches()

      const myResult = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        name: 'My Search',
        criteria: {},
      })
      expect(myResult.success).toBe(true)

      const otherResult = saveSearch({
        tenantId: TEST_TENANT_ID,
        userId: 'other-user',
        name: 'Other Search',
        criteria: {},
      })
      expect(otherResult.success).toBe(true)

      const searches = getUserSavedSearches(TEST_USER_ID, TEST_TENANT_ID)

      expect(searches.length).toBe(1)
      expect(searches[0].name).toBe('My Search')
    })
  })
})
