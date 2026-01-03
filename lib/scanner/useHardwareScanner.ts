'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ScanResult } from './useBarcodeScanner'

export interface UseHardwareScannerOptions {
  onScan: (result: ScanResult) => void
  enabled?: boolean
  minLength?: number
}

export interface UseHardwareScanner {
  isListening: boolean
  lastScan: ScanResult | null
  clearLastScan: () => void
}

const SCANNER_CONFIG = {
  minLength: 4, // Minimum barcode length
  maxKeyInterval: 50, // Max ms between keystrokes (scanner is very fast)
  debounceTime: 300, // Prevent duplicate scans
}

/**
 * Hook to detect hardware barcode scanner input (USB/Bluetooth).
 *
 * Hardware scanners act as keyboard devices - they type the barcode
 * followed by Enter key, very rapidly (faster than human typing).
 *
 * Detection algorithm:
 * - Buffer characters typed rapidly (< 50ms apart)
 * - Trigger scan when Enter pressed with 4+ chars in buffer
 * - Reset buffer on slow typing (human) or after scan
 */
export function useHardwareScanner({
  onScan,
  enabled = true,
  minLength = SCANNER_CONFIG.minLength,
}: UseHardwareScannerOptions): UseHardwareScanner {
  const [isListening, setIsListening] = useState(false)
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)

  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)
  const lastScanTimeRef = useRef(0)

  const clearLastScan = useCallback(() => {
    setLastScan(null)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setIsListening(false)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable ||
        target.contentEditable === 'true'
      ) {
        return
      }

      const now = Date.now()

      // Reset buffer if typing too slow (human typing pattern)
      if (
        now - lastKeyTimeRef.current > SCANNER_CONFIG.maxKeyInterval &&
        bufferRef.current.length > 0
      ) {
        bufferRef.current = ''
      }

      if (e.key === 'Enter') {
        // Check if we have a valid barcode in buffer
        if (bufferRef.current.length >= minLength) {
          // Debounce to prevent duplicate scans
          if (now - lastScanTimeRef.current > SCANNER_CONFIG.debounceTime) {
            e.preventDefault()

            const result: ScanResult = {
              code: bufferRef.current,
              format: 'HARDWARE',
              timestamp: new Date(),
            }

            setLastScan(result)
            lastScanTimeRef.current = now

            // Trigger haptic feedback if available
            if (navigator.vibrate) {
              navigator.vibrate(100)
            }

            onScan(result)
          }
        }
        // Always clear buffer on Enter
        bufferRef.current = ''
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Single character key (not modifier keys)
        bufferRef.current += e.key
      }

      lastKeyTimeRef.current = now
    }

    window.addEventListener('keydown', handleKeyDown)
    setIsListening(true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      setIsListening(false)
      bufferRef.current = ''
    }
  }, [enabled, minLength, onScan])

  return {
    isListening,
    lastScan,
    clearLastScan,
  }
}
