import { Barcode, Ruler } from 'lucide-react'
import { ItemDetailCard } from './item-detail-card'

interface ItemInfoCardProps {
  sku: string | null
  barcode: string | null
  // Dimensions (optional feature)
  showDimensions?: boolean
  weight?: number | null
  weightUnit?: string | null
  length?: number | null
  width?: number | null
  height?: number | null
  dimensionUnit?: string | null
}

export function ItemInfoCard({
  sku,
  barcode,
  showDimensions = false,
  weight,
  weightUnit,
  length,
  width,
  height,
  dimensionUnit,
}: ItemInfoCardProps) {
  const hasDimensions = length && width && height

  return (
    <ItemDetailCard
      title="Identifiers"
      icon={<Barcode className="h-5 w-5" />}
    >
      <div className="space-y-4">
        {/* SKU & Barcode */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">SKU</span>
            <span className="font-mono text-neutral-900">{sku || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Barcode</span>
            <span className="font-mono text-neutral-900">{barcode || '-'}</span>
          </div>
        </div>

        {/* Dimensions (conditional) */}
        {showDimensions && (
          <div className="border-t border-neutral-100 pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Ruler className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-500 uppercase">Dimensions</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Weight</span>
                <span className="font-medium text-neutral-900">
                  {weight ? `${weight} ${weightUnit || 'kg'}` : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">L × W × H</span>
                <span className="font-medium text-neutral-900">
                  {hasDimensions
                    ? `${length} × ${width} × ${height} ${dimensionUnit || 'cm'}`
                    : '-'}
                </span>
              </div>
              {hasDimensions && (
                <div className="flex justify-between border-t border-neutral-100 pt-2">
                  <span className="text-neutral-500">Volume</span>
                  <span className="font-medium text-neutral-900">
                    {(length * width * height).toLocaleString()} {dimensionUnit || 'cm'}³
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ItemDetailCard>
  )
}
