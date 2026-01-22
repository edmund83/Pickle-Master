'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle, Sparkles } from 'lucide-react'

const PLAN_DETAILS = {
  early_access: {
    name: 'Early Access',
    price: '$0 for 3 months',
    color: 'bg-accent/10 text-accent',
    badge: 'Early Bird',
    trialText: '3 months free • No card required',
  },
  starter: {
    name: 'Starter',
    price: '$18/mo',
    color: 'bg-blue-100 text-blue-700',
    trialText: '14 days free',
  },
  growth: {
    name: 'Growth',
    price: '$39/mo',
    color: 'bg-primary/10 text-primary',
    badge: 'Best Value',
    trialText: '14 days free',
  },
  scale: {
    name: 'Scale',
    price: '$89/mo',
    color: 'bg-purple-100 text-purple-700',
    trialText: '14 days free',
  },
} as const

type PlanType = keyof typeof PLAN_DETAILS

function SignupForm() {
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') as PlanType | null
  const selectedPlan = planParam && PLAN_DETAILS[planParam] ? planParam : 'growth'
  const planInfo = PLAN_DETAILS[selectedPlan]

  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedToTerms) {
      setError('Please agree to the privacy policy and terms to continue')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Create the user with metadata including selected plan
      // The database trigger will handle creating tenant and profile with trial
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            plan: selectedPlan,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) throw authError

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError(null)
    setOauthLoading('google')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up with Google')
      setOauthLoading(null)
    }
  }

  const handleAppleSignup = async () => {
    setError(null)
    setOauthLoading('apple')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up with Apple')
      setOauthLoading(null)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100 p-6">
        <div className="w-full max-w-md space-y-6 rounded-xl bg-base-100 p-8 text-center shadow-md shadow-base-300/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h3 className="mb-2 text-2xl font-semibold text-base-content">Check your email</h3>
            <p className="text-base-content/80">
              We sent a confirmation link to <strong>{email}</strong>
            </p>
          </div>
          <p className="text-sm text-base-content/60">
            Click the link in the email to verify your account and get started.
          </p>
          <Link href="/login" className="link link-animated link-primary">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:grid lg:grid-cols-2">
      {/* Left: Form Column */}
      <div className="bg-base-100 flex min-h-screen flex-col items-center justify-center space-y-6 py-10">
        <div className="flex w-full flex-col space-y-6 max-sm:px-6 sm:max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="StockZip"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <h2 className="text-base-content text-xl font-bold">StockZip<span className="text-[8px] font-light align-super opacity-70">™</span></h2>
          </div>

          {/* Header */}
          <div>
            <h3 className="text-base-content mb-1.5 text-2xl font-semibold">Create your account</h3>
            <p className="text-base-content/80">Start managing your inventory in minutes</p>
          </div>

          {/* Plan Badge */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${planInfo.color}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {selectedPlan === 'early_access' ? 'Joining Early Access' : `Starting ${planInfo.name} plan trial`}
                {'badge' in planInfo && (
                  <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs">{planInfo.badge}</span>
                )}
              </div>
            </div>
            <p className="text-xs text-base-content/60">
              {planInfo.trialText}
              {selectedPlan !== 'early_access' && ` • ${planInfo.price} after trial`}
              {' • '}
              <Link href="/pricing" className="link link-primary">
                Change plan
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="flex w-full gap-3 max-sm:flex-col">
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={oauthLoading !== null || loading}
              className="btn btn-outline btn-secondary grow"
            >
              {oauthLoading === 'google' ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <Image
                  src="/images/google-icon.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="size-5 object-cover"
                />
              )}
              Google
            </button>
            <button
              type="button"
              onClick={handleAppleSignup}
              disabled={oauthLoading !== null || loading}
              className="btn btn-outline btn-secondary grow"
            >
              {oauthLoading === 'apple' ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <span className="icon-[tabler--brand-apple] size-5"></span>
              )}
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="divider">Or continue with email</div>

          {/* Signup Form */}
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="label-text" htmlFor="fullName">
                Full name*
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="Enter your full name"
                className="input w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading || oauthLoading !== null}
              />
            </div>

            <div>
              <label className="label-text" htmlFor="companyName">
                Company name*
              </label>
              <input
                type="text"
                id="companyName"
                placeholder="Enter your company name"
                className="input w-full"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading || oauthLoading !== null}
              />
            </div>

            <div>
              <label className="label-text" htmlFor="userEmail">
                Email address*
              </label>
              <input
                type="email"
                id="userEmail"
                placeholder="Enter your email address"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || oauthLoading !== null}
              />
            </div>

            <div>
              <label className="label-text" htmlFor="userPassword">
                Password*
              </label>
              <div className="input flex w-full items-center">
                <input
                  id="userPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="grow border-0 bg-transparent focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  disabled={loading || oauthLoading !== null}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="block cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <span className="icon-[tabler--eye] size-5 shrink-0"></span>
                  ) : (
                    <span className="icon-[tabler--eye-off] size-5 shrink-0"></span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                id="termsAgreement"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={loading || oauthLoading !== null}
              />
              <label className="label-text text-base-content/80 p-0 text-base" htmlFor="termsAgreement">
                I agree to the{' '}
                <Link href="/terms" className="link link-animated link-primary font-normal">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="link link-animated link-primary font-normal">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-lg btn-primary btn-block"
              disabled={loading || oauthLoading !== null}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-base-content/80 text-center">
            Already have an account?{' '}
            <Link href="/login" className="link link-animated link-primary font-normal">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Decorative Panel (desktop only) */}
      <div className="bg-base-200 h-screen p-5 max-lg:hidden">
        <div className="gradient-bg gradient-bg-primary flex h-full flex-col justify-between rounded-2xl p-8">
          <div>
            <h1 className="mb-6 text-4xl font-bold text-white">
              Create your account to get started
            </h1>
            <p className="text-xl text-white/80">
              Simple inventory management for small businesses. Track your items, manage stock levels, and grow your business with StockZip.
            </p>
          </div>

          <div className="bg-base-100 relative space-y-6 rounded-2xl p-8">
            {/* Decorative Triangle */}
            <div className="absolute start-1/10 -top-35">
              <svg xmlns="http://www.w3.org/2000/svg" width="224" height="141" viewBox="0 0 224 141" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M177.435 140.08L110.569 57.6631C110.158 57.1562 109.379 57.1728 108.99 57.6968L47.7094 140.197C47.5207 140.451 47.223 140.6 46.9066 140.6H1.09212C0.258121 140.6 -0.209425 139.64 0.305219 138.983L108.986 0.394436C109.382 -0.110045 110.143 -0.117191 110.548 0.379776L223.371 138.818C223.903 139.471 223.438 140.45 222.596 140.45H178.212C177.91 140.45 177.625 140.314 177.435 140.08ZM110.179 85.1453L157.418 138.999C157.985 139.645 157.526 140.658 156.667 140.658H66.9112C66.0757 140.658 65.6086 139.694 66.1263 139.038L108.642 85.1851C109.029 84.6946 109.767 84.6755 110.179 85.1453Z"
                  fill="url(#paint0_linear_10365_79821)"
                  fillOpacity="0.1"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_10365_79821"
                    x1="111.843"
                    y1="0.0117188"
                    x2="111.843"
                    y2="168.837"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="white" />
                    <stop offset="1" stopColor="white" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">Join thousands of businesses using StockZip</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="StockZip"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>

            <p className="mb-5 text-lg">
              Track inventory, manage stock levels, and streamline your operations with our easy-to-use platform.
            </p>

            {/* Avatar Group */}
            <div className="avatar-group justify-end -space-x-5">
              <div className="avatar">
                <div className="size-12">
                  <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-1.png" alt="User" />
                </div>
              </div>
              <div className="avatar">
                <div className="size-12">
                  <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-2.png" alt="User" />
                </div>
              </div>
              <div className="avatar">
                <div className="size-12">
                  <img src="https://cdn.flyonui.com/fy-assets/avatar/avatar-3.png" alt="User" />
                </div>
              </div>
              <div className="avatar avatar-placeholder">
                <div className="bg-neutral text-neutral-content size-12">
                  <span className="text-xs">+5k</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SignupFormSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-2">
      <div className="bg-base-100 flex min-h-screen flex-col items-center justify-center space-y-6 py-10">
        <div className="flex w-full flex-col space-y-6 max-sm:px-6 sm:max-w-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-neutral-200"></div>
            <div className="h-6 w-16 rounded bg-neutral-200"></div>
          </div>
          <div className="space-y-2">
            <div className="h-7 w-48 rounded bg-neutral-200"></div>
            <div className="h-5 w-72 rounded bg-neutral-200"></div>
          </div>
          <div className="h-8 w-56 rounded-full bg-neutral-200"></div>
          <div className="flex gap-3">
            <div className="h-10 flex-1 rounded-lg bg-neutral-200"></div>
            <div className="h-10 flex-1 rounded-lg bg-neutral-200"></div>
          </div>
          <div className="h-4 w-full rounded bg-neutral-200"></div>
          <div className="space-y-4">
            <div className="h-10 w-full rounded-lg bg-neutral-200"></div>
            <div className="h-10 w-full rounded-lg bg-neutral-200"></div>
            <div className="h-10 w-full rounded-lg bg-neutral-200"></div>
            <div className="h-10 w-full rounded-lg bg-neutral-200"></div>
            <div className="h-12 w-full rounded-lg bg-neutral-200"></div>
          </div>
        </div>
      </div>
      <div className="bg-base-200 h-screen p-5 max-lg:hidden">
        <div className="h-full rounded-2xl bg-neutral-300 animate-pulse"></div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormSkeleton />}>
      <SignupForm />
    </Suspense>
  )
}
