import { describe, it, expect, vi } from 'vitest'
import { TEST_TENANT_ID } from '../utils/test-data'

/**
 * Barcode Scanner Tests
 *
 * Tests for barcode scanning functionality:
 * - Single scan mode
 * - Quick adjust mode
 * - Batch count mode
 * - Camera access
 * - Offline mode
 * - Sync indicator
 */

interface ScannedItem {
  id: string
  name: string
  sku: string | null
  barcode: string
  quantity: number
}

interface ScanResult {
  success: boolean
  item?: ScannedItem
  error?: string
}

interface ScanModeState {
  mode: 'single' | 'quick_adjust' | 'batch_count'
  adjustAmount: number
  scannedItems: ScannedItem[]
  pendingSyncCount: number
}

// Simulated item database
const items = new Map<string, ScannedItem>([
  ['123456789', { id: 'item-1', name: 'Laptop', sku: 'LAP-001', barcode: '123456789', quantity: 50 }],
  ['987654321', { id: 'item-2', name: 'Mouse', sku: 'MOU-001', barcode: '987654321', quantity: 100 }],
  ['111222333', { id: 'item-3', name: 'Keyboard', sku: 'KEY-001', barcode: '111222333', quantity: 25 }],
])

// Offline cache
const offlineCache = new Map<string, ScannedItem>()

// Lookup item by barcode
function lookupByBarcode(barcode: string): ScanResult {
  const item = items.get(barcode)
  if (!item) {
    return { success: false, error: 'Item not found' }
  }
  return { success: true, item }
}

// Lookup offline by barcode
function lookupOffline(barcode: string): ScanResult {
  const item = offlineCache.get(barcode)
  if (!item) {
    return { success: false, error: 'Item not found in cache' }
  }
  return { success: true, item }
}

// Barcode scanner class
class BarcodeScanner {
  private state: ScanModeState = {
    mode: 'single',
    adjustAmount: 1,
    scannedItems: [],
    pendingSyncCount: 0,
  }

  private isOnline: boolean = true
  private cameraPermission: 'granted' | 'denied' | 'prompt' = 'prompt'

  // Set mode
  setMode(mode: ScanModeState['mode']): void {
    this.state.mode = mode
    if (mode !== 'batch_count') {
      this.state.scannedItems = []
    }
  }

  getMode(): ScanModeState['mode'] {
    return this.state.mode
  }

  // Set adjust amount
  setAdjustAmount(amount: number): void {
    this.state.adjustAmount = amount
  }

  // Set online status
  setOnlineStatus(online: boolean): void {
    this.isOnline = online
  }

  // Set camera permission
  setCameraPermission(permission: 'granted' | 'denied' | 'prompt'): void {
    this.cameraPermission = permission
  }

  // Request camera access
  requestCameraAccess(): { granted: boolean; error?: string } {
    if (this.cameraPermission === 'denied') {
      return { granted: false, error: 'Camera access denied' }
    }
    if (this.cameraPermission === 'prompt') {
      // Simulate user granting permission
      this.cameraPermission = 'granted'
    }
    return { granted: true }
  }

  hasCameraAccess(): boolean {
    return this.cameraPermission === 'granted'
  }

  // Single scan mode - scans, shows item, allows adjustment
  singleScan(barcode: string): {
    success: boolean
    item?: ScannedItem
    showItem: boolean
    allowAdjustment: boolean
    error?: string
  } {
    const result = this.isOnline ? lookupByBarcode(barcode) : lookupOffline(barcode)

    if (!result.success) {
      return {
        success: false,
        showItem: false,
        allowAdjustment: false,
        error: result.error,
      }
    }

    return {
      success: true,
      item: result.item,
      showItem: true,
      allowAdjustment: true,
    }
  }

  // Quick adjust mode - scans, immediately adjusts
  quickAdjustScan(barcode: string): {
    success: boolean
    item?: ScannedItem
    adjusted: boolean
    newQuantity?: number
    error?: string
  } {
    const result = this.isOnline ? lookupByBarcode(barcode) : lookupOffline(barcode)

    if (!result.success) {
      return {
        success: false,
        adjusted: false,
        error: result.error,
      }
    }

    const item = result.item!
    const newQuantity = item.quantity + this.state.adjustAmount

    // Queue for sync if offline
    if (!this.isOnline) {
      this.state.pendingSyncCount++
    }

    return {
      success: true,
      item,
      adjusted: true,
      newQuantity,
    }
  }

  // Batch count mode - continuous scanning, builds list
  batchCountScan(barcode: string): {
    success: boolean
    item?: ScannedItem
    addedToList: boolean
    listCount: number
    error?: string
  } {
    const result = this.isOnline ? lookupByBarcode(barcode) : lookupOffline(barcode)

    if (!result.success) {
      return {
        success: false,
        addedToList: false,
        listCount: this.state.scannedItems.length,
        error: result.error,
      }
    }

    // Add to list
    this.state.scannedItems.push(result.item!)

    return {
      success: true,
      item: result.item,
      addedToList: true,
      listCount: this.state.scannedItems.length,
    }
  }

  // Get scanned items list
  getScannedItems(): ScannedItem[] {
    return [...this.state.scannedItems]
  }

  // Clear scanned items
  clearScannedItems(): void {
    this.state.scannedItems = []
  }

  // Get pending sync count
  getPendingSyncCount(): number {
    return this.state.pendingSyncCount
  }

  // Reset pending sync count (after sync)
  resetPendingSync(): void {
    this.state.pendingSyncCount = 0
  }

  // Add to offline cache
  addToOfflineCache(item: ScannedItem): void {
    offlineCache.set(item.barcode, item)
  }
}

