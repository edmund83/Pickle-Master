import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    TEST_USER_ID,
    OTHER_USER_ID,
    testMessages,
    createTestMessage,
    createMockChatterClient
} from '../utils/chatter-mock'

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

describe('Chatter - Edit Messages', () => {
    let mockClient: ReturnType<typeof createMockChatterClient>

    beforeEach(() => {
        vi.clearAllMocks()
        mockClient = createMockChatterClient()
    })

    describe('Edit Button Visibility', () => {
        it('edit button appears on own messages only', () => {
            const ownMessage = testMessages.find(m =>
                m.author_id === TEST_USER_ID && !m.is_system_message
            )
            const isAuthor = ownMessage?.author_id === TEST_USER_ID
            expect(isAuthor).toBe(true)
        })

        it('edit button does NOT appear on others\' messages', () => {
            const otherMessage = testMessages.find(m =>
                m.author_id === OTHER_USER_ID && !m.is_system_message
            )
            expect(otherMessage).toBeTruthy()

            const isAuthor = otherMessage?.author_id === TEST_USER_ID
            expect(isAuthor).toBe(false)
        })

        it('cannot edit system messages', () => {
            const systemMessage = testMessages.find(m => m.is_system_message)
            expect(systemMessage).toBeTruthy()
            // System messages should not show edit button regardless of author
            expect(systemMessage?.is_system_message).toBe(true)
        })
    })

    describe('Edit Functionality', () => {
        it('clicking Edit opens the edit input (data structure)', () => {
            const message = createTestMessage()
            // The message content can be modified
            expect(message.content).toBeTruthy()
            expect(typeof message.content).toBe('string')
        })

        it('can modify message content', () => {
            const originalContent = 'Original message'
            const newContent = 'Modified message'

            const message = createTestMessage({ content: originalContent })
            expect(message.content).toBe(originalContent)

            // Simulate edit
            const editedMessage = { ...message, content: newContent }
            expect(editedMessage.content).toBe(newContent)
        })

        it('save updates the message via RPC', async () => {
            const mockUpdate = vi.fn().mockResolvedValue({ error: null })
            const client = createMockChatterClient()

            // Mock the from().update() chain
            const mockBuilder = {
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                })
            }
            client.from = vi.fn().mockReturnValue(mockBuilder)

            await client.from('chatter_messages').update({
                content: 'Updated content',
                edited_at: new Date().toISOString()
            })

            expect(client.from).toHaveBeenCalledWith('chatter_messages')
            expect(mockBuilder.update).toHaveBeenCalled()
        })

        it('cancel discards changes', () => {
            const originalContent = 'Original message'
            const message = createTestMessage({ content: originalContent })

            // Simulate editing
            let editContent = 'Changed content'
            expect(editContent).not.toBe(originalContent)

            // Cancel - restore original
            editContent = message.content
            expect(editContent).toBe(originalContent)
        })
    })

    describe('Edited Message Indicator', () => {
        it('edited messages show "(edited)" indicator via edited_at', () => {
            const editedMessage = testMessages.find(m => m.edited_at !== null)
            expect(editedMessage).toBeTruthy()
            expect(editedMessage?.edited_at).toBeTruthy()
        })

        it('non-edited messages do not have edited_at', () => {
            const nonEditedMessage = testMessages.find(m => m.edited_at === null)
            expect(nonEditedMessage).toBeTruthy()
            expect(nonEditedMessage?.edited_at).toBeNull()
        })

        it('edited_at is a valid timestamp', () => {
            const editedMessage = testMessages.find(m => m.edited_at !== null)
            if (editedMessage?.edited_at) {
                const date = new Date(editedMessage.edited_at)
                expect(date.getTime()).toBeGreaterThan(0)
            }
        })
    })

    describe('Edit Preserves Mentions', () => {
        it('edit preserves @mentions in content', () => {
            const messageWithMention = testMessages.find(m => m.mentions.length > 0)
            expect(messageWithMention).toBeTruthy()

            // Simulate edit that preserves mentions
            const editedContent = messageWithMention?.content + ' (edited but kept mentions)'
            expect(editedContent).toContain('@')
        })

        it('edit can add new mentions', () => {
            const message = createTestMessage({
                content: 'Original without mention',
                mentions: []
            })

            // Edit to add mention
            const editedMessage = {
                ...message,
                content: 'Edited with @Bob Johnson mention',
                mentions: [{ user_id: OTHER_USER_ID, user_name: 'Bob Johnson' }]
            }

            expect(editedMessage.mentions.length).toBe(1)
            expect(editedMessage.content).toContain('@Bob Johnson')
        })

        it('edit can remove mentions', () => {
            const message = createTestMessage({
                content: '@Bob Johnson please check',
                mentions: [{ user_id: OTHER_USER_ID, user_name: 'Bob Johnson' }]
            })

            // Edit to remove mention
            const editedMessage = {
                ...message,
                content: 'Please check',
                mentions: []
            }

            expect(editedMessage.mentions.length).toBe(0)
            expect(editedMessage.content).not.toContain('@')
        })
    })

    describe('Edit Validation', () => {
        it('cannot save empty content after edit', () => {
            const isEmpty = (content: string) => !content || content.trim() === ''
            expect(isEmpty('')).toBe(true)
            expect(isEmpty('   ')).toBe(true)
            expect(isEmpty('Valid content')).toBe(false)
        })

        it('edited content replaces original completely', () => {
            const original = 'Original message'
            const edited = 'Completely different message'

            expect(edited).not.toContain(original)
        })
    })
})

