'use client'

import { useState } from 'react'
import {
    Building2,
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
    ShoppingCart,
    Package,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ReorderItemRow } from './ReorderItemRow'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'
import type { VendorSuggestionGroup } from '@/app/actions/reorder-suggestions'

interface SuggestionsByVendorCardProps {
    vendor: VendorSuggestionGroup
    onCreatePO: (
        vendorId: string,
        items: Array<{ item_id: string; quantity: number; unit_cost: number | null }>
    ) => Promise<void>
    isCreating?: boolean
}

export function SuggestionsByVendorCard({
    vendor,
    onCreatePO,
    isCreating = false,
}: SuggestionsByVendorCardProps) {
    const { formatCurrency } = useFormatting()
    const [isExpanded, setIsExpanded] = useState(true)
    const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(() => {
        const initial: Record<string, number> = {}
        vendor.items.forEach((item) => {
            initial[item.item_id] = item.suggested_qty
        })
        return initial
    })

    // Calculate totals
    const estimatedTotal = vendor.items.reduce((sum, item) => {
        const qty = itemQuantities[item.item_id] || item.suggested_qty
        return sum + (item.unit_cost || 0) * qty
    }, 0)

    const handleQuantityChange = (itemId: string, quantity: number) => {
        setItemQuantities((prev) => ({
            ...prev,
            [itemId]: quantity,
        }))
    }

    const handleCreatePO = async () => {
        const items = vendor.items.map((item) => ({
            item_id: item.item_id,
            quantity: itemQuantities[item.item_id] || item.suggested_qty,
            unit_cost: item.unit_cost,
        }))
        await onCreatePO(vendor.vendor_id, items)
    }

    // Count urgency levels
    const criticalCount = vendor.items.filter((i) => i.urgency === 'critical').length
    const urgentCount = vendor.items.filter((i) => i.urgency === 'urgent').length

    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-3">
                {/* Vendor Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        {/* Vendor Icon */}
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>

                        {/* Vendor Info */}
                        <div className="min-w-0">
                            <h3 className="font-semibold text-neutral-900 truncate">
                                {vendor.vendor_name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500">
                                {vendor.vendor_email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5" />
                                        {vendor.vendor_email}
                                    </span>
                                )}
                                {vendor.vendor_phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" />
                                        {vendor.vendor_phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Create PO Button */}
                    <Button
                        onClick={handleCreatePO}
                        disabled={isCreating}
                        className="flex-shrink-0"
                    >
                        {isCreating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <ShoppingCart className="h-4 w-4 mr-2" />
                        )}
                        Create PO
                    </Button>
                </div>

                {/* Summary Stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-neutral-400" />
                        <span className="text-sm text-neutral-600">
                            {vendor.item_count} item{vendor.item_count !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {criticalCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border border-neutral-200 bg-white text-neutral-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {criticalCount} critical
                        </span>
                    )}

                    {urgentCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border border-neutral-200 bg-white text-neutral-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {urgentCount} urgent
                        </span>
                    )}

                    <div className="ml-auto text-sm">
                        <span className="text-neutral-500">Est. Total:</span>{' '}
                        <span className="font-semibold text-neutral-900">
                            {formatCurrency(estimatedTotal)}
                        </span>
                    </div>

                    {/* Expand/Collapse Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 rounded hover:bg-neutral-100 transition-colors"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-neutral-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-neutral-400" />
                        )}
                    </button>
                </div>
            </CardHeader>

            {/* Items List */}
            <div
                className={cn(
                    'overflow-hidden transition-all duration-200',
                    isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <CardContent className="p-4 pt-0 space-y-2">
                    {vendor.items.map((item) => (
                        <ReorderItemRow
                            key={item.item_id}
                            item={item}
                            quantity={itemQuantities[item.item_id] || item.suggested_qty}
                            onQuantityChange={(qty) => handleQuantityChange(item.item_id, qty)}
                            disabled={isCreating}
                        />
                    ))}
                </CardContent>
            </div>
        </Card>
    )
}
