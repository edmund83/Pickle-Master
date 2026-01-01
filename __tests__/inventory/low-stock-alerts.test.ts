import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID } from '../utils/test-data'

/**
 * Low Stock Alerts Tests
 *
 * Tests for low stock alert functionality:
 * - Low stock alert creation
 * - Email alert when configured
 */

interface InventoryItem {
  id: string
  tenant_id: string
  name: string
  quantity: number
  min_quantity: number
}

interface LowStockAlert {
  id: string
  tenant_id: string
  item_id: string
  item_name: string
  current_quantity: number
  min_quantity: number
  status: 'pending' | 'acknowledged' | 'resolved'
  created_at: string
}

interface EmailConfig {
  resendApiKey: string | null
  recipientEmail: string
}

// Alert storage
const alerts: LowStockAlert[] = []

// Check if item is low stock
function isLowStock(item: InventoryItem): boolean {
  return item.quantity > 0 && item.quantity <= item.min_quantity
}

// Create low stock alert
function createLowStockAlert(item: InventoryItem): LowStockAlert {
  const alert: LowStockAlert = {
    id: `alert-${Date.now()}`,
    tenant_id: item.tenant_id,
    item_id: item.id,
    item_name: item.name,
    current_quantity: item.quantity,
    min_quantity: item.min_quantity,
    status: 'pending',
    created_at: new Date().toISOString(),
  }

  alerts.push(alert)
  return alert
}

// Check and create alert if needed
function checkAndCreateAlert(item: InventoryItem): {
  alertCreated: boolean
  alert?: LowStockAlert
} {
  if (!isLowStock(item)) {
    return { alertCreated: false }
  }

  // Check if alert already exists for this item
  const existingAlert = alerts.find(
    (a) => a.item_id === item.id && a.status === 'pending'
  )

  if (existingAlert) {
    return { alertCreated: false }
  }

  const alert = createLowStockAlert(item)
  return { alertCreated: true, alert }
}

// Send email alert
function sendEmailAlert(
  alert: LowStockAlert,
  config: EmailConfig
): { sent: boolean; error?: string } {
  if (!config.resendApiKey) {
    return { sent: false, error: 'Email service not configured. Set RESEND_API_KEY to enable.' }
  }

  if (!config.recipientEmail) {
    return { sent: false, error: 'No recipient email configured' }
  }

  // Simulate sending email
  return { sent: true }
}

// Process quantity update and trigger alerts
function processQuantityUpdate(
  item: InventoryItem,
  newQuantity: number,
  emailConfig: EmailConfig
): {
  item: InventoryItem
  alertCreated: boolean
  emailSent: boolean
  emailError?: string
} {
  const updatedItem = { ...item, quantity: newQuantity }

  const alertResult = checkAndCreateAlert(updatedItem)

  let emailSent = false
  let emailError: string | undefined

  if (alertResult.alertCreated && alertResult.alert) {
    const emailResult = sendEmailAlert(alertResult.alert, emailConfig)
    emailSent = emailResult.sent
    emailError = emailResult.error
  }

  return {
    item: updatedItem,
    alertCreated: alertResult.alertCreated,
    emailSent,
    emailError,
  }
}

// Get pending alerts for tenant
function getPendingAlerts(tenantId: string): LowStockAlert[] {
  return alerts.filter((a) => a.tenant_id === tenantId && a.status === 'pending')
}

describe('Low Stock Alerts', () => {
  beforeEach(() => {
    alerts.length = 0
  })

  describe('Low Stock Detection', () => {
    it('creates notification if below threshold', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 5,
        min_quantity: 10,
      }

      const result = checkAndCreateAlert(item)

      expect(result.alertCreated).toBe(true)
      expect(result.alert).toBeDefined()
      expect(result.alert!.status).toBe('pending')
    })

    it('includes item details in alert', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 3,
        min_quantity: 10,
      }

      const result = checkAndCreateAlert(item)

      expect(result.alert!.item_name).toBe('Laptop')
      expect(result.alert!.current_quantity).toBe(3)
      expect(result.alert!.min_quantity).toBe(10)
    })

    it('does not create alert if quantity above threshold', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 15,
        min_quantity: 10,
      }

      const result = checkAndCreateAlert(item)

      expect(result.alertCreated).toBe(false)
    })

    it('does not duplicate alerts for same item', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 5,
        min_quantity: 10,
      }

      checkAndCreateAlert(item)
      const result2 = checkAndCreateAlert(item)

      expect(result2.alertCreated).toBe(false)
      expect(getPendingAlerts(TEST_TENANT_ID).length).toBe(1)
    })
  })

  describe('Email Alert', () => {
    it('sends email if RESEND_API_KEY configured', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 5,
        min_quantity: 10,
      }

      const result = processQuantityUpdate(item, 5, {
        resendApiKey: 'test-api-key',
        recipientEmail: 'admin@example.com',
      })

      expect(result.alertCreated).toBe(true)
      expect(result.emailSent).toBe(true)
    })

    it('does not send email if no API key', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 5,
        min_quantity: 10,
      }

      const result = processQuantityUpdate(item, 5, {
        resendApiKey: null,
        recipientEmail: 'admin@example.com',
      })

      expect(result.alertCreated).toBe(true)
      expect(result.emailSent).toBe(false)
      expect(result.emailError).toContain('RESEND_API_KEY')
    })

    it('does not send email if no recipient', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 5,
        min_quantity: 10,
      }

      const result = processQuantityUpdate(item, 5, {
        resendApiKey: 'test-api-key',
        recipientEmail: '',
      })

      expect(result.emailSent).toBe(false)
      expect(result.emailError).toContain('recipient')
    })

    it('does not send email if quantity above threshold', () => {
      const item: InventoryItem = {
        id: 'item-1',
        tenant_id: TEST_TENANT_ID,
        name: 'Laptop',
        quantity: 15,
        min_quantity: 10,
      }

      const result = processQuantityUpdate(item, 15, {
        resendApiKey: 'test-api-key',
        recipientEmail: 'admin@example.com',
      })

      expect(result.alertCreated).toBe(false)
      expect(result.emailSent).toBe(false)
    })
  })
})
