'use client'

import { useState, useEffect } from 'react'
import {
  X,
  QrCode,
  Barcode,
  Info,
  Check,
  Download,
  Printer,
  Loader2,
  Image as ImageIcon,
  Building2,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateQRCode, formatLabelId, PAPER_SIZES } from '@/lib/labels/barcode'
import {
  generateScannableBarcode,
  generateItemBarcode,
  getFormatDisplayName,
  type BarcodeFormat,
  validateBarcodeData,
  isNumericOnlyFormat,
} from '@/lib/labels/barcode-generator'
import { cn } from '@/lib/utils'
import {
  generateLabelPDF,
  calculateLabelsPerSheet,
  getCompatibleProducts,
  type DetailField,
  type LabelPDFConfig,
  type LabelSize,
  type PaperSize,
} from '@/lib/labels/pdf-generator'
import DetailsSelector from './DetailsSelector'

export interface LabelWizardItem {
  id: string
  name: string
  sku?: string | null
  barcode?: string | null
  price?: number | null
  cost_price?: number | null
  currency?: string | null
  quantity?: number | null
  min_quantity?: number | null
  notes?: string | null
  description?: string | null
  image_urls?: string[] | null
  tags?: Array<{ id: string; name: string; color: string }>
}

interface LabelWizardProps {
  item: LabelWizardItem
  tenantLogo?: string | null
  userEmail?: string | null
  onClose: () => void
  onSave?: () => void
}

type LabelType = 'qr' | 'barcode'
type BarcodeSource = 'existing' | 'auto' | 'manual'
type QuantityMode = 'custom' | 'full_sheet'
type OutputMode = 'pdf' | 'printer'
type LabelSizeInfo = { name: string; width: number; height: number }
type BarcodeSymbology = 'auto' | Exclude<BarcodeFormat, 'qrcode'>

// Helper to check if a label size is for label printers (direct print)
function isLabelPrinterSize(labelSize: LabelSize): boolean {
  return labelSize.startsWith('lp_')
}

interface LabelConfig {
  output: OutputMode
  type: LabelType
  paperSize: PaperSize
  labelSize: LabelSize
  selectedDetails: DetailField[]
  photoUrl: string | null      // Selected/uploaded photo URL
  logoUrl: string | null       // Selected/uploaded logo URL
  note: string                 // Note text (empty string = no note)
  barcodeSource: BarcodeSource
  barcodeFormat: BarcodeSymbology
  manualBarcode: string
  quantity: number
  quantityMode: QuantityMode
  startPosition: number
  chooseStartPosition: boolean
  includeInstructions: boolean
  sendEmail: boolean
  email: string
}

// Simplified QR label sizes (5 sizes)
const QR_LABEL_SIZES: Record<string, LabelSizeInfo> = {
  large: { name: 'Large', width: 4, height: 6 },
  medium: { name: 'Medium', width: 4, height: 2.25 },
  medium_long: { name: 'Medium long', width: 4, height: 1 },
  medium_tall: { name: 'Medium tall', width: 2, height: 4 },
  small: { name: 'Small', width: 2, height: 1 },
}

// Simplified barcode label size (1 size only)
const BARCODE_SHEET_LABEL_SIZES: Record<string, LabelSizeInfo> = {
  barcode_medium: { name: 'Medium', width: 2, height: 0.75 },
}

// Label printer sizes (same as QR sizes + barcode)
const LABEL_PRINTER_LABEL_SIZES: Record<string, LabelSizeInfo> = {
  lp_large: { name: 'Large', width: 4, height: 6 },
  lp_medium: { name: 'Medium', width: 4, height: 2.25 },
  lp_medium_long: { name: 'Medium long', width: 4, height: 1 },
  lp_medium_tall: { name: 'Medium tall', width: 2, height: 4 },
  lp_small: { name: 'Small', width: 2, height: 1 },
  lp_barcode: { name: 'Barcode', width: 2, height: 0.75 },
}

// Define which features are available for each label size
const LABEL_FEATURES: Record<string, { photo: boolean; logo: boolean; maxDetails: number; note: boolean }> = {
  // QR sheet sizes
  large: { photo: true, logo: true, maxDetails: 3, note: true },
  medium: { photo: false, logo: false, maxDetails: 2, note: false },
  medium_long: { photo: false, logo: false, maxDetails: 1, note: false },
  medium_tall: { photo: true, logo: false, maxDetails: 2, note: true },
  small: { photo: false, logo: false, maxDetails: 0, note: false },
  // Barcode sheet size
  barcode_medium: { photo: false, logo: false, maxDetails: 1, note: false },
  // Label printer sizes (same features as sheet versions)
  lp_large: { photo: true, logo: true, maxDetails: 3, note: true },
  lp_medium: { photo: false, logo: false, maxDetails: 2, note: false },
  lp_medium_long: { photo: false, logo: false, maxDetails: 1, note: false },
  lp_medium_tall: { photo: true, logo: false, maxDetails: 2, note: true },
  lp_small: { photo: false, logo: false, maxDetails: 0, note: false },
  lp_barcode: { photo: false, logo: false, maxDetails: 1, note: false },
}

