'use client'

import { useMemo } from 'react'
import { useTenantSettings } from '@/contexts/TenantSettingsContext'
import {
  formatCurrency as formatCurrencyFn,
  formatNumber as formatNumberFn,
  formatDate as formatDateFn,
  formatTime as formatTimeFn,
  formatDateTime as formatDateTimeFn,
  formatRelativeDate as formatRelativeDateFn,
  formatShortDate as formatShortDateFn,
  getCurrencySymbol,
  TenantSettings,
} from '@/lib/formatting'

/**
 * Hook that provides formatting functions pre-configured with tenant settings
 * Use this when you need to format multiple values in a component
 *
 * Note: Functions are not wrapped in useCallback as they are simple wrappers
 * that don't need stable references. The settings object is stable after load.
 */
export function useFormatting() {
  const settings = useTenantSettings()

  // Memoize the entire return object to prevent unnecessary re-renders
  // when settings haven't changed
  return useMemo(() => ({
    formatCurrency: (value: number | null | undefined) => formatCurrencyFn(value, settings),
    formatNumber: (value: number | null | undefined) => formatNumberFn(value, settings),
    formatDate: (date: string | Date | null | undefined) => formatDateFn(date, settings),
    formatTime: (date: string | Date | null | undefined) => formatTimeFn(date, settings),
    formatDateTime: (date: string | Date | null | undefined) => formatDateTimeFn(date, settings),
    formatRelativeDate: (date: string | Date | null | undefined) => formatRelativeDateFn(date, settings),
    formatShortDate: (date: string | Date | null | undefined) => formatShortDateFn(date, settings),
    currencySymbol: getCurrencySymbol(settings.currency),
    settings,
  }), [settings])
}

/**
 * Hook to format a single currency value
 * Use this for simple cases where you only need to format one value
 */
export function useFormattedCurrency(value: number | null | undefined): string {
  const settings = useTenantSettings()
  return useMemo(() => formatCurrencyFn(value, settings), [value, settings])
}

/**
 * Hook to format a single date value
 */
export function useFormattedDate(date: string | Date | null | undefined): string {
  const settings = useTenantSettings()
  return useMemo(() => formatDateFn(date, settings), [date, settings])
}

/**
 * Hook to format a single datetime value
 */
export function useFormattedDateTime(date: string | Date | null | undefined): string {
  const settings = useTenantSettings()
  return useMemo(() => formatDateTimeFn(date, settings), [date, settings])
}

/**
 * Hook to get the current currency symbol
 */
export function useCurrencySymbol(): string {
  const settings = useTenantSettings()
  return useMemo(() => getCurrencySymbol(settings.currency), [settings.currency])
}

/**
 * Utility function for Server Components or non-React contexts
 * Pass settings directly instead of using hooks
 */
export function createFormatter(settings: TenantSettings) {
  return {
    formatCurrency: (value: number | null | undefined) => formatCurrencyFn(value, settings),
    formatNumber: (value: number | null | undefined) => formatNumberFn(value, settings),
    formatDate: (date: string | Date | null | undefined) => formatDateFn(date, settings),
    formatTime: (date: string | Date | null | undefined) => formatTimeFn(date, settings),
    formatDateTime: (date: string | Date | null | undefined) => formatDateTimeFn(date, settings),
    formatRelativeDate: (date: string | Date | null | undefined) => formatRelativeDateFn(date, settings),
    formatShortDate: (date: string | Date | null | undefined) => formatShortDateFn(date, settings),
    currencySymbol: getCurrencySymbol(settings.currency),
  }
}
