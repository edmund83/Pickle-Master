import { describe, it, expect } from 'vitest'
import { testActivityLogs, TEST_TENANT_ID, TEST_USER_ID } from '../utils/test-data'
import { filterActivityLogs } from '../utils/supabase-mock'
import type { ActivityLog } from '@/types/database.types'

/**
 * Activity Logging Tests
 *
 * Tests for activity log behavior:
 * - Create operations logged
 * - Update operations logged
 * - Delete operations logged
 * - Quantity changes logged with before/after
 * - User attribution recorded
 */

// Simulate activity log creation
function createActivityLog(params: {
  tenantId: string
  userId: string
  userName: string
  entityType: 'item' | 'folder' | 'checkout' | 'return'
  entityId: string
  entityName: string
  actionType: string
  quantityDelta?: number | null
  quantityBefore?: number | null
  quantityAfter?: number | null
  fromFolderId?: string | null
  toFolderId?: string | null
  fromFolderName?: string | null
  toFolderName?: string | null
  changes?: Record<string, { old: unknown; new: unknown }> | null
}): ActivityLog {
  return {
    id: `log-${Date.now()}`,
    tenant_id: params.tenantId,
    user_id: params.userId,
    user_name: params.userName,
    entity_type: params.entityType,
    entity_id: params.entityId,
    entity_name: params.entityName,
    action_type: params.actionType,
    quantity_delta: params.quantityDelta ?? null,
    quantity_before: params.quantityBefore ?? null,
    quantity_after: params.quantityAfter ?? null,
    from_folder_id: params.fromFolderId ?? null,
    to_folder_id: params.toFolderId ?? null,
    from_folder_name: params.fromFolderName ?? null,
    to_folder_name: params.toFolderName ?? null,
    changes: params.changes ?? null,
    ip_address: null,
    user_agent: null,
    created_at: new Date().toISOString(),
  }
}

