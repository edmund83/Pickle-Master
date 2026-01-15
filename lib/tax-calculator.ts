/**
 * Tax Calculator Utility
 *
 * Provides client-side tax calculation utilities for worldwide tax compatibility.
 * Supports USA Sales Tax, EU VAT, GST, HST, PST, and compound taxes.
 */

export interface TaxRate {
    id: string
    name: string
    code?: string | null
    tax_type: 'sales_tax' | 'vat' | 'gst' | 'hst' | 'pst' | 'other'
    rate: number // Percentage (e.g., 8.25 = 8.25%)
    is_compound: boolean
    applies_to_shipping: boolean
}

export interface TaxCalculationResult {
    taxRateId: string
    taxName: string
    taxCode: string | null
    taxType: string
    taxRate: number
    taxableAmount: number
    taxAmount: number
    isCompound: boolean
}

export interface TaxSummary {
    subtotal: number
    totalTax: number
    total: number
    taxes: TaxCalculationResult[]
}

/**
 * Calculate tax for a single amount with multiple tax rates
 *
 * @param amount - The base amount to calculate tax on
 * @param taxRates - Array of tax rates to apply
 * @param options - Calculation options
 * @returns Array of tax calculation results
 */
export function calculateTaxes(
    amount: number,
    taxRates: TaxRate[],
    options: {
        includeCompound?: boolean
        roundTo?: number
    } = {}
): TaxCalculationResult[] {
    const { includeCompound = true, roundTo = 2 } = options

    if (amount <= 0 || taxRates.length === 0) {
        return []
    }

    const results: TaxCalculationResult[] = []
    let runningTotal = amount

    // Sort: non-compound taxes first, then compound taxes
    const sortedRates = [...taxRates].sort((a, b) => {
        if (a.is_compound === b.is_compound) return 0
        return a.is_compound ? 1 : -1
    })

    for (const taxRate of sortedRates) {
        if (taxRate.is_compound && !includeCompound) {
            continue
        }

        // For compound taxes, calculate on running total (amount + previous taxes)
        // For regular taxes, calculate on original amount
        const taxableAmount = taxRate.is_compound ? runningTotal : amount
        const taxAmount = round(taxableAmount * (taxRate.rate / 100), roundTo)

        results.push({
            taxRateId: taxRate.id,
            taxName: taxRate.name,
            taxCode: taxRate.code || null,
            taxType: taxRate.tax_type,
            taxRate: taxRate.rate,
            taxableAmount,
            taxAmount,
            isCompound: taxRate.is_compound,
        })

        // Update running total for next compound tax
        runningTotal += taxAmount
    }

    return results
}

/**
 * Calculate total tax from multiple tax results
 */
export function calculateTotalTax(taxes: TaxCalculationResult[]): number {
    return taxes.reduce((sum, tax) => sum + tax.taxAmount, 0)
}

/**
 * Calculate complete tax summary for a line item or order
 */
export function calculateTaxSummary(
    subtotal: number,
    taxRates: TaxRate[],
    shippingAmount: number = 0,
    discountAmount: number = 0
): TaxSummary {
    // Calculate base taxable amount (subtotal - discount)
    const taxableBase = Math.max(0, subtotal - discountAmount)

    // Calculate taxes on items
    const itemTaxes = calculateTaxes(taxableBase, taxRates)

    // Calculate taxes on shipping (only for applicable tax rates)
    const shippingTaxRates = taxRates.filter((r) => r.applies_to_shipping)
    const shippingTaxes = shippingAmount > 0
        ? calculateTaxes(shippingAmount, shippingTaxRates)
        : []

    // Combine all taxes
    const allTaxes = [...itemTaxes, ...shippingTaxes]

    // Aggregate by tax rate
    const aggregatedTaxes = aggregateTaxes(allTaxes)

    const totalTax = calculateTotalTax(aggregatedTaxes)

    return {
        subtotal: taxableBase,
        totalTax,
        total: round(taxableBase + totalTax + shippingAmount, 2),
        taxes: aggregatedTaxes,
    }
}

/**
 * Aggregate multiple tax results by tax rate ID
 */
