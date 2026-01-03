'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setOauthLoading('google')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
      setOauthLoading(null)
    }
  }

  const handleAppleLogin = async () => {
    setError(null)
    setOauthLoading('apple')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Apple')
      setOauthLoading(null)
    }
  }

  return (
    <div className="flex w-full flex-col space-y-6 max-sm:px-10 sm:max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-white">N</span>
        </div>
        <h2 className="text-base-content text-xl font-bold">Nook</h2>
      </div>

      {/* Welcome Text */}
      <div>
        <h3 className="text-base-content mb-1.5 text-2xl font-semibold">Welcome Back</h3>
        <p className="text-base-content/80">Welcome back! Select method to login:</p>
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
          onClick={handleGoogleLogin}
          disabled={oauthLoading !== null || loading}
          className="btn btn-outline btn-secondary grow"
        >
          {oauthLoading === 'google' ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <img
              src="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/brand-logo/google-icon.png"
              alt="Google"
              className="size-5 object-cover"
            />
          )}
          Google
        </button>
        <button
          type="button"
          onClick={handleAppleLogin}
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
      <div className="divider">Or Continue with Email</div>

      {/* Login Form */}
      <form className="mb-4 space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="label-text" htmlFor="userEmail">
            Email address*
          </label>
          <input
            type="email"
            placeholder="Enter your email address"
            className="input w-full"
            id="userEmail"
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
          <div className="input flex items-center w-full">
            <input
              id="userPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="············"
              className="grow border-0 bg-transparent focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex items-center justify-between gap-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading || oauthLoading !== null}
            />
            <label className="label-text text-base-content/80 p-0 text-base" htmlFor="rememberMe">
              Remember Me
            </label>
          </div>
          <Link href="/forgot-password" className="link link-animated link-primary font-normal">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-lg btn-primary btn-gradient btn-block"
          disabled={loading || oauthLoading !== null}
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Signing in...
            </>
          ) : (
            'Sign in to Nook'
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <p className="text-base-content/80 text-center">
        New on our platform?{' '}
        <Link href="/signup" className="link link-animated link-primary font-normal">
          Create an account
        </Link>
      </p>
    </div>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="flex w-full flex-col space-y-6 max-sm:px-10 sm:max-w-md animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-neutral-200"></div>
        <div className="h-6 w-16 rounded bg-neutral-200"></div>
      </div>
      <div className="space-y-2">
        <div className="h-7 w-40 rounded bg-neutral-200"></div>
        <div className="h-5 w-64 rounded bg-neutral-200"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-lg bg-neutral-200"></div>
        <div className="h-10 flex-1 rounded-lg bg-neutral-200"></div>
      </div>
      <div className="h-4 w-full rounded bg-neutral-200"></div>
      <div className="space-y-4">
        <div className="h-10 w-full rounded-lg bg-neutral-200"></div>
        <div className="h-10 w-full rounded-lg bg-neutral-200"></div>
        <div className="h-10 w-full rounded-lg bg-neutral-200"></div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="lg:grid lg:grid-cols-2">
      {/* Left: Form Column */}
      <div className="bg-base-100 flex h-screen flex-col items-center justify-center space-y-6">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Right: Decorative Panel (desktop only) */}
      <div className="bg-base-200 h-screen p-5 max-lg:hidden">
        <div className="gradient-bg gradient-bg-primary flex h-full flex-col justify-between rounded-2xl p-8">
          <div>
            <h1 className="mb-6 text-4xl font-bold text-white">
              Welcome back! Please sign in to your Nook account
            </h1>
            <p className="text-xl text-white/80">
              Simple inventory management for small businesses. Track your items, manage stock levels, and grow your business.
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
              <p className="text-3xl font-bold">Manage your inventory with ease</p>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="text-lg font-bold text-white">N</span>
              </div>
            </div>

            <p className="mb-5 text-lg">
              Join thousands of businesses using Nook to track inventory, manage stock, and streamline operations.
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
