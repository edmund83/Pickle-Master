import { describe, it, expect } from 'vitest'
import {
  validateRow,
  checkRequiredMappings,
  validateAllRows,
  formatRowForImport,
  extractValidRowsForImport,
} from '@/lib/import/validation'
import type { ColumnMapping } from '@/lib/import/parser'

describe('Row Validation', () => {
  describe('validateRow', () => {
    it('validates required fields', () => {
      const data = { sku: 'SKU-001' } // missing name and quantity
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Name is required')
      expect(result.errors).toContain('Quantity is required')
    })

    it('passes when required fields are present', () => {
      const data = { name: 'Test Item', quantity: '10' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('validates quantity is a number', () => {
      const data = { name: 'Test Item', quantity: 'not-a-number' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Quantity must be a valid number')
    })

    it('validates quantity is non-negative', () => {
      const data = { name: 'Test Item', quantity: '-5' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Quantity must be a non-negative number')
    })

    it('validates price is a number', () => {
      const data = { name: 'Test Item', quantity: '10', price: 'invalid' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Price must be a valid number')
    })

    it('warns on negative price', () => {
      const data = { name: 'Test Item', quantity: '10', price: '-5.00' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(true) // Warning, not error
      expect(result.warnings).toContain('Price is negative')
    })

    it('validates cost_price is a number', () => {
      const data = { name: 'Test Item', quantity: '10', cost_price: 'abc' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Cost Price must be a valid number')
    })

    it('validates min_quantity is non-negative', () => {
      const data = { name: 'Test Item', quantity: '10', min_quantity: '-1' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Min Quantity must be a non-negative number')
    })

    it('allows empty optional fields', () => {
      const data = { name: 'Test Item', quantity: '10', sku: '', barcode: '' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(true)
    })

    it('warns when quantity is at or below min_quantity', () => {
      const data = { name: 'Test Item', quantity: '5', min_quantity: '5' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain(
        'Quantity is at or below minimum threshold (will be marked as low stock)'
      )
    })

    it('validates name length', () => {
      const longName = 'a'.repeat(501)
      const data = { name: longName, quantity: '10' }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Name must be 500 characters or less')
    })

    it('validates folder name length', () => {
      const longFolder = 'a'.repeat(256)
      const data = { name: 'Test', quantity: '10', folder: longFolder }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Folder name must be 255 characters or less')
    })

    it('warns on too many tags', () => {
      const manyTags = Array.from({ length: 25 }, (_, i) => `tag${i}`).join(',')
      const data = { name: 'Test', quantity: '10', tags: manyTags }
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('More than 20 tags may affect performance')
    })

    it('preserves row number', () => {
      const data = { name: 'Test', quantity: '10' }
      const result = validateRow(data, 42)

      expect(result.rowNumber).toBe(42)
    })

    it('aggregates multiple errors', () => {
      const data = { quantity: 'abc', price: 'xyz' } // missing name, invalid numbers
      const result = validateRow(data, 1)

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('checkRequiredMappings', () => {
    it('returns valid when required fields are mapped', () => {
      const mapping: ColumnMapping = {
        'Column A': 'name',
        'Column B': 'quantity',
        'Column C': 'sku',
      }
      const result = checkRequiredMappings(mapping)

      expect(result.valid).toBe(true)
      expect(result.missing).toHaveLength(0)
    })

    it('returns invalid when name is missing', () => {
      const mapping: ColumnMapping = {
        'Column A': 'quantity',
        'Column B': 'sku',
      }
      const result = checkRequiredMappings(mapping)

      expect(result.valid).toBe(false)
      expect(result.missing).toContain('Name')
    })

    it('returns invalid when quantity is missing', () => {
      const mapping: ColumnMapping = {
        'Column A': 'name',
        'Column B': 'sku',
      }
      const result = checkRequiredMappings(mapping)

      expect(result.valid).toBe(false)
      expect(result.missing).toContain('Quantity')
    })

    it('ignores null mappings', () => {
      const mapping: ColumnMapping = {
        'Column A': 'name',
        'Column B': 'quantity',
        'Column C': null, // skipped column
      }
      const result = checkRequiredMappings(mapping)

      expect(result.valid).toBe(true)
    })
  })

  describe('validateAllRows', () => {
    const headers = ['Product', 'Qty', 'Cost']
    const mapping: ColumnMapping = {
      Product: 'name',
      Qty: 'quantity',
      Cost: 'price',
    }

    it('validates all rows and counts valid/invalid', () => {
      const rows = [
        ['Item 1', '10', '19.99'],
        ['Item 2', 'invalid', '9.99'], // invalid quantity
        ['Item 3', '5', '14.99'],
      ]

      const result = validateAllRows(rows, headers, mapping)

      expect(result.totalRows).toBe(3)
      expect(result.validCount).toBe(2)
      expect(result.invalidCount).toBe(1)
    })

    it('checks required mappings', () => {
      const incompleteMapping: ColumnMapping = {
        Product: 'name',
        // missing quantity mapping
      }

      const result = validateAllRows([['Item', '10', '5']], headers, incompleteMapping)

      expect(result.hasRequiredMappings).toBe(false)
      expect(result.missingRequiredFields).toContain('Quantity')
    })

    it('preserves row numbers in validation results', () => {
      const rows = [
        ['Item 1', '10', '19.99'],
        ['Item 2', '5', '9.99'],
      ]

      const result = validateAllRows(rows, headers, mapping)

      expect(result.rows[0].rowNumber).toBe(1)
      expect(result.rows[1].rowNumber).toBe(2)
    })

    it('handles empty rows array', () => {
      const result = validateAllRows([], headers, mapping)

      expect(result.totalRows).toBe(0)
      expect(result.validCount).toBe(0)
      expect(result.invalidCount).toBe(0)
    })
  })

  describe('extractValidRowsForImport', () => {
    it('extracts only valid rows', () => {
      const validationResult = {
        rows: [
          { rowNumber: 1, data: { name: 'Item 1', quantity: '10' }, errors: [], warnings: [], isValid: true },
          { rowNumber: 2, data: { name: '', quantity: '5' }, errors: ['Name required'], warnings: [], isValid: false },
          { rowNumber: 3, data: { name: 'Item 3', quantity: '3' }, errors: [], warnings: [], isValid: true },
        ],
        validCount: 2,
        invalidCount: 1,
        totalRows: 3,
        hasRequiredMappings: true,
        missingRequiredFields: [],
      }

      const result = extractValidRowsForImport(validationResult)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Item 1')
      expect(result[1].name).toBe('Item 3')
    })
  })

  describe('formatRowForImport', () => {
    it('formats string fields correctly', () => {
      const data = { name: '  Test Item  ', sku: 'SKU-001' }
      const result = formatRowForImport(data)

      expect(result.name).toBe('Test Item')
      expect(result.sku).toBe('SKU-001')
    })

    it('formats numeric fields correctly', () => {
      const data = {
        name: 'Test',
        quantity: '10',
        min_quantity: '5',
        price: '19.99',
        cost_price: '12.50',
      }
      const result = formatRowForImport(data)

      expect(result.quantity).toBe(10)
      expect(result.min_quantity).toBe(5)
      expect(result.price).toBe(19.99)
      expect(result.cost_price).toBe(12.5)
    })

    it('handles empty/missing fields', () => {
      const data = { name: 'Test', quantity: '10' }
      const result = formatRowForImport(data)

      expect(result.sku).toBeNull()
      expect(result.barcode).toBeNull()
      expect(result.description).toBeNull()
      expect(result.min_quantity).toBe(0)
      expect(result.unit).toBe('pcs')
    })

    it('handles zero values correctly', () => {
      const data = { name: 'Test', quantity: '0', price: '0' }
      const result = formatRowForImport(data)

      expect(result.quantity).toBe(0)
      expect(result.price).toBe(0)
    })

    it('handles cost_price null when empty', () => {
      const data = { name: 'Test', quantity: '10', cost_price: '' }
      const result = formatRowForImport(data)

      expect(result.cost_price).toBeNull()
    })

    it('preserves tags and folder as strings', () => {
      const data = {
        name: 'Test',
        quantity: '10',
        tags: 'tag1, tag2, tag3',
        folder: 'Electronics',
      }
      const result = formatRowForImport(data)

      expect(result.tags).toBe('tag1, tag2, tag3')
      expect(result.folder).toBe('Electronics')
    })
  })
})
