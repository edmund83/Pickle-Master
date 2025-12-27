'use client'

import { useFormatting } from '@/hooks/useFormatting'

interface FormattedOrderAmountProps {
  amount: number
}

export function FormattedOrderAmount({ amount }: FormattedOrderAmountProps) {
  const { formatCurrency } = useFormatting()

  if (amount <= 0) return null

  return (
    <span className="font-medium text-neutral-900">
      {formatCurrency(amount)}
    </span>
  )
}
