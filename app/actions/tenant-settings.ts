'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CURRENCY_SYMBOLS, TenantSettings } from '@/lib/formatting'
import { getAuthContext, requireOwnerPermission } from '@/lib/auth/server-auth'

// Valid options - should match the UI dropdown options
const VALID_CURRENCIES = Object.keys(CURRENCY_SYMBOLS)

const VALID_TIMEZONES = [
  'Pacific/Midway', 'Pacific/Honolulu',
  'America/Anchorage', 'America/Los_Angeles', 'America/Denver', 'America/Phoenix',
  'America/Chicago', 'America/Mexico_City', 'America/New_York', 'America/Bogota',
  'America/Caracas', 'America/Halifax', 'America/Sao_Paulo', 'America/Buenos_Aires',
  'Atlantic/South_Georgia', 'Atlantic/Azores',
  'UTC', 'Europe/London', 'Africa/Casablanca',
  'Europe/Paris', 'Europe/Amsterdam', 'Africa/Lagos',
  'Europe/Helsinki', 'Africa/Cairo', 'Africa/Johannesburg',
  'Europe/Istanbul', 'Europe/Moscow', 'Asia/Riyadh', 'Africa/Nairobi',
  'Asia/Tehran', 'Asia/Dubai', 'Asia/Kabul', 'Asia/Karachi', 'Asia/Tashkent',
  'Asia/Kolkata', 'Asia/Kathmandu',
  'Asia/Dhaka', 'Asia/Almaty', 'Asia/Yangon', 'Asia/Bangkok', 'Asia/Ho_Chi_Minh', 'Asia/Jakarta',
  'Asia/Kuala_Lumpur', 'Asia/Singapore', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Taipei', 'Asia/Manila', 'Australia/Perth',
  'Asia/Tokyo', 'Asia/Seoul', 'Australia/Adelaide', 'Australia/Darwin',
  'Australia/Brisbane', 'Australia/Sydney', 'Pacific/Guam',
  'Pacific/Noumea', 'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Tongatapu',
]

const VALID_DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD.MM.YYYY']
const VALID_TIME_FORMATS = ['12-hour', '24-hour']
const VALID_DECIMAL_PRECISIONS = ['1', '0.1', '0.01', '0.001']

const VALID_COUNTRIES = [
  'MY', 'SG', 'US', 'GB', 'AU', 'JP', 'CN', 'IN', 'TH', 'ID', 'PH', 'VN',
]

const MAX_ADDRESS_LENGTH = 200
const MAX_CITY_LENGTH = 100
const MAX_STATE_LENGTH = 100
const MAX_POSTAL_LENGTH = 20
const MAX_COUNTRY_LENGTH = 100
const MAX_PHONE_LENGTH = 50
const MAX_EMAIL_LENGTH = 120
const MAX_TAX_LABEL_LENGTH = 30
const MAX_TAX_ID_LENGTH = 50

