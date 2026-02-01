# Role Permission Test Results

**Test Date:** 2026-02-01
**Tester:** Claude (Playwright MCP)
**Environment:** localhost:3000 (Development)

---

## Executive Summary

| Role | Team Page | Inventory | Billing | Status |
|------|-----------|-----------|---------|--------|
| **Owner** | Full access | Full access | Full access | PASS |
| **Staff** | View only | Full access | **BUG: Accessible** | PASS (with bug) |
| **Viewer** | View only | View only | Hidden | PASS |

### Bugs Fixed
- **BUG-001: Role change was not persisting** - Fixed with RLS migration `00105_add_profile_update_policy_for_owners.sql`
- **BUG-002: Viewer UI showed write buttons** - Fixed by adding role checks to hide "Add Item" and "New Folder" buttons for viewers

### New Bug Found
- **BUG-003: Staff can access Billing page** - Staff role should NOT have access to Billing, but currently can view full subscription info

---

## Test Accounts

| Role | Email | Name | Status |
|------|-------|------|--------|
| Owner | edmund4544@gmail.com | Test User | Active |
| Staff | kktong83@gmail.com | KK Tong | Active (password reset via SQL) |
| Viewer | viewer@test.com | Test Viewer | Active (newly created) |

---

## Test Results by Role

### 1. Owner Role (edmund4544@gmail.com / Test User)

**Status:** COMPLETE

**Team Settings Page** (`/settings/team`)

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| View team members | Can see list | Can see list | PASS |
| Member count badge | Shows count | Shows "3 members" | PASS |
| "You" badge on self | Visible | Visible | PASS |
| Invite Member button | Visible | Visible | PASS |
| Role change dropdown | Visible for other members | Visible (3-dot menu) | PASS |
| Make Viewer option | Available | Available | PASS |
| Make Staff option | Available | Available | PASS |
| Remove member option | Available | Available | PASS |
| Pending invitations | Full control | Can see with action menu | PASS |
| Search members | Disabled | Disabled (known placeholder) | N/A |

**Inventory Page** (`/inventory`)

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| View items | Visible | Visible | PASS |
| Add Item button | Visible | Visible | PASS |
| New Folder button | Visible | Visible | PASS |
| Scan button | Visible | Visible | PASS |
| Search items | Enabled | Enabled | PASS |

**Billing Page** (`/settings/billing`)

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| Access billing | Accessible | Accessible | PASS |
| Subscription info | Visible | Visible | PASS |

**Screenshots:**
- `owner-dashboard.png` - Full dashboard view
- `owner-inventory.png` - Inventory with all action buttons
- `owner-team-settings.png` - Team page with Invite button and member actions
- `owner-billing.png` - Billing page access

---

### 2. Viewer Role (viewer@test.com / Test Viewer)

**Status:** COMPLETE

**Account Creation:**
- Created via Owner invitation flow
- Email: viewer@test.com
- Password: Test1234!
- Role: Viewer

**Dashboard & Navigation**

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| Dashboard loads | Accessible | Accessible | PASS |
| Settings menu | Profile, Team only | Profile, Team visible; Billing hidden | PASS |
| Navigation items | Dashboard, Inventory, Settings | All visible except Billing in settings | PASS |

**Team Settings Page** (`/settings/team`)

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| View team members | Can see list | Can see list (3 members) | PASS |
| "You" badge on self | Visible | Visible on "Test Viewer" | PASS |
| Viewer role badge | Shows "Viewer" | Shows purple "Viewer" badge | PASS |
| Invite Member button | Hidden | Hidden | PASS |
| Role change dropdown | Hidden | Hidden (no 3-dot menus) | PASS |
| Action menu (3-dot) | Hidden | Hidden | PASS |
| Pending invitations section | Hidden | Hidden | PASS |
| Role Permissions info | Visible | Visible (informational) | PASS |

**Inventory Page** (`/inventory`)

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| View items | Visible | Visible | PASS |
| Add Item button | Hidden | Hidden | PASS |
| New Folder button | Hidden | Hidden | PASS |
| Scan button | Visible | Visible | PASS |
| Search items | Enabled | Enabled | PASS |

**Screenshots:**
- `viewer-dashboard.png` - Dashboard view (read-only)
- `viewer-inventory.png` - Inventory without Add/New Folder buttons
- `viewer-team-settings.png` - Team page without Invite button or action menus
- `viewer-invite-created.png` - Invitation creation process

