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

export type LabelSize = 'extra_large' | 'large' | 'medium' | 'small' | 'extra_small' | 'thermal'
export type PaperSize = 'letter' | 'a4' | 'label_printer'

export interface LabelPDFConfig {
  labelType: 'qr' | 'barcode'
  paperSize: PaperSize
  labelSize: LabelSize
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
  label_printer: { width: 2, height: 0.75 },
}

// Sortly-compatible label dimensions in inches
const LABEL_SIZES = {
  // QR Label sizes (US Letter)
  extra_large: { width: 5.5, height: 8.5, perSheet: 2, cols: 1, rows: 2 },
  large: { width: 4, height: 3.333, perSheet: 6, cols: 2, rows: 3 },
  medium: { width: 4, height: 2, perSheet: 10, cols: 2, rows: 5 },
  small: { width: 4, height: 1.333, perSheet: 14, cols: 2, rows: 7 },
  extra_small: { width: 2.625, height: 1, perSheet: 30, cols: 3, rows: 10 },
  // Thermal printer (DYMO)
  thermal: { width: 2, height: 0.75, perSheet: 1, cols: 1, rows: 1 },
}

// Per-label-size margins (Avery specifications)
const LABEL_MARGINS: Record<LabelSize, { top: number; left: number; hGap: number; vGap: number }> = {
  extra_large: { top: 0, left: 1.5, hGap: 0, vGap: 0 },
  large: { top: 0.5, left: 0.156, hGap: 0, vGap: 0 },
  medium: { top: 0.5, left: 0.156, hGap: 0, vGap: 0 },
  small: { top: 0.833, left: 0.156, hGap: 0, vGap: 0 },
  extra_small: { top: 0.5, left: 0.1875, hGap: 0.125, vGap: 0 },
  thermal: { top: 0, left: 0, hGap: 0, vGap: 0 },
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

  // For thermal printers, use label size as paper size
  const pdfWidth = config.labelSize === 'thermal' ? label.width : paper.width
  const pdfHeight = config.labelSize === 'thermal' ? label.height : paper.height

  // Create PDF with paper size in inches
  const pdf = new jsPDF({
    orientation: config.labelSize === 'thermal' ? 'landscape' : 'portrait',
    unit: 'in',
    format: [pdfWidth, pdfHeight],
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

      // Add new page if needed (except for first label)
      if (currentPosition > 0 && currentPosition % labelsPerPage === 0 && labelsOnCurrentPage > 0) {
        pdf.addPage()
        labelsOnCurrentPage = 0
      }

      // Calculate label position using per-label margins (thermal labels start at 0,0)
      const margins = LABEL_MARGINS[config.labelSize]
      const x = config.labelSize === 'thermal' ? 0 : margins.left + col * (label.width + margins.hGap)
      const y = config.labelSize === 'thermal' ? 0 : margins.top + row * (label.height + margins.vGap)

      // Draw label based on type and size
      if (config.labelSize === 'thermal') {
        drawThermalLabel(pdf, item, config, x, y, label, codeDataUrl)
      } else if (config.labelSize === 'extra_large') {
        drawExtraLargeLabel(pdf, item, config, x, y, label, codeDataUrl, photoDataUrl, logoDataUrl)
      } else if (config.labelSize === 'large') {
        drawLargeLabel(pdf, item, config, x, y, label, codeDataUrl, photoDataUrl, logoDataUrl)
      } else if (config.labelSize === 'medium') {
        drawMediumLabel(pdf, item, config, x, y, label, codeDataUrl, logoDataUrl)
      } else if (config.labelSize === 'small') {
        drawSmallLabel(pdf, item, config, x, y, label, codeDataUrl)
      } else if (config.labelSize === 'extra_small') {
        drawExtraSmallLabel(pdf, item, config, x, y, label, codeDataUrl)
      }

      currentPosition++
      labelsOnCurrentPage++
    }
  }

  return pdf.output('blob')
}

/**
 * Draw Extra Large label (5.5" x 8.5" half-sheet format)
 * Supports: photo, logo, up to 3 details, note
 */
function drawExtraLargeLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['extra_large'],
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

  // Details section (up to 3 details)
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
 * Draw Large label (3.333" x 4" format)
 * Supports: photo or logo, up to 2 details, note
 */
function drawLargeLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['large'],
  codeDataUrl: string,
  photoDataUrl?: string | null,
  logoDataUrl?: string
) {
  const padding = 0.15
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // Item name (bold)
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  const nameLines = pdf.splitTextToSize(item.name, contentWidth - 1.2)
  pdf.text(nameLines.slice(0, 2), contentX, y + 0.3)

  // QR Code in top right
  const qrSize = 1.0
  const qrX = x + label.width - qrSize - padding
  const qrY = y + padding
  if (codeDataUrl) {
    try {
      pdf.addImage(codeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    } catch (e) {
      console.error('Failed to add QR code to PDF:', e)
    }
  }

  // Label ID below QR
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, qrX + qrSize / 2, qrY + qrSize + 0.12, { align: 'center' })

  // Separator line
  const separatorY = y + 0.7 + Math.min(nameLines.length, 2) * 0.18
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.01)
  pdf.line(contentX, separatorY, contentX + contentWidth, separatorY)

  // Details section (up to 2 details)
  let detailY = separatorY + 0.2
  pdf.setFontSize(9)

  for (const field of config.selectedDetails.slice(0, 2)) {
    const detail = getDetailValue(item, field)
    pdf.setFont('helvetica', 'bold')
    pdf.text(detail.label, contentX, detailY)
    pdf.setFont('helvetica', 'normal')
    pdf.text(detail.value, contentX, detailY + 0.15)
    detailY += 0.4
  }

  // Photo at bottom left (if included)
  if (config.includePhoto && photoDataUrl) {
    const photoSize = 0.8
    const photoY = y + label.height - photoSize - padding
    try {
      pdf.addImage(photoDataUrl, 'JPEG', contentX, photoY, photoSize, photoSize)
    } catch (e) {
      // Skip photo on error
    }
  }

  // Note (if included)
  if (config.includeNote && config.note) {
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'italic')
    const noteLines = pdf.splitTextToSize(config.note, contentWidth)
    pdf.text(noteLines.slice(0, 1), contentX, y + label.height - 0.1)
  }
}

