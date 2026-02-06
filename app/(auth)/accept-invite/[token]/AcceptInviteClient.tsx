'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { acceptInvitation } from '@/app/actions/invitations'
import type { InvitationByTokenResult } from '@/app/actions/invitations'
import { AlertCircle, CheckCircle, Users, Briefcase, Eye, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const roleInfo: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  staff: {
    icon: <Briefcase className="h-5 w-5" />,
    label: 'Staff',
    description: 'You will be able to create, edit, and delete inventory items.',
  },
  viewer: {
    icon: <Eye className="h-5 w-5" />,
    label: 'Viewer',
    description: 'You will have read-only access to inventory and reports.',
  },
}

interface AcceptInviteClientProps {
  token: string
  /** Server-resolved invitation (token lookup done on server, not sent from client). */
  initialInvitation: InvitationByTokenResult
  /** Error message if server could not resolve invitation. */
  initialError: string | null
}

export function AcceptInviteClient({ token, initialInvitation, initialError }: AcceptInviteClientProps) {
  const [invitation] = useState<InvitationByTokenResult>(initialInvitation)
  const [error, setError] = useState<string | null>(initialError)

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!invitation) return
    if (!agreedToTerms) {
      setError('Please agree to the privacy policy and terms to continue')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const result = await acceptInvitation({ token, fullName, password })
      if (!result.success) {
        setError(result.error || 'Failed to create account')
        return
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  if (error && !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-neutral-900">Invalid Invitation</h1>
            <p className="mt-2 text-neutral-600">{error}</p>
            <div className="mt-6 space-y-3">
              <Link href="/signup">
                <Button className="w-full">Create New Account</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success && invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-neutral-900">Welcome to {invitation.tenant_name}!</h1>
            <p className="mt-2 text-neutral-600">
              Your account has been created successfully. You can now log in with your email{' '}
              <span className="font-medium">{invitation.email}</span> and the password you just created.
            </p>
            <div className="mt-6">
              <Link href="/login">
                <Button className="w-full">
                  Log In Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-neutral-600">Verifying invitation...</p>
        </div>
      </div>
    )
  }

  const role = roleInfo[invitation.role] || roleInfo.viewer

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.svg"
              alt="StockZip"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-neutral-900">
              Join {invitation.tenant_name}
            </h1>
            {invitation.invited_by_name && (
              <p className="mt-1 text-sm text-neutral-500">
                {invitation.invited_by_name} invited you to collaborate
              </p>
            )}
          </div>

          <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                {role.icon}
              </div>
              <div>
                <p className="font-medium text-neutral-900">You&apos;ll join as {role.label}</p>
                <p className="text-sm text-neutral-500">{role.description}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Email</label>
              <Input
                type="email"
                value={invitation.email}
                disabled
                className="bg-neutral-50"
              />
              <p className="mt-1 text-xs text-neutral-400">This is the email you were invited with</p>
            </div>

            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Your Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Create Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                disabled={submitting}
              />
              <label htmlFor="terms" className="text-sm text-neutral-600">
                I agree to the{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                {' '}and{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={submitting || !agreedToTerms}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Accept & Join Team
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
