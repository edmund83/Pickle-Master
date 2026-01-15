import { getPaginatedSalesOrders } from '@/app/actions/sales-orders'
import { getCustomers } from '@/app/actions/customers'
import { SalesOrdersListClient } from './SalesOrdersListClient'

interface SearchParams {
  page?: string
  status?: string
  customer?: string
  priority?: string
  search?: string
  sort?: string
  order?: string
}

export default async function SalesOrdersPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  // Parse URL params
  const page = parseInt(params.page || '1', 10)
  const status = params.status || undefined
  const customerId = params.customer || undefined
  const priority = params.priority || undefined
  const search = params.search || undefined
  const sortColumn = params.sort || 'updated_at'
  const sortDirection = (params.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  // Fetch data with pagination and filters
  const [salesOrdersData, customers] = await Promise.all([
    getPaginatedSalesOrders({
      page,
      pageSize: 20,
      status,
      customerId,
      priority,
      search,
      sortColumn,
      sortDirection
    }),
    getCustomers()
  ])

  return (
    <SalesOrdersListClient
      initialData={salesOrdersData}
      customers={customers}
      initialFilters={{
        status: status || '',
        customerId: customerId || '',
        priority: priority || '',
        search: search || '',
        sortColumn,
        sortDirection
      }}
    />
  )
}
