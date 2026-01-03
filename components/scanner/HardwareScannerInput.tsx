'use client'

import { useEffect, useState } from 'react'
import { ScanBarcode, Wifi, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScanResult } from '@/lib/scanner/useBarcodeScanner'

// Pre-computed barcode widths to avoid impure function calls during render
const BARCODE_WIDTHS = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4]

interface HardwareScannerInputProps {
  isListening: boolean
  lastScan: ScanResult | null
  className?: string
}

export function HardwareScannerInput({
  isListening,
  lastScan,
  className,
}: HardwareScannerInputProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [displayedCode, setDisplayedCode] = useState<string | null>(null)

  // Show success animation when a scan is detected
  useEffect(() => {
    if (lastScan) {
      setShowSuccess(true)
      setDisplayedCode(lastScan.code)

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
        'relative flex flex-col items-center justify-center bg-neutral-100 p-8',
        className
      )}
    >
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

      {/* Instructions */}
      <p className="text-neutral-500 text-center max-w-xs">
        {isListening
          ? 'Use your Bluetooth or USB barcode scanner to scan items'
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
