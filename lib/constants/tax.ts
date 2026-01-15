// Tax types supported globally
export const TAX_TYPES = [
    { value: 'sales_tax', label: 'Sales Tax', description: 'US state/local sales tax' },
    { value: 'vat', label: 'VAT', description: 'Value Added Tax (EU, UK)' },
    { value: 'gst', label: 'GST', description: 'Goods and Services Tax (AU, NZ, SG, IN)' },
    { value: 'hst', label: 'HST', description: 'Harmonized Sales Tax (Canada)' },
    { value: 'pst', label: 'PST', description: 'Provincial Sales Tax (Canada)' },
    { value: 'other', label: 'Other', description: 'Custom tax type' },
] as const

export type TaxType = (typeof TAX_TYPES)[number]['value']
