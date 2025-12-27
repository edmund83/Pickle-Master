'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, User, Lock } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/types/database.types'

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setSavingPassword(true)
    setPasswordMessage(null)

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in both password fields' })
      setSavingPassword(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      setSavingPassword(false)
      return
    }

    try {
      const supabase = createClient()

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setPasswordMessage({ type: 'success', text: 'Password updated successfully' })
      setPasswordData({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update password' })
    } finally {
      setSavingPassword(false)
    }
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
        <h1 className="text-2xl font-semibold text-neutral-900">Profile Settings</h1>
        <p className="text-neutral-500">Manage your personal information</p>
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
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Full Name
              </label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="bg-neutral-50"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Contact support to change your email
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+60 12-345 6789"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Role
              </label>
              <Input
                value={profile?.role || 'member'}
                disabled
                className="bg-neutral-50 capitalize"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>

      {/* Change Password Section */}
      <form onSubmit={handlePasswordChange} className="max-w-2xl mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passwordMessage && (
              <div
                className={`rounded-lg p-4 text-sm ${
                  passwordMessage.type === 'success'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Current Password"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="New Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="submit"
                variant="outline"
                loading={savingPassword}
                className="uppercase tracking-wide text-xs font-semibold"
              >
                Save Changes
              </Button>
              <Link
                href="/forgot-password"
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
