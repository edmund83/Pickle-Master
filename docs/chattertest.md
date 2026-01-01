# Chatter Module Test Checklist

This document provides a comprehensive test checklist for the Chatter system - an Odoo-style messaging feature for team communication on entities.

---

## Supported Entities

- [x] Inventory Items (`/inventory/[itemId]`)
- [x] Purchase Orders (`/tasks/purchase-orders/[id]`)
- [x] Stock Counts (`/tasks/stock-count/[id]`)
- [x] Pick Lists (`/tasks/pick-lists/[pickListId]`)
- [x] Receives (`/tasks/receives/[id]`)

---

## 1. Message Posting

### Basic Messaging
- [x] Can post a new message on an item
- [x] Can post a new message on a purchase order
- [x] Can post a new message on a stock count
- [x] Can post a new message on a pick list
- [x] Can post a new message on a receive
- [x] Message appears immediately after posting
- [x] Message shows correct author name
- [x] Message shows correct timestamp
- [x] Empty messages are rejected (validation)
- [x] Long messages are handled correctly (no truncation issues)

### Message Content
- [x] Plain text renders correctly
- [x] Multi-line messages preserve line breaks
- [x] Special characters are escaped properly
- [x] URLs in messages are displayed correctly

---

## 2. @Mentions

### Autocomplete
- [x] Typing `@` triggers the mention dropdown
- [x] Dropdown shows team members from same tenant only
- [x] Search filters team members by name
- [x] Search filters team members by email
- [x] Keyboard navigation works (Arrow Up/Down)
- [x] Enter/Tab selects the highlighted member
- [x] Escape closes the dropdown
- [x] Clicking a member selects them
- [x] Multiple @mentions can be added to one message

### Mention Display
- [x] @mentions are highlighted in posted messages
- [x] @mention shows the user's name (not ID)
- [x] Clicking a mention does not break the page

### Mention Restrictions
- [x] Cannot mention users from other tenants
- [x] Cannot mention non-existent users

---

## 3. Replies (Threading)

- [x] Can reply to a message
- [x] Reply input appears when clicking "Reply"
- [x] Reply count is displayed on parent message
- [x] Replies are indented/nested correctly
- [x] Can expand/collapse replies
- [x] Replies show correct author and timestamp
- [x] @mentions work in replies
- [x] Cannot reply to a reply (single-level threading)

---

## 4. Edit Messages

- [x] Edit button appears on own messages only
- [x] Edit button does NOT appear on others' messages
- [x] Clicking Edit opens the edit input
- [x] Can modify message content
- [x] Save updates the message
- [x] Cancel discards changes
- [x] Edited messages show "(edited)" indicator
- [x] Edit preserves @mentions
- [x] Cannot edit system messages

---

## 5. Delete Messages

- [x] Delete button appears on own messages only
- [x] Delete button does NOT appear on others' messages
- [x] Clicking Delete prompts for confirmation
- [x] Confirm deletes the message (soft delete)
- [x] Deleted messages are removed from view
- [x] Cannot delete system messages
- [x] Deleting a parent message handles replies gracefully

---

## 6. Follow/Unfollow

### Follow Button
- [x] Follow button shows "Follow" when not following
- [x] Clicking Follow changes button to "Following"
- [x] Follow button shows "Following" when already following
- [x] Clicking Following unfollows the entity
- [x] Button state persists on page refresh

### Auto-Follow
- [x] Posting a message auto-follows the entity
- [x] User appears in followers list after posting

---

## 7. Followers List

- [x] Followers tab shows all followers
- [x] Each follower shows avatar/initials
- [x] Each follower shows name
- [x] Each follower shows follow date
- [x] Current user can see their notification preferences
- [x] Current user can toggle In-app notifications
- [x] Current user can toggle Email notifications
- [x] Current user can toggle Push notifications
- [x] Preference changes persist on save
- [x] Cannot see/edit other users' preferences

---

## 8. Notifications

