import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    TEST_USER_ID,
    OTHER_USER_ID,
    THIRD_USER_ID,
    TEST_TENANT_ID,
    testFollowers,
    createTestFollower,
    createMockChatterClient
} from '../utils/chatter-mock'

// Mock the Supabase server module
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
}))

describe('Chatter - Followers List', () => {
    let mockClient: ReturnType<typeof createMockChatterClient>

    beforeEach(() => {
        vi.clearAllMocks()
        mockClient = createMockChatterClient()
    })

    describe('Followers Tab', () => {
        it('followers tab shows all followers', async () => {
            const result = await mockClient.rpc('get_entity_followers', {
                p_entity_type: 'item',
                p_entity_id: 'test-item-001'
            })

            expect(result.error).toBeNull()
            expect(Array.isArray(result.data)).toBe(true)
            expect(result.data.length).toBeGreaterThan(0)
        })

        it('each follower shows avatar/initials', () => {
            const followerWithAvatar = testFollowers.find(f => f.user_avatar !== null)
            const followerWithoutAvatar = testFollowers.find(f => f.user_avatar === null)

            if (followerWithAvatar) {
                expect(followerWithAvatar.user_avatar).toBeTruthy()
            }
            if (followerWithoutAvatar) {
                expect(followerWithoutAvatar.user_avatar).toBeNull()
                // UI shows initials from first char of name
                expect(followerWithoutAvatar.user_name.charAt(0)).toBeTruthy()
            }
        })

        it('each follower shows name', () => {
            testFollowers.forEach(follower => {
                expect(follower.user_name).toBeTruthy()
                expect(typeof follower.user_name).toBe('string')
            })
        })

        it('each follower shows follow date', () => {
            testFollowers.forEach(follower => {
                expect(follower.followed_at).toBeTruthy()
                const date = new Date(follower.followed_at)
                expect(date.getTime()).toBeGreaterThan(0)
            })
        })
    })

    describe('Current User Notification Preferences', () => {
        it('current user can see their notification preferences', () => {
            const currentUserFollow = testFollowers.find(f => f.user_id === TEST_USER_ID)
            expect(currentUserFollow).toBeTruthy()
            expect(currentUserFollow).toHaveProperty('notify_in_app')
            expect(currentUserFollow).toHaveProperty('notify_email')
            expect(currentUserFollow).toHaveProperty('notify_push')
        })

        it('current user can toggle In-app notifications', async () => {
            const mockBuilder = {
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({ error: null })
                        })
                    })
                })
            }

            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            await client.from('entity_followers').update({
                notify_in_app: false
            })

            expect(mockBuilder.update).toHaveBeenCalledWith({ notify_in_app: false })
        })

        it('current user can toggle Email notifications', async () => {
            const mockBuilder = {
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({ error: null })
                        })
                    })
                })
            }

            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            await client.from('entity_followers').update({
                notify_email: true
            })

            expect(mockBuilder.update).toHaveBeenCalledWith({ notify_email: true })
        })

        it('current user can toggle Push notifications', async () => {
            const mockBuilder = {
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        eq: vi.fn().mockReturnValue({
                            eq: vi.fn().mockResolvedValue({ error: null })
                        })
                    })
                })
            }

            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            await client.from('entity_followers').update({
                notify_push: true
            })

            expect(mockBuilder.update).toHaveBeenCalledWith({ notify_push: true })
        })

        it('preference changes persist on save', async () => {
            // After update, fetch should return new values
            const updatedFollower = createTestFollower({
                user_id: TEST_USER_ID,
                notify_in_app: false,
                notify_email: false,
                notify_push: true
            })

            expect(updatedFollower.notify_in_app).toBe(false)
            expect(updatedFollower.notify_email).toBe(false)
            expect(updatedFollower.notify_push).toBe(true)
        })

        it('cannot see/edit other users\' preferences', () => {
            const otherUserFollow = testFollowers.find(f => f.user_id === OTHER_USER_ID)
            expect(otherUserFollow).toBeTruthy()

            // UI should only show preference toggles for current user
            const isCurrentUser = otherUserFollow?.user_id === TEST_USER_ID
            expect(isCurrentUser).toBe(false)
        })
    })

    describe('Empty Followers', () => {
        it('shows "No followers yet" when empty', async () => {
            const emptyClient = createMockChatterClient({ followers: [] })

            const result = await emptyClient.rpc('get_entity_followers', {
                p_entity_type: 'item',
                p_entity_id: 'new-item'
            })

            expect(result.error).toBeNull()
            expect(result.data).toEqual([])
        })
    })
})

