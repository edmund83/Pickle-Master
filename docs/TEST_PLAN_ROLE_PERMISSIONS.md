# Role Permission Test Plan

## Overview

This test plan covers the 3-role permission model:
- **Owner** - Full access including billing, team management, and all settings
- **Staff** - Create, edit, and delete inventory items. Manage orders and run reports
- **Viewer** - View inventory and reports (read-only access)

## Permission Matrix

| Feature | Owner | Staff | Viewer |
|---------|:-----:|:-----:|:------:|
| **Dashboard** |
| View dashboard | ✓ | ✓ | ✓ |
| View reports | ✓ | ✓ | ✓ |
| **Inventory** |
| View items | ✓ | ✓ | ✓ |
| Create items | ✓ | ✓ | ✗ |
| Edit items | ✓ | ✓ | ✗ |
| Delete items | ✓ | ✓ | ✗ |
| Move items | ✓ | ✓ | ✗ |
| Adjust quantity | ✓ | ✓ | ✗ |
| **Folders/Locations** |
| View folders | ✓ | ✓ | ✓ |
| Create folders | ✓ | ✓ | ✗ |
| Edit folders | ✓ | ✓ | ✗ |
| Delete folders | ✓ | ✓ | ✗ |
| **Tags** |
| View tags | ✓ | ✓ | ✓ |
| Create tags | ✓ | ✓ | ✗ |
| Edit tags | ✓ | ✓ | ✗ |
| Delete tags | ✓ | ✓ | ✗ |
| **Vendors** |
| View vendors | ✓ | ✓ | ✓ |
| Create vendors | ✓ | ✓ | ✗ |
| Edit vendors | ✓ | ✓ | ✗ |
| Delete vendors | ✓ | ✓ | ✗ |
| **Orders & Workflows** |
| View purchase orders | ✓ | ✓ | ✓ |
| Create purchase orders | ✓ | ✓ | ✗ |
| Edit purchase orders | ✓ | ✓ | ✗ |
| Delete purchase orders | ✓ | ✓ | ✗ |
| View pick lists | ✓ | ✓ | ✓ |
| Manage pick lists | ✓ | ✓ | ✗ |
| **Team Management** |
| View team members | ✓ | ✓ | ✓ |
| Invite members | ✓ | ✗ | ✗ |
| Change member roles | ✓ | ✗ | ✗ |
| Remove members | ✓ | ✗ | ✗ |
| Cancel invitations | ✓ | ✗ | ✗ |
| Resend invitations | ✓ | ✗ | ✗ |
| **Settings** |
| View organization settings | ✓ | ✗ | ✗ |
| Edit organization settings | ✓ | ✗ | ✗ |
| Manage payment terms | ✓ | ✗ | ✗ |
| Manage tax rates | ✓ | ✗ | ✗ |
| Manage labels | ✓ | ✓ | ✗ |
| **Billing** |
| View billing | ✓ | ✗ | ✗ |
| Manage subscription | ✓ | ✗ | ✗ |

---

## Test Categories

### 1. Unit Tests - Permission Helper Functions

**File:** `__tests__/auth/permission-helpers.test.ts`

```typescript
describe('Permission Helper Functions', () => {
  describe('hasWritePermission', () => {
    it('returns true for owner role')
    it('returns true for staff role')
    it('returns false for viewer role')
    it('returns false for undefined role')
    it('returns false for invalid role string')
  })

  describe('hasOwnerPermission', () => {
    it('returns true for owner role')
    it('returns false for staff role')
    it('returns false for viewer role')
  })

  describe('requireWritePermission', () => {
    it('returns success for owner context')
    it('returns success for staff context')
    it('returns error for viewer context')
    it('returns appropriate error message')
  })

  describe('requireOwnerPermission', () => {
    it('returns success for owner context')
    it('returns error for staff context')
    it('returns error for viewer context')
    it('returns appropriate error message')
  })
})
```

---

