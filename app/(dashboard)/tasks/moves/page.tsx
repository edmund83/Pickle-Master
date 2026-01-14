import { getMovePageData, type MovePageData } from '@/app/actions/inventory'
import { MovesPageClient } from './MovesPageClient'

export default async function StockMovesPage() {
  // Server-side data fetching with pagination
  const initialData = await getMovePageData({ page: 1, pageSize: 50 })

  return <MovesPageClient initialData={initialData} />
}
