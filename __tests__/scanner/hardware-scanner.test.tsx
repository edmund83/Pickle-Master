import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React, { useEffect } from 'react'
import { render, cleanup, act } from '@testing-library/react'
import { useHardwareScanner } from '@/lib/scanner/useHardwareScanner'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'

// ============================================================================
// Test Component Wrapper
// ============================================================================

interface TestComponentProps {
  onScan: (result: ScanResult) => void
  enabled?: boolean
  minLength?: number
  onMount?: (api: {
    isListening: boolean
    lastScan: ScanResult | null
    clearLastScan: () => void
    getIsListening: () => boolean
    getLastScan: () => ScanResult | null
  }) => void
}

function TestComponent({
  onScan,
  enabled = true,
  minLength,
  onMount,
}: TestComponentProps) {
  const { isListening, lastScan, clearLastScan } = useHardwareScanner({
    onScan,
    enabled,
    minLength,
  })

  // Use refs for synchronous access in tests
  const isListeningRef = React.useRef(isListening)
  const lastScanRef = React.useRef(lastScan)

  // Update refs in useEffect to avoid setting during render
  useEffect(() => {
    isListeningRef.current = isListening
    lastScanRef.current = lastScan
  }, [isListening, lastScan])

  useEffect(() => {
    onMount?.({
      isListening,
      lastScan,
      clearLastScan,
      getIsListening: () => isListeningRef.current,
      getLastScan: () => lastScanRef.current,
    })
  }, [isListening, lastScan, clearLastScan, onMount])

  return (
    <div data-testid="scanner-test">
      <span data-testid="is-listening">{isListening ? 'true' : 'false'}</span>
      <span data-testid="last-scan">{lastScan?.code || 'null'}</span>
    </div>
  )
}

// ============================================================================
// Test Utilities
// ============================================================================

function renderComponent(props: TestComponentProps) {
  const result = render(<TestComponent {...props} />)

  return {
    unmount: result.unmount,
    rerender: (newProps: TestComponentProps) => {
      result.rerender(<TestComponent {...newProps} />)
    },
    getByTestId: (id: string) => result.container.querySelector(`[data-testid="${id}"]`),
  }
}

/**
 * Simulates a barcode scanner input by dispatching keyboard events
 * with configurable timing between keystrokes.
 */
function simulateScannerInput(
  barcode: string,
  options: {
    intervalMs?: number
    suffix?: 'Enter' | 'Tab' | null
  } = {}
) {
  const { intervalMs = 10, suffix = 'Enter' } = options

  // Type each character with scanner-speed timing
  for (let i = 0; i < barcode.length; i++) {
    const char = barcode[i]
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: char,
          bubbles: true,
        })
      )
    })
    if (i < barcode.length - 1) {
      act(() => {
        vi.advanceTimersByTime(intervalMs)
      })
    }
  }

  // Small delay before suffix
  act(() => {
    vi.advanceTimersByTime(intervalMs)
  })

  // Send suffix key
  if (suffix) {
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: suffix,
          bubbles: true,
        })
      )
    })
  }
}

/**
 * Simulates human typing with slow intervals (>50ms) that should reset the buffer.
 */
function simulateHumanTyping(text: string, intervalMs = 100) {
  for (let i = 0; i < text.length; i++) {
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: text[i],
          bubbles: true,
        })
      )
      vi.advanceTimersByTime(intervalMs)
    })
  }
}

/**
 * Creates a keyboard event with specific properties for testing input field focus.
 */
function dispatchKeyWithTarget(key: string, target: HTMLElement) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
  })
  Object.defineProperty(event, 'target', { value: target, writable: false })
  act(() => {
    window.dispatchEvent(event)
  })
}

// ============================================================================
// Test Data: Common Barcode Formats
// ============================================================================

