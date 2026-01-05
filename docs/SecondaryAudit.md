# Secondary Audit Checklist

A comprehensive checklist for auditing data integrity, consistency, and correctness across the StockZip codebase.

---

## 1. Formatting & Localization

### Currency
- [x] No hardcoded currency symbols (`$`, `RM`, `€`, `£`) in JSX
- [x] All currency values use `formatCurrency()` from `useFormatting()` hook
- [x] No `.toFixed(2)` for currency display (use `formatCurrency()` instead)
- [x] Currency symbol respects tenant settings

### Dates & Times
- [x] No hardcoded date formats (e.g., `MM/DD/YYYY`, `toLocaleDateString()`)
- [x] All dates use `formatDate()` or `formatDateTime()` or `formatShortDate()`
- [x] All times use `formatTime()`
- [x] Relative dates use `formatRelativeDate()`
- [x] Timezone conversions respect tenant settings

### Numbers
- [x] No raw `.toFixed()` for display purposes
- [x] All formatted numbers use `formatNumber()`
- [x] Decimal precision respects tenant settings

**Files to check:**
- `app/(dashboard)/**/*.tsx`
- `components/**/*.tsx`

**Search patterns:**
```bash
# Hardcoded currency
grep -rE '\$\{.*\.toFixed' --include="*.tsx" app/ components/
grep -rE '[\$€£¥][ ]?[0-9{]' --include="*.tsx" app/ components/

# Hardcoded dates
grep -rE 'toLocaleDateString|toLocaleTimeString' --include="*.tsx" app/ components/
```

---

## 2. Data Passing & Props

### Props Validation
- [x] All required props are passed to child components
- [x] No unused props in component definitions
- [x] Prop types match between parent and child
- [x] Default values provided for optional props where appropriate

### Null/Undefined Handling
- [x] Optional chaining (`?.`) used appropriately, not masking bugs
- [x] Fallback values provided for nullable data
- [x] Loading states shown when data is undefined
- [x] Empty states shown when arrays are empty

**Search patterns:**
```bash
# Find potential undefined access
grep -rE '\w+\.\w+\.\w+[^?]' --include="*.tsx" app/ components/
```

---

## 3. Data Integrity

### Database Writes
- [x] All inserts/updates have proper validation
- [x] Required fields validated before write
- [x] Foreign key references validated before insert
- [x] Unique constraints checked where applicable

### Transactions
- [x] Multi-table operations wrapped in transactions
- [x] Rollback on failure for related operations
- [x] No partial state left on error

### Race Conditions
- [x] Concurrent updates handled properly
- [x] Optimistic locking or versioning where needed
- [x] Stock quantity updates are atomic

**Files to check:**
- `app/actions/**/*.ts`
- `lib/**/*.ts`

---

## 4. State Synchronization

### After Mutations
- [x] Lists refresh after create/update/delete
- [x] Cache invalidated after mutations
- [x] Related data updated (e.g., counts, totals)
- [x] Navigation reflects new state

### UI Feedback
- [x] Loading states during all async operations
- [x] Success feedback after actions complete
- [x] Error messages displayed on failure
- [x] Form resets after successful submission

### Stale Data
- [x] Data refetched on page focus (where appropriate)
- [x] Real-time updates where needed
- [x] No stale data after back navigation

**Checklist per feature:**
| Feature | List Refresh | Error Handling | Loading State | Success Feedback |
|---------|-------------|----------------|---------------|------------------|
| Inventory Items | ✅ | ✅ | ✅ | ✅ |
| Purchase Orders | ✅ | ✅ | ✅ | ✅ |
| Receives | ✅ | ✅ | ✅ | ✅ |
| Stock Movements | ✅ | ✅ | ✅ | ✅ |
| Locations | ✅ | ✅ | ✅ | ✅ |
| Categories | ✅ | ✅ | ✅ | ✅ |
| Vendors | ✅ | ✅ | ✅ | ✅ |
| Users/Team | ✅ | ✅ | ✅ | ✅ |

---

## 5. Form & Input Validation

### Client-Side
- [x] All required fields marked and validated
- [x] Input formats validated (email, phone, etc.)
- [x] Number ranges validated (min/max stock, prices)
- [x] Character limits enforced

### Server-Side
- [x] Validation matches client-side rules
- [x] All user input sanitized
- [x] SQL injection prevented (parameterized queries)
- [x] XSS prevented (output encoding)

