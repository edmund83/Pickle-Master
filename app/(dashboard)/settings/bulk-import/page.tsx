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
  Check,
  FileText,
  Table2,
  Eye,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '@/components/settings'
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

const STEPS = [
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'mapping', label: 'Map Columns', icon: Table2 },
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'complete', label: 'Complete', icon: Sparkles },
] as const

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

  // Get step index for progress tracking
  const getStepIndex = (s: string) => {
    const stepOrder = ['upload', 'mapping', 'preview', 'importing', 'complete']
    return stepOrder.indexOf(s)
  }
  const currentIndex = getStepIndex(step)

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Bulk Import</h1>
          <p className="mt-1 text-neutral-500">
            Import inventory items from CSV or Excel files
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadSampleCSV()}>
          <Download className="mr-2 h-4 w-4" />
          Download Template
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {STEPS.map((s, i) => {
            const stepIndex = getStepIndex(s.key)
            const isActive = step === s.key || (step === 'importing' && s.key === 'preview')
            const isComplete = currentIndex > stepIndex
            const Icon = s.icon

            return (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : isComplete
                          ? 'bg-green-100 text-green-600'
                          : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive ? 'text-primary' : isComplete ? 'text-green-600' : 'text-neutral-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-3 h-0.5 w-16 sm:w-24 ${
                      currentIndex > stepIndex ? 'bg-green-300' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="flex-1 text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 hover:text-red-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <SettingsSection
            title="Upload Your File"
            description="Drag and drop or browse for a CSV or Excel file"
            icon={FileSpreadsheet}
          >
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
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
                dragOver ? 'bg-primary/10' : 'bg-neutral-100'
              }`}>
                <Upload className={`h-8 w-8 ${dragOver ? 'text-primary' : 'text-neutral-400'}`} />
              </div>
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
                  className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap font-medium transition-all border border-neutral-300 bg-white hover:bg-neutral-50 h-10 px-4 py-2 text-sm rounded-lg"
                >
                  Browse Files
                </label>
              </div>
              <p className="mt-4 text-xs text-neutral-400">
                Supported formats: .csv, .xlsx, .xls (max 5MB)
              </p>
            </div>

            {/* Supported Fields Info */}
            <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <h3 className="font-medium text-neutral-900">Supported Fields</h3>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                {IMPORT_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-2">
                    <span className={`text-xs ${field.required ? 'text-red-500' : 'text-neutral-300'}`}>
                      {field.required ? '*' : '-'}
                    </span>
                    <span className="text-neutral-600">{field.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-neutral-400">* Required field</p>
            </div>
          </SettingsSection>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && (
          <SettingsSection
            title="Map Columns"
            description="Match your file columns to inventory fields"
            icon={Table2}
          >
            {file && (
              <div className="mb-4 flex items-center gap-3 rounded-lg bg-neutral-50 p-3">
                <FileText className="h-5 w-5 text-neutral-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 truncate">{file.name}</p>
                  <p className="text-sm text-neutral-500">{rows.length} rows detected</p>
                </div>
                <Button variant="ghost" size="sm" onClick={resetWizard}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {truncationInfo?.truncated && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  File contains {truncationInfo.originalRowCount.toLocaleString()} rows.
                  Only the first {MAX_IMPORT_ROWS.toLocaleString()} rows will be imported.
                </span>
              </div>
            )}

            <div className="space-y-3">
              {headers.map((header) => (
                <div key={header} className="flex items-center gap-4">
                  <div className="w-40 sm:w-48 truncate rounded-lg bg-neutral-100 px-3 py-2 font-mono text-sm text-neutral-600">
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
                    className="h-10 flex-1 rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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

            <div className="mt-6 flex justify-between border-t border-neutral-100 pt-4">
              <Button variant="outline" onClick={resetWizard}>
                Back
              </Button>
              <Button onClick={handleMapping}>
                Continue to Preview
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </SettingsSection>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && validationResult && (
          <SettingsSection
            title="Preview Import"
            description="Review the data before importing"
            icon={Eye}
          >
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
                            : 'bg-white hover:bg-neutral-50'
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

            <div className="mt-6 flex justify-between border-t border-neutral-100 pt-4">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={validRowCount === 0}>
                <Upload className="mr-2 h-4 w-4" />
                Import {validRowCount} Items
              </Button>
            </div>
          </SettingsSection>
        )}

        {/* Step 4: Importing */}
        {step === 'importing' && (
          <SettingsSection
            title="Importing..."
            description="Please wait while we import your items"
            icon={Loader2}
          >
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium text-neutral-900">Importing items...</p>
              <p className="mt-1 text-neutral-500">
                This may take a moment for large imports
              </p>
            </div>
          </SettingsSection>
        )}

        {/* Step 5: Complete */}
        {step === 'complete' && importResult && (
          <SettingsSection
            title={importResult.successCount > 0 ? 'Import Complete' : 'Import Failed'}
            description={importResult.successCount > 0 ? 'Your items have been imported' : 'There was a problem importing your items'}
            icon={importResult.successCount > 0 ? CheckCircle2 : AlertCircle}
          >
            <div className="flex flex-col items-center py-8">
              {importResult.failedCount === 0 && importResult.successCount > 0 ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              ) : importResult.successCount > 0 ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              )}

              <div className="mt-6 flex gap-8">
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
                    <p className="text-sm text-neutral-500">Skipped</p>
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
                <div className="mt-6 w-full max-w-md rounded-lg bg-red-50 p-4">
                  <p className="font-medium text-red-700">Error:</p>
                  <p className="text-sm text-red-600">{importResult.error}</p>
                </div>
              )}

              {importResult.errors.length > 0 && (
                <div className="mt-6 w-full max-w-md rounded-lg bg-red-50 p-4">
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
          </SettingsSection>
        )}
      </div>
    </div>
  )
}
