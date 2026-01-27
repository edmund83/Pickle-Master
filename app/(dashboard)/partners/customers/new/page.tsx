'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CustomerForm, emptyCustomerFormData, type CustomerFormData } from '@/components/partners/customers'
import { createCustomer } from '@/app/actions/customers'
import { createClient } from '@/lib/supabase/client'

interface PaymentTermOption {
  id: string
  name: string
}

interface TaxRateOption {
  id: string
  name: string
  rate: number
}

export default function NewCustomerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CustomerFormData>(emptyCustomerFormData)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermOption[]>([])
  const [taxRates, setTaxRates] = useState<TaxRateOption[]>([])
  const [loading, setLoading] = useState(true)

  // Load payment terms and tax rates
  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('tenant_id')
          .eq('id', user.id)
          .single()

        if (!profile?.tenant_id) {
          router.push('/dashboard')
          return
        }

        // Fetch payment terms and tax rates in parallel
        const [termsResult, taxRatesResult] = await Promise.all([
          (supabase as any)
            .from('payment_terms')
            .select('id, name')
            .eq('tenant_id', profile.tenant_id)
            .order('sort_order', { ascending: true }),
          (supabase as any)
            .from('tax_rates')
            .select('id, name, rate')
            .eq('tenant_id', profile.tenant_id)
            .eq('is_active', true)
            .order('name', { ascending: true }),
        ])

        setPaymentTerms((termsResult.data || []) as PaymentTermOption[])
        setTaxRates((taxRatesResult.data || []) as TaxRateOption[])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  async function handleSubmit() {
    if (!formData.name.trim()) {
      setError('Customer name is required')
      return
    }

    // Basic email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setError(null)
    setSaving(true)

    try {
      const result = await createCustomer({
        name: formData.name.trim(),
        customer_code: formData.customer_code || null,
        contact_name: formData.contact_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        billing_address_line1: formData.billing_address_line1 || null,
        billing_address_line2: formData.billing_address_line2 || null,
        billing_city: formData.billing_city || null,
        billing_state: formData.billing_state || null,
        billing_postal_code: formData.billing_postal_code || null,
        billing_country: formData.billing_country || null,
        shipping_address_line1: formData.shipping_address_line1 || null,
        shipping_address_line2: formData.shipping_address_line2 || null,
        shipping_city: formData.shipping_city || null,
        shipping_state: formData.shipping_state || null,
        shipping_postal_code: formData.shipping_postal_code || null,
        shipping_country: formData.shipping_country || null,
        shipping_same_as_billing: formData.shipping_same_as_billing,
        payment_term_id: formData.payment_term_id || null,
        credit_limit: formData.credit_limit || 0,
        notes: formData.notes || null,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      router.push('/partners/customers')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer')
      setSaving(false)
    }
  }

  function handleCancel() {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <h1 className="text-lg font-semibold text-neutral-900">Add Customer</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving || !formData.name.trim()}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <CustomerForm
          formData={formData}
          setFormData={setFormData}
          error={error}
          paymentTerms={paymentTerms}
          taxRates={taxRates}
          autoFocusName={true}
        />
      </div>
    </div>
  )
}
