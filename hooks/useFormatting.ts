'use client'

import { useMemo } from 'react'
import { useTenantSettings } from '@/contexts/TenantSettingsContext'
import type { TenantSettings } from '@/lib/formatting'
import {
  formatCurrency,
  formatNumber,
  formatInteger,
  formatPercent,
  formatCompactNumber,
  formatDate,
  formatTime,
  formatDateTime,
  formatShortDate,
  formatLongDate,
  formatRelativeDate,
  formatRelativeTime,
  getCurrencySymbol,
  getDecimalSeparator,
  getThousandsSeparator,
  formatISO,
  formatISODate,
  resolveLocaleSettings,
  COUNTRY_TO_LOCALE,
  COUNTRY_TO_CURRENCY,
  type ResolvedLocaleSettings,
} from '@/lib/i18n'

/**
 * Convert TenantSettings from TenantSettingsContext to ResolvedLocaleSettings
 * This bridges the existing system to the new i18n formatters
 */
function convertToResolvedSettings(settings: TenantSettings): ResolvedLocaleSettings {
  // Use the resolver with tenant settings as the primary source
  // Cast date_format since TenantSettings uses string type while resolver uses DateFormat union
  return resolveLocaleSettings(
    null, // No user preferences yet (will be added when user prefs are implemented)
    {
      locale: settings.country ? COUNTRY_TO_LOCALE[settings.country] : undefined,
      timezone: settings.timezone,
      currency: settings.currency,
      country: settings.country,
      date_format: settings.date_format as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'DD.MM.YYYY' | undefined,
      time_format: settings.time_format,
      decimal_precision: settings.decimal_precision,
    },
    null // Browser context handled by LocaleProvider when available
  )
}

/**
 * Hook that provides formatting functions pre-configured with tenant settings
 * Use this when you need to format multiple values in a component
 *
 * Note: Functions are not wrapped in useCallback as they are simple wrappers
 * that don't need stable references. The settings object is stable after load.
 */
export function useFormatting() {
  const tenantSettings = useTenantSettings()

  return useMemo(() => {
    const resolved = convertToResolvedSettings(tenantSettings)

    return {
      // Date & Time formatters
      formatDate: (date: string | Date | null | undefined) => formatDate(date, resolved),
      formatTime: (date: string | Date | null | undefined) => formatTime(date, resolved),
      formatDateTime: (date: string | Date | null | undefined) => formatDateTime(date, resolved),
      formatShortDate: (date: string | Date | null | undefined) => formatShortDate(date, resolved),
      formatLongDate: (date: string | Date | null | undefined) => formatLongDate(date, resolved),
      formatRelativeDate: (date: string | Date | null | undefined) => formatRelativeDate(date, resolved),
      formatRelativeTime: (date: string | Date | null | undefined) => formatRelativeTime(date, resolved),

      // Number & Currency formatters
      formatCurrency: (value: number | null | undefined) => formatCurrency(value, resolved),
      formatNumber: (value: number | null | undefined) => formatNumber(value, resolved),
      formatInteger: (value: number | null | undefined) => formatInteger(value, resolved),
      formatPercent: (value: number | null | undefined, decimals?: number) =>
        formatPercent(value, resolved, decimals),
      formatCompactNumber: (value: number | null | undefined) => formatCompactNumber(value, resolved),

      // Utility getters
      currencySymbol: getCurrencySymbol(resolved),
      decimalSeparator: getDecimalSeparator(resolved),
      thousandsSeparator: getThousandsSeparator(resolved),

      // ISO formatters (for data exchange)
      formatISO: (date: string | Date | null | undefined) => formatISO(date),
      formatISODate: (date: string | Date | null | undefined) => formatISODate(date),

      // Raw settings for advanced use cases
      settings: resolved,
      tenantSettings, // Keep original for backward compatibility
    }
  }, [tenantSettings])
}

/**
 * Hook to format a single currency value
 * Use this for simple cases where you only need to format one value
 */
export function useFormattedCurrency(value: number | null | undefined): string {
  const tenantSettings = useTenantSettings()
  return useMemo(() => {
    const resolved = convertToResolvedSettings(tenantSettings)
    return formatCurrency(value, resolved)
  }, [value, tenantSettings])
}

/**
 * Hook to format a single date value
 */
export function useFormattedDate(date: string | Date | null | undefined): string {
  const tenantSettings = useTenantSettings()
  return useMemo(() => {
    const resolved = convertToResolvedSettings(tenantSettings)
    return formatDate(date, resolved)
  }, [date, tenantSettings])
}

/**
 * Hook to format a single datetime value
 */