export default function LabelWizard({ item, tenantLogo, userEmail, onClose, onSave }: LabelWizardProps) {
  const [mobileView, setMobileView] = useState<'settings' | 'preview'>('settings')
  const [config, setConfig] = useState<LabelConfig>({
    output: 'pdf',
    type: 'qr',
    paperSize: 'letter',
    labelSize: 'large',
    selectedDetails: ['price'],
    photoUrl: item.image_urls?.[0] || null,  // Pre-fill with first item photo
    logoUrl: tenantLogo || null,              // Pre-fill with tenant logo
    note: '',
    barcodeSource: item.barcode ? 'existing' : 'auto',
    barcodeFormat: 'auto',
    manualBarcode: '',
    quantity: calculateLabelsPerSheet('letter', 'large').total,
    quantityMode: 'full_sheet',
    startPosition: 1,
    chooseStartPosition: false,
    includeInstructions: false,
    sendEmail: false,
    email: userEmail || '',
  })

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [barcodeUrl, setBarcodeUrl] = useState<string>('')
  const [barcodeError, setBarcodeError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const labelId = formatLabelId(item.id)

  function getBarcodeCandidateValue(): string {
    if (config.barcodeSource === 'existing' && item.barcode) return item.barcode
    if (config.barcodeSource === 'manual') return config.manualBarcode
    return generateItemBarcode(item.id)
  }

  function detectBarcodeFormat(value: string): Exclude<BarcodeFormat, 'qrcode'> {
    const trimmed = value.trim()
    if (trimmed === '') return 'code128'

    if (/\(\d{2,4}\)/.test(trimmed)) return 'gs1-128'

    const digits = trimmed.replace(/\D/g, '')
    if (digits.length === 14) return 'itf14'
    if (digits.length === 13) return 'ean13'
    if (digits.length === 12 || digits.length === 11) return 'upca'
    if (digits.length === 8 || digits.length === 7) return 'ean8'

    return 'code128'
  }

  function resolveBarcodeFormat(value: string): Exclude<BarcodeFormat, 'qrcode'> {
    return config.barcodeFormat === 'auto' ? detectBarcodeFormat(value) : config.barcodeFormat
  }

  function normalizeBarcodeValue(value: string, format: Exclude<BarcodeFormat, 'qrcode'>): string {
    if (format === 'code39') return value.trim().toUpperCase()
    if (format === 'ean13' || format === 'ean8' || format === 'upca' || format === 'itf14') {
      return value.replace(/\D/g, '')
    }
    if (format === 'gs1-128') return value.trim().replace(/\s+/g, '')
    return value.trim()
  }

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Generate QR code preview
  useEffect(() => {
    async function loadQR() {
      try {
        const url = await generateQRCode(labelId, 128)
        setQrCodeUrl(url)
      } catch (e) {
        console.error('QR generation failed:', e)
      }
    }
    if (config.type === 'qr') {
      loadQR()
    }
  }, [labelId, config.type])

  // Generate barcode preview
  useEffect(() => {
    async function loadBarcode() {
      try {
        const candidate = getBarcodeCandidateValue()

        if (config.barcodeSource === 'manual' && candidate.trim() === '') {
          setBarcodeUrl('')
          setBarcodeError(null)
          return
        }

        const format = resolveBarcodeFormat(candidate)
        const normalizedValue = normalizeBarcodeValue(candidate, format)
        const validation = validateBarcodeData(normalizedValue, format)
        if (!validation.valid) {
          setBarcodeUrl('')
          setBarcodeError(validation.error || 'Invalid barcode')
          return
        }

        const includeText = config.output !== 'printer'
        const url = await generateScannableBarcode(normalizedValue, format, {
          width: 240,
          height: 80,
          includeText,
        })
        setBarcodeError(null)
        setBarcodeUrl(url)
      } catch (e) {
        console.error('Barcode generation failed:', e)
        setBarcodeError('Failed to generate barcode preview')
      }
    }
    if (config.type === 'barcode') {
      loadBarcode()
    } else {
      setBarcodeError(null)
    }
  }, [
    config.type,
    config.output,
    config.barcodeSource,
    config.barcodeFormat,
    config.manualBarcode,
    item.barcode,
    item.id,
  ])

  // Get current label sizes based on output and type
  const labelSizes =
    config.output === 'printer'
      ? LABEL_PRINTER_LABEL_SIZES
      : config.type === 'qr'
        ? QR_LABEL_SIZES
        : BARCODE_SHEET_LABEL_SIZES
  const defaultLabelSize: LabelSize =
    config.output === 'printer' ? 'lp_medium' : config.type === 'qr' ? 'large' : 'barcode_medium'
  const currentLabelSize =
    labelSizes[config.labelSize as keyof typeof labelSizes] || labelSizes[defaultLabelSize]
  const labelsPerSheet = calculateLabelsPerSheet(config.paperSize, config.labelSize)
  const barcodeCandidate = config.type === 'barcode' ? getBarcodeCandidateValue() : ''
  const autoDetectedBarcodeFormat =
    config.type === 'barcode' && config.barcodeFormat === 'auto' && barcodeCandidate.trim() !== ''
      ? detectBarcodeFormat(barcodeCandidate)
      : null
  const compatibleProducts = getCompatibleProducts(config.labelSize)
  const labelFeatures = LABEL_FEATURES[config.labelSize]

  // Ensure label size stays valid for the chosen output/type
  useEffect(() => {
    const allowed =
      config.output === 'printer'
        ? LABEL_PRINTER_LABEL_SIZES
        : config.type === 'qr'
          ? QR_LABEL_SIZES
          : BARCODE_SHEET_LABEL_SIZES

    if (!allowed[config.labelSize as keyof typeof allowed]) {
      const fallback: LabelSize =
        config.output === 'printer'
          ? config.type === 'qr'
            ? 'lp_large'
            : 'lp_barcode'
          : config.type === 'qr'
            ? 'large'
            : 'barcode_medium'
      setConfig((c) => ({ ...c, labelSize: fallback }))
    }
  }, [config.type, config.output, config.labelSize])

  // Auto-set paper size for label printer sizes
  useEffect(() => {
    if (isLabelPrinterSize(config.labelSize)) {
      setConfig((c) => ({ ...c, paperSize: 'label_printer' }))
    } else if (config.paperSize === 'label_printer') {
      // Default to letter when switching from label printer to PDF
      setConfig((c) => ({ ...c, paperSize: 'letter' }))
    }
  }, [config.labelSize, config.paperSize])

  // Reset features when switching to smaller label sizes
  useEffect(() => {
    const features = LABEL_FEATURES[config.labelSize]
    setConfig((c) => ({
      ...c,
      photoUrl: features.photo ? c.photoUrl : null,
      logoUrl: features.logo ? c.logoUrl : null,
      note: features.note ? c.note : '',
      selectedDetails: c.selectedDetails.slice(0, features.maxDetails),
    }))
  }, [config.labelSize])

  // Handle quantity mode change
  useEffect(() => {
    if (config.quantityMode === 'full_sheet') {
      setConfig((c) => ({ ...c, quantity: labelsPerSheet.total }))
    }
  }, [config.quantityMode, labelsPerSheet.total])

  // Auto-switch barcode source when format doesn't support auto-generate
  useEffect(() => {
    if (config.type !== 'barcode') return

    const formatDisallowsAuto =
      config.barcodeFormat !== 'auto' &&
      (isNumericOnlyFormat(config.barcodeFormat) || config.barcodeFormat === 'gs1-128')

    if (formatDisallowsAuto && config.barcodeSource === 'auto') {
      // Switch to existing barcode if available, otherwise manual
      setConfig((c) => ({
        ...c,
        barcodeSource: item.barcode ? 'existing' : 'manual',
      }))
    }
  }, [config.type, config.barcodeFormat, config.barcodeSource, item.barcode])

  async function handleGeneratePDF(): Promise<Blob | null> {
    setError(null)

    try {
      // Prepare barcode/QR data
      let codeDataUrl: string
      if (config.type === 'qr') {
        codeDataUrl = await generateQRCode(labelId, 256)
      } else {
        const candidate = getBarcodeCandidateValue()

        if (config.barcodeSource === 'manual' && candidate.trim() === '') {
          setError('Please enter a barcode value')
          return null
        }

        const format = resolveBarcodeFormat(candidate)
        const normalizedValue = normalizeBarcodeValue(candidate, format)
        const validation = validateBarcodeData(normalizedValue, format)
        if (!validation.valid) {
          setError(validation.error || 'Invalid barcode')
          return null
        }

        const includeText = config.output !== 'printer'
        codeDataUrl = await generateScannableBarcode(normalizedValue, format, {
          width: 400,
          height: 120,
          includeText,
        })
      }

      // Prepare photo if selected
      let photoDataUrl: string | null = null
      if (config.photoUrl) {
        try {
          // Check if it's already a data URL
          if (config.photoUrl.startsWith('data:')) {
            photoDataUrl = config.photoUrl
          } else {
            const response = await fetch(config.photoUrl)
            const blob = await response.blob()
            photoDataUrl = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(blob)
            })
          }
        } catch (e) {
          console.warn('Failed to load photo:', e)
        }
      }

      // Prepare logo if selected
      let logoDataUrl: string | null = null
      if (config.logoUrl) {
        try {
          if (config.logoUrl.startsWith('data:')) {
            logoDataUrl = config.logoUrl
          } else {
            const response = await fetch(config.logoUrl)
            const blob = await response.blob()
            logoDataUrl = await new Promise((resolve) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.readAsDataURL(blob)
            })
          }
        } catch (e) {
          console.warn('Failed to load logo:', e)
        }
      }

      const pdfConfig: LabelPDFConfig = {
        labelType: config.type,
        paperSize: config.paperSize,
        labelSize: config.labelSize,
        quantity: config.quantity,
        startPosition: config.startPosition,
        includePhoto: !!config.photoUrl,
        includeLogo: !!config.logoUrl,
        includeNote: !!config.note,
        note: config.note,
        selectedDetails: config.selectedDetails,
      }

      const labelItem = {
        id: item.id,
        name: item.name,
        sku: item.sku,
        barcode: item.barcode,
        price: item.price,
        currency: item.currency,
        quantity: item.quantity,
        min_quantity: item.min_quantity,
        notes: item.notes,
        image_url: config.photoUrl || item.image_urls?.[0],
        tags: item.tags?.map((t) => ({ name: t.name, color: t.color })),
      }

      const pdfBlob = await generateLabelPDF(
        [labelItem],
        pdfConfig,
        [codeDataUrl],
        photoDataUrl ? [photoDataUrl] : undefined,
        logoDataUrl || undefined
      )

      return pdfBlob
    } catch (e) {
      console.error('PDF generation failed:', e)
      setError('Failed to generate PDF. Please try again.')
      return null
    }
  }

  async function handleDownload() {
    setGenerating(true)
    const blob = await handleGeneratePDF()
    if (blob) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `label-${item.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    setGenerating(false)
  }

  async function handlePrintAndSave() {
    setGenerating(true)
    const blob = await handleGeneratePDF()

    if (blob) {
      // Open print dialog
      const url = URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }

      // Send email if enabled
      if (config.sendEmail && config.email) {
        try {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const result = reader.result as string
              resolve(result.split(',')[1]) // Remove data URL prefix
            }
            reader.readAsDataURL(blob)
          })

          const response = await fetch('/api/labels/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: config.email,
              itemName: item.name,
              pdfBase64: base64,
            }),
          })

          if (!response.ok) {
            console.error('Failed to send email')
          }
        } catch (e) {
          console.error('Email send failed:', e)
        }
      }

      onSave?.()
      URL.revokeObjectURL(url)
    }

    setGenerating(false)
  }

  const firstPhotoUrl = item.image_urls?.[0]

  function handleOutputChange(nextOutput: OutputMode) {
    setConfig((current) => {
      if (current.output === nextOutput) return current

      if (nextOutput === 'printer') {
        const lpSize: LabelSize = current.type === 'qr' ? 'lp_large' : 'lp_barcode'
        return {
          ...current,
          output: 'printer',
          labelSize: lpSize,
          paperSize: 'label_printer',
          quantity: 1,
          quantityMode: 'custom',
          chooseStartPosition: false,
          startPosition: 1,
        }
      }

      // Switching to PDF - use appropriate defaults
      const allowedSheetSizes = current.type === 'qr' ? QR_LABEL_SIZES : BARCODE_SHEET_LABEL_SIZES
      const nextLabelSize: LabelSize = allowedSheetSizes[current.labelSize]
        ? (current.labelSize as LabelSize)
        : current.type === 'qr'
          ? 'large'
          : 'barcode_medium'
      const nextPaperSize = 'letter'
      const fullSheetQuantity = calculateLabelsPerSheet(nextPaperSize, nextLabelSize).total

      return {
        ...current,
        output: 'pdf',
        paperSize: nextPaperSize,
        labelSize: nextLabelSize,
        quantityMode: 'full_sheet',
        quantity: fullSheetQuantity,
        chooseStartPosition: false,
        startPosition: 1,
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-neutral-900/50 backdrop-blur-sm',
          generating && 'cursor-not-allowed'
        )}
        onClick={generating ? undefined : onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create label"
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 shrink-0">
              {firstPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={firstPhotoUrl} alt={item.name} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-4 w-4 text-neutral-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Label Studio</p>
              <h2 className="text-lg font-semibold text-neutral-900 truncate">{item.name}</h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                {item.sku ? (
                  <>
                    SKU {item.sku}
                    <span className="mx-1.5 text-neutral-300">•</span>
                  </>
                ) : null}
                <span className="font-mono">{labelId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              disabled={generating}
              className={cn(
                'p-2 text-neutral-400 transition-colors',
                generating ? 'cursor-not-allowed opacity-50' : 'hover:text-neutral-600'
              )}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile: toggle between settings and preview */}
        <div className="lg:hidden flex items-center justify-between gap-3 px-4 py-2 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center rounded-full bg-white p-1 border border-neutral-200">
            <button
              type="button"
              onClick={() => setMobileView('settings')}
              aria-pressed={mobileView === 'settings'}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                mobileView === 'settings'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => setMobileView('preview')}
              aria-pressed={mobileView === 'preview'}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                mobileView === 'preview'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] overflow-hidden">
          {/* Preview Panel */}
          <div
            className={cn(
              'relative overflow-auto bg-neutral-50',
              mobileView === 'preview' ? 'block' : 'hidden lg:block'
            )}
          >
	            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.045)_1px,transparent_0)] [background-size:18px_18px]" />
	            <div className="relative flex min-h-full flex-col items-center justify-center p-6 lg:p-10">
	              <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-600">
	                <span className="rounded-full border border-neutral-200 bg-white/80 px-2 py-1">
	                  {config.output === 'printer' ? 'Label printer' : 'PDF sheets'}
	                </span>
	                <span className="rounded-full border border-neutral-200 bg-white/80 px-2 py-1">
	                  {currentLabelSize.name.split(' (')[0] || currentLabelSize.name}
	                </span>
                <span className="rounded-full border border-neutral-200 bg-white/80 px-2 py-1">
                  {currentLabelSize.width}in × {currentLabelSize.height}in
                </span>
                {!isLabelPrinterSize(config.labelSize) && (
                  <span className="rounded-full border border-neutral-200 bg-white/80 px-2 py-1">
                    {labelsPerSheet.total}/sheet
                  </span>
                )}
              </div>

              <div className="w-full max-w-[560px] rounded-3xl border border-neutral-200 bg-white/70 p-6 shadow-sm">
                <div className="flex items-center justify-center">
                  {isLabelPrinterSize(config.labelSize) ? (
                    <LabelPrinterPreview
                      item={item}
                      type={config.type}
                      codeUrl={config.type === 'qr' ? qrCodeUrl : barcodeUrl}
                      labelId={labelId}
                    />
                  ) : config.labelSize === 'large' ? (
                    <LargeLabelPreview item={item} config={config} codeUrl={qrCodeUrl} labelId={labelId} />
                  ) : config.labelSize === 'medium' ? (
                    <MediumLabelPreview item={item} config={config} codeUrl={qrCodeUrl} labelId={labelId} />
                  ) : config.labelSize === 'medium_long' ? (
                    <MediumLongLabelPreview item={item} config={config} codeUrl={qrCodeUrl} labelId={labelId} />
                  ) : config.labelSize === 'medium_tall' ? (
                    <MediumTallLabelPreview item={item} config={config} codeUrl={qrCodeUrl} labelId={labelId} />
                  ) : config.labelSize === 'small' ? (
                    <SmallLabelPreview item={item} codeUrl={qrCodeUrl} labelId={labelId} />
                  ) : config.labelSize === 'barcode_medium' ? (
                    <BarcodeMediumLabelPreview item={item} codeUrl={barcodeUrl} labelId={labelId} />
                  ) : (
                    <SmallLabelPreview item={item} codeUrl={qrCodeUrl} labelId={labelId} />
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs text-neutral-500">Preview updates as you change settings.</p>
            </div>
          </div>

          {/* Settings Panel */}
          <div
            className={cn(
              'overflow-y-auto border-t border-neutral-200 bg-white p-6 pb-24 lg:border-t-0 lg:border-l space-y-4',
              mobileView === 'settings' ? 'block' : 'hidden lg:block'
            )}
          >
            {/* Section 1: Output Destination */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Output</h3>

              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">Where are you printing?</p>
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard
                    title="Paper sheet"
                    description={`Full sheet (${labelsPerSheet.total} labels)`}
                    icon={<Download className="h-4 w-4" />}
                    selected={config.output === 'pdf'}
                    disabled={generating}
                    onClick={() => handleOutputChange('pdf')}
                  />
                  <ChoiceCard
                    title="Label printer"
                    description="Direct print"
                    icon={<Printer className="h-4 w-4" />}
                    selected={config.output === 'printer'}
                    disabled={generating}
                    onClick={() => handleOutputChange('printer')}
                  />
                </div>
              </div>

              {config.output === 'pdf' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700">Paper size</p>
                  <div className="grid grid-cols-2 gap-2">
                    <ChoiceCard
                      title="US Letter"
                      description="8.5in × 11in"
                      selected={config.paperSize === 'letter'}
                      disabled={generating}
                      onClick={() => {
                        const newTotal = calculateLabelsPerSheet('letter', config.labelSize).total
                        setConfig({
                          ...config,
                          paperSize: 'letter',
                          quantity: config.quantityMode === 'full_sheet' ? newTotal : config.quantity,
                        })
                      }}
                    />
                    <ChoiceCard
                      title="A4"
                      description="210mm × 297mm"
                      selected={config.paperSize === 'a4'}
                      disabled={generating}
                      onClick={() => {
                        const newTotal = calculateLabelsPerSheet('a4', config.labelSize).total
                        setConfig({
                          ...config,
                          paperSize: 'a4',
                          quantity: config.quantityMode === 'full_sheet' ? newTotal : config.quantity,
                        })
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Label Type */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Label Type</h3>

              <div className="grid grid-cols-2 gap-2">
                <ChoiceCard
                  title="QR code"
                  description="Best for phone scanning"
                  icon={<QrCode className="h-4 w-4" />}
                  selected={config.type === 'qr'}
                  onClick={() => setConfig({ ...config, type: 'qr' })}
                />
                <ChoiceCard
                  title="Barcode"
                  description="Great for laser scanners"
                  icon={<Barcode className="h-4 w-4" />}
                  selected={config.type === 'barcode'}
                  onClick={() => setConfig({ ...config, type: 'barcode' })}
                />
              </div>

              {/* Barcode format - shown when barcode type is selected */}
              {config.type === 'barcode' && (
                <div className="space-y-2 pt-2 border-t border-neutral-200">
                  <p className="text-sm font-medium text-neutral-700">Barcode format</p>
                  <select
                    value={config.barcodeFormat}
                    onChange={(e) =>
                      setConfig({ ...config, barcodeFormat: e.target.value as BarcodeSymbology })
                    }
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="auto">Auto (recommended)</option>
                    <option value="upca">{getFormatDisplayName('upca')}</option>
                    <option value="ean13">{getFormatDisplayName('ean13')}</option>
                    <option value="ean8">{getFormatDisplayName('ean8')}</option>
                    <option value="itf14">{getFormatDisplayName('itf14')}</option>
                    <option value="gs1-128">{getFormatDisplayName('gs1-128')}</option>
                    <option value="code128">{getFormatDisplayName('code128')}</option>
                    <option value="code39">{getFormatDisplayName('code39')}</option>
                  </select>
                  <p className="text-xs text-neutral-500">
                    {config.barcodeFormat === 'auto'
                      ? 'Detects UPC/EAN/ITF for numeric codes; otherwise uses Code 128.'
                      : config.barcodeFormat === 'gs1-128'
                        ? 'Use application identifiers like (01)…, (17)…'
                        : config.barcodeFormat === 'itf14'
                          ? '13–14 digits (case/carton).'
                          : config.barcodeFormat === 'ean8'
                            ? '7–8 digits (retail, compact).'
                            : config.barcodeFormat === 'ean13'
                              ? '12–13 digits (global retail).'
                              : config.barcodeFormat === 'upca'
                                ? '11–12 digits (US retail).'
                                : config.barcodeFormat === 'code39'
                                  ? 'Uppercase letters, numbers, and -. $/+% only.'
                                  : 'Best for alphanumeric SKUs.'}
                  </p>
                  {autoDetectedBarcodeFormat && (
                    <p className="text-xs text-neutral-500">
                      Auto selected:{' '}
                      <span className="font-medium text-neutral-700">
                        {getFormatDisplayName(autoDetectedBarcodeFormat)}
                      </span>
                    </p>
                  )}
                  {barcodeError && <p className="text-xs text-red-600">{barcodeError}</p>}
                </div>
              )}
            </div>

            {/* Section 3: Label Size */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Label Size</h3>

              <select
                value={config.labelSize}
                onChange={(e) => {
                  const sizeKey = e.target.value as LabelSize
                  setConfig({ ...config, labelSize: sizeKey })
                }}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {Object.entries(labelSizes).map(([key, size]) => {
                  const sizeKey = key as LabelSize
                  const perSheet = calculateLabelsPerSheet(config.paperSize, sizeKey).total
                  const products = getCompatibleProducts(sizeKey)
                  const productText = products.length > 0 ? ` · ${products.join(', ')}` : ''

                  return (
                    <option key={key} value={key}>
                      {size.name.split(' (')[0] || size.name} · {size.width}in × {size.height}in · {perSheet}/sheet{productText}
                    </option>
                  )
                })}
              </select>

              {/* Compatibility info */}
              {compatibleProducts.length > 0 && (
                <p className="text-xs text-neutral-500">
                  Works with <span className="font-medium text-neutral-700">{compatibleProducts.join(', ')}</span>
                </p>
              )}

              {isLabelPrinterSize(config.labelSize) && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Check your label printer for Direct PDF print support.</span>
                </div>
              )}
            </div>

            {/* Section 4: Barcode Data (conditional) */}
            {config.type === 'barcode' && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Barcode Data</h3>

                {(() => {
                  const autoGenerateDisabled =
                    config.barcodeFormat !== 'auto' &&
                    (isNumericOnlyFormat(config.barcodeFormat) || config.barcodeFormat === 'gs1-128')
                  return (
                    <div className="space-y-2">
                      {item.barcode && (
                        <ChoiceCard
                          title="Use existing barcode"
                          description={<span className="font-mono text-xs text-neutral-600">{item.barcode}</span>}
                          selected={config.barcodeSource === 'existing'}
                          onClick={() => setConfig({ ...config, barcodeSource: 'existing' })}
                        />
                      )}
                      <ChoiceCard
                        title="Auto-generate"
                        description={
                          autoGenerateDisabled
                            ? 'Not available for this format'
                            : 'Based on the item ID (Code 128)'
                        }
                        selected={config.barcodeSource === 'auto'}
                        disabled={autoGenerateDisabled}
                        onClick={() => setConfig({ ...config, barcodeSource: 'auto' })}
                      />
                      <ChoiceCard
                        title="Enter manually"
                        description="Use your own value"
                        selected={config.barcodeSource === 'manual'}
                        onClick={() => setConfig({ ...config, barcodeSource: 'manual' })}
                      />
                    </div>
                  )
                })()}

                {config.barcodeSource === 'manual' && (
                  <Input
                    value={config.manualBarcode}
                    onChange={(e) => setConfig({ ...config, manualBarcode: e.target.value })}
                    placeholder="Enter barcode value…"
                  />
                )}
              </div>
            )}

            {/* Section 5: Content (conditional) */}
            {labelFeatures.maxDetails > 0 && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Content</h3>
                  <span className="text-xs text-neutral-400">Up to {labelFeatures.maxDetails}</span>
                </div>
                <DetailsSelector
                  selected={config.selectedDetails}
                  onChange={(selected) =>
                    setConfig({ ...config, selectedDetails: selected.slice(0, labelFeatures.maxDetails) })
                  }
                  maxSelections={labelFeatures.maxDetails}
                />
                {labelFeatures.maxDetails === 1 && (
                  <p className="text-xs text-neutral-500">This size supports 1 detail field.</p>
                )}
              </div>
            )}

            {/* Section 6: Extras (conditional) */}
            {(labelFeatures.photo || labelFeatures.logo || labelFeatures.note) && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Extras</h3>

                {labelFeatures.photo && (
                  <ImageSelector
                    label="Photo"
                    options={item.image_urls?.filter(Boolean) as string[] || []}
                    selectedUrl={config.photoUrl}
                    onSelect={(url) => setConfig({ ...config, photoUrl: url })}
                    onUpload={(file) => {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setConfig({ ...config, photoUrl: reader.result as string })
                      }
                      reader.readAsDataURL(file)
                    }}
                    onRemove={() => setConfig({ ...config, photoUrl: null })}
                    placeholder="No item photos. Upload one."
                  />
                )}

                {labelFeatures.logo && (
                  <ImageSelector
                    label="Logo"
                    options={tenantLogo ? [tenantLogo] : []}
                    selectedUrl={config.logoUrl}
                    onSelect={(url) => setConfig({ ...config, logoUrl: url })}
                    onUpload={(file) => {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setConfig({ ...config, logoUrl: reader.result as string })
                      }
                      reader.readAsDataURL(file)
                    }}
                    onRemove={() => setConfig({ ...config, logoUrl: null })}
                    placeholder="No company logo. Upload one."
                  />
                )}

                {labelFeatures.note && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-900">Note</span>
                      {config.note && (
                        <button
                          onClick={() => setConfig({ ...config, note: '' })}
                          className="ml-auto text-xs text-neutral-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </button>
                      )}
                    </div>
                    <Input
                      value={config.note}
                      onChange={(e) => setConfig({ ...config, note: e.target.value })}
                      placeholder="Type a note to print on the label…"
                      className="text-sm"
                    />
                    <p className="text-xs text-neutral-500">Printed under the details</p>
                  </div>
                )}
              </div>
            )}

            {/* Size info for small labels */}
            {!labelFeatures.photo &&
              !labelFeatures.logo &&
              !labelFeatures.note &&
              labelFeatures.maxDetails === 0 && (
                <div className="flex items-start gap-2 p-3 bg-neutral-50 text-neutral-700 rounded-xl border border-neutral-200 text-sm">
                  <Info className="h-4 w-4 mt-0.5 shrink-0 text-neutral-500" />
                  <span>
                    This size prints item name + {config.type === 'qr' ? 'QR code' : 'barcode'} only.
                  </span>
                </div>
            )}

            {/* Error display */}
            {error && (
              <div role="alert" className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 flex items-center justify-between gap-4 px-6 py-4 border-t border-neutral-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <Button variant="outline" onClick={onClose} disabled={generating}>
            Cancel
          </Button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-500">
            {config.output === 'printer' ? (
              <>
                <span className="font-medium text-neutral-700">Label printer</span>
                <span className="text-neutral-300">|</span>
                <span>
                  {currentLabelSize.width}in × {currentLabelSize.height}in
                </span>
              </>
            ) : (
              <>
                <span className="font-medium text-neutral-700">
                  {PAPER_SIZES[config.paperSize].name.split(' (')[0] || PAPER_SIZES[config.paperSize].name}
                </span>
                <span className="text-neutral-300">|</span>
                <span>{labelsPerSheet.total}/sheet</span>
                {compatibleProducts.length > 0 && (
                  <>
                    <span className="text-neutral-300">|</span>
                    <span>{compatibleProducts[0]}</span>
                  </>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {config.output === 'pdf' ? (
              <>
                <Button variant="outline" onClick={handleDownload} disabled={generating}>
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download PDF
                </Button>
                <Button onClick={handlePrintAndSave} disabled={generating}>
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Printer className="h-4 w-4 mr-2" />
                  )}
                  Print
                </Button>
              </>
            ) : (
              <Button onClick={handlePrintAndSave} disabled={generating}>
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Printer className="h-4 w-4 mr-2" />
                )}
                Print Label
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChoiceCard({
  title,
  description,
  icon,
  selected,
  disabled,
  onClick,
}: {
  title: string
  description?: React.ReactNode
  icon?: React.ReactNode
  selected: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full rounded-xl border-2 p-3 text-left transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        selected ? 'border-primary bg-primary/10 shadow-sm' : 'border-neutral-200 bg-white',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-neutral-300'
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className={cn(
              'mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border',
              selected
                ? 'border-primary/30 bg-primary/20 text-primary'
                : 'border-neutral-200 bg-neutral-50 text-neutral-500'
            )}
          >
            {icon}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-neutral-900">{title}</span>
            {selected && (
              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
          </div>
          {description && <div className="mt-0.5 text-sm text-neutral-600">{description}</div>}
        </div>
      </div>
    </button>
  )
}

// Image Selector Component for photo/logo selection
function ImageSelector({
  label,
  options,
  selectedUrl,
  onSelect,
  onUpload,
  onRemove,
  placeholder,
}: {
  label: string
  options: string[]
  selectedUrl: string | null
  onSelect: (url: string | null) => void
  onUpload: (file: File) => void
  onRemove: () => void
  placeholder?: string
}) {
  const fileInputId = `file-input-${label.toLowerCase().replace(/\s+/g, '-')}`

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
        {selectedUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {/* Existing options */}
        {options.map((url, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(url)}
            className={cn(
              'relative w-14 h-14 rounded-lg border-2 overflow-hidden transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              selectedUrl === url
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-neutral-200 hover:border-neutral-300'
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${label} ${index + 1}`} className="w-full h-full object-cover" />
            {selectedUrl === url && (
              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-primary" />
              </div>
            )}
          </button>
        ))}

        {/* Upload button */}
        <label
          htmlFor={fileInputId}
          className={cn(
            'w-14 h-14 rounded-lg border-2 border-dashed border-neutral-300',
            'flex items-center justify-center cursor-pointer',
            'hover:border-primary/60 hover:bg-primary/10 transition-colors',
            'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2'
          )}
        >
          <Plus className="h-5 w-5 text-neutral-400" />
          <input
            id={fileInputId}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        {/* Empty state placeholder */}
        {options.length === 0 && !selectedUrl && (
          <div className="flex-1 text-xs text-neutral-400 flex items-center">
            {placeholder || 'No images available. Upload one.'}
          </div>
        )}
      </div>
    </div>
  )
}

