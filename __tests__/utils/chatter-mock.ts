import { vi } from 'vitest'
import type {
    ChatterMessage,
    ChatterReply,
    ChatterFollower,
    TeamMember,
    ChatterEntityType,
    ActionResult
} from '@/app/actions/chatter'

// Test tenant and user IDs
export const TEST_TENANT_ID = '00000000-0000-0000-0000-000000000001'
export const OTHER_TENANT_ID = '00000000-0000-0000-0000-000000000099'
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000002'
export const OTHER_USER_ID = '00000000-0000-0000-0000-000000000003'
export const THIRD_USER_ID = '00000000-0000-0000-0000-000000000004'

// Test entity types
export const ENTITY_TYPES: ChatterEntityType[] = [
    'item',
    'purchase_order',
    'stock_count',
    'pick_list',
    'receive'
]

// Test entity IDs by type
export const TEST_ENTITIES: Record<ChatterEntityType, string> = {
    item: 'test-item-001',
    checkout: 'test-checkout-001',
    purchase_order: 'test-po-001',
    stock_count: 'test-sc-001',
    pick_list: 'test-pl-001',
    receive: 'test-rec-001'
}

// Test team members
export const testTeamMembers: TeamMember[] = [
    {
        user_id: TEST_USER_ID,
        user_name: 'Alice Smith',
        user_email: 'alice@example.com',
        user_avatar: null
    },
    {
        user_id: OTHER_USER_ID,
        user_name: 'Bob Johnson',
        user_email: 'bob@example.com',
        user_avatar: 'https://example.com/bob.jpg'
    },
    {
        user_id: THIRD_USER_ID,
        user_name: 'Charlie Brown',
        user_email: 'charlie@example.com',
        user_avatar: null
    }
]

// Other tenant team members (for isolation testing)
export const otherTenantMembers: TeamMember[] = [
    {
        user_id: '00000000-0000-0000-0000-000000000098',
        user_name: 'Eve External',
        user_email: 'eve@other.com',
        user_avatar: null
    }
]

// Create test messages
export function createTestMessage(overrides: Partial<ChatterMessage> = {}): ChatterMessage {
    const now = new Date().toISOString()
    return {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: 'Test message content',
        author_id: TEST_USER_ID,
        author_name: 'Alice Smith',
        author_email: 'alice@example.com',
        author_avatar: null,
        parent_id: null,
        is_system_message: false,
        created_at: now,
        edited_at: null,
        reply_count: 0,
        mentions: [],
        ...overrides
    }
}

// Create test replies
export function createTestReply(parentId: string, overrides: Partial<ChatterReply> = {}): ChatterReply {
    const now = new Date().toISOString()
    return {
        id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: 'Test reply content',
        author_id: OTHER_USER_ID,
        author_name: 'Bob Johnson',
        author_email: 'bob@example.com',
        author_avatar: 'https://example.com/bob.jpg',
        parent_id: parentId,
        is_system_message: false,
        created_at: now,
        edited_at: null,
        mentions: [],
        ...overrides
    }
}

// Create test follower
export function createTestFollower(overrides: Partial<ChatterFollower> = {}): ChatterFollower {
    const now = new Date().toISOString()
    return {
        user_id: TEST_USER_ID,
        user_name: 'Alice Smith',
        user_email: 'alice@example.com',
        user_avatar: null,
        notify_email: true,
        notify_in_app: true,
        notify_push: false,
        followed_at: now,
        ...overrides
    }
}

// Test messages dataset
export const testMessages: ChatterMessage[] = [
    createTestMessage({
        id: 'msg-001',
        content: 'First message about this item',
        author_id: TEST_USER_ID,
        author_name: 'Alice Smith',
        reply_count: 2,
        created_at: '2024-01-01T10:00:00Z'
    }),
    createTestMessage({
        id: 'msg-002',
        content: 'Hey @Bob Johnson, check this out!',
        author_id: TEST_USER_ID,
        author_name: 'Alice Smith',
        mentions: [{ user_id: OTHER_USER_ID, user_name: 'Bob Johnson' }],
        created_at: '2024-01-01T11:00:00Z'
    }),
    createTestMessage({
        id: 'msg-003',
        content: 'This is a system message',
        author_id: TEST_USER_ID,
        author_name: 'System',
        is_system_message: true,
        created_at: '2024-01-01T12:00:00Z'
    }),
    createTestMessage({
        id: 'msg-004',
        content: 'An edited message',
        author_id: OTHER_USER_ID,
        author_name: 'Bob Johnson',
        author_avatar: 'https://example.com/bob.jpg',
        edited_at: '2024-01-02T10:00:00Z',
        created_at: '2024-01-02T09:00:00Z'
    })
]