const BARCODE_SAMPLES = {
  UPC_A: '012345678905', // 12 digits
  EAN_13: '5901234123457', // 13 digits
  CODE_128: 'ABC-12345-XYZ', // Alphanumeric with dashes
  CODE_39: '*CODE39TEST*', // With asterisks
  QR_URL: 'https://example.com/item/12345', // URL format
  SKU: 'PKL-A1B2C3D4', // Custom SKU format
  SHORT: '1234', // Minimum length (4 chars)
  TOO_SHORT: '123', // Below minimum (3 chars)
}

// ============================================================================
// Scanner Brand Timing Profiles
// ============================================================================

const SCANNER_PROFILES = {
  ZEBRA_DS2208: { name: 'Zebra DS2208', intervalMs: 5 },
  HONEYWELL_VOYAGER: { name: 'Honeywell Voyager 1202g', intervalMs: 12 },
  SOCKET_MOBILE_S700: { name: 'Socket Mobile S700', intervalMs: 15 },
  INATECK_BCST70: { name: 'Inateck BCST-70', intervalMs: 10 },
  TERA_HW0002: { name: 'Tera HW0002', intervalMs: 12 },
  NETUM_L8BL: { name: 'NetumScan L8BL', intervalMs: 18 },
}

// ============================================================================
// Tests
// ============================================================================

