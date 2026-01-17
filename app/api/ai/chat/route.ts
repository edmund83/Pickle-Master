import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  inventoryChatOptimized,
  isGeminiConfigured,
} from '@/lib/ai/gemini'
import {
  inventoryChatOpenRouterOptimized,
  isOpenRouterConfigured,
} from '@/lib/ai/openrouter'
import { classifyQuery, needsExtendedContext } from '@/lib/ai/query-classifier'
import {
  fetchZoeContextOptimized,
  validateAiRequest,
} from '@/lib/ai/context-fetcher'
import {
  manageHistory,
  ChatMessage as HistoryChatMessage,
} from '@/lib/ai/history-manager'

interface ChatMessage {
  role: 'user' | 'model' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Parse request body first (before any DB calls)
    const { message, history } = (await request.json()) as {
      message: string
      history?: ChatMessage[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Validate message length
    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    // OPTIMIZED: Single RPC call for auth + rate limit + tenant
    // Replaces: auth check + profile query + rate limit check (3 calls -> 1)
    const validation = await validateAiRequest(supabase, 'ai_chat')

    if (!validation.allowed) {
      return NextResponse.json(
        { error: validation.error || 'Request not allowed', remaining: 0 },
        { status: validation.status }
      )
    }

    // OPTIMIZED: Manage conversation history with summarization
    // Replaces: 20 messages x 4000 chars with 6 recent + summary (~2500 tokens)
    const rawHistory: HistoryChatMessage[] = (history || [])
      .filter(
        (m): m is ChatMessage =>
          m != null &&
          typeof m === 'object' &&
          ['user', 'model', 'assistant'].includes(m.role) &&
          typeof m.content === 'string'
      )
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        content: m.content,
      })) as HistoryChatMessage[]

    const managedHistory = manageHistory(rawHistory, null, {
      maxRecentMessages: 6,
      maxTokenBudget: 2500,
      maxMessageLength: 2000,
    })

    // Determine which AI provider to use
    const hasGeminiKey = isGeminiConfigured()
    const hasOpenRouterKey = isOpenRouterConfigured()

    // Classify the query to determine context needs
    const queryType = classifyQuery(message)
    const useExtendedContext = needsExtendedContext(message)

    // If no AI provider is configured, return demo response
    if (!hasGeminiKey && !hasOpenRouterKey) {
      // OPTIMIZED: Use RPC for demo stats too (single call)
      try {
        const { context } = await fetchZoeContextOptimized(supabase, message, 30)
        const agg = context.aggregates

        return NextResponse.json({
          response: `Hello! I'm Zoe, your AI inventory assistant. Currently running in demo mode (no API key configured).

Here's what I can see in your inventory:
- **${agg.totalItems.toLocaleString()}** items tracked
- **${agg.lowStockCount.toLocaleString()}** items with low stock
- **${agg.outOfStockCount.toLocaleString()}** out of stock
- **$${agg.totalValue.toLocaleString()}** total inventory value

To enable full AI capabilities, add an \`OPENROUTER_API_KEY\` or \`GOOGLE_AI_API_KEY\` to your environment variables.

In the meantime, feel free to ask me questions like:
- "What items are low on stock?"
- "Show me inventory summary"
- "Which products need reordering?"`,
          demo: true,
        })
      } catch {
        // Fallback if RPC not yet deployed
        return NextResponse.json({
          response: `Hello! I'm Zoe, your AI inventory assistant. Currently running in demo mode.

To enable full AI capabilities, add an \`OPENROUTER_API_KEY\` or \`GOOGLE_AI_API_KEY\` to your environment variables.`,
          demo: true,
        })
      }
    }

    // OPTIMIZED: Single RPC call for all context
    // Replaces: 7+ parallel queries with 1 RPC call
    // Uses compact formatting (50-60% token reduction)
    let response: string

    try {
      const { formatted: formattedContext } = await fetchZoeContextOptimized(
        supabase,
        message,
        useExtendedContext ? 30 : 7 // Shorter history for simple queries
      )

      // Call optimized AI functions with compressed context and managed history
      if (hasGeminiKey) {
        response = await inventoryChatOptimized(
          message,
          formattedContext,
          managedHistory,
          queryType
        )
      } else {
        response = await inventoryChatOpenRouterOptimized(
          message,
          formattedContext,
          managedHistory,
          queryType
        )
      }
    } catch (rpcError) {
      // Fallback to legacy fetch if RPC not deployed yet
      console.warn('RPC not available, using legacy fetch:', rpcError)

      // Import legacy functions dynamically
      const { fetchZoeContext, formatContextForPrompt } = await import(
        '@/lib/ai/context-fetcher'
      )
      const { inventoryChat, inventoryChatWithContext } = await import(
        '@/lib/ai/gemini'
      )
      const { inventoryChatOpenRouter, inventoryChatOpenRouterWithContext } =
        await import('@/lib/ai/openrouter')

      // Legacy flow (will be removed after migration)
      const legacyHistory = managedHistory.recentMessages.map((m) => ({
        role: m.role as 'user' | 'model',
        content: m.content,
      }))

      if (useExtendedContext) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const zoeContext = await fetchZoeContext(
          supabase as any,
          validation.tenantId!,
          message,
          30
        )
        const formattedContext = formatContextForPrompt(zoeContext)

        if (hasGeminiKey) {
          response = await inventoryChatWithContext(
            message,
            formattedContext,
            legacyHistory,
            queryType
          )
        } else {
          response = await inventoryChatOpenRouterWithContext(
            message,
            formattedContext,
            legacyHistory,
            queryType
          )
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: items } = await (supabase as any)
          .from('inventory_items')
          .select(
            `id, name, sku, quantity, min_quantity, price, status, updated_at, folders(name)`
          )
          .eq('tenant_id', validation.tenantId)
          .is('deleted_at', null)
          .order('updated_at', { ascending: false })
          .limit(50)

        const inventoryContext = (items || []).map(
          (item: {
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
          })
        )

        if (hasGeminiKey) {
          response = await inventoryChat(
            message,
            inventoryContext,
            legacyHistory,
            queryType
          )
        } else {
          response = await inventoryChatOpenRouter(
            message,
            inventoryContext,
            legacyHistory,
            queryType
          )
        }
      }
    }

    return NextResponse.json({
      response,
      remaining: validation.remaining,
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to process chat message: ${errorMessage}` },
      { status: 500 }
    )
  }
}
