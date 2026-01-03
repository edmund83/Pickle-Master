import { describe, it, expect, beforeEach } from 'vitest'
import { TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'

/**
 * Activity Log Tests
 *
 * Tests for activity logging across various operations:
 * - Item deletion
 * - Item duplication
 * - Folder move
 * - Tag changes
 * - Folder deletion
 * - Checkout
 * - Return
 * - Bulk import
 */

interface ActivityLog {
  id: string
  tenant_id: string
  user_id: string
  user_name: string
  entity_type: 'item' | 'folder' | 'checkout' | 'import' | 'tag'
  entity_id: string
  action: string
  details: Record<string, unknown>
  created_at: string
}

// Activity log store
const activityLogs: ActivityLog[] = []

// Log activity
function logActivity(params: {
  tenantId: string
  userId: string
  userName: string
  entityType: ActivityLog['entity_type']
  entityId: string
  action: string
  details: Record<string, unknown>
}): ActivityLog {
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tenant_id: params.tenantId,
    user_id: params.userId,
    user_name: params.userName,
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    details: params.details,
    created_at: new Date().toISOString(),
  }
  activityLogs.push(log)
  return log
}

// Log item deletion
function logItemDeletion(params: {
  tenantId: string
  userId: string
  userName: string
  itemId: string
  itemName: string
}): ActivityLog {
  return logActivity({
    tenantId: params.tenantId,
    userId: params.userId,
    userName: params.userName,
    entityType: 'item',
    entityId: params.itemId,
    action: 'delete',
    details: {
      item_name: params.itemName,
      deleted_by: params.userName,
    },
  })
}

// Log item duplication
function logItemDuplication(params: {
  tenantId: string
  userId: string
  userName: string
  originalItemId: string
  newItemId: string
  itemName: string
}): ActivityLog {
  return logActivity({
    tenantId: params.tenantId,
    userId: params.userId,
    userName: params.userName,
    entityType: 'item',
    entityId: params.newItemId,
    action: 'duplicate',
    details: {
      original_item_id: params.originalItemId,
      item_name: params.itemName,
      duplicated_by: params.userName,
    },
  })
}

// Log folder move
function logFolderMove(params: {
  tenantId: string
  userId: string
  userName: string
  itemId: string
  itemName: string
  fromFolderId: string | null
  fromFolderName: string | null
  toFolderId: string | null
  toFolderName: string | null
}): ActivityLog {
  return logActivity({
    tenantId: params.tenantId,
    userId: params.userId,
    userName: params.userName,
    entityType: 'item',
    entityId: params.itemId,
    action: 'move',
    details: {
      item_name: params.itemName,
      from_folder_id: params.fromFolderId,
      from_folder_name: params.fromFolderName ?? 'Root',
      to_folder_id: params.toFolderId,
      to_folder_name: params.toFolderName ?? 'Root',
    },
  })
}

// Log tag changes
function logTagChanges(params: {
  tenantId: string
  userId: string
  userName: string
  itemId: string
  itemName: string
  addedTags: string[]
  removedTags: string[]
}): ActivityLog {
  return logActivity({
    tenantId: params.tenantId,
    userId: params.userId,
    userName: params.userName,
    entityType: 'tag',
    entityId: params.itemId,
    action: 'update_tags',
    details: {
      item_name: params.itemName,
      added_tags: params.addedTags,
      removed_tags: params.removedTags,
    },
  })
}

// Log folder deletion
function logFolderDeletion(params: {
  tenantId: string
  userId: string
  userName: string
  folderId: string
  folderName: string
}): ActivityLog {
  return logActivity({
    tenantId: params.tenantId,
    userId: params.userId,
    userName: params.userName,
    entityType: 'folder',
    entityId: params.folderId,
    action: 'delete',
    details: {
      folder_name: params.folderName,
      deleted_by: params.userName,
    },
  })
}

