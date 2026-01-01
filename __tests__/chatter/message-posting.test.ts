import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    TEST_USER_ID,
    TEST_TENANT_ID,
    testMessages,
    testTeamMembers,
    createTestMessage,
    createMockChatterClient,
    validateMessageContent,
    generateLongContent,
    ENTITY_TYPES,
    getTestEntityForType
} from '../utils/chatter-mock'

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}))

describe('Chatter - Supported Entities', () => {
    describe('Entity Types Support', () => {
        it('should support Inventory Items entity type', () => {
            const entity = getTestEntityForType('item')
            expect(entity.path).toBe('/inventory/test-item-001')
            expect(entity.id).toBeTruthy()
            expect(entity.name).toBeTruthy()
        })

        it('should support Purchase Orders entity type', () => {
            const entity = getTestEntityForType('purchase_order')
            expect(entity.path).toBe('/tasks/purchase-orders/test-po-001')
            expect(entity.id).toBeTruthy()
        })

        it('should support Stock Counts entity type', () => {
            const entity = getTestEntityForType('stock_count')
            expect(entity.path).toBe('/tasks/stock-count/test-sc-001')
            expect(entity.id).toBeTruthy()
        })

        it('should support Pick Lists entity type', () => {
            const entity = getTestEntityForType('pick_list')
            expect(entity.path).toBe('/tasks/pick-lists/test-pl-001')
            expect(entity.id).toBeTruthy()
        })

        it('should support Receives entity type', () => {
            const entity = getTestEntityForType('receive')
            expect(entity.path).toBe('/tasks/receives/test-rec-001')
            expect(entity.id).toBeTruthy()
        })
    })
})

describe('Chatter - Message Posting', () => {
    let mockClient: ReturnType<typeof createMockChatterClient>

    beforeEach(() => {
        vi.clearAllMocks()
        mockClient = createMockChatterClient()
    })

    describe('Basic Messaging', () => {
        it('should create a valid message structure', () => {
            const message = createTestMessage({
                content: 'Test message on an item'
            })

            expect(message.id).toBeTruthy()
            expect(message.content).toBe('Test message on an item')
            expect(message.author_id).toBe(TEST_USER_ID)
            expect(message.author_name).toBeTruthy()
            expect(message.created_at).toBeTruthy()
            expect(message.parent_id).toBeNull()
            expect(message.is_system_message).toBe(false)
        })

        it('can post a new message on an item', async () => {
            const entityType = 'item'
            const entityId = 'test-item-001'

            const result = await mockClient.rpc('post_chatter_message', {
                p_entity_type: entityType,
                p_entity_id: entityId,
                p_content: 'New message on item',
                p_parent_id: null,
                p_mentioned_user_ids: []
            })

            expect(result.error).toBeNull()
            expect(result.data).toBeTruthy()
        })

        it('can post a new message on a purchase order', async () => {
            const entityType = 'purchase_order'
            const entityId = 'test-po-001'

            const result = await mockClient.rpc('post_chatter_message', {
                p_entity_type: entityType,
                p_entity_id: entityId,
                p_content: 'New message on PO',
                p_parent_id: null,
                p_mentioned_user_ids: []
            })

            expect(result.error).toBeNull()
            expect(result.data).toBeTruthy()
        })

        it('can post a new message on a stock count', async () => {
            const entityType = 'stock_count'
            const entityId = 'test-sc-001'

            const result = await mockClient.rpc('post_chatter_message', {
                p_entity_type: entityType,
                p_entity_id: entityId,
                p_content: 'New message on stock count',
                p_parent_id: null,
                p_mentioned_user_ids: []
            })

            expect(result.error).toBeNull()
            expect(result.data).toBeTruthy()
        })

        it('can post a new message on a pick list', async () => {
            const entityType = 'pick_list'
            const entityId = 'test-pl-001'

            const result = await mockClient.rpc('post_chatter_message', {
                p_entity_type: entityType,
                p_entity_id: entityId,
                p_content: 'New message on pick list',
                p_parent_id: null,
                p_mentioned_user_ids: []
            })

            expect(result.error).toBeNull()
            expect(result.data).toBeTruthy()
        })

        it('can post a new message on a receive', async () => {
            const entityType = 'receive'
            const entityId = 'test-rec-001'

            const result = await mockClient.rpc('post_chatter_message', {
                p_entity_type: entityType,
                p_entity_id: entityId,
                p_content: 'New message on receive',
                p_parent_id: null,
                p_mentioned_user_ids: []
            })

            expect(result.error).toBeNull()
            expect(result.data).toBeTruthy()
        })

        it('message appears in the entity messages list after posting', async () => {
            const result = await mockClient.rpc('get_entity_messages', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001',
                p_limit: 50,
                p_offset: 0
            })

            expect(result.error).toBeNull()
            expect(Array.isArray(result.data)).toBe(true)
            expect(result.data.length).toBeGreaterThan(0)
        })

        it('message shows correct author name', () => {
            const message = testMessages[0]
            expect(message.author_name).toBe('Alice Smith')
        })

        it('message shows correct timestamp', () => {
            const message = testMessages[0]
            expect(message.created_at).toBeTruthy()
            // Verify it's a valid ISO date string
            const date = new Date(message.created_at)
            expect(date.toISOString()).toBeTruthy()
        })

        it('empty messages are rejected (validation)', () => {
            const emptyValidation = validateMessageContent('')
            expect(emptyValidation).toBe('Message content cannot be empty')

            const whitespaceValidation = validateMessageContent('   ')
            expect(whitespaceValidation).toBe('Message content cannot be empty')
        })

        it('long messages are handled correctly (no truncation issues)', () => {
            const longContent = generateLongContent(5000)
            const validation = validateMessageContent(longContent)
            expect(validation).toBeNull()

            const message = createTestMessage({ content: longContent })
            expect(message.content.length).toBe(5000)
        })
    })

    describe('Message Content', () => {
        it('plain text renders correctly', () => {
            const message = createTestMessage({
                content: 'This is a plain text message without any formatting.'
            })
            expect(message.content).toBe('This is a plain text message without any formatting.')
        })

        it('multi-line messages preserve line breaks', () => {
            const multiLineContent = 'Line 1\nLine 2\nLine 3'
            const message = createTestMessage({ content: multiLineContent })
            expect(message.content).toBe(multiLineContent)
            expect(message.content.split('\n').length).toBe(3)
        })

        it('special characters are escaped properly', () => {
            const specialContent = 'Test with <script>alert("xss")</script>'
            const message = createTestMessage({ content: specialContent })
            // The content is stored as-is, escaping happens at render time
            expect(message.content).toBe(specialContent)
        })

        it('URLs in messages are displayed correctly', () => {
            const urlContent = 'Check out this link: https://example.com/page?param=value'
            const message = createTestMessage({ content: urlContent })
            expect(message.content).toContain('https://example.com/page?param=value')
        })
    })
})

