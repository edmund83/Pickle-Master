# Test Plan: Purchase Order → Receiving → Return Workflow

## Overview

This test plan covers the end-to-end workflow for:
1. **Purchase Orders (PO)** - Creating and managing orders to vendors
2. **Receiving (GRN)** - Receiving goods against purchase orders
3. **Returns** - Processing customer returns and stock adjustments

---

## 1. Purchase Order Workflow Tests

### 1.1 PO Creation

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| PO-001 | Create draft PO with minimal data | User has editor role, vendor exists | 1. Click "New Purchase Order" 2. Select vendor 3. Save as draft | PO created with status `draft`, display_id generated as `PO-{ORG}-{SEQ}` |
| PO-002 | Create PO with line items | User has editor role | 1. Create draft PO 2. Add 3 inventory items 3. Set quantities and prices | All items saved with correct quantities, subtotal calculated |
| PO-003 | Auto-generate display_id | None | Create new PO | Display ID follows format `PO-{ORG_CODE}-{SEQUENCE}`, immutable after creation |
| PO-004 | Create PO without vendor | User has editor role | Attempt to create PO without selecting vendor | Validation error: vendor required |
| PO-005 | Create PO with ship-to/bill-to addresses | User has editor role | 1. Create PO 2. Fill shipping and billing addresses | Both addresses saved with all fields (name, address, city, state, postal, country) |

### 1.2 PO Line Item Management

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| PO-010 | Add item to PO | Draft PO exists | 1. Open PO detail 2. Search for item 3. Add to PO with qty=10, price=50 | Item added, line total = 500, PO subtotal updated |
| PO-011 | Edit item quantity | PO has items | Change quantity from 10 to 15 | Line total recalculated, PO subtotal updated |
| PO-012 | Edit item price | PO has items | Change unit price from 50 to 45 | Line total recalculated, PO subtotal updated |
| PO-013 | Remove item from PO | PO has multiple items | Remove one item | Item removed, subtotal recalculated |
| PO-014 | Add item with part number | Draft PO exists | Add item with vendor part number "VND-12345" | Part number saved on line item |
| PO-015 | Prevent edit on non-draft PO | PO status = `confirmed` | Attempt to add/edit/remove items | Error: Cannot modify confirmed PO |

### 1.3 PO Status Transitions

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| PO-020 | Draft → Submitted | PO has items | Click "Submit" | Status = `submitted`, submitted_by and submitted_at recorded |
| PO-021 | Submitted → Confirmed | PO status = `submitted`, user is admin | Click "Confirm" | Status = `confirmed`, can no longer edit items |
| PO-022 | Submitted → Pending Approval | Approval workflow enabled | Submit PO | Status = `pending_approval`, notification sent to approvers |
| PO-023 | Pending Approval → Confirmed | User is approver | Click "Approve" | Status = `confirmed`, approved_by and approved_at recorded |
| PO-024 | Pending Approval → Draft (Reject) | User is approver | Click "Reject" | Status = `draft`, can edit again |
| PO-025 | Draft → Cancelled | PO status = `draft` | Click "Cancel" | Status = `cancelled` |
| PO-026 | Confirmed → Partial | Receive part of order | Complete partial receive | Status = `partial` |
| PO-027 | Partial → Received | Receive remaining items | Complete final receive | Status = `received` |
| PO-028 | Received → X (Terminal) | PO status = `received` | Attempt any status change | Error: Received is terminal state |
| PO-029 | Cancelled → Draft (Reopen) | PO status = `cancelled` | Click "Reopen" | Status = `draft`, can edit again |

### 1.4 PO Validation & Edge Cases

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| PO-030 | Submit PO without items | Draft PO with no items | Click "Submit" | Error: PO must have at least one item |
| PO-031 | Submit PO with zero quantity item | Item qty = 0 | Click "Submit" | Error: All items must have quantity > 0 |
| PO-032 | Delete draft PO | PO status = `draft` | Click "Delete" | PO deleted, removed from list |
| PO-033 | Delete non-draft PO | PO status = `submitted` | Attempt to delete | Error: Only draft POs can be deleted |
| PO-034 | View PO from different tenant | User from Tenant A, PO from Tenant B | Access PO URL directly | Error 404 or empty result (RLS blocks access) |

