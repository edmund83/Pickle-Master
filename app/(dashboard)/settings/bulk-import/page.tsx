'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  X,
  Download,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { canAddItemsClient } from '@/lib/quota-client'
import {
  IMPORT_FIELDS,
  parseFile,
  autoMapColumns,
  validateAllRows,
  formatAllRowsForImport,
  downloadSampleCSV,
  MAX_IMPORT_ROWS,
  type ColumnMapping,
  type ValidationResult,
} from '@/lib/import'
import { bulkImportItems, type BulkImportResult } from '@/app/actions/bulk-import'

type WizardStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

export default function BulkImportPage() {
  // Wizard state
  const [step, setStep] = useState<WizardStep>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [truncationInfo, setTruncationInfo] = useState<{
    truncated: boolean
    originalRowCount: number
  } | null>(null)

  // Handle file selection
  const handleFile = useCallback(async (selectedFile: File) => {
    setError(null)
    setTruncationInfo(null)

    try {
      const { headers: parsedHeaders, rows: parsedRows, truncated, originalRowCount } = await parseFile(selectedFile)

      if (truncated && originalRowCount) {
        setTruncationInfo({ truncated, originalRowCount })
      }

      setFile(selectedFile)
      setHeaders(parsedHeaders)
      setRows(parsedRows)

      // Auto-map columns based on header names
      const autoMapping = autoMapColumns(parsedHeaders)
      setColumnMapping(autoMapping)
      setStep('mapping')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFile(droppedFile)
      }
    },
    [handleFile]
  )

  // Validate and proceed to preview
  const handleMapping = () => {
    const result = validateAllRows(rows, headers, columnMapping)

    if (!result.hasRequiredMappings) {
      setError(`Required fields not mapped: ${result.missingRequiredFields.join(', ')}`)
      return
    }

    if (result.validCount === 0) {
      setError('No valid rows to import. Please check your data.')
      return
    }

    setValidationResult(result)
    setError(null)
    setStep('preview')
  }

  // Import items
  const handleImport = async () => {
    if (!validationResult || validationResult.validCount === 0) return

    setImporting(true)
    setStep('importing')
    setError(null)

    try {
      // Check quota before importing
      const quotaCheck = await canAddItemsClient(validationResult.validCount)
      if (!quotaCheck.allowed) {
        setError(quotaCheck.message || 'Item limit reached. Please upgrade your plan.')
        setStep('preview')
        setImporting(false)
        return
      }

      // Format rows for import
      const itemsToImport = formatAllRowsForImport(validationResult)

      // Call server action
      const result = await bulkImportItems(
        itemsToImport.map((item) => ({
          name: String(item.name),
          sku: item.sku as string | null,
          barcode: item.barcode as string | null,
          description: item.description as string | null,
          quantity: Number(item.quantity) || 0,
          min_quantity: Number(item.min_quantity) || 0,
          unit: String(item.unit || 'pcs'),
          price: Number(item.price) || 0,
          cost_price: item.cost_price ? Number(item.cost_price) : null,
          location: item.location as string | null,
          notes: item.notes as string | null,
          tags: item.tags as string | null,
          folder: item.folder as string | null,
        })),
        { skipDuplicates: true, createFolders: true }
      )

      setImportResult(result)
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setStep('preview')
    } finally {
      setImporting(false)
    }
  }

  // Reset wizard
  const resetWizard = () => {
    setFile(null)
    setHeaders([])
    setRows([])
    setColumnMapping({})
    setValidationResult(null)
    setImportResult(null)
    setError(null)
    setTruncationInfo(null)
    setStep('upload')
  }

  const validRowCount = validationResult?.validCount || 0
  const invalidRowCount = validationResult?.invalidCount || 0

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Bulk Import</h1>
            <p className="text-sm text-neutral-500">
              Import inventory items from CSV or Excel files
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadSampleCSV()}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {(['upload', 'mapping', 'preview', 'complete'] as const).map((s, i) => {
            const stepOrder = ['upload', 'mapping', 'preview', 'importing', 'complete']
            const currentIndex = stepOrder.indexOf(step)
            const stepIndex = stepOrder.indexOf(s === 'complete' ? 'complete' : s)
            const isActive = step === s || (step === 'importing' && s === 'preview')
            const isComplete = currentIndex > stepIndex

            return (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    isActive
                      ? 'bg-pickle-500 text-white'
                      : isComplete
                        ? 'bg-pickle-100 text-pickle-600'
                        : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    isActive ? 'font-medium text-neutral-900' : 'text-neutral-500'
                  }`}
                >
                  {s === 'upload' && 'Upload'}
                  {s === 'mapping' && 'Map Columns'}
                  {s === 'preview' && 'Preview'}
                  {s === 'complete' && 'Complete'}
                </span>
                {i < 3 && <ChevronRight className="ml-2 h-4 w-4 text-neutral-300" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto shrink-0">
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
                  className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                    dragOver
                      ? 'border-pickle-500 bg-pickle-50'
                      : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <Upload className="h-12 w-12 text-neutral-400" />
                  <p className="mt-4 text-lg font-medium text-neutral-900">
                    Drag and drop your file here
                  </p>
                  <p className="mt-1 text-neutral-500">or</p>
                  <div className="mt-3">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0]
                        if (selectedFile) handleFile(selectedFile)
                      }}
                      className="sr-only"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pickle-500 focus-visible:ring-offset-2 active:scale-[0.97] border border-neutral-300 bg-white hover:bg-neutral-50 h-10 px-4 py-2 text-sm rounded-lg"
                    >
                      Browse Files
                    </label>
                  </div>
                  <p className="mt-4 text-xs text-neutral-400">
                    Supported formats: .csv, .xlsx, .xls (max 5MB)
                  </p>
                </div>

                {/* Supported Fields Info */}
                <div className="mt-6 rounded-lg bg-neutral-50 p-4">
                  <h3 className="font-medium text-neutral-900">Supported Fields</h3>
                  <div className="mt-2 grid gap-1 text-sm sm:grid-cols-3">
                    {IMPORT_FIELDS.map((field) => (
                      <div key={field.key} className="flex items-center gap-1">
                        <span className={field.required ? 'text-red-500' : 'text-neutral-300'}>
                          {field.required ? '*' : '-'}
                        </span>
                        <span className="text-neutral-600">{field.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-neutral-400">* Required field</p>
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
                  Match your file columns to inventory fields. Required fields are marked with *.
                </p>
              </CardHeader>
              <CardContent>
                {truncationInfo?.truncated && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      File contains {truncationInfo.originalRowCount.toLocaleString()} rows.
                      Only the first {MAX_IMPORT_ROWS.toLocaleString()} rows will be imported.
                      Split your file into smaller batches to import all data.
                    </span>
                  </div>
                )}
                <div className="space-y-3">
                  {headers.map((header) => (
                    <div key={header} className="flex items-center gap-4">
                      <div className="w-48 truncate rounded bg-neutral-100 px-3 py-2 font-mono text-sm text-neutral-600">
                        {header}
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
                      <select
                        value={columnMapping[header] || ''}
                        onChange={(e) =>
                          setColumnMapping({
                            ...columnMapping,
                            [header]: e.target.value || null,
                          })
                        }
                        className="h-10 flex-1 rounded-lg border border-neutral-300 px-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                      >
                        <option value="">-- Skip this column --</option>
                        {IMPORT_FIELDS.map((field) => (
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
                  <Button variant="outline" onClick={resetWizard}>
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
          {step === 'preview' && validationResult && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Import Preview</CardTitle>
                  <p className="text-sm text-neutral-500">
                    Review the data before importing. Invalid rows will be skipped.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-3">
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
                    {validationResult.rows.some((r) => r.warnings.length > 0) && (
                      <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        {validationResult.rows.filter((r) => r.warnings.length > 0).length} rows
                        with warnings
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
                          {IMPORT_FIELDS.filter(
                            (f) => f.required || Object.values(columnMapping).includes(f.key)
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
                        {validationResult.rows.slice(0, 50).map((row) => (
                          <tr
                            key={row.rowNumber}
                            className={
                              !row.isValid
                                ? 'bg-red-50'
                                : row.warnings.length > 0
                                  ? 'bg-amber-50'
                                  : 'bg-white'
                            }
                          >
                            <td className="px-4 py-2 text-neutral-500">{row.rowNumber}</td>
                            <td className="px-4 py-2">
                              {row.isValid ? (
                                row.warnings.length > 0 ? (
                                  <span
                                    className="text-xs text-amber-600"
                                    title={row.warnings.join(', ')}
                                  >
                                    <AlertTriangle className="inline h-4 w-4" />
                                  </span>
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )
                              ) : (
                                <span
                                  className="text-xs text-red-600"
                                  title={row.errors.join(', ')}
                                >
                                  {row.errors[0]}
                                </span>
                              )}
                            </td>
                            {IMPORT_FIELDS.filter(
                              (f) => f.required || Object.values(columnMapping).includes(f.key)
                            ).map((field) => (
                              <td key={field.key} className="px-4 py-2 text-neutral-900">
                                {row.data[field.key] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validationResult.totalRows > 50 && (
                      <div className="bg-neutral-50 px-4 py-2 text-center text-sm text-neutral-500">
                        Showing first 50 rows of {validationResult.totalRows}
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
                <p className="mt-1 text-neutral-500">
                  This may take a moment for large imports
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && importResult && (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center text-center">
                  {importResult.failedCount === 0 && importResult.successCount > 0 ? (
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  ) : importResult.successCount > 0 ? (
                    <AlertTriangle className="h-16 w-16 text-amber-500" />
                  ) : (
                    <AlertCircle className="h-16 w-16 text-red-500" />
                  )}

                  <h2 className="mt-4 text-2xl font-semibold text-neutral-900">
                    {importResult.successCount > 0 ? 'Import Complete' : 'Import Failed'}
                  </h2>

                  <div className="mt-4 flex gap-6">
                    {importResult.successCount > 0 && (
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">
                          {importResult.successCount}
                        </p>
                        <p className="text-sm text-neutral-500">Imported</p>
                      </div>
                    )}
                    {importResult.skippedCount > 0 && (
                      <div className="text-center">
                        <p className="text-3xl font-bold text-amber-600">
                          {importResult.skippedCount}
                        </p>
                        <p className="text-sm text-neutral-500">Skipped (duplicates)</p>
                      </div>
                    )}
                    {importResult.failedCount > 0 && (
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">
                          {importResult.failedCount}
                        </p>
                        <p className="text-sm text-neutral-500">Failed</p>
                      </div>
                    )}
                  </div>

                  {importResult.error && (
                    <div className="mt-6 w-full max-w-md rounded-lg bg-red-50 p-4 text-left">
                      <p className="font-medium text-red-700">Error:</p>
                      <p className="text-sm text-red-600">{importResult.error}</p>
                    </div>
                  )}

                  {importResult.errors.length > 0 && (
                    <div className="mt-6 w-full max-w-md rounded-lg bg-red-50 p-4 text-left">
                      <p className="mb-2 font-medium text-red-700">Row Errors:</p>
                      <ul className="max-h-32 space-y-1 overflow-auto text-sm text-red-600">
                        {importResult.errors.slice(0, 10).map((err, i) => (
                          <li key={i}>
                            Row {err.row}
                            {err.name ? ` (${err.name})` : ''}: {err.message}
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
                    <Button variant="outline" onClick={resetWizard}>
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
