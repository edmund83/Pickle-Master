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
  label_printer: { width: 2, height: 0.75, name: 'Label Printer (DYMO)' },
}

// Standard label sizes
export const LABEL_SIZES = {
  // QR Label sizes (US Letter)
  extra_large: { width: 5.5, height: 8.5, name: 'Extra Large (5 1/2in x 8 1/2in)', perSheet: 2, cols: 1, rows: 2 },
  large: { width: 4, height: 3.333, name: 'Large (3 1/3in x 4in)', perSheet: 6, cols: 2, rows: 3 },
  medium: { width: 4, height: 2, name: 'Medium (2in x 4in)', perSheet: 10, cols: 2, rows: 5 },
  small: { width: 4, height: 1.333, name: 'Small (1 1/3in x 4in)', perSheet: 14, cols: 2, rows: 7 },
  extra_small: { width: 2.625, height: 1, name: 'Extra Small (1in x 2 5/8in)', perSheet: 30, cols: 3, rows: 10 },
  // Industry standard label sizes (calculated for US Letter 8.5" × 11")
  lp_1x3: { width: 1, height: 3, name: '1" × 3"', perSheet: 24, cols: 8, rows: 3 },
  lp_1_125x1_25: { width: 1.125, height: 1.25, name: '1.125" × 1.25"', perSheet: 56, cols: 7, rows: 8 },
  lp_1_1875x1: { width: 1.1875, height: 1, name: '1.1875" × 1"', perSheet: 70, cols: 7, rows: 10 },
  lp_1_2x0_85: { width: 1.2, height: 0.85, name: '1.2" × 0.85"', perSheet: 84, cols: 7, rows: 12 },
  lp_1_25x1: { width: 1.25, height: 1, name: '1.25" × 1"', perSheet: 60, cols: 6, rows: 10 },
  lp_2x1: { width: 2, height: 1, name: '2" × 1"', perSheet: 40, cols: 4, rows: 10 },
  lp_2_2x0_5: { width: 2.2, height: 0.5, name: '2.2" × 0.5"', perSheet: 60, cols: 3, rows: 20 },
  lp_2_25x1_25: { width: 2.25, height: 1.25, name: '2.25" × 1.25"', perSheet: 24, cols: 3, rows: 8 },
  lp_2_25x2_5: { width: 2.25, height: 2.5, name: '2.25" × 2.5"', perSheet: 12, cols: 3, rows: 4 },
  lp_2_25x0_5: { width: 2.25, height: 0.5, name: '2.25" × 0.5"', perSheet: 60, cols: 3, rows: 20 },
  lp_2_25x2: { width: 2.25, height: 2, name: '2.25" × 2"', perSheet: 15, cols: 3, rows: 5 },
  lp_3x3: { width: 3, height: 3, name: '3" × 3"', perSheet: 6, cols: 2, rows: 3 },
  lp_3x2: { width: 3, height: 2, name: '3" × 2"', perSheet: 10, cols: 2, rows: 5 },
  lp_4x1_5: { width: 4, height: 1.5, name: '4" × 1.5"', perSheet: 14, cols: 2, rows: 7 },
  lp_4x2: { width: 4, height: 2, name: '4" × 2"', perSheet: 10, cols: 2, rows: 5 },
  lp_4x2_5: { width: 4, height: 2.5, name: '4" × 2.5"', perSheet: 8, cols: 2, rows: 4 },
  lp_4x3: { width: 4, height: 3, name: '4" × 3"', perSheet: 6, cols: 2, rows: 3 },
  lp_4x5: { width: 4, height: 5, name: '4" × 5"', perSheet: 4, cols: 2, rows: 2 },
  lp_4x6: { width: 4, height: 6, name: '4" × 6"', perSheet: 2, cols: 2, rows: 1 },
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
  _paperSize: keyof typeof PAPER_SIZES,
  labelSize: keyof typeof LABEL_SIZES
): { rows: number; cols: number; total: number } {
  const label = LABEL_SIZES[labelSize]

  return {
    rows: label.rows,
    cols: label.cols,
    total: label.perSheet,
  }
}

/**
 * Get compatible label products (Avery and equivalents)
 */
export function getCompatibleProducts(labelSize: keyof typeof LABEL_SIZES): string[] {
  const products: Record<string, string[]> = {
    extra_large: ['Avery 8126', 'Half Sheet'],
    large: ['Avery 5164', 'Avery 8164'],
    medium: ['Avery 5163', 'Avery 8163'],
    small: ['Avery 5162', 'Avery 8162'],
    extra_small: ['Avery 5160', 'Avery 8160'],
    lp_1x3: [],
    lp_1_125x1_25: [],
    lp_1_1875x1: [],
    lp_1_2x0_85: [],
    lp_1_25x1: [],
    lp_2x1: [],
    lp_2_2x0_5: [],
    lp_2_25x1_25: [],
    lp_2_25x2_5: [],
    lp_2_25x0_5: [],
    lp_2_25x2: [],
    lp_3x3: [],
    lp_3x2: [],
    lp_4x1_5: [],
    lp_4x2: [],
    lp_4x2_5: [],
    lp_4x3: [],
    lp_4x5: [],
    lp_4x6: [],
  }

  return products[labelSize] || []
}
