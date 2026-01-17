'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    RefreshCw,
    ShoppingCart,
    Package,
    AlertCircle,
    AlertTriangle,
    TrendingDown,
    Building2,
    Loader2,
    CheckCircle,
    Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SuggestionsByVendorCard } from '@/components/reorder/SuggestionsByVendorCard'
import { CreatePODialog } from '@/components/reorder/CreatePODialog'
import {
    getReorderSuggestionsByVendor,
    getReorderSuggestions,
    createPOFromSuggestions,
    type VendorSuggestionGroup,
    type ReorderSuggestion,
} from '@/app/actions/reorder-suggestions'
import { cn } from '@/lib/utils'
import { useFormatting } from '@/hooks/useFormatting'

type ViewMode = 'vendor' | 'all'

export default function ReorderSuggestionsPage() {
    const router = useRouter()
    const { formatCurrency } = useFormatting()
    const [viewMode, setViewMode] = useState<ViewMode>('vendor')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [vendorGroups, setVendorGroups] = useState<VendorSuggestionGroup[]>([])
    const [allSuggestions, setAllSuggestions] = useState<ReorderSuggestion[]>([])
    const [creatingPO, setCreatingPO] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [pendingPO, setPendingPO] = useState<{
        vendorId: string
        vendorName: string
        items: Array<{ item_id: string; item_name: string; quantity: number; unit_cost: number | null }>
    } | null>(null)

    const loadData = useCallback(async () => {
        try {
            const [vendorData, allData] = await Promise.all([
                getReorderSuggestionsByVendor(),
                getReorderSuggestions(true), // Include items without vendor
            ])
            setVendorGroups(vendorData)
            setAllSuggestions(allData)
        } catch (err) {
            console.error('Error loading reorder suggestions:', err)
        }
    }, [])

    useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            try {
                const [vendorData, allData] = await Promise.all([
                    getReorderSuggestionsByVendor(),
                    getReorderSuggestions(true),
                ])
                if (mounted) {
                    setVendorGroups(vendorData)
                    setAllSuggestions(allData)
                    setLoading(false)
                }
            } catch (err) {
                console.error('Error loading reorder suggestions:', err)
                if (mounted) {
                    setLoading(false)
                }
            }
        }
        fetchData()
        return () => { mounted = false }
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadData()
        setRefreshing(false)
    }

    const handleCreatePO = async (
        vendorId: string,
        items: Array<{ item_id: string; quantity: number; unit_cost: number | null }>
    ) => {
        // Find vendor name
        const vendor = vendorGroups.find((v) => v.vendor_id === vendorId)
        if (!vendor) return

        // Set up dialog data
        setPendingPO({
            vendorId,
            vendorName: vendor.vendor_name,
            items: items.map((item) => {
                const vendorItem = vendor.items.find((i) => i.item_id === item.item_id)
                return {
                    item_id: item.item_id,
                    item_name: vendorItem?.item_name || 'Unknown Item',
                    quantity: item.quantity,
                    unit_cost: item.unit_cost,
                }
            }),
        })
        setDialogOpen(true)
    }

    const handleConfirmPO = async () => {
        if (!pendingPO) return { success: false, error: 'No pending PO' }

        setCreatingPO(pendingPO.vendorId)
        const result = await createPOFromSuggestions({
            vendor_id: pendingPO.vendorId,
            items: pendingPO.items.map((i) => ({
                item_id: i.item_id,
                quantity: i.quantity,
                unit_cost: i.unit_cost,
            })),
        })
        setCreatingPO(null)

        if (result.success) {
            setSuccessMessage(`Created ${result.display_id}`)
            // Refresh data after successful creation
            await loadData()
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000)
        }

        return result
    }

    // Calculate stats
    const totalItems = viewMode === 'vendor'
        ? vendorGroups.reduce((sum, v) => sum + v.item_count, 0)
        : allSuggestions.length
    const totalEstimate = viewMode === 'vendor'
        ? vendorGroups.reduce((sum, v) => sum + (v.estimated_total || 0), 0)
        : 0
    const criticalCount = allSuggestions.filter((s) => s.urgency === 'critical').length
    const urgentCount = allSuggestions.filter((s) => s.urgency === 'urgent').length
    const itemsWithoutVendor = allSuggestions.filter((s) => !s.preferred_vendor_id).length

    return (
        <div className="min-h-screen w-full bg-neutral-50">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/tasks"
                                className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5 text-neutral-600" />
                            </Link>
                            <div>
                                <h1 className="text-lg font-semibold text-neutral-900">
                                    Reorder Suggestions
                                </h1>
                                <p className="text-xs text-neutral-500">
                                    Items below reorder point
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw
                                className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')}
                            />
                            Refresh
                        </Button>
                    </div>
                </div>
            </header>

            {/* Success Toast */}
            {successMessage && (
                <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg shadow-lg animate-in slide-in-from-right">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                        {successMessage}
                    </span>
                </div>
            )}

            {/* Content */}
            <main className="p-4 max-w-5xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : allSuggestions.length === 0 ? (
                    <Card className="bg-white">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                All Stocked Up!
                            </h3>
                            <p className="text-neutral-500 max-w-md">
                                No items are currently below their reorder point. Check back
                                later or adjust your minimum stock levels in item settings.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            <Card className="bg-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-neutral-700" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-neutral-900">
                                                {totalItems}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                Items to Reorder
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-neutral-900">
                                                {criticalCount}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                Out of Stock
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-neutral-900">
                                                {urgentCount}
                                            </p>
                                            <p className="text-xs text-neutral-500">Low Stock</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                                            <ShoppingCart className="h-5 w-5 text-neutral-700" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-neutral-900">
                                                {formatCurrency(totalEstimate)}
                                            </p>
                                            <p className="text-xs text-neutral-500">Est. Total</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-1">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('vendor')}
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                                        viewMode === 'vendor'
                                            ? 'bg-primary text-white'
                                            : 'text-neutral-600 hover:bg-neutral-100'
                                    )}
                                >
                                    <Building2 className="h-4 w-4" />
                                    By Vendor
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('all')}
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                                        viewMode === 'all'
                                            ? 'bg-primary text-white'
                                            : 'text-neutral-600 hover:bg-neutral-100'
                                    )}
                                >
                                    <Package className="h-4 w-4" />
                                    All Items
                                </button>
                            </div>

                            {itemsWithoutVendor > 0 && viewMode === 'vendor' && (
                                <span className="text-sm text-neutral-500 flex items-center gap-1">
                                    <Info className="h-4 w-4 text-neutral-400" />
                                    {itemsWithoutVendor} item
                                    {itemsWithoutVendor !== 1 ? 's' : ''} without vendor
                                </span>
                            )}
                        </div>

                        {/* Content based on view mode */}
                        {viewMode === 'vendor' ? (
                            <div className="space-y-4">
                                {vendorGroups.length > 0 ? (
                                    vendorGroups.map((vendor) => (
                                        <SuggestionsByVendorCard
                                            key={vendor.vendor_id}
                                            vendor={vendor}
                                            onCreatePO={handleCreatePO}
                                            isCreating={creatingPO === vendor.vendor_id}
                                        />
                                    ))
                                ) : (
                                    <Card className="bg-white">
                                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                                                <Building2 className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                                No Vendor Links
                                            </h3>
                                            <p className="text-neutral-500 max-w-md mb-4">
                                                Items need to be linked to vendors for quick PO
                                                creation. Switch to &quot;All Items&quot; view to see all
                                                suggestions.
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={() => setViewMode('all')}
                                            >
                                                View All Items
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <Card className="bg-white">
                                <CardContent className="p-4">
                                    <div className="space-y-2">
                                        {allSuggestions.map((suggestion) => (
                                            <div
                                                key={suggestion.item_id}
                                                className={cn(
                                                    'flex items-center gap-3 p-3 rounded-lg border border-neutral-200 border-l-4 bg-white hover:bg-neutral-50',
                                                    suggestion.urgency === 'critical' &&
                                                        'border-l-red-300',
                                                    suggestion.urgency === 'urgent' &&
                                                        'border-l-amber-300',
                                                    suggestion.urgency === 'reorder' &&
                                                        'border-l-blue-300'
                                                )}
                                            >
                                                {/* Urgency Icon */}
                                                <div
                                                    className={cn(
                                                        'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-neutral-100'
                                                    )}
                                                >
                                                    {suggestion.urgency === 'critical' && (
                                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                                    )}
                                                    {suggestion.urgency === 'urgent' && (
                                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                    )}
                                                    {suggestion.urgency === 'reorder' && (
                                                        <TrendingDown className="h-4 w-4 text-blue-600" />
                                                    )}
                                                </div>

                                                {/* Item Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-neutral-900 truncate">
                                                        {suggestion.item_name}
                                                    </div>
                                                    <div className="text-sm text-neutral-500">
                                                        {suggestion.sku && (
                                                            <span>SKU: {suggestion.sku} | </span>
                                                        )}
                                                        Stock: {suggestion.current_qty} / Min:{' '}
                                                        {suggestion.min_quantity}
                                                    </div>
                                                </div>

                                                {/* Vendor Info */}
                                                <div className="text-right text-sm">
                                                    {suggestion.preferred_vendor_name ? (
                                                        <div className="text-neutral-600">
                                                            {suggestion.preferred_vendor_name}
                                                        </div>
                                                    ) : (
                                                        <div className="text-neutral-500">
                                                            No vendor linked
                                                        </div>
                                                    )}
                                                    <div className="text-neutral-400">
                                                        Suggest: {suggestion.suggested_qty}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </main>

            {/* Create PO Dialog */}
            <CreatePODialog
                isOpen={dialogOpen}
                onClose={() => {
                    setDialogOpen(false)
                    setPendingPO(null)
                }}
                vendorName={pendingPO?.vendorName || ''}
                items={pendingPO?.items || []}
                onConfirm={handleConfirmPO}
            />
        </div>
    )
}