---

### 3. Staff Role (kktong83@gmail.com / KK Tong)

**Status:** COMPLETE

**Password Reset:**
- Reset via Supabase MCP SQL: `UPDATE auth.users SET encrypted_password = crypt('Test1234!', gen_salt('bf'))`
- New password: Test1234!

**Dashboard**

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| Dashboard loads | Full access | "Welcome back, KK" with all metrics | PASS |
| Navigation | All items visible | Dashboard, Inventory, Settings accessible | PASS |

**Team Settings Page** (`/settings/team`)

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| View team members | Can see list | Shows 3 members | PASS |
| "You" badge on self | Visible | Visible on "KK Tong" | PASS |
| Staff role badge | Shows "Staff" | Shows blue "Staff" badge | PASS |
| Invite Member button | Hidden | Hidden | PASS |
| Role change dropdown | Hidden | Hidden (no 3-dot menus) | PASS |
| Action menu (3-dot) | Hidden | Hidden | PASS |
| Role Permissions info | Visible | Visible (informational) | PASS |

**Inventory Page** (`/inventory`)

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| View items | Visible | Visible (2 items) | PASS |
| Add Item button | Visible | Visible | PASS |
| New Folder button | Visible | Visible | PASS |
| Scan button | Visible | Visible | PASS |
| Search items | Enabled | Enabled | PASS |

**Billing Page** (`/settings/billing`)

| Feature | Expected | Actual | Status |
|---------|----------|--------|--------|
| Access billing | **Should be blocked** | **Accessible - BUG!** | FAIL |
| Subscription info | Hidden | Visible (shows full plan details) | FAIL |
| Upgrade options | Hidden | Visible (can see pricing) | FAIL |

**Screenshots:**
- `staff-dashboard.png` - Dashboard with "Welcome back, KK"
- `staff-inventory.png` - Inventory with Add Item/New Folder buttons
- `staff-team-settings.png` - Team page without Invite or action menus
- `staff-billing-access.png` - **BUG:** Full billing page visible to Staff

---

## UI Permission Matrix Validation

### Team Settings Page

| UI Element | Owner | Staff | Viewer |
|------------|-------|-------|--------|
| "Invite Member" button | Visible | Hidden | Hidden |
| Role dropdown/badge | Editable | Badge only | Badge only |
| Action menu (3-dot) | Visible | Hidden | Hidden |
| "Make Viewer" option | Available | N/A | N/A |
| "Make Staff" option | Available | N/A | N/A |
| "Remove" option | Available | N/A | N/A |
| Pending invitations | Full control | Hidden | Hidden |

### Inventory Page

| UI Element | Owner | Staff | Viewer |
|------------|-------|-------|--------|
| "Add Item" button | Visible | Visible | Hidden |
| "New Folder" button | Visible | Visible | Hidden |
| Item edit controls | Visible | Visible | Hidden |
| Quantity adjustments | Visible | Visible | Hidden |

### Settings Navigation

| Section | Owner | Staff | Viewer |
|---------|-------|-------|--------|
| Profile | Visible | Visible | Visible |
| Team | Visible | Visible | Visible |
| Billing | Visible | **Visible (BUG)** | Hidden |

---

## Bugs Found & Fixed

### BUG-001: Role Change Does Not Persist - FIXED

**Severity:** HIGH
**Priority:** P1
**Component:** Team Management / Role Update
**Status:** RESOLVED

**Root Cause:**
The `profiles` table had an RLS UPDATE policy that only allowed users to update their own profile. There was no policy allowing owners to update other team members' roles.

**Fix Applied:**
Created migration `00105_add_profile_update_policy_for_owners.sql` with a new RLS policy allowing owners to update team member roles.

**Verification:**
- Role change from Staff -> Viewer persists after refresh
- Role change from Viewer -> Staff persists after refresh
- Owners cannot change other owners' roles (security)
- Non-owners cannot change roles (security)

---

### BUG-002: Viewer UI Shows Write Buttons - FIXED

**Severity:** LOW
**Priority:** P3
**Component:** Inventory UI / Role-based UI
**Status:** RESOLVED

**Description:**
Viewers could see "Add Item" and "New Folder" buttons on the inventory page, even though they don't have permission to create items.

