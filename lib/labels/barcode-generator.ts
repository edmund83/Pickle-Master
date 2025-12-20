export type BarcodeFormat = 'code128' | 'code39' | 'ean13' | 'upca' | 'qrcode'

export interface BarcodeOptions {
  width?: number
  height?: number
  includeText?: boolean
  scale?: number
  textSize?: number
}

const DEFAULT_OPTIONS: BarcodeOptions = {
  width: 200,
  height: 60,
  includeText: true,
  scale: 3,
  textSize: 10,
}

/**
 * Generate a scannable barcode as a base64 data URL
 * Uses dynamic import to load bwip-js only on client-side
 */
export async function generateScannableBarcode(
  data: string,
  format: BarcodeFormat = 'code128',
  options: BarcodeOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Map our format names to bwip-js bcid values
  const bcidMap: Record<BarcodeFormat, string> = {
    code128: 'code128',
    code39: 'code39',
    ean13: 'ean13',
    upca: 'upca',
    qrcode: 'qrcode',
  }

  try {
    // Dynamic import bwip-js for client-side only
    const bwipjs = await import('bwip-js')

    const canvas = document.createElement('canvas')

    // Build options object - bwip-js doesn't accept undefined values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bwipOptions: any = {
      bcid: bcidMap[format],
      text: data,
      scale: opts.scale,
      includetext: opts.includeText && format !== 'qrcode',
      textxalign: 'center',
      textsize: opts.textSize,
    }

    // Set dimensions based on format
    if (format === 'qrcode') {
      // QR codes need both width and height
      bwipOptions.width = opts.width! / opts.scale!
      bwipOptions.height = opts.width! / opts.scale!
    } else {
      // Linear barcodes only need height (width is auto-calculated)
      bwipOptions.height = opts.height! / opts.scale!
    }

    // Use bwip-js to render to canvas
    bwipjs.toCanvas(canvas, bwipOptions)

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating barcode:', error)
    throw new Error(`Failed to generate ${format} barcode: ${error}`)
  }
}

/**
 * Generate a barcode for an item that doesn't have one
 * Creates a Code128 barcode from a prefix + item ID hash
 */
export function generateItemBarcode(itemId: string, prefix: string = 'PKL'): string {
  // Take first 8 chars of UUID (without dashes) and convert to uppercase
  const idPart = itemId.replace(/-/g, '').substring(0, 8).toUpperCase()
  return `${prefix}${idPart}`
}

/**
 * Validate barcode data for a given format
 */
export function validateBarcodeData(data: string, format: BarcodeFormat): { valid: boolean; error?: string } {
  if (!data || data.trim() === '') {
    return { valid: false, error: 'Barcode data cannot be empty' }
  }

  switch (format) {
    case 'code128':
      // Code128 accepts ASCII 0-127
      if (!/^[\x00-\x7F]+$/.test(data)) {
        return { valid: false, error: 'Code128 only accepts ASCII characters' }
      }
      if (data.length > 48) {
        return { valid: false, error: 'Code128 data too long (max 48 characters)' }
      }
      return { valid: true }

    case 'code39':
      // Code39 accepts uppercase letters, numbers, and some special chars
      if (!/^[A-Z0-9\-. $/+%*]+$/.test(data.toUpperCase())) {
        return { valid: false, error: 'Code39 only accepts uppercase letters, numbers, and -. $/+%*' }
      }
      if (data.length > 43) {
        return { valid: false, error: 'Code39 data too long (max 43 characters)' }
      }
      return { valid: true }

    case 'ean13':
      // EAN-13 is exactly 12 or 13 digits (13th is check digit)
      if (!/^\d{12,13}$/.test(data)) {
        return { valid: false, error: 'EAN-13 requires exactly 12-13 digits' }
      }
      return { valid: true }

    case 'upca':
      // UPC-A is exactly 11 or 12 digits (12th is check digit)
      if (!/^\d{11,12}$/.test(data)) {
        return { valid: false, error: 'UPC-A requires exactly 11-12 digits' }
      }
      return { valid: true }

    case 'qrcode':
      // QR codes can handle most data, but have size limits
      if (data.length > 2953) {
        return { valid: false, error: 'QR code data too long (max 2953 characters)' }
      }
      return { valid: true }

    default:
      return { valid: true }
  }
}

/**
 * Get human-readable format name
 */
export function getFormatDisplayName(format: BarcodeFormat): string {
  const names: Record<BarcodeFormat, string> = {
    code128: 'Code 128',
    code39: 'Code 39',
    ean13: 'EAN-13',
    upca: 'UPC-A',
    qrcode: 'QR Code',
  }
  return names[format] || format
}

/**
 * Check if a barcode format is numeric-only
 */
export function isNumericOnlyFormat(format: BarcodeFormat): boolean {
  return format === 'ean13' || format === 'upca'
}
