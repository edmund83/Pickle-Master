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
  /** The scanner engine being used (native, zbar, or jsqr) */
  engineName: string | null
  /** Whether the current engine supports 1D barcodes (UPC, EAN, etc.) */
  supports1DBarcodes: boolean
  /** Whether the camera has torch/flashlight capability */
  hasTorch: boolean
  /** Whether the torch is currently enabled */
  isTorchOn: boolean
  startScanning: (elementId: string) => Promise<void>
  stopScanning: () => Promise<void>
  switchCamera: () => Promise<void>
  /** Toggle the torch/flashlight on or off */
  toggleTorch: () => Promise<void>
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

  /** Audio feedback settings */
  audio: {
    /** Enable audio beep on successful scan */
    enabled: true,
    /** Frequency in Hz (A5 note = 880Hz, more pleasant than harsh beep) */
    frequency: 880,
    /** Duration in seconds */
    duration: 0.1,
    /** Volume (0 to 1) */
    volume: 0.3,
  },
}

// ============================================================================
// Audio Feedback
// ============================================================================

let audioContext: AudioContext | null = null

/**
 * Play a short beep sound on successful scan.
 * Uses Web Audio API for low latency and no external assets.
 */
function playBeep(): void {
  if (!SCANNER_CONFIG.audio.enabled) return

  try {
    // Lazily create AudioContext (must be after user interaction)
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }

    // Resume context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(SCANNER_CONFIG.audio.frequency, audioContext.currentTime)

    // Quick fade out to avoid click
    gainNode.gain.setValueAtTime(SCANNER_CONFIG.audio.volume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + SCANNER_CONFIG.audio.duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + SCANNER_CONFIG.audio.duration)
  } catch (err) {
    // Audio not critical - fail silently
    console.warn('[Scanner] Audio beep failed:', err)
  }
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
  const [engineName, setEngineName] = useState<string | null>(null)
  const [hasTorchCapability, setHasTorchCapability] = useState(false)
  const [isTorchOn, setIsTorchOn] = useState(false)

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
    let frameCount = 0
    let nullFrameCount = 0

    const loop = async (timestamp: number) => {
      // CRITICAL: Stop loop if engine was disposed (component unmounted or stopped)
      if (!engineRef.current) {
        console.log('[Scanner] Detection loop stopped - engine disposed')
        return // Don't schedule next frame
      }

      // Throttle to target FPS
      if (timestamp - lastFrameTime < frameInterval) {
        scanLoopRef.current = requestAnimationFrame(loop)
        return
      }
      lastFrameTime = timestamp
      frameCount++

      // Capture frame
      const imageData = cameraManagerRef.current?.captureFrame()
      if (!imageData) {
        nullFrameCount++
        // Log every 100 null frames to help diagnose
        if (nullFrameCount === 1 || nullFrameCount % 100 === 0) {
          const reason = cameraManagerRef.current?.getLastCaptureFailure?.() ?? 'unknown'
          console.warn(`[Scanner] Frame capture failed (${nullFrameCount} null frames). Reason: ${reason}`)
        }
        scanLoopRef.current = requestAnimationFrame(loop)
        return
      }

      // Log first successful frame capture
      if (frameCount === 1 || (frameCount <= 10 && nullFrameCount > 0)) {
        console.log(`[Scanner] Frame captured: ${imageData.width}x${imageData.height}, engine: ${engineRef.current.name}`)
      }

      try {
        // Run detection
        const results = await engineRef.current.detect(imageData)

        // Log detection activity periodically (every 5 seconds)
        if (frameCount % (SCANNER_CONFIG.fps * 5) === 0) {
          console.log(`[Scanner] Detection active - ${frameCount} frames processed, engine: ${engineRef.current.name}, formats: ${engineRef.current.getSupportedFormats().slice(0, 3).join(', ')}...`)
        }

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

            // Play audio beep
            playBeep()

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
        console.log('[Scanner] Creating scanner engine...')
        engineRef.current = await createScannerEngine()
        setEngineName(engineRef.current.name)
        console.log(`[Scanner] Engine created: ${engineRef.current.name}`)

        // 2. Initialize camera manager
        const cameraManager = new CameraManager()
        cameraManagerRef.current = cameraManager

        // 3. Enumerate cameras - always enumerate fresh to get permission
        const cameras = await cameraManager.enumerateCameras()

        if (cameras.length === 0) {
          throw new Error('No cameras found on this device')
        }

        // Update state for UI
        setAvailableCameras(cameras.map((c) => ({ id: c.id, label: c.label })))

        // Find best camera (prefer back/environment camera)
        const backCamera = cameras.find((c) => c.facing === 'environment')
        const selectedCameraId = backCamera?.id || cameras[0].id
        setCurrentCameraId(selectedCameraId)
        setHasPermission(true)

        // 4. Start camera stream with the camera ID we just determined (not from stale state)
        await cameraManager.startStream({
          deviceId: selectedCameraId,
          width: SCANNER_CONFIG.camera.width,
          height: SCANNER_CONFIG.camera.height,
          frameRate: SCANNER_CONFIG.camera.frameRate,
        })

        // 5. Create and attach video element
        const container = document.getElementById(elementId)
        if (!container) {
          throw new Error(`Container element not found: ${elementId}`)
        }

        // Check if camera manager is still valid (could be nulled by cleanup)
        if (!cameraManagerRef.current) {
          throw new Error('Scanner initialization aborted')
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

        // Bind video to camera - check ref is still valid
        if (!cameraManagerRef.current) {
          video.remove()
          throw new Error('Scanner initialization aborted')
        }
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

        // Check if still valid after async wait (component could have unmounted)
        if (!cameraManagerRef.current) {
          throw new Error('Scanner initialization aborted')
        }

        // 6. Check torch capability
        const torchAvailable = cameraManagerRef.current.hasTorch()
        setHasTorchCapability(torchAvailable)
        setIsTorchOn(false) // Reset torch state
        if (torchAvailable) {
          console.log('[Scanner] Torch/flashlight is available')
        }

        // 7. Start detection loop
        startDetectionLoop()
        setIsScanning(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to start scanner'

        // Don't show error if we were just aborted (component unmounted)
        if (message === 'Scanner initialization aborted') {
          return
        }

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
        if (videoRef.current) {
          videoRef.current.remove()
          videoRef.current = null
        }
      } finally {
        setIsInitializing(false)
      }
    },
    [isScanning, isInitializing, startDetectionLoop]
  )

  // ============================================================================
  // Stop Scanning
  // ============================================================================

  const stopScanning = useCallback(async () => {
    console.log('[Scanner] Stopping scanner...')
    stopDetectionLoop()

    // Turn off torch before stopping stream
    if (cameraManagerRef.current && isTorchOn) {
      try {
        await cameraManagerRef.current.setTorch(false)
      } catch {
        // Ignore torch errors during cleanup
      }
    }

    if (cameraManagerRef.current) {
      cameraManagerRef.current.stopStream()
      cameraManagerRef.current = null
    }

    if (engineRef.current) {
      console.log(`[Scanner] Disposing engine: ${engineRef.current.name}`)
      engineRef.current.dispose()
      engineRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.remove()
      videoRef.current = null
    }

    setIsScanning(false)
    setEngineName(null)
    setHasTorchCapability(false)
    setIsTorchOn(false)
    console.log('[Scanner] Scanner stopped')
  }, [stopDetectionLoop, isTorchOn])

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
  // Toggle Torch
  // ============================================================================

  const toggleTorch = useCallback(async () => {
    if (!cameraManagerRef.current || !hasTorchCapability) return

    const newState = !isTorchOn
    try {
      await cameraManagerRef.current.setTorch(newState)
      setIsTorchOn(newState)
      console.log(`[Scanner] Torch ${newState ? 'ON' : 'OFF'}`)
    } catch (error) {
      console.warn('[Scanner] Failed to toggle torch:', error)
    }
  }, [hasTorchCapability, isTorchOn])

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

  // jsQR only supports QR codes, not 1D barcodes
  const supports1DBarcodes = engineName !== 'jsqr'

  return {
    isScanning,
    isInitializing,
    error,
    lastScan,
    hasPermission,
    availableCameras,
    currentCameraId,
    engineName,
    supports1DBarcodes,
    hasTorch: hasTorchCapability,
    isTorchOn,
    startScanning,
    stopScanning,
    switchCamera,
    toggleTorch,
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
