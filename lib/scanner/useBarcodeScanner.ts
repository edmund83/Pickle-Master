'use client'

/**
 * useBarcodeScanner Hook
 *
 * A React hook for camera-based barcode scanning using the "Holy Grail" PWA strategy:
 * - Layer 1: Native BarcodeDetector API (Android Chrome, iOS 17+, Edge)
 * - Layer 2: ZBar-WASM (older iOS, Firefox)
 * - Layer 3: jsQR (QR codes only fallback)
 *
 * The hook automatically selects the best available engine based on device capabilities.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { createScannerEngine, type ScannerEngine, type EngineType } from './engines'
import { CameraManager } from './utils/camera-manager'

// ============================================================================
// Types (UNCHANGED - Critical for backwards compatibility)
// ============================================================================

export interface ScanResult {
  code: string
  format: string
  timestamp: Date
}

export interface UseBarcodeScanner {
  isScanning: boolean
  isInitializing: boolean
  error: string | null
  lastScan: ScanResult | null
  hasPermission: boolean | null
  availableCameras: { id: string; label: string }[]
  currentCameraId: string | null
  startScanning: (elementId: string) => Promise<void>
  stopScanning: () => Promise<void>
  switchCamera: () => Promise<void>
  clearLastScan: () => void
  clearError: () => void
}

// ============================================================================
// Configuration
// ============================================================================

const SCANNER_CONFIG = {
  /** Target frames per second for detection (up from 10) */
  fps: 30,

  /** Debounce time between scans to prevent duplicates */
  debounceMs: 1500,

  /** Camera resolution preferences */
  camera: {
    width: 1280,
    height: 720,
    frameRate: 30,
  },
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useBarcodeScanner(onScanSuccess?: (result: ScanResult) => void): UseBarcodeScanner {
  // State
  const [isScanning, setIsScanning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([])
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null)

  // Refs
  const engineRef = useRef<ScannerEngine | null>(null)
  const cameraManagerRef = useRef<CameraManager | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scanLoopRef = useRef<number | null>(null)
  const lastScanTimeRef = useRef<number>(0)
  const elementIdRef = useRef<string | null>(null)
  const onScanSuccessRef = useRef(onScanSuccess)

  // Keep callback ref up to date
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess
  }, [onScanSuccess])

  // ============================================================================
  // Detection Loop
  // ============================================================================

  const startDetectionLoop = useCallback(() => {
    const frameInterval = 1000 / SCANNER_CONFIG.fps
    let lastFrameTime = 0

    const loop = async (timestamp: number) => {
      // Throttle to target FPS
      if (timestamp - lastFrameTime < frameInterval) {
        scanLoopRef.current = requestAnimationFrame(loop)
        return
      }
      lastFrameTime = timestamp

      // Capture frame
      const imageData = cameraManagerRef.current?.captureFrame()
      if (!imageData || !engineRef.current) {
        scanLoopRef.current = requestAnimationFrame(loop)
        return
      }

      try {
        // Run detection
        const results = await engineRef.current.detect(imageData)

        if (results.length > 0) {
          const now = Date.now()

          // Debounce duplicate scans
          if (now - lastScanTimeRef.current >= SCANNER_CONFIG.debounceMs) {
            lastScanTimeRef.current = now

            const detected = results[0]
            const scanResult: ScanResult = {
              code: detected.rawValue,
              format: detected.format,
              timestamp: new Date(),
            }

            setLastScan(scanResult)

            // Trigger haptic feedback if available
            if (navigator.vibrate) {
              navigator.vibrate(100)
            }

            // Call success callback
            onScanSuccessRef.current?.(scanResult)
          }
        }
      } catch {
        // Detection errors are expected when no barcode is visible
        // Continue scanning
      }

      scanLoopRef.current = requestAnimationFrame(loop)
    }

    scanLoopRef.current = requestAnimationFrame(loop)
  }, [])

  const stopDetectionLoop = useCallback(() => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current)
      scanLoopRef.current = null
    }
  }, [])

  // ============================================================================
  // Camera Enumeration
  // ============================================================================

  useEffect(() => {
    const enumerateCameras = async () => {
      try {
        const manager = new CameraManager()
        const cameras = await manager.enumerateCameras()

        if (cameras.length > 0) {
          setAvailableCameras(cameras.map((c) => ({ id: c.id, label: c.label })))

          // Prefer back/environment camera
          const backCamera = cameras.find((c) => c.facing === 'environment')
          setCurrentCameraId(backCamera?.id || cameras[0].id)
          setHasPermission(true)
        } else {
          setHasPermission(false)
        }
      } catch {
        // Permission not yet granted
        setHasPermission(false)
      }
    }

    enumerateCameras()
  }, [])

  // ============================================================================
  // Cleanup on Unmount
  // ============================================================================

  useEffect(() => {
    return () => {
      stopDetectionLoop()

      if (cameraManagerRef.current) {
        cameraManagerRef.current.stopStream()
        cameraManagerRef.current = null
      }

      if (engineRef.current) {
        engineRef.current.dispose()
        engineRef.current = null
      }

      if (videoRef.current) {
        videoRef.current.remove()
        videoRef.current = null
      }
    }
  }, [stopDetectionLoop])

  // ============================================================================
  // Start Scanning
  // ============================================================================

  const startScanning = useCallback(
    async (elementId: string) => {
      if (isScanning || isInitializing) return

      setIsInitializing(true)
      setError(null)
      elementIdRef.current = elementId

      try {
        // 1. Initialize the best available scanner engine
        engineRef.current = await createScannerEngine()

        // 2. Initialize camera manager
        cameraManagerRef.current = new CameraManager()

        // 3. Enumerate cameras if not done
        if (availableCameras.length === 0) {
          const cameras = await cameraManagerRef.current.enumerateCameras()
          if (cameras.length === 0) {
            throw new Error('No cameras found on this device')
          }
          setAvailableCameras(cameras.map((c) => ({ id: c.id, label: c.label })))

          const backCamera = cameras.find((c) => c.facing === 'environment')
          setCurrentCameraId(backCamera?.id || cameras[0].id)
          setHasPermission(true)
        }

        // 4. Start camera stream
        const cameraId = currentCameraId || availableCameras[0]?.id
        await cameraManagerRef.current.startStream({
          deviceId: cameraId,
          width: SCANNER_CONFIG.camera.width,
          height: SCANNER_CONFIG.camera.height,
          frameRate: SCANNER_CONFIG.camera.frameRate,
        })

        // 5. Create and attach video element
        const container = document.getElementById(elementId)
        if (!container) {
          throw new Error(`Container element not found: ${elementId}`)
        }

        const video = document.createElement('video')
        video.autoplay = true
        video.playsInline = true
        video.muted = true
        video.style.width = '100%'
        video.style.height = '100%'
        video.style.objectFit = 'cover'

        container.appendChild(video)
        videoRef.current = video

        cameraManagerRef.current.bindToVideo(video)

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Video load timeout')), 10000)

          video.onloadedmetadata = () => {
            clearTimeout(timeout)
            video
              .play()
              .then(() => resolve())
              .catch(reject)
          }

          video.onerror = () => {
            clearTimeout(timeout)
            reject(new Error('Video load error'))
          }
        })

        // 6. Start detection loop
        startDetectionLoop()
        setIsScanning(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start scanner'

        // Provide user-friendly error messages
        if (message.includes('Permission denied') || message.includes('NotAllowedError')) {
          setError('Camera permission denied. Please allow camera access in your browser settings.')
          setHasPermission(false)
        } else if (message.includes('NotFoundError') || message.includes('No cameras')) {
          setError('No camera found. Please ensure your device has a camera.')
        } else if (message.includes('NotReadableError')) {
          setError('Camera is in use by another application. Please close other apps using the camera.')
        } else {
          setError(message)
        }

        // Cleanup on error
        if (cameraManagerRef.current) {
          cameraManagerRef.current.stopStream()
          cameraManagerRef.current = null
        }
        if (engineRef.current) {
          engineRef.current.dispose()
          engineRef.current = null
        }
      } finally {
        setIsInitializing(false)
      }
    },
    [isScanning, isInitializing, availableCameras, currentCameraId, startDetectionLoop]
  )

  // ============================================================================
  // Stop Scanning
  // ============================================================================

  const stopScanning = useCallback(async () => {
    stopDetectionLoop()

    if (cameraManagerRef.current) {
      cameraManagerRef.current.stopStream()
      cameraManagerRef.current = null
    }

    if (engineRef.current) {
      engineRef.current.dispose()
      engineRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.remove()
      videoRef.current = null
    }

    setIsScanning(false)
  }, [stopDetectionLoop])

  // ============================================================================
  // Switch Camera
  // ============================================================================

  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) return

    const currentIndex = availableCameras.findIndex((c) => c.id === currentCameraId)
    const nextIndex = (currentIndex + 1) % availableCameras.length
    const nextCameraId = availableCameras[nextIndex].id

    setCurrentCameraId(nextCameraId)

    // If currently scanning, restart with new camera
    if (isScanning && elementIdRef.current) {
      await stopScanning()
      // Small delay to ensure camera is released
      await new Promise((resolve) => setTimeout(resolve, 300))
      await startScanning(elementIdRef.current)
    }
  }, [availableCameras, currentCameraId, isScanning, stopScanning, startScanning])

  // ============================================================================
  // Utility Methods
  // ============================================================================

  const clearLastScan = useCallback(() => {
    setLastScan(null)
    lastScanTimeRef.current = 0
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // ============================================================================
  // Return Hook Interface (UNCHANGED)
  // ============================================================================

  return {
    isScanning,
    isInitializing,
    error,
    lastScan,
    hasPermission,
    availableCameras,
    currentCameraId,
    startScanning,
    stopScanning,
    switchCamera,
    clearLastScan,
    clearError,
  }
}

// ============================================================================
// Exports for advanced usage
// ============================================================================

export { createScannerEngine, type ScannerEngine, type EngineType } from './engines'
export { CameraManager } from './utils/camera-manager'
export { preloadScannerEngine, getRecommendedEngine } from './engines'