describe('Activity Logging', () => {
  describe('Create Operations', () => {
    it('logs entity creation with correct action type', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'new-item-1',
        entityName: 'New Item',
        actionType: 'create',
        quantityAfter: 10,
      })

      expect(log.action_type).toBe('create')
      expect(log.entity_type).toBe('item')
      expect(log.entity_name).toBe('New Item')
    })

    it('includes initial quantity for item creation', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'new-item-1',
        entityName: 'New Item',
        actionType: 'create',
        quantityBefore: null,
        quantityAfter: 50,
        quantityDelta: 50,
      })

      expect(log.quantity_before).toBeNull()
      expect(log.quantity_after).toBe(50)
      expect(log.quantity_delta).toBe(50)
    })

    it('logs folder creation', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'folder',
        entityId: 'new-folder-1',
        entityName: 'New Folder',
        actionType: 'create',
      })

      expect(log.action_type).toBe('create')
      expect(log.entity_type).toBe('folder')
    })

    it('test data includes create operations', () => {
      const createLogs = filterActivityLogs(testActivityLogs, {
        actionType: 'create',
      })

      expect(createLogs.length).toBeGreaterThan(0)
      expect(createLogs.every(l => l.action_type === 'create')).toBe(true)
    })
  })

  describe('Update Operations', () => {
    it('logs field changes with old and new values', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'item-1',
        entityName: 'Laptop',
        actionType: 'update',
        changes: {
          price: { old: 1000, new: 1500 },
          name: { old: 'Old Laptop', new: 'New Laptop' },
        },
      })

      expect(log.action_type).toBe('update')
      expect(log.changes).toBeDefined()
      expect(log.changes?.price.old).toBe(1000)
      expect(log.changes?.price.new).toBe(1500)
    })

    it('test data includes update operations', () => {
      const updateLogs = filterActivityLogs(testActivityLogs, {
        actionType: 'update',
      })

      expect(updateLogs.length).toBeGreaterThan(0)
      expect(updateLogs.every(l => l.action_type === 'update')).toBe(true)
    })

    it('update log includes changes object', () => {
      const updateLogs = filterActivityLogs(testActivityLogs, {
        actionType: 'update',
      })

      // At least one update log should have changes
      const logWithChanges = updateLogs.find(l => l.changes !== null)
      expect(logWithChanges).toBeDefined()
    })
  })

  describe('Delete Operations', () => {
    it('logs soft deletion', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'item-5',
        entityName: 'Deleted Item',
        actionType: 'delete',
      })

      expect(log.action_type).toBe('delete')
      expect(log.entity_type).toBe('item')
      expect(log.entity_name).toBe('Deleted Item')
    })

    it('deletion log preserves entity information', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'item-5',
        entityName: 'Deleted Item',
        actionType: 'delete',
      })

      expect(log.entity_id).toBe('item-5')
      expect(log.entity_name).toBe('Deleted Item')
    })
  })

  describe('Quantity Changes', () => {
    it('logs quantity increase with delta', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'item-1',
        entityName: 'Laptop',
        actionType: 'adjust_quantity',
        quantityBefore: 50,
        quantityAfter: 60,
        quantityDelta: 10,
      })

      expect(log.action_type).toBe('adjust_quantity')
      expect(log.quantity_before).toBe(50)
      expect(log.quantity_after).toBe(60)
      expect(log.quantity_delta).toBe(10)
    })

    it('logs quantity decrease with negative delta', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'item-2',
        entityName: 'Mouse',
        actionType: 'adjust_quantity',
        quantityBefore: 10,
        quantityAfter: 5,
        quantityDelta: -5,
      })

      expect(log.quantity_delta).toBe(-5)
      expect(log.quantity_before).toBe(10)
      expect(log.quantity_after).toBe(5)
    })

    it('test data includes quantity adjustments', () => {
      const qtyLogs = filterActivityLogs(testActivityLogs, {
        actionType: 'adjust_quantity',
      })

      expect(qtyLogs.length).toBeGreaterThan(0)
      expect(qtyLogs.every(l => l.action_type === 'adjust_quantity')).toBe(true)
    })

    it('quantity adjustments have before/after values', () => {
      const qtyLogs = filterActivityLogs(testActivityLogs, {
        actionType: 'adjust_quantity',
      })

      expect(qtyLogs.length).toBeGreaterThan(0)
      qtyLogs.forEach(log => {
        expect(log.quantity_before).toBeDefined()
        expect(log.quantity_after).toBeDefined()
        expect(log.quantity_delta).toBeDefined()
      })
    })
  })

  describe('User Attribution', () => {
    it('records user_id on activity log', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'item-1',
        entityName: 'Laptop',
        actionType: 'create',
      })

      expect(log.user_id).toBe(TEST_USER_ID)
    })

    it('records user_name on activity log', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'John Doe',
        entityType: 'item',
        entityId: 'item-1',
        entityName: 'Laptop',
        actionType: 'create',
      })

      expect(log.user_name).toBe('John Doe')
    })

    it('test data includes user attribution', () => {
      testActivityLogs.forEach(log => {
        expect(log.user_id).toBeDefined()
        expect(log.user_name).toBeDefined()
      })
    })

    it('activity logs are tenant-scoped', () => {
      const tenantLogs = filterActivityLogs(testActivityLogs, {
        tenantId: TEST_TENANT_ID,
      })

      expect(tenantLogs.every(l => l.tenant_id === TEST_TENANT_ID)).toBe(true)
    })
  })

  describe('Move Operations', () => {
    it('logs item move with folder names', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'item-1',
        entityName: 'Laptop',
        actionType: 'move',
        fromFolderId: 'folder-1',
        toFolderId: 'folder-2',
        fromFolderName: 'Electronics',
        toFolderName: 'Office Supplies',
      })

      expect(log.action_type).toBe('move')
      expect(log.from_folder_id).toBe('folder-1')
      expect(log.to_folder_id).toBe('folder-2')
      expect(log.from_folder_name).toBe('Electronics')
      expect(log.to_folder_name).toBe('Office Supplies')
    })

    it('logs move to root (uncategorized)', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'item-1',
        entityName: 'Laptop',
        actionType: 'move',
        fromFolderId: 'folder-1',
        toFolderId: null,
        fromFolderName: 'Electronics',
        toFolderName: 'Uncategorized',
      })

      expect(log.to_folder_id).toBeNull()
      expect(log.to_folder_name).toBe('Uncategorized')
    })

    it('test data includes move operations', () => {
      const moveLogs = filterActivityLogs(testActivityLogs, {
        actionType: 'move',
      })

      expect(moveLogs.length).toBeGreaterThan(0)
      expect(moveLogs.every(l => l.action_type === 'move')).toBe(true)
    })
  })

  describe('Timestamp Recording', () => {
    it('activity log includes created_at timestamp', () => {
      const log = createActivityLog({
        tenantId: TEST_TENANT_ID,
        userId: TEST_USER_ID,
        userName: 'Test User',
        entityType: 'item',
        entityId: 'item-1',
        entityName: 'Laptop',
        actionType: 'create',
      })

      expect(log.created_at).toBeDefined()
      expect(new Date(log.created_at!).getTime()).toBeGreaterThan(0)
    })

    it('test data logs have valid timestamps', () => {
      testActivityLogs.forEach(log => {
        expect(log.created_at).toBeDefined()
        const timestamp = new Date(log.created_at!).getTime()
        expect(timestamp).toBeGreaterThan(0)
      })
    })
  })

  describe('Entity Type Filtering', () => {
    it('filters logs by entity type', () => {
      const itemLogs = filterActivityLogs(testActivityLogs, {
        entityType: 'item',
      })

      expect(itemLogs.every(l => l.entity_type === 'item')).toBe(true)
    })

    it('filters logs by folder entity type', () => {
      const folderLogs = filterActivityLogs(testActivityLogs, {
        entityType: 'folder',
      })

      expect(folderLogs.every(l => l.entity_type === 'folder')).toBe(true)
    })
  })
})
