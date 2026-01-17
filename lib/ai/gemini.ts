import { GoogleGenerativeAI } from '@google/generative-ai'
import { QueryType } from './query-classifier'
import {
  FEATURE_SUMMARY,
  getHelpTopicList,
  findRelevantTopics,
  formatRelevantTopics
} from './help-knowledge'
import { ManagedHistory, formatHistoryForPrompt } from './history-manager'

/**
 * Check if Gemini is configured
 */
export function isGeminiConfigured(): boolean {
  return !!(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY)
}

// Ensure this is only called server-side
const getGeminiClient = () => {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable')
  }
  return new GoogleGenerativeAI(apiKey)
}

export interface InventoryInsight {
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  actionType?: 'reorder' | 'move' | 'review' | 'alert'
}

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

/**
 * Analyze inventory data and return AI-generated insights
 */
export async function analyzeInventory(items: InventoryItem[]): Promise<InventoryInsight[]> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are an expert Warehouse Consultant analyzing inventory data for StockZip, an inventory management system.

Analyze this inventory data and provide the top 3 most important, actionable insights. Focus on:
1. Low stock alerts - items below minimum quantity thresholds
2. Stock optimization suggestions - items that might need reordering
3. Aging or stale inventory - items that haven't moved recently
4. Value at risk - high-value items with low stock

Data: ${JSON.stringify(items.slice(0, 100))}

Respond with a JSON array of exactly 3 insights. Each insight should have:
- title: A short, clear title (max 50 chars)
- description: A specific, actionable description (max 150 chars)
- severity: "low", "medium", or "high"
- actionType: one of "reorder", "move", "review", or "alert"

Example format:
[{"title": "Low Stock Alert", "description": "5 items below minimum threshold need reordering", "severity": "high", "actionType": "reorder"}]

Return ONLY the JSON array, no other text.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Clean up the response - remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const insights = JSON.parse(cleanedText) as InventoryInsight[]
    return insights.slice(0, 3)
  } catch (error) {
    console.error('Error analyzing inventory:', error)
    // Return fallback insights
    return [
      {
        title: 'Analysis Unavailable',
        description: 'Unable to analyze inventory at this time. Please try again later.',
        severity: 'low',
        actionType: 'review'
      }
    ]
  }
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
- Use markdown formatting for clarity

User Query: ${query}`
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
- Use markdown formatting for lists and emphasis when helpful

User Query: ${query}`
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
- Use markdown formatting for clarity

User Query: ${query}`
}

/**
 * Chat with AI about inventory queries (basic inventory context)
 */
export async function inventoryChat(
  query: string,
  context: InventoryItem[],
  conversationHistory: { role: 'user' | 'model'; content: string }[] = [],
  queryType: QueryType = 'mixed'
): Promise<string> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const systemPrompt = buildSystemPrompt(query, context, queryType)

  try {
    // Build conversation for chat
    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      }
    })

    const result = await chat.sendMessage(systemPrompt)
    return result.response.text()
  } catch (error) {
    console.error('Error in inventory chat:', error)
    return 'I apologize, but I encountered an error processing your request. Please try again.'
  }
}

/**
 * Chat with AI using extended context (activities, POs, tasks, etc.)
 * This is used for sophisticated queries that need more than just inventory data
 */
export async function inventoryChatWithContext(
  query: string,
  formattedContext: string,
  conversationHistory: { role: 'user' | 'model'; content: string }[] = [],
  queryType: QueryType = 'mixed'
): Promise<string> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
${queryType === 'mixed' ? 'Balance feature explanations with data insights.' : ''}

User Query: ${query}`

  try {
    const chat = model.startChat({
      history: conversationHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 1500, // Allow longer responses for complex queries
      }
    })

    const result = await chat.sendMessage(systemPrompt)
    return result.response.text()
  } catch (error) {
    console.error('Error in inventory chat with context:', error)
    return 'I apologize, but I encountered an error processing your request. Please try again.'
  }
}

/**
 * Extract product information from a label image
 */
