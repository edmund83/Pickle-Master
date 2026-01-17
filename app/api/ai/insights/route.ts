import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeInventory, InventoryItem } from '@/lib/ai/gemini'
import { checkRateLimit, RATE_LIMITED_OPERATIONS } from '@/lib/rate-limit'
import {
  checkAiUsageLimit,
  trackAiUsage,
  estimateCost,
} from '@/lib/ai/usage-tracking'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const rateLimitResult = await checkRateLimit(RATE_LIMITED_OPERATIONS.AI_INSIGHTS)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded', remaining: 0 },
        { status: 429 }
      )
    }

    // Check cost-based usage limit ($0.05/month per user)
    // Insights use more tokens (~1500 input for inventory data, ~300 output)
    const estimatedCostUsd = estimateCost(1500, 300, 'gemini-1.5-flash')
    const usageCheck = await checkAiUsageLimit(estimatedCostUsd)

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.error || 'Monthly AI usage limit reached',
          usage: usageCheck.usage,
        },
        { status: usageCheck.status }
      )
    }

    // Fetch inventory items for analysis
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items, error: itemsError } = await (supabase as any)
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
      .limit(100)

    if (itemsError) {
      console.error('Error fetching items:', itemsError)
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
    }

    // Transform items for AI analysis
    const inventoryItems: InventoryItem[] = (items || []).map((item: {
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

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
      // Return demo insights when no API key is configured
      return NextResponse.json({
        insights: [
          {
            title: 'AI Not Configured',
            description: 'Set GOOGLE_AI_API_KEY in environment to enable AI insights',
            severity: 'low',
            actionType: 'review'
          },
          {
            title: `${inventoryItems.filter(i => i.status === 'low_stock').length} Low Stock Items`,
            description: 'Review items below minimum quantity threshold',
            severity: inventoryItems.filter(i => i.status === 'low_stock').length > 5 ? 'high' : 'medium',
            actionType: 'reorder'
          },
          {
            title: `${inventoryItems.length} Items Tracked`,
            description: 'Your inventory is being monitored for changes',
            severity: 'low',
            actionType: 'review'
          }
        ],
        demo: true
      })
    }

    // Analyze inventory with AI
    const insights = await analyzeInventory(inventoryItems)

    // Track usage after successful AI call
    // Estimate: ~1500 input tokens (inventory data), ~300 output tokens (3 insights)
    trackAiUsage(1500, 300, 'gemini-1.5-flash', 'ai_insights').catch((err) =>
      console.error('Failed to track AI usage:', err)
    )

    return NextResponse.json({
      insights,
      usage: usageCheck.usage,
      warning: usageCheck.warning,
    })
  } catch (error) {
    console.error('AI Insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
