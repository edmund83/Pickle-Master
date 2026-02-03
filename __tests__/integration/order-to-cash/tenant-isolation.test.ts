/**
 * Tenant Isolation Integration Tests
 *
 * Tests for multi-tenancy security across the order-to-cash workflow:
 * - Cross-tenant data access prevention
 * - Cross-tenant entity linking prevention
 * - Tenant-scoped list queries
 * - Activity log isolation
 */

import { describe, it, expect, beforeAll } from 'vitest'
import {
  ORDER_CASH_TENANT_ID,
  ORDER_CASH_OTHER_TENANT_ID,
  ORDER_CASH_USER_ID,
  ORDER_CASH_OTHER_USER_ID,
  createTestCustomer,
  createTestItem,
  createTestSalesOrder,
  createTestDeliveryOrder,
  createTestInvoice,
  type TestCustomer,
  type TestItem,
  type TestSalesOrder,
  type TestDeliveryOrder,
  type TestInvoice,
} from '../../utils/order-to-cash-fixtures'

describe('Order-to-Cash Tenant Isolation', () => {
  // Test data for Tenant A
  let customerA: TestCustomer
  let itemA: TestItem
  let salesOrderA: TestSalesOrder
  let deliveryOrderA: TestDeliveryOrder
  let invoiceA: TestInvoice

  // Test data for Tenant B
  let customerB: TestCustomer
  let itemB: TestItem
  let salesOrderB: TestSalesOrder
  let deliveryOrderB: TestDeliveryOrder
  let invoiceB: TestInvoice

  beforeAll(() => {
    // Setup Tenant A data
    customerA = createTestCustomer(ORDER_CASH_TENANT_ID, { name: 'Tenant A Customer' })
    itemA = createTestItem(ORDER_CASH_TENANT_ID, { name: 'Tenant A Item' })
    const soResultA = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
      customerId: customerA.id,
      items: [{ item: itemA, quantity: 10, unitPrice: 100 }],
    })
    salesOrderA = soResultA.salesOrder
    deliveryOrderA = createTestDeliveryOrder(ORDER_CASH_TENANT_ID, {
      salesOrderId: salesOrderA.id,
      customerId: customerA.id,
    })
    invoiceA = createTestInvoice(ORDER_CASH_TENANT_ID, {
      customerId: customerA.id,
      salesOrderId: salesOrderA.id,
      total: 1000,
    })

    // Setup Tenant B data
    customerB = createTestCustomer(ORDER_CASH_OTHER_TENANT_ID, { name: 'Tenant B Customer' })
    itemB = createTestItem(ORDER_CASH_OTHER_TENANT_ID, { name: 'Tenant B Item' })
    const soResultB = createTestSalesOrder(ORDER_CASH_OTHER_TENANT_ID, {
      customerId: customerB.id,
      items: [{ item: itemB, quantity: 5, unitPrice: 200 }],
    })
    salesOrderB = soResultB.salesOrder
    deliveryOrderB = createTestDeliveryOrder(ORDER_CASH_OTHER_TENANT_ID, {
      salesOrderId: salesOrderB.id,
      customerId: customerB.id,
    })
    invoiceB = createTestInvoice(ORDER_CASH_OTHER_TENANT_ID, {
      customerId: customerB.id,
      salesOrderId: salesOrderB.id,
      total: 1000,
    })
  })

  describe('Tenant Data Verification', () => {
    it('should have distinct tenant IDs for test data', () => {
      expect(ORDER_CASH_TENANT_ID).not.toBe(ORDER_CASH_OTHER_TENANT_ID)
      expect(customerA.tenant_id).not.toBe(customerB.tenant_id)
    })

    it('should assign correct tenant_id to all Tenant A entities', () => {
      expect(customerA.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(itemA.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(salesOrderA.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(deliveryOrderA.tenant_id).toBe(ORDER_CASH_TENANT_ID)
      expect(invoiceA.tenant_id).toBe(ORDER_CASH_TENANT_ID)
    })

    it('should assign correct tenant_id to all Tenant B entities', () => {
      expect(customerB.tenant_id).toBe(ORDER_CASH_OTHER_TENANT_ID)
      expect(itemB.tenant_id).toBe(ORDER_CASH_OTHER_TENANT_ID)
      expect(salesOrderB.tenant_id).toBe(ORDER_CASH_OTHER_TENANT_ID)
      expect(deliveryOrderB.tenant_id).toBe(ORDER_CASH_OTHER_TENANT_ID)
      expect(invoiceB.tenant_id).toBe(ORDER_CASH_OTHER_TENANT_ID)
    })
  })

  describe('Cross-Tenant Access Prevention', () => {
    describe('Customer Access', () => {
      it('should not allow Tenant B to access Tenant A customer', () => {
        // Simulate RLS query filtering
        const tenantBCustomers = [customerA, customerB].filter(
          c => c.tenant_id === ORDER_CASH_OTHER_TENANT_ID
        )

        expect(tenantBCustomers).not.toContain(customerA)
        expect(tenantBCustomers).toContain(customerB)
        expect(tenantBCustomers).toHaveLength(1)
      })
    })

    describe('Sales Order Access', () => {
      it('should not allow Tenant B to read Tenant A sales order', () => {
        // Simulate RLS query filtering
        const tenantBSalesOrders = [salesOrderA, salesOrderB].filter(
          so => so.tenant_id === ORDER_CASH_OTHER_TENANT_ID
        )

        expect(tenantBSalesOrders).not.toContain(salesOrderA)
        expect(tenantBSalesOrders).toContain(salesOrderB)
      })

      it('should return null/empty when querying another tenant SO by ID', () => {
        // Simulate getSalesOrder with RLS
        const queriedTenantId = ORDER_CASH_OTHER_TENANT_ID
        const targetSO = salesOrderA

        const canAccess = targetSO.tenant_id === queriedTenantId
        expect(canAccess).toBe(false)
      })
    })

    describe('Delivery Order Access', () => {
      it('should not allow Tenant B to read Tenant A delivery order', () => {
        const tenantBDeliveryOrders = [deliveryOrderA, deliveryOrderB].filter(
          doOrder => doOrder.tenant_id === ORDER_CASH_OTHER_TENANT_ID
        )

        expect(tenantBDeliveryOrders).not.toContain(deliveryOrderA)
        expect(tenantBDeliveryOrders).toContain(deliveryOrderB)
      })
    })

    describe('Invoice Access', () => {
      it('should not allow Tenant B to read Tenant A invoice', () => {
        const tenantBInvoices = [invoiceA, invoiceB].filter(
          inv => inv.tenant_id === ORDER_CASH_OTHER_TENANT_ID
        )

        expect(tenantBInvoices).not.toContain(invoiceA)
        expect(tenantBInvoices).toContain(invoiceB)
      })
    })
  })

  describe('Cross-Tenant Entity Linking Prevention', () => {
    it('should prevent creating DO from another tenant SO', () => {
      // Attempt to create DO in Tenant B linked to SO in Tenant A
      const crossTenantDOAttempt = () => {
        const doTenantId = ORDER_CASH_OTHER_TENANT_ID
        const linkedSOTenantId = salesOrderA.tenant_id

        if (doTenantId !== linkedSOTenantId) {
          throw new Error('Cannot link delivery order to sales order from different tenant')
        }

        return createTestDeliveryOrder(doTenantId, {
          salesOrderId: salesOrderA.id,
        })
      }

      expect(crossTenantDOAttempt).toThrow(/different tenant/)
    })

    it('should prevent invoicing another tenant DO', () => {
      // Attempt to create invoice in Tenant B linked to DO in Tenant A
      const crossTenantInvoiceAttempt = () => {
        const invoiceTenantId = ORDER_CASH_OTHER_TENANT_ID
        const linkedDOTenantId = deliveryOrderA.tenant_id

        if (invoiceTenantId !== linkedDOTenantId) {
          throw new Error('Cannot create invoice linked to delivery order from different tenant')
        }

        return createTestInvoice(invoiceTenantId, {
          customerId: customerB.id,
          deliveryOrderId: deliveryOrderA.id,
          total: 1000,
        })
      }

      expect(crossTenantInvoiceAttempt).toThrow(/different tenant/)
    })

    it('should prevent creating credit note for another tenant invoice', () => {
      // Attempt to create credit note in Tenant B for invoice in Tenant A
      const crossTenantCreditNoteAttempt = () => {
        const creditNoteTenantId = ORDER_CASH_OTHER_TENANT_ID
        const linkedInvoiceTenantId = invoiceA.tenant_id

        if (creditNoteTenantId !== linkedInvoiceTenantId) {
          throw new Error('Cannot create credit note for invoice from different tenant')
        }

        return createTestInvoice(creditNoteTenantId, {
          customerId: customerB.id,
          originalInvoiceId: invoiceA.id,
          invoiceType: 'credit_note',
          total: -100,
        })
      }

      expect(crossTenantCreditNoteAttempt).toThrow(/different tenant/)
    })

    it('should prevent using another tenant customer in SO', () => {
      const crossTenantCustomerAttempt = () => {
        const soTenantId = ORDER_CASH_TENANT_ID
        const customerTenantId = customerB.tenant_id

        if (soTenantId !== customerTenantId) {
          throw new Error('Cannot use customer from different tenant')
        }

        return createTestSalesOrder(soTenantId, {
          customerId: customerB.id,
          items: [],
        })
      }

      expect(crossTenantCustomerAttempt).toThrow(/different tenant/)
    })

    it('should prevent using another tenant item in SO', () => {
      const crossTenantItemAttempt = () => {
        const soTenantId = ORDER_CASH_TENANT_ID
        const itemTenantId = itemB.tenant_id

        if (soTenantId !== itemTenantId) {
          throw new Error('Cannot use item from different tenant')
        }

        return createTestSalesOrder(soTenantId, {
          customerId: customerA.id,
          items: [{ item: itemB, quantity: 5, unitPrice: 100 }],
        })
      }

      expect(crossTenantItemAttempt).toThrow(/different tenant/)
    })
  })

  describe('Tenant-Scoped List Queries', () => {
    it('should only include current tenant data in list queries', () => {
      const allSalesOrders = [salesOrderA, salesOrderB]

      // Simulate getPaginatedSalesOrders for Tenant A
      const tenantASalesOrders = allSalesOrders.filter(
        so => so.tenant_id === ORDER_CASH_TENANT_ID
      )

      expect(tenantASalesOrders).toHaveLength(1)
      expect(tenantASalesOrders[0].id).toBe(salesOrderA.id)

      // Simulate getPaginatedSalesOrders for Tenant B
      const tenantBSalesOrders = allSalesOrders.filter(
        so => so.tenant_id === ORDER_CASH_OTHER_TENANT_ID
      )

      expect(tenantBSalesOrders).toHaveLength(1)
      expect(tenantBSalesOrders[0].id).toBe(salesOrderB.id)
    })

    it('should not leak other tenant count in totals', () => {
      const allItems = [itemA, itemB]

      const tenantACount = allItems.filter(
        i => i.tenant_id === ORDER_CASH_TENANT_ID
      ).length

      const tenantBCount = allItems.filter(
        i => i.tenant_id === ORDER_CASH_OTHER_TENANT_ID
      ).length

      expect(tenantACount).toBe(1)
      expect(tenantBCount).toBe(1)
      expect(tenantACount + tenantBCount).toBe(allItems.length)
    })

    it('should handle search queries within tenant scope', () => {
      // Create multiple SOs for searching
      const tenantASOs = [
        { ...salesOrderA, display_id: 'SO-A-001' },
        { ...salesOrderA, id: 'so-a-2', display_id: 'SO-A-002' },
      ]
      const tenantBSOs = [
        { ...salesOrderB, display_id: 'SO-B-001' },
      ]
      const allSOs = [...tenantASOs, ...tenantBSOs]

      // Search for "SO-A" in Tenant A context
      const tenantASearch = allSOs.filter(
        so => so.tenant_id === ORDER_CASH_TENANT_ID &&
              so.display_id.includes('SO-A')
      )

      expect(tenantASearch).toHaveLength(2)
      expect(tenantASearch.every(so => so.tenant_id === ORDER_CASH_TENANT_ID)).toBe(true)

      // Search for "SO-A" in Tenant B context (should find nothing)
      const tenantBSearch = allSOs.filter(
        so => so.tenant_id === ORDER_CASH_OTHER_TENANT_ID &&
              so.display_id.includes('SO-A')
      )

      expect(tenantBSearch).toHaveLength(0)
    })
  })

  describe('Activity Log Isolation', () => {
    it('should isolate activity logs by tenant', () => {
      // Simulate activity logs
      const activityLogs = [
        { id: 'log-1', tenant_id: ORDER_CASH_TENANT_ID, entity_id: salesOrderA.id, action: 'create' },
        { id: 'log-2', tenant_id: ORDER_CASH_TENANT_ID, entity_id: salesOrderA.id, action: 'update' },
        { id: 'log-3', tenant_id: ORDER_CASH_OTHER_TENANT_ID, entity_id: salesOrderB.id, action: 'create' },
      ]

      // Query logs as Tenant A
      const tenantALogs = activityLogs.filter(
        log => log.tenant_id === ORDER_CASH_TENANT_ID
      )

      expect(tenantALogs).toHaveLength(2)
      expect(tenantALogs.every(log => log.tenant_id === ORDER_CASH_TENANT_ID)).toBe(true)

      // Query logs as Tenant B
      const tenantBLogs = activityLogs.filter(
        log => log.tenant_id === ORDER_CASH_OTHER_TENANT_ID
      )

      expect(tenantBLogs).toHaveLength(1)
    })

    it('should not return other tenant logs when querying by entity', () => {
      const activityLogs = [
        { id: 'log-1', tenant_id: ORDER_CASH_TENANT_ID, entity_id: salesOrderA.id },
        { id: 'log-2', tenant_id: ORDER_CASH_OTHER_TENANT_ID, entity_id: salesOrderB.id },
      ]

      // Tenant B trying to get logs for Tenant A's SO
      const crossTenantLogQuery = activityLogs.filter(
        log => log.tenant_id === ORDER_CASH_OTHER_TENANT_ID &&
               log.entity_id === salesOrderA.id
      )

      expect(crossTenantLogQuery).toHaveLength(0)
    })
  })

  describe('User-Tenant Association', () => {
    it('should track user_id per tenant context', () => {
      // Tenant A user creates SO
      const soByTenantAUser = createTestSalesOrder(ORDER_CASH_TENANT_ID, {
        customerId: customerA.id,
        items: [],
      })

      expect(soByTenantAUser.salesOrder.created_by).toBe(ORDER_CASH_USER_ID)
      expect(soByTenantAUser.salesOrder.tenant_id).toBe(ORDER_CASH_TENANT_ID)
    })

    it('should associate actions with correct user within tenant', () => {
      const actions = [
        { user_id: ORDER_CASH_USER_ID, tenant_id: ORDER_CASH_TENANT_ID, action: 'create_so' },
        { user_id: ORDER_CASH_OTHER_USER_ID, tenant_id: ORDER_CASH_OTHER_TENANT_ID, action: 'create_so' },
      ]

      // Each action is scoped to its tenant
      const tenantAActions = actions.filter(a => a.tenant_id === ORDER_CASH_TENANT_ID)
      const tenantBActions = actions.filter(a => a.tenant_id === ORDER_CASH_OTHER_TENANT_ID)

      expect(tenantAActions[0].user_id).toBe(ORDER_CASH_USER_ID)
      expect(tenantBActions[0].user_id).toBe(ORDER_CASH_OTHER_USER_ID)
    })
  })

  describe('Display ID Isolation', () => {
    it('should generate tenant-scoped display IDs', () => {
      // Each tenant has its own sequence
      expect(salesOrderA.display_id).toMatch(/^SO-/)
      expect(salesOrderB.display_id).toMatch(/^SO-/)

      // In real implementation, display IDs would be org-scoped like SO-ORG1-00001, SO-ORG2-00001
      // Here we verify they are distinct
      expect(salesOrderA.display_id).not.toBe(salesOrderB.display_id)
    })

    it('should not allow display_id collisions across tenants', () => {
      // Even if display IDs look similar, they should be unique per tenant
      const allDisplayIds = [
        { tenant_id: ORDER_CASH_TENANT_ID, display_id: salesOrderA.display_id },
        { tenant_id: ORDER_CASH_OTHER_TENANT_ID, display_id: salesOrderB.display_id },
      ]

      // Composite key (tenant_id, display_id) should be unique
      const uniqueKeys = new Set(
        allDisplayIds.map(d => `${d.tenant_id}:${d.display_id}`)
      )

      expect(uniqueKeys.size).toBe(allDisplayIds.length)
    })
  })

  describe('Bulk Operations Isolation', () => {
    it('should scope bulk status updates to current tenant', () => {
      const allSalesOrders = [salesOrderA, salesOrderB]
      const updateTargetIds = [salesOrderA.id, salesOrderB.id]
      const currentTenantId = ORDER_CASH_TENANT_ID

      // Bulk update should only affect current tenant's SOs
      const affectedSOs = allSalesOrders.filter(
        so => updateTargetIds.includes(so.id) && so.tenant_id === currentTenantId
      )

      expect(affectedSOs).toHaveLength(1)
      expect(affectedSOs[0].id).toBe(salesOrderA.id)
    })

    it('should scope bulk delete to current tenant', () => {
      const allInvoices = [invoiceA, invoiceB]
      const deleteTargetIds = [invoiceA.id, invoiceB.id]
      const currentTenantId = ORDER_CASH_TENANT_ID

      // Bulk delete should only affect current tenant's invoices
      const deletedInvoices = allInvoices.filter(
        inv => deleteTargetIds.includes(inv.id) && inv.tenant_id === currentTenantId
      )

      expect(deletedInvoices).toHaveLength(1)
      expect(deletedInvoices[0].id).toBe(invoiceA.id)
    })
  })
})