### Consistency
- [x] Create and edit forms have same validation
- [x] Error messages are clear and actionable
- [x] Validation errors shown next to relevant fields

---

## 6. API & Database

### Query Efficiency
- [x] No N+1 query patterns
- [x] Proper indexes on filtered/sorted columns
- [x] Pagination for large datasets
- [x] Select only needed columns

### Security
- [x] RLS policies on all tables
- [x] Service role key never exposed to client
- [x] Sensitive data not in API responses
- [x] User can only access their tenant's data

### Type Safety
- [x] API responses match TypeScript types
- [x] Database query results properly typed
- [x] No `any` types hiding potential issues

**RLS Audit:**
```sql
-- Check tables without RLS
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename FROM pg_policies WHERE schemaname = 'public'
);
```

---

## 7. Business Logic Consistency

### Calculations
- [x] Totals calculated the same way everywhere
- [x] Tax calculations consistent
- [x] Discount calculations consistent
- [x] Rounding handled consistently

### Status Transitions
- [x] Valid status transitions enforced
- [x] Status changes logged in audit trail
- [x] Notifications sent on status change (if applicable)

### Inventory Operations
- [x] Stock quantity updates match movement records
- [x] Low stock alerts trigger correctly
- [x] Reorder points calculated consistently
- [x] Inventory value calculated correctly

### Audit Trail
- [x] All CRUD operations logged
- [x] User who made change recorded
- [x] Timestamp recorded
- [x] Before/after values captured (for updates)

---

## 8. Feature-Specific Audits

### Purchase Orders
- [x] Total calculated correctly (sum of line items)
- [x] Currency uses `formatCurrency()`
- [x] Dates use `formatDate()`
- [x] Status transitions validated
- [x] Received quantities update stock
- [x] Partial receives handled correctly
- [x] List refreshes after status change

### Inventory Items
- [x] Stock quantity accurate
- [x] Low stock indicator shows correctly
- [x] Value calculated (qty × price)
- [x] Images load properly
- [x] Barcode/SKU unique validation
- [x] Category/location relationships maintained

### Receives
- [x] Quantities validated against PO ordered qty
- [x] Stock updated on receive
- [x] Movement record created
- [x] PO status updated (partial/received)

### Reports
- [x] Data aggregations correct
- [x] Date ranges filter properly
- [x] Export includes all filtered data
- [x] Numbers/currencies formatted correctly

---

## 9. Audit Execution Commands

### Quick Grep Checks
```bash
# Hardcoded currency symbols
grep -rn '\$\{.*\.toFixed' --include="*.tsx" app/ components/

# Missing error handling in actions
grep -rn 'await supabase' --include="*.ts" app/actions/ | grep -v 'try\|catch\|error'

# Console.log left in code
grep -rn 'console\.log' --include="*.ts" --include="*.tsx" app/ components/ lib/

# TODO comments
grep -rn 'TODO\|FIXME\|HACK' --include="*.ts" --include="*.tsx" app/ components/ lib/
```

### TypeScript Checks
```bash
# Find 'any' types
grep -rn ': any' --include="*.ts" --include="*.tsx" app/ components/ lib/

# Type assertions that might hide errors
grep -rn ' as ' --include="*.ts" --include="*.tsx" app/ components/
```

---

## 10. Audit Log Template

Use this template when running audits:

```markdown
## Audit: [Feature/Area Name]
**Date:** YYYY-MM-DD
**Auditor:** [Name]

### Issues Found

| # | File | Line | Issue | Severity | Status |
|---|------|------|-------|----------|--------|
| 1 | | | | High/Med/Low | Open/Fixed |

### Summary
- Total issues: X
- High severity: X
- Medium severity: X
- Low severity: X

### Notes
[Any additional observations]
```

---

## 11. Recommended Audit Schedule

| Audit Type | Frequency | Trigger |
|------------|-----------|---------|
| Formatting/Localization | Monthly | After new UI added |
| Data Integrity | Weekly | After schema changes |
| Security (RLS) | After each migration | Schema changes |
| State Sync | Per feature | After CRUD changes |
| Business Logic | Per release | Before deployment |
| Full System | Quarterly | Major releases |

---

## 12. Automation Opportunities

Consider automating these checks:

1. **ESLint Rules** - Custom rules for formatting patterns
2. **Pre-commit Hooks** - Grep checks before commit
3. **CI Pipeline** - TypeScript strict checks, lint, grep patterns
4. **Database Triggers** - Audit logging, validation
5. **E2E Tests** - Critical path validation with different tenant settings
