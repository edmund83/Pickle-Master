'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TenantSettings, DEFAULT_TENANT_SETTINGS } from '@/lib/formatting'

interface TenantSettingsContextType {
  settings: TenantSettings
  tenantName: string | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const TenantSettingsContext = createContext<TenantSettingsContextType | undefined>(undefined)

interface TenantSettingsProviderProps {
  children: ReactNode
}

export function TenantSettingsProvider({ children }: TenantSettingsProviderProps) {
  const [settings, setSettings] = useState<TenantSettings>(DEFAULT_TENANT_SETTINGS)
  const [tenantName, setTenantName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Guard to prevent concurrent fetches (race condition fix)
  const fetchingRef = useRef(false)

  const fetchSettings = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setSettings(DEFAULT_TENANT_SETTINGS)
        return
      }

      // Get user's tenant_id from profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) {
        setSettings(DEFAULT_TENANT_SETTINGS)
        return
      }

      // Get tenant settings and name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tenant, error: tenantError } = await (supabase as any)
        .from('tenants')
        .select('name, settings')
        .eq('id', profile.tenant_id)
        .single()

      if (tenantError) {
        throw tenantError
      }

      // Set tenant name
      setTenantName(tenant?.name || null)

      if (tenant?.settings) {
        const tenantSettings = tenant.settings as Record<string, unknown>
        setSettings({
          currency: (tenantSettings.currency as string) || DEFAULT_TENANT_SETTINGS.currency,
          timezone: (tenantSettings.timezone as string) || DEFAULT_TENANT_SETTINGS.timezone,
          date_format: (tenantSettings.date_format as string) || DEFAULT_TENANT_SETTINGS.date_format,
          time_format: (tenantSettings.time_format as '12-hour' | '24-hour') || DEFAULT_TENANT_SETTINGS.time_format,
          decimal_precision: (tenantSettings.decimal_precision as string) || DEFAULT_TENANT_SETTINGS.decimal_precision,
          country: (tenantSettings.country as string) || DEFAULT_TENANT_SETTINGS.country,
        })
      } else {
        setSettings(DEFAULT_TENANT_SETTINGS)
      }
    } catch (err) {
      console.error('Failed to fetch tenant settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      setSettings(DEFAULT_TENANT_SETTINGS)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  // Listen for auth state changes to refetch settings
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Only refetch on SIGNED_IN, skip TOKEN_REFRESHED to avoid redundant calls
      if (event === 'SIGNED_IN') {
        fetchSettings()
      } else if (event === 'SIGNED_OUT') {
        setSettings(DEFAULT_TENANT_SETTINGS)
        setTenantName(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchSettings])

  // Memoize context value to prevent cascading re-renders
  const contextValue = useMemo(
    () => ({
      settings,
      tenantName,
      loading,
      error,
      refetch: fetchSettings,
    }),
    [settings, tenantName, loading, error, fetchSettings]
  )

  return (
    <TenantSettingsContext.Provider value={contextValue}>
      {children}
    </TenantSettingsContext.Provider>
  )
}

/**
 * Hook to access tenant settings context
 * Must be used within a TenantSettingsProvider
 */
export function useTenantSettingsContext(): TenantSettingsContextType {
  const context = useContext(TenantSettingsContext)
  if (context === undefined) {
    throw new Error('useTenantSettingsContext must be used within a TenantSettingsProvider')
  }
  return context
}

/**
 * Hook to get just the tenant settings (convenience wrapper)
 */
export function useTenantSettings(): TenantSettings {
  const { settings } = useTenantSettingsContext()
  return settings
}

/**
 * Hook to get the tenant name
 */
export function useTenantName(): string | null {
  const { tenantName } = useTenantSettingsContext()
  return tenantName
}
