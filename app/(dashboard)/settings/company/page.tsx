'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Building2, Globe, Upload, X, Check, AlertCircle, Camera } from 'lucide-react'
import { SettingsSection } from '@/components/settings'
import type { Tenant } from '@/types/database.types'
import { updateTenantSettings } from '@/app/actions/tenant-settings'
import type { TenantSettings } from '@/lib/formatting'

// Currency options with symbols - comprehensive list sorted alphabetically by code
const CURRENCIES = [
  // Major currencies
  { value: 'USD', label: 'US Dollar - USD - $' },
  { value: 'EUR', label: 'Euro - EUR - €' },
  { value: 'GBP', label: 'British Pound - GBP - £' },
  { value: 'JPY', label: 'Japanese Yen - JPY - ¥' },
  { value: 'CNY', label: 'Chinese Yuan - CNY - ¥' },
  // A
  { value: 'AED', label: 'UAE Dirham - AED - د.إ' },
  { value: 'AFN', label: 'Afghan Afghani - AFN - ؋' },
  { value: 'ALL', label: 'Albanian Lek - ALL - L' },
  { value: 'AMD', label: 'Armenian Dram - AMD - ֏' },
  { value: 'ARS', label: 'Argentine Peso - ARS - $' },
  { value: 'AUD', label: 'Australian Dollar - AUD - A$' },
  { value: 'AZN', label: 'Azerbaijani Manat - AZN - ₼' },
  // B
  { value: 'BAM', label: 'Bosnia Mark - BAM - KM' },
  { value: 'BDT', label: 'Bangladeshi Taka - BDT - ৳' },
  { value: 'BGN', label: 'Bulgarian Lev - BGN - лв' },
  { value: 'BHD', label: 'Bahraini Dinar - BHD - .د.ب' },
  { value: 'BND', label: 'Brunei Dollar - BND - B$' },
  { value: 'BOB', label: 'Bolivian Boliviano - BOB - Bs.' },
  { value: 'BRL', label: 'Brazilian Real - BRL - R$' },
  // C
  { value: 'CAD', label: 'Canadian Dollar - CAD - C$' },
  { value: 'CHF', label: 'Swiss Franc - CHF - CHF' },
  { value: 'CLP', label: 'Chilean Peso - CLP - $' },
  { value: 'COP', label: 'Colombian Peso - COP - $' },
  { value: 'CRC', label: 'Costa Rican Colón - CRC - ₡' },
  { value: 'CZK', label: 'Czech Koruna - CZK - Kč' },
  // D
  { value: 'DKK', label: 'Danish Krone - DKK - kr' },
  { value: 'DOP', label: 'Dominican Peso - DOP - RD$' },
  { value: 'DZD', label: 'Algerian Dinar - DZD - د.ج' },
  // E
  { value: 'EGP', label: 'Egyptian Pound - EGP - E£' },
  { value: 'ETB', label: 'Ethiopian Birr - ETB - Br' },
  // G
  { value: 'GEL', label: 'Georgian Lari - GEL - ₾' },
  { value: 'GHS', label: 'Ghanaian Cedi - GHS - ₵' },
  { value: 'GTQ', label: 'Guatemalan Quetzal - GTQ - Q' },
  // H
  { value: 'HKD', label: 'Hong Kong Dollar - HKD - HK$' },
  { value: 'HNL', label: 'Honduran Lempira - HNL - L' },
  { value: 'HRK', label: 'Croatian Kuna - HRK - kn' },
  { value: 'HUF', label: 'Hungarian Forint - HUF - Ft' },
  // I
  { value: 'IDR', label: 'Indonesian Rupiah - IDR - Rp' },
  { value: 'ILS', label: 'Israeli Shekel - ILS - ₪' },
  { value: 'INR', label: 'Indian Rupee - INR - ₹' },
  { value: 'IQD', label: 'Iraqi Dinar - IQD - ع.د' },
  { value: 'IRR', label: 'Iranian Rial - IRR - ﷼' },
  { value: 'ISK', label: 'Icelandic Króna - ISK - kr' },
  // J
  { value: 'JOD', label: 'Jordanian Dinar - JOD - د.ا' },
  // K
  { value: 'KES', label: 'Kenyan Shilling - KES - KSh' },
  { value: 'KGS', label: 'Kyrgyzstani Som - KGS - с' },
  { value: 'KHR', label: 'Cambodian Riel - KHR - ៛' },
  { value: 'KRW', label: 'South Korean Won - KRW - ₩' },
  { value: 'KWD', label: 'Kuwaiti Dinar - KWD - د.ك' },
  { value: 'KZT', label: 'Kazakhstani Tenge - KZT - ₸' },
  // L
  { value: 'LAK', label: 'Lao Kip - LAK - ₭' },
  { value: 'LBP', label: 'Lebanese Pound - LBP - ل.ل' },
  { value: 'LKR', label: 'Sri Lankan Rupee - LKR - Rs' },
  // M
  { value: 'MAD', label: 'Moroccan Dirham - MAD - د.م.' },
  { value: 'MDL', label: 'Moldovan Leu - MDL - L' },
  { value: 'MKD', label: 'Macedonian Denar - MKD - ден' },
  { value: 'MMK', label: 'Myanmar Kyat - MMK - K' },
  { value: 'MNT', label: 'Mongolian Tugrik - MNT - ₮' },
  { value: 'MOP', label: 'Macanese Pataca - MOP - MOP$' },
  { value: 'MUR', label: 'Mauritian Rupee - MUR - ₨' },
  { value: 'MVR', label: 'Maldivian Rufiyaa - MVR - Rf' },
  { value: 'MXN', label: 'Mexican Peso - MXN - $' },
  { value: 'MYR', label: 'Malaysian Ringgit - MYR - RM' },
  // N
  { value: 'NGN', label: 'Nigerian Naira - NGN - ₦' },
  { value: 'NIO', label: 'Nicaraguan Córdoba - NIO - C$' },
  { value: 'NOK', label: 'Norwegian Krone - NOK - kr' },
  { value: 'NPR', label: 'Nepalese Rupee - NPR - Rs' },
  { value: 'NZD', label: 'New Zealand Dollar - NZD - NZ$' },
  // O
  { value: 'OMR', label: 'Omani Rial - OMR - ر.ع.' },
  // P
  { value: 'PAB', label: 'Panamanian Balboa - PAB - B/.' },
  { value: 'PEN', label: 'Peruvian Sol - PEN - S/' },
  { value: 'PHP', label: 'Philippine Peso - PHP - ₱' },
  { value: 'PKR', label: 'Pakistani Rupee - PKR - Rs' },
  { value: 'PLN', label: 'Polish Zloty - PLN - zł' },
  { value: 'PYG', label: 'Paraguayan Guarani - PYG - ₲' },
  // Q
  { value: 'QAR', label: 'Qatari Riyal - QAR - ر.ق' },
  // R
  { value: 'RON', label: 'Romanian Leu - RON - lei' },
  { value: 'RSD', label: 'Serbian Dinar - RSD - дин' },
  { value: 'RUB', label: 'Russian Ruble - RUB - ₽' },
  { value: 'RWF', label: 'Rwandan Franc - RWF - FRw' },
  // S
  { value: 'SAR', label: 'Saudi Riyal - SAR - ر.س' },
  { value: 'SEK', label: 'Swedish Krona - SEK - kr' },
  { value: 'SGD', label: 'Singapore Dollar - SGD - S$' },
  // T
  { value: 'THB', label: 'Thai Baht - THB - ฿' },
  { value: 'TND', label: 'Tunisian Dinar - TND - د.ت' },
  { value: 'TRY', label: 'Turkish Lira - TRY - ₺' },
  { value: 'TWD', label: 'Taiwan Dollar - TWD - NT$' },
  { value: 'TZS', label: 'Tanzanian Shilling - TZS - TSh' },
  // U
  { value: 'UAH', label: 'Ukrainian Hryvnia - UAH - ₴' },
  { value: 'UGX', label: 'Ugandan Shilling - UGX - USh' },
  { value: 'UYU', label: 'Uruguayan Peso - UYU - $U' },
  { value: 'UZS', label: 'Uzbekistani Som - UZS - so\'m' },
  // V
  { value: 'VES', label: 'Venezuelan Bolívar - VES - Bs.' },
  { value: 'VND', label: 'Vietnamese Dong - VND - ₫' },
  // Z
  { value: 'ZAR', label: 'South African Rand - ZAR - R' },
  { value: 'ZMW', label: 'Zambian Kwacha - ZMW - ZK' },
]

