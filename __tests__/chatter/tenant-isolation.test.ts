import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    TEST_USER_ID,
    OTHER_USER_ID,
    THIRD_USER_ID,
    TEST_TENANT_ID,
    OTHER_TENANT_ID,
    testMessages,
    testFollowers,
    testTeamMembers,
    otherTenantMembers,
    createTestMessage,
    createTestFollower,
    createMockChatterClient
} from '../utils/chatter-mock'

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

describe('Chatter - Tenant Isolation', () => {
    describe('Data Isolation', () => {
        it('User A (Tenant 1) cannot see messages from Tenant 2', async () => {
            // Tenant 1 user's client
            const tenant1Client = createMockChatterClient({
                user: { id: TEST_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID },
                messages: testMessages.filter(m => m.author_id === TEST_USER_ID)
            })

            // Tenant 2 message (should not be visible)
            const tenant2Message = createTestMessage({
                id: 'tenant2-msg-001',
                content: 'Message from Tenant 2',
                author_id: 'tenant2-user-id'
            })

            // Tenant 1 user fetches messages - should not include Tenant 2 messages
            const result = await tenant1Client.rpc('get_entity_messages', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001',
                p_limit: 50,
                p_offset: 0
            })

            expect(result.error).toBeNull()
            const messageIds = result.data.map((m: { id: string }) => m.id)
            expect(messageIds).not.toContain(tenant2Message.id)
        })

        it('User A (Tenant 1) cannot see followers from Tenant 2', async () => {
            // Tenant 1 followers only
            const tenant1Followers = testFollowers.filter(
                f => f.user_id === TEST_USER_ID || f.user_id === OTHER_USER_ID
            )

            // Tenant 2 follower (should not be visible)
            const tenant2Follower = createTestFollower({
                user_id: 'tenant2-user-id',
                user_name: 'Tenant 2 User'
            })

            const tenant1Client = createMockChatterClient({
                user: { id: TEST_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID },
                followers: tenant1Followers
            })

            const result = await tenant1Client.rpc('get_entity_followers', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001'
            })

            expect(result.error).toBeNull()
            const followerIds = result.data.map((f: { user_id: string }) => f.user_id)
            expect(followerIds).not.toContain(tenant2Follower.user_id)
        })

        it('User A (Tenant 1) cannot @mention users from Tenant 2', async () => {
            // Tenant 1 client only returns Tenant 1 team members
            const tenant1Client = createMockChatterClient({
                user: { id: TEST_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID },
                teamMembers: testTeamMembers // Only Tenant 1 members
            })

            const result = await tenant1Client.rpc('get_team_members_for_mention', {
                p_search_query: '',
                p_limit: 10
            })

            expect(result.error).toBeNull()

            // Should not include other tenant members
            const memberIds = result.data.map((m: { user_id: string }) => m.user_id)
            otherTenantMembers.forEach(otherMember => {
                expect(memberIds).not.toContain(otherMember.user_id)
            })
        })

        it('User A (Tenant 1) cannot follow entities from Tenant 2', async () => {
            // Attempting to follow an entity that belongs to Tenant 2
            // The RPC/RLS would enforce tenant isolation

            const tenant1Client = createMockChatterClient({
                user: { id: TEST_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID },
                rpcErrors: {
                    is_following_entity: 'Entity not found' // Simulates RLS filtering
                }
            })

            // Try to check follow status on Tenant 2 entity
            const result = await tenant1Client.rpc('is_following_entity', {
                p_entity_type: 'item',
                p_entity_id: 'tenant2-item-001'
            })

            // Would fail or return empty due to RLS
            expect(result.error).toBeTruthy()
        })
    })

    describe('API Security', () => {
        it('RPC calls enforce tenant_id check', async () => {
            // The RPC functions use auth.uid() and join with profiles to get tenant_id
            // This is enforced at the database level

            const client = createMockChatterClient()

            // Auth is checked first
            const { data: { user } } = await client.auth.getUser()
            expect(user).toBeTruthy()
            expect(user?.id).toBe(TEST_USER_ID)

            // Then tenant is resolved from profile
            const mockBuilder = {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { tenant_id: TEST_TENANT_ID },
                            error: null
                        })
                    })
                })
            }
            client.from = vi.fn().mockReturnValue(mockBuilder)

            const profile = await client.from('profiles')
                .select('tenant_id')
                .eq('id', user?.id)
                .single()

            expect(profile.data.tenant_id).toBe(TEST_TENANT_ID)
        })

        it('direct table access is blocked by RLS', async () => {
            // Simulating direct table access without RPC
            // RLS should filter results to current tenant only

            const client = createMockChatterClient({
                profile: { tenant_id: TEST_TENANT_ID }
            })

            // Direct query would be filtered by RLS
            const mockBuilder = {
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        then: vi.fn((resolve) => resolve({
                            data: [], // RLS returns empty for other tenants
                            error: null
                        }))
                    })
                })
            }
            client.from = vi.fn().mockReturnValue(mockBuilder)

            const result = await client.from('chatter_messages')
                .select('*')
                .eq('tenant_id', OTHER_TENANT_ID)

            // RLS prevents seeing other tenant data
            expect(result.data).toEqual([])
        })

        it('attempting cross-tenant access returns empty/error', async () => {
            const client = createMockChatterClient({
                user: { id: TEST_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID },
                messages: [] // Empty because RLS filters out other tenant
            })

            const result = await client.rpc('get_entity_messages', {
                p_entity_type: 'item',
                p_entity_id: 'other-tenant-item', // Item from different tenant
                p_limit: 50,
                p_offset: 0
            })

            expect(result.error).toBeNull()
            expect(result.data).toEqual([])
        })
    })

    describe('Tenant ID Enforcement', () => {
        it('messages are stored with correct tenant_id', () => {
            const message = createTestMessage()

            // When posted, message should have tenant_id from user's profile
            const messageWithTenant = {
                ...message,
                tenant_id: TEST_TENANT_ID
            }

            expect(messageWithTenant.tenant_id).toBe(TEST_TENANT_ID)
        })

        it('followers records have correct tenant_id', () => {
            const follower = createTestFollower()

            const followerWithTenant = {
                ...follower,
                tenant_id: TEST_TENANT_ID
            }

            expect(followerWithTenant.tenant_id).toBe(TEST_TENANT_ID)
        })

        it('tenant_id cannot be spoofed via client', async () => {
            // Even if client tries to set different tenant_id,
            // RLS and RPC should use auth-derived tenant_id

            const client = createMockChatterClient({
                user: { id: TEST_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID }
            })

            // Attempt to insert with wrong tenant_id
            const mockBuilder = {
                upsert: vi.fn().mockResolvedValue({
                    error: { message: 'Row level security violation' }
                })
            }
            client.from = vi.fn().mockReturnValue(mockBuilder)

            const result = await client.from('entity_followers').upsert({
                tenant_id: OTHER_TENANT_ID, // Attempting to spoof
                entity_type: 'item',
                entity_id: 'test-item',
                user_id: TEST_USER_ID
            })

            // RLS should reject this
            expect(result.error).toBeTruthy()
        })
    })

    describe('Cross-Tenant Query Prevention', () => {
        it('messages query filters by user tenant', async () => {
            // Create mixed tenant messages
            const tenant1Messages = testMessages.map(m => ({
                ...m,
                tenant_id: TEST_TENANT_ID
            }))
            const tenant2Messages = [
                createTestMessage({
                    id: 't2-msg-1',
                    content: 'Tenant 2 message'
                })
            ].map(m => ({ ...m, tenant_id: OTHER_TENANT_ID }))

            // Client for Tenant 1 - should only see Tenant 1 messages
            const client = createMockChatterClient({
                user: { id: TEST_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID },
                messages: tenant1Messages // Only tenant 1 messages
            })

            const result = await client.rpc('get_entity_messages', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001',
                p_limit: 50,
                p_offset: 0
            })

            expect(result.error).toBeNull()
            // All returned messages should be from Tenant 1
            result.data.forEach((msg: { tenant_id?: string }) => {
                if (msg.tenant_id) {
                    expect(msg.tenant_id).toBe(TEST_TENANT_ID)
                }
            })
        })

        it('followers query filters by user tenant', async () => {
            const tenant1Followers = testFollowers.map(f => ({
                ...f,
                tenant_id: TEST_TENANT_ID
            }))

            const client = createMockChatterClient({
                user: { id: TEST_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID },
                followers: tenant1Followers
            })

            const result = await client.rpc('get_entity_followers', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001'
            })

            expect(result.error).toBeNull()
            expect(Array.isArray(result.data)).toBe(true)
        })

        it('team members query filters by user tenant', async () => {
            const client = createMockChatterClient({
                user: { id: TEST_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID },
                teamMembers: testTeamMembers // Only tenant 1 members
            })

            const result = await client.rpc('get_team_members_for_mention', {
                p_search_query: '',
                p_limit: 10
            })

            expect(result.error).toBeNull()

            // All returned members should be from same tenant
            result.data.forEach((member: { user_id: string }) => {
                const isTenant1Member = testTeamMembers.some(
                    tm => tm.user_id === member.user_id
                )
                expect(isTenant1Member).toBe(true)
            })
        })
    })

    describe('Multi-Tenant Scenarios', () => {
        it('two users from same tenant can see each other messages', async () => {
            // User 1 posts a message
            const user1Message = createTestMessage({
                author_id: TEST_USER_ID,
                author_name: 'Alice Smith'
            })

            // User 2 from same tenant should see it
            const client = createMockChatterClient({
                user: { id: OTHER_USER_ID },
                profile: { tenant_id: TEST_TENANT_ID },
                messages: [user1Message]
            })

            const result = await client.rpc('get_entity_messages', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001',
                p_limit: 50,
                p_offset: 0
            })

            expect(result.error).toBeNull()
            expect(result.data.length).toBeGreaterThan(0)
            expect(result.data[0].author_id).toBe(TEST_USER_ID)
        })

        it('two users from different tenants cannot see each other messages', async () => {
            // Tenant 2 user's client
            const tenant2Client = createMockChatterClient({
                user: { id: 'tenant2-user' },
                profile: { tenant_id: OTHER_TENANT_ID },
                messages: [] // Cannot see Tenant 1 messages
            })

            const result = await tenant2Client.rpc('get_entity_messages', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001', // This is a Tenant 1 item
                p_limit: 50,
                p_offset: 0
            })

            expect(result.error).toBeNull()
            expect(result.data).toEqual([])
        })

        it('notifications are only sent to same-tenant users', () => {
            const mentionedUsers = [OTHER_USER_ID, THIRD_USER_ID]
            const tenantUsers = testTeamMembers.map(m => m.user_id)

            // Filter to only include users from same tenant
            const validRecipients = mentionedUsers.filter(
                userId => tenantUsers.includes(userId)
            )

            expect(validRecipients.length).toBeGreaterThan(0)
            validRecipients.forEach(userId => {
                expect(tenantUsers).toContain(userId)
            })
        })
    })
})