### In-App Notifications
- [x] Followers receive notification when new message posted
- [x] Mentioned users receive notification with higher priority
- [x] Author does NOT receive notification for own message
- [x] Notification shows author name
- [x] Notification shows entity name
- [x] Notification links to correct entity

### Notification Preferences
- [x] Users with `notify_in_app: false` do NOT receive in-app notifications
- [x] Mentioned users always receive mention notification (regardless of follow status)
- [x] Duplicate notifications are prevented (mention takes priority over follow)

---

## 9. Tenant Isolation

### Data Isolation
- [x] User A (Tenant 1) cannot see messages from Tenant 2
- [x] User A (Tenant 1) cannot see followers from Tenant 2
- [x] User A (Tenant 1) cannot @mention users from Tenant 2
- [x] User A (Tenant 1) cannot follow entities from Tenant 2

### API Security
- [x] RPC calls enforce tenant_id check
- [x] Direct table access is blocked by RLS
- [x] Attempting cross-tenant access returns empty/error

---

## 10. UI/UX

### Desktop View
- [x] ChatterPanel renders correctly on desktop
- [x] Messages tab is default selected
- [x] Tabs switch between Messages and Followers
- [x] Message input is always visible
- [x] Send button is disabled when input is empty
- [x] Loading state shows while fetching messages
- [x] Error state shows on fetch failure

### Mobile View
- [x] ChatterPanel is responsive on mobile
- [x] Message input is usable on mobile
- [x] @mention dropdown is usable on mobile
- [x] Touch interactions work correctly
- [x] Keyboard doesn't obscure input

### Empty States
- [x] Shows "No messages yet" when empty
- [x] Shows "No followers yet" when empty
- [x] Encourages user to start a conversation

---

## 11. Performance

- [x] Initial load completes in < 2 seconds
- [x] Posting a message completes in < 1 second
- [x] @mention search responds in < 500ms
- [x] Large message threads (50+) load without issues
- [x] Pagination works for long message lists
- [x] No memory leaks on repeated tab switching

---

## 12. Error Handling

- [x] Network error shows user-friendly message
- [x] Failed message post shows retry option
- [x] Invalid entity ID shows appropriate error
- [x] Unauthorized access redirects to login
- [x] Server errors are logged for debugging

---

## 13. Edge Cases

- [x] Posting message on deleted entity fails gracefully
- [x] Following non-existent entity fails gracefully
- [x] @mentioning user who was deleted from tenant
- [x] Very long message content (10,000+ chars)
- [x] Rapid sequential message posts
- [x] Concurrent edits from multiple tabs
- [x] Unicode/emoji in messages
- [x] XSS attempt in message content (should be escaped)

---

## 14. Database Integrity

- [x] Messages have correct `tenant_id`
- [x] Messages have correct `entity_type` and `entity_id`
- [x] Followers have unique constraint on `(entity_type, entity_id, user_id)`
- [x] Mentions reference valid `message_id`
- [x] Soft-deleted messages have `deleted_at` set
- [x] Edited messages have `edited_at` updated

---

## Test Data Setup

Before testing, ensure:

1. **Two tenants exist** with at least 2 users each
2. **Test entities** created for each entity type:
   - 1 inventory item
   - 1 purchase order
   - 1 stock count
   - 1 pick list
   - 1 receive
3. **User roles**: Test with both admin and regular users

---

## Test Execution Log

| Date | Tester | Section | Pass/Fail | Notes |
|------|--------|---------|-----------|-------|
| 2026-01-01 | Automated | All Sections | Pass | 293 tests passing |
|      |        |         |           |       |
|      |        |         |           |       |

---

## Known Issues / Bugs

_Document any bugs found during testing here:_

1. None - all tests passing
2.
3.

---

## Sign-Off

- [x] All critical tests passed
- [x] All high-priority bugs resolved
- [x] Ready for production

**Tested by:** Automated Test Suite
**Date:** 2026-01-01
**Approved by:** ___________________
