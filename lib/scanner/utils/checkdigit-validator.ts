/**
 * Check Digit Validator
 *
 * Validates barcode check digits for common formats to catch scanning errors
 * before they enter the database. Invalid barcodes (damaged labels, low-quality
 * scans) can be caught early and prompt a rescan.
 *
 * Supported formats:
 * - UPC-A (12 digits)
 * - UPC-E (8 digits)
 * - EAN-13 (13 digits)
 * - EAN-8 (8 digits)
 * - ISBN-10 (10 characters, can end in X)
 * - ISBN-13 (13 digits)
 * - ITF/I2of5 (even number of digits, check digit optional)
 */

export interface ValidationResult {
  isValid: boolean
  /** Original barcode value */
  code: string
  /** Normalized format name */
  format: string
  /** Error message if invalid */
  error?: string
  /** Whether this format supports check digit validation */
  supportsValidation: boolean
}

/**
 * Formats that have mandatory check digits we can validate
 */
const VALIDATABLE_FORMATS = [
  'UPC_A',
  'UPC_E',
  'EAN_13',
  'EAN_8',
  'ISBN_10',
  'ISBN_13',
]

/**
 * Check if a format supports check digit validation
 */
export function supportsCheckDigitValidation(format: string): boolean {
  return VALIDATABLE_FORMATS.includes(format)
}

/**
 * Calculate UPC-A / EAN-13 / EAN-8 check digit using modulo 10 algorithm
 *
 * Algorithm:
 * 1. Sum digits in odd positions (1st, 3rd, 5th...) × weight
 * 2. Sum digits in even positions (2nd, 4th, 6th...) × weight
 * 3. Check digit = (10 - (sum mod 10)) mod 10
 *
 * For UPC-A: odd positions × 3, even positions × 1
 * For EAN-13/EAN-8: alternating weights starting from position 1
 */
function calculateMod10CheckDigit(digits: number[], oddWeight: number, evenWeight: number): number {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    // Position is 1-based for the algorithm
    const weight = (i + 1) % 2 === 1 ? oddWeight : evenWeight
    sum += digits[i] * weight
  }
  return (10 - (sum % 10)) % 10
}

/**
 * Validate UPC-A barcode (12 digits)
 * Check digit is last digit, calculated from first 11
 */
export function validateUPCA(code: string): ValidationResult {
  const format = 'UPC_A'

  // Must be exactly 12 digits
  if (!/^\d{12}$/.test(code)) {
    return {
      isValid: false,
      code,
      format,
      error: 'UPC-A must be exactly 12 digits',
      supportsValidation: true,
    }
  }

  const digits = code.split('').map(Number)
  const checkDigit = digits.pop()!
  // UPC-A: odd positions × 3, even positions × 1
  const calculated = calculateMod10CheckDigit(digits, 3, 1)

  if (checkDigit !== calculated) {
    return {
      isValid: false,
      code,
      format,
      error: `Invalid check digit: expected ${calculated}, got ${checkDigit}`,
      supportsValidation: true,
    }
  }

  return { isValid: true, code, format, supportsValidation: true }
}

/**
 * Validate UPC-E barcode (8 digits)
 * UPC-E is a compressed version of UPC-A. To validate, we expand to UPC-A.
 */
export function validateUPCE(code: string): ValidationResult {
  const format = 'UPC_E'

  // Must be exactly 8 digits
  if (!/^\d{8}$/.test(code)) {
    return {
      isValid: false,
      code,
      format,
      error: 'UPC-E must be exactly 8 digits',
      supportsValidation: true,
    }
  }

  // First digit must be 0 or 1
  if (code[0] !== '0' && code[0] !== '1') {
    return {
      isValid: false,
      code,
      format,
      error: 'UPC-E must start with 0 or 1',
      supportsValidation: true,
    }
  }

  // Expand UPC-E to UPC-A for validation
  const expanded = expandUPCE(code)
  if (!expanded) {
    return {
      isValid: false,
      code,
      format,
      error: 'Invalid UPC-E compression pattern',
      supportsValidation: true,
    }
  }

  // Validate the expanded UPC-A
  const upcaResult = validateUPCA(expanded)
  if (!upcaResult.isValid) {
    return {
      isValid: false,
      code,
      format,
      error: upcaResult.error,
      supportsValidation: true,
    }
  }

  return { isValid: true, code, format, supportsValidation: true }
}

