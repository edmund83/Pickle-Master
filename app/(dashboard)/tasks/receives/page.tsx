import { getPaginatedReceives, type PaginatedReceivesResult, type ReceiveListItem, type ReceiveSourceType } from '@/app/actions/receives'
import { ReceivesListClient } from './ReceivesListClient'
import { checkFeatureAccess } from '@/lib/features/gating.server'
import { FeatureUpgradePrompt } from '@/components/FeatureUpgradePrompt'

interface SearchParams {
  page?: string
  status?: string
  source?: string
  po?: string
  search?: string
  sort?: string
  order?: string
}

export default async function ReceivesPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  // Feature gate: Receiving requires Growth+ plan
  const featureCheck = await checkFeatureAccess('receiving')
  if (!featureCheck.allowed) {
    return <FeatureUpgradePrompt feature="receiving" />
  }

  const params = await searchParams

  // Parse and validate URL parameters
  const page = parseInt(params.page || '1', 10)
  const status = params.status as 'draft' | 'completed' | 'cancelled' | undefined
  const sourceType = params.source as ReceiveSourceType | undefined
  const purchaseOrderId = params.po || undefined
  const search = params.search || undefined
  const sortColumn = params.sort || 'received_date'
  const sortDirection = (params.order === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc'

  // Fetch paginated data
  const receivesData = await getPaginatedReceives({
    page,
    pageSize: 20,
    status,
    sourceType,
    purchaseOrderId,
    search,
    sortColumn,
    sortDirection,
  })

  return (
    <ReceivesListClient
      initialData={receivesData}
      initialFilters={{
        status: status || '',
        sourceType: sourceType || '',
        purchaseOrderId: purchaseOrderId || '',
        search: search || '',
        sortColumn,
        sortDirection,
      }}
    />
  )
}