### 2. Integration Tests - Server Actions by Role

**File:** `__tests__/actions/permission-enforcement.test.ts`

#### 2.1 Inventory Actions

```typescript
describe('Inventory Actions - Role Permissions', () => {
  describe('createItem', () => {
    it('allows owner to create item')
    it('allows staff to create item')
    it('denies viewer from creating item')
    it('returns permission error for viewer')
  })

  describe('updateItem', () => {
    it('allows owner to update item')
    it('allows staff to update item')
    it('denies viewer from updating item')
  })

  describe('deleteItem', () => {
    it('allows owner to delete item')
    it('allows staff to delete item')
    it('denies viewer from deleting item')
  })

  describe('adjustQuantity', () => {
    it('allows owner to adjust quantity')
    it('allows staff to adjust quantity')
    it('denies viewer from adjusting quantity')
  })

  describe('moveItem', () => {
    it('allows owner to move item')
    it('allows staff to move item')
    it('denies viewer from moving item')
  })
})
```

#### 2.2 Team Management Actions

```typescript
describe('Team Management Actions - Role Permissions', () => {
  describe('sendInvitation', () => {
    it('allows owner to send invitation')
    it('denies staff from sending invitation')
    it('denies viewer from sending invitation')
    it('owner can only invite as staff or viewer (not owner)')
  })

  describe('cancelInvitation', () => {
    it('allows owner to cancel invitation')
    it('denies staff from canceling invitation')
    it('denies viewer from canceling invitation')
  })

  describe('resendInvitation', () => {
    it('allows owner to resend invitation')
    it('denies staff from resending invitation')
    it('denies viewer from resending invitation')
  })

  describe('updateMemberRole', () => {
    it('allows owner to change member role')
    it('denies staff from changing member role')
    it('denies viewer from changing member role')
    it('owner cannot demote themselves if only owner')
    it('owner can transfer ownership to another member')
  })

  describe('removeMember', () => {
    it('allows owner to remove member')
    it('denies staff from removing member')
    it('denies viewer from removing member')
    it('owner cannot remove themselves')
  })
})
```

#### 2.3 Settings Actions

```typescript
describe('Settings Actions - Role Permissions', () => {
  describe('updateOrganizationSettings', () => {
    it('allows owner to update org settings')
    it('denies staff from updating org settings')
    it('denies viewer from updating org settings')
  })

  describe('managePaymentTerms', () => {
    it('allows owner to create payment terms')
    it('allows owner to update payment terms')
    it('allows owner to delete payment terms')
    it('denies staff from managing payment terms')
    it('denies viewer from managing payment terms')
  })

  describe('manageTaxRates', () => {
    it('allows owner to manage tax rates')
    it('denies staff from managing tax rates')
    it('denies viewer from managing tax rates')
  })
})
```

#### 2.4 Folder Actions

```typescript
describe('Folder Actions - Role Permissions', () => {
  describe('createFolder', () => {
    it('allows owner to create folder')
    it('allows staff to create folder')
    it('denies viewer from creating folder')
  })

  describe('updateFolder', () => {
    it('allows owner to update folder')
    it('allows staff to update folder')
    it('denies viewer from updating folder')
  })

  describe('deleteFolder', () => {
    it('allows owner to delete folder')
    it('allows staff to delete folder')
    it('denies viewer from deleting folder')
  })
})
```

#### 2.5 Vendor Actions

```typescript
describe('Vendor Actions - Role Permissions', () => {
  describe('createVendor', () => {
    it('allows owner to create vendor')
    it('allows staff to create vendor')
    it('denies viewer from creating vendor')
  })

  describe('updateVendor', () => {
    it('allows owner to update vendor')
    it('allows staff to update vendor')
    it('denies viewer from updating vendor')
  })

  describe('deleteVendor', () => {
    it('allows owner to delete vendor')
    it('allows staff to delete vendor')
    it('denies viewer from deleting vendor')
  })
})
```

---

