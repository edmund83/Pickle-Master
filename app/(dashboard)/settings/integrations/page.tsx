'use client'

import {
  Settings2,
  AlertCircle,
  ShoppingCart,
  Calculator,
  Globe,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const INTEGRATIONS = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync inventory with your Shopify store',
    icon: ShoppingCart,
    category: 'E-commerce',
    status: 'coming_soon',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Connect with your WordPress online store',
    icon: ShoppingCart,
    category: 'E-commerce',
    status: 'coming_soon',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync inventory costs and values with accounting',
    icon: Calculator,
    category: 'Accounting',
    status: 'coming_soon',
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Integrate with Xero for seamless accounting',
    icon: Calculator,
    category: 'Accounting',
    status: 'coming_soon',
  },
  {
    id: 'api',
    name: 'REST API',
    description: 'Build custom integrations with our API',
    icon: Globe,
    category: 'Developer',
    status: 'coming_soon',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps via Zapier',
    icon: Zap,
    category: 'Automation',
    status: 'coming_soon',
  },
]

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Integrations</h1>
        <p className="text-neutral-500">
          Connect Nook with your favorite tools and platforms
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Coming Soon Banner */}
        <div className="flex items-center gap-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-900">Integrations Coming Soon</p>
            <p className="text-sm text-amber-700">
              We&apos;re working on bringing you powerful integrations. Stay tuned!
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            Notify Me
          </Button>
        </div>

        {/* Connected Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Connected Integrations
            </CardTitle>
            <CardDescription>
              Manage your active integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <Settings2 className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="mt-4 text-neutral-500">No integrations connected yet</p>
              <p className="text-sm text-neutral-400">
                Connect an integration below to get started
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Integrations */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Available Integrations
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {INTEGRATIONS.map((integration) => {
              const Icon = integration.icon
              return (
                <Card key={integration.id} className="opacity-60">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                      <Icon className="h-6 w-6 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-neutral-900">{integration.name}</h3>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 truncate">
                        {integration.description}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {integration.category}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Connect
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Request Integration */}
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex-1">
              <h3 className="font-medium text-neutral-900">
                Don&apos;t see the integration you need?
              </h3>
              <p className="text-sm text-neutral-500">
                Let us know which integrations would help your business
              </p>
            </div>
            <Button variant="outline" disabled>
              Request Integration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
