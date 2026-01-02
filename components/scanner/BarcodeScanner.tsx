'use client'

import { useEffect, useId } from 'react'
import { Camera, CameraOff, RefreshCw, X, Loader2 } from 'lucide-react'
import { useBarcodeScanner, ScanResult } from '@/lib/scanner/useBarcodeScanner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BarcodeScannerProps {
  onScan: (result: ScanResult) => void
  onClose?: () => void
  className?: string
  showCloseButton?: boolean
  continuous?: boolean
}

export function BarcodeScanner({
  onScan,
  onClose,
  className,
  showCloseButton = true,
  continuous = false,
}: BarcodeScannerProps) {
  const scannerId = useId().replace(/:/g, '')
  const scannerElementId = `scanner-${scannerId}`

  const {
    isScanning,
    isInitializing,
    error,
    lastScan,
    hasPermission,
    availableCameras,
    startScanning,
    stopScanning,
    switchCamera,
    clearLastScan,
    clearError,
  } = useBarcodeScanner(onScan)

  // Auto-start scanning when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      startScanning(scannerElementId)
    }, 100)

    return () => {
      clearTimeout(timer)
      stopScanning()
    }
  }, [scannerElementId, startScanning, stopScanning])

  // Auto-clear last scan in continuous mode
  useEffect(() => {
    if (continuous && lastScan) {
      const timer = setTimeout(() => {
        clearLastScan()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [continuous, lastScan, clearLastScan])

  const handleRetry = async () => {
    clearError()
    await startScanning(scannerElementId)
  }

  return (
    <div className={cn('relative flex flex-col bg-black', className)}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
        {showCloseButton && onClose ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
        ) : (
          <div className="w-10" />
        )}

        <h2 className="text-white font-semibold text-lg">Scan</h2>

        {availableCameras.length > 1 ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={switchCamera}
            className="text-white hover:bg-white/20"
            disabled={!isScanning}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Scanner viewport */}
      <div className="relative flex-1 min-h-[300px]">
        {/* Camera feed container */}
        <div
          id={scannerElementId}
          className="w-full h-full"
        />

        {/* Scanning overlay frame */}
        {isScanning && !error && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Scan target frame */}
              <div className="relative w-64 h-64">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />

                {/* Scanning line animation */}
                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-primary/50 animate-pulse" />
              </div>
            </div>

            {/* Semi-transparent overlay outside scan area */}
            <div className="absolute inset-0 bg-black/40" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, calc(50% - 128px) calc(50% - 128px), calc(50% - 128px) calc(50% + 128px), calc(50% + 128px) calc(50% + 128px), calc(50% + 128px) calc(50% - 128px), calc(50% - 128px) calc(50% - 128px))'
            }} />
          </div>
        )}

        {/* Loading state */}
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-sm">Starting camera...</p>
          </div>
        )}

        {/* Permission denied state */}
        {hasPermission === false && !isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white p-6 text-center">
            <CameraOff className="h-16 w-16 text-neutral-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
            <p className="text-sm text-neutral-400 mb-6">
              Please allow camera access to scan barcodes and QR codes.
            </p>
            <Button onClick={handleRetry} className="gap-2">
              <Camera className="h-4 w-4" />
              Allow Camera
            </Button>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-white p-6 text-center">
            <CameraOff className="h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Scanner Error</h3>
            <p className="text-sm text-neutral-400 mb-6 max-w-xs">{error}</p>
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Success flash */}
        {lastScan && (
          <div className="absolute inset-0 pointer-events-none animate-pulse">
            <div className="absolute inset-0 bg-primary/20" />
          </div>
        )}
      </div>

      {/* Footer instructions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white/80 text-center text-sm">
          {isScanning
            ? 'Point camera at a barcode or QR code'
            : isInitializing
            ? 'Initializing...'
            : 'Camera not available'}
        </p>
      </div>
    </div>
  )
}
