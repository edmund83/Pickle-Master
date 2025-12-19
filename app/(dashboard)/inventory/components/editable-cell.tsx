'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { updateItemField } from '@/app/actions/inventory'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface EditableCellProps {
    itemId: string
    field: 'name' | 'sku' | 'location' | 'price' | 'cost_price' | 'min_quantity' | 'quantity'
    value: string | number
    type?: 'text' | 'number'
    className?: string
    align?: 'left' | 'right'
}

export function EditableCell({
    itemId,
    field,
    value: initialValue,
    type = 'text',
    className,
    align = 'left'
}: EditableCellProps) {
    const [value, setValue] = useState(initialValue)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // Update local state if prop changes (e.g. from server revalidation)
    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    const handleBlur = async () => {
        setIsEditing(false)
        if (value === initialValue) return

        setLoading(true)
        try {
            const result = await updateItemField(itemId, field, type === 'number' ? Number(value) : value)
            if (!result.success) {
                // Revert on failure
                setValue(initialValue)
                console.error(result.error)
            }
        } catch (e) {
            setValue(initialValue)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            (e.currentTarget as HTMLInputElement).blur()
        }
        if (e.key === 'Escape') {
            setValue(initialValue)
            setIsEditing(false)
        }
    }

    if (loading) {
        return <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
    }

    if (isEditing) {
        return (
            <Input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                type={type}
                className={cn(
                    "h-8 px-2 py-1 text-sm bg-white shadow-sm ring-1 ring-pickle-500",
                    align === 'right' && "text-right",
                    className
                )}
            />
        )
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className={cn(
                "cursor-text truncate rounded border border-transparent px-2 py-1 hover:border-neutral-200 hover:bg-neutral-50",
                align === 'right' && "text-right",
                // Empty state placeholder
                (value === '' || value === null || value === undefined) && "text-neutral-300 italic h-6",
                className
            )}
            title="Click to edit"
        >
            {(value === '' || value === null || value === undefined) ? 'Empty' : value}
        </div>
    )
}
