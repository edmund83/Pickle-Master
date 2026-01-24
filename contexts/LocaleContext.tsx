'use client'

/**
 * Locale Context
 *
 * Provides resolved locale settings throughout the application.
 * Implements industry-standard three-tier preference resolution:
 * User Preferences > Tenant Settings > Browser Detection > System Defaults
 *
 * @example
 * // In a component:
 * const settings = useLocale()
 * const formatted = formatCurrency(99.99, settings)
 */

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  resolveLocaleSettings,
  detectBrowserContext,
  SYSTEM_DEFAULTS,
} from '@/lib/i18n'
import type {
  ResolvedLocaleSettings,
  UserLocalePreferences,
  TenantLocaleSettings,
  BrowserContext,
} from '@/lib/i18n'

// ============================================================================
// Context Definition
// ============================================================================

interface LocaleContextValue {
  /** Fully resolved locale settings */
  settings: ResolvedLocaleSettings

  /** Whether browser detection is still loading */
  isLoading: boolean

  /** Detected browser context (for debugging/display) */
  browserContext: BrowserContext
}

const LocaleContext = createContext<LocaleContextValue>({
  settings: SYSTEM_DEFAULTS,
  isLoading: true,
  browserContext: {},
})

// ============================================================================
// Provider Component
// ============================================================================

interface LocaleProviderProps {
  children: ReactNode

  /** User-level preferences (from profiles.locale_preferences) */
  userPreferences?: UserLocalePreferences | null

  /** Tenant-level settings (from tenants.settings) */
  tenantSettings?: TenantLocaleSettings | null
}

/**
 * LocaleProvider
 *
 * Wraps the application to provide locale context.
 * Should be placed high in the component tree, typically in the root layout.
 *
 * @example
 * // In app/layout.tsx or a dashboard layout:
 * <LocaleProvider
 *   userPreferences={profile?.locale_preferences}
 *   tenantSettings={tenant?.settings}
 * >
 *   {children}
 * </LocaleProvider>
 */
export function LocaleProvider({
  children,
  userPreferences,
  tenantSettings,
}: LocaleProviderProps) {
  const [browserContext, setBrowserContext] = useState<BrowserContext>({})
  const [isLoading, setIsLoading] = useState(true)

  // Detect browser context on mount (client-side only)
  useEffect(() => {
    const detected = detectBrowserContext()
    setBrowserContext(detected)
    setIsLoading(false)
  }, [])

  // Resolve settings using priority hierarchy
  const settings = useMemo(() => {
    return resolveLocaleSettings(userPreferences, tenantSettings, browserContext)
  }, [userPreferences, tenantSettings, browserContext])

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      browserContext,
    }),
    [settings, isLoading, browserContext]
  )

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * useLocale
 *
 * Returns the resolved locale settings.
 * Use this when you need the raw settings object.
 *
 * @example
 * const settings = useLocale()
 * console.log(settings.currency) // "USD" or "MYR"
 * console.log(settings._source.locale) // "user" | "tenant" | "browser" | "default"
 */
export function useLocale(): ResolvedLocaleSettings {
  const context = useContext(LocaleContext)
  return context.settings
}

/**
 * useLocaleContext
 *
 * Returns the full locale context including loading state.
 * Useful when you need to show loading states or debug info.
 *
 * @example
 * const { settings, isLoading, browserContext } = useLocaleContext()
 *
 * if (isLoading) {
 *   return <Skeleton />
 * }
 */
export function useLocaleContext(): LocaleContextValue {
  return useContext(LocaleContext)
}

/**
 * useLocaleLoading
 *
 * Returns whether the browser context is still being detected.
 * Initial server render will have isLoading=true.
 */
export function useLocaleLoading(): boolean {
  const context = useContext(LocaleContext)
  return context.isLoading
}

/**
 * useCurrency
 *
 * Convenience hook to get just the currency code.
 *
 * @example
 * const currency = useCurrency() // "USD" or "MYR"
 */
export function useCurrency(): string {
  const context = useContext(LocaleContext)
  return context.settings.currency
}

/**
 * useTimezone
 *
 * Convenience hook to get just the timezone.
 *
 * @example
 * const timezone = useTimezone() // "America/New_York"
 */
export function useTimezone(): string {
  const context = useContext(LocaleContext)
  return context.settings.timezone
}
