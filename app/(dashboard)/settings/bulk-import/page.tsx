'use client'

import { Upload, FileSpreadsheet, AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BulkImportPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Bulk Import</h1>
        <p className="text-neutral-500">Import inventory data from CSV or Excel files</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Coming Soon Banner */}
        <div className="flex items-center gap-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-amber-900">Coming Soon</p>
            <p className="text-sm text-amber-700">
              Bulk import functionality is currently in development. Check back soon!
            </p>
          </div>
        </div>

        {/* Upload Card (Disabled) */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
            </CardTitle>
            <CardDescription>
              Drag and drop your CSV or Excel file, or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 py-12 text-center cursor-not-allowed">
              <FileSpreadsheet className="h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-neutral-500">
                Supported formats: .csv, .xlsx, .xls
              </p>
              <Button className="mt-4" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Template Download */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download Template
            </CardTitle>
            <CardDescription>
              Use our template to ensure your data is formatted correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600 mb-4">
              The template includes all supported fields with example data and instructions.
              Required fields are marked with an asterisk (*).
            </p>
            <div className="flex gap-3">
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                CSV Template
              </Button>
              <Button variant="outline" disabled>
                <Download className="mr-2 h-4 w-4" />
                Excel Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Supported Fields */}
        <Card>
          <CardHeader>
            <CardTitle>Supported Fields</CardTitle>
            <CardDescription>
              The following fields can be imported
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-red-500">*</span>
                <span className="text-neutral-600">Name</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">SKU</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Barcode</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Quantity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Min Quantity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Price</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Cost Price</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Description</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Tags (comma-separated)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Folder</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-300">-</span>
                <span className="text-neutral-600">Unit</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-400">
              * Required field
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