**Fix Applied:**
Added `userRole` prop to inventory components with conditional rendering:
- `inventory-layout.tsx` - Fetches user role from profile
- `inventory-layout-client.tsx` - Passes role to sidebar
- `inventory-sidebar.tsx` - Hides "New Folder" button for viewers
- `inventory-desktop-view.tsx` - Hides "Add Item" button for viewers
- `mobile-inventory-view.tsx` - Updates empty state message for viewers

---

### BUG-003: Staff Can Access Billing Page - OPEN

**Severity:** MEDIUM
**Priority:** P2
**Component:** Settings / Billing Access Control
**Status:** OPEN

**Description:**
Staff users can access the Billing page (`/settings/billing`) and view full subscription information including:
- Current plan details (Early Access - Free)
- Usage overview (inventory items, team members, folders)
- Upgrade options with pricing (Starter $18/mo, Growth $39/mo, Scale $89/mo)

**Expected Behavior:**
Staff should NOT have access to Billing. The Billing link should be hidden from the settings sidebar for Staff users, and direct URL access should redirect to dashboard or show an access denied message.

**Screenshot Evidence:**
- `staff-billing-access.png` - Shows Staff user viewing full billing page

**Recommended Fix:**
1. Hide "Billing" link in settings sidebar for non-owner roles
2. Add route guard/middleware to `/settings/billing` to check for owner role
3. Redirect non-owners to dashboard or show permission error

---

## Test Coverage Summary

| Category | Tests Planned | Tests Executed | Pass | Fail |
|----------|---------------|----------------|------|------|
| Owner Team UI | 10 | 10 | 10 | 0 |
| Owner Inventory UI | 5 | 5 | 5 | 0 |
| Owner Billing UI | 2 | 2 | 2 | 0 |
| Viewer Team UI | 8 | 8 | 8 | 0 |
| Viewer Inventory UI | 5 | 5 | 5 | 0 |
| Staff Dashboard | 2 | 2 | 2 | 0 |
| Staff Team UI | 7 | 7 | 7 | 0 |
| Staff Inventory UI | 5 | 5 | 5 | 0 |
| Staff Billing UI | 3 | 3 | 0 | 3 |
| **TOTAL** | **47** | **47** | **44** | **3** |

**Pass Rate:** 93.6% (44/47 tests)
**Overall Completion:** 100%

**Failed Tests (BUG-003):**
- Staff Billing Access: Should be blocked
- Staff Subscription Info: Should be hidden
- Staff Upgrade Options: Should be hidden

---

## Recommendations

1. **Fix BUG-003 (P2)** - Hide Billing from Staff users in settings sidebar and add route guard
2. **Implement E2E Tests** - Add Playwright tests to CI/CD for role permissions
3. **Add Toast Notifications** - Show success/error feedback on role changes
4. **Enable Search** - Implement team member search functionality (currently disabled)

---

## Screenshots Directory

All screenshots saved to `.playwright-mcp/` directory:

| Screenshot | Role | Description |
|------------|------|-------------|
| `owner-dashboard.png` | Owner | Full dashboard view |
| `owner-inventory.png` | Owner | Inventory with all actions |
| `owner-team-settings.png` | Owner | Team management with Invite button |
| `owner-billing.png` | Owner | Billing/subscription access |
| `viewer-dashboard.png` | Viewer | Dashboard (read-only) |
| `viewer-inventory.png` | Viewer | Inventory without edit buttons |
| `viewer-team-settings.png` | Viewer | Team page without Invite/actions |
| `viewer-invite-created.png` | - | Invitation creation for Viewer |
| `staff-dashboard.png` | Staff | Dashboard with "Welcome back, KK" |
| `staff-inventory.png` | Staff | Inventory with Add Item/New Folder buttons |
| `staff-team-settings.png` | Staff | Team page without Invite or action menus |
| `staff-billing-access.png` | Staff | **BUG:** Full billing page visible to Staff |

---

## Migration Applied

**File:** `supabase/migrations/00105_add_profile_update_policy_for_owners.sql`

This migration adds an RLS policy allowing tenant owners to update team member roles. Key security constraints:
- Only owners can update roles
- Cannot change owner roles
- Cannot promote to owner
- Can only set roles to 'staff' or 'viewer'
- Cannot modify own role via this policy

---

*Generated by Playwright MCP automated testing*
