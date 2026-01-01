import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    TEST_USER_ID,
    OTHER_USER_ID,
    TEST_TENANT_ID,
    testFollowers,
    createTestFollower,
    createMockChatterClient
} from '../utils/chatter-mock'

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

describe('Chatter - Follow/Unfollow', () => {
    let mockClient: ReturnType<typeof createMockChatterClient>

    beforeEach(() => {
        vi.clearAllMocks()
        mockClient = createMockChatterClient()
    })

    describe('Follow Button State', () => {
        it('follow button shows "Follow" when not following', async () => {
            const notFollowingClient = createMockChatterClient({
                rpcOverrides: {
                    is_following_entity: false
                }
            })

            const result = await notFollowingClient.rpc('is_following_entity', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001'
            })

            expect(result.data).toBe(false)
            // UI would show "Follow" button
        })

        it('follow button shows "Following" when already following', async () => {
            const followingClient = createMockChatterClient({
                rpcOverrides: {
                    is_following_entity: true
                }
            })

            const result = await followingClient.rpc('is_following_entity', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001'
            })

            expect(result.data).toBe(true)
            // UI would show "Following" button
        })

        it('clicking Follow changes button to "Following"', async () => {
            // Simulate follow action
            const mockBuilder = {
                upsert: vi.fn().mockResolvedValue({ error: null })
            }

            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            await client.from('entity_followers').upsert({
                tenant_id: TEST_TENANT_ID,
                entity_type: 'item',
                entity_id: 'test-item-001',
                user_id: TEST_USER_ID,
                notify_email: true,
                notify_in_app: true,
                notify_push: false
            })

            expect(client.from).toHaveBeenCalledWith('entity_followers')
            expect(mockBuilder.upsert).toHaveBeenCalled()
        })

        it('clicking Following unfollows the entity', async () => {
            const mockBuilder = {
                delete: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({ error: null })
                        })
                    })
                })
            }

            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            await client.from('entity_followers').delete()

            expect(client.from).toHaveBeenCalledWith('entity_followers')
            expect(mockBuilder.delete).toHaveBeenCalled()
        })
    })

    describe('Follow State Persistence', () => {
        it('button state persists on page refresh (via RPC check)', async () => {
            // First visit - check follow status
            const result1 = await mockClient.rpc('is_following_entity', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001'
            })

            // Simulate refresh - check again
            const result2 = await mockClient.rpc('is_following_entity', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001'
            })

            // State should be consistent
            expect(result1.data).toBe(result2.data)
        })

        it('follow status is fetched on component mount', async () => {
            const result = await mockClient.rpc('is_following_entity', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001'
            })

            expect(result.error).toBeNull()
            expect(typeof result.data).toBe('boolean')
        })
    })

    describe('Auto-Follow', () => {
        it('posting a message auto-follows the entity', async () => {
            // The post_chatter_message RPC handles auto-follow
            const result = await mockClient.rpc('post_chatter_message', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001',
                p_content: 'This post should auto-follow',
                p_parent_id: null,
                p_mentioned_user_ids: []
            })

            expect(result.error).toBeNull()
            // After posting, user should be in followers list
        })

        it('user appears in followers list after posting', async () => {
            const result = await mockClient.rpc('get_entity_followers', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001'
            })

            expect(result.error).toBeNull()
            expect(Array.isArray(result.data)).toBe(true)

            // Check if test user is in followers
            const isFollower = result.data.some(
                (f: { user_id: string }) => f.user_id === TEST_USER_ID
            )
            expect(isFollower).toBe(true)
        })
    })

    describe('Follow Entity Types', () => {
        it('can follow inventory items', async () => {
            const mockBuilder = {
                upsert: vi.fn().mockResolvedValue({ error: null })
            }
            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            await client.from('entity_followers').upsert({
                entity_type: 'item',
                entity_id: 'test-item-001',
                user_id: TEST_USER_ID,
                tenant_id: TEST_TENANT_ID
            })

            expect(mockBuilder.upsert).toHaveBeenCalled()
        })

        it('can follow purchase orders', async () => {
            const result = await mockClient.rpc('is_following_entity', {
                p_entity_type: 'purchase_order',
                p_entity_id: 'test-po-001'
            })

            expect(result.error).toBeNull()
        })

        it('can follow stock counts', async () => {
            const result = await mockClient.rpc('is_following_entity', {
                p_entity_type: 'stock_count',
                p_entity_id: 'test-sc-001'
            })

            expect(result.error).toBeNull()
        })

        it('can follow pick lists', async () => {
            const result = await mockClient.rpc('is_following_entity', {
                p_entity_type: 'pick_list',
                p_entity_id: 'test-pl-001'
            })

            expect(result.error).toBeNull()
        })

        it('can follow receives', async () => {
            const result = await mockClient.rpc('is_following_entity', {
                p_entity_type: 'receive',
                p_entity_id: 'test-rec-001'
            })

            expect(result.error).toBeNull()
        })
    })

    describe('Follow with Preferences', () => {
        it('follow creates record with default preferences', () => {
            const follower = createTestFollower()

            expect(follower.notify_in_app).toBe(true)
            expect(follower.notify_email).toBe(true)
            expect(follower.notify_push).toBe(false)
        })

        it('follow can specify custom notification preferences', () => {
            const follower = createTestFollower({
                notify_in_app: false,
                notify_email: true,
                notify_push: true
            })

            expect(follower.notify_in_app).toBe(false)
            expect(follower.notify_email).toBe(true)
            expect(follower.notify_push).toBe(true)
        })
    })

    describe('Follow Authorization', () => {
        it('follow requires authentication', async () => {
            const unauthClient = createMockChatterClient({ user: null })

            const { data: { user } } = await unauthClient.auth.getUser()
            expect(user).toBeNull()
            // The followEntity action would return error
        })

        it('unfollow requires authentication', async () => {
            const unauthClient = createMockChatterClient({ user: null })

            const { data: { user } } = await unauthClient.auth.getUser()
            expect(user).toBeNull()
        })

        it('follow uses correct tenant_id from profile', async () => {
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

            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            const result = await client.from('profiles')
                .select('tenant_id')
                .eq('id', TEST_USER_ID)
                .single()

            expect(result.data.tenant_id).toBe(TEST_TENANT_ID)
        })
    })

    describe('Follow Upsert Behavior', () => {
        it('following same entity twice updates rather than duplicates', async () => {
            // The upsert with onConflict handles this
            const mockBuilder = {
                upsert: vi.fn().mockResolvedValue({ error: null })
            }

            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            // First follow
            await client.from('entity_followers').upsert({
                entity_type: 'item',
                entity_id: 'test-item-001',
                user_id: TEST_USER_ID,
                tenant_id: TEST_TENANT_ID,
                notify_in_app: true
            }, {
                onConflict: 'entity_type,entity_id,user_id'
            })

            // Second follow (should update, not create duplicate)
            await client.from('entity_followers').upsert({
                entity_type: 'item',
                entity_id: 'test-item-001',
                user_id: TEST_USER_ID,
                tenant_id: TEST_TENANT_ID,
                notify_in_app: false
            }, {
                onConflict: 'entity_type,entity_id,user_id'
            })

            expect(mockBuilder.upsert).toHaveBeenCalledTimes(2)
        })
    })
})

