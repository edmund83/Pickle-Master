/**
 * jsQR Engine (Layer 3)
 *
 * Pure JavaScript QR code detector as a final fallback.
 * This is the most compatible option but only supports QR codes.
 *
 * Use case: When native API is unavailable and WASM fails to load,
 * or specifically for QR code detection where ZBar might struggle.
 *
 * @see https://github.com/cozmo/jsQR
 */

import type { ScannerEngine, DetectedBarcode } from './types'
import { normalizeFormat } from '../utils/format-normalizer'

// Type definitions for jsQR
interface QRCode {
  data: string
  binaryData: number[]
  location: {
    topLeftCorner: { x: number; y: number }
    topRightCorner: { x: number; y: number }
    bottomRightCorner: { x: number; y: number }
    bottomLeftCorner: { x: number; y: number }
    topLeftFinderPattern: { x: number; y: number }
    topRightFinderPattern: { x: number; y: number }
    bottomLeftFinderPattern: { x: number; y: number }
  }
}

type JsQRFunction = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' }
) => QRCode | null

/**
 * jsQR engine implementation
 *
 * Speed: 7/10 (pure JS, decent for QR codes)
 * Support: All browsers (pure JavaScript)
 */
export class JsQREngine implements ScannerEngine {
  readonly name = 'jsqr' as const

  private jsQR: JsQRFunction | null = null
  private isInitialized = false

  /**
   * jsQR is pure JavaScript, always supported
   */
  isSupported(): boolean {
    return true
  }

  /**
   * Initialize by dynamically importing jsQR
   * This ensures the ~30KB library is only loaded when needed
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // Dynamic import for code splitting
      const jsQRModule = await import('jsqr')
      this.jsQR = jsQRModule.default

      this.isInitialized = true
    } catch (error) {
      throw new Error(`Failed to load jsQR: ${error}`)
    }
  }

  /**
   * Detect QR codes in an image frame
   */
  async detect(imageData: ImageData): Promise<DetectedBarcode[]> {
    if (!this.jsQR) {
      throw new Error('Engine not initialized. Call initialize() first.')
    }

    try {
      const result = this.jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth', // Try both normal and inverted
      })

      if (!result) {
        return []
      }

      const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = result.location

      return [
        {
          rawValue: result.data,
          format: normalizeFormat('QR', 'jsqr'),
          cornerPoints: [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner],
          boundingBox: this.calculateBoundingBox([
            topLeftCorner,
            topRightCorner,
            bottomRightCorner,
            bottomLeftCorner,
          ]),
        },
      ]
    } catch (error) {
      // Detection errors are expected when no QR code is visible
      return []
    }
  }

  /**
   * Calculate bounding box from corner points
   */
  private calculateBoundingBox(
    points: Array<{ x: number; y: number }>
  ): { x: number; y: number; width: number; height: number } {
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
    this.jsQR = null
    this.isInitialized = false
  }

  /**
   * jsQR only supports QR codes
   */
  getSupportedFormats(): string[] {
    return ['QR_CODE']
  }
}

/**
 * jsQR is always supported (pure JavaScript)
 */
export function isJsQRSupported(): boolean {
  return true
}
