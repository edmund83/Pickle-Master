'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Monitor, Moon, Sun, Grid, List, Check, Palette, Globe, AlertCircle, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsSection, SettingsToggleCompact, SettingsSelect } from '@/components/settings'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultView: 'grid' | 'list'
  itemsPerPage: number
  dateFormat: string
  compactMode: boolean
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  defaultView: 'grid',
  itemsPerPage: 20,
  dateFormat: 'DD/MM/YYYY',
  compactMode: false,
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadPreferences()
  }, [])

  // Auto-dismiss success messages
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  async function loadPreferences() {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single()

      if (profile?.preferences) {
        const savedPrefs = profile.preferences as Partial<UserPreferences>
        setPreferences({
          theme: savedPrefs.theme ?? defaultPreferences.theme,
          defaultView: savedPrefs.defaultView ?? defaultPreferences.defaultView,
          itemsPerPage: savedPrefs.itemsPerPage ?? defaultPreferences.itemsPerPage,
          dateFormat: savedPrefs.dateFormat ?? defaultPreferences.dateFormat,
          compactMode: savedPrefs.compactMode ?? defaultPreferences.compactMode,
        })
      }
    } catch (err) {
      console.error('Error loading preferences:', err)
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences() {
    setSaving(true)
    setMessage(null)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('profiles')
        .update({
          preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setMessage({ type: 'success', text: 'Preferences saved successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save preferences' })
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
        <h1 className="text-2xl font-semibold text-neutral-900">Preferences</h1>
        <p className="mt-1 text-neutral-500">Customize your experience and display settings</p>
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
        {/* Appearance Section */}
        <SettingsSection
          title="Appearance"
          description="Choose how StockZip looks to you"
          icon={Palette}
        >
          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light', desc: 'Clean and bright' },
                  { value: 'dark', icon: Moon, label: 'Dark', desc: 'Easy on the eyes' },
                  { value: 'system', icon: Monitor, label: 'System', desc: 'Match device' },
                ].map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setPreferences({ ...preferences, theme: value as UserPreferences['theme'] })}
                    className={`group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      preferences.theme === value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    {preferences.theme === value && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        preferences.theme === value
                          ? 'bg-primary/10 text-primary'
                          : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <span
                        className={`block text-sm font-medium ${
                          preferences.theme === value ? 'text-primary' : 'text-neutral-900'
                        }`}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-neutral-500">{desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Default View */}
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">Default View</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'grid', icon: Grid, label: 'Grid View', desc: 'Cards with images' },
                  { value: 'list', icon: List, label: 'List View', desc: 'Compact rows' },
                ].map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setPreferences({ ...preferences, defaultView: value as UserPreferences['defaultView'] })}
                    className={`flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                      preferences.defaultView === value
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        preferences.defaultView === value
                          ? 'bg-primary/10 text-primary'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span
                        className={`block text-sm font-medium ${
                          preferences.defaultView === value ? 'text-primary' : 'text-neutral-900'
                        }`}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-neutral-500">{desc}</span>
                    </div>
                    {preferences.defaultView === value && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Mode Toggle */}
            <div className="rounded-lg border border-neutral-200 p-4">
              <SettingsToggleCompact
                label="Compact Mode"
                checked={preferences.compactMode}
                onChange={(checked) => setPreferences({ ...preferences, compactMode: checked })}
              />
              <p className="mt-1 text-xs text-neutral-500 ml-0">
                Show more items with reduced spacing and smaller text
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Regional Settings Section */}
        <SettingsSection
          title="Regional Settings"
          description="Customize date formats and display options"
          icon={Globe}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Date Format */}
            <SettingsSelect
              label="Date Format"
              value={preferences.dateFormat}
              onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
              options={[
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
                { value: 'DD MMM YYYY', label: 'DD MMM YYYY (31 Dec 2024)' },
              ]}
              description="How dates are displayed throughout the app"
            />

            {/* Items per Page */}
            <SettingsSelect
              label="Items per Page"
              value={String(preferences.itemsPerPage)}
              onChange={(e) => setPreferences({ ...preferences, itemsPerPage: parseInt(e.target.value) })}
              options={[
                { value: '10', label: '10 items' },
                { value: '20', label: '20 items' },
                { value: '50', label: '50 items' },
                { value: '100', label: '100 items' },
              ]}
              description="Number of items shown in lists"
            />
          </div>
        </SettingsSection>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={savePreferences} loading={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}
