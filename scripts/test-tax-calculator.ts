/**
 * Tax Calculator Unit Tests
 *
 * Run with: npx tsx scripts/test-tax-calculator.ts
 */

import {
    calculateTaxes,
    calculateTotalTax,
    calculateTaxSummary,
    aggregateTaxes,
    calculateTaxInclusive,
    formatTaxRate,
    getTaxTypeLabel,
    formatTaxForDisplay,
    validateTaxId,
    getTaxIdLabel,
    TaxRate,
    TaxCalculationResult,
} from '../lib/tax-calculator'

interface TestResult {
    name: string
    passed: boolean
    details?: string
}

const results: TestResult[] = []

function test(name: string, fn: () => boolean | string) {
    try {
        const result = fn()
        const passed = result === true
        results.push({ name, passed, details: typeof result === 'string' ? result : undefined })
        console.log(`${passed ? '✅' : '❌'} ${name}`)
        if (!passed && typeof result === 'string') {
            console.log(`   └─ ${result}`)
        }
    } catch (error) {
        results.push({ name, passed: false, details: String(error) })
        console.log(`❌ ${name}`)
        console.log(`   └─ Error: ${error}`)
    }
}

function assertEquals(actual: unknown, expected: unknown, message?: string): boolean | string {
    if (actual === expected) return true
    return message || `Expected ${expected}, got ${actual}`
}

function assertClose(actual: number, expected: number, tolerance: number = 0.01): boolean | string {
    if (Math.abs(actual - expected) <= tolerance) return true
    return `Expected ~${expected}, got ${actual} (tolerance: ${tolerance})`
}

// Sample tax rates for testing
const sampleTaxRates: TaxRate[] = [
    { id: '1', name: 'State Tax', code: 'ST', tax_type: 'sales_tax', rate: 6.25, is_compound: false, applies_to_shipping: true },
    { id: '2', name: 'County Tax', code: 'CT', tax_type: 'sales_tax', rate: 1.5, is_compound: false, applies_to_shipping: false },
    { id: '3', name: 'Special Tax', code: 'SP', tax_type: 'other', rate: 0.5, is_compound: true, applies_to_shipping: false },
]

console.log('🧪 Tax Calculator Unit Tests')
console.log('='.repeat(60))

// ============================================
// calculateTaxes Tests
// ============================================
console.log('\n📋 Testing calculateTaxes...\n')

test('calculateTaxes: returns empty array for zero amount', () => {
    const result = calculateTaxes(0, sampleTaxRates)
    return assertEquals(result.length, 0)
})

test('calculateTaxes: returns empty array for negative amount', () => {
    const result = calculateTaxes(-100, sampleTaxRates)
    return assertEquals(result.length, 0)
})

test('calculateTaxes: returns empty array for empty tax rates', () => {
    const result = calculateTaxes(100, [])
    return assertEquals(result.length, 0)
})

test('calculateTaxes: calculates single tax correctly', () => {
    const result = calculateTaxes(100, [sampleTaxRates[0]])
    return assertClose(result[0].taxAmount, 6.25)
})

test('calculateTaxes: calculates multiple non-compound taxes additively', () => {
    const result = calculateTaxes(100, [sampleTaxRates[0], sampleTaxRates[1]])
    const total = result.reduce((sum, t) => sum + t.taxAmount, 0)
    return assertClose(total, 7.75) // 6.25 + 1.50
})

test('calculateTaxes: non-compound taxes use original amount', () => {
    const result = calculateTaxes(100, [sampleTaxRates[0], sampleTaxRates[1]])
    // Both should calculate on $100
    const allUseOriginal = result.every(t => t.taxableAmount === 100)
    return allUseOriginal || 'Non-compound taxes should calculate on original amount'
})

test('calculateTaxes: compound tax applied on running total', () => {
    const result = calculateTaxes(100, sampleTaxRates)
    // Non-compound taxes: 6.25 + 1.50 = 7.75
    // Compound tax: 0.5% on (100 + 7.75) = 0.54 (rounded)
    const compoundTax = result.find(t => t.isCompound)
    return assertClose(compoundTax!.taxAmount, 0.54)
})

