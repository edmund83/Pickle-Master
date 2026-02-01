# Team Functionality Test Plan

## Overview

This test plan covers all team-related functionality in StockZip, including:
- Team member management
- Role-based access control
- Invitation system
- Quota enforcement
- Row-Level Security (RLS) policies

---

## 1. Role System Tests

### 1.1 Role Definitions

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| ROLE-001 | Verify owner has full access | Login as owner, attempt all operations | All operations succeed |
| ROLE-002 | Verify staff has write access | Login as staff, attempt CRUD on inventory | Create/Read/Update/Delete succeed |
| ROLE-003 | Verify staff cannot manage team | Login as staff, navigate to team settings | Team management options hidden/disabled |
| ROLE-004 | Verify viewer has read-only access | Login as viewer, attempt to edit item | Edit operations blocked |
| ROLE-005 | Verify viewer cannot delete | Login as viewer, attempt to delete item | Delete blocked with permission error |

### 1.2 Role Display

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| ROLE-010 | Role badge displays correctly | View team members list | Each member shows correct role badge (Owner/Staff/Viewer) |
| ROLE-011 | Role permissions guide visible | Navigate to team settings | Role permissions section shows accurate capabilities |

---

## 2. Invitation System Tests

### 2.1 Create Invitation

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| INV-001 | Owner can create invitation | As owner, invite new email as staff | Invitation created, email sent, link displayed |
| INV-002 | Staff cannot create invitation | As staff, attempt to access invite dialog | Invite button hidden or action returns 403 |
| INV-003 | Viewer cannot create invitation | As viewer, attempt to access invite dialog | Invite button hidden or action returns 403 |
| INV-004 | Cannot invite existing member | Invite email that already belongs to team | Error: "User is already a team member" |
| INV-005 | Cannot invite with pending invitation | Invite email with existing pending invite | Error: "An invitation has already been sent" |
| INV-006 | Email validation | Invite with invalid email format | Form validation error |
| INV-007 | Can invite as staff role | Create invitation with staff role | Invitation created with role=staff |
| INV-008 | Can invite as viewer role | Create invitation with viewer role | Invitation created with role=viewer |
| INV-009 | Cannot invite as owner | Attempt to invite with owner role | Role option not available or error |

### 2.2 View Invitations

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| INV-020 | Owner can view pending invitations | As owner, view team settings | Pending invitations section visible with details |
| INV-021 | Staff cannot view invitations | As staff, view team settings | Pending invitations section hidden |
| INV-022 | Expired invitations not shown | Wait for invitation to expire | Invitation removed from pending list |
| INV-023 | Accepted invitations not shown | Accept an invitation | Invitation removed from pending list |

### 2.3 Cancel Invitation

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| INV-030 | Owner can cancel invitation | As owner, click cancel on pending invite | Invitation deleted, removed from list |
| INV-031 | Staff cannot cancel invitation | As staff, attempt cancel action | Action blocked with permission error |
| INV-032 | Cannot cancel accepted invitation | Attempt to cancel already-accepted invite | Error or invitation not in list |

### 2.4 Resend Invitation

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| INV-040 | Owner can resend invitation | As owner, click resend on pending invite | New token generated, email sent, expiry reset |
| INV-041 | Staff cannot resend invitation | As staff, attempt resend action | Action blocked with permission error |
| INV-042 | Expiry date updates on resend | Resend invitation, check expires_at | New 7-day expiry from current time |

### 2.5 Accept Invitation

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| INV-050 | Valid token shows signup form | Navigate to /accept-invite/{valid_token} | Team name, role, and signup form displayed |
| INV-051 | Invalid token shows error | Navigate to /accept-invite/invalidtoken | Error: "Invalid invitation link" |
| INV-052 | Expired token shows error | Navigate to /accept-invite/{expired_token} | Error: "Invitation has expired" |
| INV-053 | Already-accepted token shows error | Navigate to /accept-invite/{used_token} | Error: "Invitation already accepted" |
| INV-054 | Can complete signup with valid token | Fill form, submit with valid token | User created, profile created, redirected to login |
| INV-055 | Password minimum length enforced | Submit with password < 8 chars | Validation error |
| INV-056 | Full name required | Submit without full name | Validation error |
| INV-057 | Terms acceptance required | Submit without checking terms | Validation error |
| INV-058 | Invited user gets correct role | Accept invite for staff role | User profile has role=staff |
| INV-059 | Email auto-confirmed on accept | Accept invitation | User can login immediately (no email verification) |
| INV-060 | User added to correct tenant | Accept invitation, login | User sees inviting team's inventory |

### 2.6 Invitation Tokens

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| INV-070 | Token is secure random | Create invitation, inspect token | 32-byte hex string (64 chars) |
| INV-071 | Token is unique per invitation | Create multiple invitations | Each has unique token |
| INV-072 | Resend generates new token | Resend invitation | New token differs from original |

---

## 3. Team Member Management Tests

