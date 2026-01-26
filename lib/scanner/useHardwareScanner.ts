'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ScanResult } from './useBarcodeScanner'

export interface UseHardwareScannerOptions {
  onScan: (result: ScanResult) => void
  enabled?: boolean
  minLength?: number
  /** Ref to an input element for capturing DataWedge/scanner input */
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export interface UseHardwareScanner {
  isListening: boolean
  lastScan: ScanResult | null
  clearLastScan: () => void
}

const SCANNER_CONFIG = {
  minLength: 4, // Minimum barcode length
  maxKeyInterval: 100, // Max ms between keystrokes (increased for DataWedge compatibility)
  debounceTime: 300, // Prevent duplicate scans
  debug: process.env.NODE_ENV === 'development', // Enable debug logging in dev
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
  inputRef,
}: UseHardwareScannerOptions): UseHardwareScanner {
  const [isListening, setIsListening] = useState(false)
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)

  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)
  const lastScanTimeRef = useRef(0)

  const clearLastScan = useCallback(() => {
    setLastScan(null)
  }, [])

  // Process a scan result (shared between input and window listeners)
  const processScan = useCallback((code: string) => {
    const now = Date.now()

    // Debounce to prevent duplicate scans
    if (now - lastScanTimeRef.current < SCANNER_CONFIG.debounceTime) {
      if (SCANNER_CONFIG.debug) {
        console.log(`[HardwareScanner] Debounced scan: "${code}"`)
      }
      return
    }

    if (code.length >= minLength) {
      const result: ScanResult = {
        code,
        format: 'HARDWARE',
        timestamp: new Date(),
      }

      if (SCANNER_CONFIG.debug) {
        console.log(`[HardwareScanner] SCAN DETECTED: "${result.code}"`)
      }

      setLastScan(result)
      lastScanTimeRef.current = now

      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }

      onScan(result)
    }
  }, [minLength, onScan])

  // Listen for input from dedicated scanner input field (for DataWedge/Zebra)
  useEffect(() => {
    if (!enabled || !inputRef?.current) {
      return
    }

    const input = inputRef.current

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement
      if (SCANNER_CONFIG.debug) {
        console.log(`[HardwareScanner] Input value: "${target.value}"`)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const target = e.target as HTMLInputElement
        const code = target.value.trim()

        if (SCANNER_CONFIG.debug) {
          console.log(`[HardwareScanner] Input Enter pressed, value: "${code}"`)
        }

        if (code) {
          processScan(code)
          // Clear the input after processing
          target.value = ''
        }
      }
    }

    input.addEventListener('input', handleInput)
    input.addEventListener('keydown', handleKeyDown)

    return () => {
      input.removeEventListener('input', handleInput)
      input.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, inputRef, processScan])

  // Global keydown listener for USB/Bluetooth scanners (keyboard wedge mode)
  useEffect(() => {
    if (!enabled) {
      setIsListening(false)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field (except our dedicated scanner input)
      const target = e.target as HTMLElement
      const isOurInput = inputRef?.current && target === inputRef.current

      if (
        !isOurInput && (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target.isContentEditable ||
          target.contentEditable === 'true'
        )
      ) {
        return
      }

      // If using our dedicated input, let the input handler deal with it
      if (isOurInput) {
        return
      }

      const now = Date.now()

      // Debug logging for DataWedge troubleshooting
      if (SCANNER_CONFIG.debug) {
        const interval = now - lastKeyTimeRef.current
        console.log(`[HardwareScanner] Key: "${e.key}" | Interval: ${interval}ms | Buffer: "${bufferRef.current}"`)
      }

      // Reset buffer if typing too slow (human typing pattern)
      if (
        now - lastKeyTimeRef.current > SCANNER_CONFIG.maxKeyInterval &&
        bufferRef.current.length > 0
      ) {
        if (SCANNER_CONFIG.debug) {
          console.log(`[HardwareScanner] Buffer cleared (slow typing): was "${bufferRef.current}"`)
        }
        bufferRef.current = ''
      }

      if (e.key === 'Enter') {
        // Check if we have a valid barcode in buffer
        if (bufferRef.current.length >= minLength) {
          e.preventDefault()
          processScan(bufferRef.current)
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
  }, [enabled, minLength, inputRef, processScan])

  return {
    isListening,
    lastScan,
    clearLastScan,
  }
}
