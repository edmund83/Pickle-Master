'use client'

import { useState, useEffect } from 'react'
import {
  X,
  QrCode,
  Barcode,
  Info,
  Check,
  ChevronDown,
  Download,
  Printer,
  Mail,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  generateQRCode,
  generateBarcodePattern,
  formatLabelId,
  calculateLabelsPerSheet,
  getCompatibleProducts,
  PAPER_SIZES,
  LABEL_SIZES,
  type LabelConfig
} from '@/lib/labels/barcode'

interface LabelWizardProps {
  item: {
    id: string
    name: string
    sku?: string
  }
  onClose: () => void
}

export default function LabelWizard({ item, onClose }: LabelWizardProps) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<LabelConfig>({
    type: 'qr',
    paperSize: 'letter',
    labelSize: 'medium',
    includeDetails: false,
    includeLogo: false,
    includeNote: false,
    note: '',
  })
  const [printQty, setPrintQty] = useState(1)
  const [sendEmail, setSendEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    // Generate QR code preview
    async function loadQR() {
      const labelId = formatLabelId(item.id)
      const url = await generateQRCode(labelId, 128)
      setQrCodeUrl(url)
    }
    loadQR()
  }, [item.id])

  const labelId = formatLabelId(item.id)
  const labelsPerSheet = calculateLabelsPerSheet(config.paperSize, config.labelSize)
  const compatibleProducts = getCompatibleProducts(config.labelSize)

  async function handlePrint() {
    setGenerating(true)
    // In a real implementation, this would call an API to generate PDF
    // For now, we'll simulate and trigger print dialog
    await new Promise(resolve => setTimeout(resolve, 1000))
    window.print()
    setGenerating(false)
  }

  async function handleDownload() {
    setGenerating(true)
    // In a real implementation, this would call an API to generate PDF
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Simulate download
    alert('PDF download would start here. Full implementation requires server-side PDF generation.')
    setGenerating(false)
  }

  // Generate barcode pattern for preview
  const barcodePattern = generateBarcodePattern(labelId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

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
                  <span className="text-sm font-medium">This label will be stored for easy reprinting.</span>
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
                        onChange={(e) => setConfig({ ...config, type: e.target.value as 'qr' | 'barcode' })}
                        className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pickle-500"
                      >
                        <option value="qr">QR Code Label</option>
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
                        onChange={(e) => setConfig({ ...config, paperSize: e.target.value as 'letter' | 'a4' })}
                        className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pickle-500"
                      >
                        {Object.entries(PAPER_SIZES).map(([key, size]) => (
                          <option key={key} value={key}>{size.name}</option>
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
                        onChange={(e) => setConfig({ ...config, labelSize: e.target.value as 'small' | 'medium' | 'large' })}
                        className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pickle-500"
                      >
                        {Object.entries(LABEL_SIZES).map(([key, size]) => (
                          <option key={key} value={key}>{size.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Label Settings */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Label Settings
                  </h4>

                  <ToggleSwitch
                    label="Include additional item details"
                    checked={config.includeDetails}
                    onChange={(checked) => setConfig({ ...config, includeDetails: checked })}
                  />

                  <ToggleSwitch
                    label="Include logo or icon"
                    checked={config.includeLogo}
                    onChange={(checked) => setConfig({ ...config, includeLogo: checked })}
                  />

                  <ToggleSwitch
                    label="Add a note to label"
                    checked={config.includeNote}
                    onChange={(checked) => setConfig({ ...config, includeNote: checked })}
                  />

                  {config.includeNote && (
                    <Input
                      value={config.note || ''}
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
                        <select className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-pickle-500">
                          <option>Custom</option>
                          <option>Full Sheet ({labelsPerSheet.total})</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="w-24 space-y-1.5">
                      <label className="text-sm font-medium text-neutral-500">Amount</label>
                      <Input
                        type="number"
                        value={printQty}
                        onChange={(e) => setPrintQty(parseInt(e.target.value) || 1)}
                        min={1}
                        max={100}
                      />
                    </div>
                  </div>

                  <ToggleSwitch
                    label="Send copy to email"
                    checked={sendEmail}
                    onChange={setSendEmail}
                  />

                  {sendEmail && (
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  )}
                </div>

                {/* Label Information */}
                <div className="space-y-4 pt-4">
                  <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Label Information
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">Labels per sheet:</span>
                      <span className="font-semibold text-neutral-900">{labelsPerSheet.total}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">Compatible with:</span>
                      <span className="font-semibold text-neutral-900">{compatibleProducts.join(', ')}</span>
                    </div>
                    <button className="text-pickle-600 text-xs font-semibold hover:underline">
                      Purchase Blank Labels
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 bg-neutral-100 p-8 flex flex-col items-center justify-center">
            {/* Label Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 w-full max-w-[320px] aspect-[2.375/1.25] flex flex-col items-center justify-between relative">
              {/* Dimensions */}
              <div className="absolute -top-6 left-0 right-0 flex items-center justify-center">
                <span className="text-xs text-neutral-400">
                  {LABEL_SIZES[config.labelSize].name}
                </span>
              </div>

              {/* Item Name */}
              <h3 className="text-sm font-bold text-neutral-800 text-center truncate w-full">
                {item.name}
              </h3>

              {/* Code */}
              <div className="flex flex-col items-center gap-2 w-full">
                {config.type === 'qr' ? (
                  <>
                    {qrCodeUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />
                    )}
                  </>
                ) : (
                  <div className="flex items-center h-12 gap-[1px]">
                    {barcodePattern.slice(0, 30).map((width, i) => (
                      <div
                        key={i}
                        className={`h-full ${i % 2 === 0 ? 'bg-neutral-900' : ''}`}
                        style={{ width: `${width}px` }}
                      />
                    ))}
                  </div>
                )}
                <span className="text-[10px] font-mono text-neutral-500 tracking-wider">
                  {labelId}
                </span>
              </div>

              {/* Optional Details */}
              {config.includeDetails && item.sku && (
                <span className="text-xs text-neutral-400">SKU: {item.sku}</span>
              )}
            </div>

            <p className="mt-6 text-xs text-neutral-400">
              Choose label type to see preview
            </p>
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
              <Button onClick={() => setStep(2)}>
                Next
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleDownload} disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Download PDF
                </Button>
                <Button onClick={handlePrint} disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Printer className="h-4 w-4 mr-2" />}
                  Print & Save
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
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-neutral-600">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-pickle-500' : 'bg-neutral-200'
        }`}
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
