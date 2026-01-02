'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Scan, Edit3, ListChecks } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { ScanResultModal, ScannedItem } from '@/components/scanner/ScanResultModal'
import { QuickAdjustModal } from '@/components/scanner/QuickAdjustModal'
import { BatchScanList, BatchScanItem } from '@/components/scanner/BatchScanList'
import { Button } from '@/components/ui/button'
import { SyncStatusBadge } from '@/components/ui/SyncStatusIndicator'
import { cn } from '@/lib/utils'
import { useOfflineSync } from '@/lib/hooks/useOfflineSync'
import { useIsDesktop } from '@/lib/hooks/useMediaQuery'
import {
  getActiveSession,
  createScanSession,
  updateScanSession,
  deleteScanSession,
} from '@/lib/offline/db'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'

type ScanMode = 'single' | 'quick-adjust' | 'batch'
type ViewState = 'scanning' | 'result' | 'adjust' | 'batch-list'

export default function ScanPage() {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const [mode, setMode] = useState<ScanMode>('single')
  const [viewState, setViewState] = useState<ViewState>('scanning')

  // Redirect desktop users - scan is mobile/tablet only
  useEffect(() => {
    if (isDesktop) {
      router.replace('/dashboard')
    }
  }, [isDesktop, router])

  // Scan result state
  const [lastBarcode, setLastBarcode] = useState<string | null>(null)
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Batch mode state
  const [batchItems, setBatchItems] = useState<BatchScanItem[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Offline sync hook
  const {
    isOnline,
    pendingCount,
    lookupItemOffline,
    queueQuantityAdjustment,
  } = useOfflineSync()

  const supabase = createClient()

  // Restore batch session from IndexedDB on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const activeSession = await getActiveSession()
        if (activeSession && activeSession.mode === 'batch') {
          setSessionId(activeSession.id)
          // Convert stored items back to BatchScanItem format
          const restoredItems: BatchScanItem[] = activeSession.items.map((item) => ({
            barcode: item.barcode,
            item: item.name
              ? {
                  id: item.id,
                  name: item.name,
                  sku: null,
                  barcode: item.barcode,
                  quantity: item.expected_quantity,
                  min_stock_level: null,
                  unit_cost: null,
                  photo_url: null,
                  folder_name: null,
                }
              : null,
            scannedAt: new Date(item.scanned_at),
            verified: item.status === 'counted',
            expectedQuantity: item.expected_quantity,
            actualQuantity: item.scanned_quantity,
          }))
          setBatchItems(restoredItems)
          if (restoredItems.length > 0) {
            setMode('batch')
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error)
      }
    }
    restoreSession()
  }, [])

  // Persist batch items to IndexedDB when they change
  useEffect(() => {
    const persistSession = async () => {
      if (mode !== 'batch') return

      try {
        if (batchItems.length === 0 && sessionId) {
          // Clear session if no items
          await deleteScanSession(sessionId)
          setSessionId(null)
          return
        }

        if (batchItems.length > 0) {
          const sessionItems = batchItems.map((bi) => ({
            id: bi.item?.id || bi.barcode,
            barcode: bi.barcode,
            name: bi.item?.name || '',
            expected_quantity: bi.item?.quantity || 0,
            scanned_quantity: bi.actualQuantity || bi.item?.quantity || 0,
            status: bi.verified ? ('counted' as const) : ('pending' as const),
            scanned_at: bi.scannedAt,
          }))

          if (sessionId) {
            await updateScanSession(sessionId, { items: sessionItems })
          } else {
            const newId = await createScanSession({
              name: 'Batch Scan',
              mode: 'batch',
              items: sessionItems,
            })
            setSessionId(newId)
          }
        }
      } catch (error) {
        console.error('Failed to persist session:', error)
      }
    }

    persistSession()
  }, [batchItems, mode, sessionId])

  // Look up item by barcode or SKU - uses offline cache first
  const lookupItem = useCallback(
    async (barcode: string): Promise<ScannedItem | null> => {
      // Try offline cache first
      const offlineItem = await lookupItemOffline(barcode)
      if (offlineItem) {
        return {
          id: offlineItem.id,
          name: offlineItem.name,
          sku: offlineItem.sku,
          barcode: offlineItem.barcode,
          quantity: offlineItem.quantity,
          min_stock_level: offlineItem.min_quantity,
          unit_cost: offlineItem.price,
          photo_url: offlineItem.image_url,
          folder_name: offlineItem.folder_name,
        }
      }

      // If online, try server
      if (isOnline) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('inventory_items')
          .select(
            `
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
          `
          )
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
      }

      // Offline and not in cache
      return null
    },
    [supabase, isOnline, lookupItemOffline]
  )

  // Handle scan result
  const handleScan = useCallback(
    async (result: ScanResult) => {
      const barcode = result.code
      setLastBarcode(barcode)
      setIsLookingUp(true)

      const item = await lookupItem(barcode)
      setScannedItem(item)
      setIsLookingUp(false)

      if (mode === 'batch') {
        // In batch mode, add to list and continue scanning
        const alreadyScanned = batchItems.some((bi) => bi.barcode === barcode)
        if (!alreadyScanned) {
          setBatchItems((prev) => [
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
    },
    [mode, batchItems, lookupItem]
  )

  // Save quantity adjustment - uses offline queue
  const handleSaveAdjustment = useCallback(
    async (newQuantity: number, adjustment: number) => {
      if (!scannedItem) return

      setIsSaving(true)
      try {
        // Queue for sync (works offline)
        await queueQuantityAdjustment({
          item_id: scannedItem.id,
          previous_quantity: scannedItem.quantity,
          new_quantity: newQuantity,
          adjustment,
          reason: 'Quick adjust via scanner',
        })

        // Update local state immediately
        setScannedItem((prev) => (prev ? { ...prev, quantity: newQuantity } : null))
      } catch (error) {
        console.error('Failed to queue adjustment:', error)
      } finally {
        setIsSaving(false)
      }
    },
    [scannedItem, queueQuantityAdjustment]
  )

  // Batch mode handlers
  const handleVerifyItem = useCallback((barcode: string, actualQuantity: number) => {
    setBatchItems((prev) =>
      prev.map((item) =>
        item.barcode === barcode ? { ...item, verified: true, actualQuantity } : item
      )
    )
  }, [])

  const handleRemoveItem = useCallback((barcode: string) => {
    setBatchItems((prev) => prev.filter((item) => item.barcode !== barcode))
  }, [])

  const handleSaveBatch = useCallback(async () => {
    setIsSaving(true)
    try {
      // Save all verified items with different quantities
      const updates = batchItems
        .filter((bi) => bi.item && bi.verified && bi.actualQuantity !== undefined)
        .filter((bi) => bi.actualQuantity !== bi.item!.quantity)

      for (const item of updates) {
        // Queue each adjustment for sync
        await queueQuantityAdjustment({
          item_id: item.item!.id,
          previous_quantity: item.item!.quantity,
          new_quantity: item.actualQuantity!,
          adjustment: item.actualQuantity! - item.item!.quantity,
          reason: 'Batch count adjustment',
        })
      }

      // Clear batch list and session after saving
      setBatchItems([])
      if (sessionId) {
        await deleteScanSession(sessionId)
        setSessionId(null)
      }
      setViewState('scanning')
    } catch (error) {
      console.error('Failed to save batch:', error)
    } finally {
      setIsSaving(false)
    }
  }, [batchItems, sessionId, queueQuantityAdjustment])

  const handleClearBatch = useCallback(async () => {
    setBatchItems([])
    if (sessionId) {
      await deleteScanSession(sessionId)
      setSessionId(null)
    }
  }, [sessionId])

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
      {/* Header - Mobile optimized with larger touch targets */}
      <div className="flex items-center justify-between px-4 py-2 lg:py-3 bg-white border-b">
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={handleBack}
          className="lg:h-10 lg:w-10"
        >
          <ArrowLeft className="h-6 w-6 lg:h-5 lg:w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-lg lg:text-base">
            {mode === 'single' && 'Scan Item'}
            {mode === 'quick-adjust' && 'Quick Adjust'}
            {mode === 'batch' && 'Batch Count'}
          </h1>
          {/* Sync status badge */}
          <SyncStatusBadge />
        </div>

        {mode === 'batch' && batchItems.length > 0 && viewState === 'scanning' && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setViewState('batch-list')}
            className="lg:h-9 lg:px-3 lg:text-sm"
          >
            List ({batchItems.length})
          </Button>
        )}
        {mode !== 'batch' && <div className="w-14 lg:w-10" />}
      </div>

      {/* Offline banner - Larger on mobile */}
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 lg:py-2 text-center">
          <span className="text-base lg:text-sm text-amber-700 font-medium">
            You&apos;re offline. Changes will sync when you&apos;re back online.
            {pendingCount > 0 && ` (${pendingCount} pending)`}
          </span>
        </div>
      )}

      {/* Mode tabs - Kid-friendly with larger touch targets */}
      {viewState === 'scanning' && (
        <div className="flex bg-white border-b">
          <button
            onClick={() => setMode('single')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'min-h-[56px] lg:min-h-0 py-4 lg:py-3',
              'text-base lg:text-sm font-medium',
              'border-b-3 lg:border-b-2',
              'transition-all duration-200',
              'active:scale-95 lg:active:scale-100',
              mode === 'single'
                ? 'border-primary text-primary bg-primary/10 lg:bg-transparent'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            )}
          >
            <Scan className="h-6 w-6 lg:h-4 lg:w-4" />
            <span>Single</span>
          </button>
          <button
            onClick={() => setMode('quick-adjust')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'min-h-[56px] lg:min-h-0 py-4 lg:py-3',
              'text-base lg:text-sm font-medium',
              'border-b-3 lg:border-b-2',
              'transition-all duration-200',
              'active:scale-95 lg:active:scale-100',
              mode === 'quick-adjust'
                ? 'border-primary text-primary bg-primary/10 lg:bg-transparent'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            )}
          >
            <Edit3 className="h-6 w-6 lg:h-4 lg:w-4" />
            <span>Adjust</span>
          </button>
          <button
            onClick={() => setMode('batch')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2',
              'min-h-[56px] lg:min-h-0 py-4 lg:py-3',
              'text-base lg:text-sm font-medium',
              'border-b-3 lg:border-b-2',
              'transition-all duration-200',
              'active:scale-95 lg:active:scale-100',
              mode === 'batch'
                ? 'border-primary text-primary bg-primary/10 lg:bg-transparent'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            )}
          >
            <ListChecks className="h-6 w-6 lg:h-4 lg:w-4" />
            <span>Batch</span>
            {batchItems.length > 0 && (
              <span className="bg-primary text-white text-sm lg:text-xs px-2 lg:px-1.5 py-0.5 rounded-full font-semibold">
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