describe('Barcode Scanner', () => {
  let scanner: BarcodeScanner

  beforeEach(() => {
    scanner = new BarcodeScanner()
    offlineCache.clear()
  })

  describe('Single Scan Mode', () => {
    it('scans and shows item', () => {
      const result = scanner.singleScan('123456789')

      expect(result.success).toBe(true)
      expect(result.showItem).toBe(true)
      expect(result.item!.name).toBe('Laptop')
    })

    it('allows adjustment after scan', () => {
      const result = scanner.singleScan('123456789')

      expect(result.allowAdjustment).toBe(true)
    })

    it('handles item not found', () => {
      const result = scanner.singleScan('nonexistent')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })
  })

  describe('Quick Adjust Mode', () => {
    it('scans and immediately adjusts +1', () => {
      scanner.setMode('quick_adjust')
      scanner.setAdjustAmount(1)

      const result = scanner.quickAdjustScan('123456789')

      expect(result.success).toBe(true)
      expect(result.adjusted).toBe(true)
      expect(result.newQuantity).toBe(51) // 50 + 1
    })

    it('scans and immediately adjusts -1', () => {
      scanner.setMode('quick_adjust')
      scanner.setAdjustAmount(-1)

      const result = scanner.quickAdjustScan('987654321')

      expect(result.success).toBe(true)
      expect(result.newQuantity).toBe(99) // 100 - 1
    })

    it('queues adjustment when offline', () => {
      scanner.setMode('quick_adjust')
      scanner.setOnlineStatus(false)

      // Add item to offline cache
      scanner.addToOfflineCache({
        id: 'item-1',
        name: 'Laptop',
        sku: 'LAP-001',
        barcode: '123456789',
        quantity: 50,
      })

      scanner.quickAdjustScan('123456789')

      expect(scanner.getPendingSyncCount()).toBe(1)
    })
  })

  describe('Batch Count Mode', () => {
    it('continuous scanning builds list', () => {
      scanner.setMode('batch_count')

      scanner.batchCountScan('123456789')
      scanner.batchCountScan('987654321')
      scanner.batchCountScan('111222333')

      expect(scanner.getScannedItems().length).toBe(3)
    })

    it('returns list count after each scan', () => {
      scanner.setMode('batch_count')

      const result1 = scanner.batchCountScan('123456789')
      expect(result1.listCount).toBe(1)

      const result2 = scanner.batchCountScan('987654321')
      expect(result2.listCount).toBe(2)
    })

    it('allows scanning same item multiple times', () => {
      scanner.setMode('batch_count')

      scanner.batchCountScan('123456789')
      scanner.batchCountScan('123456789')
      scanner.batchCountScan('123456789')

      expect(scanner.getScannedItems().length).toBe(3)
    })

    it('can clear scanned items list', () => {
      scanner.setMode('batch_count')

      scanner.batchCountScan('123456789')
      scanner.batchCountScan('987654321')

      scanner.clearScannedItems()

      expect(scanner.getScannedItems().length).toBe(0)
    })
  })

  describe('Camera Access', () => {
    it('requests and uses camera', () => {
      scanner.setCameraPermission('prompt')

      const result = scanner.requestCameraAccess()

      expect(result.granted).toBe(true)
      expect(scanner.hasCameraAccess()).toBe(true)
    })

    it('handles camera access denied', () => {
      scanner.setCameraPermission('denied')

      const result = scanner.requestCameraAccess()

      expect(result.granted).toBe(false)
      expect(result.error).toContain('denied')
    })

    it('maintains camera permission after grant', () => {
      scanner.setCameraPermission('granted')

      expect(scanner.hasCameraAccess()).toBe(true)

      const result = scanner.requestCameraAccess()
      expect(result.granted).toBe(true)
    })
  })

  describe('Offline Mode', () => {
    it('works with cached items', () => {
      scanner.setOnlineStatus(false)

      // Add to cache
      scanner.addToOfflineCache({
        id: 'item-1',
        name: 'Cached Laptop',
        sku: 'LAP-001',
        barcode: '123456789',
        quantity: 45,
      })

      const result = scanner.singleScan('123456789')

      expect(result.success).toBe(true)
      expect(result.item!.name).toBe('Cached Laptop')
    })

    it('returns error for uncached item', () => {
      scanner.setOnlineStatus(false)

      const result = scanner.singleScan('uncached-barcode')

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('uses online lookup when online', () => {
      scanner.setOnlineStatus(true)

      const result = scanner.singleScan('123456789')

      expect(result.success).toBe(true)
      expect(result.item!.name).toBe('Laptop') // From main items map
    })
  })

  describe('Sync Indicator', () => {
    it('shows pending sync count', () => {
      scanner.setMode('quick_adjust')
      scanner.setOnlineStatus(false)

      scanner.addToOfflineCache({
        id: 'item-1',
        name: 'Laptop',
        sku: 'LAP-001',
        barcode: '123456789',
        quantity: 50,
      })

      scanner.quickAdjustScan('123456789')
      scanner.quickAdjustScan('123456789')

      expect(scanner.getPendingSyncCount()).toBe(2)
    })

    it('resets after sync', () => {
      scanner.setMode('quick_adjust')
      scanner.setOnlineStatus(false)

      scanner.addToOfflineCache({
        id: 'item-1',
        name: 'Laptop',
        sku: 'LAP-001',
        barcode: '123456789',
        quantity: 50,
      })

      scanner.quickAdjustScan('123456789')
      expect(scanner.getPendingSyncCount()).toBe(1)

      scanner.resetPendingSync()
      expect(scanner.getPendingSyncCount()).toBe(0)
    })

    it('does not increment when online', () => {
      scanner.setMode('quick_adjust')
      scanner.setOnlineStatus(true)

      scanner.quickAdjustScan('123456789')

      expect(scanner.getPendingSyncCount()).toBe(0)
    })
  })
})
