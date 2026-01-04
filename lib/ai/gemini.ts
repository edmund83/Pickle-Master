import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

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
 * Chat with AI about inventory queries
 */
export async function inventoryChat(
  query: string,
  context: InventoryItem[],
  conversationHistory: { role: 'user' | 'model'; content: string }[] = []
): Promise<string> {
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const systemPrompt = `You are StockZip AI, a helpful Warehouse Assistant for StockZip inventory management system.

Current Inventory Context (sample of items):
${JSON.stringify(context.slice(0, 50), null, 2)}

Guidelines:
- Be concise and professional
- When asked about stock levels, provide specific numbers
- When asked about items, mention their location (folder) if available
- Suggest actions when appropriate (reorder, move, review)
- If you can't find specific information, say so clearly
- Keep responses under 200 words unless the user asks for details
- Use markdown formatting for lists and emphasis when helpful

User Query: ${query}`

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