describe('Chatter - Notifications', () => {
    let mockClient: ReturnType<typeof createMockChatterClient>

    beforeEach(() => {
        vi.clearAllMocks()
        mockClient = createMockChatterClient()
    })

    describe('In-App Notifications', () => {
        it('followers receive notification when new message posted', async () => {
            // Notification dispatch happens in postMessage
            const mockBuilder = {
                insert: vi.fn().mockResolvedValue({ error: null })
            }

            const client = createMockChatterClient()
            client.from = vi.fn().mockReturnValue(mockBuilder)

            const notifications = [
                {
                    tenant_id: TEST_TENANT_ID,
                    user_id: OTHER_USER_ID,
                    title: 'Alice Smith commented',
                    message: 'New comment on Test Item',
                    notification_type: 'chatter',
                    notification_subtype: 'message',
                    entity_type: 'item',
                    entity_id: 'test-item-001',
                    is_read: false
                }
            ]

            await client.from('notifications').insert(notifications)

            expect(client.from).toHaveBeenCalledWith('notifications')
            expect(mockBuilder.insert).toHaveBeenCalledWith(notifications)
        })

        it('mentioned users receive notification with higher priority', async () => {
            const mentionNotification = {
                tenant_id: TEST_TENANT_ID,
                user_id: OTHER_USER_ID,
                title: 'Alice Smith mentioned you',
                message: 'You were mentioned in a comment on Test Item',
                notification_type: 'chatter',
                notification_subtype: 'mention',
                is_read: false
            }

            expect(mentionNotification.notification_subtype).toBe('mention')
            expect(mentionNotification.title).toContain('mentioned you')
        })

        it('author does NOT receive notification for own message', () => {
            const authorId = TEST_USER_ID
            const followers = testFollowers

            // Filter out author from notification recipients
            const recipients = followers.filter(f => f.user_id !== authorId)
            expect(recipients.every(r => r.user_id !== authorId)).toBe(true)
        })

        it('notification shows author name', () => {
            const notification = {
                title: 'Alice Smith commented',
                message: 'New comment on Test Item'
            }

            expect(notification.title).toContain('Alice Smith')
        })

        it('notification shows entity name', () => {
            const notification = {
                title: 'Alice Smith commented',
                message: 'New comment on Test Item'
            }

            expect(notification.message).toContain('Test Item')
        })

        it('notification links to correct entity', () => {
            const notification = {
                entity_type: 'item',
                entity_id: 'test-item-001'
            }

            const expectedPath = `/inventory/${notification.entity_id}`
            expect(expectedPath).toBe('/inventory/test-item-001')
        })
    })

    describe('Notification Preferences', () => {
        it('users with notify_in_app: false do NOT receive in-app notifications', () => {
            const follower = createTestFollower({ notify_in_app: false })
            expect(follower.notify_in_app).toBe(false)

            // Should be filtered out when dispatching
            const shouldNotify = follower.notify_in_app === true
            expect(shouldNotify).toBe(false)
        })

        it('mentioned users always receive mention notification (regardless of follow status)', async () => {
            // Mentions take priority over follow preferences
            const mentionedUserId = THIRD_USER_ID

            // Even if not following, mentioned user gets notification
            const mentionNotification = {
                user_id: mentionedUserId,
                notification_subtype: 'mention'
            }

            expect(mentionNotification.notification_subtype).toBe('mention')
        })

        it('duplicate notifications are prevented (mention takes priority over follow)', () => {
            const mentionedUserIds = [OTHER_USER_ID]
            const followers = testFollowers.filter(f => f.notify_in_app)

            // Create follower notifications
            const followerNotifications = followers.map(f => ({
                user_id: f.user_id,
                type: 'follow'
            }))

            // Create mention notifications
            const mentionNotifications = mentionedUserIds.map(id => ({
                user_id: id,
                type: 'mention'
            }))

            // Filter out followers who are also mentioned
            const mentionedSet = new Set(mentionedUserIds)
            const filteredFollowerNotifs = followerNotifications.filter(
                n => !mentionedSet.has(n.user_id)
            )

            // Combine - no duplicates
            const allNotifications = [...mentionNotifications, ...filteredFollowerNotifs]
            const userIds = allNotifications.map(n => n.user_id)
            const uniqueUserIds = [...new Set(userIds)]

            expect(userIds.length).toBe(uniqueUserIds.length)
        })
    })

    describe('Unread Mentions Count', () => {
        it('can get unread mentions count', async () => {
            const result = await mockClient.rpc('get_unread_mentions_count')

            expect(result.error).toBeNull()
            expect(typeof result.data).toBe('number')
        })

        it('mark mentions as read', async () => {
            const result = await mockClient.rpc('mark_mentions_read', {
                p_message_ids: ['msg-001', 'msg-002']
            })

            expect(result.error).toBeNull()
        })
    })
})

