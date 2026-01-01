import { describe, it, expect } from 'vitest'
import { TEST_TENANT_ID } from '../utils/test-data'

/**
 * Bulk Import Tests
 *
 * Tests for bulk import functionality:
 * - Import items
 * - Quota checks
 * - Duplicate handling
 */

interface ImportRow {
  name: string
  quantity: number
  sku?: string
  price?: number
  folder_name?: string
}

interface ImportResult {
  success: boolean
  successCount: number
  failedCount: number
  skippedCount: number
  createdItemIds: string[]
  errors: Array<{ row: number; message: string }>
}

interface QuotaCheckResult {
  allowed: boolean
  remaining: number
  message?: string
}

// Check import quota
function checkImportQuota(
  itemCount: number,
  currentCount: number,
  maxQuota: number
): QuotaCheckResult {
  const remaining = maxQuota - currentCount

  if (itemCount > remaining) {
    return {
      allowed: false,
      remaining,
      message: `Import would exceed quota. You can import up to ${remaining} more items.`,
    }
  }

  return {
    allowed: true,
    remaining,
  }
}

// Validate import row
function validateImportRow(row: Partial<ImportRow>, rowNumber: number): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!row.name || row.name.trim() === '') {
    errors.push(`Row ${rowNumber}: Name is required`)
  }

  if (row.quantity === undefined || row.quantity === null) {
    errors.push(`Row ${rowNumber}: Quantity is required`)
  } else if (typeof row.quantity !== 'number' || row.quantity < 0) {
    errors.push(`Row ${rowNumber}: Quantity must be a non-negative number`)
  }

  if (row.price !== undefined && (typeof row.price !== 'number' || row.price < 0)) {
    errors.push(`Row ${rowNumber}: Price must be a non-negative number`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// Simulate bulk import
function bulkImportItems(
  rows: ImportRow[],
  options: {
    duplicateHandling: 'skip' | 'replace' | 'create'
    createFolders: boolean
    existingSkus: Set<string>
    existingFolders: Map<string, string> // name -> id
  }
): ImportResult {
  const createdItemIds: string[] = []
  const errors: Array<{ row: number; message: string }> = []
  let successCount = 0
  let failedCount = 0
  let skippedCount = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNumber = i + 1

    // Validate row
    const validation = validateImportRow(row, rowNumber)
    if (!validation.valid) {
      errors.push(...validation.errors.map(e => ({ row: rowNumber, message: e })))
      failedCount++
      continue
    }

    // Check for duplicates
    if (row.sku && options.existingSkus.has(row.sku)) {
      if (options.duplicateHandling === 'skip') {
        skippedCount++
        continue
      } else if (options.duplicateHandling === 'replace') {
        // Would update existing item
        successCount++
        continue
      }
      // 'create' - allow duplicate, fall through
    }

    // Handle folder creation
    if (row.folder_name && options.createFolders) {
      if (!options.existingFolders.has(row.folder_name)) {
        options.existingFolders.set(row.folder_name, `folder-${Date.now()}-${i}`)
      }
    }

    // Create item
    createdItemIds.push(`item-${Date.now()}-${i}`)
    successCount++
  }

  return {
    success: failedCount === 0,
    successCount,
    failedCount,
    skippedCount,
    createdItemIds,
    errors,
  }
}

// Check for duplicate SKUs within import file
function findDuplicateSkusInFile(rows: ImportRow[]): Array<{ sku: string; rows: number[] }> {
  const skuMap = new Map<string, number[]>()

  rows.forEach((row, index) => {
    if (row.sku) {
      const existing = skuMap.get(row.sku) || []
      existing.push(index + 1)
      skuMap.set(row.sku, existing)
    }
  })

  return Array.from(skuMap.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([sku, rows]) => ({ sku, rows }))
}

describe('Bulk Import', () => {
  describe('Import Items', () => {
    it('returns success with created item IDs for valid CSV', () => {
      const result = bulkImportItems(
        [
          { name: 'Item 1', quantity: 10 },
          { name: 'Item 2', quantity: 20 },
        ],
        {
          duplicateHandling: 'create',
          createFolders: false,
          existingSkus: new Set(),
          existingFolders: new Map(),
        }
      )

      expect(result.success).toBe(true)
      expect(result.successCount).toBe(2)
      expect(result.createdItemIds.length).toBe(2)
    })

    it('returns failed rows with errors', () => {
      const result = bulkImportItems(
        [
          { name: '', quantity: 10 }, // Invalid - no name
          { name: 'Valid Item', quantity: 20 },
        ],
        {
          duplicateHandling: 'create',
          createFolders: false,
          existingSkus: new Set(),
          existingFolders: new Map(),
        }
      )

      expect(result.failedCount).toBe(1)
      expect(result.errors.length).toBe(1)
      expect(result.errors[0].row).toBe(1)
    })

    it('returns skipped count for duplicate skip option', () => {
      const result = bulkImportItems(
        [
          { name: 'Item 1', quantity: 10, sku: 'SKU-001' },
          { name: 'Item 2', quantity: 20, sku: 'SKU-002' },
        ],
        {
          duplicateHandling: 'skip',
          createFolders: false,
          existingSkus: new Set(['SKU-001']),
          existingFolders: new Map(),
        }
      )

      expect(result.skippedCount).toBe(1)
      expect(result.successCount).toBe(1)
    })

    it('updates existing items for duplicate replace option', () => {
      const result = bulkImportItems(
        [
          { name: 'Item 1', quantity: 10, sku: 'SKU-001' },
        ],
        {
          duplicateHandling: 'replace',
          createFolders: false,
          existingSkus: new Set(['SKU-001']),
          existingFolders: new Map(),
        }
      )

      expect(result.successCount).toBe(1)
      expect(result.skippedCount).toBe(0)
    })

    it('creates folders when createFolders option enabled', () => {
      const existingFolders = new Map<string, string>()

      bulkImportItems(
        [
          { name: 'Item 1', quantity: 10, folder_name: 'Electronics' },
          { name: 'Item 2', quantity: 20, folder_name: 'Office' },
        ],
        {
          duplicateHandling: 'create',
          createFolders: true,
          existingSkus: new Set(),
          existingFolders,
        }
      )

      expect(existingFolders.has('Electronics')).toBe(true)
      expect(existingFolders.has('Office')).toBe(true)
    })
  })

  describe('Quota Check', () => {
    it('returns allowed when within quota', () => {
      const result = checkImportQuota(10, 50, 100)

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(50)
    })

    it('returns not allowed when exceeds quota', () => {
      const result = checkImportQuota(60, 50, 100)

      expect(result.allowed).toBe(false)
      expect(result.message).toContain('exceed quota')
    })

    it('returns exact remaining count', () => {
      const result = checkImportQuota(5, 95, 100)

      expect(result.remaining).toBe(5)
    })

    it('allows import up to exactly remaining quota', () => {
      const result = checkImportQuota(50, 50, 100)

      expect(result.allowed).toBe(true)
    })
  })

  describe('Validation', () => {
    it('validates required fields', () => {
      const result = validateImportRow({}, 1)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('validates field types', () => {
      const result = validateImportRow(
        { name: 'Test', quantity: -5 },
        1
      )

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('non-negative'))).toBe(true)
    })

    it('returns row number with each error', () => {
      const result = validateImportRow({ name: '', quantity: 10 }, 5)

      expect(result.errors[0]).toContain('Row 5')
    })

    it('validates price is non-negative', () => {
      const result = validateImportRow(
        { name: 'Test', quantity: 10, price: -100 },
        1
      )

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Price'))).toBe(true)
    })
  })

  describe('SKU Uniqueness', () => {
    it('detects duplicates within import file', () => {
      const rows: ImportRow[] = [
        { name: 'Item 1', quantity: 10, sku: 'SKU-001' },
        { name: 'Item 2', quantity: 20, sku: 'SKU-002' },
        { name: 'Item 3', quantity: 30, sku: 'SKU-001' }, // Duplicate
      ]

      const duplicates = findDuplicateSkusInFile(rows)

      expect(duplicates.length).toBe(1)
      expect(duplicates[0].sku).toBe('SKU-001')
      expect(duplicates[0].rows).toEqual([1, 3])
    })

    it('detects duplicates in database via existingSkus', () => {
      const result = bulkImportItems(
        [{ name: 'Duplicate', quantity: 10, sku: 'EXISTING-SKU' }],
        {
          duplicateHandling: 'skip',
          createFolders: false,
          existingSkus: new Set(['EXISTING-SKU']),
          existingFolders: new Map(),
        }
      )

      expect(result.skippedCount).toBe(1)
    })
  })
})
