/**
 * Validation utilities for bulk import
 * Validates individual rows and aggregates results
 */

import { IMPORT_FIELDS, type ImportField } from './fields'
import type { ColumnMapping } from './parser'

export interface ParsedRow {
  rowNumber: number
  data: Record<string, string>
  errors: string[]
  warnings: string[]
  isValid: boolean
}

export interface ValidationResult {
  rows: ParsedRow[]
  validCount: number
  invalidCount: number
  totalRows: number
  hasRequiredMappings: boolean
  missingRequiredFields: string[]
}

/**
 * Check if a value is a valid number
 */
function isValidNumber(value: string): boolean {
  if (!value || value.trim() === '') return true // Empty is valid for optional fields
  const num = parseFloat(value)
  return !isNaN(num) && isFinite(num)
}

/**
 * Check if a value is a valid non-negative number
 */
function isValidNonNegativeNumber(value: string): boolean {
  if (!value || value.trim() === '') return true
  const num = parseFloat(value)
  return !isNaN(num) && isFinite(num) && num >= 0
}

/**
 * Validate a single row of data
 */
export function validateRow(
  data: Record<string, string>,
  rowNumber: number,
  fields: ImportField[] = IMPORT_FIELDS
): ParsedRow {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate each field
  for (const field of fields) {
    const value = data[field.key]?.trim() || ''

    // Check required fields
    if (field.required && !value) {
      errors.push(`${field.label} is required`)
      continue
    }

    // Skip empty optional fields
    if (!value) continue

    // Type-specific validation
    switch (field.type) {
      case 'number':
        if (!isValidNumber(value)) {
          errors.push(`${field.label} must be a valid number`)
        } else if (field.key === 'quantity' || field.key === 'min_quantity') {
          // Quantity fields must be non-negative
          if (!isValidNonNegativeNumber(value)) {
            errors.push(`${field.label} must be a non-negative number`)
          }
        } else if (field.key === 'price' || field.key === 'cost_price') {
          // Price fields should be non-negative
          const num = parseFloat(value)
          if (num < 0) {
            warnings.push(`${field.label} is negative`)
          }
        }
        break

      case 'string':
        // Check for reasonable length
        if (value.length > 500 && field.key === 'name') {
          errors.push('Name must be 500 characters or less')
        }
        if (value.length > 2000 && field.key === 'description') {
          warnings.push('Description is very long and may be truncated')
        }
        break

      case 'tags':
        // Tags are comma-separated, just check format
        const tags = value.split(',').map((t) => t.trim()).filter(Boolean)
        if (tags.length > 20) {
          warnings.push('More than 20 tags may affect performance')
        }
        break

      case 'folder':
        // Folder names should be reasonable length
        if (value.length > 255) {
          errors.push('Folder name must be 255 characters or less')
        }
        break
    }
  }

  // Additional cross-field validation
  const quantity = parseFloat(data.quantity || '0')
  const minQuantity = parseFloat(data.min_quantity || '0')

  if (!isNaN(quantity) && !isNaN(minQuantity) && minQuantity > 0 && quantity <= minQuantity) {
    warnings.push('Quantity is at or below minimum threshold (will be marked as low stock)')
  }

  return {
    rowNumber,
    data,
    errors,
    warnings,
    isValid: errors.length === 0,
  }
}

/**
 * Check if all required fields are mapped
 */
export function checkRequiredMappings(
  mapping: ColumnMapping,
  fields: ImportField[] = IMPORT_FIELDS
): { valid: boolean; missing: string[] } {
  const requiredFields = fields.filter((f) => f.required)
  const mappedFields = new Set(Object.values(mapping).filter(Boolean))

  const missing: string[] = []
  for (const field of requiredFields) {
    if (!mappedFields.has(field.key)) {
      missing.push(field.label)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Validate all rows
 */
export function validateAllRows(
  rows: string[][],
  headers: string[],
  mapping: ColumnMapping,
  fields: ImportField[] = IMPORT_FIELDS
): ValidationResult {
  // First check if required fields are mapped
  const { valid: hasRequiredMappings, missing: missingRequiredFields } =
    checkRequiredMappings(mapping, fields)

  // Map and validate each row
  const parsedRows: ParsedRow[] = rows.map((row, index) => {
    // Apply mapping to extract data
    const data: Record<string, string> = {}
    headers.forEach((header, colIndex) => {
      const fieldKey = mapping[header]
      if (fieldKey && row[colIndex] !== undefined) {
        data[fieldKey] = row[colIndex]
      }
    })

    return validateRow(data, index + 1, fields) // rowNumber is 1-indexed
  })

  const validCount = parsedRows.filter((r) => r.isValid).length
  const invalidCount = parsedRows.filter((r) => !r.isValid).length

  return {
    rows: parsedRows,
    validCount,
    invalidCount,
    totalRows: rows.length,
    hasRequiredMappings,
    missingRequiredFields,
  }
}

/**
 * Extract valid rows for import (only the data, ready for server action)
 */
export function extractValidRowsForImport(
  validationResult: ValidationResult
): Record<string, string>[] {
  return validationResult.rows
    .filter((r) => r.isValid)
    .map((r) => r.data)
}

/**
 * Format row data for database import
 * Converts string values to appropriate types
 */
export function formatRowForImport(data: Record<string, string>): Record<string, unknown> {
  return {
    name: data.name?.trim() || '',
    sku: data.sku?.trim() || null,
    barcode: data.barcode?.trim() || null,
    description: data.description?.trim() || null,
    quantity: parseInt(data.quantity || '0', 10) || 0,
    min_quantity: parseInt(data.min_quantity || '0', 10) || 0,
    unit: data.unit?.trim() || 'pcs',
    price: parseFloat(data.price || '0') || 0,
    cost_price: data.cost_price ? parseFloat(data.cost_price) : null,
    location: data.location?.trim() || null,
    notes: data.notes?.trim() || null,
    tags: data.tags?.trim() || null,
    folder: data.folder?.trim() || null,
  }
}

/**
 * Format all valid rows for import
 */
export function formatAllRowsForImport(
  validationResult: ValidationResult
): Record<string, unknown>[] {
  return validationResult.rows
    .filter((r) => r.isValid)
    .map((r) => formatRowForImport(r.data))
}
