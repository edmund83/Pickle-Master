'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, User, Building, AlertCircle, CheckCircle, Sparkles, Loader2 } from 'lucide-react'

const PLAN_DETAILS = {
  starter: { name: 'Starter', price: '$19/mo', color: 'bg-blue-100 text-blue-700' },
  team: { name: 'Team', price: '$49/mo', color: 'bg-primary/10 text-primary', badge: 'Most Popular' },
  business: { name: 'Business', price: '$99/mo', color: 'bg-purple-100 text-purple-700' },
} as const

type PlanType = keyof typeof PLAN_DETAILS

function SignupForm() {
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') as PlanType | null
  const selectedPlan = planParam && PLAN_DETAILS[planParam] ? planParam : 'team'
  const planInfo = PLAN_DETAILS[selectedPlan]
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
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

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a confirmation link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-neutral-500">
            Click the link in the email to verify your account and get started.
          </p>
          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-primary hover:text-primary">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Start managing your inventory in minutes
        </CardDescription>
        {/* Plan badge */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${planInfo.color}`}>
            <Sparkles className="h-3.5 w-3.5" />
            Starting {planInfo.name} plan trial
            {'badge' in planInfo && (
              <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs">{planInfo.badge}</span>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          14 days free • {planInfo.price} after trial • Cancel anytime
        </p>
        <Link href="/pricing" className="mt-1 inline-block text-xs text-primary hover:underline">
          Change plan
        </Link>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              minLength={6}
              required
            />
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>

          <p className="text-center text-xs text-neutral-500">
            By signing up, you agree to our{' '}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:text-primary">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function SignupFormFallback() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Start managing your inventory in minutes
        </CardDescription>
        <div className="mt-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-10 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-10 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-10 animate-pulse rounded-lg bg-neutral-100" />
          <div className="h-10 animate-pulse rounded-lg bg-neutral-100" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormFallback />}>
      <SignupForm />
    </Suspense>
  )
}
