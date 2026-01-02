'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Monitor, Moon, Sun, Grid, List, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPreferences()
  }, [])

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
    setError(null)
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

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Preferences</h1>
        <p className="mt-1 text-neutral-500">
          Customize your experience
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mx-8 mt-4 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
          <Check className="h-5 w-5" />
          Preferences saved successfully!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-8 mt-4 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="p-8 max-w-2xl">
        {/* Appearance */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Appearance</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Theme */}
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">Theme</label>
              <div className="flex gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setPreferences({ ...preferences, theme: value as UserPreferences['theme'] })}
                    className={`flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                      preferences.theme === value
                        ? 'border-primary bg-primary/10'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${preferences.theme === value ? 'text-primary' : 'text-neutral-500'}`} />
                    <span className={`text-sm font-medium ${preferences.theme === value ? 'text-primary' : 'text-neutral-700'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Default View */}
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">Default View</label>
              <div className="flex gap-3">
                {[
                  { value: 'grid', icon: Grid, label: 'Grid' },
                  { value: 'list', icon: List, label: 'List' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setPreferences({ ...preferences, defaultView: value as UserPreferences['defaultView'] })}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                      preferences.defaultView === value
                        ? 'border-primary bg-primary/10'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${preferences.defaultView === value ? 'text-primary' : 'text-neutral-500'}`} />
                    <span className={`text-sm font-medium ${preferences.defaultView === value ? 'text-primary' : 'text-neutral-700'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">Compact Mode</p>
                <p className="text-sm text-neutral-500">Show more items with less spacing</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={(e) => setPreferences({ ...preferences, compactMode: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Regional */}
        <div className="mb-8 rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-neutral-900">Regional Settings</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Date Format */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Date Format</label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                <option value="DD MMM YYYY">DD MMM YYYY (31 Dec 2024)</option>
              </select>
            </div>

            {/* Items per Page */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Items per Page</label>
              <select
                value={preferences.itemsPerPage}
                onChange={(e) => setPreferences({ ...preferences, itemsPerPage: parseInt(e.target.value) })}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="10">10 items</option>
                <option value="20">20 items</option>
                <option value="50">50 items</option>
                <option value="100">100 items</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={savePreferences} disabled={saving} className="w-full">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
