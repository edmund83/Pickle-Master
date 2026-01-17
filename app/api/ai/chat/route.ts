import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inventoryChat, InventoryItem } from '@/lib/ai/gemini'
import { inventoryChatOpenRouter, isOpenRouterConfigured } from '@/lib/ai/openrouter'
import { checkRateLimit, RATE_LIMITED_OPERATIONS } from '@/lib/rate-limit'

interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const { message, history } = await request.json() as {
      message: string
      history?: ChatMessage[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Validate message length
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 })
    }

    // Validate and sanitize history
    const sanitizedHistory: ChatMessage[] = (history || [])
      .filter((m): m is ChatMessage =>
        m != null &&
        typeof m === 'object' &&
        ['user', 'model'].includes(m.role) &&
        typeof m.content === 'string'
      )
      .slice(-20) // Limit to last 20 messages
      .map(m => ({
        role: m.role,
        content: m.content.slice(0, 4000) // Limit content length per message
      }))

    // Get user's tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 400 })
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(RATE_LIMITED_OPERATIONS.AI_CHAT)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded', remaining: 0 },
        { status: 429 }
      )
    }

    // Fetch inventory context for the AI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items } = await (supabase as any)
      .from('inventory_items')
      .select(`
        id,
        name,
        sku,
        quantity,
        min_quantity,
        price,
        status,
        updated_at,
        folders(name)
      `)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(50)

    // Transform items for AI context
    const inventoryContext: InventoryItem[] = (items || []).map((item: {
      id: string
      name: string
      sku?: string
      quantity: number
      min_quantity?: number
      price?: number
      status: string
      updated_at?: string
      folders?: { name: string }
    }) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      min_quantity: item.min_quantity,
      price: item.price,
      status: item.status,
      folder_name: item.folders?.name,
      updated_at: item.updated_at,
    }))

    // Determine which AI provider to use
    const hasGeminiKey = !!(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY)
    const hasOpenRouterKey = isOpenRouterConfigured()

    // If no AI provider is configured, return demo response
    if (!hasGeminiKey && !hasOpenRouterKey) {
      const lowStockCount = inventoryContext.filter(i => i.status === 'low_stock').length
      const totalItems = inventoryContext.length

      return NextResponse.json({
        response: `Hello! I'm Zoe, your AI inventory assistant. Currently running in demo mode (no API key configured).

Here's what I can see in your inventory:
- **${totalItems}** items tracked
- **${lowStockCount}** items with low stock

To enable full AI capabilities, add an \`OPENROUTER_API_KEY\` or \`GOOGLE_AI_API_KEY\` to your environment variables.

In the meantime, feel free to ask me questions like:
- "What items are low on stock?"
- "Show me inventory summary"
- "Which products need reordering?"`,
        demo: true
      })
    }

    // Get AI response - prefer Gemini, fallback to OpenRouter
    let response: string
    if (hasGeminiKey) {
      response = await inventoryChat(
        message,
        inventoryContext,
        sanitizedHistory
      )
    } else {
      response = await inventoryChatOpenRouter(
        message,
        inventoryContext,
        sanitizedHistory
      )
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI Chat error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to process chat message: ${errorMessage}` },
      { status: 500 }
    )
  }
}
