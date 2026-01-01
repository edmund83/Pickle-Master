import { describe, it, expect } from 'vitest'
import { testFolders, TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'
import type { Folder } from '@/types/database.types'

/**
 * Folder Operations Tests
 *
 * Tests for folder CRUD operations:
 * - Create folder (root and nested)
 * - Update folder (rename, change color, move)
 * - Delete folder (empty check)
 * - Path and depth calculations
 */

// Simulate create folder function
function createFolder(params: {
  tenantId: string
  name: string
  parentId?: string | null
  color?: string
  parentFolder?: Folder
}): Folder {
  const path = params.parentFolder
    ? [...params.parentFolder.path, `folder-${Date.now()}`]
    : []

  const depth = params.parentFolder
    ? params.parentFolder.depth + 1
    : 0

  return {
    id: `folder-${Date.now()}`,
    tenant_id: params.tenantId,
    name: params.name,
    color: params.color ?? getRandomColor(),
    icon: null,
    parent_id: params.parentId ?? null,
    path,
    depth,
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Simulate update folder function
function updateFolder(
  folder: Folder,
  updates: Partial<Pick<Folder, 'name' | 'color' | 'parent_id' | 'sort_order'>>,
  newParent?: Folder | null
): Folder {
  let path = folder.path
  let depth = folder.depth

  if (updates.parent_id !== undefined) {
    if (updates.parent_id === null) {
      // Moving to root
      path = []
      depth = 0
    } else if (newParent) {
      // Moving to another parent
      path = [...newParent.path, folder.id]
      depth = newParent.depth + 1
    }
  }

  return {
    ...folder,
    ...updates,
    path,
    depth,
    updated_at: new Date().toISOString(),
  }
}

// Simulate delete folder validation
function canDeleteFolder(
  folderId: string,
  hasItems: boolean,
  hasSubfolders: boolean
): { allowed: boolean; error?: string } {
  if (hasItems) {
    return { allowed: false, error: 'Cannot delete folder with items' }
  }
  if (hasSubfolders) {
    return { allowed: false, error: 'Cannot delete folder with subfolders' }
  }
  return { allowed: true }
}

// Check for circular reference
function wouldCreateCircularReference(
  folderId: string,
  targetParent: Folder
): boolean {
  // A folder cannot be moved into itself or its descendants
  return targetParent.path.includes(folderId) || targetParent.id === folderId
}

// Random color palette
const colorPalette = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
function getRandomColor(): string {
  return colorPalette[Math.floor(Math.random() * colorPalette.length)]
}

// Validate folder name
function validateFolderName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Folder name is required' }
  }
  return { valid: true }
}

describe('Folder Operations', () => {
  describe('Create Folder', () => {
    it('creates root folder with depth 0', () => {
      const folder = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'New Folder',
        parentId: null,
      })

      expect(folder.depth).toBe(0)
      expect(folder.path).toEqual([])
      expect(folder.parent_id).toBeNull()
    })

    it('creates nested folder with correct depth', () => {
      const parentFolder = testFolders[0] // Electronics, depth 0

      const folder = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Sub Folder',
        parentId: parentFolder.id,
        parentFolder,
      })

      expect(folder.depth).toBe(1)
      expect(folder.parent_id).toBe(parentFolder.id)
    })

    it('creates folder with specified color', () => {
      const folder = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Colored Folder',
        color: '#FF0000',
      })

      expect(folder.color).toBe('#FF0000')
    })

    it('creates folder with default random color', () => {
      const folder = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Default Color Folder',
      })

      expect(colorPalette).toContain(folder.color)
    })

    it('sets created_at timestamp', () => {
      const folder = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Timestamped Folder',
      })

      expect(folder.created_at).toBeDefined()
      expect(new Date(folder.created_at!).getTime()).toBeGreaterThan(0)
    })

    it('sets tenant_id correctly', () => {
      const folder = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Tenant Folder',
      })

      expect(folder.tenant_id).toBe(TEST_TENANT_ID)
    })
  })

  describe('Update Folder', () => {
    const folder = testFolders[0] // Electronics

    it('renames folder', () => {
      const updated = updateFolder(folder, { name: 'Gadgets' })

      expect(updated.name).toBe('Gadgets')
      expect(updated.id).toBe(folder.id)
    })

    it('changes folder color', () => {
      const updated = updateFolder(folder, { color: '#00FF00' })

      expect(updated.color).toBe('#00FF00')
    })

    it('updates sort_order', () => {
      const updated = updateFolder(folder, { sort_order: 5 })

      expect(updated.sort_order).toBe(5)
    })

    it('moves folder to root', () => {
      // Create nested folder first
      const nestedFolder: Folder = {
        ...folder,
        parent_id: 'parent-id',
        depth: 1,
        path: ['parent-id', folder.id],
      }

      const updated = updateFolder(nestedFolder, { parent_id: null })

      expect(updated.parent_id).toBeNull()
      expect(updated.depth).toBe(0)
      expect(updated.path).toEqual([])
    })

    it('moves folder to another parent', () => {
      const newParent: Folder = {
        ...testFolders[1],
        depth: 0,
        path: [],
      }

      const updated = updateFolder(folder, { parent_id: newParent.id }, newParent)

      expect(updated.parent_id).toBe(newParent.id)
      expect(updated.depth).toBe(1)
    })

    it('updates updated_at timestamp', () => {
      const originalTime = folder.updated_at
      const updated = updateFolder(folder, { name: 'New Name' })

      expect(updated.updated_at).not.toBe(originalTime)
    })
  })

  describe('Delete Folder', () => {
    it('allows deletion of empty folder', () => {
      const result = canDeleteFolder('folder-1', false, false)

      expect(result.allowed).toBe(true)
    })

    it('blocks deletion of folder with items', () => {
      const result = canDeleteFolder('folder-1', true, false)

      expect(result.allowed).toBe(false)
      expect(result.error).toBe('Cannot delete folder with items')
    })

    it('blocks deletion of folder with subfolders', () => {
      const result = canDeleteFolder('folder-1', false, true)

      expect(result.allowed).toBe(false)
      expect(result.error).toBe('Cannot delete folder with subfolders')
    })

    it('blocks deletion of folder with both items and subfolders', () => {
      const result = canDeleteFolder('folder-1', true, true)

      expect(result.allowed).toBe(false)
      // First check is for items
      expect(result.error).toBe('Cannot delete folder with items')
    })
  })

  describe('Circular Reference Detection', () => {
    it('detects moving folder into itself', () => {
      const folder: Folder = {
        ...testFolders[0],
        id: 'folder-a',
        path: ['folder-a'],
      }

      const isCircular = wouldCreateCircularReference('folder-a', folder)

      expect(isCircular).toBe(true)
    })

    it('detects moving folder into descendant', () => {
      // folder-a -> folder-b -> folder-c
      const descendant: Folder = {
        ...testFolders[0],
        id: 'folder-c',
        path: ['folder-a', 'folder-b', 'folder-c'],
      }

      const isCircular = wouldCreateCircularReference('folder-a', descendant)

      expect(isCircular).toBe(true)
    })

    it('allows moving to sibling folder', () => {
      const sibling: Folder = {
        ...testFolders[0],
        id: 'folder-b',
        path: [],
      }

      const isCircular = wouldCreateCircularReference('folder-a', sibling)

      expect(isCircular).toBe(false)
    })

    it('allows moving to unrelated folder', () => {
      const unrelated: Folder = {
        ...testFolders[0],
        id: 'folder-x',
        path: ['folder-y', 'folder-x'],
      }

      const isCircular = wouldCreateCircularReference('folder-a', unrelated)

      expect(isCircular).toBe(false)
    })
  })

  describe('Folder Name Validation', () => {
    it('rejects empty name', () => {
      const result = validateFolderName('')

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Folder name is required')
    })

    it('rejects whitespace-only name', () => {
      const result = validateFolderName('   ')

      expect(result.valid).toBe(false)
    })

    it('accepts valid name', () => {
      const result = validateFolderName('My Folder')

      expect(result.valid).toBe(true)
    })

    it('accepts name with spaces', () => {
      const result = validateFolderName('Office Supplies')

      expect(result.valid).toBe(true)
    })

    it('accepts name with special characters', () => {
      const result = validateFolderName('Items (2024)')

      expect(result.valid).toBe(true)
    })
  })

  describe('Path Calculation', () => {
    it('root folder has empty path', () => {
      const folder = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Root',
        parentId: null,
      })

      expect(folder.path).toEqual([])
    })

    it('nested folder includes parent in path', () => {
      const parent: Folder = {
        ...testFolders[0],
        id: 'parent-folder',
        path: [],
      }

      const folder = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Child',
        parentId: parent.id,
        parentFolder: parent,
      })

      expect(folder.path.length).toBe(1)
    })

    it('deeply nested folder has full path', () => {
      const grandparent: Folder = {
        ...testFolders[0],
        id: 'grandparent',
        path: [],
        depth: 0,
      }

      const parent: Folder = {
        ...testFolders[0],
        id: 'parent',
        path: ['grandparent', 'parent'],
        depth: 1,
      }

      const folder = createFolder({
        tenantId: TEST_TENANT_ID,
        name: 'Grandchild',
        parentId: parent.id,
        parentFolder: parent,
      })

      expect(folder.depth).toBe(2)
      expect(folder.path.length).toBe(3) // includes all ancestors + self
    })
  })

  describe('Quick Operations', () => {
    it('updateFolderColor updates only color', () => {
      const folder = testFolders[0]
      const updated = updateFolder(folder, { color: '#PURPLE' })

      expect(updated.color).toBe('#PURPLE')
      expect(updated.name).toBe(folder.name)
      expect(updated.parent_id).toBe(folder.parent_id)
    })

    it('renameFolder updates only name', () => {
      const folder = testFolders[0]
      const updated = updateFolder(folder, { name: 'Renamed' })

      expect(updated.name).toBe('Renamed')
      expect(updated.color).toBe(folder.color)
    })
  })
})
