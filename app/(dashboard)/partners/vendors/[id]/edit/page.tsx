'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VendorForm, emptyVendorFormData, type VendorFormData } from '@/components/settings/vendors'
import { createClient } from '@/lib/supabase/client'

interface PaymentTermOption {
  id: string
  name: string
}

export default function EditVendorPage() {
  const router = useRouter()
  const params = useParams()
  const vendorId = params.id as string

  const [formData, setFormData] = useState<VendorFormData>(emptyVendorFormData)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermOption[]>([])
  const [loading, setLoading] = useState(true)

  // Load vendor and payment terms
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

        // Fetch vendor and payment terms in parallel
        const [vendorResult, termsResult] = await Promise.all([
          (supabase as any)
            .from('vendors')
            .select('*')
            .eq('id', vendorId)
            .eq('tenant_id', profile.tenant_id)
            .single(),
          (supabase as any)
            .from('payment_terms')
            .select('id, name')
            .eq('tenant_id', profile.tenant_id)
            .order('sort_order', { ascending: true }),
        ])

        if (!vendorResult.data) {
          router.push('/partners/vendors')
          return
        }

        const vendor = vendorResult.data
        setFormData({
          name: vendor.name,
          contact_name: vendor.contact_name || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          address_line1: vendor.address_line1 || '',
          city: vendor.city || '',
          country: vendor.country || '',
          payment_terms: vendor.payment_terms || '',
          notes: vendor.notes || '',
          tax_id: vendor.tax_id || '',
          tax_id_label: vendor.tax_id_label || '',
        })

        setPaymentTerms((termsResult.data || []) as PaymentTermOption[])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, vendorId])

  async function handleSubmit() {
    if (!formData.name.trim()) {
      setError('Vendor name is required')
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
      const supabase = createClient()

      const { error: updateError } = await (supabase as any)
        .from('vendors')
        .update({
          name: formData.name.trim(),
          contact_name: formData.contact_name || null,
          email: formData.email || null,
          phone: formData.phone || null,
          address_line1: formData.address_line1 || null,
          city: formData.city || null,
          country: formData.country || null,
          payment_terms: formData.payment_terms || null,
          notes: formData.notes || null,
          tax_id: formData.tax_id || null,
          tax_id_label: formData.tax_id_label || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendorId)

      if (updateError) throw updateError

      router.push('/partners/vendors')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor')
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
          <h1 className="text-lg font-semibold text-neutral-900">Edit Vendor</h1>
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
        <VendorForm
          formData={formData}
          setFormData={setFormData}
          error={error}
          paymentTerms={paymentTerms}
          autoFocusName={false}
        />
      </div>
    </div>
  )
}
