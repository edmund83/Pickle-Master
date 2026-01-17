/**
 * Conversation History Manager for Zoe AI
 *
 * Manages conversation history with:
 * - Rolling summarization for long conversations
 * - Token budget tracking
 * - Efficient compression of older messages
 */

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant'
  content: string
}

export interface ManagedHistory {
  /** AI-generated summary of older messages (if any) */
  summary: string | null
  /** Number of messages included in the summary */
  summarizedCount: number
  /** Recent messages kept in full */
  recentMessages: ChatMessage[]
  /** Estimated total tokens for the managed history */
  estimatedTokens: number
}

/**
 * Estimate token count for text (~4 chars per token for English)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Estimate tokens for a message array
 */
export function estimateMessagesTokens(messages: ChatMessage[]): number {
  return messages.reduce((sum, m) => sum + estimateTokens(m.content) + 4, 0) // +4 for role tokens
}

/**
 * Configuration for history management
 */
export interface HistoryConfig {
  /** Maximum number of recent messages to keep in full */
  maxRecentMessages: number
  /** Maximum total token budget for history */
  maxTokenBudget: number
  /** Maximum characters per message before truncation */
  maxMessageLength: number
}

const DEFAULT_CONFIG: HistoryConfig = {
  maxRecentMessages: 6,
  maxTokenBudget: 2500,
  maxMessageLength: 2000,
}

/**
 * Manage conversation history with summarization
 *
 * Strategy:
 * 1. Always keep last N messages in full
 * 2. If older messages exist, summarize them
 * 3. Respect token budget
 */
export function manageHistory(
  messages: ChatMessage[],
  existingSummary: string | null = null,
  config: Partial<HistoryConfig> = {}
): ManagedHistory {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  // Sanitize and truncate messages
  const sanitized = messages
    .filter(
      (m) =>
        m && typeof m.content === 'string' && ['user', 'model', 'assistant'].includes(m.role)
    )
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, cfg.maxMessageLength),
    }))

  // If we have fewer messages than the limit, return all
  if (sanitized.length <= cfg.maxRecentMessages) {
    return {
      summary: existingSummary,
      summarizedCount: existingSummary ? messages.length - sanitized.length : 0,
      recentMessages: sanitized,
      estimatedTokens:
        estimateMessagesTokens(sanitized) + (existingSummary ? estimateTokens(existingSummary) : 0),
    }
  }

  // Split into older and recent
  const recentMessages = sanitized.slice(-cfg.maxRecentMessages)
  const olderMessages = sanitized.slice(0, -cfg.maxRecentMessages)

  // Create summary of older messages
  const summary = createIncrementalSummary(olderMessages, existingSummary)
  const summarizedCount = olderMessages.length + (existingSummary ? 1 : 0)

  // Ensure we're within token budget
  let finalRecent = recentMessages
  let totalTokens = estimateTokens(summary) + estimateMessagesTokens(finalRecent)

  while (totalTokens > cfg.maxTokenBudget && finalRecent.length > 2) {
    finalRecent = finalRecent.slice(1)
    totalTokens = estimateTokens(summary) + estimateMessagesTokens(finalRecent)
  }

  return {
    summary,
    summarizedCount,
    recentMessages: finalRecent,
    estimatedTokens: totalTokens,
  }
}

/**
 * Create an incremental summary from older messages
 * This is a client-side summary that doesn't require an AI call
 */
function createIncrementalSummary(
  messages: ChatMessage[],
  existingSummary: string | null
): string {
  const parts: string[] = []

  // Include existing summary
  if (existingSummary) {
    parts.push(`Previous: ${existingSummary}`)
  }

  // Summarize key points from messages
  const keyPoints: string[] = []

  for (const msg of messages) {
    const content = msg.content.toLowerCase()

    // Extract questions asked
    if (msg.role === 'user' && content.includes('?')) {
      const question = extractKeyPhrase(msg.content, 50)
      if (question) keyPoints.push(`Asked: ${question}`)
    }

    // Extract topics discussed
    const topics = extractTopics(msg.content)
    if (topics.length > 0) {
      keyPoints.push(`Topics: ${topics.join(', ')}`)
    }

    // Extract numbers/data mentioned (important for inventory context)
    const numbers = extractKeyNumbers(msg.content)
    if (numbers) {
      keyPoints.push(`Data: ${numbers}`)
    }
  }

  // Deduplicate and limit
  const uniquePoints = [...new Set(keyPoints)].slice(0, 5)

  if (uniquePoints.length > 0) {
    parts.push(`Recent discussion: ${uniquePoints.join('; ')}`)
  }

  return parts.join(' | ') || 'Conversation started'
}