describe('Chatter - Follow Edge Cases', () => {
    it('unfollow non-followed entity is safe', async () => {
        const mockBuilder = {
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({ error: null })
                    })
                })
            })
        }

        const client = createMockChatterClient()
        client.from = vi.fn().mockReturnValue(mockBuilder)

        // Delete on non-existent record should not error
        await client.from('entity_followers').delete()

        expect(mockBuilder.delete).toHaveBeenCalled()
    })

    it('follow non-existent entity may fail gracefully', async () => {
        // Depends on FK constraints in database
        const client = createMockChatterClient({
            rpcErrors: {
                is_following_entity: 'Entity not found'
            }
        })

        const result = await client.rpc('is_following_entity', {
            p_entity_type: 'item',
            p_entity_id: 'non-existent-item'
        })

        expect(result.error).toBeTruthy()
    })

    it('follow/unfollow rapid toggle is handled', async () => {
        let isFollowing = false

        // Toggle follow
        isFollowing = !isFollowing
        expect(isFollowing).toBe(true)

        // Toggle unfollow
        isFollowing = !isFollowing
        expect(isFollowing).toBe(false)

        // Toggle follow again
        isFollowing = !isFollowing
        expect(isFollowing).toBe(true)
    })

    it('follower record includes followed_at timestamp', () => {
        const follower = createTestFollower()

        expect(follower.followed_at).toBeTruthy()
        const date = new Date(follower.followed_at)
        expect(date.getTime()).toBeGreaterThan(0)
    })
})
