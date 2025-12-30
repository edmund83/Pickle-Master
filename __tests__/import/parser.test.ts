import { describe, it, expect } from 'vitest'
import {
  parseCSV,
  normalizeHeader,
  autoMapColumns,
  generateSampleCSV,
} from '@/lib/import/parser'
import { IMPORT_FIELDS } from '@/lib/import/fields'

describe('CSV Parser', () => {
  describe('parseCSV', () => {
    it('parses simple CSV correctly', () => {
      const csv = `Name,Quantity,Price
Item 1,10,19.99
Item 2,5,9.99`
      const result = parseCSV(csv)

      expect(result.headers).toEqual(['Name', 'Quantity', 'Price'])
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0]).toEqual(['Item 1', '10', '19.99'])
      expect(result.rows[1]).toEqual(['Item 2', '5', '9.99'])
    })

    it('handles quoted fields with commas', () => {
      const csv = `Name,Description,Quantity
"Item, with comma","Description, also with comma",10`
      const result = parseCSV(csv)

      expect(result.headers).toEqual(['Name', 'Description', 'Quantity'])
      expect(result.rows[0]).toEqual([
        'Item, with comma',
        'Description, also with comma',
        '10',
      ])
    })

    it('handles escaped quotes within quoted fields', () => {
      const csv = `Name,Description
"Item ""quoted""","A ""test"" item"`
      const result = parseCSV(csv)

      expect(result.rows[0]).toEqual(['Item "quoted"', 'A "test" item'])
    })

    it('handles empty fields', () => {
      const csv = `Name,Quantity,Price
Item 1,,19.99
Item 2,5,`
      const result = parseCSV(csv)

      expect(result.rows[0]).toEqual(['Item 1', '', '19.99'])
      expect(result.rows[1]).toEqual(['Item 2', '5', ''])
    })

    it('handles BOM characters', () => {
      const csv = `\uFEFFName,Quantity
Item 1,10`
      const result = parseCSV(csv)

      expect(result.headers).toEqual(['Name', 'Quantity'])
    })

    it('handles Windows line endings (CRLF)', () => {
      const csv = `Name,Quantity\r\nItem 1,10\r\nItem 2,20`
      const result = parseCSV(csv)

      expect(result.headers).toEqual(['Name', 'Quantity'])
      expect(result.rows).toHaveLength(2)
    })

    it('throws error on file with only header', () => {
      const csv = `Name,Quantity`
      expect(() => parseCSV(csv)).toThrow(
        'File must have at least a header row and one data row'
      )
    })

    it('throws error on empty file', () => {
      const csv = ``
      expect(() => parseCSV(csv)).toThrow(
        'File must have at least a header row and one data row'
      )
    })

    it('handles whitespace-only rows', () => {
      const csv = `Name,Quantity
Item 1,10

Item 2,20`
      const result = parseCSV(csv)

      // Empty/whitespace rows should be filtered out
      expect(result.rows).toHaveLength(2)
    })

    it('trims field values', () => {
      const csv = `Name,Quantity
  Item 1  ,  10  `
      const result = parseCSV(csv)

      expect(result.rows[0]).toEqual(['Item 1', '10'])
    })
  })

  describe('normalizeHeader', () => {
    it('converts to lowercase', () => {
      expect(normalizeHeader('Name')).toBe('name')
      expect(normalizeHeader('QUANTITY')).toBe('quantity')
    })

    it('replaces spaces with underscores', () => {
      expect(normalizeHeader('Min Quantity')).toBe('min_quantity')
      expect(normalizeHeader('Cost Price')).toBe('cost_price')
    })

    it('removes special characters', () => {
      expect(normalizeHeader('Name*')).toBe('name')
      expect(normalizeHeader('Price ($)')).toBe('price')
    })

    it('handles multiple underscores', () => {
      expect(normalizeHeader('Name   Value')).toBe('name_value')
    })

    it('trims leading/trailing underscores', () => {
      expect(normalizeHeader('_name_')).toBe('name')
    })
  })

  describe('autoMapColumns', () => {
    it('maps exact key matches', () => {
      const headers = ['name', 'quantity', 'sku']
      const mapping = autoMapColumns(headers)

      expect(mapping['name']).toBe('name')
      expect(mapping['quantity']).toBe('quantity')
      expect(mapping['sku']).toBe('sku')
    })

    it('maps case-insensitive label matches', () => {
      const headers = ['Name', 'Quantity', 'SKU']
      const mapping = autoMapColumns(headers)

      expect(mapping['Name']).toBe('name')
      expect(mapping['Quantity']).toBe('quantity')
      expect(mapping['SKU']).toBe('sku')
    })

    it('maps alias matches', () => {
      const headers = ['Product Name', 'Qty', 'Cost']
      const mapping = autoMapColumns(headers)

      expect(mapping['Product Name']).toBe('name')
      expect(mapping['Qty']).toBe('quantity')
      expect(mapping['Cost']).toBe('cost_price')
    })

    it('handles unrecognized headers', () => {
      const headers = ['Name', 'Unknown Field', 'quantity']
      const mapping = autoMapColumns(headers)

      expect(mapping['Name']).toBe('name')
      expect(mapping['Unknown Field']).toBeNull()
      expect(mapping['quantity']).toBe('quantity')
    })

    it('does not map same field twice', () => {
      const headers = ['Name', 'Item Name', 'Product Name']
      const mapping = autoMapColumns(headers)

      // Only first match should be mapped
      const mappedToName = Object.values(mapping).filter((v) => v === 'name')
      expect(mappedToName).toHaveLength(1)
    })

    it('maps min_quantity from aliases', () => {
      const headers = ['Reorder Point', 'min qty', 'minimum']
      const mapping = autoMapColumns(headers)

      // One of these should map to min_quantity
      const values = Object.values(mapping)
      expect(values).toContain('min_quantity')
    })

    it('maps price from aliases', () => {
      const headers = ['Sell Price', 'Unit Price', 'Retail Price']
      const mapping = autoMapColumns(headers)

      const values = Object.values(mapping)
      expect(values).toContain('price')
    })

    it('maps tags and folder correctly', () => {
      const headers = ['Labels', 'Category']
      const mapping = autoMapColumns(headers)

      expect(mapping['Labels']).toBe('tags')
      expect(mapping['Category']).toBe('folder')
    })
  })

  describe('generateSampleCSV', () => {
    it('generates CSV with all field headers', () => {
      const csv = generateSampleCSV()
      const lines = csv.split('\n')
      const headers = lines[0].split(',')

      expect(headers).toHaveLength(IMPORT_FIELDS.length)
      expect(headers).toContain('Name')
      expect(headers).toContain('Quantity')
    })

    it('includes sample data row', () => {
      const csv = generateSampleCSV()
      const lines = csv.split('\n')

      expect(lines).toHaveLength(2) // Header + 1 data row
      expect(lines[1]).toContain('Sample Item')
    })

    it('includes example values for all fields', () => {
      const csv = generateSampleCSV()
      const lines = csv.split('\n')
      const dataLine = lines[1]

      // Check some specific values exist in the data line
      expect(dataLine).toContain('Sample Item')
      expect(dataLine).toContain('SKU-001')
      expect(dataLine).toContain('electronics') // part of tags
      expect(dataLine).toContain('Electronics') // folder
    })
  })
})
