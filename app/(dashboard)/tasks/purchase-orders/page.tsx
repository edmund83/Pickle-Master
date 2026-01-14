import { getPaginatedPurchaseOrders, getVendors } from '@/app/actions/purchase-orders'
import { PurchaseOrdersListClient } from './PurchaseOrdersListClient'

interface SearchParams {
  page?: string
  status?: string
  vendor?: string
  search?: string
  sort?: string
  order?: string
}

export default async function PurchaseOrdersPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  // Parse URL params
  const page = parseInt(params.page || '1', 10)
  const status = params.status || undefined
  const vendorId = params.vendor || undefined
  const search = params.search || undefined
  const sortColumn = params.sort || 'updated_at'
  const sortDirection = (params.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  // Fetch data with pagination and filters
  const [purchaseOrdersData, vendors] = await Promise.all([
    getPaginatedPurchaseOrders({
      page,
      pageSize: 20,
      status,
      vendorId,
      search,
      sortColumn,
      sortDirection
    }),
    getVendors()
  ])

  return (
    <PurchaseOrdersListClient
      initialData={purchaseOrdersData}
      vendors={vendors}
      initialFilters={{
        status: status || '',
        vendorId: vendorId || '',
        search: search || '',
        sortColumn,
        sortDirection
      }}
    />
  )
}
