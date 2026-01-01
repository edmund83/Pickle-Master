import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID } from '../utils/test-data'

/**
 * Folder Edge Cases Tests
 *
 * Tests for folder operations edge cases:
 * - Sort order increment
 * - Duplicate names allowed
 * - Non-existent folder error
 */

interface Folder {
  id: string
  tenant_id: string
  name: string
  parent_id: string | null
  sort_order: number
  color: string
  path: string[]
  depth: number
}

// Folder storage
const folders = new Map<string, Folder>()

// Get max sort order among siblings
function getMaxSiblingsSortOrder(parentId: string | null, tenantId: string): number {
  let maxOrder = 0
  for (const folder of folders.values()) {
    if (folder.tenant_id === tenantId && folder.parent_id === parentId) {
      if (folder.sort_order > maxOrder) {
        maxOrder = folder.sort_order
      }
    }
  }
  return maxOrder
}

// Create folder with auto-incrementing sort order
function createFolder(params: {
  tenantId: string
  name: string
  parentId?: string | null
  color?: string
}): { success: boolean; folder?: Folder; error?: string } {
  // Validate name
  if (!params.name || params.name.trim() === '') {
    return { success: false, error: 'Folder name is required' }
  }

  const parentId = params.parentId ?? null

  // If parent specified, verify it exists
  if (parentId !== null) {
    const parent = folders.get(parentId)
    if (!parent) {
      return { success: false, error: 'Parent folder not found' }
    }
    if (parent.tenant_id !== params.tenantId) {
      return { success: false, error: 'Parent folder not found' }
    }
  }

  // Get next sort order (max of siblings + 1)
  const maxSortOrder = getMaxSiblingsSortOrder(parentId, params.tenantId)
  const nextSortOrder = maxSortOrder + 1

  // Calculate path and depth
  let path: string[] = []
  let depth = 0
  if (parentId) {
    const parent = folders.get(parentId)!
    path = [...parent.path, parent.id]
    depth = parent.depth + 1
  }

  const folder: Folder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tenant_id: params.tenantId,
    name: params.name,
    parent_id: parentId,
    sort_order: nextSortOrder,
    color: params.color ?? '#3B82F6',
    path,
    depth,
  }

  folders.set(folder.id, folder)
  return { success: true, folder }
}

// Move item to folder
function moveItemToFolder(
  itemId: string,
  folderId: string | null,
  tenantId: string
): { success: boolean; error?: string } {
  // If moving to a folder, verify it exists
  if (folderId !== null) {
    const folder = folders.get(folderId)
    if (!folder) {
      return { success: false, error: 'Folder not found' }
    }
    if (folder.tenant_id !== tenantId) {
      return { success: false, error: 'Folder not found' }
    }
  }

  // Move would happen here
  return { success: true }
}

// Get folders with same name
function getFoldersWithName(name: string, tenantId: string): Folder[] {
  return Array.from(folders.values()).filter(
    (f) => f.tenant_id === tenantId && f.name === name
  )
}

// Get siblings (folders with same parent)
function getSiblings(parentId: string | null, tenantId: string): Folder[] {
  return Array.from(folders.values())
    .filter((f) => f.tenant_id === tenantId && f.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)
}

describe('Folder Edge Cases', () => {
  beforeEach(() => {
    folders.clear()
  })

  describe('Sort Order', () => {
    it('increments from siblings max sort_order', () => {
      // Create first folder
      const folder1 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Folder 1',
      })
      expect(folder1.folder!.sort_order).toBe(1)

      // Create second folder
      const folder2 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Folder 2',
      })
      expect(folder2.folder!.sort_order).toBe(2)

      // Create third folder
      const folder3 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Folder 3',
      })
      expect(folder3.folder!.sort_order).toBe(3)
    })

    it('starts at 1 for first folder in parent', () => {
      // Create parent
      const parent = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Parent',
      })

      // Create first child
      const child = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Child',
        parentId: parent.folder!.id,
      })

      expect(child.folder!.sort_order).toBe(1)
    })

    it('increments independently for each parent', () => {
      // Create two parents
      const parent1 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Parent 1',
      })
      const parent2 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Parent 2',
      })

      // Create children under parent 1
      createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Child 1-1',
        parentId: parent1.folder!.id,
      })
      createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Child 1-2',
        parentId: parent1.folder!.id,
      })

      // Create child under parent 2
      const child2 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Child 2-1',
        parentId: parent2.folder!.id,
      })

      // Should start at 1 for parent 2
      expect(child2.folder!.sort_order).toBe(1)
    })

    it('maintains order when getting siblings', () => {
      // Create folders in order
      createFolder({ tenantId: TEST_TENANT_ID, name: 'First' })
      createFolder({ tenantId: TEST_TENANT_ID, name: 'Second' })
      createFolder({ tenantId: TEST_TENANT_ID, name: 'Third' })

      const siblings = getSiblings(null, TEST_TENANT_ID)

      expect(siblings[0].name).toBe('First')
      expect(siblings[1].name).toBe('Second')
      expect(siblings[2].name).toBe('Third')
    })
  })

  describe('Duplicate Name', () => {
    it('allows folders with same name (no unique constraint)', () => {
      const result1 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Documents',
      })
      expect(result1.success).toBe(true)

      const result2 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Documents',
      })
      expect(result2.success).toBe(true)

      // Both folders exist
      const duplicates = getFoldersWithName('Documents', TEST_TENANT_ID)
      expect(duplicates.length).toBe(2)
    })

    it('allows same name in different parents', () => {
      const parent1 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Parent 1',
      })
      const parent2 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Parent 2',
      })

      const child1 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Shared Name',
        parentId: parent1.folder!.id,
      })
      const child2 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Shared Name',
        parentId: parent2.folder!.id,
      })

      expect(child1.success).toBe(true)
      expect(child2.success).toBe(true)
    })

    it('creates unique IDs for same-named folders', () => {
      const result1 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Same Name',
      })
      const result2 = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Same Name',
      })

      expect(result1.folder!.id).not.toBe(result2.folder!.id)
    })
  })

  describe('Non-existent Folder', () => {
    it('returns error when moving to non-existent folder', () => {
      const result = moveItemToFolder('item-1', 'non-existent-folder', TEST_TENANT_ID)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Folder not found')
    })

    it('returns error when creating under non-existent parent', () => {
      const result = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Child',
        parentId: 'non-existent-parent',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('returns error when accessing cross-tenant folder', () => {
      // Create folder in different tenant
      const otherTenant = createFolder({
        tenantId: 'other-tenant',
        name: 'Other Folder',
      })

      // Try to move item to it
      const result = moveItemToFolder('item-1', otherTenant.folder!.id, TEST_TENANT_ID)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Folder not found')
    })

    it('allows moving to null (root)', () => {
      const result = moveItemToFolder('item-1', null, TEST_TENANT_ID)

      expect(result.success).toBe(true)
    })
  })
})
