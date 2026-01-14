import { getPaginatedPickLists } from '@/app/actions/pick-lists'
import { PickListsListClient } from './PickListsListClient'

interface SearchParams {
  page?: string
  status?: string
  assigned?: string
  search?: string
  sort?: string
  order?: string
}

export default async function PickListsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  // Parse and validate URL parameters
  const page = parseInt(params.page || '1', 10)
  const status = params.status || undefined
  const assignedTo = params.assigned || undefined
  const search = params.search || undefined
  const sortColumn = params.sort || 'updated_at'
  const sortDirection = (params.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  // Fetch paginated data
  const pickListsData = await getPaginatedPickLists({
    page,
    pageSize: 20,
    status,
    assignedTo,
    search,
    sortColumn,
    sortDirection,
  })

  return (
    <PickListsListClient
      initialData={pickListsData}
      initialFilters={{
        status: status || '',
        assignedTo: assignedTo || '',
        search: search || '',
        sortColumn,
        sortDirection,
      }}
    />
  )
}