test('calculateTaxes: compound tax taxable amount is running total', () => {
    const result = calculateTaxes(100, sampleTaxRates)
    const compoundTax = result.find(t => t.isCompound)
    // Running total = 100 + 6.25 + 1.50 = 107.75
    return assertClose(compoundTax!.taxableAmount, 107.75)
})

test('calculateTaxes: respects roundTo option', () => {
    const result = calculateTaxes(100, [sampleTaxRates[0]], { roundTo: 0 })
    return assertEquals(result[0].taxAmount, 6) // Rounded to whole number
})

test('calculateTaxes: excludes compound taxes when includeCompound is false', () => {
    const result = calculateTaxes(100, sampleTaxRates, { includeCompound: false })
    const hasCompound = result.some(t => t.isCompound)
    return !hasCompound || 'Compound taxes should be excluded'
})

// ============================================
// calculateTotalTax Tests
// ============================================
console.log('\n📋 Testing calculateTotalTax...\n')

test('calculateTotalTax: sums all tax amounts', () => {
    const taxes: TaxCalculationResult[] = [
        { taxRateId: '1', taxName: 'Tax 1', taxCode: null, taxType: 'sales_tax', taxRate: 5, taxableAmount: 100, taxAmount: 5, isCompound: false },
        { taxRateId: '2', taxName: 'Tax 2', taxCode: null, taxType: 'vat', taxRate: 10, taxableAmount: 100, taxAmount: 10, isCompound: false },
    ]
    return assertEquals(calculateTotalTax(taxes), 15)
})

test('calculateTotalTax: returns 0 for empty array', () => {
    return assertEquals(calculateTotalTax([]), 0)
})

// ============================================
// calculateTaxSummary Tests
// ============================================
console.log('\n📋 Testing calculateTaxSummary...\n')

test('calculateTaxSummary: calculates correct subtotal after discount', () => {
    const summary = calculateTaxSummary(100, sampleTaxRates, 0, 10)
    return assertEquals(summary.subtotal, 90)
})

test('calculateTaxSummary: includes shipping taxes for applicable rates', () => {
    const summary = calculateTaxSummary(100, sampleTaxRates, 20, 0)
    // State tax (6.25%) applies to shipping, so: 20 * 0.0625 = 1.25
    // Total item tax on $100: 6.25 + 1.50 = 7.75 (non-compound)
    // Compound on 107.75: 0.54
    // Total tax = 7.75 + 0.54 + 1.25 (shipping) = 9.54
    return assertClose(summary.totalTax, 9.54, 0.1)
})

test('calculateTaxSummary: calculates correct total', () => {
    const summary = calculateTaxSummary(100, [sampleTaxRates[0]], 10, 0)
    // Subtotal: 100, Tax on items: 6.25, Tax on shipping: 0.63, Shipping: 10
    // Total = 100 + 6.25 + 0.63 + 10 = 116.88
    return assertClose(summary.total, 116.88, 0.1)
})

test('calculateTaxSummary: aggregates same tax rate from items and shipping', () => {
    const summary = calculateTaxSummary(100, [sampleTaxRates[0]], 20, 0)
    // State tax applies to both: should be aggregated into one entry
    return assertEquals(summary.taxes.length, 1)
})

// ============================================
// aggregateTaxes Tests
// ============================================
console.log('\n📋 Testing aggregateTaxes...\n')

test('aggregateTaxes: combines taxes with same ID', () => {
    const taxes: TaxCalculationResult[] = [
        { taxRateId: '1', taxName: 'Tax 1', taxCode: null, taxType: 'sales_tax', taxRate: 5, taxableAmount: 100, taxAmount: 5, isCompound: false },
        { taxRateId: '1', taxName: 'Tax 1', taxCode: null, taxType: 'sales_tax', taxRate: 5, taxableAmount: 50, taxAmount: 2.5, isCompound: false },
    ]
    const result = aggregateTaxes(taxes)
    return assertEquals(result.length, 1) && assertClose(result[0].taxAmount, 7.5)
})