function trimOrNull(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

interface UpdateTenantSettingsInput {
  name: string
  settings: TenantSettings & CompanySettings
}

interface CompanySettings {
  company_address1?: string | null
  company_address2?: string | null
  company_city?: string | null
  company_state?: string | null
  company_postal_code?: string | null
  company_country?: string | null
  company_phone?: string | null
  company_email?: string | null
  tax_id_label?: string | null
  company_tax_id?: string | null
}

interface ActionResult {
  success?: boolean
  error?: string
}

/**
 * Validate and update tenant settings with server-side validation
 */
export async function updateTenantSettings(
  input: UpdateTenantSettingsInput
): Promise<ActionResult> {
  const { name, settings } = input

  // Validate company name
  if (!name || name.trim().length < 1) {
    return { error: 'Company name is required' }
  }
  if (name.length > 100) {
    return { error: 'Company name must be less than 100 characters' }
  }

  // Validate currency
  if (!VALID_CURRENCIES.includes(settings.currency)) {
    return { error: `Invalid currency: ${settings.currency}` }
  }

  // Validate timezone
  if (!VALID_TIMEZONES.includes(settings.timezone)) {
    return { error: `Invalid timezone: ${settings.timezone}` }
  }

  // Validate date format
  if (!VALID_DATE_FORMATS.includes(settings.date_format)) {
    return { error: `Invalid date format: ${settings.date_format}` }
  }

  // Validate time format
  if (!VALID_TIME_FORMATS.includes(settings.time_format)) {
    return { error: `Invalid time format: ${settings.time_format}` }
  }

  // Validate decimal precision
  if (!VALID_DECIMAL_PRECISIONS.includes(settings.decimal_precision)) {
    return { error: `Invalid decimal precision: ${settings.decimal_precision}` }
  }

  // Validate country
  if (!VALID_COUNTRIES.includes(settings.country)) {
    return { error: `Invalid country: ${settings.country}` }
  }

  const companyAddress1 = trimOrNull(settings.company_address1)
  const companyAddress2 = trimOrNull(settings.company_address2)
  const companyCity = trimOrNull(settings.company_city)
  const companyState = trimOrNull(settings.company_state)
  const companyPostalCode = trimOrNull(settings.company_postal_code)
  const companyCountry = trimOrNull(settings.company_country)
  const companyPhone = trimOrNull(settings.company_phone)
  const companyEmail = trimOrNull(settings.company_email)
  const taxIdLabel = trimOrNull(settings.tax_id_label)
  const companyTaxId = trimOrNull(settings.company_tax_id)

  if (companyAddress1 && companyAddress1.length > MAX_ADDRESS_LENGTH) {
    return { error: 'Company address line 1 is too long' }
  }
  if (companyAddress2 && companyAddress2.length > MAX_ADDRESS_LENGTH) {
    return { error: 'Company address line 2 is too long' }
  }
  if (companyCity && companyCity.length > MAX_CITY_LENGTH) {
    return { error: 'Company city is too long' }
  }
  if (companyState && companyState.length > MAX_STATE_LENGTH) {
    return { error: 'Company state is too long' }
  }
  if (companyPostalCode && companyPostalCode.length > MAX_POSTAL_LENGTH) {
    return { error: 'Company postal code is too long' }
  }
  if (companyCountry && companyCountry.length > MAX_COUNTRY_LENGTH) {
    return { error: 'Company country is too long' }
  }
  if (companyPhone && companyPhone.length > MAX_PHONE_LENGTH) {
    return { error: 'Company phone is too long' }
  }
  if (companyEmail) {
    if (companyEmail.length > MAX_EMAIL_LENGTH) {
      return { error: 'Company email is too long' }
    }
    if (!isValidEmail(companyEmail)) {
      return { error: 'Company email format is invalid' }
    }
  }
  if (taxIdLabel && taxIdLabel.length > MAX_TAX_LABEL_LENGTH) {
    return { error: 'Tax ID label is too long' }
  }
  if (companyTaxId && companyTaxId.length > MAX_TAX_ID_LENGTH) {
    return { error: 'Company tax ID is too long' }
  }

  try {
    const authResult = await getAuthContext()
    if (!authResult.success) {
      return { error: authResult.error }
    }
    const permResult = requireOwnerPermission(authResult.context)
    if (!permResult.success) {
      return { error: permResult.error }
    }
    const supabase = await createClient()

    // Get existing tenant data to preserve other settings
     
    const { data: existingTenant } = await (supabase as any)
      .from('tenants')
      .select('settings')
      .eq('id', authResult.context.tenantId)
      .single()

    const existingSettings = typeof existingTenant?.settings === 'object' && existingTenant.settings !== null
      ? existingTenant.settings as Record<string, unknown>
      : {}

    // Update tenant with validated settings
     
    const { error: updateError } = await (supabase as any)
      .from('tenants')
      .update({
        name: name.trim(),
        settings: {
          ...existingSettings,
          currency: settings.currency,
          timezone: settings.timezone,
          date_format: settings.date_format,
          time_format: settings.time_format,
          decimal_precision: settings.decimal_precision,
          country: settings.country,
          company_address1: companyAddress1,
          company_address2: companyAddress2,
          company_city: companyCity,
          company_state: companyState,
          company_postal_code: companyPostalCode,
          company_country: companyCountry,
          company_phone: companyPhone,
          company_email: companyEmail,
          tax_id_label: taxIdLabel,
          company_tax_id: companyTaxId,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', authResult.context.tenantId)

    if (updateError) {
      console.error('Failed to update tenant settings:', updateError)
      return { error: 'Failed to update settings. Please try again.' }
    }

    // Revalidate the settings page to refresh cached data
    revalidatePath('/settings/company')

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in updateTenantSettings:', err)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Get tenant's tax inclusive setting
 */
export async function getTaxInclusiveSetting(): Promise<{ pricesIncludeTax: boolean; error?: string }> {
  try {
    const authResult = await getAuthContext()
    if (!authResult.success) {
      return { pricesIncludeTax: false, error: authResult.error }
    }
    const supabase = await createClient()

     
    const { data: tenant } = await (supabase as any)
      .from('tenants')
      .select('prices_include_tax')
      .eq('id', authResult.context.tenantId)
      .single()

    return { pricesIncludeTax: tenant?.prices_include_tax ?? false }
  } catch (err) {
    console.error('Error getting tax inclusive setting:', err)
    return { pricesIncludeTax: false, error: 'Failed to load setting' }
  }
}

/**
 * Update tenant's tax inclusive setting
 */
export async function updateTaxInclusiveSetting(pricesIncludeTax: boolean): Promise<ActionResult> {
  try {
    const authResult = await getAuthContext()
    if (!authResult.success) {
      return { error: authResult.error }
    }
    const permResult = requireOwnerPermission(authResult.context)
    if (!permResult.success) {
      return { error: permResult.error }
    }
    const supabase = await createClient()

     
    const { error: updateError } = await (supabase as any)
      .from('tenants')
      .update({
        prices_include_tax: pricesIncludeTax,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authResult.context.tenantId)

    if (updateError) {
      console.error('Failed to update tax inclusive setting:', updateError)
      return { error: 'Failed to update setting' }
    }

    revalidatePath('/settings/taxes')
    return { success: true }
  } catch (err) {
    console.error('Error updating tax inclusive setting:', err)
    return { error: 'An unexpected error occurred' }
  }
}
