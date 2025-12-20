import { jsPDF } from 'jspdf'

export type DetailField = 'notes' | 'price' | 'min_level' | 'tags' | 'total_value' | 'sku' | 'barcode'

export interface LabelItem {
  id: string
  name: string
  sku?: string | null
  barcode?: string | null
  price?: number | null
  currency?: string | null
  quantity?: number | null
  min_quantity?: number | null
  notes?: string | null
  image_url?: string | null
  tags?: Array<{ name: string; color: string }>
}

export interface LabelPDFConfig {
  labelType: 'qr' | 'barcode'
  paperSize: 'letter' | 'a4'
  labelSize: 'small' | 'medium' | 'large' | 'qr_large'
  quantity: number
  startPosition: number // 1-indexed position on sheet

  // Content options
  includePhoto: boolean
  includeLogo: boolean
  includeNote: boolean
  note?: string
  selectedDetails: DetailField[]
}

// Paper dimensions in inches
const PAPER_SIZES = {
  letter: { width: 8.5, height: 11 },
  a4: { width: 8.27, height: 11.69 },
}

// Label dimensions in inches
const LABEL_SIZES = {
  small: { width: 2, height: 1, perSheet: 30, cols: 3, rows: 10 },
  medium: { width: 2.375, height: 1.25, perSheet: 18, cols: 3, rows: 6 },
  large: { width: 4, height: 2, perSheet: 10, cols: 2, rows: 5 },
  qr_large: { width: 5.5, height: 8.5, perSheet: 2, cols: 1, rows: 2 },
}

// Margins in inches
const MARGINS = {
  top: 0.5,
  left: 0.25,
  labelGap: 0.125,
}

/**
 * Convert inches to PDF points (72 points per inch)
 */
function inchesToPoints(inches: number): number {
  return inches * 72
}

/**
 * Format currency value
 */
function formatCurrency(value: number | null | undefined, currency: string = 'USD'): string {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value)
}

/**
 * Format a label ID from UUID
 */
function formatLabelId(id: string): string {
  const short = id.replace(/-/g, '').substring(0, 10).toUpperCase()
  return `S${short.substring(0, 4)}T${short.substring(4, 8)}`
}

/**
 * Get detail field display value
 */
function getDetailValue(item: LabelItem, field: DetailField): { label: string; value: string } {
  switch (field) {
    case 'notes':
      return { label: 'Notes', value: item.notes?.substring(0, 50) || 'N/A' }
    case 'price':
      return { label: 'Price', value: formatCurrency(item.price, item.currency || 'USD') }
    case 'min_level':
      return { label: 'Min Level', value: item.min_quantity?.toString() || 'N/A' }
    case 'tags':
      return { label: 'Tags', value: item.tags?.map((t) => t.name).join(', ') || 'N/A' }
    case 'total_value':
      const total = (item.price || 0) * (item.quantity || 0)
      return { label: 'Total Value', value: formatCurrency(total, item.currency || 'USD') }
    case 'sku':
      return { label: 'SKU', value: item.sku || 'N/A' }
    case 'barcode':
      return { label: 'Barcode', value: item.barcode || 'N/A' }
    default:
      return { label: field, value: 'N/A' }
  }
}

/**
 * Generate label PDF
 */
export async function generateLabelPDF(
  items: LabelItem[],
  config: LabelPDFConfig,
  codeDataUrls: string[], // Pre-generated QR/barcode data URLs
  photoDataUrls?: (string | null)[], // Pre-loaded photo data URLs
  logoDataUrl?: string // Tenant logo data URL
): Promise<Blob> {
  const paper = PAPER_SIZES[config.paperSize]
  const label = LABEL_SIZES[config.labelSize]

  // Create PDF with paper size in inches
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: [paper.width, paper.height],
  })

  let currentPosition = config.startPosition - 1 // Convert to 0-indexed
  let labelsOnCurrentPage = 0
  const labelsPerPage = label.perSheet

  // Generate labels for each item * quantity
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const item = items[itemIndex]
    const codeDataUrl = codeDataUrls[itemIndex]
    const photoDataUrl = photoDataUrls?.[itemIndex]

    for (let q = 0; q < config.quantity; q++) {
      // Calculate position on page
      const col = currentPosition % label.cols
      const row = Math.floor(currentPosition / label.cols) % label.rows

      // Add new page if needed
      if (currentPosition > 0 && currentPosition % labelsPerPage === 0 && labelsOnCurrentPage > 0) {
        pdf.addPage()
        labelsOnCurrentPage = 0
      }

      // Calculate label position
      const x = MARGINS.left + col * (label.width + MARGINS.labelGap)
      const y = MARGINS.top + row * (label.height + MARGINS.labelGap)

      // Draw label based on type
      if (config.labelType === 'qr' && config.labelSize === 'qr_large') {
        drawQRLargeLabel(pdf, item, config, x, y, label, codeDataUrl, photoDataUrl, logoDataUrl)
      } else if (config.labelType === 'barcode') {
        drawBarcodeLabel(pdf, item, config, x, y, label, codeDataUrl, logoDataUrl)
      } else {
        drawStandardLabel(pdf, item, config, x, y, label, codeDataUrl, logoDataUrl)
      }

      currentPosition++
      labelsOnCurrentPage++
    }
  }

  return pdf.output('blob')
}

/**
 * Draw a large QR label (half-page format)
 */
function drawQRLargeLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['qr_large'],
  codeDataUrl: string,
  photoDataUrl?: string | null,
  logoDataUrl?: string
) {
  const padding = 0.25
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // Item name (large, bold)
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  const nameLines = pdf.splitTextToSize(item.name, contentWidth)
  pdf.text(nameLines, contentX, y + 0.6)

  // Separator line
  const separatorY = y + 0.9 + nameLines.length * 0.3
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.01)
  pdf.line(contentX, separatorY, contentX + contentWidth, separatorY)

  // Details section
  let detailY = separatorY + 0.3
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')

  for (const field of config.selectedDetails.slice(0, 3)) {
    const detail = getDetailValue(item, field)
    pdf.setFont('helvetica', 'bold')
    pdf.text(detail.label, contentX, detailY)
    pdf.setFont('helvetica', 'normal')
    pdf.text(detail.value, contentX, detailY + 0.2)
    detailY += 0.5
  }

  // Bottom section with photo and QR
  const bottomY = y + label.height - 2

  // Photo (if included)
  if (config.includePhoto && photoDataUrl) {
    try {
      pdf.addImage(photoDataUrl, 'JPEG', contentX, bottomY, 1.5, 1.5)
    } catch (e) {
      // Photo failed to load, draw placeholder
      pdf.setDrawColor(200)
      pdf.setFillColor(240, 240, 240)
      pdf.rect(contentX, bottomY, 1.5, 1.5, 'FD')
      pdf.setFontSize(8)
      pdf.text('Photo', contentX + 0.5, bottomY + 0.8)
    }
  }

  // QR Code
  const qrX = config.includePhoto && photoDataUrl ? contentX + 2.5 : contentX + contentWidth - 1.8
  const qrY = bottomY
  if (codeDataUrl) {
    try {
      pdf.addImage(codeDataUrl, 'PNG', qrX, qrY, 1.5, 1.5)
    } catch (e) {
      console.error('Failed to add QR code to PDF:', e)
    }
  }

  // Label ID below QR
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, qrX + 0.75, qrY + 1.7, { align: 'center' })

  // Note (if included)
  if (config.includeNote && config.note) {
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'italic')
    const noteLines = pdf.splitTextToSize(config.note, contentWidth)
    pdf.text(noteLines, contentX, y + label.height - 0.3)
  }
}

/**
 * Draw a compact barcode label
 */
function drawBarcodeLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)[keyof typeof LABEL_SIZES],
  codeDataUrl: string,
  logoDataUrl?: string
) {
  const padding = 0.08
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // Item name
  pdf.setFontSize(label.height > 1.2 ? 11 : 9)
  pdf.setFont('helvetica', 'bold')
  const maxNameWidth = contentWidth
  const name = item.name.length > 30 ? item.name.substring(0, 28) + '...' : item.name
  pdf.text(name, contentX, y + (label.height > 1.2 ? 0.25 : 0.18), { maxWidth: maxNameWidth })

  // Barcode
  const barcodeWidth = Math.min(contentWidth * 0.9, 2)
  const barcodeHeight = label.height > 1.2 ? 0.5 : 0.35
  const barcodeX = contentX + (contentWidth - barcodeWidth) / 2
  const barcodeY = y + (label.height > 1.2 ? 0.4 : 0.28)

  if (codeDataUrl) {
    try {
      pdf.addImage(codeDataUrl, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight)
    } catch (e) {
      console.error('Failed to add barcode to PDF:', e)
    }
  }

  // Label ID below barcode
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, contentX + contentWidth / 2, y + label.height - 0.08, { align: 'center' })
}

/**
 * Draw a standard QR label (small/medium)
 */
function drawStandardLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)[keyof typeof LABEL_SIZES],
  codeDataUrl: string,
  logoDataUrl?: string
) {
  const padding = 0.08
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // QR code size based on label size
  const qrSize = label.height > 1.2 ? 0.7 : 0.5
  const qrX = x + label.width - qrSize - padding
  const qrY = y + (label.height - qrSize) / 2

  // Item name (left side)
  pdf.setFontSize(label.height > 1.2 ? 10 : 8)
  pdf.setFont('helvetica', 'bold')
  const nameWidth = contentWidth - qrSize - 0.1
  const nameLines = pdf.splitTextToSize(item.name, nameWidth)
  pdf.text(nameLines.slice(0, 2), contentX, y + 0.2)

  // Details (if included and space permits)
  if (config.selectedDetails.length > 0 && label.height > 1) {
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    const detail = getDetailValue(item, config.selectedDetails[0])
    pdf.text(`${detail.label}: ${detail.value}`, contentX, y + label.height - 0.25, { maxWidth: nameWidth })
  }

  // QR Code
  if (codeDataUrl) {
    try {
      pdf.addImage(codeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    } catch (e) {
      console.error('Failed to add QR code to PDF:', e)
    }
  }

  // Label ID below QR
  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, qrX + qrSize / 2, y + label.height - 0.05, { align: 'center' })
}

/**
 * Calculate labels per sheet
 */
export function calculateLabelsPerSheet(
  paperSize: 'letter' | 'a4',
  labelSize: 'small' | 'medium' | 'large' | 'qr_large'
): { rows: number; cols: number; total: number } {
  const label = LABEL_SIZES[labelSize]
  return {
    rows: label.rows,
    cols: label.cols,
    total: label.perSheet,
  }
}

/**
 * Get compatible Avery products for a label size
 */
export function getCompatibleProducts(labelSize: 'small' | 'medium' | 'large' | 'qr_large'): string[] {
  const products: Record<string, string[]> = {
    small: ['Avery 5160', 'Avery 8160', 'Avery 5260'],
    medium: ['Avery 6871', '30330'],
    large: ['Avery 5163', 'Avery 8463', 'Avery 5264'],
    qr_large: ['Half Sheet', 'Avery 8126'],
  }
  return products[labelSize] || []
}