### 3.1 View Team Members

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| TEAM-001 | All members visible to owner | As owner, view team settings | All team members listed with roles |
| TEAM-002 | All members visible to staff | As staff, view team settings | All team members listed (read-only) |
| TEAM-003 | All members visible to viewer | As viewer, view team settings | All team members listed (read-only) |
| TEAM-004 | Member details correct | View member list | Name, email, avatar, role displayed |
| TEAM-005 | Current user highlighted | View member list | Current user marked or styled differently |

### 3.2 Update Member Role

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| TEAM-010 | Owner can change staff to viewer | As owner, change member from staff to viewer | Role updated, UI reflects change |
| TEAM-011 | Owner can change viewer to staff | As owner, change member from viewer to staff | Role updated, UI reflects change |
| TEAM-012 | Staff cannot change roles | As staff, attempt role change | Action hidden or blocked |
| TEAM-013 | Viewer cannot change roles | As viewer, attempt role change | Action hidden or blocked |
| TEAM-014 | Cannot change own role | As owner, attempt to change own role | Option not available or error |
| TEAM-015 | Cannot change owner's role | As owner, attempt to change another owner | Option not available or error |
| TEAM-016 | Role change takes effect immediately | Change role, verify new permissions | Changed user's permissions update |

### 3.3 Remove Team Member

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| TEAM-020 | Owner can remove staff | As owner, remove staff member | Member removed, cannot access team |
| TEAM-021 | Owner can remove viewer | As owner, remove viewer member | Member removed, cannot access team |
| TEAM-022 | Staff cannot remove members | As staff, attempt removal | Action hidden or blocked |
| TEAM-023 | Viewer cannot remove members | As viewer, attempt removal | Action hidden or blocked |
| TEAM-024 | Cannot remove self | As owner, attempt self-removal | Option not available or error |
| TEAM-025 | Cannot remove owner | Attempt to remove owner | Option not available or error |
| TEAM-026 | Removal confirmation required | Click remove member | Confirmation dialog appears |
| TEAM-027 | Removed user cannot login to team | Remove user, user attempts login | User redirected or sees different tenant |

---

## 4. Quota Enforcement Tests

### 4.1 User Quota Limits

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| QUOTA-001 | Starter plan allows 1 user | Create invitation on starter plan with 1 user | Error: quota exceeded |
| QUOTA-002 | Team plan allows 10 users | Invite users up to limit on team plan | 10th invite succeeds, 11th fails |
| QUOTA-003 | Business plan allows 25 users | Invite users up to limit on business plan | 25th invite succeeds, 26th fails |
| QUOTA-004 | Pending invites count toward quota | 5 users + 5 pending on team plan | Cannot create more invitations |
| QUOTA-005 | Cancelled invite frees quota | Cancel pending invitation | Can create new invitation |
| QUOTA-006 | Expired invite frees quota | Wait for invitation to expire | Can create new invitation |

### 4.2 Plan Limits

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| QUOTA-010 | Plan upgrade increases limit | Upgrade from starter to team | Can now invite additional users |
| QUOTA-011 | Plan downgrade enforcement | Downgrade with users over limit | Existing users kept, no new invites allowed |

---

## 5. Row-Level Security (RLS) Tests

### 5.1 Tenant Isolation

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| RLS-001 | Cannot view other tenant's members | Query profiles with different tenant_id | No results returned |
| RLS-002 | Cannot view other tenant's invitations | Query team_invitations with different tenant_id | No results returned |
| RLS-003 | Cannot modify other tenant's members | Attempt UPDATE on different tenant's profile | Operation fails |
| RLS-004 | Cannot delete other tenant's members | Attempt DELETE on different tenant's profile | Operation fails |

### 5.2 Role-Based RLS

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| RLS-010 | All roles can SELECT profiles | Each role queries profiles | All tenant members visible |
| RLS-011 | Only owner can UPDATE profiles | Non-owner attempts UPDATE | Operation fails |
| RLS-012 | Only owner can DELETE profiles | Non-owner attempts DELETE | Operation fails |
| RLS-013 | Only owner can SELECT invitations | Staff/viewer queries team_invitations | No results returned |
| RLS-014 | Only owner can INSERT invitations | Non-owner attempts INSERT | Operation fails |
| RLS-015 | Only owner can UPDATE invitations | Non-owner attempts UPDATE | Operation fails |
| RLS-016 | Only owner can DELETE invitations | Non-owner attempts DELETE | Operation fails |

### 5.3 Self-Protection

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| RLS-020 | User can update own profile | User updates own name/avatar | Operation succeeds |
| RLS-021 | User cannot update own role | User attempts to change own role | Operation fails or role unchanged |

---

## 6. UI/UX Tests

### 6.1 Team Settings Page

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| UI-001 | Page loads without error | Navigate to /settings/team | Page renders with team data |
| UI-002 | Loading state shown | Navigate to page | Skeleton/spinner during load |
| UI-003 | Empty state for no invitations | View with no pending invites | Appropriate empty message |
| UI-004 | Responsive layout | View on mobile/tablet/desktop | Layout adapts appropriately |

