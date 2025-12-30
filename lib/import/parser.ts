/**
 * CSV and Excel file parsing utilities for bulk import
 * Handles parsing, column auto-mapping, and data extraction
 */

import readXlsxFile from 'read-excel-file'
import { IMPORT_FIELDS, type ImportField } from './fields'

export type ColumnMapping = Record<string, string | null>

export interface ParseResult {
  headers: string[]
  rows: string[][]
  truncated?: boolean
  originalRowCount?: number
}

// Maximum number of rows to import at once (excluding header)
export const MAX_IMPORT_ROWS = 1000

/**
 * Parse CSV text into headers and rows
 * Handles quoted fields, commas within quotes, and various edge cases
 */
export function parseCSV(text: string): ParseResult {
  // Remove BOM if present
  const cleanText = text.replace(/^\uFEFF/, '')

  // Split into lines, handling both \n and \r\n
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length < 2) {
    throw new Error('File must have at least a header row and one data row')
  }

  const parseRow = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote within quoted field
          current += '"'
          i++ // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    // Don't forget the last field
    result.push(current.trim())

    return result
  }

  const headers = parseRow(lines[0])
  const allRows = lines.slice(1).map(parseRow)
  const originalRowCount = allRows.length
  const truncated = originalRowCount > MAX_IMPORT_ROWS
  const rows = truncated ? allRows.slice(0, MAX_IMPORT_ROWS) : allRows

  return { headers, rows, truncated, originalRowCount }
}

/**
 * Parse Excel file (.xlsx, .xls) into headers and rows
 */
export async function parseExcel(file: File): Promise<ParseResult> {
  try {
    const rawRows = await readXlsxFile(file)

    if (rawRows.length < 2) {
      throw new Error('File must have at least a header row and one data row')
    }

    // Convert all values to strings for consistency
    const stringRows = rawRows.map((row) =>
      row.map((cell) => {
        if (cell === null || cell === undefined) return ''
        if (cell instanceof Date) {
          // Format date as YYYY-MM-DD
          return cell.toISOString().split('T')[0]
        }
        return String(cell).trim()
      })
    )

    const headers = stringRows[0]
    const allRows = stringRows.slice(1)
    const originalRowCount = allRows.length
    const truncated = originalRowCount > MAX_IMPORT_ROWS
    const rows = truncated ? allRows.slice(0, MAX_IMPORT_ROWS) : allRows

    return { headers, rows, truncated, originalRowCount }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to parse Excel file: ${message}`)
  }
}

/**
 * Parse file based on extension
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase()
  const isCSV = fileName.endsWith('.csv')
  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

  if (!isCSV && !isExcel) {
    throw new Error('Only CSV and Excel (.xlsx, .xls) files are supported')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File must be less than 5MB')
  }

  if (isExcel) {
    return parseExcel(file)
  }

  // CSV parsing
  const text = await file.text()
  return parseCSV(text)
}

/**
 * Normalize a header string for matching
 * - Lowercase
 * - Remove special characters except underscores
 * - Trim whitespace
 */
export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Auto-map column headers to import fields
 * Uses exact matches, case-insensitive matches, and alias matching
 */
export function autoMapColumns(
  headers: string[],
  fields: ImportField[] = IMPORT_FIELDS
): ColumnMapping {
  const mapping: ColumnMapping = {}
  const usedFields = new Set<string>()

  for (const header of headers) {
    const normalized = normalizeHeader(header)
    const headerLower = header.toLowerCase().trim()

    // Try to find a matching field
    let matchedField: ImportField | undefined

    // 1. Exact key match
    matchedField = fields.find(
      (f) => !usedFields.has(f.key) && f.key === normalized
    )

    // 2. Label match (case-insensitive)
    if (!matchedField) {
      matchedField = fields.find(
        (f) => !usedFields.has(f.key) && f.label.toLowerCase() === headerLower
      )
    }

    // 3. Alias match
    if (!matchedField) {
      matchedField = fields.find(
        (f) =>
          !usedFields.has(f.key) &&
          f.aliases.some((alias) => {
            const normalizedAlias = normalizeHeader(alias)
            return normalizedAlias === normalized || alias.toLowerCase() === headerLower
          })
      )
    }

    if (matchedField) {
      mapping[header] = matchedField.key
      usedFields.add(matchedField.key)
    } else {
      mapping[header] = null // Column will be skipped
    }
  }

  return mapping
}

/**
 * Apply column mapping to extract data from rows
 */
export function applyMapping(
  rows: string[][],
  headers: string[],
  mapping: ColumnMapping
): Record<string, string>[] {
  return rows.map((row) => {
    const data: Record<string, string> = {}

    headers.forEach((header, index) => {
      const fieldKey = mapping[header]
      if (fieldKey && row[index] !== undefined) {
        data[fieldKey] = row[index]
      }
    })

    return data
  })
}

/**
 * Generate a sample CSV content for template download
 */
export function generateSampleCSV(fields: ImportField[] = IMPORT_FIELDS): string {
  const headers = fields.map((f) => f.label).join(',')
  const sampleValues = fields
    .map((f) => {
      switch (f.key) {
        case 'name':
          return 'Sample Item'
        case 'quantity':
          return '10'
        case 'sku':
          return 'SKU-001'
        case 'barcode':
          return '123456789012'
        case 'description':
          return 'A sample product description'
        case 'unit':
          return 'pcs'
        case 'min_quantity':
          return '5'
        case 'price':
          return '19.99'
        case 'cost_price':
          return '12.50'
        case 'location':
          return 'Warehouse A'
        case 'notes':
          return 'Some notes'
        case 'tags':
          return 'electronics,new'
        case 'folder':
          return 'Electronics'
        default:
          return ''
      }
    })
    .join(',')

  return `${headers}\n${sampleValues}`
}

/**
 * Download sample template as CSV file
 */
export function downloadSampleCSV(fields: ImportField[] = IMPORT_FIELDS): void {
  const csv = generateSampleCSV(fields)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'inventory-import-template.csv'
  link.click()
  URL.revokeObjectURL(url)
}