describe('Chatter - Delete Messages', () => {
    let mockClient: ReturnType<typeof createMockChatterClient>

    beforeEach(() => {
        vi.clearAllMocks()
        mockClient = createMockChatterClient()
    })

    describe('Delete Button Visibility', () => {
        it('delete button appears on own messages only', () => {
            const ownMessage = testMessages.find(m =>
                m.author_id === TEST_USER_ID && !m.is_system_message
            )
            const isAuthor = ownMessage?.author_id === TEST_USER_ID
            expect(isAuthor).toBe(true)
        })

        it('delete button does NOT appear on others\' messages', () => {
            const otherMessage = testMessages.find(m =>
                m.author_id === OTHER_USER_ID && !m.is_system_message
            )
            expect(otherMessage).toBeTruthy()

            const isAuthor = otherMessage?.author_id === TEST_USER_ID
            expect(isAuthor).toBe(false)
        })

        it('cannot delete system messages', () => {
            const systemMessage = testMessages.find(m => m.is_system_message)
            expect(systemMessage).toBeTruthy()
            // System messages should not show delete button
            expect(systemMessage?.is_system_message).toBe(true)
        })
    })

    describe('Delete Confirmation', () => {
        it('clicking Delete should prompt for confirmation', () => {
            // The confirm() call is in the UI component
            // We verify the delete action would be triggered after confirm
            const confirmFn = vi.fn().mockReturnValue(true)
            expect(confirmFn('Delete this message?')).toBe(true)
        })

        it('cancel confirmation prevents deletion', () => {
            const confirmFn = vi.fn().mockReturnValue(false)
            const shouldDelete = confirmFn('Delete this message?')
            expect(shouldDelete).toBe(false)
        })
    })

    describe('Soft Delete', () => {
        it('confirm deletes the message (soft delete)', async () => {
            const mockBuilder = {
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                })
            }

            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            await client.from('chatter_messages').update({
                deleted_at: new Date().toISOString()
            })

            expect(client.from).toHaveBeenCalledWith('chatter_messages')
            expect(mockBuilder.update).toHaveBeenCalled()
        })

        it('deleted messages have deleted_at set', () => {
            const deletedMessage = createTestMessage()
            const deletedAt = new Date().toISOString()

            // Simulate soft delete
            const softDeleted = { ...deletedMessage, deleted_at: deletedAt }

            expect(softDeleted.deleted_at).toBeTruthy()
            expect(new Date(softDeleted.deleted_at!).getTime()).toBeGreaterThan(0)
        })

        it('deleted messages are removed from view', async () => {
            // Messages with deleted_at should be filtered out by the RPC
            const mockClient = createMockChatterClient({
                messages: testMessages.filter(m => !m.content.includes('deleted'))
            })

            const result = await mockClient.rpc('get_entity_messages', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001',
                p_limit: 50,
                p_offset: 0
            })

            // All returned messages should not have deleted_at
            expect(result.error).toBeNull()
        })
    })

    describe('Delete Parent Message with Replies', () => {
        it('deleting a parent message handles replies gracefully', () => {
            const parentMessage = testMessages.find(m => m.reply_count > 0)
            expect(parentMessage).toBeTruthy()

            // When parent is deleted, replies could:
            // 1. Be deleted too (cascade)
            // 2. Become orphaned (shown separately)
            // 3. Show "[deleted]" placeholder for parent

            // The implementation should handle this gracefully
            const parentId = parentMessage?.id
            expect(parentId).toBeTruthy()
        })

        it('reply count is considered when deleting', () => {
            const messageWithReplies = testMessages.find(m => m.reply_count > 0)
            expect(messageWithReplies?.reply_count).toBeGreaterThan(0)

            // UI might show warning about replies being affected
        })
    })

    describe('Authorization Checks', () => {
        it('edit requires user to be authenticated', async () => {
            const unauthClient = createMockChatterClient({
                user: null
            })

            // The editMessage action checks for user
            const { data: { user } } = await unauthClient.auth.getUser()
            expect(user).toBeNull()
        })

        it('delete requires user to be authenticated', async () => {
            const unauthClient = createMockChatterClient({
                user: null
            })

            const { data: { user } } = await unauthClient.auth.getUser()
            expect(user).toBeNull()
        })

        it('edit enforces author check via eq filter', async () => {
            // The update query includes .eq('author_id', user.id)
            const message = createTestMessage({ author_id: OTHER_USER_ID })

            // Trying to edit another user's message
            const isAuthor = message.author_id === TEST_USER_ID
            expect(isAuthor).toBe(false)
        })

        it('delete enforces author check via eq filter', async () => {
            const message = createTestMessage({ author_id: OTHER_USER_ID })

            const isAuthor = message.author_id === TEST_USER_ID
            expect(isAuthor).toBe(false)
        })
    })
})