// Large Label Preview (4" x 6")
function LargeLabelPreview({
  item,
  config,
  codeUrl,
  labelId,
}: {
  item: LabelWizardItem
  config: LabelConfig
  codeUrl: string
  labelId: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5 w-full max-w-[240px] aspect-[4/3.333] flex flex-col relative">
      {/* Top row: Name and QR */}
      <div className="flex justify-between gap-2">
        <h3 className="text-base font-bold text-neutral-800 leading-tight flex-1">{item.name}</h3>
        <div className="flex flex-col items-center shrink-0">
          {codeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={codeUrl} alt="Code" className="w-14 h-14" />
          ) : (
            <div className="w-14 h-14 bg-neutral-100 rounded flex items-center justify-center">
              <QrCode className="h-6 w-6 text-neutral-300" />
            </div>
          )}
          <span className="text-[8px] font-mono text-neutral-500 mt-0.5">{labelId}</span>
        </div>
      </div>

      {/* Separator */}
      <div className="w-full h-px bg-neutral-300 my-2" />

      {/* Details */}
      <div className="space-y-1 flex-1">
        {config.selectedDetails.slice(0, 2).map((field) => {
          const detail = getDetailDisplay(item, field)
          return (
            <div key={field}>
              <div className="text-[10px] font-semibold text-neutral-600">{detail.label}</div>
              <div className="text-xs text-neutral-500">{detail.value}</div>
            </div>
          )
        })}
      </div>

      {/* Photo at bottom */}
      {config.photoUrl && (
        <div className="w-12 h-12 rounded border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden mt-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config.photoUrl} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Note at bottom */}
      {config.note && (
        <div className="text-[9px] italic text-neutral-500 mt-2 line-clamp-2">{config.note}</div>
      )}
    </div>
  )
}

// Medium Label Preview (2" x 4")
function MediumLabelPreview({
  item,
  config,
  codeUrl,
  labelId,
}: {
  item: LabelWizardItem
  config: LabelConfig
  codeUrl: string
  labelId: string
}) {
  if (config.type === 'barcode') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-3 w-full max-w-[280px] aspect-[4/2] flex flex-col gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-neutral-800 leading-tight line-clamp-2">{item.name}</h3>
          {config.selectedDetails.length > 0 && (
            <p className="text-xs text-neutral-500 mt-1 truncate">
              {getDetailDisplay(item, config.selectedDetails[0]).label}: {getDetailDisplay(item, config.selectedDetails[0]).value}
            </p>
          )}
        </div>

        <div className="mt-auto">
          {codeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={codeUrl} alt="Barcode" className="w-full h-10 object-contain" />
          ) : (
            <div className="w-full h-10 bg-neutral-100 rounded flex items-center justify-center">
              <Barcode className="h-5 w-5 text-neutral-300" />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-3 w-full max-w-[280px] aspect-[4/2] flex items-center justify-between gap-3">
      {/* Left - Name and details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-neutral-800 leading-tight line-clamp-2">{item.name}</h3>
        {config.selectedDetails.length > 0 && (
          <p className="text-xs text-neutral-500 mt-1 truncate">
            {getDetailDisplay(item, config.selectedDetails[0]).label}: {getDetailDisplay(item, config.selectedDetails[0]).value}
          </p>
        )}
      </div>

      {/* Right - Code */}
      <div className="flex flex-col items-center shrink-0">
        {codeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={codeUrl} alt="Code" className="w-14 h-14" />
        ) : (
          <div className="w-14 h-14 bg-neutral-100 rounded flex items-center justify-center">
            <QrCode className="h-6 w-6 text-neutral-300" />
          </div>
        )}
        <span className="text-[8px] font-mono text-neutral-500 mt-0.5">{labelId}</span>
      </div>
    </div>
  )
}

