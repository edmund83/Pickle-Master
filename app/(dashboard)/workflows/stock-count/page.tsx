import { getStockCounts } from '@/app/actions/stock-counts'
import { StockCountClient } from '@/components/workflows/StockCountClient'

export default async function StockCountPage() {
  const stockCounts = await getStockCounts()

  return <StockCountClient stockCounts={stockCounts} />
}
