'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Scan, Edit3, ListChecks } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { ScanResultModal, ScannedItem } from '@/components/scanner/ScanResultModal'
import { QuickAdjustModal } from '@/components/scanner/QuickAdjustModal'
import { BatchScanList, BatchScanItem } from '@/components/scanner/BatchScanList'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'

type ScanMode = 'single' | 'quick-adjust' | 'batch'
type ViewState = 'scanning' | 'result' | 'adjust' | 'batch-list'

export default function ScanPage() {
  const router = useRouter()
  const [mode, setMode] = useState<ScanMode>('single')
  const [viewState, setViewState] = useState<ViewState>('scanning')

  // Scan result state
  const [lastBarcode, setLastBarcode] = useState<string | null>(null)
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Batch mode state
  const [batchItems, setBatchItems] = useState<BatchScanItem[]>([])

  const supabase = createClient()

  // Look up item by barcode or SKU
  const lookupItem = useCallback(async (barcode: string): Promise<ScannedItem | null> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('inventory_items')
      .select(`
        id,
        name,
        sku,
        barcode,
        quantity,
        min_quantity,
        price,
        image_urls,
        folder_id,
        folders (name)
      `)
      .or(`barcode.eq.${barcode},sku.eq.${barcode}`)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (error || !data) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = data as any

    return {
      id: item.id,
      name: item.name,
      sku: item.sku,
      barcode: item.barcode,
      quantity: item.quantity,
      min_stock_level: item.min_quantity,
      unit_cost: item.price,
      photo_url: item.image_urls?.[0] || null,
      folder_name: item.folders?.name || null,
    }
  }, [supabase])

  // Handle scan result
  const handleScan = useCallback(async (result: ScanResult) => {
    const barcode = result.code
    setLastBarcode(barcode)
    setIsLookingUp(true)

    const item = await lookupItem(barcode)
    setScannedItem(item)
    setIsLookingUp(false)

    if (mode === 'batch') {
      // In batch mode, add to list and continue scanning
      const alreadyScanned = batchItems.some(bi => bi.barcode === barcode)
      if (!alreadyScanned) {
        setBatchItems(prev => [
          {
            barcode,
            item,
            scannedAt: new Date(),
            verified: false,
          },
          ...prev,
        ])
      }
      // Stay in scanning view for continuous scanning
    } else if (mode === 'quick-adjust' && item) {
      // Go directly to adjust modal
      setViewState('adjust')
    } else {
      // Single mode - show result
      setViewState('result')
    }
  }, [mode, batchItems, lookupItem])

  // Save quantity adjustment
  const handleSaveAdjustment = useCallback(async (newQuantity: number, adjustment: number) => {
    if (!scannedItem) return

    setIsSaving(true)
    try {
      // Update quantity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('inventory_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', scannedItem.id)

      // Log activity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('activity_logs').insert({
        entity_type: 'item',
        entity_id: scannedItem.id,
        action_type: 'quantity_adjusted',
        changes: {
          field: 'quantity',
          old_value: scannedItem.quantity,
          new_value: newQuantity,
          adjustment,
        },
      })

      // Update local state
      setScannedItem(prev => prev ? { ...prev, quantity: newQuantity } : null)
    } catch (error) {
      console.error('Failed to save adjustment:', error)
    } finally {
      setIsSaving(false)
    }
  }, [scannedItem, supabase])

  // Batch mode handlers
  const handleVerifyItem = useCallback((barcode: string, actualQuantity: number) => {
    setBatchItems(prev =>
      prev.map(item =>
        item.barcode === barcode
          ? { ...item, verified: true, actualQuantity }
          : item
      )
    )
  }, [])

  const handleRemoveItem = useCallback((barcode: string) => {
    setBatchItems(prev => prev.filter(item => item.barcode !== barcode))
  }, [])

  const handleSaveBatch = useCallback(async () => {
    setIsSaving(true)
    try {
      // Save all verified items with different quantities
      const updates = batchItems
        .filter(bi => bi.item && bi.verified && bi.actualQuantity !== undefined)
        .filter(bi => bi.actualQuantity !== bi.item!.quantity)

      for (const item of updates) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('inventory_items')
          .update({
            quantity: item.actualQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.item!.id)
      }

      // Clear batch list after saving
      setBatchItems([])
      setViewState('scanning')
    } catch (error) {
      console.error('Failed to save batch:', error)
    } finally {
      setIsSaving(false)
    }
  }, [batchItems, supabase])

  const handleClearBatch = useCallback(() => {
    setBatchItems([])
  }, [])

  // Navigation handlers
  const handleBack = () => {
    if (viewState === 'scanning') {
      router.back()
    } else {
      setViewState('scanning')
      setScannedItem(null)
      setLastBarcode(null)
    }
  }

  const handleViewDetails = () => {
    if (scannedItem) {
      router.push(`/inventory/${scannedItem.id}`)
    }
  }

  const handleAddNew = () => {
    router.push(`/inventory/new${lastBarcode ? `?barcode=${lastBarcode}` : ''}`)
  }

  const handleScanAgain = () => {
    setViewState('scanning')
    setScannedItem(null)
    setLastBarcode(null)
  }

  return (
    <div className="flex flex-col h-full bg-neutral-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="font-semibold">
          {mode === 'single' && 'Scan Item'}
          {mode === 'quick-adjust' && 'Quick Adjust'}
          {mode === 'batch' && 'Batch Count'}
        </h1>

        {mode === 'batch' && batchItems.length > 0 && viewState === 'scanning' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewState('batch-list')}
          >
            List ({batchItems.length})
          </Button>
        )}
        {mode !== 'batch' && <div className="w-10" />}
      </div>

      {/* Mode tabs */}
      {viewState === 'scanning' && (
        <div className="flex bg-white border-b">
          <button
            onClick={() => setMode('single')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors',
              mode === 'single'
                ? 'border-pickle-500 text-pickle-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            )}
          >
            <Scan className="h-4 w-4" />
            Single
          </button>
          <button
            onClick={() => setMode('quick-adjust')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors',
              mode === 'quick-adjust'
                ? 'border-pickle-500 text-pickle-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            )}
          >
            <Edit3 className="h-4 w-4" />
            Quick Adjust
          </button>
          <button
            onClick={() => setMode('batch')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors',
              mode === 'batch'
                ? 'border-pickle-500 text-pickle-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            )}
          >
            <ListChecks className="h-4 w-4" />
            Batch
            {batchItems.length > 0 && (
              <span className="bg-pickle-500 text-white text-xs px-1.5 rounded-full">
                {batchItems.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {/* Scanner view */}
        {viewState === 'scanning' && (
          <BarcodeScanner
            onScan={handleScan}
            showCloseButton={false}
            continuous={mode === 'batch'}
            className="h-full"
          />
        )}

        {/* Result view (single mode) */}
        {viewState === 'result' && lastBarcode && (
          <ScanResultModal
            barcode={lastBarcode}
            item={scannedItem}
            isLoading={isLookingUp}
            onAdjustQuantity={() => setViewState('adjust')}
            onViewDetails={handleViewDetails}
            onAddNew={handleAddNew}
            onScanAgain={handleScanAgain}
          />
        )}

        {/* Adjust view */}
        {viewState === 'adjust' && scannedItem && (
          <QuickAdjustModal
            item={scannedItem}
            isSaving={isSaving}
            onSave={handleSaveAdjustment}
            onScanNext={handleScanAgain}
            onDone={() => router.push('/inventory')}
          />
        )}

        {/* Batch list view */}
        {viewState === 'batch-list' && (
          <BatchScanList
            items={batchItems}
            isSaving={isSaving}
            onVerifyItem={handleVerifyItem}
            onRemoveItem={handleRemoveItem}
            onSaveAll={handleSaveBatch}
            onClear={handleClearBatch}
            onContinueScanning={() => setViewState('scanning')}
            className="h-full"
          />
        )}
      </div>
    </div>
  )
}
