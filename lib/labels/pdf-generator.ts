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

// Simplified label sizes
export type LabelSize =
  // QR sheet sizes
  | 'large' | 'medium' | 'medium_long' | 'medium_tall' | 'small'
  // Barcode sheet size
  | 'barcode_medium'
  // Label printer sizes
  | 'lp_large' | 'lp_medium' | 'lp_medium_long' | 'lp_medium_tall' | 'lp_small' | 'lp_barcode'
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

// Simplified label dimensions in inches
const LABEL_SIZES: Record<LabelSize, { width: number; height: number; perSheet: number; cols: number; rows: number }> = {
  // QR sheet sizes (5 sizes)
  large: { width: 4, height: 6, perSheet: 2, cols: 2, rows: 1 },
  medium: { width: 4, height: 2.25, perSheet: 8, cols: 2, rows: 4 },
  medium_long: { width: 4, height: 1, perSheet: 20, cols: 2, rows: 10 },
  medium_tall: { width: 2, height: 4, perSheet: 4, cols: 4, rows: 1 },
  small: { width: 2, height: 1, perSheet: 40, cols: 4, rows: 10 },
  // Barcode sheet size (1 size)
  barcode_medium: { width: 2, height: 0.75, perSheet: 56, cols: 4, rows: 14 },
  // Label printer sizes (same dimensions, single label per sheet)
  lp_large: { width: 4, height: 6, perSheet: 1, cols: 1, rows: 1 },
  lp_medium: { width: 4, height: 2.25, perSheet: 1, cols: 1, rows: 1 },
  lp_medium_long: { width: 4, height: 1, perSheet: 1, cols: 1, rows: 1 },
  lp_medium_tall: { width: 2, height: 4, perSheet: 1, cols: 1, rows: 1 },
  lp_small: { width: 2, height: 1, perSheet: 1, cols: 1, rows: 1 },
  lp_barcode: { width: 2, height: 0.75, perSheet: 1, cols: 1, rows: 1 },
}

// Per-label-size margins for sheet printing
const LABEL_MARGINS: Record<LabelSize, { top: number; left: number; hGap: number; vGap: number }> = {
  // QR sheet sizes
  large: { top: 0.5, left: 0.25, hGap: 0, vGap: 0 },
  medium: { top: 0.5, left: 0.25, hGap: 0, vGap: 0.25 },
  medium_long: { top: 0.5, left: 0.25, hGap: 0, vGap: 0 },
  medium_tall: { top: 0.5, left: 0.25, hGap: 0, vGap: 0 },
  small: { top: 0.5, left: 0.25, hGap: 0, vGap: 0 },
  // Barcode sheet size
  barcode_medium: { top: 0.5, left: 0.25, hGap: 0, vGap: 0 },
  // Label printer sizes (no margins - direct print)
  lp_large: { top: 0, left: 0, hGap: 0, vGap: 0 },
  lp_medium: { top: 0, left: 0, hGap: 0, vGap: 0 },
  lp_medium_long: { top: 0, left: 0, hGap: 0, vGap: 0 },
  lp_medium_tall: { top: 0, left: 0, hGap: 0, vGap: 0 },
  lp_small: { top: 0, left: 0, hGap: 0, vGap: 0 },
  lp_barcode: { top: 0, left: 0, hGap: 0, vGap: 0 },
}

/**
 * Check if a label size is for a label printer (direct print)
 */
function isLabelPrinterSize(labelSize: LabelSize): boolean {
  return labelSize.startsWith('lp_')
}

function getPngDimensionsFromDataUrl(dataUrl: string): { width: number; height: number } | null {
  try {
    const base64 = dataUrl.split(',')[1]
    if (!base64) return null

    const binary = atob(base64)
    if (binary.length < 24) return null

    const getByte = (index: number) => binary.charCodeAt(index) & 0xff
    const width =
      ((getByte(16) << 24) | (getByte(17) << 16) | (getByte(18) << 8) | getByte(19)) >>> 0
    const height =
      ((getByte(20) << 24) | (getByte(21) << 16) | (getByte(22) << 8) | getByte(23)) >>> 0

    return width > 0 && height > 0 ? { width, height } : null
  } catch {
    return null
  }
}

