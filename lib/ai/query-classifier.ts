/**
 * Query Classifier for Zoe AI Assistant
 * Detects whether a question is about features, inventory data, or both
 * Also detects if extended context (activities, POs, etc.) is needed
 */

export type QueryType = 'feature' | 'inventory' | 'mixed'

/**
 * Patterns that indicate need for extended context beyond basic inventory
 */
const EXTENDED_CONTEXT_PATTERNS = [
  // Activity/history patterns
  /who (did|made|moved|changed|updated|deleted|created|adjusted)/i,
  /what (happened|changed|was done)/i,
  /history|audit|log|track|activity/i,
  /yesterday|last (week|month|day)|recently|today/i,

  // Purchase order patterns
  /purchase order|po\b|vendor|supplier|ordered|incoming|expected|eta|arrival/i,
  /when will .* arrive/i,
  /restock|reorder|procurement/i,

  // Pick list / fulfillment patterns
  /pick list|picking|fulfill|fulfillment|ship|shipping/i,
  /ready to ship|order to ship/i,

  // Checkout patterns
  /check.?out|checked.?out|borrow|loan|return|due back/i,
  /who has|assigned to|equipment/i,
  /overdue/i,

  // Task/job patterns
  /task|job|work order|assignment/i,
  /what('s| is) (my|our|the) (task|job|work)/i,
  /to.?do|upcoming|pending|due/i,

  // Team patterns
  /team|member|staff|employee|user/i,
  /who is|who was|most active|performance/i,
]

/**
 * Patterns that indicate a feature/how-to question
 */
const FEATURE_PATTERNS = [
  // How-to patterns
  /how (do|can|to|does) (i|you|we|it|this)/i,
  /how does/i,
  /what is (a |the )?(feature|function|option|setting)/i,
  /what are (the )?(features|functions|options|settings)/i,

  // Help patterns
  /help (me )?(with|understand|learn|using)/i,
  /explain (how|what|the)/i,
  /show me how/i,
  /tutorial/i,
  /guide/i,
  /where (is|are|can i find) (the |a )?(setting|option|button|menu|page)/i,

  // Feature keywords (exact matches)
  /\b(barcode|qr code) scann/i,
  /\blabel print/i,
  /\bprint label/i,
  /\b(import|export) (data|items|csv|excel)/i,
  /\bpurchase order/i,
  /\bcreate (a )?po\b/i,
  /\bpick list/i,
  /\bstock count/i,
  /\bcycle count/i,
  /\bcheck.?(in|out)/i,
  /\b(lot|batch) track/i,
  /\bserial number/i,
  /\bset.?up (a )?reminder/i,
  /\b(auto.?)?reorder/i,
  /\badd (a )?vendor/i,
  /\bgenerate (a )?report/i,
  /\binvite (a )?(team|user|member)/i,
  /\b(change|update) (the )?setting/i,
  /\bkeyboard shortcut/i,
  /\bhotkey/i,
  /\boffline (mode|support|work)/i,
  /\binstall (the )?app/i,
  /\bpwa\b/i,
  /\bcreate (a )?folder/i,
  /\borganize (my |the )?inventory/i,
]

/**
 * Patterns that indicate an inventory data question
 */
const INVENTORY_PATTERNS = [
  // Quantity queries
  /how many/i,
  /how much (do|is|are)/i,
  /what('s| is) (my|our|the) (total |current )?(stock|inventory|quantity)/i,
  /quantity of/i,

  // Status queries
  /\b(low|out of) stock/i,
  /what (items?|products?) (are|is|have)/i,
  /which (items?|products?) (are|is|need)/i,
  /show (me )?(my |the )?(items?|products?|inventory|stock)/i,
  /list (all )?(my |the )?(items?|products?)/i,

  // Location queries
  /where is (the |my |this )?(item|product)/i,
  /what('s| is) in (the |my )?/i,
  /items? in (the |my )?/i,

  // Value queries
  /total value/i,
  /inventory value/i,
  /how much (is|are) .* worth/i,

  // Specific item references
  /\b(item|product) (called|named)/i,
  /find (the |an? )?(item|product)/i,
]

/**
 * Classify a user query to determine context needs
 */
export function classifyQuery(query: string): QueryType {
  const featureScore = FEATURE_PATTERNS.filter(r => r.test(query)).length
  const inventoryScore = INVENTORY_PATTERNS.filter(r => r.test(query)).length

  // Both types significant -> mixed
  if (featureScore >= 2 && inventoryScore >= 1) return 'mixed'
  if (inventoryScore >= 2 && featureScore >= 1) return 'mixed'

  // Clear winner
  if (featureScore > inventoryScore && featureScore >= 1) return 'feature'
  if (inventoryScore > featureScore && inventoryScore >= 1) return 'inventory'

  // Ambiguous or no clear match - default to mixed for safety
  return 'mixed'
}

/**
 * Get recommended item count based on query type
 */
export function getItemCountForQuery(queryType: QueryType): number {
  switch (queryType) {
    case 'feature':
      return 20 // Fewer items, more room for documentation
    case 'inventory':
      return 50 // Full inventory context
    case 'mixed':
      return 35 // Balanced
    default:
      return 35
  }
}

/**
 * Check if query needs extended context (activities, POs, tasks, etc.)
 * This is used to decide whether to use the basic or enhanced context fetcher
 */
export function needsExtendedContext(query: string): boolean {
  return EXTENDED_CONTEXT_PATTERNS.some(pattern => pattern.test(query))
}
