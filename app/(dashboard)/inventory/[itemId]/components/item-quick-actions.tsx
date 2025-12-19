'use client'

import { useState } from 'react'
import { Plus, Minus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateItemQuantity } from '@/app/actions/inventory'
// import { toast } from 'sonner' 
// Actually, let's check package.json for toast lib. But I'll stick to a safe basic feedback for now or just trust revalidatePath.

interface ItemQuickActionsProps {
    itemId: string
    currentQuantity: number
    unit: string
}

export function ItemQuickActions({ itemId, currentQuantity, unit }: ItemQuickActionsProps) {
    const [loading, setLoading] = useState(false)

    const handleAdjust = async (adjustment: number) => {
        setLoading(true)
        try {
            const newQuantity = Math.max(0, currentQuantity + adjustment)
            const result = await updateItemQuantity(itemId, newQuantity, 'quick_action')

            if (!result.success) {
                console.error(result.error)
                // toast.error('Failed to update')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-neutral-500">
                Quick Actions
            </h2>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-neutral-200"
                        onClick={() => handleAdjust(-1)}
                        disabled={loading || currentQuantity <= 0}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                    </Button>
                    <span className="w-16 text-center text-2xl font-bold text-neutral-900">
                        {currentQuantity}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-neutral-200"
                        onClick={() => handleAdjust(1)}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    </Button>
                </div>
                <span className="text-neutral-500">{unit || 'units'}</span>
            </div>
            {/* 
      <div className="mt-4 flex gap-2">
         Placeholder buttons for Move/Tag/Trash can go here, or remain in parent if they are links 
      </div>
      */}
        </div>
    )
}
