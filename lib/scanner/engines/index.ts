/**
 * Scanner Engine Factory
 *
 * Automatically selects the best available barcode scanning engine
 * based on device capabilities, following the "Holy Grail" PWA strategy:
 *
 * Layer 1: Native BarcodeDetector API (fastest, hardware-accelerated)
 * Layer 2: ZBar-WASM (fast, excellent for 1D barcodes)
 * Layer 3: jsQR (fallback, QR codes only)
 */

import type { ScannerEngine, EngineType } from './types'
import { NativeBarcodeDetectorEngine, isNativeDetectorSupported } from './native-detector'
import { ZBarEngine, isZBarSupported } from './zbar-engine'
import { JsQREngine } from './jsqr-engine'

// Re-export types and engines
export type { ScannerEngine, DetectedBarcode, EngineType } from './types'
export { NativeBarcodeDetectorEngine } from './native-detector'
export { ZBarEngine } from './zbar-engine'
export { JsQREngine } from './jsqr-engine'

/**
 * Detection result from capability check
 */
interface EngineCapabilities {
  native: boolean
  zbar: boolean
  jsqr: boolean
  recommended: EngineType
}

/**
 * Check which engines are available on this device
 */
export async function detectEngineCapabilities(): Promise<EngineCapabilities> {
  const [nativeSupported] = await Promise.all([
    isNativeDetectorSupported(['qr_code', 'ean_13']), // Require essential formats
  ])

  const zbarSupported = isZBarSupported()

  // Determine recommended engine
  let recommended: EngineType = 'jsqr' // Fallback
  if (nativeSupported) {
    recommended = 'native'
  } else if (zbarSupported) {
    recommended = 'zbar'
  }

  return {
    native: nativeSupported,
    zbar: zbarSupported,
    jsqr: true, // Always supported (pure JS)
    recommended,
  }
}

/**
 * Create the best available scanner engine
 *
 * Follows the polyfill strategy:
 * 1. Try native BarcodeDetector (Android Chrome, iOS 17+, Edge)
 * 2. Fall back to ZBar-WASM (older iOS, Firefox)
 * 3. Final fallback to jsQR (QR codes only)
 *
 * @param preferredEngine - Force a specific engine (for testing or user preference)
 * @returns Initialized scanner engine ready to use
 *
 * @example
 * const engine = await createScannerEngine()
 * console.log(`Using ${engine.name} engine`)
 * const results = await engine.detect(imageData)
 */
export async function createScannerEngine(preferredEngine?: EngineType): Promise<ScannerEngine> {
  // If a specific engine is requested, use it
  if (preferredEngine) {
    const engine = createEngineByType(preferredEngine)
    await engine.initialize()
    return engine
  }

  // Auto-detect and use the best available engine
  const capabilities = await detectEngineCapabilities()

  console.log(`[Scanner] Capabilities detected:`, {
    native: capabilities.native,
    zbar: capabilities.zbar,
    recommended: capabilities.recommended,
  })

  // Layer 1: Try native BarcodeDetector
  if (capabilities.native) {
    try {
      const engine = new NativeBarcodeDetectorEngine()
      await engine.initialize()
      console.log('[Scanner] Using native BarcodeDetector engine (hardware accelerated)')
      return engine
    } catch (error) {
      console.warn('[Scanner] Native engine failed to initialize:', error)
    }
  }

  // Layer 2: Try ZBar-WASM
  if (capabilities.zbar) {
    try {
      const engine = new ZBarEngine()
      await engine.initialize()
      console.log('[Scanner] Using ZBar-WASM engine')
      return engine
    } catch (error) {
      console.warn('[Scanner] ZBar engine failed to initialize:', error)
    }
  }

  // Layer 3: Fallback to jsQR
  const engine = new JsQREngine()
  await engine.initialize()
  console.log('[Scanner] Using jsQR engine (QR codes only)')
  return engine
}

/**
 * Create a specific engine by type
 */
function createEngineByType(type: EngineType): ScannerEngine {
  switch (type) {
    case 'native':
      return new NativeBarcodeDetectorEngine()
    case 'zbar':
      return new ZBarEngine()
    case 'jsqr':
      return new JsQREngine()
    default:
      throw new Error(`Unknown engine type: ${type}`)
  }
}

/**
 * Get the name of the engine that will be used without initializing it
 * Useful for UI to show which engine will be used
 */
export async function getRecommendedEngine(): Promise<EngineType> {
  const capabilities = await detectEngineCapabilities()
  return capabilities.recommended
}

/**
 * Pre-warm the scanner engine by loading WASM in the background
 * Call this during idle time to reduce scan startup latency
 */
export async function preloadScannerEngine(): Promise<void> {
  const capabilities = await detectEngineCapabilities()

  // Only preload WASM engines (native doesn't need preloading)
  if (!capabilities.native && capabilities.zbar) {
    try {
      // Just import the module to trigger WASM download and compilation
      await import('@undecaf/zbar-wasm')
      console.log('[Scanner] ZBar WASM preloaded')
    } catch {
      // Preloading is optional, don't fail
    }
  }
}
