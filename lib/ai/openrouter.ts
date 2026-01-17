/**
 * OpenRouter AI client for inventory chat
 * Uses OpenAI-compatible API
 */

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
 * Chat with AI about inventory using OpenRouter
 */
export async function inventoryChatOpenRouter(
  query: string,
  context: InventoryItem[],
  conversationHistory: { role: 'user' | 'model'; content: string }[] = []
): Promise<string> {
  const apiKey = getOpenRouterApiKey()
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const systemPrompt = `You are Zoe, a helpful AI inventory assistant for StockZip inventory management system.

Current Inventory Context (sample of items):
${JSON.stringify(context.slice(0, 50), null, 2)}

Guidelines:
- Be concise and professional
- When asked about stock levels, provide specific numbers
- When asked about items, mention their location (folder) if available
- Suggest actions when appropriate (reorder, move, review)
- If you can't find specific information, say so clearly
- Keep responses under 200 words unless the user asks for details
- Use markdown formatting for lists and emphasis when helpful`

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
