import QRCode from 'qrcode'

export interface LabelData {
  id: string
  name: string
  sku?: string
  barcode?: string
  quantity?: number
  location?: string
  customText?: string
}

export interface LabelConfig {
  type: 'qr' | 'barcode'
  paperSize: 'letter' | 'a4'
  labelSize: 'small' | 'medium' | 'large'
  includeDetails: boolean
  includeLogo: boolean
  includeNote: boolean
  note?: string
}

export const PAPER_SIZES = {
  letter: { width: 8.5, height: 11, name: 'US Letter (8.5in x 11in)' },
  a4: { width: 8.27, height: 11.69, name: 'A4 (210mm x 297mm)' },
}

export const LABEL_SIZES = {
  small: { width: 2, height: 1, name: 'Small (2in x 1in)', perSheet: 30 },
  medium: { width: 2.375, height: 1.25, name: 'Medium (2 3/8in x 1 1/4in)', perSheet: 18 },
  large: { width: 4, height: 2, name: 'Large (4in x 2in)', perSheet: 10 },
}

/**
 * Generate a QR code as a data URL
 */
export async function generateQRCode(data: string, size: number = 128): Promise<string> {
  try {
    const url = await QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
    return url
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

/**
 * Generate a simple barcode SVG (Code 39 style visual representation)
 * Note: This creates a visual representation, not a scannable barcode
 * For production use, consider using a proper barcode library like bwip-js
 */
export function generateBarcodePattern(data: string): number[] {
  // Simple pseudo-barcode pattern based on character codes
  const pattern: number[] = []
  const text = data.substring(0, 20) // Limit length

  for (const char of text) {
    const code = char.charCodeAt(0)
    pattern.push(
      code % 4 + 1,
      1,
      (code >> 2) % 4 + 1,
      1,
      (code >> 4) % 3 + 1,
      2,
    )
  }

  return pattern
}

/**
 * Create barcode SVG element
 */
export function createBarcodeSVG(data: string, width: number = 200, height: number = 60): string {
  const pattern = generateBarcodePattern(data)
  const totalUnits = pattern.reduce((a, b) => a + b, 0)
  const unitWidth = width / totalUnits

  let x = 0
  let isBar = true
  const bars: string[] = []

  for (const units of pattern) {
    if (isBar) {
      bars.push(`<rect x="${x}" y="0" width="${units * unitWidth}" height="${height}" fill="black"/>`)
    }
    x += units * unitWidth
    isBar = !isBar
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${bars.join('')}
  </svg>`
}

/**
 * Format a label identifier
 */
export function formatLabelId(id: string): string {
  // Create a short readable ID from UUID
  const short = id.replace(/-/g, '').substring(0, 10).toUpperCase()
  return `${short.substring(0, 5)}-${short.substring(5)}`
}

/**
 * Calculate labels per sheet based on paper and label size
 */
export function calculateLabelsPerSheet(
  paperSize: keyof typeof PAPER_SIZES,
  labelSize: keyof typeof LABEL_SIZES
): { rows: number; cols: number; total: number } {
  const paper = PAPER_SIZES[paperSize]
  const label = LABEL_SIZES[labelSize]

  // Account for margins (0.5in on each side)
  const usableWidth = paper.width - 1
  const usableHeight = paper.height - 1

  const cols = Math.floor(usableWidth / label.width)
  const rows = Math.floor(usableHeight / label.height)

  return {
    rows,
    cols,
    total: rows * cols,
  }
}

/**
 * Get compatible label products
 */
export function getCompatibleProducts(labelSize: keyof typeof LABEL_SIZES): string[] {
  const products: Record<string, string[]> = {
    small: ['Avery 5160', 'Avery 8160'],
    medium: ['Avery 6871', 'Avery 30330'],
    large: ['Avery 5163', 'Avery 8463'],
  }

  return products[labelSize] || []
}