// Small Label Preview (2" x 1" - QR only)
function SmallLabelPreview({
  item,
  codeUrl,
  labelId,
}: {
  item: LabelWizardItem
  codeUrl: string
  labelId: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-2 w-full max-w-[180px] aspect-[2/1] flex items-center justify-between gap-2">
      {/* Left - Name */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[10px] font-bold text-neutral-800 leading-tight line-clamp-2">{item.name}</h3>
        <span className="text-[6px] font-mono text-neutral-500">{labelId}</span>
      </div>

      {/* Right - QR Code */}
      <div className="shrink-0">
        {codeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={codeUrl} alt="QR Code" className="w-12 h-12" />
        ) : (
          <div className="w-12 h-12 bg-neutral-100 rounded flex items-center justify-center">
            <QrCode className="h-6 w-6 text-neutral-300" />
          </div>
        )}
      </div>
    </div>
  )
}

// Medium Long Label Preview (4" x 1" - QR only)
function MediumLongLabelPreview({
  item,
  config,
  codeUrl,
  labelId,
}: {
  item: LabelWizardItem
  config: LabelConfig
  codeUrl: string
  labelId: string
}) {
  const detail = config.selectedDetails[0]
  const detailValue = detail ? getDetailDisplay(item, detail) : null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-2 w-full max-w-[320px] aspect-[4/1] flex items-center justify-between gap-2">
      {/* Left - Name & detail */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-bold text-neutral-800 leading-tight line-clamp-1">{item.name}</h3>
        {detailValue && (
          <p className="text-[9px] text-neutral-600 mt-0.5">{detailValue.label}: {detailValue.value}</p>
        )}
        <span className="text-[6px] font-mono text-neutral-500">{labelId}</span>
      </div>

      {/* Right - QR Code */}
      <div className="shrink-0">
        {codeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={codeUrl} alt="QR Code" className="w-14 h-14" />
        ) : (
          <div className="w-14 h-14 bg-neutral-100 rounded flex items-center justify-center">
            <QrCode className="h-8 w-8 text-neutral-300" />
          </div>
        )}
      </div>
    </div>
  )
}

