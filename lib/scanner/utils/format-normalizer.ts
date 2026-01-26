/**
 * Barcode format normalizer
 *
 * Different scanner engines use different format names for the same barcode types.
 * This utility normalizes them to a consistent format for the rest of the application.
 */

import type { EngineType } from '../engines/types'

/**
 * Format mappings for each engine
 * Maps engine-specific format names to normalized names
 */
const FORMAT_MAPS: Record<EngineType, Record<string, string>> = {
  // Native BarcodeDetector API uses lowercase with underscores
  native: {
    qr_code: 'QR_CODE',
    ean_13: 'EAN_13',
    ean_8: 'EAN_8',
    code_128: 'CODE_128',
    code_39: 'CODE_39',
    code_93: 'CODE_93',
    codabar: 'CODABAR',
    upc_a: 'UPC_A',
    upc_e: 'UPC_E',
    itf: 'ITF',
    data_matrix: 'DATA_MATRIX',
    aztec: 'AZTEC',
    pdf417: 'PDF_417',
  },

  // ZBar uses mixed case with hyphens
  zbar: {
    'QR-Code': 'QR_CODE',
    'EAN-13': 'EAN_13',
    'EAN-8': 'EAN_8',
    'EAN-5': 'EAN_5',
    'EAN-2': 'EAN_2',
    'Code-128': 'CODE_128',
    'Code-93': 'CODE_93',
    'Code-39': 'CODE_39',
    CODABAR: 'CODABAR',
    'UPC-A': 'UPC_A',
    'UPC-E': 'UPC_E',
    'I2/5': 'ITF',
    ISBN10: 'ISBN_10',
    ISBN13: 'ISBN_13',
    QRCODE: 'QR_CODE',
    DATABAR: 'DATABAR',
    'DATABAR-EXP': 'DATABAR_EXP',
  },

  // jsQR only returns QR codes
  jsqr: {
    QR: 'QR_CODE',
    qr: 'QR_CODE',
  },
}

/**
 * Normalize a barcode format from an engine-specific name to a standard name
 *
 * @param format - The format name as returned by the engine
 * @param engine - Which engine returned this format
 * @returns Normalized format name (e.g., 'EAN_13', 'QR_CODE')
 *
 * @example
 * normalizeFormat('ean_13', 'native')  // Returns 'EAN_13'
 * normalizeFormat('EAN-13', 'zbar')    // Returns 'EAN_13'
 * normalizeFormat('QR', 'jsqr')        // Returns 'QR_CODE'
 */
export function normalizeFormat(format: string, engine: EngineType): string {
  const map = FORMAT_MAPS[engine]
  if (!map) {
    return format.toUpperCase().replace(/-/g, '_')
  }

  // Try exact match first
  if (map[format]) {
    return map[format]
  }

  // Try lowercase match
  const lowerFormat = format.toLowerCase()
  if (map[lowerFormat]) {
    return map[lowerFormat]
  }

  // Fallback: uppercase and replace hyphens with underscores
  return format.toUpperCase().replace(/-/g, '_')
}

/**
 * Check if a format is a 1D barcode (linear)
 */
export function is1DFormat(format: string): boolean {
  const formats1D = [
    'EAN_13',
    'EAN_8',
    'EAN_5',
    'EAN_2',
    'UPC_A',
    'UPC_E',
    'CODE_128',
    'CODE_39',
    'CODE_93',
    'CODABAR',
    'ITF',
    'ISBN_10',
    'ISBN_13',
    'DATABAR',
    'DATABAR_EXP',
  ]
  return formats1D.includes(format)
}

/**
 * Check if a format is a 2D barcode (matrix)
 */
export function is2DFormat(format: string): boolean {
  const formats2D = ['QR_CODE', 'DATA_MATRIX', 'AZTEC', 'PDF_417']
  return formats2D.includes(format)
}