---

## 2. Receiving (GRN) Workflow Tests

### 2.1 Create Receive from PO

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RCV-001 | Create receive from confirmed PO | PO status = `confirmed` | 1. Open PO 2. Click "Create Receive" | Receive created with status `draft`, items pre-populated from PO |
| RCV-002 | Auto-generate receive display_id | None | Create receive | Display ID = `RCV-{ORG_CODE}-{SEQUENCE}` |
| RCV-003 | Pre-populate items from PO | PO has 3 line items | Create receive | All 3 items appear in receive with ordered quantities |
| RCV-004 | Create receive from partial PO | PO status = `partial`, some items already received | Create receive | Only remaining (un-received) quantities pre-populated |
| RCV-005 | Set default location | Receive created | Check location field | Default location assigned from user/org preference |

### 2.2 Receive Item Management

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RCV-010 | Update received quantity | Receive has item, ordered=10 | Set received_quantity = 8 | Quantity updated, warning shown for under-receipt |
| RCV-011 | Over-receive warning | Ordered=10 | Set received_quantity = 12 | Warning displayed: "Receiving more than ordered" |
| RCV-012 | Set item condition - Good | Receive item exists | Set condition = `good` | Condition saved |
| RCV-013 | Set item condition - Damaged | Receive item exists | Set condition = `damaged` | Condition saved, item flagged for review |
| RCV-014 | Set item condition - Rejected | Receive item exists | Set condition = `rejected` | Condition saved, item excluded from inventory |
| RCV-015 | Override item location | Receive has default location | Set different location on specific item | Item-level location saved, overrides receive location |
| RCV-016 | Add notes to receive item | Receive item exists | Add note "Box was open" | Note saved on receive item |

### 2.3 Lot/Batch Tracking

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RCV-020 | Add lot number | Item is lot-tracked | Enter lot_number = "LOT-2024-001" | Lot number saved |
| RCV-021 | Add batch code | Item is lot-tracked | Enter batch_code = "BATCH-A" | Batch code saved |
| RCV-022 | Set expiry date | Item is perishable | Enter expiry_date = "2025-06-30" | Expiry date saved |
| RCV-023 | Set manufacture date | Item is lot-tracked | Enter manufactured_date = "2024-01-15" | Manufacture date saved |
| RCV-024 | Lot created on complete | Item has lot info | Complete receive | New lot record created in `lots` table |
| RCV-025 | Link receive to existing lot | Lot already exists with same number | Complete receive | No duplicate lot created, existing lot updated |

### 2.4 Serial Number Tracking

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RCV-030 | Add single serial | Item is serialized, qty=1 | Add serial "SN-001" | Serial saved to receive_item_serials |
| RCV-031 | Add multiple serials | Item qty=5 | Add serials SN-001 through SN-005 | All 5 serials saved |
| RCV-032 | Bulk add serials | Item qty=100 | Paste 100 serials from CSV | All serials imported |
| RCV-033 | Bulk add limit (1000) | Item qty=1500 | Attempt to add 1500 serials | Error: Maximum 1000 serials per bulk operation |
| RCV-034 | Duplicate serial detection | Serial SN-001 already exists | Add SN-001 again | Error: Duplicate serial number |
| RCV-035 | Remove serial | Serial exists | Click remove on serial | Serial deleted from receive_item_serials |
| RCV-036 | Serial count validation | Item qty=5, only 3 serials added | Complete receive | Warning: Serial count doesn't match quantity |

### 2.5 Complete Receive

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RCV-040 | Complete receive - full | All items with correct quantities | Click "Complete" | Status = `completed`, completed_at recorded |
| RCV-041 | Inventory updated | Receive completed | Check inventory_items table | Quantities increased by received amounts |
| RCV-042 | Location stock updated | Receive completed with location | Check location_stock table | Stock at location increased |
| RCV-043 | PO status → partial | Received less than ordered | Complete receive | PO status = `partial` |
| RCV-044 | PO status → received | All items fully received | Complete final receive | PO status = `received` |
| RCV-045 | Activity logged | Receive completed | Check activity_log | Receive completion logged with user and timestamp |
| RCV-046 | Rejected items excluded | Some items marked `rejected` | Complete receive | Rejected items not added to inventory |

