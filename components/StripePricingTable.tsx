'use client'

import { useEffect } from 'react'

interface StripePricingTableProps {
  pricingTableId: string
  publishableKey: string
  customerEmail?: string
  clientReferenceId?: string
}

// Extend the global JSX namespace to include the Stripe pricing table element
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'pricing-table-id': string
          'publishable-key': string
          'customer-email'?: string
          'client-reference-id'?: string
        },
        HTMLElement
      >
    }
  }
}

export function StripePricingTable({
  pricingTableId,
  publishableKey,
  customerEmail,
  clientReferenceId,
}: StripePricingTableProps) {
  useEffect(() => {
    // Load the Stripe Pricing Table script
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/pricing-table.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <stripe-pricing-table
      pricing-table-id={pricingTableId}
      publishable-key={publishableKey}
      customer-email={customerEmail}
      client-reference-id={clientReferenceId}
    />
  )
}

/**
 * Placeholder component when Stripe is not configured
 */
export function StripePricingTablePlaceholder() {
  return (
    <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-200">
        <svg
          className="h-8 w-8 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">Payment Integration Coming Soon</h3>
      <p className="mt-2 text-neutral-600">
        Stripe integration is being configured. Check back soon to upgrade your plan.
      </p>
      <p className="mt-4 text-sm text-neutral-500">
        In the meantime, enjoy your 14-day free trial with full access to all features.
      </p>
    </div>
  )
}