export function aggregateTaxes(taxes: TaxCalculationResult[]): TaxCalculationResult[] {
    const aggregated = new Map<string, TaxCalculationResult>()

    for (const tax of taxes) {
        const existing = aggregated.get(tax.taxRateId)
        if (existing) {
            existing.taxableAmount += tax.taxableAmount
            existing.taxAmount += tax.taxAmount
        } else {
            aggregated.set(tax.taxRateId, { ...tax })
        }
    }

    return Array.from(aggregated.values())
}

/**
 * Calculate tax-inclusive price breakdown
 * Given a total that includes tax, calculate the base price and tax amount
 *
 * @param totalIncludingTax - The total price including tax
 * @param taxRate - The tax rate percentage
 * @returns Object with basePrice and taxAmount
 */
export function calculateTaxInclusive(
    totalIncludingTax: number,
    taxRate: number
): { basePrice: number; taxAmount: number } {
    if (taxRate <= 0) {
        return { basePrice: totalIncludingTax, taxAmount: 0 }
    }

    // Formula: base = total / (1 + rate/100)
    const basePrice = round(totalIncludingTax / (1 + taxRate / 100), 2)
    const taxAmount = round(totalIncludingTax - basePrice, 2)

    return { basePrice, taxAmount }
}

/**
 * Format tax rate for display
 *
 * @param rate - Tax rate as percentage
 * @param options - Formatting options
 */
export function formatTaxRate(
    rate: number,
    options: { decimals?: number; includeSymbol?: boolean } = {}
): string {
    const { decimals = 2, includeSymbol = true } = options

    const formatted = rate.toFixed(decimals)
    // Remove trailing zeros after decimal point
    const cleaned = formatted.replace(/\.?0+$/, '')

    return includeSymbol ? `${cleaned}%` : cleaned
}

/**
 * Get tax type display label
 */
export function getTaxTypeLabel(taxType: string): string {
    const labels: Record<string, string> = {
        sales_tax: 'Sales Tax',
        vat: 'VAT',
        gst: 'GST',
        hst: 'HST',
        pst: 'PST',
        other: 'Tax',
    }
    return labels[taxType] || 'Tax'
}

/**
 * Format tax for invoice display
 * Returns a string like "VAT (20%)" or "CA Sales Tax (8.25%)"
 */
export function formatTaxForDisplay(tax: TaxCalculationResult): string {
    return `${tax.taxName} (${formatTaxRate(tax.taxRate)})`
}

/**
 * Validate tax ID format based on country
 * Returns true if valid, error message if invalid
 */