### 2.6 Cancel Receive

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RCV-050 | Cancel draft receive | Receive status = `draft` | Click "Cancel" | Status = `cancelled`, cancelled_at recorded |
| RCV-051 | Cannot cancel completed | Receive status = `completed` | Attempt to cancel | Error: Cannot cancel completed receive |
| RCV-052 | PO status unaffected | Cancel receive from partial PO | Cancel receive | PO status remains unchanged |

### 2.7 Delivery Information

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RCV-060 | Add delivery note number | Draft receive exists | Enter delivery_note_number = "DN-12345" | Saved on receive |
| RCV-061 | Add carrier | Draft receive exists | Enter carrier = "FedEx" | Saved on receive |
| RCV-062 | Add tracking number | Draft receive exists | Enter tracking_number = "1Z999AA..." | Saved on receive |

---

## 3. Customer Return Workflow Tests

### 3.1 Create Standalone Receive (Return)

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RTN-001 | Create customer return receive | User has editor role | 1. Click "New Receive" 2. Select source_type = `customer_return` | Standalone receive created, no PO linked |
| RTN-002 | Display ID format | Create return | Check display_id | Format: `RCV-{ORG_CODE}-{SEQUENCE}` (same as PO receives) |
| RTN-003 | Select return source type | Create new receive | Select `customer_return` from dropdown | source_type = `customer_return` saved |
| RTN-004 | Create stock adjustment receive | User has editor role | Select source_type = `stock_adjustment` | Standalone receive for adjustment created |

### 3.2 Return Item Management

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RTN-010 | Add item to return | Return receive exists | Search and add inventory item | Item added to receive |
| RTN-011 | Set return reason - Defective | Return item exists | Select return_reason = `defective` | Reason saved |
| RTN-012 | Set return reason - Wrong Item | Return item exists | Select return_reason = `wrong_item` | Reason saved |
| RTN-013 | Set return reason - Changed Mind | Return item exists | Select return_reason = `changed_mind` | Reason saved |
| RTN-014 | Set return reason - Damaged in Transit | Return item exists | Select return_reason = `damaged_in_transit` | Reason saved |
| RTN-015 | Set return reason - Other | Return item exists | Select return_reason = `other`, add note | Reason and note saved |
| RTN-016 | Set condition on return | Return item exists | Set condition = `damaged` | Condition saved, affects disposition |
| RTN-017 | Add multiple return items | Return receive exists | Add 5 different items | All items saved with individual reasons/conditions |

### 3.3 Complete Return

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RTN-020 | Complete return | All items have quantities | Click "Complete" | Status = `completed`, inventory updated |
| RTN-021 | Inventory increased | Return completed | Check inventory_items | Quantities increased by returned amounts |
| RTN-022 | Location stock updated | Return with location | Check location_stock | Stock at return location increased |
| RTN-023 | Rejected return items | Item condition = `rejected` | Complete return | Item NOT added back to inventory |
| RTN-024 | Return activity logged | Return completed | Check activity_log | Return logged with reason and user |

### 3.4 Stock Adjustment Receive

| Test ID | Test Case | Preconditions | Steps | Expected Result |
|---------|-----------|---------------|-------|-----------------|
| RTN-030 | Create stock adjustment | source_type = `stock_adjustment` | Add items and complete | Inventory adjusted, activity logged |
| RTN-031 | Adjustment reason required | Stock adjustment receive | Complete without notes | Warning: Reason recommended for audit trail |
| RTN-032 | Adjustment location | Stock adjustment | Set specific location | Stock adjusted at that location |

---

## 4. Integration & End-to-End Tests

### 4.1 Full PO → Receive Flow

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| E2E-001 | Complete PO-to-inventory flow | 1. Create PO with 3 items 2. Submit and confirm 3. Create receive 4. Complete receive | All items in inventory, PO = `received` |
| E2E-002 | Partial receive flow | 1. Create PO (10 units) 2. Receive 6 units 3. Receive remaining 4 units | First receive: PO = `partial`, Second receive: PO = `received` |
| E2E-003 | Multiple receives per PO | 1. Create PO with 3 items 2. Receive item 1 in first GRN 3. Receive items 2,3 in second GRN | PO status updates correctly, all inventory updated |