### 3. RLS Policy Tests (Database Level)

**File:** `__tests__/security/rls-role-policies.test.ts`

```typescript
describe('RLS Role-Based Policies', () => {
  // Setup: Create test users with each role in same tenant

  describe('items table', () => {
    it('owner can SELECT items in their tenant')
    it('staff can SELECT items in their tenant')
    it('viewer can SELECT items in their tenant')
    it('owner can INSERT items')
    it('staff can INSERT items')
    it('viewer CANNOT INSERT items')
    it('owner can UPDATE items')
    it('staff can UPDATE items')
    it('viewer CANNOT UPDATE items')
    it('owner can DELETE items')
    it('staff can DELETE items')
    it('viewer CANNOT DELETE items')
  })

  describe('team_invitations table', () => {
    it('owner can SELECT invitations')
    it('staff can SELECT invitations')
    it('viewer can SELECT invitations')
    it('owner can INSERT invitations')
    it('staff CANNOT INSERT invitations')
    it('viewer CANNOT INSERT invitations')
    it('owner can UPDATE invitations')
    it('staff CANNOT UPDATE invitations')
    it('viewer CANNOT UPDATE invitations')
    it('owner can DELETE invitations')
    it('staff CANNOT DELETE invitations')
    it('viewer CANNOT DELETE invitations')
  })

  describe('profiles table', () => {
    it('owner can UPDATE other profiles in tenant')
    it('staff CANNOT UPDATE other profiles')
    it('viewer CANNOT UPDATE other profiles')
    it('any user can UPDATE their own profile (name, avatar)')
  })

  describe('tenants table', () => {
    it('owner can UPDATE tenant settings')
    it('staff CANNOT UPDATE tenant settings')
    it('viewer CANNOT UPDATE tenant settings')
  })

  describe('payment_terms table', () => {
    it('all roles can SELECT payment terms')
    it('owner can INSERT payment terms')
    it('staff CANNOT INSERT payment terms')
    it('viewer CANNOT INSERT payment terms')
  })

  describe('folders table', () => {
    it('all roles can SELECT folders')
    it('owner can INSERT folders')
    it('staff can INSERT folders')
    it('viewer CANNOT INSERT folders')
  })

  describe('vendors table', () => {
    it('all roles can SELECT vendors')
    it('owner can INSERT vendors')
    it('staff can INSERT vendors')
    it('viewer CANNOT INSERT vendors')
  })
})
```

---

### 4. UI Component Tests

**File:** `__tests__/components/role-based-ui.test.tsx`

#### 4.1 Team Settings Page

```typescript
describe('Team Settings Page - Role-Based UI', () => {
  describe('Owner view', () => {
    it('renders "Invite Member" button')
    it('shows role dropdown for each member')
    it('shows "Remove" option for other members')
    it('does not show "Remove" for self')
    it('shows pending invitations with cancel/resend options')
  })

  describe('Staff view', () => {
    it('does NOT render "Invite Member" button')
    it('does NOT show role dropdown (read-only badges)')
    it('does NOT show "Remove" option')
    it('shows pending invitations without action buttons')
  })

  describe('Viewer view', () => {
    it('does NOT render "Invite Member" button')
    it('shows read-only member list')
    it('shows own role badge')
  })
})
```

#### 4.2 Inventory Page

```typescript
describe('Inventory Page - Role-Based UI', () => {
  describe('Owner/Staff view', () => {
    it('renders "Add Item" button')
    it('shows edit button on item cards')
    it('shows delete option in item menu')
    it('shows quantity adjustment controls')
  })

  describe('Viewer view', () => {
    it('does NOT render "Add Item" button')
    it('does NOT show edit button')
    it('does NOT show delete option')
    it('does NOT show quantity adjustment controls')
    it('renders view-only item details')
  })
})
```

#### 4.3 Navigation/Sidebar

