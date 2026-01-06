'use client'

import {
  Settings2,
  AlertCircle,
  ShoppingCart,
  Calculator,
  Globe,
  Zap,
  ArrowRight,
  Link2,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsSection } from '@/components/settings'

const INTEGRATIONS = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync inventory with your Shopify store',
    icon: ShoppingCart,
    category: 'E-commerce',
    status: 'coming_soon',
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Connect with your WordPress online store',
    icon: ShoppingCart,
    category: 'E-commerce',
    status: 'coming_soon',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync inventory costs and values with accounting',
    icon: Calculator,
    category: 'Accounting',
    status: 'coming_soon',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Integrate with Xero for seamless accounting',
    icon: Calculator,
    category: 'Accounting',
    status: 'coming_soon',
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    id: 'api',
    name: 'REST API',
    description: 'Build custom integrations with our API',
    icon: Globe,
    category: 'Developer',
    status: 'coming_soon',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps via Zapier',
    icon: Zap,
    category: 'Automation',
    status: 'coming_soon',
    color: 'bg-amber-100 text-amber-600',
  },
]

export default function IntegrationsPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Integrations</h1>
        <p className="mt-1 text-neutral-500">Connect StockZip with your favorite tools and platforms</p>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
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
            <Bell className="mr-2 h-4 w-4" />
            Notify Me
          </Button>
        </div>

        {/* Connected Integrations */}
        <SettingsSection
          title="Connected Integrations"
          description="Manage your active integrations"
          icon={Settings2}
        >
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
              <Link2 className="h-7 w-7 text-neutral-400" />
            </div>
            <p className="mt-4 font-medium text-neutral-600">No integrations connected yet</p>
            <p className="mt-1 text-sm text-neutral-400">
              Connect an integration below to get started
            </p>
          </div>
        </SettingsSection>

        {/* Available Integrations */}
        <SettingsSection
          title="Available Integrations"
          description="Connect with popular platforms and services"
          icon={Globe}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {INTEGRATIONS.map((integration) => {
              const Icon = integration.icon
              return (
                <div
                  key={integration.id}
                  className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 opacity-75 transition-opacity hover:opacity-100"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${integration.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-neutral-900">{integration.name}</h3>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Coming Soon
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      {integration.description}
                    </p>
                    <p className="mt-2 text-xs text-neutral-400">
                      {integration.category}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled className="shrink-0">
                    Connect
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </SettingsSection>

        {/* Request Integration */}
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 p-6 text-center">
          <Globe className="mx-auto h-10 w-10 text-neutral-400" />
          <h3 className="mt-4 font-medium text-neutral-900">
            Don&apos;t see the integration you need?
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Let us know which integrations would help your business
          </p>
          <Button variant="outline" className="mt-4" disabled>
            Request Integration
          </Button>
        </div>
      </div>
    </div>
  )
}
