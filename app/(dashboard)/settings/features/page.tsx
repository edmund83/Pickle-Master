'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Save,
  Zap,
  MapPin,
  Package,
  Calendar,
  Truck,
  Check,
} from 'lucide-react'
import type { Tenant } from '@/types/database.types'

interface FeaturesEnabled {
  multi_location: boolean
  shipping_dimensions: boolean
  lot_tracking: boolean
}

const defaultFeatures: FeaturesEnabled = {
  multi_location: false,
  shipping_dimensions: false,
  lot_tracking: false,
}

export default function FeaturesSettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [features, setFeatures] = useState<FeaturesEnabled>(defaultFeatures)

  useEffect(() => {
    loadTenant()
  }, [])

  async function loadTenant() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (profile?.tenant_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: tenantData } = await (supabase as any)
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single()

        if (tenantData) {
          setTenant(tenantData as Tenant)
          const settings = tenantData.settings as Record<string, unknown> | null
          const enabledFeatures = settings?.features_enabled as FeaturesEnabled | undefined
          setFeatures({
            multi_location: enabledFeatures?.multi_location ?? false,
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // Update local tenant state with data from server
      setTenant(data as Tenant)

      setMessage({ type: 'success', text: 'Feature settings updated' })
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Features</h1>
        <p className="text-neutral-500">Enable advanced features for your business needs</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {message && (
          <div
            className={`rounded-lg p-4 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Feature Toggles
            </CardTitle>
            <CardDescription>
              Enable only the features your business needs. Disabled features won&apos;t appear in the UI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Multi-Location Inventory */}
            <FeatureToggle
              icon={MapPin}
              title="Multi-Location Inventory"
              description="Track inventory across multiple warehouses, vans, stores, or job sites. Transfer stock between locations."
              enabled={features.multi_location}
              onToggle={() => toggleFeature('multi_location')}
            />

            {/* Shipping Dimensions */}
            <FeatureToggle
              icon={Truck}
              title="Shipping Dimensions"
              description="Add weight and dimensions (length, width, height) to items for shipping calculations."
              enabled={features.shipping_dimensions}
              onToggle={() => toggleFeature('shipping_dimensions')}
            />

            {/* Lot/Expiry Tracking */}
            <FeatureToggle
              icon={Calendar}
              title="Lot & Expiry Tracking"
              description="Track items by lot number, batch code, and expiry date. Get FEFO (First Expired First Out) picking suggestions."
              enabled={features.lot_tracking}
              onToggle={() => toggleFeature('lot_tracking')}
            />
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-500">
              <Package className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-500">
            <p>• Purchase Orders & Receiving</p>
            <p>• Barcode Scanning with Camera</p>
            <p>• Low Stock Alerts & Auto-Reorder</p>
            <p>• AI-Powered Inventory Insights</p>
          </CardContent>
        </Card>

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

interface FeatureToggleProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
}

function FeatureToggle({ icon: Icon, title, description, enabled, onToggle }: FeatureToggleProps) {
  return (
    <div
      className={`flex items-start gap-4 rounded-lg border p-4 transition-colors cursor-pointer ${
        enabled
          ? 'border-pickle-200 bg-pickle-50/50'
          : 'border-neutral-200 bg-white hover:bg-neutral-50'
      }`}
      onClick={onToggle}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
        enabled ? 'bg-pickle-100 text-pickle-600' : 'bg-neutral-100 text-neutral-500'
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium ${enabled ? 'text-pickle-900' : 'text-neutral-900'}`}>
            {title}
          </h3>
          {enabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-pickle-100 px-2 py-0.5 text-xs font-medium text-pickle-700">
              <Check className="h-3 w-3" />
              Enabled
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      <div
        className="relative inline-flex cursor-pointer items-center shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="peer sr-only"
        />
        <div
          onClick={onToggle}
          className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-neutral-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-pickle-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pickle-500 peer-focus:ring-offset-2"
        ></div>
      </div>
    </div>
  )
}
