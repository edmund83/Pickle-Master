'use client'

import { useState, useEffect } from 'react'
import { QrCode, Barcode, Loader2, Printer, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateQRCode, formatLabelId } from '@/lib/labels/barcode'
import { generateScannableBarcode, generateItemBarcode } from '@/lib/labels/barcode-generator'
import { ItemDetailCard } from './item-detail-card'

interface QRBarcodeCardProps {
  itemId: string
  itemName: string
  existingBarcode?: string | null
  onPrintLabel?: () => void
  onGenerateBarcode?: () => void
  isGenerating?: boolean
}

export default function QRBarcodeCard({
  itemId,
  itemName,
  existingBarcode,
  onPrintLabel,
  onGenerateBarcode,
  isGenerating = false
}: QRBarcodeCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const labelId = formatLabelId(itemId)
  const hasExistingBarcode = !!existingBarcode
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
          height: 50,
          includeText: false,
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
          {/* QR Code Section */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              {qrCodeUrl ? (
                <div className="rounded-lg border border-neutral-200 bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-neutral-300" />
                </div>
              )}
              <span className="text-[10px] font-mono text-neutral-500 mt-1">QR Code</span>
            </div>

            {/* Barcode Section */}
            <div className="flex-1 flex flex-col items-center">
              <div className="rounded-lg border border-neutral-200 bg-white p-3 w-full">
                <p className="text-xs text-neutral-600 font-medium text-center mb-2 truncate">
                  {itemName}
                </p>
                {barcodeUrl ? (
                  <div className="flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={barcodeUrl}
                      alt="Barcode"
                      className="w-full max-w-[180px] h-12 object-contain"
                    />
                    <div className="w-full max-w-[180px] h-px bg-red-400 mt-1" />
                  </div>
                ) : (
                  <div className="w-full h-12 bg-neutral-50 rounded flex items-center justify-center">
                    <Barcode className="h-6 w-6 text-neutral-300" />
                  </div>
                )}
                <p className="text-[10px] font-mono text-neutral-500 text-center mt-1">
                  {labelId}
                </p>
              </div>
            </div>
          </div>

          {/* Scan Info */}
          <div className="pt-2 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 text-center">
              Scan with any barcode scanner or camera app
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onPrintLabel}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Label
            </Button>
            {!hasExistingBarcode && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onGenerateBarcode}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Barcode'}
              </Button>
            )}
            {hasExistingBarcode && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onGenerateBarcode}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
            )}
          </div>
        </div>
      )}
    </ItemDetailCard>
  )
}