// Medium Tall Label Preview (2" x 4" - QR with photo)
function MediumTallLabelPreview({
  item,
  config,
  codeUrl,
  labelId,
}: {
  item: LabelWizardItem
  config: LabelConfig
  codeUrl: string
  labelId: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-3 w-full max-w-[160px] aspect-[2/4] flex flex-col gap-2">
      {/* Name */}
      <h3 className="text-xs font-bold text-neutral-800 leading-tight line-clamp-2">{item.name}</h3>

      {/* Details */}
      <div className="flex-1 space-y-1">
        {config.selectedDetails.slice(0, 2).map((detail) => {
          const value = getDetailDisplay(item, detail)
          return (
            <div key={detail} className="text-[9px]">
              <span className="font-medium text-neutral-700">{value.label}:</span>{' '}
              <span className="text-neutral-600">{value.value}</span>
            </div>
          )
        })}
      </div>

      {/* Photo (if included) */}
      {config.photoUrl && (
        <div className="w-full aspect-square bg-neutral-100 rounded overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config.photoUrl} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* QR Code at bottom */}
      <div className="flex justify-center">
        {codeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={codeUrl} alt="QR Code" className="w-16 h-16" />
        ) : (
          <div className="w-16 h-16 bg-neutral-100 rounded flex items-center justify-center">
            <QrCode className="h-10 w-10 text-neutral-300" />
          </div>
        )}
      </div>
      <span className="text-[7px] font-mono text-neutral-500 text-center">{labelId}</span>

      {/* Note at bottom */}
      {config.note && (
        <div className="text-[8px] italic text-neutral-500 mt-1 line-clamp-1 text-center">{config.note}</div>
      )}
    </div>
  )
}

// Barcode Medium Label Preview (2" x 0.75")
function BarcodeMediumLabelPreview({
  item,
  codeUrl,
  labelId,
}: {
  item: LabelWizardItem
  codeUrl: string
  labelId: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-2 w-full max-w-[200px] aspect-[2/0.75] flex flex-col justify-between">
      {/* Name */}
      <h3 className="text-[9px] font-bold text-neutral-800 leading-tight truncate">{item.name}</h3>

      {/* Barcode */}
      <div className="flex-1 flex items-center justify-center">
        {codeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={codeUrl} alt="Barcode" className="w-full h-6 object-contain" />
        ) : (
          <div className="w-full h-6 bg-neutral-100 rounded flex items-center justify-center">
            <Barcode className="h-4 w-4 text-neutral-300" />
          </div>
        )}
      </div>
    </div>
  )
}

