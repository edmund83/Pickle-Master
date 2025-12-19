'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'

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

const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  disableFlip: false,
}

export function useBarcodeScanner(
  onScanSuccess?: (result: ScanResult) => void
): UseBarcodeScanner {
  const [isScanning, setIsScanning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([])
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const elementIdRef = useRef<string | null>(null)
  const lastScanTimeRef = useRef<number>(0)

  // Debounce scans to prevent rapid-fire detection of the same code
  const SCAN_DEBOUNCE_MS = 1500

  // Get available cameras on mount
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          setAvailableCameras(devices.map(d => ({ id: d.id, label: d.label || `Camera ${d.id}` })))
          // Prefer back camera for mobile
          const backCamera = devices.find(d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
          )
          setCurrentCameraId(backCamera?.id || devices[0].id)
          setHasPermission(true)
        }
      } catch (err) {
        // Permission not yet granted or no cameras
        setHasPermission(false)
      }
    }
    getCameras()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        const state = scannerRef.current.getState()
        if (state === Html5QrcodeScannerState.SCANNING) {
          scannerRef.current.stop().catch(() => {})
        }
        scannerRef.current.clear()
      }
    }
  }, [])

  const handleScanSuccess = useCallback((decodedText: string, decodedResult: { result: { format?: { formatName: string } } }) => {
    const now = Date.now()

    // Debounce duplicate scans
    if (now - lastScanTimeRef.current < SCAN_DEBOUNCE_MS) {
      return
    }
    lastScanTimeRef.current = now

    const result: ScanResult = {
      code: decodedText,
      format: decodedResult.result.format?.formatName || 'UNKNOWN',
      timestamp: new Date(),
    }

    setLastScan(result)

    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }

    onScanSuccess?.(result)
  }, [onScanSuccess])

  const handleScanError = useCallback(() => {
    // Scan errors are expected when no barcode is in view
    // Don't set error state for these
  }, [])

  const startScanning = useCallback(async (elementId: string) => {
    if (isScanning || isInitializing) return

    setIsInitializing(true)
    setError(null)
    elementIdRef.current = elementId

    try {
      // Request camera permission if not granted
      if (!hasPermission) {
        const devices = await Html5Qrcode.getCameras()
        if (devices && devices.length > 0) {
          setAvailableCameras(devices.map(d => ({ id: d.id, label: d.label || `Camera ${d.id}` })))
          const backCamera = devices.find(d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
          )
          setCurrentCameraId(backCamera?.id || devices[0].id)
          setHasPermission(true)
        } else {
          throw new Error('No cameras found on this device')
        }
      }

      // Create scanner instance
      scannerRef.current = new Html5Qrcode(elementId)

      const cameraId = currentCameraId || availableCameras[0]?.id
      if (!cameraId) {
        throw new Error('No camera available')
      }

      await scannerRef.current.start(
        cameraId,
        SCANNER_CONFIG,
        handleScanSuccess,
        handleScanError
      )

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
    } finally {
      setIsInitializing(false)
    }
  }, [isScanning, isInitializing, hasPermission, currentCameraId, availableCameras, handleScanSuccess, handleScanError])

  const stopScanning = useCallback(async () => {
    if (!scannerRef.current) return

    try {
      const state = scannerRef.current.getState()
      if (state === Html5QrcodeScannerState.SCANNING) {
        await scannerRef.current.stop()
      }
      scannerRef.current.clear()
      scannerRef.current = null
      setIsScanning(false)
    } catch (err) {
      console.error('Error stopping scanner:', err)
    }
  }, [])

  const switchCamera = useCallback(async () => {
    if (availableCameras.length <= 1) return

    const currentIndex = availableCameras.findIndex(c => c.id === currentCameraId)
    const nextIndex = (currentIndex + 1) % availableCameras.length
    const nextCameraId = availableCameras[nextIndex].id

    setCurrentCameraId(nextCameraId)

    // If currently scanning, restart with new camera
    if (isScanning && elementIdRef.current) {
      await stopScanning()
      // Small delay to ensure camera is released
      await new Promise(resolve => setTimeout(resolve, 300))
      await startScanning(elementIdRef.current)
    }
  }, [availableCameras, currentCameraId, isScanning, stopScanning, startScanning])

  const clearLastScan = useCallback(() => {
    setLastScan(null)
    lastScanTimeRef.current = 0
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

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
