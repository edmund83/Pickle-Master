'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '@/components/settings'
import {
    Plus,
    Percent,
    Check,
    AlertCircle,
    Trash2,
    Loader2,
    Star,
    Globe,
} from 'lucide-react'
import {
    getAllTaxRates,
    createTaxRate,
    updateTaxRate,
    deleteTaxRate,
    setDefaultTaxRate,
    toggleTaxRateActive,
    type TaxRate,
    type CreateTaxRateInput,
    TAX_TYPES,
} from '@/app/actions/tax-rates'
import { TaxRateFormSheet } from '@/components/settings/taxes/TaxRateFormSheet'
import { TaxRatesDataTable } from '@/components/settings/taxes/TaxRatesDataTable'
import { DeleteTaxRateDialog } from '@/components/settings/taxes/DeleteTaxRateDialog'

export default function TaxSettingsPage() {
    const [taxRates, setTaxRates] = useState<TaxRate[]>([])
    const [loading, setLoading] = useState(true)

    // Form sheet state
    const [formSheetOpen, setFormSheetOpen] = useState(false)
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
    const [editingRate, setEditingRate] = useState<TaxRate | null>(null)

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingRate, setDeletingRate] = useState<TaxRate | null>(null)

    // Bulk operations
    const [selectedRates, setSelectedRates] = useState<TaxRate[]>([])
    const [bulkDeleting, setBulkDeleting] = useState(false)

    // Messages
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Auto-dismiss success messages
    useEffect(() => {
        if (message?.type === 'success') {
            const timer = setTimeout(() => setMessage(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [message])

    const loadTaxRates = useCallback(async () => {
        setLoading(true)
        try {
            const rates = await getAllTaxRates()
            setTaxRates(rates)
        } catch (error) {
            console.error('Error loading tax rates:', error)
            setMessage({ type: 'error', text: 'Failed to load tax rates' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTaxRates()
    }, [loadTaxRates])

    async function handleCreate(data: CreateTaxRateInput) {
        const result = await createTaxRate(data)
        if (result.success) {
            setMessage({ type: 'success', text: 'Tax rate created successfully' })
            loadTaxRates()
        } else {
            throw new Error(result.error || 'Failed to create tax rate')
        }
    }

    async function handleUpdate(data: CreateTaxRateInput) {
        if (!editingRate) throw new Error('No tax rate selected')

        const result = await updateTaxRate(editingRate.id, data)
        if (result.success) {
            setMessage({ type: 'success', text: 'Tax rate updated successfully' })
            setEditingRate(null)
            loadTaxRates()
        } else {
            throw new Error(result.error || 'Failed to update tax rate')
        }
    }

    async function handleDelete() {
        if (!deletingRate) return

        const result = await deleteTaxRate(deletingRate.id)
        if (result.success) {
            if (result.error) {
                // Soft delete message
                setMessage({ type: 'success', text: result.error })
            } else {
                setMessage({ type: 'success', text: 'Tax rate deleted' })
            }
            setDeletingRate(null)
            loadTaxRates()
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to delete' })
        }
    }

    async function handleBulkDelete() {
        if (selectedRates.length === 0) return

        setBulkDeleting(true)
        try {
            let successCount = 0
            for (const rate of selectedRates) {
                const result = await deleteTaxRate(rate.id)
                if (result.success) successCount++
            }

            setMessage({
                type: 'success',
                text: `Deleted ${successCount} tax rate${successCount === 1 ? '' : 's'}`,
            })
            setSelectedRates([])
            loadTaxRates()
        } catch {
            setMessage({ type: 'error', text: 'Failed to delete tax rates' })
        } finally {
            setBulkDeleting(false)
        }
    }

    async function handleSetDefault(rate: TaxRate) {
        const result = await setDefaultTaxRate(rate.id)
        if (result.success) {
            setMessage({ type: 'success', text: `${rate.name} is now the default tax rate` })
            loadTaxRates()
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to set default' })
        }
    }

    async function handleToggleActive(rate: TaxRate) {
        const result = await toggleTaxRateActive(rate.id)
        if (result.success) {
            setMessage({
                type: 'success',
                text: `${rate.name} ${rate.is_active ? 'deactivated' : 'activated'}`,
            })
            loadTaxRates()
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to toggle status' })
        }
    }

    function openCreateForm() {
        setFormMode('create')
        setEditingRate(null)
        setFormSheetOpen(true)
    }

    function openEditForm(rate: TaxRate) {
        setFormMode('edit')
        setEditingRate(rate)
        setFormSheetOpen(true)
    }

    function openDeleteDialog(rate: TaxRate) {
        setDeletingRate(rate)
        setDeleteDialogOpen(true)
    }

    // Stats
    const activeRates = taxRates.filter((r) => r.is_active)
    const defaultRate = taxRates.find((r) => r.is_default)

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 bg-neutral-200 rounded" />
                    <div className="h-4 w-64 bg-neutral-200 rounded" />
                    <div className="h-64 bg-neutral-200 rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-neutral-900">Tax Rates</h1>
                <p className="mt-1 text-neutral-500">
                    Configure tax rates for sales orders and invoices (USA Sales Tax, VAT, GST, etc.)
                </p>
            </div>

            {/* Global Message */}
            {message && (
                <div
                    className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
                        message.type === 'success'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                    }`}
                    role="alert"
                >
                    {message.type === 'success' ? (
                        <Check className="h-5 w-5 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl bg-white border border-neutral-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                                <Percent className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-neutral-900">
                                    {activeRates.length}
                                </p>
                                <p className="text-sm text-neutral-500">Active Rates</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white border border-neutral-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                                <Star className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-neutral-900">
                                    {defaultRate ? `${defaultRate.rate}%` : 'None'}
                                </p>
                                <p className="text-sm text-neutral-500">Default Rate</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white border border-neutral-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                                <Globe className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-neutral-900">
                                    {TAX_TYPES.length}
                                </p>
                                <p className="text-sm text-neutral-500">Tax Types Supported</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tax Rates Table */}
                <SettingsSection
                    title="Your Tax Rates"
                    description={`${taxRates.length} tax rate${taxRates.length === 1 ? '' : 's'} configured`}
                    icon={Percent}
                    headerAction={
                        <div className="flex items-center gap-2">
                            {selectedRates.length > 0 && (
                                <Button
                                    variant="destructive"
                                    onClick={handleBulkDelete}
                                    disabled={bulkDeleting}
                                >
                                    {bulkDeleting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    Delete {selectedRates.length}
                                </Button>
                            )}
                            <Button onClick={openCreateForm}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Tax Rate
                            </Button>
                        </div>
                    }
                >
                    {taxRates.length > 0 ? (
                        <TaxRatesDataTable
                            taxRates={taxRates}
                            onEdit={openEditForm}
                            onDelete={openDeleteDialog}
                            onSetDefault={handleSetDefault}
                            onToggleActive={handleToggleActive}
                            onSelectionChange={setSelectedRates}
                            enableSelection={true}
                        />
                    ) : (
                        <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
                            <Percent className="mx-auto h-12 w-12 text-neutral-300" />
                            <p className="mt-4 font-medium text-neutral-600">No tax rates configured</p>
                            <p className="mt-1 text-sm text-neutral-400">
                                Create tax rates to apply to your sales orders and invoices
                            </p>
                            <Button className="mt-4" onClick={openCreateForm}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create your first tax rate
                            </Button>
                        </div>
                    )}
                </SettingsSection>

                {/* Help Section */}
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                    <h3 className="font-medium text-blue-900">Tax Rate Types</h3>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {TAX_TYPES.map((type) => (
                            <div key={type.value} className="text-sm text-blue-700">
                                <span className="font-medium">{type.label}</span>
                                <span className="text-blue-600"> - {type.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create/Edit Form Sheet */}
            <TaxRateFormSheet
                isOpen={formSheetOpen}
                onClose={() => {
                    setFormSheetOpen(false)
                    setEditingRate(null)
                }}
                onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
                initialData={editingRate || undefined}
                mode={formMode}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteTaxRateDialog
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false)
                    setDeletingRate(null)
                }}
                onConfirm={handleDelete}
                taxRateName={deletingRate?.name || ''}
                isDefault={deletingRate?.is_default || false}
            />
        </div>
    )
}
