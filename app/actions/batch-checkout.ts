'use server'

import { checkoutItem, checkoutWithSerials, CheckoutResult } from './checkouts'

export interface BatchCheckoutItem {
  itemId: string
  itemName: string
  quantity?: number      // For non-serialized items
  serialIds?: string[]   // For serialized items
}

export interface BatchCheckoutResult {
  success: boolean
  checkedOutCount: number
  totalCount: number
  failedItems?: Array<{
    itemId: string
    itemName: string
    error: string
  }>
  error?: string
}

export async function batchCheckout(
  items: BatchCheckoutItem[],
  assigneeType: 'person' | 'job' | 'location',
  assigneeId?: string,
  assigneeName?: string,
  dueDate?: string,
  notes?: string
): Promise<BatchCheckoutResult> {
  if (items.length === 0) {
    return { success: false, checkedOutCount: 0, totalCount: 0, error: 'No items to checkout' }
  }

  if (!assigneeName) {
    return { success: false, checkedOutCount: 0, totalCount: items.length, error: 'Assignee name is required' }
  }

  const results: Array<{ item: BatchCheckoutItem; result: CheckoutResult }> = []

  for (const item of items) {
    let result: CheckoutResult

    if (item.serialIds && item.serialIds.length > 0) {
      // Serialized item checkout
      result = await checkoutWithSerials(
        item.itemId,
        item.serialIds,
        assigneeType,
        assigneeId,
        assigneeName,
        dueDate,
        notes
      )
    } else {
      // Non-serialized item checkout
      result = await checkoutItem(
        item.itemId,
        item.quantity || 1,
        assigneeName,
        notes,
        dueDate
      )
    }

    results.push({ item, result })
  }

  const successCount = results.filter(r => r.result.success).length
  const failedItems = results
    .filter(r => !r.result.success)
    .map(r => ({
      itemId: r.item.itemId,
      itemName: r.item.itemName,
      error: r.result.error || 'Unknown error'
    }))

  return {
    success: failedItems.length === 0,
    checkedOutCount: successCount,
    totalCount: items.length,
    failedItems: failedItems.length > 0 ? failedItems : undefined,
    error: failedItems.length > 0
      ? `${failedItems.length} item(s) failed to checkout`
      : undefined
  }
}