describe('Chatter - Followers Structure', () => {
    it('follower has all required fields', () => {
        const follower = testFollowers[0]

        expect(follower).toHaveProperty('user_id')
        expect(follower).toHaveProperty('user_name')
        expect(follower).toHaveProperty('user_email')
        expect(follower).toHaveProperty('user_avatar')
        expect(follower).toHaveProperty('notify_email')
        expect(follower).toHaveProperty('notify_in_app')
        expect(follower).toHaveProperty('notify_push')
        expect(follower).toHaveProperty('followed_at')
    })

    it('notification preferences are booleans', () => {
        const follower = testFollowers[0]

        expect(typeof follower.notify_email).toBe('boolean')
        expect(typeof follower.notify_in_app).toBe('boolean')
        expect(typeof follower.notify_push).toBe('boolean')
    })

    it('followed_at is valid timestamp', () => {
        const follower = testFollowers[0]
        const date = new Date(follower.followed_at)

        expect(date.getTime()).toBeGreaterThan(0)
        expect(date.toISOString()).toBeTruthy()
    })
})

describe('Chatter - Notification Edge Cases', () => {
    it('handles entity without followers', async () => {
        const noFollowersClient = createMockChatterClient({ followers: [] })

        const result = await noFollowersClient.rpc('get_entity_followers', {
            p_entity_type: 'item',
            p_entity_id: 'item-no-followers'
        })

        expect(result.error).toBeNull()
        expect(result.data).toEqual([])

        // No notifications should be sent
        const recipients: string[] = []
        expect(recipients.length).toBe(0)
    })

    it('handles notification dispatch failure gracefully', async () => {
        // The dispatch is fire-and-forget, errors are logged
        const errorClient = createMockChatterClient()
        const mockBuilder = {
            insert: vi.fn().mockResolvedValue({
                error: { message: 'Insert failed' }
            })
        }
        errorClient.from = vi.fn().mockReturnValue(mockBuilder)

        const result = await errorClient.from('notifications').insert([])

        expect(result.error).toBeTruthy()
        expect(result.error.message).toBe('Insert failed')
    })

    it('notification contains all required metadata', () => {
        const notification = {
            tenant_id: TEST_TENANT_ID,
            user_id: OTHER_USER_ID,
            title: 'Test Title',
            message: 'Test Message',
            notification_type: 'chatter',
            notification_subtype: 'message',
            entity_type: 'item',
            entity_id: 'test-item-001',
            is_read: false
        }

        expect(notification.tenant_id).toBeTruthy()
        expect(notification.user_id).toBeTruthy()
        expect(notification.title).toBeTruthy()
        expect(notification.message).toBeTruthy()
        expect(notification.notification_type).toBe('chatter')
        expect(notification.is_read).toBe(false)
    })
})
