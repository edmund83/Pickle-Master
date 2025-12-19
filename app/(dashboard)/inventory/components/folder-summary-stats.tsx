'use client'

import { Folder, Package, Hash, DollarSign } from 'lucide-react'

interface FolderSummaryStatsProps {
  folderCount: number
  itemCount: number
  totalQuantity: number
  totalValue: number
  currency?: string
}

export function FolderSummaryStats({
  folderCount,
  itemCount,
  totalQuantity,
  totalValue,
  currency = 'RM',
}: FolderSummaryStatsProps) {
  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Format currency
  const formatCurrency = (num: number) => {
    return `${currency} ${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="flex items-center gap-6 border-b border-neutral-100 bg-neutral-50/50 px-6 py-3">
      {/* Folders */}
      <div className="flex items-center gap-2">
        <Folder className="h-4 w-4 text-neutral-400" />
        <span className="text-sm text-neutral-600">
          <strong className="font-semibold text-neutral-900">{formatNumber(folderCount)}</strong>
          {' '}
          {folderCount === 1 ? 'folder' : 'folders'}
        </span>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-neutral-200" />

      {/* Items */}
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-neutral-400" />
        <span className="text-sm text-neutral-600">
          <strong className="font-semibold text-neutral-900">{formatNumber(itemCount)}</strong>
          {' '}
          {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-neutral-200" />

      {/* Total Quantity */}
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-neutral-400" />
        <span className="text-sm text-neutral-600">
          <strong className="font-semibold text-neutral-900">{formatNumber(totalQuantity)}</strong>
          {' '}units
        </span>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-neutral-200" />

      {/* Total Value */}
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-neutral-400" />
        <span className="text-sm text-neutral-600">
          <strong className="font-semibold text-neutral-900">{formatCurrency(totalValue)}</strong>
        </span>
      </div>
    </div>
  )
}