describe('useHardwareScanner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Scanner Brand Simulation Tests
  // ==========================================================================

  describe('Scanner Brand Compatibility', () => {
    it('should detect scans from Zebra DS2208 (5ms intervals)', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, {
        intervalMs: SCANNER_PROFILES.ZEBRA_DS2208.intervalMs,
      })

      expect(onScan).toHaveBeenCalledTimes(1)
      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({
          code: BARCODE_SAMPLES.UPC_A,
          format: 'HARDWARE',
        })
      )
    })

    it('should detect scans from Honeywell Voyager 1202g (12ms intervals)', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.EAN_13, {
        intervalMs: SCANNER_PROFILES.HONEYWELL_VOYAGER.intervalMs,
      })

      expect(onScan).toHaveBeenCalledTimes(1)
      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({
          code: BARCODE_SAMPLES.EAN_13,
          format: 'HARDWARE',
        })
      )
    })

    it('should detect scans from Socket Mobile S700 (15ms intervals)', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.CODE_128, {
        intervalMs: SCANNER_PROFILES.SOCKET_MOBILE_S700.intervalMs,
      })

      expect(onScan).toHaveBeenCalledTimes(1)
      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({
          code: BARCODE_SAMPLES.CODE_128,
          format: 'HARDWARE',
        })
      )
    })

    it('should detect scans from Inateck BCST-70 (10ms intervals)', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.SKU, {
        intervalMs: SCANNER_PROFILES.INATECK_BCST70.intervalMs,
      })

      expect(onScan).toHaveBeenCalledTimes(1)
      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({
          code: BARCODE_SAMPLES.SKU,
          format: 'HARDWARE',
        })
      )
    })

    it('should detect scans from Tera HW0002 (12ms intervals)', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.CODE_39, {
        intervalMs: SCANNER_PROFILES.TERA_HW0002.intervalMs,
      })

      expect(onScan).toHaveBeenCalledTimes(1)
      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({
          code: BARCODE_SAMPLES.CODE_39,
          format: 'HARDWARE',
        })
      )
    })

    it('should detect scans from NetumScan L8BL (18ms intervals)', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.QR_URL, {
        intervalMs: SCANNER_PROFILES.NETUM_L8BL.intervalMs,
      })

      expect(onScan).toHaveBeenCalledTimes(1)
      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({
          code: BARCODE_SAMPLES.QR_URL,
          format: 'HARDWARE',
        })
      )
    })
  })

  // ==========================================================================
  // Barcode Format Tests
  // ==========================================================================

  describe('Barcode Format Support', () => {
    it('should scan UPC-A 12-digit barcodes', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ code: '012345678905' })
      )
    })

    it('should scan EAN-13 13-digit barcodes', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.EAN_13, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ code: '5901234123457' })
      )
    })

    it('should scan Code128 alphanumeric barcodes with dashes', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.CODE_128, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'ABC-12345-XYZ' })
      )
    })

    it('should scan Code39 barcodes with asterisks', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.CODE_39, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ code: '*CODE39TEST*' })
      )
    })

    it('should scan QR codes containing URLs', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.QR_URL, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'https://example.com/item/12345' })
      )
    })

    it('should scan custom SKU formats', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.SKU, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'PKL-A1B2C3D4' })
      )
    })
  })

  // ==========================================================================
  // Timing Edge Cases
  // ==========================================================================

  describe('Timing Edge Cases', () => {
    it('should accept scans at exactly 50ms intervals (boundary)', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.SHORT, { intervalMs: 50 })

      expect(onScan).toHaveBeenCalledTimes(1)
    })

    it('should reject scans at 51ms intervals (exceeds threshold)', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 51 })

      expect(onScan).not.toHaveBeenCalled()
    })

    it('should reset buffer on slow typing then accept fast scan', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateHumanTyping('abc', 100)
      simulateScannerInput(BARCODE_SAMPLES.SHORT, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledTimes(1)
      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ code: BARCODE_SAMPLES.SHORT })
      )
    })

    it('should respect 300ms debounce between scans', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      act(() => {
        vi.advanceTimersByTime(100)
      })
      simulateScannerInput(BARCODE_SAMPLES.EAN_13, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledTimes(1)
      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ code: BARCODE_SAMPLES.UPC_A })
      )
    })

    it('should allow second scan after debounce period', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      act(() => {
        vi.advanceTimersByTime(350)
      })

      simulateScannerInput(BARCODE_SAMPLES.EAN_13, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledTimes(2)
    })

    it('should handle very fast scans (<5ms intervals)', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 2 })

      expect(onScan).toHaveBeenCalledTimes(1)
      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ code: BARCODE_SAMPLES.UPC_A })
      )
    })

    it('should ignore barcodes below minimum length', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.TOO_SHORT, { intervalMs: 10 })

      expect(onScan).not.toHaveBeenCalled()
    })

    it('should accept custom minimum length', () => {
      const onScan = vi.fn()
      renderComponent({ onScan, minLength: 3 })

      simulateScannerInput(BARCODE_SAMPLES.TOO_SHORT, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledTimes(1)
    })
  })

  // ==========================================================================
  // Input Field Handling
  // ==========================================================================

  describe('Input Field Handling', () => {
    it('should skip scanning when input element is focused', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      const input = document.createElement('input')
      document.body.appendChild(input)

      for (const char of BARCODE_SAMPLES.UPC_A) {
        dispatchKeyWithTarget(char, input)
        act(() => {
          vi.advanceTimersByTime(10)
        })
      }
      dispatchKeyWithTarget('Enter', input)

      expect(onScan).not.toHaveBeenCalled()
      document.body.removeChild(input)
    })

    it('should skip scanning when textarea is focused', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)

      for (const char of BARCODE_SAMPLES.UPC_A) {
        dispatchKeyWithTarget(char, textarea)
        act(() => {
          vi.advanceTimersByTime(10)
        })
      }
      dispatchKeyWithTarget('Enter', textarea)

      expect(onScan).not.toHaveBeenCalled()
      document.body.removeChild(textarea)
    })

    it('should skip scanning when contentEditable element is focused', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      const div = document.createElement('div')
      div.contentEditable = 'true'
      document.body.appendChild(div)

      for (const char of BARCODE_SAMPLES.UPC_A) {
        dispatchKeyWithTarget(char, div)
        act(() => {
          vi.advanceTimersByTime(10)
        })
      }
      dispatchKeyWithTarget('Enter', div)

      expect(onScan).not.toHaveBeenCalled()
      document.body.removeChild(div)
    })

    it('should work when body is focused', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledTimes(1)
    })
  })

  // ==========================================================================
  // Modifier Keys
  // ==========================================================================

  describe('Modifier Key Handling', () => {
    it('should ignore keystrokes with Ctrl modifier', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      for (const char of BARCODE_SAMPLES.SHORT) {
        act(() => {
          window.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: char,
              ctrlKey: true,
              bubbles: true,
            })
          )
          vi.advanceTimersByTime(10)
        })
      }
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        )
      })

      expect(onScan).not.toHaveBeenCalled()
    })

    it('should ignore keystrokes with Meta modifier', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      for (const char of BARCODE_SAMPLES.SHORT) {
        act(() => {
          window.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: char,
              metaKey: true,
              bubbles: true,
            })
          )
          vi.advanceTimersByTime(10)
        })
      }
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        )
      })

      expect(onScan).not.toHaveBeenCalled()
    })

    it('should ignore keystrokes with Alt modifier', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      for (const char of BARCODE_SAMPLES.SHORT) {
        act(() => {
          window.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: char,
              altKey: true,
              bubbles: true,
            })
          )
          vi.advanceTimersByTime(10)
        })
      }
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
        )
      })

      expect(onScan).not.toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Hook State Tests
  // ==========================================================================

  describe('Hook State Management', () => {
    it('should not listen when enabled is false', () => {
      const onScan = vi.fn()
      const { getByTestId } = renderComponent({ onScan, enabled: false })

      expect(getByTestId('is-listening')?.textContent).toBe('false')

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      expect(onScan).not.toHaveBeenCalled()
    })

    it('should set isListening to true when enabled', () => {
      const onScan = vi.fn()
      const { getByTestId } = renderComponent({ onScan, enabled: true })

      expect(getByTestId('is-listening')?.textContent).toBe('true')
    })

    it('should update lastScan on successful scan', () => {
      const onScan = vi.fn()
      const { getByTestId } = renderComponent({ onScan })

      expect(getByTestId('last-scan')?.textContent).toBe('null')

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      expect(getByTestId('last-scan')?.textContent).toBe(BARCODE_SAMPLES.UPC_A)
    })

    it('should clear lastScan when clearLastScan is called', () => {
      const onScan = vi.fn()
      let clearFn: (() => void) | null = null

      const { getByTestId } = renderComponent({
        onScan,
        onMount: (api) => {
          clearFn = api.clearLastScan
        },
      })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      expect(getByTestId('last-scan')?.textContent).toBe(BARCODE_SAMPLES.UPC_A)

      act(() => {
        clearFn?.()
      })

      expect(getByTestId('last-scan')?.textContent).toBe('null')
    })

    it('should remove listener on unmount', () => {
      const onScan = vi.fn()
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderComponent({ onScan })

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      removeEventListenerSpy.mockRestore()
    })

    it('should toggle listening when enabled prop changes', () => {
      const onScan = vi.fn()
      const { rerender, getByTestId } = renderComponent({
        onScan,
        enabled: true,
      })

      expect(getByTestId('is-listening')?.textContent).toBe('true')

      rerender({ onScan, enabled: false })
      expect(getByTestId('is-listening')?.textContent).toBe('false')

      rerender({ onScan, enabled: true })
      expect(getByTestId('is-listening')?.textContent).toBe('true')
    })
  })

  // ==========================================================================
  // Haptic Feedback
  // ==========================================================================

  describe('Haptic Feedback', () => {
    it('should trigger vibration on successful scan', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      expect(navigator.vibrate).toHaveBeenCalledWith(100)
    })
  })

  // ==========================================================================
  // Scan Result Format
  // ==========================================================================

  describe('Scan Result Format', () => {
    it('should include timestamp in scan result', () => {
      const onScan = vi.fn()
      const beforeScan = new Date()

      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      const afterScan = new Date()
      const scanResult = onScan.mock.calls[0][0]

      expect(scanResult.timestamp).toBeInstanceOf(Date)
      expect(scanResult.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeScan.getTime()
      )
      expect(scanResult.timestamp.getTime()).toBeLessThanOrEqual(
        afterScan.getTime()
      )
    })

    it('should set format to HARDWARE', () => {
      const onScan = vi.fn()
      renderComponent({ onScan })

      simulateScannerInput(BARCODE_SAMPLES.UPC_A, { intervalMs: 10 })

      expect(onScan).toHaveBeenCalledWith(
        expect.objectContaining({ format: 'HARDWARE' })
      )
    })
  })
})