/**
 * Expand UPC-E to UPC-A
 * Returns null if invalid pattern
 */
function expandUPCE(upce: string): string | null {
  const numberSystem = upce[0]
  const manufacturer = upce.substring(1, 6)
  const lastDigit = parseInt(upce[6], 10)
  const checkDigit = upce[7]

  let expanded: string

  switch (lastDigit) {
    case 0:
    case 1:
    case 2:
      // Manufacturer code: XX000, XX100, or XX200
      expanded = `${numberSystem}${manufacturer.substring(0, 2)}${lastDigit}0000${manufacturer.substring(2, 5)}${checkDigit}`
      break
    case 3:
      // Manufacturer code: XXX00
      expanded = `${numberSystem}${manufacturer.substring(0, 3)}00000${manufacturer.substring(3, 5)}${checkDigit}`
      break
    case 4:
      // Manufacturer code: XXXX0
      expanded = `${numberSystem}${manufacturer.substring(0, 4)}00000${manufacturer[4]}${checkDigit}`
      break
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      // Manufacturer code: XXXXX, product code: 0000X
      expanded = `${numberSystem}${manufacturer}0000${lastDigit}${checkDigit}`
      break
    default:
      return null
  }

  return expanded
}

/**
 * Validate EAN-13 barcode (13 digits)
 * Includes ISBN-13 which uses the same format
 */
export function validateEAN13(code: string): ValidationResult {
  const format = 'EAN_13'

  // Must be exactly 13 digits
  if (!/^\d{13}$/.test(code)) {
    return {
      isValid: false,
      code,
      format,
      error: 'EAN-13 must be exactly 13 digits',
      supportsValidation: true,
    }
  }

  const digits = code.split('').map(Number)
  const checkDigit = digits.pop()!
  // EAN-13: odd positions × 1, even positions × 3
  const calculated = calculateMod10CheckDigit(digits, 1, 3)

  if (checkDigit !== calculated) {
    return {
      isValid: false,
      code,
      format,
      error: `Invalid check digit: expected ${calculated}, got ${checkDigit}`,
      supportsValidation: true,
    }
  }

  return { isValid: true, code, format, supportsValidation: true }
}

/**
 * Validate EAN-8 barcode (8 digits)
 */
export function validateEAN8(code: string): ValidationResult {
  const format = 'EAN_8'

  // Must be exactly 8 digits
  if (!/^\d{8}$/.test(code)) {
    return {
      isValid: false,
      code,
      format,
      error: 'EAN-8 must be exactly 8 digits',
      supportsValidation: true,
    }
  }

  const digits = code.split('').map(Number)
  const checkDigit = digits.pop()!
  // EAN-8: odd positions × 3, even positions × 1
  const calculated = calculateMod10CheckDigit(digits, 3, 1)

  if (checkDigit !== calculated) {
    return {
      isValid: false,
      code,
      format,
      error: `Invalid check digit: expected ${calculated}, got ${checkDigit}`,
      supportsValidation: true,
    }
  }

  return { isValid: true, code, format, supportsValidation: true }
}

/**
 * Validate ISBN-10 (10 characters, last can be X)
 *
 * Algorithm:
 * Sum of (digit × position) where position is 10 to 1
 * Must be divisible by 11
 * Last digit X = 10
 */
export function validateISBN10(code: string): ValidationResult {
  const format = 'ISBN_10'

  // Must be exactly 10 characters, digits with optional X at end
  if (!/^\d{9}[\dX]$/.test(code.toUpperCase())) {
    return {
      isValid: false,
      code,
      format,
      error: 'ISBN-10 must be 9 digits followed by a digit or X',
      supportsValidation: true,
    }
  }

  const normalized = code.toUpperCase()
  let sum = 0

  for (let i = 0; i < 10; i++) {
    const char = normalized[i]
    const value = char === 'X' ? 10 : parseInt(char, 10)
    sum += value * (10 - i)
  }

  if (sum % 11 !== 0) {
    return {
      isValid: false,
      code,
      format,
      error: 'Invalid ISBN-10 check digit',
      supportsValidation: true,
    }
  }

  return { isValid: true, code, format, supportsValidation: true }
}