function addPngImageContained(
  pdf: jsPDF,
  dataUrl: string,
  boxX: number,
  boxY: number,
  boxWidth: number,
  boxHeight: number
) {
  if (!dataUrl) return

  try {
    const dims = getPngDimensionsFromDataUrl(dataUrl)
    if (!dims) {
      pdf.addImage(dataUrl, 'PNG', boxX, boxY, boxWidth, boxHeight)
      return
    }

    const ratio = dims.width / dims.height
    let drawWidth = boxWidth
    let drawHeight = drawWidth / ratio

    if (drawHeight > boxHeight) {
      drawHeight = boxHeight
      drawWidth = drawHeight * ratio
    }

    const drawX = boxX + (boxWidth - drawWidth) / 2
    const drawY = boxY + (boxHeight - drawHeight) / 2

    pdf.addImage(dataUrl, 'PNG', drawX, drawY, drawWidth, drawHeight)
  } catch (e) {
    console.error('Failed to add image to PDF:', e)
  }
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

  // For label printers, use label size as paper size
  const isLabelPrinter = isLabelPrinterSize(config.labelSize)
  const pdfWidth = isLabelPrinter ? label.width : paper.width
  const pdfHeight = isLabelPrinter ? label.height : paper.height

  // Create PDF with paper size in inches
  const pdf = new jsPDF({
    orientation: isLabelPrinter ? (label.width > label.height ? 'landscape' : 'portrait') : 'portrait',
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

      // Calculate label position using per-label margins (label printer sizes start at 0,0)
      const margins = LABEL_MARGINS[config.labelSize]
      const x = isLabelPrinterSize(config.labelSize) ? 0 : margins.left + col * (label.width + margins.hGap)
      const y = isLabelPrinterSize(config.labelSize) ? 0 : margins.top + row * (label.height + margins.vGap)

      // Draw label based on type and size
      if (isLabelPrinterSize(config.labelSize)) {
        drawLabelPrinterLabel(pdf, item, config, x, y, label, codeDataUrl)
      } else if (config.labelSize === 'large') {
        // Large (4×6) - supports photo, logo, 3 details, note
        drawLargeLabel(pdf, item, config, x, y, label, codeDataUrl, photoDataUrl, logoDataUrl)
      } else if (config.labelSize === 'medium') {
        // Medium (4×2.25) - supports 2 details
        drawMediumLabel(pdf, item, config, x, y, label, codeDataUrl)
      } else if (config.labelSize === 'medium_long') {
        // Medium long (4×1) - supports 1 detail
        drawMediumLongLabel(pdf, item, config, x, y, label, codeDataUrl)
      } else if (config.labelSize === 'medium_tall') {
        // Medium tall (2×4) - supports photo, 2 details, note
        drawMediumTallLabel(pdf, item, config, x, y, label, codeDataUrl, photoDataUrl)
      } else if (config.labelSize === 'small') {
        // Small (2×1) - name and QR only
        drawSmallLabel(pdf, item, config, x, y, label, codeDataUrl)
      } else if (config.labelSize === 'barcode_medium') {
        // Barcode medium (2×0.75) - barcode only
        drawBarcodeMediumLabel(pdf, item, config, x, y, label, codeDataUrl)
      }

      currentPosition++
      labelsOnCurrentPage++
    }
  }

  return pdf.output('blob')
}

/**
 * Draw Large label (4" x 6" format)
 * Supports: photo, logo, up to 3 details, note
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
  _logoDataUrl?: string
) {
  const padding = 0.25
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // Item name (large, bold)
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  const nameLines = pdf.splitTextToSize(item.name, contentWidth)
  pdf.text(nameLines.slice(0, 2), contentX, y + 0.5)

  // Separator line
  const separatorY = y + 0.8 + Math.min(nameLines.length, 2) * 0.25
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.01)
  pdf.line(contentX, separatorY, contentX + contentWidth, separatorY)

  // Details section (up to 3 details)
  let detailY = separatorY + 0.25
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')

  for (const field of config.selectedDetails.slice(0, 3)) {
    const detail = getDetailValue(item, field)
    pdf.setFont('helvetica', 'bold')
    pdf.text(detail.label, contentX, detailY)
    pdf.setFont('helvetica', 'normal')
    pdf.text(detail.value, contentX, detailY + 0.18)
    detailY += 0.45
  }

  // Bottom section with photo and QR
  const bottomY = y + label.height - 2.2

  // Photo (if included)
  if (config.includePhoto && photoDataUrl) {
    try {
      pdf.addImage(photoDataUrl, 'JPEG', contentX, bottomY, 1.8, 1.8)
    } catch (e) {
      // Photo failed to load, draw placeholder
      pdf.setDrawColor(200)
      pdf.setFillColor(240, 240, 240)
      pdf.rect(contentX, bottomY, 1.8, 1.8, 'FD')
      pdf.setFontSize(8)
      pdf.text('Photo', contentX + 0.6, bottomY + 0.9)
    }
  }

  // QR Code
  const qrSize = 1.5
  const qrX = config.includePhoto && photoDataUrl ? contentX + 2.2 : contentX + contentWidth - qrSize - 0.2
  const qrY = bottomY
  if (codeDataUrl) {
    try {
      pdf.addImage(codeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
    } catch (e) {
      console.error('Failed to add QR code to PDF:', e)
    }
  }

  // Label ID below QR
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, qrX + qrSize / 2, qrY + qrSize + 0.15, { align: 'center' })

  // Note (if included)
  if (config.includeNote && config.note) {
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'italic')
    const noteLines = pdf.splitTextToSize(config.note, contentWidth)
    pdf.text(noteLines.slice(0, 2), contentX, y + label.height - 0.2)
  }
}

/**
 * Draw Medium label (4" x 2.25" horizontal format)
 * Supports: up to 2 details
 */
function drawMediumLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['medium'],
  codeDataUrl: string
) {
  const padding = 0.12
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // QR code on right side
  const qrSize = label.height - padding * 2 - 0.15
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
  pdf.text(labelId, qrX + qrSize / 2, y + label.height - 0.06, { align: 'center' })

  // Item name on left side
  const nameWidth = contentWidth - qrSize - 0.25
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  const nameLines = pdf.splitTextToSize(item.name, nameWidth)
  pdf.text(nameLines.slice(0, 2), contentX, y + 0.35)

  // Details (up to 2)
  let detailY = y + 0.85
  pdf.setFontSize(8)
  for (const field of config.selectedDetails.slice(0, 2)) {
    const detail = getDetailValue(item, field)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${detail.label}: ${detail.value}`, contentX, detailY, { maxWidth: nameWidth })
    detailY += 0.2
  }
}

/**
 * Draw Medium Long label (4" x 1" horizontal format)
 * Supports: 1 detail only
 */
function drawMediumLongLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['medium_long'],
  codeDataUrl: string
) {
  const padding = 0.08
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // QR code on right side (square, fits in height)
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

  // Item name on left side
  const nameWidth = contentWidth - qrSize - 0.15
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  const nameLines = pdf.splitTextToSize(item.name, nameWidth)
  pdf.text(nameLines.slice(0, 1), contentX, y + 0.35)

  // Single detail (if selected)
  if (config.selectedDetails.length > 0) {
    const detail = getDetailValue(item, config.selectedDetails[0])
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`${detail.label}: ${detail.value}`, contentX, y + 0.6, { maxWidth: nameWidth })
  }

  // Label ID at bottom left
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, contentX, y + label.height - 0.08)
}

/**
 * Draw Medium Tall label (2" x 4" vertical format)
 * Supports: photo, up to 2 details, note
 */
function drawMediumTallLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['medium_tall'],
  codeDataUrl: string,
  photoDataUrl?: string | null
) {
  const padding = 0.12
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // Item name (top)
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  const nameLines = pdf.splitTextToSize(item.name, contentWidth)
  pdf.text(nameLines.slice(0, 2), contentX, y + 0.3)

  // Separator line
  const separatorY = y + 0.55 + Math.min(nameLines.length, 2) * 0.15
  pdf.setDrawColor(200, 200, 200)
  pdf.setLineWidth(0.01)
  pdf.line(contentX, separatorY, contentX + contentWidth, separatorY)

  // Details (up to 2)
  let detailY = separatorY + 0.2
  pdf.setFontSize(8)
  for (const field of config.selectedDetails.slice(0, 2)) {
    const detail = getDetailValue(item, field)
    pdf.setFont('helvetica', 'bold')
    pdf.text(detail.label, contentX, detailY)
    pdf.setFont('helvetica', 'normal')
    pdf.text(detail.value, contentX, detailY + 0.15)
    detailY += 0.35
  }

  // Photo (if included)
  if (config.includePhoto && photoDataUrl) {
    const photoSize = 1.0
    const photoY = y + 1.8
    try {
      pdf.addImage(photoDataUrl, 'JPEG', contentX + (contentWidth - photoSize) / 2, photoY, photoSize, photoSize)
    } catch (e) {
      // Skip photo on error
    }
  }

  // QR Code at bottom
  const qrSize = 1.2
  const qrX = contentX + (contentWidth - qrSize) / 2
  const qrY = y + label.height - qrSize - 0.35
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
  pdf.text(labelId, qrX + qrSize / 2, y + label.height - 0.12, { align: 'center' })

  // Note (if included)
  if (config.includeNote && config.note) {
    pdf.setFontSize(6)
    pdf.setFont('helvetica', 'italic')
    const noteLines = pdf.splitTextToSize(config.note, contentWidth)
    pdf.text(noteLines.slice(0, 1), contentX, y + label.height - 0.05)
  }
}

/**
 * Draw Small label (2" x 1" compact horizontal format)
 * No additional content - just name and QR
 */
function drawSmallLabel(
  pdf: jsPDF,
  item: LabelItem,
  _config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['small'],
  codeDataUrl: string
) {
  const padding = 0.06
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // QR code on right side
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

  // Item name on left side (truncated if needed)
  const nameWidth = contentWidth - qrSize - 0.1
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  const name = item.name.length > 25 ? item.name.substring(0, 23) + '...' : item.name
  const nameLines = pdf.splitTextToSize(name, nameWidth)
  pdf.text(nameLines.slice(0, 2), contentX, y + 0.25)

  // Label ID at bottom left
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'normal')
  const labelId = formatLabelId(item.id)
  pdf.text(labelId, contentX, y + label.height - 0.08)
}

/**
 * Draw Barcode Medium label (2" x 0.75" format)
 * Compact barcode format with name
 */
function drawBarcodeMediumLabel(
  pdf: jsPDF,
  item: LabelItem,
  _config: LabelPDFConfig,
  x: number,
  y: number,
  label: (typeof LABEL_SIZES)['barcode_medium'],
  codeDataUrl: string
) {
  const padding = 0.05
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // Item name (top, truncated)
  const name = item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  pdf.text(name, contentX, y + 0.15, { maxWidth: contentWidth })

  // Barcode (bottom)
  const barcodeBoxHeight = 0.4
  const barcodeBoxY = y + label.height - barcodeBoxHeight - padding
  addPngImageContained(pdf, codeDataUrl, contentX, barcodeBoxY, contentWidth, barcodeBoxHeight)
}

/**
 * Draw Label Printer label (direct print to label printer)
 * Compact format for label printers (barcode or QR) with item name
 */
function drawLabelPrinterLabel(
  pdf: jsPDF,
  item: LabelItem,
  config: LabelPDFConfig,
  x: number,
  y: number,
  label: { width: number; height: number; perSheet: number; cols: number; rows: number },
  codeDataUrl: string
) {
  const padding = 0.05
  const contentX = x + padding
  const contentWidth = label.width - padding * 2

  // Item name (compact, top)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'bold')
  const name = item.name.length > 25 ? item.name.substring(0, 23) + '...' : item.name
  const codeSize = config.labelType === 'qr' ? Math.min(label.height - padding * 2 - 0.1, 0.58) : null
  const nameWidth = codeSize ? label.width - padding * 3 - codeSize : contentWidth
  pdf.text(name, contentX, y + 0.15, { maxWidth: nameWidth })

  if (codeDataUrl) {
    try {
      if (config.labelType === 'qr') {
        const qrX = x + label.width - (codeSize || 0.55) - padding
        const qrY = y + padding
        const size = codeSize || 0.55
        pdf.addImage(codeDataUrl, 'PNG', qrX, qrY, size, size)
      } else {
        // Barcode centered
        const boxX = contentX
        const boxY = y + 0.22
        const boxWidth = contentWidth
        const boxHeight = 0.42
        addPngImageContained(pdf, codeDataUrl, boxX, boxY, boxWidth, boxHeight)
      }
    } catch (e) {
      console.error('Failed to add code to PDF:', e)
    }
  }

  // Label ID at bottom
  pdf.setFontSize(5)
  pdf.setFont('helvetica', 'normal')
  if (config.labelType === 'qr') {
    const labelId = formatLabelId(item.id)
    pdf.text(labelId, contentX, y + label.height - 0.05)
  }
}

/**
 * Calculate labels per sheet
 */
export function calculateLabelsPerSheet(
  _paperSize: PaperSize,
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
    // QR sheet sizes
    large: ['4x6 Shipping Labels'],
    medium: ['4x2.25 Address Labels'],
    medium_long: ['4x1 Labels'],
    medium_tall: ['2x4 Labels'],
    small: ['2x1 Labels'],
    // Barcode size
    barcode_medium: ['2x0.75 Barcode Labels'],
    // Label printer sizes - universal, works with any label printer
    lp_large: [],
    lp_medium: [],
    lp_medium_long: [],
    lp_medium_tall: [],
    lp_small: [],
    lp_barcode: [],
  }
  return products[labelSize] || []
}
