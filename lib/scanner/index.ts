// Main hook
export { useBarcodeScanner } from './useBarcodeScanner'
export type { ScanResult, UseBarcodeScanner } from './useBarcodeScanner'

// Engine utilities (for advanced usage)
export {
  createScannerEngine,
  preloadScannerEngine,
  getRecommendedEngine,
  detectEngineCapabilities,
} from './engines'
export type { ScannerEngine, EngineType, DetectedBarcode } from './engines'

// Camera utilities
export { CameraManager } from './utils/camera-manager'
