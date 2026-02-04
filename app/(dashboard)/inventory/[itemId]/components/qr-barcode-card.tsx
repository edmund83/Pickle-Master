'use client'

import { useState, useEffect } from 'react'
import { QrCode, Barcode, Loader2, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateQRCode, formatLabelId } from '@/lib/labels/barcode'
import { generateScannableBarcode, generateItemBarcode } from '@/lib/labels/barcode-generator'
import { ItemDetailCard } from './item-detail-card'
import { cn } from '@/lib/utils'

interface QRBarcodeCardProps {
  itemId: string
  itemName: string
  existingBarcode?: string | null
  onPrintLabel?: () => void
}

type CodeType = 'qr' | 'barcode'

export default function QRBarcodeCard({
  itemId,
  itemName,
  existingBarcode,
  onPrintLabel,
}: QRBarcodeCardProps) {
  const [codeType, setCodeType] = useState<CodeType>('qr')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const labelId = formatLabelId(itemId)
  const barcodeData = existingBarcode || generateItemBarcode(itemId)

  useEffect(() => {
    async function generateCodes() {
      setLoading(true)
      try {
        // Generate QR code
        const qrUrl = await generateQRCode(labelId, 120)
        setQrCodeUrl(qrUrl)

        // Generate barcode
        const bcUrl = await generateScannableBarcode(barcodeData, 'code128', {
          width: 200,
          height: 60,
          includeText: true,
          scale: 2,
        })
        setBarcodeUrl(bcUrl)
      } catch (error) {
        console.error('Failed to generate codes:', error)
      } finally {
        setLoading(false)
      }
    }

    generateCodes()
  }, [labelId, barcodeData])

  return (
    <ItemDetailCard title="QR & Barcode" icon={<QrCode className="h-5 w-5" />}>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Toggle */}
          <div className="flex items-center justify-center">
            <div className="inline-flex rounded-lg border border-neutral-200 p-1 bg-neutral-50">
              <button
                type="button"
                onClick={() => setCodeType('qr')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  codeType === 'qr'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                <QrCode className="h-4 w-4" />
                QR Code
              </button>
              <button
                type="button"
                onClick={() => setCodeType('barcode')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  codeType === 'barcode'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                <Barcode className="h-4 w-4" />
                Barcode
              </button>
            </div>
          </div>

          {/* Code Display */}
          <div className="flex flex-col items-center">
            <div className="rounded-lg border border-neutral-200 bg-white p-4 w-full">
              <p className="text-sm text-neutral-700 font-medium text-center mb-3 truncate">
                {itemName}
              </p>

              {codeType === 'qr' ? (
                <div className="flex flex-col items-center">
                  {qrCodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28" />
                  ) : (
                    <div className="w-28 h-28 bg-neutral-100 rounded flex items-center justify-center">
                      <QrCode className="h-10 w-10 text-neutral-300" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {barcodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={barcodeUrl}
                      alt="Barcode"
                      className="w-full max-w-[200px] h-auto object-contain"
                    />
                  ) : (
                    <div className="w-full h-16 bg-neutral-100 rounded flex items-center justify-center">
                      <Barcode className="h-8 w-8 text-neutral-300" />
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] font-mono text-neutral-500 text-center mt-2">
                {labelId}
              </p>
            </div>
          </div>

          {/* Scan Info */}
          <div className="pt-2 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 text-center">
              {codeType === 'qr'
                ? 'Scan with any camera app'
                : 'Scan with any barcode scanner'}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full" onClick={onPrintLabel}>
              <Printer className="mr-2 h-4 w-4" />
              Print Label
            </Button>
          </div>
        </div>
      )}
    </ItemDetailCard>
  )
}
