import { describe, it, expect } from 'vitest'

/**
 * Validation Error Tests
 *
 * Tests for validation error handling:
 * - Required field missing → Clear error message
 * - Invalid format → Type-specific error message
 * - Business rule violation → Descriptive error
 * - Database constraint → User-friendly error translation
 */

interface ValidationResult {
  valid: boolean
  errors: string[]
}

// Simulate field validation
function validateRequiredField(value: unknown, fieldName: string): ValidationResult {
  const errors: string[] = []

  if (value === undefined || value === null || value === '') {
    errors.push(`${fieldName} is required`)
  }

  return { valid: errors.length === 0, errors }
}

// Simulate number format validation
function validateNumberFormat(value: unknown, fieldName: string): ValidationResult {
  const errors: string[] = []

  if (value !== undefined && value !== null && value !== '') {
    const num = Number(value)
    if (isNaN(num)) {
      errors.push(`${fieldName} must be a valid number`)
    }
  }

  return { valid: errors.length === 0, errors }
}

// Simulate email format validation
function validateEmailFormat(value: string): ValidationResult {
  const errors: string[] = []
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (value && !emailRegex.test(value)) {
    errors.push('Invalid email format')
  }

  return { valid: errors.length === 0, errors }
}

// Simulate date format validation
function validateDateFormat(value: string): ValidationResult {
  const errors: string[] = []

  if (value) {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format')
    }
  }

  return { valid: errors.length === 0, errors }
}

// Simulate business rule validation
function validateBusinessRule(
  quantity: number,
  operation: 'checkout' | 'adjust',
  available: number
): ValidationResult {
  const errors: string[] = []

  if (operation === 'checkout' && quantity > available) {
    errors.push(`Insufficient stock. Only ${available} available.`)
  }

  if (quantity <= 0) {
    errors.push('Quantity must be greater than zero')
  }

  return { valid: errors.length === 0, errors }
}

// Simulate database constraint error translation
function translateDatabaseError(dbError: string): string {
  const translations: Record<string, string> = {
    'unique_violation': 'A record with this value already exists',
    'foreign_key_violation': 'Referenced record does not exist',
    'check_violation': 'Value does not meet requirements',
    'not_null_violation': 'Required field cannot be empty',
  }

  return translations[dbError] || 'An unexpected error occurred'
}

describe('Validation Errors', () => {
  describe('Required field missing → Clear error message', () => {
    it('shows clear error for missing required field', () => {
      const result = validateRequiredField(undefined, 'Name')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name is required')
    })

    it('shows clear error for null field', () => {
      const result = validateRequiredField(null, 'Email')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Email is required')
    })

    it('shows clear error for empty string', () => {
      const result = validateRequiredField('', 'Password')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Password is required')
    })

    it('passes validation for valid values', () => {
      expect(validateRequiredField('John', 'Name').valid).toBe(true)
      expect(validateRequiredField(0, 'Quantity').valid).toBe(true)
      expect(validateRequiredField(false, 'Active').valid).toBe(true)
    })
  })

  describe('Invalid format → Type-specific error message', () => {
    it('shows number-specific error for invalid number', () => {
      const result = validateNumberFormat('abc', 'Quantity')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Quantity must be a valid number')
    })

    it('accepts valid numbers', () => {
      expect(validateNumberFormat('123', 'Quantity').valid).toBe(true)
      expect(validateNumberFormat(456, 'Price').valid).toBe(true)
      expect(validateNumberFormat('12.34', 'Cost').valid).toBe(true)
    })

    it('shows email-specific error for invalid email', () => {
      const result = validateEmailFormat('not-an-email')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid email format')
    })

    it('accepts valid email formats', () => {
      expect(validateEmailFormat('user@example.com').valid).toBe(true)
      expect(validateEmailFormat('name.last@domain.org').valid).toBe(true)
    })

    it('shows date-specific error for invalid date', () => {
      const result = validateDateFormat('not-a-date')

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid date format')
    })

    it('accepts valid date formats', () => {
      expect(validateDateFormat('2025-01-01').valid).toBe(true)
      expect(validateDateFormat('2025-12-31T10:00:00Z').valid).toBe(true)
    })
  })

  describe('Business rule violation → Descriptive error', () => {
    it('shows descriptive error for insufficient stock', () => {
      const result = validateBusinessRule(10, 'checkout', 5)

      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('Insufficient stock')
      expect(result.errors[0]).toContain('Only 5 available')
    })

    it('shows descriptive error for zero quantity', () => {
      const result = validateBusinessRule(0, 'checkout', 5)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Quantity must be greater than zero')
    })

    it('shows descriptive error for negative quantity', () => {
      const result = validateBusinessRule(-5, 'checkout', 10)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Quantity must be greater than zero')
    })

    it('passes for valid business operations', () => {
      expect(validateBusinessRule(5, 'checkout', 10).valid).toBe(true)
      expect(validateBusinessRule(10, 'checkout', 10).valid).toBe(true)
    })
  })

  describe('Database constraint → User-friendly error translation', () => {
    it('translates unique violation to friendly message', () => {
      const message = translateDatabaseError('unique_violation')

      expect(message).toBe('A record with this value already exists')
    })

    it('translates foreign key violation to friendly message', () => {
      const message = translateDatabaseError('foreign_key_violation')

      expect(message).toBe('Referenced record does not exist')
    })

    it('translates check violation to friendly message', () => {
      const message = translateDatabaseError('check_violation')

      expect(message).toBe('Value does not meet requirements')
    })

    it('translates not null violation to friendly message', () => {
      const message = translateDatabaseError('not_null_violation')

      expect(message).toBe('Required field cannot be empty')
    })

    it('provides generic message for unknown errors', () => {
      const message = translateDatabaseError('unknown_error')

      expect(message).toBe('An unexpected error occurred')
    })
  })

  describe('Combined validation scenarios', () => {
    it('validates multiple fields at once', () => {
      interface FormData {
        name: string
        email: string
        quantity: string
      }

      function validateForm(data: FormData): ValidationResult {
        const errors: string[] = []

        const nameResult = validateRequiredField(data.name, 'Name')
        const emailResult = validateEmailFormat(data.email)
        const qtyResult = validateNumberFormat(data.quantity, 'Quantity')

        errors.push(...nameResult.errors, ...emailResult.errors, ...qtyResult.errors)

        return { valid: errors.length === 0, errors }
      }

      const invalidData = { name: '', email: 'invalid', quantity: 'abc' }
      const result = validateForm(invalidData)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBe(3)
    })
  })
})
