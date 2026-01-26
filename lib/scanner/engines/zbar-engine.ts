/**
 * ZBar-WASM Engine (Layer 2)
 *
 * Uses ZBar compiled to WebAssembly for fast barcode detection.
 * ZBar excels at 1D barcodes (UPC, EAN, Code128, Code39) and is
 * significantly faster than ZXing for retail/inventory barcodes.
 *
 * This is the "RedLaser secret sauce" - the library that powered
 * the best barcode scanning apps before native APIs existed.
 *
 * @see https://github.com/undecaf/zbar-wasm
 */

import type { ScannerEngine, DetectedBarcode } from './types'
import { normalizeFormat } from '../utils/format-normalizer'

// Type definitions for @undecaf/zbar-wasm
interface ZBarSymbol {
  typeName: string
  data: Int8Array
  points: Array<{ x: number; y: number }>
  time: number
  cacheCount: number
  quality: number
  decode(encoding?: string): string
}

type ScanImageDataFn = (imageData: ImageData) => Promise<ZBarSymbol[]>

/**
 * ZBar WebAssembly engine implementation
 *
 * Speed: 8/10 (fast WASM, excellent for 1D barcodes)
 * Support: Any browser with WebAssembly support
 */
export class ZBarEngine implements ScannerEngine {
  readonly name = 'zbar' as const

  private scanImageData: ScanImageDataFn | null = null
  private isInitialized = false

  /**
   * Check if WebAssembly is supported (required for ZBar)
   */
  isSupported(): boolean {
    return (
      typeof WebAssembly !== 'undefined' &&
      typeof WebAssembly.instantiate === 'function' &&
      typeof WebAssembly.compile === 'function'
    )
  }

  /**
   * Initialize ZBar by dynamically importing the WASM module
   * This ensures the ~500KB WASM file is only loaded when needed
   */
  async initialize(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('WebAssembly is not supported in this browser')
    }

    if (this.isInitialized) {
      return
    }

    try {
      // Dynamic import for code splitting - WASM only loads when this engine is used
      const zbarModule = await import('@undecaf/zbar-wasm')

      // Store the scanImageData function directly
      this.scanImageData = zbarModule.scanImageData as ScanImageDataFn

      this.isInitialized = true
    } catch (error) {
      throw new Error(`Failed to load ZBar WASM: ${error}`)
    }
  }

  /**
   * Detect barcodes in an image frame using ZBar
   */
  async detect(imageData: ImageData): Promise<DetectedBarcode[]> {
    if (!this.scanImageData) {
      throw new Error('Engine not initialized. Call initialize() first.')
    }

    try {
      const symbols = await this.scanImageData(imageData)

      return symbols.map((symbol) => ({
        // Use decode() method to convert Int8Array to string
        rawValue: symbol.decode(),
        format: normalizeFormat(symbol.typeName, 'zbar'),
        cornerPoints: symbol.points,
        // ZBar doesn't provide bounding box directly, calculate from points
        boundingBox: this.calculateBoundingBox(symbol.points),
      }))
    } catch {
      // Detection errors are expected when no barcode is visible
      return []
    }
  }

  /**
   * Calculate bounding box from corner points
   */
  private calculateBoundingBox(
    points: Array<{ x: number; y: number }>
  ): { x: number; y: number; width: number; height: number } | undefined {
    if (!points || points.length === 0) {
      return undefined
    }

    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)

    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.scanImageData = null
    this.isInitialized = false
  }

  /**
   * Get supported formats
   * ZBar supports many 1D and 2D formats
   */
  getSupportedFormats(): string[] {
    return [
      // 2D codes
      'QR_CODE',
      // 1D product codes (ZBar's strength)
      'EAN_13',
      'EAN_8',
      'EAN_5',
      'EAN_2',
      'UPC_A',
      'UPC_E',
      'ISBN_10',
      'ISBN_13',
      // 1D industrial codes
      'CODE_128',
      'CODE_93',
      'CODE_39',
      'CODABAR',
      'ITF',
      'DATABAR',
      'DATABAR_EXP',
    ]
  }
}

/**
 * Check if ZBar WASM can be loaded
 */
export function isZBarSupported(): boolean {
  return (
    typeof WebAssembly !== 'undefined' &&
    typeof WebAssembly.instantiate === 'function' &&
    typeof WebAssembly.compile === 'function'
  )
}
