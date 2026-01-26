'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Scan, Edit3, ListChecks, Camera, ScanBarcode } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { HardwareScannerInput } from '@/components/scanner/HardwareScannerInput'
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
import { useHardwareScanner } from '@/lib/scanner/useHardwareScanner'
import { validateBarcode, validateBarcodeAutoDetect } from '@/lib/scanner'
import type { ValidationWarning } from '@/components/scanner/ScanResultModal'
import { useAuth } from '@/lib/stores/auth-store'

type ScanMode = 'single' | 'quick-adjust' | 'batch'
type ViewState = 'scanning' | 'result' | 'adjust' | 'batch-list'
type ScannerType = 'camera' | 'hardware'

/**
 * Detect if running on an enterprise PDA with built-in scanner
 * (Zebra, Honeywell, Datalogic, etc.)
 * Note: Only call this in useEffect to avoid hydration mismatch
 */
function detectEnterprisePDA(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  return (
    ua.includes('tc20') ||
    ua.includes('tc21') ||
    ua.includes('tc22') ||
    ua.includes('tc25') ||
    ua.includes('tc26') ||
    ua.includes('tc51') ||
    ua.includes('tc52') ||
    ua.includes('tc53') ||
    ua.includes('tc56') ||
    ua.includes('tc57') ||
    ua.includes('tc72') ||
    ua.includes('tc73') ||
    ua.includes('tc77') ||
    ua.includes('tc8300') ||
    ua.includes('mc33') ||
    ua.includes('mc93') ||
    ua.includes('zebra') ||
    ua.includes('symbol') ||
    ua.includes('honeywell') ||
    ua.includes('datalogic') ||
    ua.includes('intermec')
  )
}

