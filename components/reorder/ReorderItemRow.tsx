'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, AlertCircle, AlertTriangle, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ReorderItemRowProps {
    item: {
        item_id: string
        item_name: string
        sku: string | null
        item_image: string | null
        vendor_sku: string | null
        current_qty: number
        min_quantity: number
        reorder_point?: number
        suggested_qty: number
        unit_cost: number | null
        urgency: 'critical' | 'urgent' | 'reorder'
    }
    quantity: number
    onQuantityChange: (quantity: number) => void
    showVendorSku?: boolean
    disabled?: boolean
}

const URGENCY_STYLES = {
    critical: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-700',
        icon: AlertCircle,
        label: 'Out of Stock',
    },
    urgent: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-700',
        icon: AlertTriangle,
        label: 'Low Stock',
    },
    reorder: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700',
        icon: TrendingDown,
        label: 'Reorder',
    },
}

export function ReorderItemRow({
    item,
    quantity,
    onQuantityChange,
    showVendorSku = true,
    disabled = false,
}: ReorderItemRowProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [inputValue, setInputValue] = useState(quantity.toString())

    const style = URGENCY_STYLES[item.urgency]
    const Icon = style.icon

    const handleIncrement = () => {
        if (!disabled) {
            onQuantityChange(quantity + 1)
        }
    }

    const handleDecrement = () => {
        if (!disabled && quantity > 1) {
            onQuantityChange(quantity - 1)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value)
    }

    const handleInputBlur = () => {
        const newQty = parseInt(inputValue, 10)
        if (!isNaN(newQty) && newQty >= 1) {
            onQuantityChange(newQty)
        } else {
            setInputValue(quantity.toString())
        }
        setIsEditing(false)
    }

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur()
        } else if (e.key === 'Escape') {
            setInputValue(quantity.toString())
            setIsEditing(false)
        }
    }

    const lineTotal = item.unit_cost ? quantity * item.unit_cost : null

    return (
        <div
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                style.bg,
                style.border
            )}
        >
            {/* Item Image */}
            <div className="relative h-12 w-12 flex-shrink-0 rounded-lg bg-white overflow-hidden border border-neutral-200">
                {item.item_image ? (
                    <Image
                        src={item.item_image}
                        alt={item.item_name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-neutral-300">
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Item Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900 truncate">
                        {item.item_name}
                    </span>
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
                            style.badge
                        )}
                    >
                        <Icon className="h-3 w-3" />
                        {style.label}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                    {item.sku && <span>SKU: {item.sku}</span>}
                    {showVendorSku && item.vendor_sku && (
                        <>
                            <span className="text-neutral-300">|</span>
                            <span>Vendor: {item.vendor_sku}</span>
                        </>
                    )}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                    Stock: {item.current_qty} / Min: {item.min_quantity}
                    {item.reorder_point && item.reorder_point !== item.min_quantity && (
                        <> (Reorder at {item.reorder_point})</>
                    )}
                </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleDecrement}
                    disabled={disabled || quantity <= 1}
                >
                    <Minus className="h-4 w-4" />
                </Button>

                {isEditing ? (
                    <Input
                        type="number"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        className="h-8 w-16 text-center"
                        min={1}
                        autoFocus
                        disabled={disabled}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => {
                            if (!disabled) {
                                setInputValue(quantity.toString())
                                setIsEditing(true)
                            }
                        }}
                        className="h-8 w-16 flex items-center justify-center text-sm font-medium bg-white border border-neutral-200 rounded-md hover:bg-neutral-50"
                        disabled={disabled}
                    >
                        {quantity}
                    </button>
                )}

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleIncrement}
                    disabled={disabled}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Line Total */}
            {lineTotal !== null && (
                <div className="text-right min-w-[80px]">
                    <div className="text-sm font-medium text-neutral-900">
                        RM {lineTotal.toFixed(2)}
                    </div>
                    <div className="text-xs text-neutral-500">
                        @ RM {item.unit_cost?.toFixed(2)}
                    </div>
                </div>
            )}
        </div>
    )
}
