import { getPaginatedDeliveryOrders } from '@/app/actions/delivery-orders'
import { DeliveryOrdersListClient } from './DeliveryOrdersListClient'
import { checkFeatureAccess } from '@/lib/features/gating.server'
import { FeatureUpgradePrompt } from '@/components/FeatureUpgradePrompt'

interface SearchParams {
  page?: string
  status?: string
  search?: string
  sort?: string
  order?: string
}

export default async function DeliveryOrdersPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  // Feature gate: Delivery orders require Growth+ plan
  const featureCheck = await checkFeatureAccess('delivery_orders')
  if (!featureCheck.allowed) {
    return <FeatureUpgradePrompt feature="delivery_orders" />
  }

  const params = await searchParams

  // Parse URL params
  const page = parseInt(params.page || '1', 10)
  const status = params.status || undefined
  const search = params.search || undefined
  const sortColumn = params.sort || 'updated_at'
  const sortDirection = (params.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  // Fetch data with pagination and filters
  const deliveryOrdersData = await getPaginatedDeliveryOrders({
    page,
    pageSize: 20,
    status,
    search,
    sortColumn,
    sortDirection
  })

  return (
    <DeliveryOrdersListClient
      initialData={deliveryOrdersData}
      initialFilters={{
        status: status || '',
        search: search || '',
        sortColumn,
        sortDirection
      }}
    />
  )
}