export function useFormattedDateTime(date: string | Date | null | undefined): string {
  const tenantSettings = useTenantSettings()
  return useMemo(() => {
    const resolved = convertToResolvedSettings(tenantSettings)
    return formatDateTime(date, resolved)
  }, [date, tenantSettings])
}

/**
 * Hook to format a relative time value (e.g., "2 hours ago")
 */
export function useFormattedRelativeTime(date: string | Date | null | undefined): string {
  const tenantSettings = useTenantSettings()
  return useMemo(() => {
    const resolved = convertToResolvedSettings(tenantSettings)
    return formatRelativeTime(date, resolved)
  }, [date, tenantSettings])
}

/**
 * Hook to get the current currency symbol
 */
export function useCurrencySymbol(): string {
  const tenantSettings = useTenantSettings()
  return useMemo(() => {
    const resolved = convertToResolvedSettings(tenantSettings)
    return getCurrencySymbol(resolved)
  }, [tenantSettings])
}

/**
 * Utility function for Server Components or non-React contexts
 * Pass settings directly instead of using hooks
 */
export function createFormatter(tenantSettings: TenantSettings) {
  const resolved = convertToResolvedSettings(tenantSettings)

  return {
    // Date & Time formatters
    formatDate: (date: string | Date | null | undefined) => formatDate(date, resolved),
    formatTime: (date: string | Date | null | undefined) => formatTime(date, resolved),
    formatDateTime: (date: string | Date | null | undefined) => formatDateTime(date, resolved),
    formatShortDate: (date: string | Date | null | undefined) => formatShortDate(date, resolved),
    formatLongDate: (date: string | Date | null | undefined) => formatLongDate(date, resolved),
    formatRelativeDate: (date: string | Date | null | undefined) => formatRelativeDate(date, resolved),
    formatRelativeTime: (date: string | Date | null | undefined) => formatRelativeTime(date, resolved),

    // Number & Currency formatters
    formatCurrency: (value: number | null | undefined) => formatCurrency(value, resolved),
    formatNumber: (value: number | null | undefined) => formatNumber(value, resolved),
    formatInteger: (value: number | null | undefined) => formatInteger(value, resolved),
    formatPercent: (value: number | null | undefined, decimals?: number) =>
      formatPercent(value, resolved, decimals),
    formatCompactNumber: (value: number | null | undefined) => formatCompactNumber(value, resolved),

    // Utility getters
    currencySymbol: getCurrencySymbol(resolved),
    decimalSeparator: getDecimalSeparator(resolved),
    thousandsSeparator: getThousandsSeparator(resolved),

    // ISO formatters
    formatISO: (date: string | Date | null | undefined) => formatISO(date),
    formatISODate: (date: string | Date | null | undefined) => formatISODate(date),

    // Settings
    settings: resolved,
  }
}

/**
 * Create formatter from ResolvedLocaleSettings directly
 * Use when you have already resolved settings (e.g., from LocaleContext)
 */
export function createFormatterFromResolved(resolved: ResolvedLocaleSettings) {
  return {
    formatDate: (date: string | Date | null | undefined) => formatDate(date, resolved),
    formatTime: (date: string | Date | null | undefined) => formatTime(date, resolved),
    formatDateTime: (date: string | Date | null | undefined) => formatDateTime(date, resolved),
    formatShortDate: (date: string | Date | null | undefined) => formatShortDate(date, resolved),
    formatLongDate: (date: string | Date | null | undefined) => formatLongDate(date, resolved),
    formatRelativeDate: (date: string | Date | null | undefined) => formatRelativeDate(date, resolved),
    formatRelativeTime: (date: string | Date | null | undefined) => formatRelativeTime(date, resolved),
    formatCurrency: (value: number | null | undefined) => formatCurrency(value, resolved),
    formatNumber: (value: number | null | undefined) => formatNumber(value, resolved),
    formatInteger: (value: number | null | undefined) => formatInteger(value, resolved),
    formatPercent: (value: number | null | undefined, decimals?: number) =>
      formatPercent(value, resolved, decimals),
    formatCompactNumber: (value: number | null | undefined) => formatCompactNumber(value, resolved),
    currencySymbol: getCurrencySymbol(resolved),
    decimalSeparator: getDecimalSeparator(resolved),
    thousandsSeparator: getThousandsSeparator(resolved),
    formatISO: (date: string | Date | null | undefined) => formatISO(date),
    formatISODate: (date: string | Date | null | undefined) => formatISODate(date),
    settings: resolved,
  }
}

// Re-export types for convenience
export type { ResolvedLocaleSettings }
