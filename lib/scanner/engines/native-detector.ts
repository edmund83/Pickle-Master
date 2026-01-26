/**
 * Native BarcodeDetector Engine (Layer 1)
 *
 * Uses the browser's native BarcodeDetector API for hardware-accelerated
 * barcode detection. This is the fastest option, using ML Kit on Android
 * and Vision framework on iOS 17+.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector
 */

import type { ScannerEngine, DetectedBarcode } from './types'
import { normalizeFormat } from '../utils/format-normalizer'

// TypeScript declarations for BarcodeDetector API
declare global {
  interface BarcodeDetectorOptions {
    formats?: string[]
  }

  interface DetectedBarcodeNative {
    rawValue: string
    format: string
    boundingBox: DOMRectReadOnly
    cornerPoints: Array<{ x: number; y: number }>
  }

  class BarcodeDetector {
    constructor(options?: BarcodeDetectorOptions)
    detect(image: ImageBitmapSource): Promise<DetectedBarcodeNative[]>
    static getSupportedFormats(): Promise<string[]>
  }
}

/**
 * Native BarcodeDetector implementation
 *
 * Speed: 10/10 (hardware accelerated)
 * Support: Chrome 83+ Android, Safari 17+ iOS, Edge
 */
export class NativeBarcodeDetectorEngine implements ScannerEngine {
  readonly name = 'native' as const

  private detector: BarcodeDetector | null = null
  private supportedFormats: string[] = []

  /**
   * Check if the native BarcodeDetector API is available
   */
  isSupported(): boolean {
    return 'BarcodeDetector' in globalThis
  }

  /**
   * Initialize the native detector with all supported formats
   */
  async initialize(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('BarcodeDetector API is not supported in this browser')
    }

    try {
      // Get supported formats on this device
      const formats = await BarcodeDetector.getSupportedFormats()

      // Store for getSupportedFormats()
      this.supportedFormats = formats.map((f) => normalizeFormat(f, 'native'))

      // Create detector with all supported formats
      this.detector = new BarcodeDetector({ formats })
    } catch (error) {
      throw new Error(`Failed to initialize BarcodeDetector: ${error}`)
    }
  }

  /**
   * Detect barcodes in an image frame using native API
   */
  async detect(imageData: ImageData): Promise<DetectedBarcode[]> {
    if (!this.detector) {
      throw new Error('Engine not initialized. Call initialize() first.')
    }

    try {
      // Convert ImageData to ImageBitmap for better performance
      const bitmap = await createImageBitmap(imageData)

      const results = await this.detector.detect(bitmap)

      // Clean up bitmap
      bitmap.close()

      return results.map((result) => ({
        rawValue: result.rawValue,
        format: normalizeFormat(result.format, 'native'),
        boundingBox: result.boundingBox
          ? {
              x: result.boundingBox.x,
              y: result.boundingBox.y,
              width: result.boundingBox.width,
              height: result.boundingBox.height,
            }
          : undefined,
        cornerPoints: result.cornerPoints,
      }))
    } catch (error) {
      // Detection errors are expected when no barcode is visible
      // Return empty array instead of throwing
      return []
    }
  }

  /**
   * Clean up the detector
   */
  dispose(): void {
    this.detector = null
    this.supportedFormats = []
  }

  /**
   * Get supported formats (normalized names)
   */
  getSupportedFormats(): string[] {
    return this.supportedFormats.length > 0
      ? this.supportedFormats
      : [
          'QR_CODE',
          'EAN_13',
          'EAN_8',
          'CODE_128',
          'CODE_39',
          'CODE_93',
          'CODABAR',
          'UPC_A',
          'UPC_E',
          'ITF',
          'DATA_MATRIX',
          'AZTEC',
          'PDF_417',
        ]
  }
}

/**
 * Check if native BarcodeDetector is supported with required formats
 * @param requiredFormats - Formats that must be supported (optional)
 */
export async function isNativeDetectorSupported(requiredFormats?: string[]): Promise<boolean> {
  if (!('BarcodeDetector' in globalThis)) {
    return false
  }

  try {
    const formats = await BarcodeDetector.getSupportedFormats()

    // If no required formats specified, just check that some formats are supported
    if (!requiredFormats || requiredFormats.length === 0) {
      return formats.length > 0
    }

    // Check that all required formats are supported
    const supportedSet = new Set(formats.map((f) => f.toLowerCase()))
    return requiredFormats.every((f) => supportedSet.has(f.toLowerCase()))
  } catch {
    return false
  }
}