// Log checkout
function logCheckout(params: {
  tenantId: string
  userId: string
  userName: string
  checkoutId: string
  itemId: string
  itemName: string
  quantity: number
  assigneeName: string
}): ActivityLog {
  return logActivity({
    tenantId: params.tenantId,
    userId: params.userId,
    userName: params.userName,
    entityType: 'checkout',
    entityId: params.checkoutId,
    action: 'checkout',
    details: {
      item_id: params.itemId,
      item_name: params.itemName,
      quantity: params.quantity,
      assignee_name: params.assigneeName,
      checked_out_by: params.userName,
    },
  })
}

// Log return
function logReturn(params: {
  tenantId: string
  userId: string
  userName: string
  checkoutId: string
  itemId: string
  itemName: string
  quantity: number
  condition: 'good' | 'damaged' | 'needs_repair' | 'lost'
}): ActivityLog {
  return logActivity({
    tenantId: params.tenantId,
    userId: params.userId,
    userName: params.userName,
    entityType: 'checkout',
    entityId: params.checkoutId,
    action: 'return',
    details: {
      item_id: params.itemId,
      item_name: params.itemName,
      quantity: params.quantity,
      condition: params.condition,
      returned_by: params.userName,
    },
  })
}

// Log bulk import
function logBulkImport(params: {
  tenantId: string
  userId: string
  userName: string
  successCount: number
  failedCount: number
  skippedCount: number
  createdItemIds: string[]
}): ActivityLog {
  return logActivity({
    tenantId: params.tenantId,
    userId: params.userId,
    userName: params.userName,
    entityType: 'import',
    entityId: `import-${Date.now()}`,
    action: 'bulk_import',
    details: {
      success_count: params.successCount,
      failed_count: params.failedCount,
      skipped_count: params.skippedCount,
      created_item_ids: params.createdItemIds,
      imported_by: params.userName,
    },
  })
}

// Get activity logs for entity
function getActivityLogs(entityId: string): ActivityLog[] {
  return activityLogs.filter((log) => log.entity_id === entityId)
}