### 4.2 Return After Purchase

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| E2E-010 | Receive then return | 1. Create PO (10 units) 2. Complete receive 3. Create customer return (2 units damaged) | Inventory: +10 from receive, +2 from return (if not rejected), net = 12 or 10 |
| E2E-011 | Partial receive with return | 1. PO for 10 units 2. Receive 8 (2 damaged) 3. Process return for damaged | Inventory reflects correct quantities |

### 4.3 Lot/Serial Continuity

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| E2E-020 | Lot tracking through workflow | 1. Receive with lot "LOT-001" 2. Return some items from same lot | Lot records maintained, quantities updated |
| E2E-021 | Serial number lifecycle | 1. Receive with serials SN-001 to SN-010 2. Return SN-003 | Serial status updated, available for re-assignment |

### 4.4 Multi-Location Scenarios

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| E2E-030 | Receive to different locations | 1. Create receive 2. Assign items to different locations | location_stock updated correctly for each location |
| E2E-031 | Return to specific location | 1. Create return 2. Specify return location | Stock added to correct location |

---

## 5. Permission & Security Tests

### 5.1 Role-Based Access

| Test ID | Test Case | User Role | Action | Expected Result |
|---------|-----------|-----------|--------|-----------------|
| SEC-001 | Viewer cannot create PO | viewer | Create PO | Error: Insufficient permissions |
| SEC-002 | Editor can create PO | editor | Create PO | PO created successfully |
| SEC-003 | Editor cannot approve PO | editor | Approve PO | Error: Admin required for approval |
| SEC-004 | Admin can approve PO | admin | Approve PO | PO approved |
| SEC-005 | Viewer cannot create receive | viewer | Create receive | Error: Insufficient permissions |
| SEC-006 | Editor can complete receive | editor | Complete receive | Receive completed |

### 5.2 Tenant Isolation

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| SEC-010 | Cross-tenant PO access blocked | User from Tenant A accesses Tenant B's PO | 404 or empty result |
| SEC-011 | Cross-tenant receive blocked | User from Tenant A accesses Tenant B's receive | 404 or empty result |
| SEC-012 | Vendor isolation | Query vendors | Only tenant's vendors returned |
| SEC-013 | Location isolation | Query locations | Only tenant's locations returned |

---

## 6. Error Handling & Edge Cases

### 6.1 Concurrent Operations

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| ERR-001 | Concurrent receive completion | Two users complete same receive simultaneously | One succeeds, one gets conflict error |
| ERR-002 | Edit during receive | User A edits PO while User B creates receive | Both operations succeed, data consistent |
| ERR-003 | Delete while receiving | Delete PO while receive in progress | Error: PO has pending receives |

### 6.2 Data Validation

| Test ID | Test Case | Input | Expected Result |
|---------|-----------|-------|-----------------|
| ERR-010 | Negative quantity | quantity = -5 | Validation error: Quantity must be positive |
| ERR-011 | Zero quantity | quantity = 0 | Validation error: Quantity must be greater than 0 |
| ERR-012 | Invalid date format | expiry_date = "not-a-date" | Validation error: Invalid date |
| ERR-013 | Past expiry date | expiry_date = "2020-01-01" | Warning: Expiry date in the past |
| ERR-014 | Missing required fields | Submit PO without vendor | Validation error: Vendor required |

### 6.3 Database Constraint Violations

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| ERR-020 | Duplicate display_id | Manually insert duplicate | Database constraint prevents insert |
| ERR-021 | Invalid foreign key | Reference non-existent vendor | Foreign key constraint error |
| ERR-022 | Invalid status transition | Set status directly in DB | Status machine logic may be bypassed (RPC should prevent) |

---

## 7. Performance Tests

### 7.1 Load Testing

| Test ID | Test Case | Parameters | Expected Result |
|---------|-----------|------------|-----------------|
| PERF-001 | Large PO creation | PO with 100 line items | Completes < 3 seconds |
| PERF-002 | Bulk serial import | 1000 serials in single operation | Completes < 5 seconds |
| PERF-003 | PO list pagination | 10,000 POs, page size 50 | Each page loads < 1 second |
| PERF-004 | Receive list with filters | 5,000 receives, complex filters | Query < 2 seconds |