// Test replies dataset
export const testReplies: ChatterReply[] = [
    createTestReply('msg-001', {
        id: 'reply-001',
        content: 'Great point, Alice!',
        author_id: OTHER_USER_ID,
        author_name: 'Bob Johnson',
        created_at: '2024-01-01T10:30:00Z'
    }),
    createTestReply('msg-001', {
        id: 'reply-002',
        content: 'I agree with @Bob Johnson',
        author_id: THIRD_USER_ID,
        author_name: 'Charlie Brown',
        mentions: [{ user_id: OTHER_USER_ID, user_name: 'Bob Johnson' }],
        created_at: '2024-01-01T10:45:00Z'
    })
]

// Test followers dataset
export const testFollowers: ChatterFollower[] = [
    createTestFollower({
        user_id: TEST_USER_ID,
        user_name: 'Alice Smith',
        notify_in_app: true,
        notify_email: true,
        notify_push: false,
        followed_at: '2024-01-01T00:00:00Z'
    }),
    createTestFollower({
        user_id: OTHER_USER_ID,
        user_name: 'Bob Johnson',
        user_avatar: 'https://example.com/bob.jpg',
        notify_in_app: true,
        notify_email: false,
        notify_push: true,
        followed_at: '2024-01-02T00:00:00Z'
    })
]

// Mock Supabase query builder for chatter
export interface MockChatterQueryBuilder {
    select: ReturnType<typeof vi.fn>
    eq: ReturnType<typeof vi.fn>
    neq: ReturnType<typeof vi.fn>
    is: ReturnType<typeof vi.fn>
    in: ReturnType<typeof vi.fn>
    order: ReturnType<typeof vi.fn>
    limit: ReturnType<typeof vi.fn>
    single: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    upsert: ReturnType<typeof vi.fn>
    then: ReturnType<typeof vi.fn>
}

export function createMockChatterQueryBuilder(data: unknown, error: Error | null = null): MockChatterQueryBuilder {
    const builder: MockChatterQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data, error }),
        insert: vi.fn().mockResolvedValue({ data, error }),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockResolvedValue({ data, error }),
        then: vi.fn((resolve) => resolve({ data, error })),
    }

    // Make all chainable methods return the builder
    Object.keys(builder).forEach(key => {
        if (!['single', 'then', 'insert', 'upsert'].includes(key)) {
            (builder as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(builder)
        }
    })

    return builder
}

// Mock Supabase client for chatter tests
export interface MockChatterSupabaseClient {
    auth: {
        getUser: ReturnType<typeof vi.fn>
    }
     
    from: ReturnType<typeof vi.fn> & ((table: string) => any)
     
    rpc: ReturnType<typeof vi.fn> & ((fn: string, params?: any) => any)
}

