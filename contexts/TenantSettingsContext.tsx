'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TenantSettings, DEFAULT_TENANT_SETTINGS } from '@/lib/formatting'
import { isValidTimezone, isValidCurrency } from '@/lib/i18n'

// Valid date format options
const VALID_DATE_FORMATS = new Set(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD.MM.YYYY'])
// Valid time format options
const VALID_TIME_FORMATS = new Set(['12-hour', '24-hour'])
// Valid decimal precision options
const VALID_DECIMAL_PRECISIONS = new Set(['1', '0.1', '0.01', '0.001'])

/**
 * Validate and sanitize tenant settings from database
 * Returns validated settings with defaults for invalid values
 */
function validateTenantSettings(raw: Record<string, unknown>): TenantSettings {
  const validated: TenantSettings = { ...DEFAULT_TENANT_SETTINGS }

  // Validate currency (ISO 4217)
  if (typeof raw.currency === 'string') {
    if (isValidCurrency(raw.currency)) {
      validated.currency = raw.currency
    } else {
      console.warn(`[TenantSettings] Invalid currency "${raw.currency}", using default "${DEFAULT_TENANT_SETTINGS.currency}"`)
    }
  }

  // Validate timezone (IANA)
  if (typeof raw.timezone === 'string') {
    if (isValidTimezone(raw.timezone)) {
      validated.timezone = raw.timezone
    } else {
      console.warn(`[TenantSettings] Invalid timezone "${raw.timezone}", using default "${DEFAULT_TENANT_SETTINGS.timezone}"`)
    }
  }

  // Validate date format
  if (typeof raw.date_format === 'string') {
    if (VALID_DATE_FORMATS.has(raw.date_format)) {
      validated.date_format = raw.date_format
    } else {
      console.warn(`[TenantSettings] Invalid date_format "${raw.date_format}", using default "${DEFAULT_TENANT_SETTINGS.date_format}"`)
    }
  }

  // Validate time format
  if (typeof raw.time_format === 'string') {
    if (VALID_TIME_FORMATS.has(raw.time_format)) {
      validated.time_format = raw.time_format as '12-hour' | '24-hour'
    } else {
      console.warn(`[TenantSettings] Invalid time_format "${raw.time_format}", using default "${DEFAULT_TENANT_SETTINGS.time_format}"`)
    }
  }

  // Validate decimal precision
  if (typeof raw.decimal_precision === 'string') {
    if (VALID_DECIMAL_PRECISIONS.has(raw.decimal_precision)) {
      validated.decimal_precision = raw.decimal_precision
    } else {
      console.warn(`[TenantSettings] Invalid decimal_precision "${raw.decimal_precision}", using default "${DEFAULT_TENANT_SETTINGS.decimal_precision}"`)
    }
  }

  // Country code (simple alpha-2 check)
  if (typeof raw.country === 'string' && /^[A-Z]{2}$/.test(raw.country)) {
    validated.country = raw.country
  } else if (raw.country) {
    console.warn(`[TenantSettings] Invalid country "${raw.country}", using default "${DEFAULT_TENANT_SETTINGS.country}"`)
  }

  return validated
}

interface TenantSettingsContextType {
  settings: TenantSettings
  tenantName: string | null
  tenantLogoUrl: string | null
  companyDetails: TenantCompanyDetails
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const TenantSettingsContext = createContext<TenantSettingsContextType | undefined>(undefined)

interface TenantSettingsProviderProps {
  children: ReactNode
}

export interface TenantCompanyDetails {
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  phone: string | null
  email: string | null
  taxId: string | null
  taxIdLabel: string | null
}

const EMPTY_COMPANY_DETAILS: TenantCompanyDetails = {
  address1: null,
  address2: null,
  city: null,
  state: null,
  postalCode: null,
  country: null,
  phone: null,
  email: null,
  taxId: null,
  taxIdLabel: null,
}

export function TenantSettingsProvider({ children }: TenantSettingsProviderProps) {
  const [settings, setSettings] = useState<TenantSettings>(DEFAULT_TENANT_SETTINGS)
  const [tenantName, setTenantName] = useState<string | null>(null)
  const [tenantLogoUrl, setTenantLogoUrl] = useState<string | null>(null)
  const [companyDetails, setCompanyDetails] = useState<TenantCompanyDetails>(EMPTY_COMPANY_DETAILS)
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
       
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) {
        setSettings(DEFAULT_TENANT_SETTINGS)
        setCompanyDetails(EMPTY_COMPANY_DETAILS)
        return
      }

      // Get tenant settings and name
       
      const { data: tenant, error: tenantError } = await (supabase as any)
        .from('tenants')
        .select('name, settings, logo_url')
        .eq('id', profile.tenant_id)
        .single()

      if (tenantError) {
        throw tenantError
      }

      // Set tenant name
      setTenantName(tenant?.name || null)
      setTenantLogoUrl(tenant?.logo_url || null)

      if (tenant?.settings) {
        const tenantSettings = tenant.settings as Record<string, unknown>
        // Validate settings and use defaults for invalid values
        setSettings(validateTenantSettings(tenantSettings))
        setCompanyDetails({
          address1: (tenantSettings.company_address1 as string) || null,
          address2: (tenantSettings.company_address2 as string) || null,
          city: (tenantSettings.company_city as string) || null,
          state: (tenantSettings.company_state as string) || null,
          postalCode: (tenantSettings.company_postal_code as string) || null,
          country: (tenantSettings.company_country as string) || null,
          phone: (tenantSettings.company_phone as string) || null,
          email: (tenantSettings.company_email as string) || null,
          taxId: (tenantSettings.company_tax_id as string) || null,
          taxIdLabel: (tenantSettings.tax_id_label as string) || null,
        })
      } else {
        setSettings(DEFAULT_TENANT_SETTINGS)
        setCompanyDetails(EMPTY_COMPANY_DETAILS)
      }
    } catch (err) {
      console.error('Failed to fetch tenant settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      setSettings(DEFAULT_TENANT_SETTINGS)
      setCompanyDetails(EMPTY_COMPANY_DETAILS)
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
        setTenantLogoUrl(null)
        setCompanyDetails(EMPTY_COMPANY_DETAILS)
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
      tenantLogoUrl,
      companyDetails,
      loading,
      error,
      refetch: fetchSettings,
    }),
    [settings, tenantName, tenantLogoUrl, companyDetails, loading, error, fetchSettings]
  )

  return (
    <TenantSettingsContext.Provider value={contextValue}>
      {children}
    </TenantSettingsContext.Provider>
  )
}

/**
 * Default context value used when provider is not available
 * (e.g. during SSR prerendering or HMR transitions in Next.js 16)
 */
const DEFAULT_CONTEXT_VALUE: TenantSettingsContextType = {
  settings: DEFAULT_TENANT_SETTINGS,
  tenantName: null,
  tenantLogoUrl: null,
  companyDetails: EMPTY_COMPANY_DETAILS,
  loading: true,
  error: null,
  refetch: async () => {},
}

/**
 * Hook to access tenant settings context
 * Returns defaults when used outside a TenantSettingsProvider
 * (handles SSR prerendering and HMR edge cases in Next.js 16)
 */
export function useTenantSettingsContext(): TenantSettingsContextType {
  const context = useContext(TenantSettingsContext)
  if (context === undefined) {
    return DEFAULT_CONTEXT_VALUE
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

/**
 * Hook to get the tenant logo URL
 */
export function useTenantLogoUrl(): string | null {
  const { tenantLogoUrl } = useTenantSettingsContext()
  return tenantLogoUrl
}

/**
 * Hook to get the tenant company details for documents
 */
export function useTenantCompanyDetails(): TenantCompanyDetails {
  const { companyDetails } = useTenantSettingsContext()
  return companyDetails
}