// Country options
const COUNTRIES = [
  { value: 'MY', label: 'Malaysia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'IN', label: 'India' },
  { value: 'TH', label: 'Thailand' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'PH', label: 'Philippines' },
  { value: 'VN', label: 'Vietnam' },
]

// Timezone options - comprehensive list sorted by UTC offset
const TIMEZONES = [
  // UTC -12 to -10
  { value: 'Pacific/Midway', label: '(UTC -11:00) Midway Island' },
  { value: 'Pacific/Honolulu', label: '(UTC -10:00) Hawaii' },
  // UTC -9 to -7
  { value: 'America/Anchorage', label: '(UTC -09:00) Alaska' },
  { value: 'America/Los_Angeles', label: '(UTC -08:00) Pacific Time (US & Canada)' },
  { value: 'America/Denver', label: '(UTC -07:00) Mountain Time (US & Canada)' },
  { value: 'America/Phoenix', label: '(UTC -07:00) Arizona' },
  // UTC -6 to -4
  { value: 'America/Chicago', label: '(UTC -06:00) Central Time (US & Canada)' },
  { value: 'America/Mexico_City', label: '(UTC -06:00) Mexico City' },
  { value: 'America/New_York', label: '(UTC -05:00) Eastern Time (US & Canada)' },
  { value: 'America/Bogota', label: '(UTC -05:00) Bogota, Lima' },
  { value: 'America/Caracas', label: '(UTC -04:00) Caracas' },
  { value: 'America/Halifax', label: '(UTC -04:00) Atlantic Time (Canada)' },
  // UTC -3 to -1
  { value: 'America/Sao_Paulo', label: '(UTC -03:00) Sao Paulo' },
  { value: 'America/Buenos_Aires', label: '(UTC -03:00) Buenos Aires' },
  { value: 'Atlantic/South_Georgia', label: '(UTC -02:00) Mid-Atlantic' },
  { value: 'Atlantic/Azores', label: '(UTC -01:00) Azores' },
  // UTC 0
  { value: 'UTC', label: '(UTC +00:00) UTC' },
  { value: 'Europe/London', label: '(UTC +00:00) London, Dublin' },
  { value: 'Africa/Casablanca', label: '(UTC +00:00) Casablanca' },
  // UTC +1 to +3
  { value: 'Europe/Paris', label: '(UTC +01:00) Paris, Berlin, Rome' },
  { value: 'Europe/Amsterdam', label: '(UTC +01:00) Amsterdam, Brussels' },
  { value: 'Africa/Lagos', label: '(UTC +01:00) Lagos, West Africa' },
  { value: 'Europe/Helsinki', label: '(UTC +02:00) Helsinki, Kyiv' },
  { value: 'Africa/Cairo', label: '(UTC +02:00) Cairo' },
  { value: 'Africa/Johannesburg', label: '(UTC +02:00) Johannesburg' },
  { value: 'Europe/Istanbul', label: '(UTC +03:00) Istanbul' },
  { value: 'Europe/Moscow', label: '(UTC +03:00) Moscow' },
  { value: 'Asia/Riyadh', label: '(UTC +03:00) Riyadh, Kuwait' },
  { value: 'Africa/Nairobi', label: '(UTC +03:00) Nairobi' },
  // UTC +3:30 to +5:30
  { value: 'Asia/Tehran', label: '(UTC +03:30) Tehran' },
  { value: 'Asia/Dubai', label: '(UTC +04:00) Dubai, Abu Dhabi' },
  { value: 'Asia/Kabul', label: '(UTC +04:30) Kabul' },
  { value: 'Asia/Karachi', label: '(UTC +05:00) Karachi, Islamabad' },
  { value: 'Asia/Tashkent', label: '(UTC +05:00) Tashkent' },
  { value: 'Asia/Kolkata', label: '(UTC +05:30) Mumbai, New Delhi' },
  { value: 'Asia/Kathmandu', label: '(UTC +05:45) Kathmandu' },
  // UTC +6 to +7
  { value: 'Asia/Dhaka', label: '(UTC +06:00) Dhaka' },
  { value: 'Asia/Almaty', label: '(UTC +06:00) Almaty' },
  { value: 'Asia/Yangon', label: '(UTC +06:30) Yangon' },
  { value: 'Asia/Bangkok', label: '(UTC +07:00) Bangkok, Hanoi' },
  { value: 'Asia/Ho_Chi_Minh', label: '(UTC +07:00) Ho Chi Minh City' },
  { value: 'Asia/Jakarta', label: '(UTC +07:00) Jakarta' },
  // UTC +8
  { value: 'Asia/Kuala_Lumpur', label: '(UTC +08:00) Kuala Lumpur' },
  { value: 'Asia/Singapore', label: '(UTC +08:00) Singapore' },
  { value: 'Asia/Shanghai', label: '(UTC +08:00) Beijing, Shanghai' },
  { value: 'Asia/Hong_Kong', label: '(UTC +08:00) Hong Kong' },
  { value: 'Asia/Taipei', label: '(UTC +08:00) Taipei' },
  { value: 'Asia/Manila', label: '(UTC +08:00) Manila' },
  { value: 'Australia/Perth', label: '(UTC +08:00) Perth' },
  // UTC +9 to +10
  { value: 'Asia/Tokyo', label: '(UTC +09:00) Tokyo' },
  { value: 'Asia/Seoul', label: '(UTC +09:00) Seoul' },
  { value: 'Australia/Adelaide', label: '(UTC +09:30) Adelaide' },
  { value: 'Australia/Darwin', label: '(UTC +09:30) Darwin' },
  { value: 'Australia/Brisbane', label: '(UTC +10:00) Brisbane' },
  { value: 'Australia/Sydney', label: '(UTC +10:00) Sydney, Melbourne' },
  { value: 'Pacific/Guam', label: '(UTC +10:00) Guam' },
  // UTC +11 to +14
  { value: 'Pacific/Noumea', label: '(UTC +11:00) New Caledonia' },
  { value: 'Pacific/Auckland', label: '(UTC +12:00) Auckland, Wellington' },
  { value: 'Pacific/Fiji', label: '(UTC +12:00) Fiji' },
  { value: 'Pacific/Tongatapu', label: '(UTC +13:00) Tonga' },
]

// Date format options
const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'European (24/12/2025)' },
  { value: 'MM/DD/YYYY', label: 'US (12/24/2025)' },
  { value: 'YYYY-MM-DD', label: 'ISO (2025-12-24)' },
  { value: 'DD-MM-YYYY', label: 'UK (24-12-2025)' },
  { value: 'DD.MM.YYYY', label: 'German (24.12.2025)' },
]

