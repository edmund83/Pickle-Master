'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { SettingsSection, SettingsToggle } from '@/components/settings'
import {
  Save,
  Zap,
  Package,
  Calendar,
  Truck,
  Check,
  AlertCircle,
  Sparkles,
  BarChart3,
  ScanLine,
  ShoppingCart,
  LockKeyhole,
} from 'lucide-react'
import Link from 'next/link'
import type { Tenant } from '@/types/database.types'
import { hasFeature, getFeatureInfo } from '@/lib/features'
import type { PlanId } from '@/lib/plans/config'

interface FeaturesEnabled {
  shipping_dimensions: boolean
  lot_tracking: boolean
}

const defaultFeatures: FeaturesEnabled = {
  shipping_dimensions: false,
  lot_tracking: false,
}

export default function FeaturesSettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [planId, setPlanId] = useState<PlanId>('starter')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [features, setFeatures] = useState<FeaturesEnabled>(defaultFeatures)

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
          // Get subscription tier for feature gating
          const tier = (tenantData.subscription_tier as PlanId) || 'starter'
          setPlanId(tier)
          const settings = tenantData.settings as Record<string, unknown> | null
          const enabledFeatures = settings?.features_enabled as FeaturesEnabled | undefined
          setFeatures({
            shipping_dimensions: enabledFeatures?.shipping_dimensions ?? false,
            lot_tracking: enabledFeatures?.lot_tracking ?? false,
          })
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tenant) return

    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const existingSettings = typeof tenant.settings === 'object' && tenant.settings !== null
        ? tenant.settings as Record<string, unknown>
        : {}

       
      const { data, error } = await (supabase as any)
        .from('tenants')
        .update({
          settings: {
            ...existingSettings,
            features_enabled: features,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', tenant.id)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to update settings. You may not have permission.')

      setTenant(data as Tenant)
      setMessage({ type: 'success', text: 'Feature settings updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update' })
    } finally {
      setSaving(false)
    }
  }

  function toggleFeature(feature: keyof FeaturesEnabled) {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature],
    }))
  }

  // Count enabled features
  const enabledCount = Object.values(features).filter(Boolean).length

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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-neutral-900">Features</h1>
          {enabledCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Check className="h-3 w-3" />
              {enabledCount} enabled
            </span>
          )}
        </div>
        <p className="mt-1 text-neutral-500">
          Enable advanced capabilities for your inventory management
        </p>
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

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        {/* Available Features */}
        <SettingsSection
          title="Available Features"
          description="Toggle features on or off based on your business needs. Disabled features won't appear in the interface."
          icon={Zap}
        >
          <div className="space-y-3">
            <SettingsToggle
              icon={Truck}
              label="Shipping Dimensions"
              description="Add weight and dimensions (length, width, height) to items for shipping calculations."
              checked={features.shipping_dimensions}
              onChange={() => toggleFeature('shipping_dimensions')}
            />

            {hasFeature(planId, 'lot_tracking') ? (
              <SettingsToggle
                icon={Calendar}
                label="Lot & Expiry Tracking"
                description="Track items by lot number, batch code, and expiry date. Get FEFO (First Expired First Out) suggestions."
                checked={features.lot_tracking}
                onChange={() => toggleFeature('lot_tracking')}
              />
            ) : (
              <LockedFeatureToggle
                icon={Calendar}
                label="Lot & Expiry Tracking"
                description="Track items by lot number, batch code, and expiry date. Get FEFO (First Expired First Out) suggestions."
                requiredPlan="Scale"
              />
            )}
          </div>
        </SettingsSection>

        {/* Coming Soon */}
        <SettingsSection
          title="Coming Soon"
          description="Features we're working on for future releases"
          icon={Sparkles}
          className="opacity-75"
        >
          <div className="space-y-3">
            <ComingSoonFeature
              icon={ShoppingCart}
              label="Purchase Orders & Receiving"
              description="Create purchase orders, track deliveries, and automatically update inventory on receipt."
            />

            <ComingSoonFeature
              icon={ScanLine}
              label="Barcode Scanning with Camera"
              description="Use your phone or tablet camera to scan barcodes and quickly find or add items."
            />

            <ComingSoonFeature
              icon={BarChart3}
              label="Low Stock Alerts & Auto-Reorder"
              description="Get notified when stock runs low and automatically generate purchase orders."
            />

            <ComingSoonFeature
              icon={Package}
              label="AI-Powered Inventory Insights"
              description="Get smart recommendations for reorder timing, demand forecasting, and optimization."
            />
          </div>
        </SettingsSection>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

interface ComingSoonFeatureProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

function ComingSoonFeature({ icon: Icon, label, description }: ComingSoonFeatureProps) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-neutral-200 border-dashed bg-neutral-50/50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-neutral-500">{label}</p>
          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
            Coming Soon
          </span>
        </div>
        <p className="mt-0.5 text-sm text-neutral-400">{description}</p>
      </div>
    </div>
  )
}

interface LockedFeatureToggleProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  requiredPlan: string
}

function LockedFeatureToggle({ icon: Icon, label, description, requiredPlan }: LockedFeatureToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50/50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-neutral-500">{label}</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
              <LockKeyhole className="h-3 w-3" />
              {requiredPlan}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-neutral-400">{description}</p>
          <Link
            href="/settings/billing"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Upgrade to {requiredPlan}
          </Link>
        </div>
      </div>
      <div
        className="relative inline-flex h-6 w-11 shrink-0 cursor-not-allowed items-center rounded-full bg-neutral-200 opacity-50"
        title={`Requires ${requiredPlan} plan`}
      >
        <span className="pointer-events-none inline-block h-5 w-5 translate-x-0.5 transform rounded-full bg-white shadow-sm" />
      </div>
    </div>
  )
}
