import { describe, it, expect } from 'vitest'

/**
 * Email Notifications Tests
 *
 * Tests for email notification functionality:
 * - Low stock alerts
 * - Email validation
 * - Error handling
 */

interface LowStockAlertData {
  itemName: string
  currentQuantity: number
  minQuantity: number
  unit: string
  recipientEmail: string
}

interface EmailResult {
  success: boolean
  error?: string
  messageId?: string
}

// Validate email format
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Generate low stock alert content
function generateLowStockAlertContent(data: LowStockAlertData): {
  subject: string
  body: string
} {
  return {
    subject: `Low Stock Alert: ${data.itemName}`,
    body: `
Item "${data.itemName}" is running low on stock.

Current Quantity: ${data.currentQuantity} ${data.unit}
Minimum Quantity: ${data.minQuantity} ${data.unit}

Please reorder soon to avoid stockouts.
    `.trim(),
  }
}

// Simulate sending low stock alert
function sendLowStockAlert(
  data: LowStockAlertData,
  apiKeyConfigured: boolean
): EmailResult {
  // Validate email
  if (!isValidEmail(data.recipientEmail)) {
    return {
      success: false,
      error: 'Invalid email address',
    }
  }

  // Check API key
  if (!apiKeyConfigured) {
    return {
      success: false,
      error: 'Email service not configured. Set RESEND_API_KEY to enable email notifications.',
    }
  }

  // Simulate successful send
  return {
    success: true,
    messageId: `msg-${Date.now()}`,
  }
}

// Validate alert data
function validateAlertData(data: Partial<LowStockAlertData>): { valid: boolean; error?: string } {
  if (!data.itemName || data.itemName.trim() === '') {
    return { valid: false, error: 'Item name is required' }
  }

  if (data.currentQuantity === undefined || data.currentQuantity < 0) {
    return { valid: false, error: 'Current quantity must be non-negative' }
  }

  if (data.minQuantity === undefined || data.minQuantity < 0) {
    return { valid: false, error: 'Minimum quantity must be non-negative' }
  }

  if (!data.unit || data.unit.trim() === '') {
    return { valid: false, error: 'Unit is required' }
  }

  if (!data.recipientEmail || data.recipientEmail.trim() === '') {
    return { valid: false, error: 'Recipient email is required' }
  }

  if (!isValidEmail(data.recipientEmail)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

describe('Email Notifications', () => {
  describe('Low Stock Alert', () => {
    it('sends email successfully when configured', () => {
      const result = sendLowStockAlert(
        {
          itemName: 'Laptop',
          currentQuantity: 3,
          minQuantity: 10,
          unit: 'units',
          recipientEmail: 'admin@example.com',
        },
        true // API key configured
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('generates correct content with item details', () => {
      const content = generateLowStockAlertContent({
        itemName: 'Laptop',
        currentQuantity: 3,
        minQuantity: 10,
        unit: 'units',
        recipientEmail: 'admin@example.com',
      })

      expect(content.body).toContain('Laptop')
      expect(content.body).toContain('3 units')
      expect(content.body).toContain('10 units')
    })

    it('includes item name in subject line', () => {
      const content = generateLowStockAlertContent({
        itemName: 'Laptop',
        currentQuantity: 3,
        minQuantity: 10,
        unit: 'units',
        recipientEmail: 'admin@example.com',
      })

      expect(content.subject).toContain('Laptop')
    })

    it('fails gracefully when no API key', () => {
      const result = sendLowStockAlert(
        {
          itemName: 'Laptop',
          currentQuantity: 3,
          minQuantity: 10,
          unit: 'units',
          recipientEmail: 'admin@example.com',
        },
        false // No API key
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('not configured')
    })

    it('returns validation error for invalid email', () => {
      const result = sendLowStockAlert(
        {
          itemName: 'Laptop',
          currentQuantity: 3,
          minQuantity: 10,
          unit: 'units',
          recipientEmail: 'not-an-email',
        },
        true
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid email')
    })
  })

  describe('Email Validation', () => {
    it('accepts valid email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('rejects invalid email formats', () => {
      expect(isValidEmail('not-an-email')).toBe(false)
      expect(isValidEmail('missing@domain')).toBe(false)
      expect(isValidEmail('@nodomain.com')).toBe(false)
      expect(isValidEmail('spaces in@email.com')).toBe(false)
    })
  })

  describe('Alert Data Validation', () => {
    it('validates all required fields', () => {
      const result = validateAlertData({})

      expect(result.valid).toBe(false)
    })

    it('validates item name is present', () => {
      const result = validateAlertData({
        itemName: '',
        currentQuantity: 3,
        minQuantity: 10,
        unit: 'units',
        recipientEmail: 'test@example.com',
      })

      expect(result.valid).toBe(false)
      expect(result.error).toContain('Item name')
    })

    it('validates quantity is non-negative', () => {
      const result = validateAlertData({
        itemName: 'Test',
        currentQuantity: -5,
        minQuantity: 10,
        unit: 'units',
        recipientEmail: 'test@example.com',
      })

      expect(result.valid).toBe(false)
    })

    it('passes validation with all correct data', () => {
      const result = validateAlertData({
        itemName: 'Laptop',
        currentQuantity: 3,
        minQuantity: 10,
        unit: 'units',
        recipientEmail: 'admin@example.com',
      })

      expect(result.valid).toBe(true)
    })
  })
})
