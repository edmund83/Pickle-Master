'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle, Users, Briefcase, Eye, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// =============================================================================
// TYPES
// =============================================================================

interface InvitationDetails {
  id: string
  tenant_id: string
  tenant_name: string
  email: string
  role: string
  invited_by_name: string | null
  expires_at: string
  is_valid: boolean
}

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

// =============================================================================
// COMPONENT
// =============================================================================

export default function AcceptInvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  // State
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      try {
        const supabase = createClient()

        // Call the RPC function to get invitation details
        const { data, error: rpcError } = await (supabase as any).rpc('get_invitation_by_token', {
          p_token: token,
        })

        if (rpcError) {
          console.error('Error fetching invitation:', rpcError)
          setError('Unable to verify invitation. Please check the link and try again.')
          return
        }

        if (!data || data.length === 0) {
          setError('This invitation link is invalid or has already been used.')
          return
        }

        const inv = data[0]

        if (!inv.is_valid) {
          setError('This invitation has expired or has already been accepted.')
          return
        }

        setInvitation({
          id: inv.id,
          tenant_id: inv.tenant_id,
          tenant_name: inv.tenant_name,
          email: inv.email,
          role: inv.role,
          invited_by_name: inv.invited_by_name,
          expires_at: inv.expires_at,
          is_valid: inv.is_valid,
        })
      } catch (err) {
        console.error('Error:', err)
        setError('Something went wrong. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchInvitation()
    }
  }, [token])

  // Handle signup
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
      const supabase = createClient()

      // Sign up with the invited email
      // The auth trigger will check for pending invitations and join the existing tenant
      const { error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            full_name: fullName,
            // Note: company_name and plan are not needed since user will join existing tenant
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('This email is already registered. Please log in instead.')
        } else {
          throw authError
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-neutral-600">Verifying invitation...</p>
        </div>
      </div>
    )
  }

  // Error state (invalid/expired invitation)
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

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-neutral-900">Check Your Email</h1>
            <p className="mt-2 text-neutral-600">
              We sent a confirmation link to <span className="font-medium">{invitation?.email}</span>.
              Click the link to verify your email and access {invitation?.tenant_name}.
            </p>
            <div className="mt-6">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Go to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  const role = roleInfo[invitation?.role || 'viewer'] || roleInfo.viewer

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* Invitation Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-4 text-xl font-semibold text-neutral-900">
              Join {invitation?.tenant_name}
            </h1>
            {invitation?.invited_by_name && (
              <p className="mt-1 text-sm text-neutral-500">
                {invitation.invited_by_name} invited you to collaborate
              </p>
            )}
          </div>

          {/* Role Badge */}
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email (readonly) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                Email
              </label>
              <Input
                type="email"
                value={invitation?.email || ''}
                disabled
                className="bg-neutral-50"
              />
              <p className="mt-1 text-xs text-neutral-400">
                This is the email you were invited with
              </p>
            </div>

            {/* Full Name */}
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

            {/* Password */}
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

            {/* Terms */}
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
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </label>
            </div>

            {/* Submit */}
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

          {/* Login Link */}
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