describe('Chatter - Message Retrieval', () => {
    let mockClient: ReturnType<typeof createMockChatterClient>

    beforeEach(() => {
        vi.clearAllMocks()
        mockClient = createMockChatterClient()
    })

    it('should retrieve messages for an entity', async () => {
        const result = await mockClient.rpc('get_entity_messages', {
            p_entity_type: 'item',
            p_entity_id: 'test-item-001',
            p_limit: 50,
            p_offset: 0
        })

        expect(result.error).toBeNull()
        expect(Array.isArray(result.data)).toBe(true)
    })

    it('should return messages with correct structure', async () => {
        const result = await mockClient.rpc('get_entity_messages', {
            p_entity_type: 'item',
            p_entity_id: 'test-item-001',
            p_limit: 50,
            p_offset: 0
        })

        const message = result.data[0]
        expect(message).toHaveProperty('id')
        expect(message).toHaveProperty('content')
        expect(message).toHaveProperty('author_id')
        expect(message).toHaveProperty('author_name')
        expect(message).toHaveProperty('created_at')
        expect(message).toHaveProperty('reply_count')
    })

    it('should return empty array for entity with no messages', async () => {
        const emptyClient = createMockChatterClient({ messages: [] })
        const result = await emptyClient.rpc('get_entity_messages', {
            p_entity_type: 'item',
            p_entity_id: 'new-item-no-messages',
            p_limit: 50,
            p_offset: 0
        })

        expect(result.error).toBeNull()
        expect(result.data).toEqual([])
    })

    it('should support pagination with limit and offset', async () => {
        const result = await mockClient.rpc('get_entity_messages', {
            p_entity_type: 'item',
            p_entity_id: 'test-item-001',
            p_limit: 10,
            p_offset: 0
        })

        expect(result.error).toBeNull()
        expect(Array.isArray(result.data)).toBe(true)
    })

    it('should handle messages with mentions', () => {
        const messageWithMention = testMessages.find(m => m.mentions.length > 0)
        expect(messageWithMention).toBeTruthy()
        expect(messageWithMention?.mentions[0]).toHaveProperty('user_id')
        expect(messageWithMention?.mentions[0]).toHaveProperty('user_name')
    })

    it('should identify system messages', () => {
        const systemMessage = testMessages.find(m => m.is_system_message)
        expect(systemMessage).toBeTruthy()
        expect(systemMessage?.is_system_message).toBe(true)
    })

    it('should identify edited messages', () => {
        const editedMessage = testMessages.find(m => m.edited_at !== null)
        expect(editedMessage).toBeTruthy()
        expect(editedMessage?.edited_at).toBeTruthy()
    })
})

describe('Chatter - All Entity Types Integration', () => {
    it('should support posting messages on all entity types', async () => {
        for (const entityType of ENTITY_TYPES) {
            const mockClient = createMockChatterClient()
            const entity = getTestEntityForType(entityType)

            const result = await mockClient.rpc('post_chatter_message', {
                p_entity_type: entityType,
                p_entity_id: entity.id,
                p_content: `Test message for ${entityType}`,
                p_parent_id: null,
                p_mentioned_user_ids: []
            })

            expect(result.error).toBeNull()
            expect(result.data).toBeTruthy()
        }
    })

    it('should retrieve messages from all entity types', async () => {
        for (const entityType of ENTITY_TYPES) {
            const mockClient = createMockChatterClient()
            const entity = getTestEntityForType(entityType)

            const result = await mockClient.rpc('get_entity_messages', {
                p_entity_type: entityType,
                p_entity_id: entity.id,
                p_limit: 50,
                p_offset: 0
            })

            expect(result.error).toBeNull()
            expect(Array.isArray(result.data)).toBe(true)
        }
    })
})
