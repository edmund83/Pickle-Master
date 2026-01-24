import { getPaginatedInvoices } from '@/app/actions/invoices'
import { getCustomers } from '@/app/actions/customers'
import { InvoicesListClient } from './InvoicesListClient'
import { checkFeatureAccess } from '@/lib/features/gating.server'
import { FeatureUpgradePrompt } from '@/components/FeatureUpgradePrompt'

interface SearchParams {
  page?: string
  status?: string
  customer?: string
  search?: string
  sort?: string
  order?: string
}

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  // Feature gate: Invoices require Growth+ plan
  const featureCheck = await checkFeatureAccess('invoices')
  if (!featureCheck.allowed) {
    return <FeatureUpgradePrompt feature="invoices" />
  }

  const params = await searchParams

  // Parse URL params
  const page = parseInt(params.page || '1', 10)
  const status = params.status || undefined
  const customerId = params.customer || undefined
  const search = params.search || undefined
  const sortColumn = params.sort || 'updated_at'
  const sortDirection = (params.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  // Fetch data with pagination and filters
  const [invoicesData, customers] = await Promise.all([
    getPaginatedInvoices({
      page,
      pageSize: 20,
      status,
      customerId,
      search,
      sortColumn,
      sortDirection
    }),
    getCustomers()
  ])

  return (
    <InvoicesListClient
      initialData={invoicesData}
      customers={customers}
      initialFilters={{
        status: status || '',
        customerId: customerId || '',
        search: search || '',
        sortColumn,
        sortDirection
      }}
    />
  )
}
