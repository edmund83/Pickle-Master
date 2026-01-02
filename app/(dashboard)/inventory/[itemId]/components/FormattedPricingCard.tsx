'use client'

import { DollarSign } from 'lucide-react'
import { useFormatting } from '@/hooks/useFormatting'
import { ItemDetailCard } from './item-detail-card'

interface FormattedPricingCardProps {
  price: number
  costPrice: number | null
  quantity: number
}

export function FormattedPricingCard({ price, costPrice, quantity }: FormattedPricingCardProps) {
  const { formatCurrency } = useFormatting()

  const totalValue = quantity * price
  const marginAmount = price - (costPrice || 0)
  const marginPercent = costPrice && costPrice > 0
    ? ((marginAmount / costPrice) * 100)
    : null
  const totalProfit = quantity * marginAmount

  return (
    <ItemDetailCard title="Pricing" icon={<DollarSign className="h-5 w-5" />}>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-neutral-500">Selling Price</span>
          <span className="font-medium text-neutral-900">
            {formatCurrency(price)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Cost Price</span>
          <span className="font-medium text-neutral-900">
            {costPrice ? formatCurrency(costPrice) : '-'}
          </span>
        </div>
        {marginPercent !== null && (
          <div className="flex justify-between">
            <span className="text-neutral-500">Margin</span>
            <span className={`font-medium ${marginAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {marginPercent.toFixed(1)}% / {formatCurrency(marginAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-neutral-100 pt-2">
          <span className="text-neutral-500">Total Value</span>
          <span className="font-bold text-primary">
            {formatCurrency(totalValue)}
          </span>
        </div>
        {marginPercent !== null && (
          <div className="flex justify-between">
            <span className="text-neutral-500">Total Profit</span>
            <span className={`font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalProfit)}
            </span>
          </div>
        )}
      </div>
    </ItemDetailCard>
  )
}
