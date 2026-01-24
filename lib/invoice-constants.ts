// Invoice-related constants and types
// Separated from server actions to allow client-side usage

export type CreditReason = 'return' | 'damaged' | 'overcharge' | 'discount' | 'other'

export const creditReasonLabels: Record<CreditReason, string> = {
    return: 'Customer Return',
    damaged: 'Damaged Goods',
    overcharge: 'Overcharge Correction',
    discount: 'Additional Discount',
    other: 'Other',
}