// Time format options
const TIME_FORMATS = [
  { value: '12-hour', label: '12-hour' },
  { value: '24-hour', label: '24-hour' },
]

// Decimal precision options
const DECIMAL_OPTIONS = [
  { value: '0.01', label: '0.01 (Default)' },
  { value: '0.001', label: '0.001' },
  { value: '1', label: '1 (No decimals)' },
  { value: '0.1', label: '0.1' },
]

export default function CompanySettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    country: 'MY',
    timezone: 'Asia/Kuala_Lumpur',
    date_format: 'DD/MM/YYYY',
    time_format: '12-hour',
    currency: 'MYR',
    decimal_precision: '0.01',
    logo_url: '',
    company_address1: '',
    company_address2: '',
    company_city: '',
    company_state: '',
    company_postal_code: '',
    company_country: '',
    company_phone: '',
    company_email: '',
    tax_id_label: '',
    company_tax_id: '',
  })

  useEffect(() => {
    loadTenant()
  }, [])

  // Auto-dismiss success messages
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function loadTenant() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

       
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (profile?.tenant_id) {
         
        const { data: tenantData } = await (supabase as any)
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single()

        if (tenantData) {
          setTenant(tenantData as Tenant)
          const settings = tenantData.settings as Record<string, unknown> || {}
          setFormData({
            name: tenantData.name || '',
            country: (settings.country as string) || 'MY',
            timezone: (settings.timezone as string) || 'Asia/Kuala_Lumpur',
            date_format: (settings.date_format as string) || 'DD/MM/YYYY',
            time_format: (settings.time_format as string) || '12-hour',
            currency: (settings.currency as string) || 'MYR',
            decimal_precision: (settings.decimal_precision as string) || '0.01',
            logo_url: tenantData.logo_url || '',
            company_address1: (settings.company_address1 as string) || '',
            company_address2: (settings.company_address2 as string) || '',
            company_city: (settings.company_city as string) || '',
            company_state: (settings.company_state as string) || '',
            company_postal_code: (settings.company_postal_code as string) || '',
            company_country: (settings.company_country as string) || '',
            company_phone: (settings.company_phone as string) || '',
            company_email: (settings.company_email as string) || '',
            tax_id_label: (settings.tax_id_label as string) || '',
            company_tax_id: (settings.company_tax_id as string) || '',
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !tenant) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 2MB' })
      return
    }

    setUploadingLogo(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${tenant.id}/logo.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(fileName)

      // Update tenant with logo URL
       
      const { error: updateError } = await (supabase as any)
        .from('tenants')
        .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', tenant.id)

      if (updateError) throw updateError

      setFormData({ ...formData, logo_url: publicUrl })
      setMessage({ type: 'success', text: 'Logo uploaded successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to upload logo' })
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleRemoveLogo() {
    if (!tenant) return

    setUploadingLogo(true)
    setMessage(null)

    try {
      const supabase = createClient()

       
      const { error } = await (supabase as any)
        .from('tenants')
        .update({ logo_url: null, updated_at: new Date().toISOString() })
        .eq('id', tenant.id)

      if (error) throw error

      setFormData({ ...formData, logo_url: '' })
      setMessage({ type: 'success', text: 'Logo removed' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to remove logo' })
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tenant) return

    setSaving(true)
    setMessage(null)

    try {
      // Use server action with validation
      const result = await updateTenantSettings({
        name: formData.name,
        settings: {
          country: formData.country,
          timezone: formData.timezone,
          date_format: formData.date_format,
          time_format: formData.time_format as '12-hour' | '24-hour',
          currency: formData.currency,
          decimal_precision: formData.decimal_precision,
          company_address1: formData.company_address1 || null,
          company_address2: formData.company_address2 || null,
          company_city: formData.company_city || null,
          company_state: formData.company_state || null,
          company_postal_code: formData.company_postal_code || null,
          company_country: formData.company_country || null,
          company_phone: formData.company_phone || null,
          company_email: formData.company_email || null,
          tax_id_label: formData.tax_id_label || null,
          company_tax_id: formData.company_tax_id || null,
        } as TenantSettings,
      })

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
        return
      }

      // Update local tenant state with new values
      setTenant({
        ...tenant,
        name: formData.name,
        settings: {
          ...((typeof tenant.settings === 'object' && tenant.settings) || {}),
          country: formData.country,
          timezone: formData.timezone,
          date_format: formData.date_format,
          time_format: formData.time_format,
          currency: formData.currency,
          decimal_precision: formData.decimal_precision,
          company_address1: formData.company_address1 || null,
          company_address2: formData.company_address2 || null,
          company_city: formData.company_city || null,
          company_state: formData.company_state || null,
          company_postal_code: formData.company_postal_code || null,
          company_country: formData.company_country || null,
          company_phone: formData.company_phone || null,
          company_email: formData.company_email || null,
          tax_id_label: formData.tax_id_label || null,
          company_tax_id: formData.company_tax_id || null,
        },
      })
      setMessage({ type: 'success', text: 'Company settings updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-neutral-200 rounded" />
          <div className="h-4 w-64 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-200 rounded-2xl" />
          <div className="h-48 bg-neutral-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Company</h1>
        <p className="mt-1 text-neutral-500">Configure your company details and regional preferences</p>
      </div>

      {/* Global Message */}
      {message && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Company Details */}
          <SettingsSection
            title="Company Details"
            description="Your company information visible to team members"
            icon={Building2}
          >
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  {formData.logo_url ? (
                    <div className="relative">
                      <div className="h-24 w-24 rounded-2xl border border-neutral-200 overflow-hidden bg-white shadow-sm">
                        <Image
                          src={formData.logo_url}
                          alt="Company logo"
                          width={96}
                          height={96}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        disabled={uploadingLogo}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50">
                      <Building2 className="h-10 w-10 text-neutral-400" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900">Company Logo</h4>
                  <p className="mt-1 text-sm text-neutral-500">
                    Upload your company logo. PNG or JPG, max 2MB.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </Button>
                </div>
              </div>

              {/* Company Name & Subscription */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Company Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Subscription Plan
                  </label>
                  <div className="flex h-10 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3">
                    <span className="capitalize text-neutral-600">
                      {tenant?.subscription_tier || 'free'}
                    </span>
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Company Address */}
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Company Address</h4>
                <p className="mt-1 text-xs text-neutral-500">Printed on PDFs for invoices and purchase orders.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Address Line 1
                  </label>
                  <Input
                    value={formData.company_address1}
                    onChange={(e) => setFormData({ ...formData, company_address1: e.target.value })}
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Address Line 2
                  </label>
                  <Input
                    value={formData.company_address2}
                    onChange={(e) => setFormData({ ...formData, company_address2: e.target.value })}
                    placeholder="Suite, unit, building"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    City
                  </label>
                  <Input
                    value={formData.company_city}
                    onChange={(e) => setFormData({ ...formData, company_city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    State/Province
                  </label>
                  <Input
                    value={formData.company_state}
                    onChange={(e) => setFormData({ ...formData, company_state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Postal Code
                  </label>
                  <Input
                    value={formData.company_postal_code}
                    onChange={(e) => setFormData({ ...formData, company_postal_code: e.target.value })}
                    placeholder="ZIP"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Country
                  </label>
                  <Input
                    value={formData.company_country}
                    onChange={(e) => setFormData({ ...formData, company_country: e.target.value })}
                    placeholder="Country"
                  />
                </div>
              </div>

              {/* Company Contact */}
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Company Contact</h4>
                <p className="mt-1 text-xs text-neutral-500">Shown in PDF headers for billing documents.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Phone
                  </label>
                  <Input
                    value={formData.company_phone}
                    onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Email
                  </label>
                  <Input
                    value={formData.company_email}
                    onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                    placeholder="billing@company.com"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Tax ID Label
                  </label>
                  <Input
                    value={formData.tax_id_label}
                    onChange={(e) => setFormData({ ...formData, tax_id_label: e.target.value })}
                    placeholder="Tax ID / VAT / EIN"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Tax ID
                  </label>
                  <Input
                    value={formData.company_tax_id}
                    onChange={(e) => setFormData({ ...formData, company_tax_id: e.target.value })}
                    placeholder="12-3456789"
                  />
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Regional Settings */}
          <SettingsSection
            title="Regional Settings"
            description="Configure location, timezone, and formatting preferences"
            icon={Globe}
          >
            <div className="space-y-4">
              {/* Row 1: Country & Timezone */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Time zone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Date Format & Time Format */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Date Format
                  </label>
                  <select
                    value={formData.date_format}
                    onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {DATE_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Time Format
                  </label>
                  <select
                    value={formData.time_format}
                    onChange={(e) => setFormData({ ...formData, time_format: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {TIME_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Currency & Decimal Precision */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Decimals in Price
                  </label>
                  <select
                    value={formData.decimal_precision}
                    onChange={(e) => setFormData({ ...formData, decimal_precision: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm ring-offset-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {DECIMAL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-neutral-100 pt-4">
              <Button type="submit" loading={saving}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </SettingsSection>
        </div>
      </form>
    </div>
  )
}