```typescript
describe('Navigation - Role-Based Links', () => {
  describe('Owner view', () => {
    it('shows all settings links')
    it('shows billing link')
    it('shows team management link')
  })

  describe('Staff view', () => {
    it('shows limited settings links')
    it('does NOT show billing link')
    it('shows team link (view only)')
  })

  describe('Viewer view', () => {
    it('shows minimal navigation')
    it('does NOT show settings links')
    it('does NOT show billing link')
  })
})
```

---

### 5. E2E Tests (Playwright)

**File:** `e2e/role-permissions.spec.ts`

#### 5.1 Test Setup

```typescript
// Create 3 test users in same organization
const ownerUser = { email: 'owner@test.com', role: 'owner' }
const staffUser = { email: 'staff@test.com', role: 'staff' }
const viewerUser = { email: 'viewer@test.com', role: 'viewer' }
```

#### 5.2 Owner E2E Tests

```typescript
describe('Owner Role E2E', () => {
  beforeEach(() => loginAs(ownerUser))

  it('can access all dashboard pages')
  it('can create inventory items')
  it('can edit inventory items')
  it('can delete inventory items')
  it('can access team settings')
  it('can invite new team member')
  it('can change member role from staff to viewer')
  it('can remove team member')
  it('can access billing page')
  it('can update organization settings')
})
```

#### 5.3 Staff E2E Tests

```typescript
describe('Staff Role E2E', () => {
  beforeEach(() => loginAs(staffUser))

  it('can access dashboard')
  it('can create inventory items')
  it('can edit inventory items')
  it('can delete inventory items')
  it('can view team page')
  it('cannot see invite button on team page')
  it('cannot change member roles')
  it('is redirected from billing page')
  it('cannot access organization settings')
})
```

#### 5.4 Viewer E2E Tests

```typescript
describe('Viewer Role E2E', () => {
  beforeEach(() => loginAs(viewerUser))

  it('can access dashboard (read-only)')
  it('can view inventory items')
  it('cannot see "Add Item" button')
  it('cannot edit items (no edit button)')
  it('can view reports')
  it('cannot modify any data')
  it('is redirected from settings pages')
  it('can view own profile')
  it('can update own profile (name, avatar only)')
})
```

#### 5.5 Permission Escalation Tests

```typescript
describe('Permission Escalation Prevention', () => {
  it('staff cannot access owner endpoints via direct URL')
  it('viewer cannot access staff endpoints via direct URL')
  it('API calls with wrong role return 403')
  it('direct form POST with viewer session is rejected')
  it('role change via browser console has no effect')
})
```

---

### 6. Security Edge Cases

**File:** `__tests__/security/permission-edge-cases.test.ts`

```typescript
describe('Permission Edge Cases', () => {
  describe('Role Modification', () => {
    it('prevents owner from demoting self if only owner')
    it('allows owner transfer when multiple owners exist')
    it('new invitation cannot create owner role')
  })

  describe('Tenant Isolation', () => {
    it('owner cannot see items from other tenants')
    it('owner cannot modify items from other tenants')
    it('staff cannot cross tenant boundaries')
  })

  describe('Deleted/Deactivated Users', () => {
    it('removed user cannot access organization')
    it('changed role takes effect immediately')
  })

  describe('Concurrent Modifications', () => {
    it('handles role change during active session')
    it('handles user removal during active session')
  })

  describe('API Direct Access', () => {
    it('rejects requests with tampered role claims')
    it('validates role against database, not JWT alone')
  })
})
```

---

## Test Execution Strategy

### Phase 1: Unit Tests
- Run with: `npm test -- --testPathPattern=permission-helpers`
- Coverage target: 100% for permission helper functions

### Phase 2: Integration Tests
- Run with: `npm test -- --testPathPattern=permission-enforcement`
- Requires: Test database with seed data
- Coverage target: All server actions with role checks

### Phase 3: RLS Tests
- Run with: `npm test -- --testPathPattern=rls-role-policies`
- Requires: Direct database connection for each role
- Coverage target: All tables with RLS policies