export function createMockChatterClient(options: {
    user?: { id: string } | null
    profile?: { tenant_id: string; full_name?: string; email?: string } | null
    messages?: ChatterMessage[]
    replies?: ChatterReply[]
    followers?: ChatterFollower[]
    teamMembers?: TeamMember[]
    rpcOverrides?: Record<string, unknown>
    rpcErrors?: Record<string, string>
} = {}): MockChatterSupabaseClient {
    const {
        user = { id: TEST_USER_ID },
        profile = { tenant_id: TEST_TENANT_ID, full_name: 'Alice Smith', email: 'alice@example.com' },
        messages = testMessages,
        replies = testReplies,
        followers = testFollowers,
        teamMembers = testTeamMembers,
        rpcOverrides = {},
        rpcErrors = {}
    } = options

    const client: MockChatterSupabaseClient = {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user },
                error: null,
            }),
        },
        from: vi.fn((table: string) => {
            switch (table) {
                case 'profiles':
                    return createMockChatterQueryBuilder(profile)
                case 'chatter_messages':
                    return createMockChatterQueryBuilder(messages)
                case 'entity_followers':
                    return createMockChatterQueryBuilder(followers)
                case 'notifications':
                    return createMockChatterQueryBuilder([])
                default:
                    return createMockChatterQueryBuilder([])
            }
        }),
        rpc: vi.fn((functionName: string, params?: Record<string, unknown>) => {
            // Check for RPC errors
            if (rpcErrors[functionName]) {
                return Promise.resolve({
                    data: null,
                    error: { message: rpcErrors[functionName] }
                })
            }

            // Check for custom overrides
            if (rpcOverrides[functionName] !== undefined) {
                return Promise.resolve({
                    data: rpcOverrides[functionName],
                    error: null
                })
            }

            // Default RPC responses
            switch (functionName) {
                case 'get_entity_messages':
                    return Promise.resolve({ data: messages, error: null })
                case 'get_message_replies':
                    const messageId = params?.p_message_id
                    const filteredReplies = replies.filter(r => r.parent_id === messageId)
                    return Promise.resolve({ data: filteredReplies, error: null })
                case 'post_chatter_message':
                    return Promise.resolve({ data: `msg-${Date.now()}`, error: null })
                case 'get_entity_followers':
                    return Promise.resolve({ data: followers, error: null })
                case 'is_following_entity':
                    return Promise.resolve({
                        data: followers.some(f => f.user_id === user?.id),
                        error: null
                    })
                case 'get_team_members_for_mention':
                    const query = params?.p_search_query?.toLowerCase() || ''
                    const filteredMembers = teamMembers.filter(m =>
                        !query ||
                        m.user_name.toLowerCase().includes(query) ||
                        m.user_email.toLowerCase().includes(query)
                    )
                    return Promise.resolve({ data: filteredMembers, error: null })
                case 'get_unread_mentions_count':
                    return Promise.resolve({ data: 0, error: null })
                case 'mark_mentions_read':
                    return Promise.resolve({ data: 0, error: null })
                default:
                    return Promise.resolve({ data: null, error: null })
            }
        }),
    }

    return client
}

// Helper: Wrap action result
export function successResult<T>(data: T): ActionResult<T> {
    return { success: true, data }
}

export function errorResult(error: string): ActionResult<never> {
    return { success: false, error }
}

// Helper: Simulate message validation
export function validateMessageContent(content: string): string | null {
    if (!content || content.trim() === '') {
        return 'Message content cannot be empty'
    }
    if (content.length > 10000) {
        return 'Message content exceeds maximum length'
    }
    return null
}

// Helper: Extract mentions from content
export function extractMentions(content: string): string[] {
    const mentionPattern = /@(\S+)/g
    const matches = content.match(mentionPattern)
    return matches ? matches.map(m => m.slice(1)) : []
}

// Helper: Escape special characters for XSS testing
export function containsXSSPattern(content: string): boolean {
    const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /<img[^>]+onerror/i
    ]
    return xssPatterns.some(pattern => pattern.test(content))
}

// Helper: Generate long content for testing
export function generateLongContent(length: number): string {
    const base = 'This is test content. '
    return base.repeat(Math.ceil(length / base.length)).slice(0, length)
}

// Helper: Test data for various entity types
export function getTestEntityForType(entityType: ChatterEntityType): {
    id: string
    name: string
    path: string
} {
    const entities = {
        item: {
            id: 'test-item-001',
            name: 'Test Laptop',
            path: '/inventory/test-item-001'
        },
        checkout: {
            id: 'test-checkout-001',
            name: 'CHK-2024-001',
            path: '/tasks/checkouts/test-checkout-001'
        },
        purchase_order: {
            id: 'test-po-001',
            name: 'PO-2024-001',
            path: '/tasks/purchase-orders/test-po-001'
        },
        stock_count: {
            id: 'test-sc-001',
            name: 'SC-2024-001',
            path: '/tasks/stock-count/test-sc-001'
        },
        pick_list: {
            id: 'test-pl-001',
            name: 'PL-2024-001',
            path: '/tasks/pick-lists/test-pl-001'
        },
        receive: {
            id: 'test-rec-001',
            name: 'REC-2024-001',
            path: '/tasks/receives/test-rec-001'
        }
    }
    return entities[entityType]
}