/**
 * Extract a key phrase from text
 */
function extractKeyPhrase(text: string, maxLength: number): string | null {
  // Get first sentence or clause
  const match = text.match(/^[^.!?]+[.!?]?/)
  if (match) {
    const phrase = match[0].trim()
    return phrase.length <= maxLength ? phrase : phrase.slice(0, maxLength - 3) + '...'
  }
  return null
}

/**
 * Extract inventory-related topics from text
 */
function extractTopics(text: string): string[] {
  const topics: string[] = []
  const lower = text.toLowerCase()

  // Inventory topics
  if (/low.?stock|out.?of.?stock|running low/i.test(lower)) topics.push('stock levels')
  if (/purchase|order|po\b|vendor/i.test(lower)) topics.push('POs')
  if (/pick.?list|fulfill|ship/i.test(lower)) topics.push('fulfillment')
  if (/check.?out|borrow|loan/i.test(lower)) topics.push('checkouts')
  if (/move|transfer|location/i.test(lower)) topics.push('movement')
  if (/report|analytics|trend/i.test(lower)) topics.push('reports')
  if (/task|job|work/i.test(lower)) topics.push('tasks')
  if (/team|member|user/i.test(lower)) topics.push('team')

  return topics.slice(0, 3)
}

/**
 * Extract key numbers from text
 */
function extractKeyNumbers(text: string): string | null {
  const numbers: string[] = []

  // Currency amounts
  const currency = text.match(/\$[\d,]+(?:\.\d{2})?/g)
  if (currency) numbers.push(...currency.slice(0, 2))

  // Quantities
  const quantities = text.match(/\b\d+\s*(?:items?|units?|pieces?)\b/gi)
  if (quantities) numbers.push(...quantities.slice(0, 2))

  return numbers.length > 0 ? numbers.join(', ') : null
}

/**
 * Format managed history for AI prompt
 */
export function formatHistoryForPrompt(history: ManagedHistory): string {
  const parts: string[] = []

  // Add summary if exists
  if (history.summary) {
    parts.push(`[Earlier in conversation: ${history.summary}]`)
  }

  // Add recent messages
  for (const msg of history.recentMessages) {
    const role = msg.role === 'user' ? 'User' : 'Zoe'
    parts.push(`${role}: ${msg.content}`)
  }

  return parts.join('\n\n')
}

/**
 * Trim history to fit within a token budget
 * Removes oldest messages first while preserving minimum context
 */
export function trimHistoryToTokenBudget(
  messages: ChatMessage[],
  budget: number,
  minMessages: number = 2
): ChatMessage[] {
  let totalTokens = estimateMessagesTokens(messages)
  const result = [...messages]

  while (totalTokens > budget && result.length > minMessages) {
    result.shift() // Remove oldest
    totalTokens = estimateMessagesTokens(result)
  }

  return result
}

/**
 * Check if conversation is getting long and might benefit from summarization
 */
export function shouldSummarize(
  messages: ChatMessage[],
  threshold: number = 10
): boolean {
  return messages.length >= threshold
}

/**
 * Normalize message roles (convert 'assistant' to 'model' for Gemini compatibility)
 */
export function normalizeRoles(
  messages: ChatMessage[],
  targetRole: 'model' | 'assistant' = 'model'
): ChatMessage[] {
  return messages.map((m) => ({
    ...m,
    role:
      m.role === 'user' ? 'user' : targetRole,
  })) as ChatMessage[]
}
