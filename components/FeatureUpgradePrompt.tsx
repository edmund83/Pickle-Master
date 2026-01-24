import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LockKeyhole, Sparkles, ArrowLeft } from 'lucide-react'
import { FEATURE_INFO, type FeatureId } from '@/lib/features'

interface FeatureUpgradePromptProps {
  feature: FeatureId
  backLink?: string
  backLabel?: string
}

/**
 * Server-side component to show upgrade prompt when feature is not available.
 * Use this in server components after checking feature access.
 */
export function FeatureUpgradePrompt({
  feature,
  backLink = '/tasks',
  backLabel = 'Back to Tasks',
}: FeatureUpgradePromptProps) {
  const featureInfo = FEATURE_INFO[feature]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="border-b border-neutral-200 bg-white px-6 py-4">
        <Link
          href={backLink}
          className="mb-2 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <h1 className="text-xl font-semibold text-neutral-900">{featureInfo?.name || feature}</h1>
      </div>

      <div className="flex items-center justify-center p-12">
        <Card className="max-w-md border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <LockKeyhole className="h-8 w-8 text-neutral-500" />
            </div>
            <CardTitle className="text-xl">Upgrade to Unlock</CardTitle>
            <CardDescription className="text-base">
              {featureInfo?.description || 'This feature is not available on your current plan.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-neutral-600">{featureInfo?.upgradeMessage}</p>
            <div className="flex flex-col gap-3">
              <Link href="/settings/billing">
                <Button size="lg" className="w-full">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Upgrade Plan
                </Button>
              </Link>
              <Link href={backLink}>
                <Button variant="ghost" className="w-full">
                  {backLabel}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
