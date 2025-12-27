'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CURRENCY_SYMBOLS, TenantSettings } from '@/lib/formatting'

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

interface UpdateTenantSettingsInput {
  name: string
  settings: TenantSettings
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

  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: 'Not authenticated' }
    }

    // Get user's tenant_id from profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.tenant_id) {
      return { error: 'Could not find your organization' }
    }

    // Check user has permission (owner or admin only)
    if (!['owner', 'admin'].includes(profile.role)) {
      return { error: 'You do not have permission to update company settings' }
    }

    // Get existing tenant data to preserve other settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingTenant } = await (supabase as any)
      .from('tenants')
      .select('settings')
      .eq('id', profile.tenant_id)
      .single()

    const existingSettings = typeof existingTenant?.settings === 'object' && existingTenant.settings !== null
      ? existingTenant.settings as Record<string, unknown>
      : {}

    // Update tenant with validated settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.tenant_id)

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