// Label Printer Preview (for direct print labels)
function LabelPrinterPreview({
  item,
  type,
  codeUrl,
  labelId,
}: {
  item: LabelWizardItem
  type: 'qr' | 'barcode'
  codeUrl: string
  labelId: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-2 w-full max-w-[200px] aspect-[2/0.75] flex flex-col items-center justify-center gap-0.5">
      {/* Item Name */}
      <h3 className="text-[9px] font-bold text-neutral-800 text-center truncate w-full">{item.name}</h3>

      {/* Code */}
      {codeUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={codeUrl}
          alt={type === 'qr' ? 'QR code' : 'Barcode'}
          className={
            type === 'qr'
              ? 'h-10 w-10 object-contain'
              : 'w-full max-w-[150px] h-6 object-contain'
          }
        />
      ) : (
        <div
          className={
            type === 'qr'
              ? 'h-10 w-10 bg-neutral-100 rounded flex items-center justify-center'
              : 'w-full max-w-[150px] h-6 bg-neutral-100 rounded flex items-center justify-center'
          }
        >
          {type === 'qr' ? (
            <QrCode className="h-4 w-4 text-neutral-300" />
          ) : (
            <Barcode className="h-4 w-4 text-neutral-300" />
          )}
        </div>
      )}

      {type === 'qr' && <span className="text-[6px] font-mono text-neutral-500">{labelId}</span>}
    </div>
  )
}

// Helper to get detail display values
function getDetailDisplay(
  item: LabelWizardItem,
  field: DetailField
): { label: string; value: string } {
  switch (field) {
    case 'notes':
      return { label: 'Notes', value: item.notes?.substring(0, 50) || 'N/A' }
    case 'price':
      return {
        label: 'Price',
        value: item.price
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: item.currency || 'USD',
            }).format(item.price)
          : 'N/A',
      }
    case 'min_level':
      return { label: 'Min Level', value: item.min_quantity?.toString() || 'N/A' }
    case 'tags':
      return { label: 'Tags', value: item.tags?.map((t) => t.name).join(', ') || 'N/A' }
    case 'total_value':
      const total = (item.price || 0) * (item.quantity || 0)
      return {
        label: 'Total Value',
        value: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: item.currency || 'USD',
        }).format(total),
      }
    case 'sku':
      return { label: 'SKU', value: item.sku || 'N/A' }
    case 'barcode':
      return { label: 'Barcode', value: item.barcode || 'N/A' }
    default:
      return { label: field, value: 'N/A' }
  }
}
