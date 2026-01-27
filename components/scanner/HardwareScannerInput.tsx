'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { ScanBarcode, Wifi, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'

// Pre-computed barcode widths to avoid impure function calls during render
const BARCODE_WIDTHS = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4]

interface HardwareScannerInputProps {
  isListening: boolean
  lastScan: ScanResult | null
  className?: string
  /** Ref to expose the scanner input element for useHardwareScanner */
  inputRef?: React.RefObject<HTMLInputElement | null>
  /** Called when scan is detected from the input field */
  onScanFromInput?: (code: string) => void
  /** Auto-submit after this many ms of no input (0 to disable). Default: 150ms */
  autoSubmitDelay?: number
  /** Minimum characters required before auto-submit. Default: 4 */
  minLength?: number
  /** Header actions (e.g., scanner type toggle) */
  headerActions?: React.ReactNode
}

export function HardwareScannerInput({
  isListening,
  lastScan,
  className,
  inputRef: externalInputRef,
  onScanFromInput,
  autoSubmitDelay = 150, // Auto-submit 150ms after last keystroke
  minLength = 4,
  headerActions,
}: HardwareScannerInputProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [displayedCode, setDisplayedCode] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const internalInputRef = useRef<HTMLInputElement>(null)
  const autoSubmitTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Use external ref if provided, otherwise use internal ref
  const inputRef = externalInputRef || internalInputRef

  // Process and submit the scan
  const submitScan = useCallback((code: string) => {
    const trimmed = code.trim()
    if (trimmed.length >= minLength && onScanFromInput) {
      onScanFromInput(trimmed)
      setInputValue('')
    }
  }, [minLength, onScanFromInput])

  // Focus the input field when component mounts and when listening starts
  // This is critical for Zebra DataWedge which sends keystrokes to focused element
  useEffect(() => {
    if (isListening && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isListening, inputRef])

  // Re-focus input when it loses focus (keep it ready for scanner)
  // Only auto-refocus if user didn't intentionally blur (e.g., by tapping elsewhere)
  const handleBlur = useCallback(() => {
    // Don't auto-refocus - let user tap to focus when needed
    // The scanner will still work as long as the input is focused before scanning
  }, [])

  // Handle input change (for DataWedge keyboard wedge mode)
  // Auto-submit after a delay when scanner stops typing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Clear any existing auto-submit timer
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current)
      autoSubmitTimerRef.current = null
    }

    // Set up auto-submit timer if enabled and we have enough characters
    if (autoSubmitDelay > 0 && value.trim().length >= minLength) {
      autoSubmitTimerRef.current = setTimeout(() => {
        submitScan(value)
      }, autoSubmitDelay)
    }
  }, [autoSubmitDelay, minLength, submitScan])

  // Handle Enter key to process scan immediately (cancels auto-submit timer)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      // Clear auto-submit timer since Enter was pressed
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current)
        autoSubmitTimerRef.current = null
      }

      submitScan(inputValue)
    }
  }, [inputValue, submitScan])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current)
      }
    }
  }, [])

  // Show success animation when a scan is detected
  useEffect(() => {
    if (lastScan) {
      setShowSuccess(true)
      setDisplayedCode(lastScan.code)
      setInputValue('') // Clear input after successful scan

      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [lastScan])

  // Clear displayed code after success animation
  useEffect(() => {
    if (!showSuccess && displayedCode) {
      const timer = setTimeout(() => {
        setDisplayedCode(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [showSuccess, displayedCode])

  return (
    <div
      className={cn(
        'relative flex flex-col items-center bg-neutral-100 px-8 pt-12 pb-8 overflow-y-auto',
        className
      )}
    >
      {/* Header actions (e.g., scanner type toggle) */}
      {headerActions && (
        <div className="absolute top-4 right-4 z-10">
          {headerActions}
        </div>
      )}

      {/* Main scanner icon with pulse animation */}
      <div className="relative mb-6">
        <div
          className={cn(
            'relative flex items-center justify-center w-32 h-32 rounded-full',
            'bg-white shadow-lg border-2',
            isListening ? 'border-primary' : 'border-neutral-300',
            showSuccess && 'border-green-500'
          )}
        >
          {/* Pulse rings when listening */}
          {isListening && !showSuccess && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
              <div
                className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"
                style={{ animationDelay: '0.5s' }}
              />
            </>
          )}

          {/* Icon */}
          {showSuccess ? (
            <Check className="w-16 h-16 text-green-500" />
          ) : (
            <ScanBarcode
              className={cn(
                'w-16 h-16 transition-colors',
                isListening ? 'text-primary' : 'text-neutral-400'
              )}
            />
          )}
        </div>

        {/* Connection indicator */}
        <div
          className={cn(
            'absolute -bottom-1 -right-1 flex items-center justify-center',
            'w-8 h-8 rounded-full bg-white shadow border',
            isListening ? 'border-green-500' : 'border-neutral-300'
          )}
        >
          <Wifi
            className={cn(
              'w-4 h-4',
              isListening ? 'text-green-500' : 'text-neutral-400'
            )}
          />
        </div>
      </div>

      {/* Status text */}
      <h3
        className={cn(
          'text-xl font-semibold mb-2 transition-colors',
          showSuccess
            ? 'text-green-600'
            : isListening
              ? 'text-neutral-900'
              : 'text-neutral-500'
        )}
      >
        {showSuccess ? 'Scanned!' : isListening ? 'Ready to Scan' : 'Scanner Inactive'}
      </h3>

      {/* Scanned code display */}
      {displayedCode && (
        <div
          className={cn(
            'mb-4 px-4 py-2 bg-white rounded-lg shadow-sm border',
            'font-mono text-sm text-neutral-700',
            'transition-all duration-300',
            showSuccess ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
        >
          {displayedCode}
        </div>
      )}

      {/* Scanner input field for DataWedge/Zebra devices */}
      <div className="w-full max-w-xs mb-4">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          inputMode="none"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Tap to focus, then scan"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
          className={cn(
            'w-full px-4 py-3 text-center text-lg font-mono',
            'border-2 rounded-lg bg-white',
            'focus:outline-none transition-colors',
            isListening
              ? 'border-primary focus:border-primary focus:ring-2 focus:ring-primary/20'
              : 'border-neutral-300',
            showSuccess && 'border-green-500'
          )}
          aria-label="Scanner input field"
        />
        <p className="text-xs text-neutral-400 text-center mt-1">
          Tap once to focus, then scan continuously
        </p>
      </div>

      {/* Instructions */}
      <p className="text-neutral-500 text-center max-w-xs">
        {isListening
          ? 'Press the scan button on your device'
          : 'Scanner is not active'}
      </p>

      {/* Visual barcode decoration */}
      <div className="mt-8 flex gap-1 opacity-20">
        {BARCODE_WIDTHS.map((width, i) => (
          <div
            key={i}
            className="bg-neutral-900 rounded-sm"
            style={{
              width,
              height: 40,
            }}
          />
        ))}
      </div>
    </div>
  )
}
