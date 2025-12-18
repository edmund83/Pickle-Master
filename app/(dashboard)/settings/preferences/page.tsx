'use client'

import { useState } from 'react'
import { Settings, Monitor, Moon, Sun, Grid, List, Globe, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultView: 'grid' | 'list'
  itemsPerPage: number
  currency: string
  dateFormat: string
  compactMode: boolean
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    defaultView: 'grid',
    itemsPerPage: 20,
    currency: 'MYR',
    dateFormat: 'DD/MM/YYYY',
    compactMode: false,
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function savePreferences() {
    setSaving(true)
    // In a real app, save to user settings in database
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
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
                        ? 'border-pickle-500 bg-pickle-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${preferences.theme === value ? 'text-pickle-600' : 'text-neutral-500'}`} />
                    <span className={`text-sm font-medium ${preferences.theme === value ? 'text-pickle-700' : 'text-neutral-700'}`}>
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
                        ? 'border-pickle-500 bg-pickle-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${preferences.defaultView === value ? 'text-pickle-600' : 'text-neutral-500'}`} />
                    <span className={`text-sm font-medium ${preferences.defaultView === value ? 'text-pickle-700' : 'text-neutral-700'}`}>
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
                <div className="peer h-6 w-11 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-pickle-500 peer-checked:after:translate-x-full"></div>
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
            {/* Currency */}
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm"
              >
                <option value="MYR">Malaysian Ringgit (RM)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
                <option value="SGD">Singapore Dollar (S$)</option>
                <option value="JPY">Japanese Yen (¥)</option>
              </select>
            </div>

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