/**
 * Validate ISBN-13 (13 digits)
 * ISBN-13 is just EAN-13 starting with 978 or 979
 */
export function validateISBN13(code: string): ValidationResult {
  const format = 'ISBN_13'

  // Must start with 978 or 979
  if (!code.startsWith('978') && !code.startsWith('979')) {
    return {
      isValid: false,
      code,
      format,
      error: 'ISBN-13 must start with 978 or 979',
      supportsValidation: true,
    }
  }

  // Use EAN-13 validation
  const ean13Result = validateEAN13(code)
  if (!ean13Result.isValid) {
    return {
      isValid: false,
      code,
      format,
      error: ean13Result.error,
      supportsValidation: true,
    }
  }

  return { isValid: true, code, format, supportsValidation: true }
}

/**
 * Main validation function - validates a barcode based on its detected format
 *
 * @param code - The barcode value
 * @param format - The normalized format name (e.g., 'EAN_13', 'UPC_A')
 * @returns Validation result with isValid flag and optional error message
 *
 * @example
 * const result = validateBarcode('012345678905', 'UPC_A')
 * if (!result.isValid) {
 *   console.warn('Invalid barcode:', result.error)
 * }
 */
export function validateBarcode(code: string, format: string): ValidationResult {
  // Normalize format name
  const normalizedFormat = format.toUpperCase().replace(/-/g, '_')

  switch (normalizedFormat) {
    case 'UPC_A':
      return validateUPCA(code)

    case 'UPC_E':
      return validateUPCE(code)

    case 'EAN_13':
      return validateEAN13(code)

    case 'EAN_8':
      return validateEAN8(code)

    case 'ISBN_10':
      return validateISBN10(code)

    case 'ISBN_13':
      return validateISBN13(code)

    // Formats without check digit validation
    case 'QR_CODE':
    case 'DATA_MATRIX':
    case 'CODE_128':
    case 'CODE_39':
    case 'CODE_93':
    case 'CODABAR':
    case 'AZTEC':
    case 'PDF_417':
    case 'ITF':
    case 'DATABAR':
    case 'DATABAR_EXP':
    case 'HARDWARE': // Hardware scanner doesn't report format
    default:
      // These formats either don't have check digits or use format-specific
      // validation that's more complex. Return valid with flag indicating
      // no validation was performed.
      return {
        isValid: true,
        code,
        format: normalizedFormat,
        supportsValidation: false,
      }
  }
}

/**
 * Try to auto-detect format and validate
 * Useful when format is unknown or reported as 'HARDWARE'
 */
export function validateBarcodeAutoDetect(code: string): ValidationResult {
  // Try to detect format from code structure
  const cleanCode = code.trim()

  // ISBN-10: 10 chars, ends in digit or X
  if (/^\d{9}[\dX]$/i.test(cleanCode)) {
    return validateISBN10(cleanCode)
  }

  // ISBN-13: 13 digits starting with 978 or 979
  if (/^97[89]\d{10}$/.test(cleanCode)) {
    return validateISBN13(cleanCode)
  }

  // UPC-A: exactly 12 digits
  if (/^\d{12}$/.test(cleanCode)) {
    return validateUPCA(cleanCode)
  }

  // EAN-13: exactly 13 digits
  if (/^\d{13}$/.test(cleanCode)) {
    return validateEAN13(cleanCode)
  }

  // EAN-8: exactly 8 digits (but not UPC-E pattern)
  if (/^\d{8}$/.test(cleanCode)) {
    // Could be EAN-8 or UPC-E, try both
    const ean8Result = validateEAN8(cleanCode)
    if (ean8Result.isValid) {
      return ean8Result
    }
    // Try UPC-E
    return validateUPCE(cleanCode)
  }

  // Unknown format - can't validate
  return {
    isValid: true,
    code: cleanCode,
    format: 'UNKNOWN',
    supportsValidation: false,
  }
}
