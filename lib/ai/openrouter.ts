/**
 * OpenRouter AI client for inventory chat
 * Uses OpenAI-compatible API
 */

import { QueryType } from './query-classifier'
import {
  FEATURE_SUMMARY,
  getHelpTopicList,
  findRelevantTopics,
  formatRelevantTopics
} from './help-knowledge'
import { ManagedHistory } from './history-manager'

export interface InventoryItem {
  id: string
  name: string
  sku?: string
  quantity: number
  min_quantity?: number
  price?: number
  status: string
  folder_name?: string
  updated_at?: string
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Model to use
const MODEL = '@preset/ask-zoe'

function getOpenRouterApiKey(): string | null {
  // Check various casing options
  return process.env.OPENROUTER_API_KEY ||
         process.env.OPENRouter_API_KEY ||
         process.env.OPEN_ROUTER_API_KEY ||
         null
}

export function isOpenRouterConfigured(): boolean {
  return !!getOpenRouterApiKey()
}

/**
 * Build adaptive system prompt based on query type
 */
function buildSystemPrompt(
  query: string,
  context: InventoryItem[],
  queryType: QueryType
): string {
  const relevantTopics = findRelevantTopics(query)

  if (queryType === 'feature') {
    // Feature questions: More documentation, fewer items
    const itemCount = Math.min(context.length, 20)
    return `You are Zoe, a helpful AI assistant for StockZip inventory management.

${FEATURE_SUMMARY}

${relevantTopics.length > 0 ? `Relevant Help Topics:\n${formatRelevantTopics(relevantTopics)}\n` : ''}
User's Inventory Sample (${itemCount} items):
${JSON.stringify(context.slice(0, itemCount), null, 2)}

Guidelines:
- Answer questions about StockZip features with confidence
- Reference specific help articles when explaining features (e.g., "See /help/stock-counts for step-by-step instructions")
- If asked about a specific feature, explain it clearly and suggest the relevant help page
- Be concise but thorough
- Use markdown formatting for clarity`
  }

  if (queryType === 'inventory') {
    // Inventory questions: More items, less documentation
    const itemCount = Math.min(context.length, 50)
    return `You are Zoe, a helpful AI assistant for StockZip inventory management.

Current Inventory Context (${itemCount} items):
${JSON.stringify(context.slice(0, itemCount), null, 2)}

Help Topics Available:
${getHelpTopicList()}

Guidelines:
- Provide specific numbers from the inventory data
- Mention item locations (folders) when relevant
- Suggest actions when appropriate (reorder, move, review)
- If a feature question arises, suggest visiting the help article (e.g., "For details on stock counts, see /help/stock-counts")
- Be concise and professional
- Use markdown formatting for lists and emphasis when helpful`
  }

  // Mixed questions: Balanced context
  const itemCount = Math.min(context.length, 35)
  return `You are Zoe, a helpful AI assistant for StockZip inventory management.

${FEATURE_SUMMARY}

${relevantTopics.length > 0 ? `Relevant Help Topics:\n${formatRelevantTopics(relevantTopics)}\n` : ''}
Current Inventory Context (${itemCount} items):
${JSON.stringify(context.slice(0, itemCount), null, 2)}

Guidelines:
- Balance feature explanations with inventory insights
- Reference help articles for detailed instructions (e.g., "See /help/labels for printing options")
- Provide specific data when inventory-related
- Be helpful, concise, and professional
- Use markdown formatting for clarity`
}

/**
 * Chat with AI about inventory using OpenRouter
 */
export async function inventoryChatOpenRouter(
  query: string,
  context: InventoryItem[],
  conversationHistory: { role: 'user' | 'model'; content: string }[] = [],
  queryType: QueryType = 'mixed'
): Promise<string> {
  const apiKey = getOpenRouterApiKey()
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const systemPrompt = buildSystemPrompt(query, context, queryType)

  // Convert history to OpenAI format
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user', content: query }
  ]

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://stockzip.app',
      'X-Title': 'StockZip - Ask Zoe'
    },
    body: JSON.stringify({
      model: MODEL,
      messages
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[OpenRouter] Error:', response.status, JSON.stringify(errorData))
    const errorMsg = errorData?.error?.message || errorData?.error || `HTTP ${response.status}`
    throw new Error(`OpenRouter: ${errorMsg}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenRouter: Empty response')
  }

  return content
}

/**
 * Chat with AI using extended context (activities, POs, tasks, etc.)
 * This is used for sophisticated queries that need more than just inventory data
 */
export async function inventoryChatOpenRouterWithContext(
  query: string,
  formattedContext: string,
  conversationHistory: { role: 'user' | 'model'; content: string }[] = [],
  queryType: QueryType = 'mixed'
): Promise<string> {
  const apiKey = getOpenRouterApiKey()
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const relevantTopics = findRelevantTopics(query)

  const systemPrompt = `You are Zoe, an intelligent AI assistant for StockZip inventory management. You have comprehensive knowledge of the tenant's operations.

${FEATURE_SUMMARY}

${relevantTopics.length > 0 ? `Relevant Help Topics:\n${formatRelevantTopics(relevantTopics)}\n` : ''}

## Your Knowledge Base (Tenant Data)

**IMPORTANT**: The "Overview" sections contain COMPLETE counts from the entire database. Use these for accurate totals.
The "Samples" and "Recent" sections show representative items - not the full list.

${formattedContext}

## Guidelines

1. **Use aggregates for totals**: When asked "how many items?", use the Overview numbers (they're complete)
2. **Be specific**: Use actual names, numbers, and dates from the data
3. **Answer directly**: If asked "who moved X", name the person and when
4. **Connect the dots**: Link related data (e.g., "John moved 5 items, mostly from Warehouse A")
5. **Suggest actions**: Recommend next steps when appropriate
6. **Reference help**: Point to relevant help articles for feature questions (e.g., "See /help/stock-counts")
7. **Be concise**: Keep answers focused and actionable
8. **Use markdown**: Format lists, bold important items, use tables for comparisons
9. **Clarify sample data**: If showing specific items, mention "Here are some examples:" rather than implying it's everything

## Query Type: ${queryType}
${queryType === 'feature' ? 'Focus on explaining features and referencing documentation.' : ''}
${queryType === 'inventory' ? 'Focus on providing specific data insights and recommendations.' : ''}
${queryType === 'mixed' ? 'Balance feature explanations with data insights.' : ''}`

  // Convert history to OpenAI format
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user', content: query }
  ]

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://stockzip.app',
      'X-Title': 'StockZip - Ask Zoe'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1500 // Allow longer responses for complex queries
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[OpenRouter] Error:', response.status, JSON.stringify(errorData))
    const errorMsg = errorData?.error?.message || errorData?.error || `HTTP ${response.status}`
    throw new Error(`OpenRouter: ${errorMsg}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenRouter: Empty response')
  }

  return content
}

// ============================================
// OPTIMIZED FUNCTIONS (using compressed context)
// ============================================

/**
 * Tiered system prompts for different query complexities
 */
type PromptTier = 'minimal' | 'standard' | 'extended'

function selectPromptTier(query: string, queryType: QueryType): PromptTier {
  // Simple greetings or very short queries
  if (query.length < 30 && /^(hi|hello|hey|thanks|ok|yes|no|sure)\b/i.test(query)) {
    return 'minimal'
  }

  // Feature questions need docs
  if (queryType === 'feature') return 'standard'

  // Complex inventory questions
  if (query.length > 100 || /\b(who|when|history|trend|compare|analysis)\b/i.test(query)) {
    return 'extended'
  }

  return 'standard'
}

/**
 * Build minimal prompt (for greetings, simple confirmations)
 * ~50 tokens
 */
function buildMinimalPromptOR(): string {
  return `You are Zoe, StockZip's friendly AI inventory assistant.
Be brief, helpful, and conversational.
For detailed help, suggest visiting /help.`
}

/**
 * Build standard prompt (most queries)
 * ~500-800 tokens
 */
function buildStandardPromptOR(
  query: string,
  context: string,
  queryType: QueryType
): string {
  const relevantTopics = findRelevantTopics(query, 2)

  const featureSection = queryType !== 'inventory' && relevantTopics.length > 0
    ? `\n## Relevant Features\n${formatRelevantTopics(relevantTopics)}`
    : ''

  return `You are Zoe, StockZip's AI inventory assistant.

${featureSection}
## Data
${context}

Guidelines:
- Use COMPLETE counts for totals (marked in Overview)
- Be specific with names, numbers, dates
- Keep responses under 150 words
- Use markdown for clarity
- Reference /help/* for feature details`
}

/**
 * Build extended prompt (complex queries)
 * ~1000-1500 tokens
 */
function buildExtendedPromptOR(
  query: string,
  context: string,
  queryType: QueryType
): string {
  const relevantTopics = findRelevantTopics(query, 3)

  const featureSection = queryType !== 'inventory'
    ? `\n## StockZip Features\n${FEATURE_SUMMARY}\n${relevantTopics.length > 0 ? `\nRelevant: ${formatRelevantTopics(relevantTopics)}` : ''}`
    : `\nHelp: ${getHelpTopicList()}`

  return `You are Zoe, an intelligent AI assistant for StockZip inventory management.

${featureSection}

## Your Knowledge Base
**Overview sections = COMPLETE counts (use for totals)**
**Samples = representative items (not full list)**

${context}

## Guidelines
1. Use aggregates for totals - they're complete
2. Be specific with names, numbers, dates
3. Connect related data (who did what, when, where)
4. Suggest actions when appropriate
5. Reference /help/* for features
6. Keep responses under 300 words
7. Use markdown formatting

Query Type: ${queryType}`
}

/**
 * OPTIMIZED: Chat with compressed context and managed history
 * Uses tiered prompts based on query complexity
 */
export async function inventoryChatOpenRouterOptimized(
  query: string,
  compressedContext: string,
  managedHistory: ManagedHistory,
  queryType: QueryType = 'mixed'
): Promise<string> {
  const apiKey = getOpenRouterApiKey()
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const tier = selectPromptTier(query, queryType)

  // Build prompt based on tier
  let systemPrompt: string
  let maxTokens: number

  switch (tier) {
    case 'minimal':
      systemPrompt = buildMinimalPromptOR()
      maxTokens = 500
      break
    case 'extended':
      systemPrompt = buildExtendedPromptOR(query, compressedContext, queryType)
      maxTokens = 1500
      break
    default:
      systemPrompt = buildStandardPromptOR(query, compressedContext, queryType)
      maxTokens = 1000
  }

  // Add conversation summary if exists
  if (managedHistory.summary) {
    systemPrompt = `[Earlier context: ${managedHistory.summary}]\n\n${systemPrompt}`
  }

  // Convert managed history to OpenAI format
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...managedHistory.recentMessages.map(msg => ({
      role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user', content: query }
  ]

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://stockzip.app',
      'X-Title': 'StockZip - Ask Zoe'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[OpenRouter] Error:', response.status, JSON.stringify(errorData))
    const errorMsg = errorData?.error?.message || errorData?.error || `HTTP ${response.status}`
    throw new Error(`OpenRouter: ${errorMsg}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenRouter: Empty response')
  }

  return content
}