### Phase 4: UI Tests
- Run with: `npm test -- --testPathPattern=role-based-ui`
- Uses: React Testing Library
- Coverage target: All role-conditional UI elements

### Phase 5: E2E Tests
- Run with: `npx playwright test e2e/role-permissions.spec.ts`
- Requires: Running dev server, test accounts
- Coverage target: Critical user journeys per role

---

## Test Data Requirements

### Test Users (per tenant)
| Email | Role | Purpose |
|-------|------|---------|
| `owner@testorg.com` | owner | Full access testing |
| `staff@testorg.com` | staff | Write access testing |
| `viewer@testorg.com` | viewer | Read-only testing |

### Test Items
- 5 inventory items with various states
- 3 folders in hierarchy
- 2 vendors
- 3 tags

### Test Invitations
- 1 pending invitation (for cancel/resend tests)
- 1 expired invitation (for edge case tests)

---

## Acceptance Criteria

- [ ] All permission helper functions have 100% test coverage
- [ ] All server actions check permissions before execution
- [ ] All RLS policies enforce role restrictions correctly
- [ ] UI hides/shows controls based on user role
- [ ] E2E tests pass for all 3 roles
- [ ] No permission escalation vulnerabilities found
- [ ] Direct API access respects role permissions
- [ ] Tenant isolation is maintained across all roles

---

## Related Files

- `lib/auth/server-auth.ts` - Permission helper functions
- `app/actions/*.ts` - Server actions to test
- `supabase/migrations/00089_*.sql` - Role simplification
- `supabase/migrations/00092_*.sql` - RLS hardening
- `supabase/migrations/00105_*.sql` - Owner role update policy
- `app/(dashboard)/settings/team/` - Team management UI

---

## Appendix A: Manual Testing Checklist

### A.1 Owner Role Manual Tests

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Login as owner | Enter owner credentials | Dashboard loads | ☐ |
| 2 | View inventory | Navigate to /inventory | All items visible | ☐ |
| 3 | Create item | Click "Add Item", fill form | Item created | ☐ |
| 4 | Edit item | Click edit, modify, save | Changes saved | ☐ |
| 5 | Delete item | Click delete, confirm | Item removed | ☐ |
| 6 | Create folder | Click "New Folder" | Folder created | ☐ |
| 7 | View team | Navigate to /settings/team | All members shown | ☐ |
| 8 | Invite member | Click "Invite", enter email | Invitation sent | ☐ |
| 9 | Change role | Click member menu, change role | Role updated | ☐ |
| 10 | Remove member | Click remove, confirm | Member removed | ☐ |
| 11 | Resend invitation | Click resend on pending | Invitation resent | ☐ |
| 12 | Cancel invitation | Click cancel on pending | Invitation cancelled | ☐ |
| 13 | Access billing | Navigate to /settings/billing | Billing page loads | ☐ |
| 14 | Access company settings | Navigate to /settings/company | Settings page loads | ☐ |
| 15 | Create payment term | Add new payment term | Term created | ☐ |

### A.2 Staff Role Manual Tests

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Login as staff | Enter staff credentials | Dashboard loads | ☐ |
| 2 | View inventory | Navigate to /inventory | All items visible | ☐ |
| 3 | Create item | Click "Add Item", fill form | Item created | ☐ |
| 4 | Edit item | Click edit, modify, save | Changes saved | ☐ |
| 5 | Delete item | Click delete, confirm | Item removed | ☐ |
| 6 | Create folder | Click "New Folder" | Folder created | ☐ |
| 7 | View team | Navigate to /settings/team | Members shown (read-only) | ☐ |
| 8 | Invite button hidden | Check team page header | No "Invite" button | ☐ |
| 9 | Role change hidden | Check member cards | No role dropdown | ☐ |
| 10 | Remove hidden | Check member actions | No remove option | ☐ |
| 11 | Billing blocked | Navigate to /settings/billing | Redirected or denied | ☐ |
| 12 | Company settings blocked | Navigate to /settings/company | Redirected or denied | ☐ |
| 13 | Create vendor | Add new vendor | Vendor created | ☐ |
| 14 | Create customer | Add new customer | Customer created | ☐ |

