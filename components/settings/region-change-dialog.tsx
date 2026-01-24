'use client'

import { useEffect, useState } from 'react'
import { X, AlertTriangle, Loader2, Package, FileText, Receipt, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCurrencySymbol } from '@/lib/formatting'

interface DataCounts {
  itemsWithPrice: number
  invoices: number
  taxRates: number
  salesOrders: number
}

interface RegionChangeDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  fromCountry: string
  toCountry: string
  fromCurrency: string
  toCurrency: string
  dataCounts: DataCounts | null
  isLoadingCounts: boolean
}

const COUNTRY_NAMES: Record<string, string> = {
  MY: 'Malaysia',
  SG: 'Singapore',
  US: 'United States',
  GB: 'United Kingdom',
  AU: 'Australia',
  JP: 'Japan',
  CN: 'China',
  IN: 'India',
  TH: 'Thailand',
  ID: 'Indonesia',
  PH: 'Philippines',
  VN: 'Vietnam',
}

export function RegionChangeDialog({
  isOpen,
  onClose,
  onConfirm,
  fromCountry,
  toCountry,
  fromCurrency,
  toCurrency,
  dataCounts,
  isLoadingCounts,
}: RegionChangeDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isConfirming) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isConfirming, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function handleConfirm() {
    setIsConfirming(true)
    onConfirm()
    onClose()
    setIsConfirming(false)
  }

  if (!isOpen) return null

  const hasExistingData = dataCounts && (
    dataCounts.itemsWithPrice > 0 ||
    dataCounts.invoices > 0 ||
    dataCounts.taxRates > 0 ||
    dataCounts.salesOrders > 0
  )

  const fromSymbol = getCurrencySymbol(fromCurrency)
  const toSymbol = getCurrencySymbol(toCurrency)
  const currencyChanging = fromCurrency !== toCurrency

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={isConfirming ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="region-change-dialog-title"
        className={cn(
          'relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-xl',
          'animate-in duration-200 zoom-in-95 fade-in-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 id="region-change-dialog-title" className="text-lg font-semibold text-neutral-900">
            Change Business Region?
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
          </div>

          {/* Region change summary */}
          <div className="text-center">
            <p className="text-sm text-neutral-600">
              Changing from{' '}
              <span className="font-semibold text-neutral-900">{COUNTRY_NAMES[fromCountry] || fromCountry}</span>
              {' '}to{' '}
              <span className="font-semibold text-neutral-900">{COUNTRY_NAMES[toCountry] || toCountry}</span>
            </p>
            {currencyChanging && (
              <p className="mt-1 text-sm text-amber-600">
                Currency will change from {fromCurrency} ({fromSymbol}) to {toCurrency} ({toSymbol})
              </p>
            )}
          </div>

          {/* Data impact section */}
          {isLoadingCounts ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
              <span className="ml-2 text-sm text-neutral-500">Checking existing data...</span>
            </div>
          ) : hasExistingData ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800 mb-3">
                Your existing data will be affected:
              </p>
              <ul className="space-y-2">
                {dataCounts.itemsWithPrice > 0 && (
                  <li className="flex items-center gap-2 text-sm text-amber-700">
                    <Package className="h-4 w-4 flex-shrink-0" />
                    <span>
                      <strong>{dataCounts.itemsWithPrice}</strong> items with prices
                      {currencyChanging && (
                        <span className="text-amber-600"> (will show as {toSymbol} instead of {fromSymbol})</span>
                      )}
                    </span>
                  </li>
                )}
                {dataCounts.invoices > 0 && (
                  <li className="flex items-center gap-2 text-sm text-amber-700">
                    <Receipt className="h-4 w-4 flex-shrink-0" />
                    <span><strong>{dataCounts.invoices}</strong> invoices</span>
                  </li>
                )}
                {dataCounts.salesOrders > 0 && (
                  <li className="flex items-center gap-2 text-sm text-amber-700">
                    <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                    <span><strong>{dataCounts.salesOrders}</strong> sales orders</span>
                  </li>
                )}
                {dataCounts.taxRates > 0 && (
                  <li className="flex items-center gap-2 text-sm text-amber-700">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span><strong>{dataCounts.taxRates}</strong> tax rates configured</span>
                  </li>
                )}
              </ul>
              <p className="mt-3 text-xs text-amber-600">
                Values will NOT be converted. Historical reports may appear inconsistent.
              </p>
            </div>
          ) : (
            <p className="text-center text-sm text-neutral-500">
              No existing financial data will be affected.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1 h-11"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={hasExistingData ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isConfirming || isLoadingCounts}
            className="flex-1 h-11"
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              'Change Region'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