describe('Activity Logging', () => {
  beforeEach(() => {
    activityLogs.length = 0
  })

  describe('Item Deletion', () => {
    it('records deletion with user info', () => {
      const log = logItemDeletion({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        itemId: 'item-1',
        itemName: 'Laptop',
      })

      expect(log.action).toBe('delete')
      expect(log.details.deleted_by).toBe('John Doe')
      expect(log.details.item_name).toBe('Laptop')
    })

    it('stores user_id and user_name', () => {
      const log = logItemDeletion({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        itemId: 'item-1',
        itemName: 'Laptop',
      })

      expect(log.user_id).toBe(TEST_USER_ID)
      expect(log.user_name).toBe('John Doe')
    })
  })

  describe('Item Duplication', () => {
    it('records duplication action', () => {
      const log = logItemDuplication({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        originalItemId: 'item-1',
        newItemId: 'item-2',
        itemName: 'Laptop',
      })

      expect(log.action).toBe('duplicate')
      expect(log.details.original_item_id).toBe('item-1')
      expect(log.entity_id).toBe('item-2')
    })

    it('includes duplicated_by user', () => {
      const log = logItemDuplication({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Jane Smith',
        originalItemId: 'item-1',
        newItemId: 'item-2',
        itemName: 'Laptop',
      })

      expect(log.details.duplicated_by).toBe('Jane Smith')
    })
  })

  describe('Folder Move', () => {
    it('records from_folder and to_folder names', () => {
      const log = logFolderMove({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        itemId: 'item-1',
        itemName: 'Laptop',
        fromFolderId: 'folder-1',
        fromFolderName: 'Warehouse A',
        toFolderId: 'folder-2',
        toFolderName: 'Warehouse B',
      })

      expect(log.details.from_folder_name).toBe('Warehouse A')
      expect(log.details.to_folder_name).toBe('Warehouse B')
    })

    it('uses Root for null folder', () => {
      const log = logFolderMove({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        itemId: 'item-1',
        itemName: 'Laptop',
        fromFolderId: null,
        fromFolderName: null,
        toFolderId: 'folder-1',
        toFolderName: 'Warehouse A',
      })

      expect(log.details.from_folder_name).toBe('Root')
    })
  })

  describe('Tag Changes', () => {
    it('records tag changes', () => {
      const log = logTagChanges({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        itemId: 'item-1',
        itemName: 'Laptop',
        addedTags: ['Electronics', 'High Value'],
        removedTags: ['Old Tag'],
      })

      expect(log.action).toBe('update_tags')
      expect(log.details.added_tags).toEqual(['Electronics', 'High Value'])
      expect(log.details.removed_tags).toEqual(['Old Tag'])
    })

    it('handles empty tag arrays', () => {
      const log = logTagChanges({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        itemId: 'item-1',
        itemName: 'Laptop',
        addedTags: [],
        removedTags: ['Removed Tag'],
      })

      expect(log.details.added_tags).toEqual([])
      expect(log.details.removed_tags).toEqual(['Removed Tag'])
    })
  })

  describe('Folder Deletion', () => {
    it('records folder deletion', () => {
      const log = logFolderDeletion({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        folderId: 'folder-1',
        folderName: 'Old Warehouse',
      })

      expect(log.action).toBe('delete')
      expect(log.entity_type).toBe('folder')
      expect(log.details.folder_name).toBe('Old Warehouse')
    })

    it('includes deleted_by user', () => {
      const log = logFolderDeletion({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Admin User',
        folderId: 'folder-1',
        folderName: 'Old Warehouse',
      })

      expect(log.details.deleted_by).toBe('Admin User')
    })
  })

  describe('Checkout', () => {
    it('records checkout with quantity and assignee', () => {
      const log = logCheckout({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        checkoutId: 'co-1',
        itemId: 'item-1',
        itemName: 'Laptop',
        quantity: 2,
        assigneeName: 'Bob Smith',
      })

      expect(log.action).toBe('checkout')
      expect(log.details.quantity).toBe(2)
      expect(log.details.assignee_name).toBe('Bob Smith')
    })

    it('includes item details', () => {
      const log = logCheckout({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        checkoutId: 'co-1',
        itemId: 'item-1',
        itemName: 'Laptop',
        quantity: 1,
        assigneeName: 'Bob Smith',
      })

      expect(log.details.item_id).toBe('item-1')
      expect(log.details.item_name).toBe('Laptop')
    })
  })

  describe('Return', () => {
    it('records return with condition', () => {
      const log = logReturn({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        checkoutId: 'co-1',
        itemId: 'item-1',
        itemName: 'Laptop',
        quantity: 1,
        condition: 'good',
      })

      expect(log.action).toBe('return')
      expect(log.details.condition).toBe('good')
    })

    it('records damaged condition', () => {
      const log = logReturn({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        checkoutId: 'co-1',
        itemId: 'item-1',
        itemName: 'Laptop',
        quantity: 1,
        condition: 'damaged',
      })

      expect(log.details.condition).toBe('damaged')
    })

    it('includes returned_by user', () => {
      const log = logReturn({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Jane Smith',
        checkoutId: 'co-1',
        itemId: 'item-1',
        itemName: 'Laptop',
        quantity: 1,
        condition: 'good',
      })

      expect(log.details.returned_by).toBe('Jane Smith')
    })
  })

  describe('Bulk Import', () => {
    it('records bulk import action', () => {
      const log = logBulkImport({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        successCount: 50,
        failedCount: 2,
        skippedCount: 3,
        createdItemIds: ['item-1', 'item-2', 'item-3'],
      })

      expect(log.action).toBe('bulk_import')
      expect(log.entity_type).toBe('import')
    })

    it('includes import statistics', () => {
      const log = logBulkImport({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        successCount: 50,
        failedCount: 2,
        skippedCount: 3,
        createdItemIds: ['item-1', 'item-2'],
      })

      expect(log.details.success_count).toBe(50)
      expect(log.details.failed_count).toBe(2)
      expect(log.details.skipped_count).toBe(3)
    })

    it('includes imported_by user', () => {
      const log = logBulkImport({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Import Admin',
        successCount: 10,
        failedCount: 0,
        skippedCount: 0,
        createdItemIds: [],
      })

      expect(log.details.imported_by).toBe('Import Admin')
    })
  })
})
