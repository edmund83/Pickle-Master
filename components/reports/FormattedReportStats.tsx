'use client'

import { useFormatting } from '@/hooks/useFormatting'
import { DollarSign, TrendingUp, TrendingDown, Package, Percent, FolderOpen } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

// Profit Margin Stats
interface ProfitMarginStatsProps {
  totalPotentialProfit: number
  avgMarginPercent: number
  itemsWithCost: number
  totalItems: number
  totalCost: number
}

export function ProfitMarginStats({
  totalPotentialProfit,
  avgMarginPercent,
  itemsWithCost,
  totalItems,
  totalCost,
}: ProfitMarginStatsProps) {
  const { formatCurrency } = useFormatting()

  return (
    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Potential Profit"
        value={formatCurrency(totalPotentialProfit)}
        icon={DollarSign}
        color={totalPotentialProfit >= 0 ? 'green' : 'red'}
      />
      <StatCard
        title="Average Margin"
        value={`${avgMarginPercent.toFixed(1)}%`}
        icon={Percent}
        color={avgMarginPercent >= 0 ? 'blue' : 'red'}
      />
      <StatCard
        title="Items with Cost Data"
        value={`${itemsWithCost} / ${totalItems}`}
        icon={Package}
        color="purple"
      />
      <StatCard
        title="Total Cost Value"
        value={formatCurrency(totalCost)}
        icon={TrendingDown}
        color="yellow"
      />
    </div>
  )
}

// Inventory Value Stats
interface InventoryValueStatsProps {
  totalValue: number
  totalItems: number
  totalQuantity: number
  avgValuePerItem: number
}

export function InventoryValueStats({
  totalValue,
  totalItems,
  totalQuantity,
  avgValuePerItem,
}: InventoryValueStatsProps) {
  const { formatCurrency } = useFormatting()

  return (
    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Value"
        value={formatCurrency(totalValue)}
        icon={DollarSign}
        color="green"
      />
      <StatCard
        title="Total Items"
        value={totalItems.toLocaleString()}
        icon={Package}
        color="blue"
      />
      <StatCard
        title="Total Quantity"
        value={totalQuantity.toLocaleString()}
        icon={TrendingUp}
        color="purple"
      />
      <StatCard
        title="Avg Value/Item"
        value={formatCurrency(avgValuePerItem)}
        icon={DollarSign}
        color="yellow"
      />
    </div>
  )
}

// Formatted Currency Display (for inline use)
interface FormattedCurrencyProps {
  value: number
  className?: string
}

export function FormattedCurrency({ value, className }: FormattedCurrencyProps) {
  const { formatCurrency } = useFormatting()
  return <span className={className}>{formatCurrency(value)}</span>
}

// Formatted Margin Item Row (for profit margin tables)
interface MarginItemRowProps {
  index: number
  name: string
  href: string
  costPrice: number
  price: number
  marginPercent: number
  type: 'highest' | 'lowest'
}

export function MarginItemRow({ index, name, href, costPrice, price, marginPercent, type }: MarginItemRowProps) {
  const { formatCurrency } = useFormatting()

  const badgeClass = type === 'highest'
    ? 'bg-green-100 text-green-700'
    : marginPercent < 0
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700'

  const marginClass = type === 'highest'
    ? 'text-green-600'
    : marginPercent < 0
      ? 'text-red-600'
      : 'text-yellow-600'

  return (
    <li className="px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${badgeClass}`}>
            {index + 1}
          </span>
          <div>
            <a
              href={href}
              className="font-medium text-neutral-900 hover:text-primary hover:underline"
            >
              {name}
            </a>
            <p className="text-xs text-neutral-500">
              Cost: {formatCurrency(costPrice)} → Price: {formatCurrency(price)}
            </p>
          </div>
        </div>
        <span className={`font-semibold ${marginClass}`}>
          {marginPercent.toFixed(1)}%
        </span>
      </div>
    </li>
  )
}

// Top Profit Table Row
interface ProfitTableRowProps {
  index: number
  id: string
  name: string
  sku: string | null
  quantity: number
  costPrice: number
  price: number
  marginPercent: number
  totalProfit: number
}

export function ProfitTableRow({
  index,
  id,
  name,
  sku,
  quantity,
  costPrice,
  price,
  marginPercent,
  totalProfit,
}: ProfitTableRowProps) {
  const { formatCurrency } = useFormatting()

  return (
    <tr className="hover:bg-neutral-50">
      <td className="px-6 py-3 text-neutral-500">{index + 1}</td>
      <td className="px-6 py-3">
        <a
          href={`/inventory/${id}`}
          className="font-medium text-neutral-900 hover:text-primary hover:underline"
        >
          {name}
        </a>
        {sku && <p className="text-xs text-neutral-500">{sku}</p>}
      </td>
      <td className="px-6 py-3 text-right text-neutral-900">{quantity}</td>
      <td className="px-6 py-3 text-right text-neutral-600">{formatCurrency(costPrice)}</td>
      <td className="px-6 py-3 text-right text-neutral-900">{formatCurrency(price)}</td>
      <td className={`px-6 py-3 text-right font-medium ${marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {marginPercent.toFixed(1)}%
      </td>
      <td className={`px-6 py-3 text-right font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(totalProfit)}
      </td>
    </tr>
  )
}

// Value by Folder Row
interface ValueByFolderRowProps {
  folderName: string
  folderColor: string | null
  itemCount: number
  totalValue: number
  percentage: number
  isRoot?: boolean
}

export function ValueByFolderRow({
  folderName,
  folderColor,
  itemCount,
  totalValue,
  percentage,
  isRoot,
}: ValueByFolderRowProps) {
  const { formatCurrency } = useFormatting()

  return (
    <li className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isRoot ? (
            <FolderOpen className="h-4 w-4 text-neutral-400" />
          ) : (
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: folderColor || '#6b7280' }}
            />
          )}
          <span className="font-medium text-neutral-900">
            {folderName}
          </span>
          <span className="text-sm text-neutral-500">
            ({itemCount} items)
          </span>
        </div>
        <span className="font-semibold text-neutral-900">
          {formatCurrency(totalValue)}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        {percentage.toFixed(1)}% of total value
      </p>
    </li>
  )
}

// Top Valuable Item Row
interface TopValueItemRowProps {
  index: number
  id: string
  name: string
  quantity: number
  price: number
  totalValue: number
}

export function TopValueItemRow({ index, id, name, quantity, price, totalValue }: TopValueItemRowProps) {
  const { formatCurrency } = useFormatting()

  return (
    <li className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
          {index + 1}
        </span>
        <div>
          <a href={`/inventory/${id}`} className="font-medium text-neutral-900 hover:text-primary hover:underline">
            {name}
          </a>
          <p className="text-xs text-neutral-500">
            {quantity} × {formatCurrency(price)}
          </p>
        </div>
      </div>
      <span className="font-semibold text-neutral-900">
        {formatCurrency(totalValue)}
      </span>
    </li>
  )
}