/**
 * Draw Medium label (2" x 4" horizontal format)
 * Supports: 1 detail only
 */
function drawMediumLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['medium'],
  codeDataUrl: string,
  logoDataUrl?: string
) {
  const padding = 0.1
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // QR code on right side
  const qrSize = label.height - padding * 2 - 0.2
  const qrX = x + label.width - qrSize - padding
  const qrY = y + padding

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
  pdf.text(labelId, qrX + qrSize / 2, y + label.height - 0.08, { align: 'center' })

  // Item name on left side
  const nameWidth = contentWidth - qrSize - 0.2
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  const nameLines = pdf.splitTextToSize(item.name, nameWidth)
  pdf.text(nameLines.slice(0, 2), contentX, y + 0.35)

  // Single detail (if selected)
  if (config.selectedDetails.length > 0) {
    const detail = getDetailValue(item, config.selectedDetails[0])
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${detail.label}: ${detail.value}`, contentX, y + label.height - 0.35, { maxWidth: nameWidth })
  }
}

/**
 * Draw Small label (1.333" x 4" compact horizontal format)
 * No additional content - just name and QR
 */
function drawSmallLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['small'],
  codeDataUrl: string
) {
  const padding = 0.08
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // QR code on right side
  const qrSize = label.height - padding * 2 - 0.15
  const qrX = x + label.width - qrSize - padding
  const qrY = y + (label.height - qrSize) / 2

  if (codeDataUrl) {
    try {
      pdf.addImage(codeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    } catch (e) {
      console.error('Failed to add QR code to PDF:', e)
    }
  }

  // Item name on left side
  const nameWidth = contentWidth - qrSize - 0.15
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  const nameLines = pdf.splitTextToSize(item.name, nameWidth)
  pdf.text(nameLines.slice(0, 2), contentX, y + 0.3)

  // Label ID below name
  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, contentX, y + label.height - 0.1)
}

/**
 * Draw Extra Small label (1" x 2.625" minimal format)
 * Only name and QR code
 */
function drawExtraSmallLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['extra_small'],
  codeDataUrl: string
) {
  const padding = 0.06
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // QR code on right
  const qrSize = label.height - padding * 2
  const qrX = x + label.width - qrSize - padding
  const qrY = y + padding

  if (codeDataUrl) {
    try {
      pdf.addImage(codeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    } catch (e) {
      console.error('Failed to add QR code to PDF:', e)
    }
  }

  // Item name on left (truncated)
  const nameWidth = contentWidth - qrSize - 0.1
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  const name = item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name
  const nameLines = pdf.splitTextToSize(name, nameWidth)
  pdf.text(nameLines.slice(0, 2), contentX, y + 0.25)

  // Label ID at bottom
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, contentX, y + label.height - 0.08)
}

/**
 * Draw Thermal label (0.75" x 2" for DYMO printers)
 * Barcode only with item name
 */
function drawThermalLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['thermal'],
  codeDataUrl: string
) {
  const padding = 0.05
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // Item name (compact, top)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  const name = item.name.length > 25 ? item.name.substring(0, 23) + '...' : item.name
  pdf.text(name, contentX, y + 0.15, { maxWidth: contentWidth })

  // Barcode centered
  const barcodeWidth = Math.min(contentWidth * 0.95, 1.8)
  const barcodeHeight = 0.35
  const barcodeX = x + (label.width - barcodeWidth) / 2
  const barcodeY = y + 0.25

  if (codeDataUrl) {
    try {
      pdf.addImage(codeDataUrl, 'PNG', barcodeX, barcodeY, barcodeWidth, barcodeHeight)
    } catch (e) {
      console.error('Failed to add barcode to PDF:', e)
    }
  }

  // Label ID at bottom
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, x + label.width / 2, y + label.height - 0.05, { align: 'center' })
}

/**
 * Calculate labels per sheet
 */
export function calculateLabelsPerSheet(
  paperSize: PaperSize,
  labelSize: LabelSize
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
export function getCompatibleProducts(labelSize: LabelSize): string[] {
  const products: Record<LabelSize, string[]> = {
    extra_large: ['Avery 8126', 'Half Sheet'],
    large: ['Avery 5164', 'Avery 8164'],
    medium: ['Avery 5163', 'Avery 8163'],
    small: ['Avery 5162', 'Avery 8162'],
    extra_small: ['Avery 5160', 'Avery 8160'],
    thermal: ['DYMO 30330', 'DYMO 30252'],
  }
  return products[labelSize] || []
}