### 6.2 Invite Dialog

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| UI-010 | Dialog opens correctly | Click invite button | Modal appears with form |
| UI-011 | Dialog closes on cancel | Click cancel/X | Modal closes |
| UI-012 | Success state shows link | Complete invitation | Invite link shown with copy button |
| UI-013 | Copy link works | Click copy button | Link copied to clipboard |
| UI-014 | Role toggle works | Switch between staff/viewer | Selection updates |
| UI-015 | Loading state during submit | Submit form | Button shows loading indicator |

### 6.3 Accept Invite Page

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| UI-020 | Page loads with valid token | Navigate to accept page | Team info and form displayed |
| UI-021 | Error state displays correctly | Navigate with invalid token | Error message shown |
| UI-022 | Password visibility toggle | Click show/hide password | Password field toggles |
| UI-023 | Form validation feedback | Submit invalid form | Error messages shown inline |
| UI-024 | Success state and redirect | Complete signup | Success message, redirects to login |

### 6.4 Action Confirmations

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| UI-030 | Cancel invite confirmation | Click cancel invitation | Confirm dialog appears |
| UI-031 | Remove member confirmation | Click remove member | Confirm dialog with member name |
| UI-032 | Role change confirmation | Change member role | Confirm dialog or immediate update |

---

## 7. Email Tests

### 7.1 Invitation Email

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| EMAIL-001 | Email sent on invite | Create invitation | Email received by invitee |
| EMAIL-002 | Email contains correct link | Open invitation email | Link matches /accept-invite/{token} |
| EMAIL-003 | Email shows inviter name | Open invitation email | Inviter's full name displayed |
| EMAIL-004 | Email shows team name | Open invitation email | Team/tenant name displayed |
| EMAIL-005 | Email shows role | Open invitation email | Assigned role displayed |
| EMAIL-006 | Email sent on resend | Resend invitation | New email received |

### 7.2 Email Configuration

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| EMAIL-010 | SMTP failure handled | Disable SMTP, create invite | Graceful error, invitation still created |
| EMAIL-011 | Email from address correct | Check received email | From matches SMTP_FROM config |

---

## 8. Edge Cases & Error Handling

### 8.1 Concurrent Operations

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| EDGE-001 | Simultaneous invites same email | Two owners invite same email | First succeeds, second fails gracefully |
| EDGE-002 | Accept while being cancelled | Accept invite during cancellation | One operation succeeds, appropriate state |
| EDGE-003 | Role change during logout | Change role while user logging in | User gets updated role |

### 8.2 Data Validation

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| EDGE-010 | SQL injection in email | Invite with SQL in email field | Input sanitized, no injection |
| EDGE-011 | XSS in full name | Accept with script in name | Name escaped in UI |
| EDGE-012 | Very long email address | Invite with 256+ char email | Appropriate length validation |

### 8.3 Network Failures

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| EDGE-020 | Network timeout on invite | Slow network during invite | Timeout error, can retry |
| EDGE-021 | Network loss during accept | Lose connection during signup | Error message, can retry |

---

## 9. Integration Tests

### 9.1 Auth Flow Integration

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| INT-001 | Invited user full flow | Invite → Accept → Login → Access | User can access team inventory |
| INT-002 | Removed user access revoked | Remove user → User refreshes | User cannot access team data |
| INT-003 | Role change affects permissions | Change to viewer → User attempts edit | Edit blocked |

### 9.2 Multi-Tenant Isolation

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| INT-010 | User in multiple tenants | Same email in two teams | Separate profiles, separate access |
| INT-011 | Invitation cross-tenant | Invite user from Team A to Team B | User gets separate profile |

---

## 10. Performance Tests

### 10.1 Load Handling

| Test ID | Description | Steps | Expected Result |
|---------|-------------|-------|-----------------|
| PERF-001 | Large team list render | View team with 25 members | Page loads < 2 seconds |
| PERF-002 | Many pending invitations | View 20+ pending invitations | List renders smoothly |
| PERF-003 | Rapid role changes | Change roles quickly | No race conditions |

---

## Test Environment Requirements

### Test Users
- Owner account for each tenant
- Staff account for each tenant
- Viewer account for each tenant
- Fresh email addresses for invitation tests

### Test Tenants
- Starter plan tenant (1 user limit)
- Team plan tenant (10 user limit)
- Business plan tenant (25 user limit)

### Test Data
- Pre-populated team members
- Pending invitations at various states
- Expired invitations for cleanup testing

---

## Test Execution Checklist

- [ ] All role permission tests (ROLE-*)
- [ ] All invitation workflow tests (INV-*)
- [ ] All team member management tests (TEAM-*)
- [ ] All quota enforcement tests (QUOTA-*)
- [ ] All RLS security tests (RLS-*)
- [ ] All UI/UX tests (UI-*)
- [ ] All email tests (EMAIL-*)
- [ ] All edge case tests (EDGE-*)
- [ ] All integration tests (INT-*)
- [ ] All performance tests (PERF-*)

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2026-02-01 | 1.0 | Claude | Initial test plan |
