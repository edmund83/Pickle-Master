'use client'

import readXlsxFile from 'read-excel-file'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  X,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { canAddItemsClient } from '@/lib/quota-client'

// Field mapping configuration
const IMPORTABLE_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'sku', label: 'SKU', required: false },
  { key: 'barcode', label: 'Barcode', required: false },
  { key: 'description', label: 'Description', required: false },
  { key: 'quantity', label: 'Quantity', required: true },
  { key: 'unit', label: 'Unit', required: false },
  { key: 'min_quantity', label: 'Min Quantity', required: false },
  { key: 'price', label: 'Price', required: false },
  { key: 'cost_price', label: 'Cost Price', required: false },
  { key: 'location', label: 'Location', required: false },
  { key: 'notes', label: 'Notes', required: false },
] as const

type FieldKey = typeof IMPORTABLE_FIELDS[number]['key']
type ColumnMapping = Record<string, FieldKey | null>

interface ParsedRow {
  data: Record<string, string>
  errors: string[]
  isValid: boolean
}

interface ImportResult {
  success: number
  failed: number
  errors: { row: number; message: string }[]
}

type WizardStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

export default function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState<WizardStep>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)



  // ... existing imports ...

  // Parse Excel file
  const parseExcel = useCallback(async (file: File) => {
    try {
      const rows = await readXlsxFile(file)
      if (rows.length < 2) {
        throw new Error('File must have at least a header row and one data row')
      }

      // Convert all values to strings for consistency with CSV logic
      const stringRows = rows.map(row =>
        row.map(cell => {
          if (cell === null || cell === undefined) return ''
          if (cell instanceof Date) return cell.toISOString() // Or format as needed
          return String(cell).trim()
        })
      )

      const headers = stringRows[0]
      const dataRows = stringRows.slice(1)

      return { headers, rows: dataRows }
    } catch (err) {
      throw new Error('Failed to parse Excel file: ' + (err instanceof Error ? err.message : String(err)))
    }
  }, [])

  // Parse CSV file
  const parseCSV = useCallback((text: string) => {
    // ... existing CSV logic ...
    const lines = text.split('\n').filter((line) => line.trim())
    if (lines.length < 2) {
      throw new Error('File must have at least a header row and one data row')
    }

    const parseRow = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseRow(lines[0])
    const dataRows = lines.slice(1).map(parseRow)

    return { headers, rows: dataRows }
  }, [])

  // Handle file selection
  const handleFile = useCallback(async (selectedFile: File) => {
    setError(null)

    const isCSV = selectedFile.name.endsWith('.csv')
    const isExcel = selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')

    if (!isCSV && !isExcel) {
      setError('Only CSV and Excel (.xlsx, .xls) files are supported')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB')
      return
    }

    try {
      let parsedHeaders: string[] = []
      let parsedRows: string[][] = []

      if (isExcel) {
        const result = await parseExcel(selectedFile)
        parsedHeaders = result.headers
        parsedRows = result.rows
      } else {
        const text = await selectedFile.text()
        const result = parseCSV(text)
        parsedHeaders = result.headers
        parsedRows = result.rows
      }

      setFile(selectedFile)
      setHeaders(parsedHeaders)
      setRows(parsedRows)

      // Auto-map columns based on header names
      const autoMapping: ColumnMapping = {}
      parsedHeaders.forEach((header) => {
        const normalized = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')
        const matchedField = IMPORTABLE_FIELDS.find(
          (f) =>
            f.key === normalized ||
            f.label.toLowerCase() === header.toLowerCase() ||
            (f.key === 'min_quantity' && normalized.includes('min')) ||
            (f.key === 'quantity' && normalized === 'qty')
        )
        if (matchedField) {
          autoMapping[header] = matchedField.key
        }
      })
      setColumnMapping(autoMapping)
      setStep('mapping')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    }
  }, [parseCSV, parseExcel])

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }, [handleFile])

  // Validate and parse rows based on mapping
  const validateRows = useCallback(() => {
    const validated: ParsedRow[] = rows.map((row) => {
      const data: Record<string, string> = {}
      const errors: string[] = []

      // Map columns to fields
      headers.forEach((header, index) => {
        const fieldKey = columnMapping[header]
        if (fieldKey && row[index] !== undefined) {
          data[fieldKey] = row[index]
        }
      })

      // Validate required fields
      IMPORTABLE_FIELDS.forEach((field) => {
        if (field.required && !data[field.key]?.trim()) {
          errors.push(`${field.label} is required`)
        }
      })

      // Validate quantity is a number
      if (data.quantity && isNaN(parseFloat(data.quantity))) {
        errors.push('Quantity must be a number')
      }

      // Validate price is a number
      if (data.price && isNaN(parseFloat(data.price))) {
        errors.push('Price must be a number')
      }

      // Validate cost_price is a number
      if (data.cost_price && isNaN(parseFloat(data.cost_price))) {
        errors.push('Cost Price must be a number')
      }

      return {
        data,
        errors,
        isValid: errors.length === 0,
      }
    })

    setParsedRows(validated)
    return validated
  }, [rows, headers, columnMapping])

  // Proceed to preview step
  const handleMapping = () => {
    // Check that required fields are mapped
    const requiredFields = IMPORTABLE_FIELDS.filter((f) => f.required)
    const mappedFields = new Set(Object.values(columnMapping).filter(Boolean))

    for (const field of requiredFields) {
      if (!mappedFields.has(field.key)) {
        setError(`Required field "${field.label}" is not mapped`)
        return
      }
    }

    const validated = validateRows()
    const validCount = validated.filter((r) => r.isValid).length
    if (validCount === 0) {
      setError('No valid rows to import')
      return
    }

    setError(null)
    setStep('preview')
  }

  // Import items
  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid)
    if (validRows.length === 0) return

    setImporting(true)
    setStep('importing')

    try {
      // Check quota before importing
      const quotaCheck = await canAddItemsClient(validRows.length)
      if (!quotaCheck.allowed) {
        setError(quotaCheck.message || 'Item limit reached. Please upgrade your plan.')
        setStep('preview')
        setImporting(false)
        return
      }

      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) {
        throw new Error('No tenant found')
      }

      const results: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
      }

      // Import items one by one to track individual errors
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i]
        try {
          const quantity = parseFloat(row.data.quantity) || 0
          const minQuantity = parseFloat(row.data.min_quantity || '0') || 0

          // Determine status
          let status = 'in_stock'
          if (quantity <= 0) {
            status = 'out_of_stock'
          } else if (minQuantity > 0 && quantity <= minQuantity) {
            status = 'low_stock'
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: insertError } = await (supabase as any)
            .from('inventory_items')
            .insert({
              tenant_id: profile.tenant_id,
              name: row.data.name,
              sku: row.data.sku || null,
              barcode: row.data.barcode || null,
              description: row.data.description || null,
              quantity,
              unit: row.data.unit || 'pcs',
              min_quantity: minQuantity,
              price: parseFloat(row.data.price || '0') || 0,
              cost_price: row.data.cost_price ? parseFloat(row.data.cost_price) : null,
              location: row.data.location || null,
              notes: row.data.notes || null,
              status,
              created_by: user.id,
              last_modified_by: user.id,
            })

          if (insertError) {
            results.failed++
            results.errors.push({ row: i + 1, message: insertError.message })
          } else {
            results.success++
          }
        } catch (err) {
          results.failed++
          results.errors.push({
            row: i + 1,
            message: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      }

      setImportResult(results)
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setStep('preview')
    } finally {
      setImporting(false)
    }
  }

  // Download sample CSV
  const downloadSample = () => {
    const headers = IMPORTABLE_FIELDS.map((f) => f.label).join(',')
    const sampleRow = 'Sample Item,SKU-001,123456789,A sample product,10,pcs,5,19.99,12.50,Warehouse A,Some notes'
    const csv = `${headers}\n${sampleRow}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const validRowCount = parsedRows.filter((r) => r.isValid).length
  const invalidRowCount = parsedRows.filter((r) => !r.isValid).length

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Import Inventory</h1>
            <p className="text-sm text-neutral-500">Upload a CSV file to bulk import items</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={downloadSample}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {(['upload', 'mapping', 'preview', 'complete'] as const).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step === s
                  ? 'bg-pickle-500 text-white'
                  : ['upload', 'mapping', 'preview', 'importing', 'complete'].indexOf(step) >
                    ['upload', 'mapping', 'preview', 'complete'].indexOf(s)
                    ? 'bg-pickle-100 text-pickle-600'
                    : 'bg-neutral-100 text-neutral-400'
                  }`}
              >
                {i + 1}
              </div>
              <span
                className={`ml-2 text-sm ${step === s ? 'font-medium text-neutral-900' : 'text-neutral-500'
                  }`}
              >
                {s === 'upload' && 'Upload'}
                {s === 'mapping' && 'Map Columns'}
                {s === 'preview' && 'Preview'}
                {s === 'complete' && 'Complete'}
              </span>
              {i < 3 && <ChevronRight className="ml-2 h-4 w-4 text-neutral-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload CSV or Excel File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                  }}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${dragOver
                    ? 'border-pickle-500 bg-pickle-50'
                    : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                >
                  <Upload className="h-12 w-12 text-neutral-400" />
                  <p className="mt-4 text-lg font-medium text-neutral-900">
                    Drag and drop your CSV file here
                  </p>
                  <p className="mt-1 text-neutral-500">or</p>
                  <label className="mt-3">
                    <Button variant="outline">Browse Files</Button>
                    <input
                      accept=".csv, .xlsx, .xls"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0]
                        if (selectedFile) handleFile(selectedFile)
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-4 text-xs text-neutral-400">
                    Only CSV and Excel files up to 5MB are supported
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Column Mapping */}
          {step === 'mapping' && (
            <Card>
              <CardHeader>
                <CardTitle>Map Columns</CardTitle>
                <p className="text-sm text-neutral-500">
                  Match your CSV columns to inventory fields. Required fields are marked with *.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {headers.map((header) => (
                    <div key={header} className="flex items-center gap-4">
                      <div className="w-48 truncate font-mono text-sm text-neutral-600">
                        {header}
                      </div>
                      <ChevronRight className="h-4 w-4 text-neutral-300" />
                      <select
                        value={columnMapping[header] || ''}
                        onChange={(e) =>
                          setColumnMapping({
                            ...columnMapping,
                            [header]: (e.target.value as FieldKey) || null,
                          })
                        }
                        className="h-10 w-48 rounded-lg border border-neutral-300 px-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                      >
                        <option value="">-- Skip this column --</option>
                        {IMPORTABLE_FIELDS.map((field) => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                            {field.required ? ' *' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFile(null)
                      setHeaders([])
                      setRows([])
                      setColumnMapping({})
                      setStep('upload')
                    }}
                  >
                    Back
                  </Button>
                  <Button onClick={handleMapping}>
                    Continue to Preview
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Import Preview</CardTitle>
                  <p className="text-sm text-neutral-500">
                    Review the data before importing. Invalid rows will be skipped.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-4">
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {validRowCount} valid rows
                    </div>
                    {invalidRowCount > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        {invalidRowCount} invalid rows
                      </div>
                    )}
                  </div>
                  <div className="max-h-96 overflow-auto rounded-lg border border-neutral-200">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-neutral-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-neutral-600">#</th>
                          <th className="px-4 py-2 text-left font-medium text-neutral-600">
                            Status
                          </th>
                          {IMPORTABLE_FIELDS.filter(
                            (f) =>
                              f.required ||
                              Object.values(columnMapping).includes(f.key)
                          ).map((field) => (
                            <th
                              key={field.key}
                              className="px-4 py-2 text-left font-medium text-neutral-600"
                            >
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.slice(0, 50).map((row, i) => (
                          <tr
                            key={i}
                            className={row.isValid ? 'bg-white' : 'bg-red-50'}
                          >
                            <td className="px-4 py-2 text-neutral-500">{i + 1}</td>
                            <td className="px-4 py-2">
                              {row.isValid ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <span className="text-xs text-red-600" title={row.errors.join(', ')}>
                                  {row.errors[0]}
                                </span>
                              )}
                            </td>
                            {IMPORTABLE_FIELDS.filter(
                              (f) =>
                                f.required ||
                                Object.values(columnMapping).includes(f.key)
                            ).map((field) => (
                              <td key={field.key} className="px-4 py-2 text-neutral-900">
                                {row.data[field.key] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedRows.length > 50 && (
                      <div className="bg-neutral-50 px-4 py-2 text-center text-sm text-neutral-500">
                        Showing first 50 rows of {parsedRows.length}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('mapping')}>
                  Back
                </Button>
                <Button onClick={handleImport} disabled={validRowCount === 0}>
                  Import {validRowCount} Items
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Importing */}
          {step === 'importing' && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-pickle-500" />
                <p className="mt-4 text-lg font-medium text-neutral-900">Importing items...</p>
                <p className="mt-1 text-neutral-500">This may take a moment</p>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && importResult && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center text-center">
                  {importResult.failed === 0 ? (
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  ) : (
                    <AlertCircle className="h-16 w-16 text-yellow-500" />
                  )}
                  <h2 className="mt-4 text-2xl font-semibold text-neutral-900">
                    Import Complete
                  </h2>
                  <div className="mt-4 flex gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{importResult.success}</p>
                      <p className="text-sm text-neutral-500">Imported</p>
                    </div>
                    {importResult.failed > 0 && (
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">{importResult.failed}</p>
                        <p className="text-sm text-neutral-500">Failed</p>
                      </div>
                    )}
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-6 w-full max-w-md rounded-lg bg-red-50 p-4 text-left">
                      <p className="mb-2 font-medium text-red-700">Errors:</p>
                      <ul className="max-h-32 space-y-1 overflow-auto text-sm text-red-600">
                        {importResult.errors.slice(0, 10).map((err, i) => (
                          <li key={i}>
                            Row {err.row}: {err.message}
                          </li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li>...and {importResult.errors.length - 10} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  <div className="mt-8 flex gap-3">
                    <Link href="/inventory">
                      <Button>View Inventory</Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFile(null)
                        setHeaders([])
                        setRows([])
                        setColumnMapping({})
                        setParsedRows([])
                        setImportResult(null)
                        setStep('upload')
                      }}
                    >
                      Import More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
