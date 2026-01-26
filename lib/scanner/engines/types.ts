/**
 * Shared types for barcode scanner engines
 *
 * This module defines the unified interface that all scanner engines must implement,
 * allowing seamless switching between Native BarcodeDetector, ZBar-WASM, and jsQR.
 */

/** Detected barcode result from any engine */
export interface DetectedBarcode {
  /** The decoded barcode value */
  rawValue: string
  /** Normalized format name (e.g., 'QR_CODE', 'EAN_13', 'CODE_128') */
  format: string
  /** Bounding box of the detected barcode (if available) */
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  /** Corner points of the barcode (if available) */
  cornerPoints?: Array<{ x: number; y: number }>
}

/** Engine type identifier */
export type EngineType = 'native' | 'zbar' | 'jsqr'

/**
 * Unified scanner engine interface
 *
 * All barcode scanning engines (native, ZBar, jsQR) implement this interface,
 * allowing the factory to seamlessly switch between them based on device capabilities.
 */
export interface ScannerEngine {
  /** Engine identifier */
  readonly name: EngineType

  /**
   * Check if this engine is supported on the current device
   * @returns true if the engine can be used
   */
  isSupported(): boolean | Promise<boolean>

  /**
   * Initialize the engine (load WASM, create detector, etc.)
   * Must be called before detect()
   */
  initialize(): Promise<void>

  /**
   * Detect barcodes in an image frame
   * @param imageData - The image data from a canvas/video frame
   * @returns Array of detected barcodes (empty if none found)
   */
  detect(imageData: ImageData): Promise<DetectedBarcode[]>

  /**
   * Clean up resources (stop workers, release memory)
   */
  dispose(): void

  /**
   * Get the list of barcode formats this engine supports
   * @returns Array of normalized format names
   */
  getSupportedFormats(): string[]
}

/** Camera device info */
export interface CameraDevice {
  id: string
  label: string
  facing?: 'user' | 'environment'
}

/** Camera stream configuration */
export interface CameraConfig {
  /** Preferred camera device ID */
  deviceId?: string
  /** Preferred facing mode */
  facingMode?: 'user' | 'environment'
  /** Ideal width (default: 1280) */
  width?: number
  /** Ideal height (default: 720) */
  height?: number
  /** Ideal frame rate (default: 30) */
  frameRate?: number
}

/** Common barcode formats */
export const BARCODE_FORMATS = {
  // 2D codes
  QR_CODE: 'QR_CODE',
  DATA_MATRIX: 'DATA_MATRIX',
  AZTEC: 'AZTEC',
  PDF_417: 'PDF_417',

  // 1D product codes
  EAN_13: 'EAN_13',
  EAN_8: 'EAN_8',
  UPC_A: 'UPC_A',
  UPC_E: 'UPC_E',

  // 1D industrial codes
  CODE_128: 'CODE_128',
  CODE_39: 'CODE_39',
  CODE_93: 'CODE_93',
  CODABAR: 'CODABAR',
  ITF: 'ITF',
  ISBN_10: 'ISBN_10',
  ISBN_13: 'ISBN_13',
} as const

export type BarcodeFormat = (typeof BARCODE_FORMATS)[keyof typeof BARCODE_FORMATS]