test('aggregateTaxes: keeps different tax rates separate', () => {
    const taxes: TaxCalculationResult[] = [
        { taxRateId: '1', taxName: 'Tax 1', taxCode: null, taxType: 'sales_tax', taxRate: 5, taxableAmount: 100, taxAmount: 5, isCompound: false },
        { taxRateId: '2', taxName: 'Tax 2', taxCode: null, taxType: 'vat', taxRate: 10, taxableAmount: 100, taxAmount: 10, isCompound: false },
    ]
    const result = aggregateTaxes(taxes)
    return assertEquals(result.length, 2)
})

// ============================================
// calculateTaxInclusive Tests
// ============================================
console.log('\n📋 Testing calculateTaxInclusive...\n')

test('calculateTaxInclusive: calculates correct base price for 20% VAT', () => {
    const result = calculateTaxInclusive(120, 20)
    return assertEquals(result.basePrice, 100)
})

test('calculateTaxInclusive: calculates correct tax amount', () => {
    const result = calculateTaxInclusive(120, 20)
    return assertEquals(result.taxAmount, 20)
})

test('calculateTaxInclusive: handles zero tax rate', () => {
    const result = calculateTaxInclusive(100, 0)
    return assertEquals(result.basePrice, 100) && assertEquals(result.taxAmount, 0)
})

test('calculateTaxInclusive: handles decimal tax rates', () => {
    const result = calculateTaxInclusive(108.25, 8.25)
    return assertClose(result.basePrice, 100, 0.01)
})

// ============================================
// formatTaxRate Tests
// ============================================
console.log('\n📋 Testing formatTaxRate...\n')

test('formatTaxRate: formats whole number correctly', () => {
    return assertEquals(formatTaxRate(20), '20%')
})

test('formatTaxRate: formats decimal correctly', () => {
    return assertEquals(formatTaxRate(8.25), '8.25%')
})

test('formatTaxRate: removes trailing zeros', () => {
    return assertEquals(formatTaxRate(7.00), '7%')
})

test('formatTaxRate: respects includeSymbol option', () => {
    return assertEquals(formatTaxRate(10, { includeSymbol: false }), '10')
})

// ============================================
// getTaxTypeLabel Tests
// ============================================
console.log('\n📋 Testing getTaxTypeLabel...\n')

test('getTaxTypeLabel: returns correct label for VAT', () => {
    return assertEquals(getTaxTypeLabel('vat'), 'VAT')
})

test('getTaxTypeLabel: returns correct label for GST', () => {
    return assertEquals(getTaxTypeLabel('gst'), 'GST')
})

test('getTaxTypeLabel: returns correct label for sales_tax', () => {
    return assertEquals(getTaxTypeLabel('sales_tax'), 'Sales Tax')
})

test('getTaxTypeLabel: returns "Tax" for unknown type', () => {
    return assertEquals(getTaxTypeLabel('unknown'), 'Tax')
})

// ============================================
// formatTaxForDisplay Tests
// ============================================
console.log('\n📋 Testing formatTaxForDisplay...\n')

test('formatTaxForDisplay: formats correctly', () => {
    const tax: TaxCalculationResult = {
        taxRateId: '1',
        taxName: 'CA Sales Tax',
        taxCode: null,
        taxType: 'sales_tax',
        taxRate: 8.25,
        taxableAmount: 100,
        taxAmount: 8.25,
        isCompound: false,
    }
    return assertEquals(formatTaxForDisplay(tax), 'CA Sales Tax (8.25%)')
})

// ============================================
// validateTaxId Tests
// ============================================
console.log('\n📋 Testing validateTaxId...\n')

test('validateTaxId: accepts empty tax ID', () => {
    return assertEquals(validateTaxId('', 'GB').valid, true)
})