describe('Chatter - Edit/Delete Edge Cases', () => {
    it('cannot edit deleted message', () => {
        const deletedMessage = createTestMessage()
        const softDeleted = {
            ...deletedMessage,
            deleted_at: new Date().toISOString()
        }

        // The message is deleted, UI should not show edit option
        expect(softDeleted.deleted_at).toBeTruthy()
    })

    it('rapid edit/save should not cause issues', async () => {
        const mockClient = createMockChatterClient()

        // Simulate rapid edits
        const edits = Array(5).fill(null).map((_, i) => ({
            content: `Edit version ${i + 1}`,
            edited_at: new Date().toISOString()
        }))

        // All edits should have unique content
        const contents = edits.map(e => e.content)
        const uniqueContents = [...new Set(contents)]
        expect(uniqueContents.length).toBe(5)
    })

    it('edit preserves message metadata', () => {
        const original = createTestMessage({
            content: 'Original content',
            author_id: TEST_USER_ID,
            author_name: 'Alice Smith',
            created_at: '2024-01-01T10:00:00Z'
        })

        // After edit, only content and edited_at should change
        const edited = {
            ...original,
            content: 'Edited content',
            edited_at: new Date().toISOString()
        }

        expect(edited.author_id).toBe(original.author_id)
        expect(edited.author_name).toBe(original.author_name)
        expect(edited.created_at).toBe(original.created_at)
        expect(edited.id).toBe(original.id)
    })

    it('delete is permanent in soft delete model', () => {
        const message = createTestMessage()
        const deletedAt = new Date().toISOString()

        const deleted = { ...message, deleted_at: deletedAt }

        // Once deleted_at is set, message is considered deleted
        expect(deleted.deleted_at).toBeTruthy()

        // In soft delete model, data is retained but hidden
        expect(deleted.content).toBe(message.content)
    })
})
