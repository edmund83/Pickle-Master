/**
 * Stock Count types for the UI layer
 */

export interface StockCountWizardData {
  name: string
  description: string
  scopeType: 'full' | 'folder' | 'custom'
  scopeFolderId: string | null
  scopeFolderName: string | null
  assignedTo: string | null
  assignedToName: string | null
  dueDate: string | null
  notes: string
  estimatedItemCount: number
}

export interface StockCountProgress {
  total: number
  counted: number
  pending: number
  variance: number
  unsynced: number
  percent: number
  allCounted: boolean
  allSynced: boolean
}

export interface StockCountStats {
  total: number
  negativeCount: number
  positiveCount: number
  totalNegative: number
  totalPositive: number
  netVariance: number
}

export type VarianceFilter = 'all' | 'negative' | 'positive'
export type CountingFilterStatus = 'all' | 'pending' | 'counted' | 'variance'