test('validateTaxId: validates UK VAT - 9 digits', () => {
    return assertEquals(validateTaxId('GB123456789', 'GB').valid, true)
})

test('validateTaxId: validates UK VAT - 12 digits', () => {
    return assertEquals(validateTaxId('GB123456789012', 'GB').valid, true)
})

test('validateTaxId: rejects invalid UK VAT', () => {
    const result = validateTaxId('12345', 'GB')
    return result.valid === false || 'Should reject invalid UK VAT'
})

test('validateTaxId: validates Australian ABN - 11 digits', () => {
    return assertEquals(validateTaxId('12345678901', 'AU').valid, true)
})

test('validateTaxId: rejects invalid Australian ABN', () => {
    const result = validateTaxId('1234567890', 'AU')
    return result.valid === false || 'Should reject invalid ABN'
})

test('validateTaxId: validates Canadian GST - 9 digits', () => {
    return assertEquals(validateTaxId('123456789', 'CA').valid, true)
})

test('validateTaxId: validates Canadian GST - with RT', () => {
    return assertEquals(validateTaxId('123456789RT0001', 'CA').valid, true)
})

test('validateTaxId: validates US EIN', () => {
    return assertEquals(validateTaxId('12-3456789', 'US').valid, true)
})

test('validateTaxId: validates German VAT', () => {
    return assertEquals(validateTaxId('DE123456789', 'DE').valid, true)
})

test('validateTaxId: validates French VAT', () => {
    return assertEquals(validateTaxId('FRXX123456789', 'FR').valid, true)
})

test('validateTaxId: validates Singapore GST', () => {
    return assertEquals(validateTaxId('M12345678K', 'SG').valid, true)
})

// ============================================
// getTaxIdLabel Tests
// ============================================
console.log('\n📋 Testing getTaxIdLabel...\n')

test('getTaxIdLabel: returns "VAT Number" for GB', () => {
    return assertEquals(getTaxIdLabel('GB'), 'VAT Number')
})

test('getTaxIdLabel: returns "ABN" for AU', () => {
    return assertEquals(getTaxIdLabel('AU'), 'ABN')
})

test('getTaxIdLabel: returns "EIN" for US', () => {
    return assertEquals(getTaxIdLabel('US'), 'EIN')
})

test('getTaxIdLabel: returns "Tax ID" for unknown country', () => {
    return assertEquals(getTaxIdLabel('ZZ'), 'Tax ID')
})

// ============================================
// Edge Cases & Rounding
// ============================================
console.log('\n📋 Testing edge cases & rounding...\n')

test('Rounding: no floating point errors on common amounts', () => {
    // 0.1 + 0.2 should equal 0.3
    const result = calculateTaxes(100, [{ id: '1', name: 'Test', code: null, tax_type: 'vat', rate: 0.3, is_compound: false, applies_to_shipping: false }])
    return assertEquals(result[0].taxAmount, 0.3)
})

test('Rounding: handles very small tax rates', () => {
    const result = calculateTaxes(1000, [{ id: '1', name: 'Test', code: null, tax_type: 'other', rate: 0.01, is_compound: false, applies_to_shipping: false }])
    return assertEquals(result[0].taxAmount, 0.1) // 1000 * 0.0001 = 0.1
})

test('Large amount calculation', () => {
    const result = calculateTaxes(1000000, [sampleTaxRates[0]])
    return assertClose(result[0].taxAmount, 62500) // 1M * 6.25%
})

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(60))
console.log('📊 TEST SUMMARY')
console.log('='.repeat(60))

const passed = results.filter(r => r.passed).length
const failed = results.filter(r => !r.passed).length
const total = results.length

console.log(`\n✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📝 Total:  ${total}`)
console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.filter(r => !r.passed).forEach(r => {
        console.log(`   - ${r.name}`)
        if (r.details) console.log(`     └─ ${r.details}`)
    })
}

console.log('\n' + '='.repeat(60))

process.exit(failed > 0 ? 1 : 0)
