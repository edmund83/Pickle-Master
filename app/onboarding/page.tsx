'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Package, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

type Step = 'company' | 'category' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('company')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [categoryColor, setCategoryColor] = useState('#de4a4a')

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  async function checkOnboardingStatus() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/dashboard')
        return
      }
    } finally {
      setInitialLoading(false)
    }
  }

  async function handleCompanySubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (profile?.tenant_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('tenants')
          .update({
            name: companyName,
            settings: { industry },
          })
          .eq('id', profile.tenant_id)
      }

      setStep('category')
    } finally {
      setLoading(false)
    }
  }

  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (profile?.tenant_id && categoryName) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('folders')
          .insert({
            tenant_id: profile.tenant_id,
            name: categoryName,
            color: categoryColor,
            sort_order: 0,
          })
      }

      setStep('complete')
    } finally {
      setLoading(false)
    }
  }

  async function completeOnboarding() {
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <Loader2 className="h-8 w-8 animate-spin text-pickle-500" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-4">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === 'company' ? 'bg-pickle-500 text-white' : 'bg-pickle-100 text-pickle-600'
          }`}
        >
          {step !== 'company' ? <CheckCircle className="h-5 w-5" /> : '1'}
        </div>
        <div className="h-0.5 w-12 bg-neutral-200" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === 'category'
              ? 'bg-pickle-500 text-white'
              : step === 'complete'
              ? 'bg-pickle-100 text-pickle-600'
              : 'bg-neutral-200 text-neutral-400'
          }`}
        >
          {step === 'complete' ? <CheckCircle className="h-5 w-5" /> : '2'}
        </div>
        <div className="h-0.5 w-12 bg-neutral-200" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            step === 'complete' ? 'bg-pickle-500 text-white' : 'bg-neutral-200 text-neutral-400'
          }`}
        >
          3
        </div>
      </div>

      {/* Company Step */}
      {step === 'company' && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pickle-100">
              <Building2 className="h-6 w-6 text-pickle-600" />
            </div>
            <CardTitle>Tell us about your company</CardTitle>
            <CardDescription>
              This helps us customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Company Name
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:border-pickle-500 focus:outline-none focus:ring-1 focus:ring-pickle-500"
                >
                  <option value="">Select an industry</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="food_beverage">Food & Beverage</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Button type="submit" className="w-full" loading={loading}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Category Step */}
      {step === 'category' && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pickle-100">
              <Package className="h-6 w-6 text-pickle-600" />
            </div>
            <CardTitle>Create your first category</CardTitle>
            <CardDescription>
              Organize your inventory with categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Category Name
                </label>
                <Input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Electronics, Raw Materials"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  Color
                </label>
                <div className="flex gap-2">
                  {['#de4a4a', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCategoryColor(color)}
                        className={`h-8 w-8 rounded-full ${
                          categoryColor === color ? 'ring-2 ring-offset-2 ring-neutral-400' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('complete')}
                >
                  Skip
                </Button>
                <Button type="submit" className="flex-1" loading={loading}>
                  Create Category
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {step === 'complete' && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>You&apos;re all set!</CardTitle>
            <CardDescription>
              Your account is ready. Start managing your inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={completeOnboarding} className="w-full" loading={loading}>
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
