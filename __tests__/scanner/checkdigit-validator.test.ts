import { describe, it, expect } from 'vitest'
import {
  validateUPCA,
  validateUPCE,
  validateEAN13,
  validateEAN8,
  validateISBN10,
  validateISBN13,
  validateBarcode,
  validateBarcodeAutoDetect,
  supportsCheckDigitValidation,
} from '@/lib/scanner/utils/checkdigit-validator'

describe('Check Digit Validator', () => {
  describe('validateUPCA', () => {
    it('should validate correct UPC-A barcodes', () => {
      // Real UPC-A codes
      expect(validateUPCA('012345678905').isValid).toBe(true) // Standard test code
      expect(validateUPCA('042100005264').isValid).toBe(true) // Cheerios
      expect(validateUPCA('012000001086').isValid).toBe(true) // Pepsi
      expect(validateUPCA('049000006346').isValid).toBe(true) // Coca-Cola
    })

    it('should reject invalid UPC-A check digits', () => {
      const result = validateUPCA('012345678901') // Wrong check digit (should be 5)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('expected 5')
      expect(result.error).toContain('got 1')
    })

    it('should reject non-12-digit codes', () => {
      expect(validateUPCA('12345').isValid).toBe(false)
      expect(validateUPCA('1234567890123').isValid).toBe(false)
      expect(validateUPCA('01234567890A').isValid).toBe(false)
    })
  })

  describe('validateUPCE', () => {
    it('should validate correct UPC-E barcodes', () => {
      // UPC-E codes (compressed form)
      expect(validateUPCE('01234565').isValid).toBe(true)
      expect(validateUPCE('04252614').isValid).toBe(true)
    })

    it('should reject UPC-E not starting with 0 or 1', () => {
      const result = validateUPCE('21234565')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('start with 0 or 1')
    })

    it('should reject invalid UPC-E format', () => {
      expect(validateUPCE('1234567').isValid).toBe(false) // 7 digits
      expect(validateUPCE('123456789').isValid).toBe(false) // 9 digits
    })
  })

  describe('validateEAN13', () => {
    it('should validate correct EAN-13 barcodes', () => {
      expect(validateEAN13('5901234123457').isValid).toBe(true)
      expect(validateEAN13('4006381333931').isValid).toBe(true) // Stabilo pen
      expect(validateEAN13('8710398506870').isValid).toBe(true) // Dove soap
    })

    it('should reject invalid EAN-13 check digits', () => {
      const result = validateEAN13('5901234123456') // Wrong check digit
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('expected 7')
    })

    it('should reject non-13-digit codes', () => {
      expect(validateEAN13('123456789012').isValid).toBe(false)
      expect(validateEAN13('12345678901234').isValid).toBe(false)
    })
  })

  describe('validateEAN8', () => {
    it('should validate correct EAN-8 barcodes', () => {
      expect(validateEAN8('96385074').isValid).toBe(true)
      expect(validateEAN8('65833254').isValid).toBe(true)
    })

    it('should reject invalid EAN-8 check digits', () => {
      const result = validateEAN8('96385071') // Wrong check digit
      expect(result.isValid).toBe(false)
    })

    it('should reject non-8-digit codes', () => {
      expect(validateEAN8('1234567').isValid).toBe(false)
      expect(validateEAN8('123456789').isValid).toBe(false)
    })
  })

  describe('validateISBN10', () => {
    it('should validate correct ISBN-10 codes', () => {
      expect(validateISBN10('0306406152').isValid).toBe(true)
      expect(validateISBN10('0471958697').isValid).toBe(true)
      expect(validateISBN10('155860832X').isValid).toBe(true) // X check digit
      expect(validateISBN10('155860832x').isValid).toBe(true) // lowercase x
    })

    it('should reject invalid ISBN-10 check digits', () => {
      const result = validateISBN10('0306406151') // Wrong check digit
      expect(result.isValid).toBe(false)
    })

    it('should reject invalid ISBN-10 format', () => {
      expect(validateISBN10('123456789').isValid).toBe(false) // 9 chars
      expect(validateISBN10('12345678901').isValid).toBe(false) // 11 chars
      expect(validateISBN10('030640615A').isValid).toBe(false) // A not allowed
    })
  })

  describe('validateISBN13', () => {
    it('should validate correct ISBN-13 codes', () => {
      expect(validateISBN13('9780306406157').isValid).toBe(true)
      expect(validateISBN13('9780471958697').isValid).toBe(true)
      expect(validateISBN13('9791234567896').isValid).toBe(true) // 979 prefix
    })

    it('should reject ISBN-13 not starting with 978/979', () => {
      const result = validateISBN13('9770306406157')
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('978 or 979')
    })

    it('should reject invalid ISBN-13 check digits', () => {
      const result = validateISBN13('9780306406150') // Wrong check digit
      expect(result.isValid).toBe(false)
    })
  })

  describe('validateBarcode', () => {
    it('should route to correct validator based on format', () => {
      expect(validateBarcode('012345678905', 'UPC_A').isValid).toBe(true)
      expect(validateBarcode('5901234123457', 'EAN_13').isValid).toBe(true)
      expect(validateBarcode('96385074', 'EAN_8').isValid).toBe(true)
    })

    it('should handle format name variations', () => {
      // Hyphenated format names
      expect(validateBarcode('5901234123457', 'EAN-13').isValid).toBe(true)
      // Lowercase
      expect(validateBarcode('5901234123457', 'ean_13').isValid).toBe(true)
    })

    it('should return supportsValidation: false for unsupported formats', () => {
      const qrResult = validateBarcode('https://example.com', 'QR_CODE')
      expect(qrResult.isValid).toBe(true)
      expect(qrResult.supportsValidation).toBe(false)

      const code128Result = validateBarcode('ABC123', 'CODE_128')
      expect(code128Result.isValid).toBe(true)
      expect(code128Result.supportsValidation).toBe(false)
    })
  })

  describe('validateBarcodeAutoDetect', () => {
    it('should auto-detect UPC-A (12 digits)', () => {
      const result = validateBarcodeAutoDetect('012345678905')
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('UPC_A')
    })

    it('should auto-detect EAN-13 (13 digits)', () => {
      const result = validateBarcodeAutoDetect('5901234123457')
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('EAN_13')
    })

    it('should auto-detect ISBN-13 (978/979 prefix)', () => {
      const result = validateBarcodeAutoDetect('9780306406157')
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('ISBN_13')
    })

    it('should auto-detect ISBN-10 (10 chars)', () => {
      const result = validateBarcodeAutoDetect('0306406152')
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('ISBN_10')
    })

    it('should auto-detect EAN-8 (8 digits)', () => {
      const result = validateBarcodeAutoDetect('96385074')
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('EAN_8')
    })

    it('should return UNKNOWN for non-standard codes', () => {
      const result = validateBarcodeAutoDetect('ABC123XYZ')
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('UNKNOWN')
      expect(result.supportsValidation).toBe(false)
    })
  })

  describe('supportsCheckDigitValidation', () => {
    it('should return true for validatable formats', () => {
      expect(supportsCheckDigitValidation('UPC_A')).toBe(true)
      expect(supportsCheckDigitValidation('UPC_E')).toBe(true)
      expect(supportsCheckDigitValidation('EAN_13')).toBe(true)
      expect(supportsCheckDigitValidation('EAN_8')).toBe(true)
      expect(supportsCheckDigitValidation('ISBN_10')).toBe(true)
      expect(supportsCheckDigitValidation('ISBN_13')).toBe(true)
    })

    it('should return false for non-validatable formats', () => {
      expect(supportsCheckDigitValidation('QR_CODE')).toBe(false)
      expect(supportsCheckDigitValidation('CODE_128')).toBe(false)
      expect(supportsCheckDigitValidation('CODE_39')).toBe(false)
      expect(supportsCheckDigitValidation('DATA_MATRIX')).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should handle whitespace trimming in auto-detect', () => {
      const result = validateBarcodeAutoDetect('  012345678905  ')
      expect(result.isValid).toBe(true)
    })

    it('should handle HARDWARE format (from hardware scanners)', () => {
      const result = validateBarcode('012345678905', 'HARDWARE')
      expect(result.isValid).toBe(true)
      expect(result.supportsValidation).toBe(false)
    })

    it('should catch real-world invalid scans', () => {
      // Simulating a misread barcode (one digit wrong)
      const validCode = '042100005264' // Cheerios UPC-A
      const misreadCode = '042100005274' // Digit changed

      expect(validateUPCA(validCode).isValid).toBe(true)
      expect(validateUPCA(misreadCode).isValid).toBe(false)
    })
  })
})
