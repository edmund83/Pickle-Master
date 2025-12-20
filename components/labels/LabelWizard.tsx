'use client'

import { useState, useEffect } from 'react'
import {
  X,
  QrCode,
  Barcode,
  Info,
  ChevronDown,
  Download,
  Printer,
  Loader2,
  Image as ImageIcon,
  Building2,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateQRCode, formatLabelId, PAPER_SIZES, LABEL_SIZES } from '@/lib/labels/barcode'
import {
  generateScannableBarcode,
  generateItemBarcode,
  validateBarcodeData,
} from '@/lib/labels/barcode-generator'
import {
  generateLabelPDF,
  calculateLabelsPerSheet,
  getCompatibleProducts,
  type DetailField,
  type LabelPDFConfig,
} from '@/lib/labels/pdf-generator'
import DetailsSelector from './DetailsSelector'
import StartPositionSelector from './StartPositionSelector'

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
type PaperSize = 'letter' | 'a4'
type LabelSize = 'small' | 'medium' | 'large' | 'qr_large'
type BarcodeSource = 'existing' | 'auto' | 'manual'
type QuantityMode = 'custom' | 'full_sheet'

interface LabelConfig {
  type: LabelType
  paperSize: PaperSize
  labelSize: LabelSize
  selectedDetails: DetailField[]
  includePhoto: boolean
  includeLogo: boolean
  includeNote: boolean
  note: string
  barcodeSource: BarcodeSource
  manualBarcode: string
  quantity: number
  quantityMode: QuantityMode
  startPosition: number
  chooseStartPosition: boolean
  includeInstructions: boolean
  sendEmail: boolean
  email: string
}

const QR_LABEL_SIZES = {
  medium: LABEL_SIZES.medium,
  large: LABEL_SIZES.large,
  qr_large: { width: 5.5, height: 8.5, name: 'Half Sheet (5 1/2in x 8 1/2in)', perSheet: 2 },
}

const BARCODE_LABEL_SIZES = {
  small: LABEL_SIZES.small,
  medium: LABEL_SIZES.medium,
  large: LABEL_SIZES.large,
}