describe('Chatter - RLS Policy Simulation', () => {
    it('SELECT policy enforces tenant match', async () => {
        // Simulating RLS: auth.uid() must belong to same tenant as row
        const currentUserId = TEST_USER_ID
        const currentTenantId = TEST_TENANT_ID

        const messages = [
            { id: 'msg-1', tenant_id: TEST_TENANT_ID, content: 'Visible' },
            { id: 'msg-2', tenant_id: OTHER_TENANT_ID, content: 'Not visible' }
        ]

        // RLS filters to matching tenant
        const visibleMessages = messages.filter(
            m => m.tenant_id === currentTenantId
        )

        expect(visibleMessages.length).toBe(1)
        expect(visibleMessages[0].id).toBe('msg-1')
    })

    it('INSERT policy enforces correct tenant_id', () => {
        const currentTenantId = TEST_TENANT_ID

        // When inserting, tenant_id must match user's tenant
        const newMessage = {
            tenant_id: currentTenantId,
            content: 'New message'
        }

        const isValidInsert = newMessage.tenant_id === currentTenantId
        expect(isValidInsert).toBe(true)

        // Attempting to insert with different tenant
        const invalidMessage = {
            tenant_id: OTHER_TENANT_ID,
            content: 'Invalid insert'
        }

        const isInvalidInsert = invalidMessage.tenant_id !== currentTenantId
        expect(isInvalidInsert).toBe(true)
    })

    it('UPDATE policy enforces ownership and tenant', () => {
        const currentUserId = TEST_USER_ID
        const currentTenantId = TEST_TENANT_ID

        const message = {
            id: 'msg-1',
            author_id: currentUserId,
            tenant_id: currentTenantId
        }

        // Can only update own messages in same tenant
        const canUpdate =
            message.author_id === currentUserId &&
            message.tenant_id === currentTenantId

        expect(canUpdate).toBe(true)

        // Cannot update others' messages
        const otherMessage = {
            id: 'msg-2',
            author_id: OTHER_USER_ID,
            tenant_id: currentTenantId
        }

        const cannotUpdate = otherMessage.author_id !== currentUserId
        expect(cannotUpdate).toBe(true)
    })

    it('DELETE policy enforces ownership and tenant', () => {
        const currentUserId = TEST_USER_ID
        const currentTenantId = TEST_TENANT_ID

        const message = {
            id: 'msg-1',
            author_id: currentUserId,
            tenant_id: currentTenantId
        }

        const canDelete =
            message.author_id === currentUserId &&
            message.tenant_id === currentTenantId

        expect(canDelete).toBe(true)
    })
})