export async function scanLabel(base64Image: string, mimeType: string = 'image/jpeg'): Promise<{
  productName?: string
  sku?: string
  quantity?: number
  price?: number
  barcode?: string
}> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Extract product information from this packing slip, label, or barcode image.

Return a JSON object with any of these fields you can identify:
- productName: The product name
- sku: The SKU or product code
- quantity: The quantity (as a number)
- price: The price (as a number, without currency symbol)
- barcode: Any barcode number visible

Return ONLY the raw JSON object, no other text. If you can't identify a field, omit it.

Example: {"productName": "Widget A", "sku": "WDG-001", "quantity": 10}`

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType
        }
      },
      prompt
    ])

    const text = result.response.text()
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    return JSON.parse(cleanedText)
  } catch (error) {
    console.error('Error scanning label:', error)
    return {}
  }
}

/**
 * Generate a summary report of inventory status
 */
export async function generateInventorySummary(items: InventoryItem[]): Promise<string> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const totalItems = items.length
  const lowStock = items.filter(i => i.status === 'low_stock').length
  const outOfStock = items.filter(i => i.status === 'out_of_stock').length
  const totalValue = items.reduce((sum, i) => sum + (i.quantity * (i.price || 0)), 0)

  const prompt = `Generate a brief executive summary for this inventory status:

- Total Items: ${totalItems}
- Low Stock Items: ${lowStock}
- Out of Stock Items: ${outOfStock}
- Total Inventory Value: $${totalValue.toLocaleString()}

Sample items: ${JSON.stringify(items.slice(0, 20))}

Write a 2-3 sentence professional summary highlighting key concerns and recommended actions.
Keep it concise and actionable. Do not use markdown.`

  try {
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Error generating summary:', error)
    return `Your inventory contains ${totalItems} items with ${lowStock} low stock and ${outOfStock} out of stock items requiring attention.`
  }
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
function buildMinimalPrompt(): string {
  return `You are Zoe, StockZip's friendly AI inventory assistant.
Be brief, helpful, and conversational.
For detailed help, suggest visiting /help.`
}

/**
 * Build standard prompt (most queries)
 * ~500-800 tokens
 */
function buildStandardPrompt(
  query: string,
  context: string,
  queryType: QueryType
): string {
  const relevantTopics = findRelevantTopics(query, 2) // Limit to 2 topics

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
- Reference /help/* for feature details

Query: ${query}`
}

/**
 * Build extended prompt (complex queries)
 * ~1000-1500 tokens
 */
function buildExtendedPrompt(
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

Query Type: ${queryType}
User: ${query}`
}

/**
 * OPTIMIZED: Chat with compressed context and managed history
 * Uses tiered prompts based on query complexity
 */
export async function inventoryChatOptimized(
  query: string,
  compressedContext: string,
  managedHistory: ManagedHistory,
  queryType: QueryType = 'mixed'
): Promise<string> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const tier = selectPromptTier(query, queryType)

  // Build prompt based on tier
  let systemPrompt: string
  let maxTokens: number

  switch (tier) {
    case 'minimal':
      systemPrompt = buildMinimalPrompt() + `\n\nUser: ${query}`
      maxTokens = 500
      break
    case 'extended':
      systemPrompt = buildExtendedPrompt(query, compressedContext, queryType)
      maxTokens = 1500
      break
    default:
      systemPrompt = buildStandardPrompt(query, compressedContext, queryType)
      maxTokens = 1000
  }

  // Add conversation summary if exists
  if (managedHistory.summary) {
    systemPrompt = `[Earlier context: ${managedHistory.summary}]\n\n${systemPrompt}`
  }

  try {
    // Build conversation history for chat
    const historyMessages = managedHistory.recentMessages.map(msg => ({
      role: msg.role as 'user' | 'model',
      parts: [{ text: msg.content }]
    }))

    const chat = model.startChat({
      history: historyMessages,
      generationConfig: {
        maxOutputTokens: maxTokens,
      }
    })

    const result = await chat.sendMessage(systemPrompt)
    return result.response.text()
  } catch (error) {
    console.error('Error in optimized inventory chat:', error)
    return 'I apologize, but I encountered an error processing your request. Please try again.'
  }
}
