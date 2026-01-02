'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, AlertTriangle, Package, Mail, Check, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Alert } from '@/types/database.types'

interface AlertPreferences {
  emailNotifications: boolean
  lowStockThreshold: number
  outOfStockAlerts: boolean
}

export default function AlertsSettingsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<AlertPreferences>({
    emailNotifications: true,
    lowStockThreshold: 10,
    outOfStockAlerts: true,
  })
  const [showNewAlert, setShowNewAlert] = useState(false)
  const [newAlert, setNewAlert] = useState({
    name: '',
    threshold: 10,
  })
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAlertsAndPreferences()
  }, [])

  async function loadAlertsAndPreferences() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (!profile?.tenant_id) return
      setTenantId(profile.tenant_id)

      // Load tenant settings for alert preferences
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tenant } = await (supabase as any)
        .from('tenants')
        .select('settings')
        .eq('id', profile.tenant_id)
        .single()

      if (tenant?.settings?.alert_preferences) {
        const savedPrefs = tenant.settings.alert_preferences as AlertPreferences
        setPreferences({
          emailNotifications: savedPrefs.emailNotifications ?? true,
          lowStockThreshold: savedPrefs.lowStockThreshold ?? 10,
          outOfStockAlerts: savedPrefs.outOfStockAlerts ?? true,
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('alerts')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })

      setAlerts((data || []) as Alert[])
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences() {
    if (!tenantId) return

    setSaving(true)
    const supabase = createClient()

    try {
      // First get current settings to merge with
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tenant } = await (supabase as any)
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single()

      const currentSettings = tenant?.settings || {}

      // Merge alert_preferences into settings
      const updatedSettings = {
        ...currentSettings,
        alert_preferences: preferences,
      }

      // Update tenant settings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('tenants')
        .update({ settings: updatedSettings })
        .eq('id', tenantId)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving preferences:', err)
    } finally {
      setSaving(false)
    }
  }

  async function createAlert() {
    if (!newAlert.name.trim() || !tenantId) return

    setSaving(true)
    setError(null)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('alerts')
        .insert({
          tenant_id: tenantId,
          target_id: newAlert.name.trim(), // Store alert name in target_id
          target_type: 'custom',
          alert_type: 'low_stock',
          threshold: newAlert.threshold,
          is_active: true,
        })

      if (insertError) throw insertError

      setNewAlert({ name: '', threshold: 10 })
      setShowNewAlert(false)
      loadAlertsAndPreferences()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAlert(id: string, isActive: boolean) {
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('alerts')
      .update({ is_active: !isActive })
      .eq('id', id)

    setAlerts(alerts.map(a => a.id === id ? { ...a, is_active: !isActive } : a))
  }

  async function deleteAlert(id: string) {
    if (!confirm('Are you sure you want to delete this alert?')) return

    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('alerts')
      .delete()
      .eq('id', id)

    setAlerts(alerts.filter(a => a.id !== id))
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Alert Settings</h1>
        <p className="mt-1 text-neutral-500">
          Configure notifications and low stock alerts
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-8 mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <Check className="h-5 w-5" />
          Settings saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-8 mt-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="p-8">
        {/* Notification Preferences */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Notification Preferences</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Email Notifications</p>
                  <p className="text-sm text-neutral-500">Receive alerts via email</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Out of Stock Alerts</p>
                  <p className="text-sm text-neutral-500">Get notified when items reach zero quantity</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.outOfStockAlerts}
                  onChange={(e) => setPreferences({ ...preferences, outOfStockAlerts: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Default Low Stock Threshold</p>
                  <p className="text-sm text-neutral-500">Items below this quantity trigger alerts</p>
                </div>
              </div>
              <Input
                type="number"
                value={preferences.lowStockThreshold}
                onChange={(e) => setPreferences({ ...preferences, lowStockThreshold: parseInt(e.target.value) || 0 })}
                className="w-24 text-center"
                min={1}
              />
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <Button onClick={savePreferences} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Save Preferences
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Alerts */}
        <div className="rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Custom Alerts</h2>
            <Button size="sm" onClick={() => setShowNewAlert(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Button>
          </div>

          {/* New Alert Form */}
          {showNewAlert && (
            <div className="border-b border-neutral-200 bg-neutral-50 p-6">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Alert Name</label>
                  <Input
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    placeholder="e.g., Critical stock for Product A"
                  />
                </div>
                <div className="w-32">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Threshold</label>
                  <Input
                    type="number"
                    value={newAlert.threshold}
                    onChange={(e) => setNewAlert({ ...newAlert, threshold: parseInt(e.target.value) || 0 })}
                    min={1}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowNewAlert(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createAlert} disabled={saving || !newAlert.name.trim()}>
                    Create
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Alerts List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
          ) : alerts.length > 0 ? (
            <ul className="divide-y divide-neutral-200">
              {alerts.map((alert) => (
                <li key={alert.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      alert.is_active ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`font-medium ${alert.is_active ? 'text-neutral-900' : 'text-neutral-500'}`}>
                        {alert.target_type === 'custom' ? alert.target_id : `${alert.alert_type?.replace('_', ' ') || 'Alert'} - ${alert.target_type}`}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Threshold: {alert.threshold ?? 'N/A'} units
                        {alert.target_type !== 'custom' && ` • Target: ${alert.target_id?.slice(0, 8) || 'Global'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={alert.is_active ?? false}
                        onChange={() => toggleAlert(alert.id, alert.is_active ?? false)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                    </label>
                    <Button variant="ghost" size="sm" onClick={() => deleteAlert(alert.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 text-neutral-500">No custom alerts configured</p>
              <p className="text-sm text-neutral-400">Create alerts to get notified about specific items</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