### 7.2 Concurrent Users

| Test ID | Test Case | Parameters | Expected Result |
|---------|-----------|------------|-----------------|
| PERF-010 | Concurrent PO creation | 10 users creating POs simultaneously | All succeed, no display_id conflicts |
| PERF-011 | Concurrent receives | 5 users completing receives simultaneously | All succeed, inventory accurate |

---

## 8. UI/UX Tests

### 8.1 Form Validation

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| UI-001 | Required field indicators | View PO form | Required fields marked with asterisk |
| UI-002 | Inline validation | Enter invalid data | Error shown inline, near field |
| UI-003 | Submit button state | Form has errors | Submit button disabled or shows validation on click |

### 8.2 User Feedback

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| UI-010 | Success toast on save | Save PO | Success message shown |
| UI-011 | Error toast on failure | API call fails | Error message with details shown |
| UI-012 | Loading states | Submit form | Loading spinner during API call |
| UI-013 | Confirmation dialogs | Delete PO, Cancel receive | Confirmation modal before destructive action |

### 8.3 Navigation

| Test ID | Test Case | Steps | Expected Result |
|---------|-----------|-------|-----------------|
| UI-020 | Breadcrumb navigation | Navigate to PO detail | Breadcrumbs show: Tasks > Purchase Orders > PO-XXX |
| UI-021 | Back button behavior | Navigate away and back | Form state preserved (if draft) |
| UI-022 | Deep link access | Direct URL to PO detail | Page loads correctly with all data |

---

## 9. Test Environment Requirements

### 9.1 Test Data Setup

- [ ] Create test organization with known ORG_CODE
- [ ] Create test users with different roles (viewer, editor, admin)
- [ ] Create test vendors (minimum 3)
- [ ] Create test locations (minimum 2)
- [ ] Create test inventory items (minimum 10, including lot-tracked and serialized)
- [ ] Create test POs in various statuses

### 9.2 Test Isolation

- [ ] Each test should clean up created data
- [ ] Tests should not depend on external state
- [ ] Use unique identifiers to avoid conflicts

### 9.3 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=<test-project-url>
SUPABASE_SERVICE_ROLE_KEY=<test-service-key>
```

---

## 10. Test Execution Checklist

### Pre-Execution
- [ ] Test database seeded with required data
- [ ] All test users created with correct roles
- [ ] Test environment configuration verified
- [ ] Previous test data cleaned up

### Execution Order
1. Security tests (SEC-*) - Verify permissions first
2. Unit tests (PO-*, RCV-*, RTN-*) - Core functionality
3. Integration tests (E2E-*) - Full workflows
4. Error handling (ERR-*) - Edge cases
5. Performance tests (PERF-*) - Load testing
6. UI tests (UI-*) - User experience

### Post-Execution
- [ ] All test results documented
- [ ] Failed tests investigated
- [ ] Bugs filed for failures
- [ ] Test data cleaned up

---

## Appendix: Status Transition Diagram

```
                    ┌─────────┐
                    │  draft  │◄──────────────────┐
                    └────┬────┘                   │
                         │ submit                 │ reopen
                         ▼                        │
                    ┌─────────────┐          ┌────┴────┐
                    │  submitted  │────┬────►│cancelled│
                    └──────┬──────┘    │     └─────────┘
                           │           │          ▲
           ┌───────────────┼───────────┤          │
           │               │           │          │
           ▼               ▼           │          │
    ┌──────────────┐  ┌──────────┐     │          │
    │pending_approv│  │ confirmed├─────┼──────────┤
    └───────┬──────┘  └────┬─────┘     │          │
            │              │           │          │
            │ approve      │ receive   │          │
            └──────────────┤           │          │
                           ▼           │          │
                      ┌─────────┐      │          │
                      │ partial │──────┼──────────┘
                      └────┬────┘      │
                           │ receive   │
                           ▼           │
                      ┌──────────┐     │
                      │ received │ ◄───┘
                      └──────────┘
                      (terminal)
```

---

*Last Updated: 2026-02-01*
*Version: 1.0*