export default function ScanPage() {
  const router = useRouter()
  const isDesktop = useIsDesktop()
  const [mode, setMode] = useState<ScanMode>('single')
  const [viewState, setViewState] = useState<ViewState>('scanning')
  const [isMounted, setIsMounted] = useState(false)

  // PDA detection state - starts null to avoid hydration mismatch
  const [isPDA, setIsPDA] = useState<boolean | null>(null)
  const [scannerType, setScannerType] = useState<ScannerType | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Detect PDA and set scanner type on client only (after hydration)
  useEffect(() => {
    const detectedPDA = detectEnterprisePDA()
    setIsPDA(detectedPDA)

    // Set scanner type from localStorage or default based on device
    const saved = localStorage.getItem('preferred-scanner-type')
    if (saved === 'camera' || saved === 'hardware') {
      setScannerType(saved)
    } else {
      // Default: hardware for desktop/PDA, camera for mobile phones
      setScannerType(detectedPDA ? 'hardware' : 'camera')
    }
  }, [])

  // Use hardware scanner UI on desktop, PDA, or when user selected it
  // During initial render (before useEffect), all values are null - show loading state
  const useHardwareScannerUI =
    scannerType === 'hardware' || (scannerType !== null && isDesktop !== null && (isDesktop || isPDA))

  // Toggle scanner type and persist preference
  const toggleScannerType = useCallback(() => {
    setScannerType((prev) => {
      const next = prev === 'camera' ? 'hardware' : 'camera'
      localStorage.setItem('preferred-scanner-type', next)
      return next
    })
  }, [])

  // Show loading state while detecting device (wait for both media query and PDA detection)
  const isInitializing = scannerType === null || isDesktop === null

  // Scan result state
  const [lastBarcode, setLastBarcode] = useState<string | null>(null)
  const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationWarning, setValidationWarning] = useState<ValidationWarning | null>(null)

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
  const { tenantId, userId, fetchAuthIfNeeded } = useAuth()

  // Use a ref for supabase client to prevent recreating on every render
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  const resolveScope = useCallback(async () => {
    if (tenantId) {
      return { tenantId, userId }
    }
    const auth = await fetchAuthIfNeeded()
    if (!auth?.tenantId) return null
    return { tenantId: auth.tenantId, userId: auth.userId }
  }, [tenantId, userId, fetchAuthIfNeeded])

  // Hardware scanner for desktop mode
  // Note: The hook is always active but we only render the UI on desktop
  // The handleScan callback is defined below, so we need to use a ref pattern
  const handleScanRef = useRef<(result: ScanResult) => void>(() => {})

  // Ref for the scanner input field (for Zebra DataWedge)
  const scannerInputRef = useRef<HTMLInputElement>(null)

  // Guard to prevent concurrent lookups
  const isLookingUpRef = useRef(false)
  const lastProcessedBarcodeRef = useRef<{ code: string; time: number } | null>(null)

  // Hardware scanner should be enabled on ALL devices (including PDAs like Zebra TC22)
  // The hook listens globally for rapid keystrokes regardless of screen size
  const { isListening: isHardwareScannerListening, lastScan: hardwareLastScan } =
    useHardwareScanner({
      onScan: (result) => handleScanRef.current(result),
      enabled: viewState === 'scanning', // Removed isDesktop check
      inputRef: scannerInputRef, // Pass ref for DataWedge input capture
    })

  // Handle scan from the input field (for Zebra DataWedge)
  const handleScanFromInput = useCallback((code: string) => {
    handleScanRef.current({
      code,
      format: 'HARDWARE',
      timestamp: new Date(),
    })
  }, [])

  // Restore batch session from IndexedDB on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const scope = await resolveScope()
        if (!scope) return

        const activeSession = await getActiveSession(scope)
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
  }, [resolveScope])

  // Persist batch items to IndexedDB when they change
  useEffect(() => {
    const persistSession = async () => {
      if (mode !== 'batch') return

      try {
        const scope = await resolveScope()
        if (!scope) return

        if (batchItems.length === 0 && sessionId) {
          // Clear session if no items
          await deleteScanSession(scope, sessionId)
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
            await updateScanSession(scope, sessionId, { items: sessionItems })
          } else {
            const newId = await createScanSession(scope, {
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
  }, [batchItems, mode, sessionId, resolveScope])

  // Look up item by barcode or SKU
  const lookupItem = useCallback(
    async (barcode: string): Promise<ScannedItem | null> => {
      // Skip offline cache - go directly to Supabase (offline cache seems to hang)
      if (isOnline) {
        try {
          const { data } = await supabase
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
              updated_at,
              folders (name)
            `
            )
            .or(`barcode.eq.${barcode},sku.eq.${barcode}`)
            .is('deleted_at', null)
            .limit(1)
            .maybeSingle()

          if (data) {
            // Type assertion needed due to Supabase .or() filter type inference issue
            const item = data as {
              id: string
              name: string
              sku: string | null
              barcode: string | null
              quantity: number
              min_quantity: number | null
              price: number | null
              image_urls: string[] | null
              updated_at: string | null
              folders: { name: string } | null
            }
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
              updated_at: item.updated_at || null,
            }
          }
        } catch (err) {
          console.error('Supabase lookup error:', err)
        }
      }

      return null
    },
    [supabase, isOnline]
  )

  // Handle scan result
  const handleScan = useCallback(
    async (result: ScanResult) => {
      const now = Date.now()
      const barcode = result.code

      // Debounce: Skip if same barcode was processed within 2 seconds
      const lastProcessed = lastProcessedBarcodeRef.current
      if (lastProcessed && lastProcessed.code === barcode && now - lastProcessed.time < 2000) {
        return
      }

      // Prevent concurrent lookups
      if (isLookingUpRef.current) {
        return
      }

      // Set guards immediately
      isLookingUpRef.current = true
      lastProcessedBarcodeRef.current = { code: barcode, time: now }

      // Wrap EVERYTHING in try-finally to guarantee guard release
      try {
        setLastBarcode(barcode)
        // Clear stale item state so the result view doesn't show old data
        setScannedItem(null)
        setIsLookingUp(true)
        setValidationWarning(null)

        // Show the result view immediately (loading state) for non-batch modes
        // so users get instant feedback after a scan.
        if (mode !== 'batch') {
          setViewState('result')
        }

        // Validate barcode check digit
        try {
          const validation =
            result.format === 'HARDWARE' || !result.format
              ? validateBarcodeAutoDetect(barcode)
              : validateBarcode(barcode, result.format)

          if (!validation.isValid && validation.supportsValidation) {
            setValidationWarning({
              isInvalid: true,
              message: validation.error,
              format: validation.format,
            })
          }
        } catch (validationError) {
          console.warn('Barcode validation failed:', validationError)
        }

        // Lookup item with timeout
        const item = await Promise.race([
          lookupItem(barcode),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
        ])

        setScannedItem(item)

        if (mode === 'batch') {
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
        } else if (mode === 'quick-adjust' && item) {
          setViewState('adjust')
        } else {
          setViewState('result')
        }
      } catch (err) {
        console.error('Scan error:', err)
      } finally {
        setIsLookingUp(false)
        isLookingUpRef.current = false
      }
    },
    [mode, batchItems, lookupItem]
  )

  // Keep the ref updated for the hardware scanner hook
  useEffect(() => {
    handleScanRef.current = handleScan
  }, [handleScan])

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
          last_known_updated_at: scannedItem.updated_at ?? null,
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
      const scope = await resolveScope()
      if (!scope) return

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
          last_known_updated_at: item.item!.updated_at ?? null,
        })
      }

      // Clear batch list and session after saving
      setBatchItems([])
      if (sessionId) {
        await deleteScanSession(scope, sessionId)
        setSessionId(null)
      }
      setViewState('scanning')
    } catch (error) {
      console.error('Failed to save batch:', error)
    } finally {
      setIsSaving(false)
    }
  }, [batchItems, sessionId, queueQuantityAdjustment, resolveScope])

  const handleClearBatch = useCallback(async () => {
    const scope = await resolveScope()
    if (!scope) return

    setBatchItems([])
    if (sessionId) {
      await deleteScanSession(scope, sessionId)
      setSessionId(null)
    }
  }, [sessionId, resolveScope])

  // Navigation handlers
  const handleBack = () => {
    if (viewState === 'scanning') {
      router.back()
    } else {
      // Reset the lookup guard when returning to scanning
      isLookingUpRef.current = false
      setViewState('scanning')
      setScannedItem(null)
      setLastBarcode(null)
      setValidationWarning(null)
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
    // Reset the lookup guard to allow new scans
    isLookingUpRef.current = false
    setViewState('scanning')
    setScannedItem(null)
    setLastBarcode(null)
    setValidationWarning(null)
  }

  // Quick action to set quantity to zero (common stocktake action)
  const handleSetToZero = useCallback(async () => {
    if (!scannedItem || scannedItem.quantity === 0) return

    setIsSaving(true)
    try {
      await queueQuantityAdjustment({
        item_id: scannedItem.id,
        previous_quantity: scannedItem.quantity,
        new_quantity: 0,
        adjustment: -scannedItem.quantity,
        reason: 'Set to zero via scanner',
        last_known_updated_at: scannedItem.updated_at ?? null,
      })

      // Update local state and go back to scanning
      setScannedItem((prev) => (prev ? { ...prev, quantity: 0 } : null))
      handleScanAgain()
    } catch (error) {
      console.error('Failed to set quantity to zero:', error)
    } finally {
      setIsSaving(false)
    }
  }, [scannedItem, queueQuantityAdjustment])

  if (!isMounted) {
    return (
      <div className="flex flex-1 items-center justify-center bg-neutral-100">
        <div className="text-neutral-500">Initializing scanner...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-neutral-100">
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
      <div className="flex-1 min-h-0 overflow-y-auto relative">
        {/* Scanner view - Desktop/PDA uses hardware scanner, Mobile uses camera */}
        {viewState === 'scanning' && isInitializing && (
          <div className="h-full flex items-center justify-center bg-neutral-100">
            <div className="text-neutral-500">Initializing scanner...</div>
          </div>
        )}
        {viewState === 'scanning' &&
          !isInitializing &&
          (useHardwareScannerUI ? (
            <HardwareScannerInput
              isListening={isHardwareScannerListening}
              lastScan={hardwareLastScan}
              inputRef={scannerInputRef}
              onScanFromInput={handleScanFromInput}
              className="h-full"
            />
          ) : (
            <BarcodeScanner
              onScan={handleScan}
              showCloseButton={false}
              continuous={mode === 'batch'}
              className="h-[clamp(300px,60svh,520px)] lg:h-full"
            />
          ))}

        {/* Scanner type toggle - only show on mobile (not desktop, not detected PDA) */}
        {viewState === 'scanning' && !isInitializing && !isDesktop && !isPDA && (
          <button
            onClick={toggleScannerType}
            className={cn(
              'absolute right-4 z-10',
              'bottom-[calc(16px+64px+env(safe-area-inset-bottom,0px))] lg:bottom-4',
              'flex items-center gap-2 px-4 py-2',
              'bg-white/90 backdrop-blur-sm rounded-full shadow-lg',
              'text-sm font-medium text-neutral-700',
              'border border-neutral-200',
              'active:scale-95 transition-transform'
            )}
          >
            {scannerType === 'camera' ? (
              <>
                <ScanBarcode className="h-4 w-4" />
                <span>Use External Scanner</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                <span>Use Camera</span>
              </>
            )}
          </button>
        )}

        {/* Floating batch counter - prominent access to batch list */}
        {viewState === 'scanning' && mode === 'batch' && batchItems.length > 0 && (
          <button
            onClick={() => setViewState('batch-list')}
            className={cn(
              'absolute left-4 z-10',
              'bottom-[calc(16px+64px+env(safe-area-inset-bottom,0px))] lg:bottom-4',
              'flex items-center gap-2 px-4 py-3',
              'bg-primary text-white rounded-full shadow-lg',
              'text-base font-semibold',
              'active:scale-95 transition-transform',
              'animate-in fade-in slide-in-from-left-4 duration-300'
            )}
          >
            <ListChecks className="h-5 w-5" />
            <span>{batchItems.length} scanned</span>
          </button>
        )}

        {/* Result view (single mode) */}
        {viewState === 'result' && lastBarcode && (
          <ScanResultModal
            barcode={lastBarcode}
            item={scannedItem}
            isLoading={isLookingUp}
            validationWarning={validationWarning ?? undefined}
            onAdjustQuantity={() => setViewState('adjust')}
            onViewDetails={handleViewDetails}
            onAddNew={handleAddNew}
            onScanAgain={handleScanAgain}
            onSetToZero={handleSetToZero}
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
