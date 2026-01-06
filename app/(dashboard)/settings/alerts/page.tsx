'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, AlertTriangle, Package, Mail, Check, Plus, Trash2, AlertCircle, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SettingsSection, SettingsToggle } from '@/components/settings'
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadAlertsAndPreferences()
  }, [])

  // Auto-dismiss success messages
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

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
    setMessage(null)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tenant } = await (supabase as any)
        .from('tenants')
        .select('settings')
        .eq('id', tenantId)
        .single()

      const currentSettings = tenant?.settings || {}
      const updatedSettings = {
        ...currentSettings,
        alert_preferences: preferences,
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('tenants')
        .update({ settings: updatedSettings })
        .eq('id', tenantId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Alert preferences saved successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save preferences' })
    } finally {
      setSaving(false)
    }
  }

  async function createAlert() {
    if (!newAlert.name.trim() || !tenantId) return

    setSaving(true)
    setMessage(null)
    const supabase = createClient()

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase as any)
        .from('alerts')
        .insert({
          tenant_id: tenantId,
          target_id: newAlert.name.trim(),
          target_type: 'custom',
          alert_type: 'low_stock',
          threshold: newAlert.threshold,
          is_active: true,
        })

      if (insertError) throw insertError

      setNewAlert({ name: '', threshold: 10 })
      setShowNewAlert(false)
      setMessage({ type: 'success', text: 'Alert created successfully' })
      loadAlertsAndPreferences()
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create alert' })
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
    setMessage({ type: 'success', text: 'Alert deleted' })
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
        <h1 className="text-2xl font-semibold text-neutral-900">Alerts</h1>
        <p className="mt-1 text-neutral-500">Configure notifications and low stock alerts</p>
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

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Notification Preferences */}
        <SettingsSection
          title="Notification Preferences"
          description="Configure how and when you receive inventory alerts"
          icon={Bell}
        >
          <div className="space-y-3">
            <SettingsToggle
              icon={Mail}
              label="Email Notifications"
              description="Receive alert notifications via email"
              checked={preferences.emailNotifications}
              onChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
            />

            <SettingsToggle
              icon={AlertTriangle}
              label="Out of Stock Alerts"
              description="Get notified when items reach zero quantity"
              checked={preferences.outOfStockAlerts}
              onChange={(checked) => setPreferences({ ...preferences, outOfStockAlerts: checked })}
            />

            {/* Low Stock Threshold */}
            <div className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <Package className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">Default Low Stock Threshold</p>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    Items below this quantity trigger alerts
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={preferences.lowStockThreshold}
                  onChange={(e) => setPreferences({ ...preferences, lowStockThreshold: parseInt(e.target.value) || 0 })}
                  className="w-20 text-center"
                  min={1}
                />
                <span className="text-sm text-neutral-500">units</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-neutral-100 pt-4">
            <Button onClick={savePreferences} loading={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </SettingsSection>

        {/* Custom Alerts */}
        <SettingsSection
          title="Custom Alerts"
          description="Create specific alerts for individual items or categories"
          icon={AlertTriangle}
          headerAction={
            !showNewAlert && (
              <Button size="sm" onClick={() => setShowNewAlert(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Alert
              </Button>
            )
          }
        >
          {/* New Alert Form */}
          {showNewAlert && (
            <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-3 text-sm font-medium text-neutral-900">Create New Alert</h4>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Alert Name
                  </label>
                  <Input
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    placeholder="e.g., Critical stock for Product A"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Threshold
                  </label>
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
          {alerts.length > 0 ? (
            <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-4 ${
                    alert.is_active ? '' : 'bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        alert.is_active
                          ? 'bg-primary/10 text-primary'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      <Bell className="h-5 w-5" />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          alert.is_active ? 'text-neutral-900' : 'text-neutral-500'
                        }`}
                      >
                        {alert.target_type === 'custom'
                          ? alert.target_id
                          : `${alert.alert_type?.replace('_', ' ') || 'Alert'} - ${alert.target_type}`}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Threshold: {alert.threshold ?? 'N/A'} units
                        {alert.target_type !== 'custom' &&
                          ` • Target: ${alert.target_id?.slice(0, 8) || 'Global'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={alert.is_active ?? false}
                      onClick={() => toggleAlert(alert.id, alert.is_active ?? false)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                        alert.is_active ? 'bg-primary' : 'bg-neutral-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
                          alert.is_active ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <Button variant="ghost" size="icon" onClick={() => deleteAlert(alert.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-neutral-300 py-12 text-center">
              <Bell className="mx-auto h-12 w-12 text-neutral-300" />
              <p className="mt-4 font-medium text-neutral-600">No custom alerts</p>
              <p className="mt-1 text-sm text-neutral-400">
                Create alerts to get notified about specific items
              </p>
              {!showNewAlert && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowNewAlert(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first alert
                </Button>
              )}
            </div>
          )}
        </SettingsSection>
      </div>
    </div>
  )
}