export function validateTaxId(
    taxId: string,
    countryCode: string
): { valid: boolean; error?: string } {
    if (!taxId || taxId.trim().length === 0) {
        return { valid: true } // Empty is valid (optional field)
    }

    const cleaned = taxId.replace(/[\s-]/g, '').toUpperCase()

    switch (countryCode) {
        case 'GB': // UK VAT
            // Format: GB + 9 or 12 digits, or GB + GD/HA + 3 digits
            if (!/^(GB)?(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/.test(cleaned)) {
                return { valid: false, error: 'UK VAT number must be 9 or 12 digits' }
            }
            break

        case 'DE': // Germany VAT
            if (!/^(DE)?\d{9}$/.test(cleaned)) {
                return { valid: false, error: 'German VAT number must be DE + 9 digits' }
            }
            break

        case 'FR': // France VAT
            if (!/^(FR)?[A-Z0-9]{2}\d{9}$/.test(cleaned)) {
                return { valid: false, error: 'French VAT number must be FR + 2 chars + 9 digits' }
            }
            break

        case 'AU': // Australia ABN
            if (!/^\d{11}$/.test(cleaned)) {
                return { valid: false, error: 'Australian ABN must be 11 digits' }
            }
            break

        case 'CA': // Canada GST/HST
            if (!/^\d{9}RT\d{4}$/.test(cleaned) && !/^\d{9}$/.test(cleaned)) {
                return { valid: false, error: 'Canadian GST number must be 9 digits or 9 digits + RT + 4 digits' }
            }
            break

        case 'US': // US EIN
            if (!/^\d{2}-?\d{7}$/.test(cleaned)) {
                return { valid: false, error: 'US EIN must be 9 digits (XX-XXXXXXX)' }
            }
            break

        case 'SG': // Singapore GST
            if (!/^[A-Z]\d{8}[A-Z]$/.test(cleaned) && !/^\d{9}[A-Z]$/.test(cleaned)) {
                return { valid: false, error: 'Singapore GST number format is invalid' }
            }
            break

        default:
            // Basic validation for unknown countries
            if (cleaned.length < 5 || cleaned.length > 20) {
                return { valid: false, error: 'Tax ID must be between 5 and 20 characters' }
            }
    }

    return { valid: true }
}

/**
 * Get suggested tax ID label based on country
 */
export function getTaxIdLabel(countryCode: string): string {
    const labels: Record<string, string> = {
        GB: 'VAT Number',
        DE: 'USt-IdNr',
        FR: 'N° TVA',
        IT: 'Partita IVA',
        ES: 'NIF/CIF',
        NL: 'BTW-nummer',
        BE: 'BTW-nummer',
        AT: 'UID-Nummer',
        AU: 'ABN',
        NZ: 'GST Number',
        CA: 'GST/HST Number',
        US: 'EIN',
        SG: 'GST Registration No.',
        MY: 'SST Number',
        IN: 'GSTIN',
    }
    return labels[countryCode] || 'Tax ID'
}

/**
 * Round a number to specified decimal places
 */
function round(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
}

/**
 * Common tax rate presets by country (for reference/seeding)
 * Note: These are approximate and should be verified for accuracy
 */
export const TAX_RATE_PRESETS = {
    // United States - State Sales Tax (main rates only)
    US: [
        { name: 'California Sales Tax', rate: 7.25, region: 'CA' },
        { name: 'Texas Sales Tax', rate: 6.25, region: 'TX' },
        { name: 'New York Sales Tax', rate: 4.0, region: 'NY' },
        { name: 'Florida Sales Tax', rate: 6.0, region: 'FL' },
        { name: 'Washington Sales Tax', rate: 6.5, region: 'WA' },
        { name: 'Nevada Sales Tax', rate: 6.85, region: 'NV' },
        { name: 'Arizona Sales Tax', rate: 5.6, region: 'AZ' },
        { name: 'Colorado Sales Tax', rate: 2.9, region: 'CO' },
    ],
    // European Union - VAT Standard Rates
    EU: [
        { name: 'UK VAT Standard', rate: 20.0, country: 'GB' },
        { name: 'UK VAT Reduced', rate: 5.0, country: 'GB' },
        { name: 'Germany VAT', rate: 19.0, country: 'DE' },
        { name: 'Germany VAT Reduced', rate: 7.0, country: 'DE' },
        { name: 'France VAT', rate: 20.0, country: 'FR' },
        { name: 'France VAT Reduced', rate: 5.5, country: 'FR' },
        { name: 'Italy VAT', rate: 22.0, country: 'IT' },
        { name: 'Spain VAT', rate: 21.0, country: 'ES' },
        { name: 'Netherlands VAT', rate: 21.0, country: 'NL' },
        { name: 'Belgium VAT', rate: 21.0, country: 'BE' },
        { name: 'Austria VAT', rate: 20.0, country: 'AT' },
        { name: 'Ireland VAT', rate: 23.0, country: 'IE' },
        { name: 'Poland VAT', rate: 23.0, country: 'PL' },
        { name: 'Sweden VAT', rate: 25.0, country: 'SE' },
    ],
    // Other Major Markets
    OTHER: [
        { name: 'Australia GST', rate: 10.0, country: 'AU' },
        { name: 'New Zealand GST', rate: 15.0, country: 'NZ' },
        { name: 'Canada GST', rate: 5.0, country: 'CA' },
        { name: 'Ontario HST', rate: 13.0, country: 'CA', region: 'ON' },
        { name: 'British Columbia PST', rate: 7.0, country: 'CA', region: 'BC', isCompound: false },
        { name: 'Quebec QST', rate: 9.975, country: 'CA', region: 'QC', isCompound: true },
        { name: 'Singapore GST', rate: 9.0, country: 'SG' },
        { name: 'Malaysia SST', rate: 10.0, country: 'MY' },
        { name: 'India GST', rate: 18.0, country: 'IN' },
        { name: 'Japan Consumption Tax', rate: 10.0, country: 'JP' },
    ],
}