export default function LabelWizard({ item, tenantLogo, userEmail, onClose, onSave }: LabelWizardProps) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<LabelConfig>({
    type: 'qr',
    paperSize: 'letter',
    labelSize: 'qr_large',
    selectedDetails: ['price'],
    includePhoto: true,
    includeLogo: false,
    includeNote: false,
    note: '',
    barcodeSource: item.barcode ? 'existing' : 'auto',
    manualBarcode: '',
    quantity: 1,
    quantityMode: 'custom',
    startPosition: 1,
    chooseStartPosition: false,
    includeInstructions: false,
    sendEmail: false,
    email: userEmail || '',
  })

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [barcodeUrl, setBarcodeUrl] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const labelId = formatLabelId(item.id)

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
        let barcodeData: string
        if (config.barcodeSource === 'existing' && item.barcode) {
          barcodeData = item.barcode
        } else if (config.barcodeSource === 'manual' && config.manualBarcode) {
          barcodeData = config.manualBarcode
        } else {
          barcodeData = generateItemBarcode(item.id)
        }

        const url = await generateScannableBarcode(barcodeData, 'code128', {
          width: 200,
          height: 60,
          includeText: true,
        })
        setBarcodeUrl(url)
      } catch (e) {
        console.error('Barcode generation failed:', e)
      }
    }
    if (config.type === 'barcode') {
      loadBarcode()
    }
  }, [config.type, config.barcodeSource, config.manualBarcode, item.barcode, item.id])

  // Get current label sizes based on type
  const labelSizes = config.type === 'qr' ? QR_LABEL_SIZES : BARCODE_LABEL_SIZES
  const currentLabelSize = labelSizes[config.labelSize as keyof typeof labelSizes] || labelSizes.medium
  const labelsPerSheet = calculateLabelsPerSheet(config.paperSize, config.labelSize as LabelSize)
  const compatibleProducts = getCompatibleProducts(config.labelSize as LabelSize)

  // Reset label size when type changes
  useEffect(() => {
    if (config.type === 'qr' && !QR_LABEL_SIZES[config.labelSize as keyof typeof QR_LABEL_SIZES]) {
      setConfig((c) => ({ ...c, labelSize: 'qr_large' }))
    } else if (config.type === 'barcode' && !BARCODE_LABEL_SIZES[config.labelSize as keyof typeof BARCODE_LABEL_SIZES]) {
      setConfig((c) => ({ ...c, labelSize: 'medium' }))
    }
  }, [config.type, config.labelSize])

  // Handle quantity mode change
  useEffect(() => {
    if (config.quantityMode === 'full_sheet') {
      setConfig((c) => ({ ...c, quantity: labelsPerSheet.total }))
    }
  }, [config.quantityMode, labelsPerSheet.total])

  async function handleGeneratePDF(): Promise<Blob | null> {
    setError(null)

    try {
      // Prepare barcode/QR data
      let codeDataUrl: string
      if (config.type === 'qr') {
        codeDataUrl = await generateQRCode(labelId, 256)
      } else {
        let barcodeData: string
        if (config.barcodeSource === 'existing' && item.barcode) {
          barcodeData = item.barcode
        } else if (config.barcodeSource === 'manual') {
          if (!config.manualBarcode) {
            setError('Please enter a barcode value')
            return null
          }
          const validation = validateBarcodeData(config.manualBarcode, 'code128')
          if (!validation.valid) {
            setError(validation.error || 'Invalid barcode')
            return null
          }
          barcodeData = config.manualBarcode
        } else {
          barcodeData = generateItemBarcode(item.id)
        }
        codeDataUrl = await generateScannableBarcode(barcodeData, 'code128', {
          width: 400,
          height: 120,
          includeText: true,
        })
      }

      // Prepare photo if included
      let photoDataUrl: string | null = null
      if (config.includePhoto && item.image_urls?.[0]) {
        try {
          const response = await fetch(item.image_urls[0])
          const blob = await response.blob()
          photoDataUrl = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })
        } catch (e) {
          console.warn('Failed to load item photo:', e)
        }
      }

      const pdfConfig: LabelPDFConfig = {
        labelType: config.type,
        paperSize: config.paperSize,
        labelSize: config.labelSize as LabelSize,
        quantity: config.quantity,
        startPosition: config.startPosition,
        includePhoto: config.includePhoto,
        includeLogo: config.includeLogo,
        includeNote: config.includeNote,
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
        image_url: item.image_urls?.[0],
        tags: item.tags?.map((t) => ({ name: t.name, color: t.color })),
      }

      const pdfBlob = await generateLabelPDF(
        [labelItem],
        pdfConfig,
        [codeDataUrl],
        photoDataUrl ? [photoDataUrl] : undefined,
        config.includeLogo && tenantLogo ? tenantLogo : undefined
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Create Label</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Configuration */}
          <div className="w-[420px] border-r border-neutral-200 overflow-y-auto p-6 space-y-6">
            {step === 1 ? (
              <>
                {/* Info Banner */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shrink-0">
                    <Info className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-medium">
                    This label will now be stored for easy reprinting.
                  </span>
                </div>

                {/* Label Options */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Label Options
                  </h4>

                  {/* Label Type */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-500">Label type</label>
                    <div className="relative">
                      <select
                        value={config.type}
                        onChange={(e) => setConfig({ ...config, type: e.target.value as LabelType })}
                        className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pickle-500"
                      >
                        <option value="qr">QR Label</option>
                        <option value="barcode">Barcode Label</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Paper Size */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-500">Paper size</label>
                    <div className="relative">
                      <select
                        value={config.paperSize}
                        onChange={(e) => setConfig({ ...config, paperSize: e.target.value as PaperSize })}
                        className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pickle-500"
                      >
                        {Object.entries(PAPER_SIZES).map(([key, size]) => (
                          <option key={key} value={key}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Label Size */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-neutral-500">Label size</label>
                    <div className="relative">
                      <select
                        value={config.labelSize}
                        onChange={(e) => setConfig({ ...config, labelSize: e.target.value as LabelSize })}
                        className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pickle-500"
                      >
                        {Object.entries(labelSizes).map(([key, size]) => (
                          <option key={key} value={key}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Barcode Source (only for barcode type when item has no barcode) */}
                  {config.type === 'barcode' && !item.barcode && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-500">Barcode</label>
                      <div className="relative">
                        <select
                          value={config.barcodeSource}
                          onChange={(e) =>
                            setConfig({ ...config, barcodeSource: e.target.value as BarcodeSource })
                          }
                          className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pickle-500"
                        >
                          <option value="auto">Auto-generate from ID</option>
                          <option value="manual">Enter manually</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                      </div>
                      {config.barcodeSource === 'manual' && (
                        <Input
                          value={config.manualBarcode}
                          onChange={(e) => setConfig({ ...config, manualBarcode: e.target.value })}
                          placeholder="Enter barcode value..."
                          className="mt-2"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Details Selector (QR labels) */}
                {config.type === 'qr' && config.labelSize === 'qr_large' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Details
                    </h4>
                    <DetailsSelector
                      selected={config.selectedDetails}
                      onChange={(selected) => setConfig({ ...config, selectedDetails: selected })}
                    />
                  </div>
                )}

                {/* Label Settings */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Label Settings
                  </h4>

                  {config.type === 'barcode' && (
                    <ToggleSwitch
                      label="Include additional item details"
                      helpText="Show SKU or price on label"
                      icon={<FileText className="h-4 w-4" />}
                      checked={config.selectedDetails.length > 0}
                      onChange={(checked) =>
                        setConfig({ ...config, selectedDetails: checked ? ['sku'] : [] })
                      }
                    />
                  )}

                  <ToggleSwitch
                    label="Include photo"
                    helpText="The first photo of the item will be used on the label"
                    icon={<ImageIcon className="h-4 w-4" />}
                    checked={config.includePhoto}
                    onChange={(checked) => setConfig({ ...config, includePhoto: checked })}
                    disabled={!firstPhotoUrl}
                  />

                  <ToggleSwitch
                    label="Include logo or icon"
                    helpText="Add your company logo to the label"
                    icon={<Building2 className="h-4 w-4" />}
                    checked={config.includeLogo}
                    onChange={(checked) => setConfig({ ...config, includeLogo: checked })}
                    disabled={!tenantLogo}
                  />

                  <ToggleSwitch
                    label="Add a note to label"
                    icon={<FileText className="h-4 w-4" />}
                    checked={config.includeNote}
                    onChange={(checked) => setConfig({ ...config, includeNote: checked })}
                  />

                  {config.includeNote && (
                    <Input
                      value={config.note}
                      onChange={(e) => setConfig({ ...config, note: e.target.value })}
                      placeholder="Enter label note..."
                      className="mt-2"
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Step 2: Printing Options */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Printing Options
                  </h4>

                  <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-sm font-medium text-neutral-500">Label quantity</label>
                      <div className="relative">
                        <select
                          value={config.quantityMode}
                          onChange={(e) =>
                            setConfig({ ...config, quantityMode: e.target.value as QuantityMode })
                          }
                          className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pickle-500"
                        >
                          <option value="custom">Custom</option>
                          <option value="full_sheet">Full Sheet ({labelsPerSheet.total})</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="w-24 space-y-1.5">
                      <label className="text-sm font-medium text-neutral-500">Amount</label>
                      <Input
                        type="number"
                        value={config.quantity}
                        onChange={(e) => setConfig({ ...config, quantity: parseInt(e.target.value) || 1 })}
                        min={1}
                        max={100}
                        disabled={config.quantityMode === 'full_sheet'}
                      />
                    </div>
                  </div>

                  <ToggleSwitch
                    label="Choose label print start position"
                    helpText="Select where on the sheet to start printing"
                    checked={config.chooseStartPosition}
                    onChange={(checked) => setConfig({ ...config, chooseStartPosition: checked })}
                  />

                  {config.chooseStartPosition && (
                    <StartPositionSelector
                      rows={labelsPerSheet.rows}
                      cols={labelsPerSheet.cols}
                      selectedPosition={config.startPosition}
                      onChange={(position) => setConfig({ ...config, startPosition: position })}
                      labelsNeeded={config.quantity}
                    />
                  )}

                  <ToggleSwitch
                    label="Include printing instructions"
                    helpText="Add a cover page with printing tips"
                    checked={config.includeInstructions}
                    onChange={(checked) => setConfig({ ...config, includeInstructions: checked })}
                  />

                  <ToggleSwitch
                    label="Send copy to email"
                    checked={config.sendEmail}
                    onChange={(checked) => setConfig({ ...config, sendEmail: checked })}
                  />

                  {config.sendEmail && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-neutral-500">Email</label>
                      <Input
                        type="email"
                        value={config.email}
                        onChange={(e) => setConfig({ ...config, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>
                  )}
                </div>

                {/* Label Information */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Label Information
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Labels per sheet:</span>
                      <span className="font-semibold text-neutral-900">{labelsPerSheet.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Compatible with:</span>
                      <span className="font-semibold text-neutral-900">
                        {compatibleProducts.join(', ')}
                      </span>
                    </div>
                    <a
                      href="https://www.avery.com/products/labels"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pickle-600 text-xs font-semibold hover:underline"
                    >
                      Purchase Blank Labels
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Printer type:</span>
                      <span className="font-semibold text-neutral-900">laser</span>
                    </div>
                    <a
                      href="https://www.amazon.com/s?k=laser+label+printer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pickle-600 text-xs font-semibold hover:underline"
                    >
                      Purchase Recommended Printers
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
                )}
              </>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 bg-neutral-100 p-8 flex flex-col items-center justify-center overflow-auto">
            {/* Dimensions indicator */}
            <div className="text-xs text-neutral-400 mb-4">
              {currentLabelSize.width}in × {currentLabelSize.height}in
            </div>

            {/* Label Preview */}
            {config.type === 'qr' && config.labelSize === 'qr_large' ? (
              <QRLargeLabelPreview
                item={item}
                config={config}
                qrCodeUrl={qrCodeUrl}
                labelId={labelId}
              />
            ) : config.type === 'barcode' ? (
              <BarcodeLabelPreview
                item={item}
                config={config}
                barcodeUrl={barcodeUrl}
                labelId={labelId}
              />
            ) : (
              <StandardLabelPreview
                item={item}
                config={config}
                qrCodeUrl={qrCodeUrl}
                labelId={labelId}
              />
            )}

            <p className="mt-6 text-xs text-neutral-400">Live preview of your label</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-white">
          <div>
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
          </div>

          <span className="text-sm text-neutral-400">Step {step} of 2</span>

          <div className="flex items-center gap-3">
            {step === 1 ? (
              <Button onClick={() => setStep(2)}>Next</Button>
            ) : (
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
                  Print & Save Label
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Toggle Switch Component
function ToggleSwitch({
  label,
  helpText,
  icon,
  checked,
  onChange,
  disabled,
}: {
  label: string
  helpText?: string
  icon?: React.ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <div
      className={`flex items-start justify-between gap-3 ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start gap-2">
        {icon && <span className="text-neutral-400 mt-0.5">{icon}</span>}
        <div>
          <span className="text-sm font-medium text-neutral-600">{label}</span>
          {helpText && <p className="text-xs text-neutral-400 mt-0.5">{helpText}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-pickle-500' : 'bg-neutral-200'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

// QR Large Label Preview Component
function QRLargeLabelPreview({
  item,
  config,
  qrCodeUrl,
  labelId,
}: {
  item: LabelWizardItem
  config: LabelConfig
  qrCodeUrl: string
  labelId: string
}) {
  const firstPhotoUrl = item.image_urls?.[0]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 w-full max-w-[320px] aspect-[5.5/8.5] flex flex-col relative">
      {/* Item Name */}
      <h3 className="text-xl font-bold text-neutral-800 leading-tight">{item.name}</h3>

      {/* Separator */}
      <div className="w-full h-px bg-red-400 my-4" />

      {/* Details */}
      <div className="space-y-2 flex-1">
        {config.selectedDetails.map((field) => {
          const detail = getDetailDisplay(item, field)
          return (
            <div key={field}>
              <div className="text-xs font-semibold text-neutral-600">{detail.label}</div>
              <div className="text-sm text-neutral-500">{detail.value}</div>
            </div>
          )
        })}
      </div>

      {/* Bottom section with photo and QR */}
      <div className="flex items-end justify-between gap-4 mt-auto pt-4">
        {/* Photo */}
        {config.includePhoto && (
          <div className="w-20 h-20 rounded border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden">
            {firstPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={firstPhotoUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-neutral-400 text-center">Photo displayed here</span>
            )}
          </div>
        )}

        {/* QR Code */}
        <div className="flex flex-col items-center">
          {qrCodeUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
          ) : (
            <div className="w-20 h-20 bg-neutral-100 rounded flex items-center justify-center">
              <QrCode className="h-8 w-8 text-neutral-300" />
            </div>
          )}
          <span className="text-[10px] font-mono text-neutral-500 mt-1">{labelId}</span>
        </div>
      </div>
    </div>
  )
}

// Barcode Label Preview Component
function BarcodeLabelPreview({
  item,
  config,
  barcodeUrl,
  labelId,
}: {
  item: LabelWizardItem
  config: LabelConfig
  barcodeUrl: string
  labelId: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 w-full max-w-[280px] aspect-[2.375/1.25] flex flex-col items-center justify-between">
      {/* Item Name */}
      <h3 className="text-sm font-bold text-neutral-800 text-center truncate w-full">{item.name}</h3>

      {/* Barcode */}
      <div className="flex flex-col items-center w-full">
        {barcodeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={barcodeUrl} alt="Barcode" className="w-full max-w-[200px] h-12 object-contain" />
        ) : (
          <div className="w-full max-w-[200px] h-12 bg-neutral-100 rounded flex items-center justify-center">
            <Barcode className="h-6 w-6 text-neutral-300" />
          </div>
        )}

        {/* Separator line */}
        <div className="w-full max-w-[200px] h-px bg-red-400 mt-1" />

        {/* Label ID */}
        <span className="text-[10px] font-mono text-neutral-500 mt-1">{labelId}</span>
      </div>
    </div>
  )
}

// Standard Label Preview (QR small/medium)
function StandardLabelPreview({
  item,
  config,
  qrCodeUrl,
  labelId,
}: {
  item: LabelWizardItem
  config: LabelConfig
  qrCodeUrl: string
  labelId: string
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 w-full max-w-[280px] aspect-[2.375/1.25] flex items-center justify-between gap-3">
      {/* Left - Name and details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-neutral-800 truncate">{item.name}</h3>
        {config.selectedDetails.length > 0 && (
          <p className="text-xs text-neutral-500 mt-1 truncate">
            {getDetailDisplay(item, config.selectedDetails[0]).value}
          </p>
        )}
      </div>

      {/* Right - QR */}
      <div className="flex flex-col items-center shrink-0">
        {qrCodeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrCodeUrl} alt="QR Code" className="w-12 h-12" />
        ) : (
          <div className="w-12 h-12 bg-neutral-100 rounded flex items-center justify-center">
            <QrCode className="h-6 w-6 text-neutral-300" />
          </div>
        )}
        <span className="text-[8px] font-mono text-neutral-500 mt-0.5">{labelId}</span>
      </div>
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