### A.3 Viewer Role Manual Tests

| # | Test | Steps | Expected | Pass? |
|---|------|-------|----------|-------|
| 1 | Login as viewer | Enter viewer credentials | Dashboard loads | ☐ |
| 2 | View inventory | Navigate to /inventory | All items visible | ☐ |
| 3 | Add Item hidden | Check inventory page | No "Add Item" button | ☐ |
| 4 | Edit hidden | Check item cards | No edit button | ☐ |
| 5 | Delete hidden | Check item menu | No delete option | ☐ |
| 6 | New Folder hidden | Check sidebar | No "New Folder" button | ☐ |
| 7 | Quantity controls hidden | Check item detail | No +/- buttons | ☐ |
| 8 | View team | Navigate to /settings/team | Members shown (read-only) | ☐ |
| 9 | View reports | Navigate to /reports | Reports visible | ☐ |
| 10 | Update own profile | Edit name in profile | Name updated | ☐ |
| 11 | Direct API create | POST /api/items via curl | 403 Forbidden | ☐ |
| 12 | Direct API update | PUT /api/items/:id via curl | 403 Forbidden | ☐ |

---

## Appendix B: API Permission Matrix

| Endpoint | Method | Owner | Staff | Viewer |
|----------|--------|:-----:|:-----:|:------:|
| `/api/items` | GET | ✓ | ✓ | ✓ |
| `/api/items` | POST | ✓ | ✓ | ✗ |
| `/api/items/:id` | GET | ✓ | ✓ | ✓ |
| `/api/items/:id` | PUT | ✓ | ✓ | ✗ |
| `/api/items/:id` | DELETE | ✓ | ✓ | ✗ |
| `/api/folders` | GET | ✓ | ✓ | ✓ |
| `/api/folders` | POST | ✓ | ✓ | ✗ |
| `/api/folders/:id` | PUT | ✓ | ✓ | ✗ |
| `/api/folders/:id` | DELETE | ✓ | ✓ | ✗ |
| `/api/invitations` | GET | ✓ | ✓ | ✓ |
| `/api/invitations` | POST | ✓ | ✗ | ✗ |
| `/api/invitations/:id/resend` | POST | ✓ | ✗ | ✗ |
| `/api/invitations/:id` | DELETE | ✓ | ✗ | ✗ |
| `/api/members/:id/role` | PUT | ✓ | ✗ | ✗ |
| `/api/members/:id` | DELETE | ✓ | ✗ | ✗ |
| `/api/settings/company` | GET | ✓ | ✗ | ✗ |
| `/api/settings/company` | PUT | ✓ | ✗ | ✗ |
| `/api/billing` | GET | ✓ | ✗ | ✗ |
| `/api/vendors` | GET | ✓ | ✓ | ✓ |
| `/api/vendors` | POST | ✓ | ✓ | ✗ |
| `/api/customers` | GET | ✓ | ✓ | ✓ |
| `/api/customers` | POST | ✓ | ✓ | ✗ |

---

## Appendix C: RLS Policy Quick Reference

### Tables with Write Permission (owner + staff)
- `inventory_items`
- `folders`
- `tags`
- `vendors`
- `customers`
- `purchase_orders`
- `sales_orders`
- `pick_lists`
- `reminders` (with creator check)

### Tables with Owner-Only Write
- `team_invitations`
- `profiles` (for role changes)
- `tenants`
- `payment_terms`
- `tax_rates`

### All Roles Read Access
- All above tables have SELECT for tenant members

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-02-01 | 1.0 | Claude | Initial test plan |
| 2026-02-01 | 1.1 | Claude | Added manual testing checklists, API matrix, RLS reference |
