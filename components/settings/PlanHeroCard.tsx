import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlanInfo {
  id: string
  name: string
  description: string
  price: number
  icon: LucideIcon
  popular?: boolean
  promotional?: boolean
}

interface PlanHeroCardProps {
  plan: PlanInfo
  isTrialing: boolean
  trialDaysLeft: number
  formatPrice: (price: number) => string
  className?: string
}

export function PlanHeroCard({
  plan,
  isTrialing,
  trialDaysLeft,
  formatPrice,
  className,
}: PlanHeroCardProps) {
  const PlanIcon = plan.icon

  // Determine trial badge color based on urgency
  const getTrialBadgeClasses = () => {
    if (trialDaysLeft <= 3) return 'bg-red-100 text-red-700'
    if (trialDaysLeft <= 7) return 'bg-yellow-100 text-yellow-700'
    return 'bg-blue-100 text-blue-700'
  }

  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-[1px]',
        className
      )}
    >
      <div className="rounded-[15px] bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Icon and Plan Info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
              <PlanIcon className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-neutral-900">
                  {plan.name}
                </h2>
                {plan.popular && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Popular
                  </span>
                )}
                {plan.promotional && (
                  <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-0.5 text-xs font-medium text-white">
                    Limited
                  </span>
                )}
                {isTrialing && trialDaysLeft > 0 && (
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      getTrialBadgeClasses()
                    )}
                  >
                    {trialDaysLeft} day{trialDaysLeft === 1 ? '' : 's'} left
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-neutral-500">{plan.description}</p>
            </div>
          </div>

          {/* Right: Price */}
          <div className="text-right sm:min-w-32">
            <p className="text-3xl font-bold text-neutral-900">
              {formatPrice(plan.price)}
            </p>
            {plan.price > 0 && (
              <p className="text-sm text-neutral-500">billed monthly</p>
            )}
            {plan.price === 0 && plan.promotional && (
              <p className="text-sm text-neutral-500">during early access</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
