# Secondary Audit Checklist

A comprehensive checklist for auditing data integrity, consistency, and correctness across the StockZip codebase.

---

## 1. Formatting & Localization

### Currency
- [ ] No hardcoded currency symbols (`$`, `RM`, `€`, `£`) in JSX
- [ ] All currency values use `formatCurrency()` from `useFormatting()` hook
- [ ] No `.toFixed(2)` for currency display (use `formatCurrency()` instead)
- [ ] Currency symbol respects tenant settings

### Dates & Times
- [ ] No hardcoded date formats (e.g., `MM/DD/YYYY`, `toLocaleDateString()`)
- [ ] All dates use `formatDate()` or `formatDateTime()` or `formatShortDate()`
- [ ] All times use `formatTime()`
- [ ] Relative dates use `formatRelativeDate()`
- [ ] Timezone conversions respect tenant settings

### Numbers
- [ ] No raw `.toFixed()` for display purposes
- [ ] All formatted numbers use `formatNumber()`
- [ ] Decimal precision respects tenant settings

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
- [ ] All required props are passed to child components
- [ ] No unused props in component definitions
- [ ] Prop types match between parent and child
- [ ] Default values provided for optional props where appropriate

### Null/Undefined Handling
- [ ] Optional chaining (`?.`) used appropriately, not masking bugs
- [ ] Fallback values provided for nullable data
- [ ] Loading states shown when data is undefined
- [ ] Empty states shown when arrays are empty

**Search patterns:**
```bash
# Find potential undefined access
grep -rE '\w+\.\w+\.\w+[^?]' --include="*.tsx" app/ components/
```

---

## 3. Data Integrity

### Database Writes
- [ ] All inserts/updates have proper validation
- [ ] Required fields validated before write
- [ ] Foreign key references validated before insert
- [ ] Unique constraints checked where applicable

### Transactions
- [ ] Multi-table operations wrapped in transactions
- [ ] Rollback on failure for related operations
- [ ] No partial state left on error

### Race Conditions
- [ ] Concurrent updates handled properly
- [ ] Optimistic locking or versioning where needed
- [ ] Stock quantity updates are atomic

**Files to check:**
- `app/actions/**/*.ts`
- `lib/**/*.ts`

---

## 4. State Synchronization

### After Mutations
- [ ] Lists refresh after create/update/delete
- [ ] Cache invalidated after mutations
- [ ] Related data updated (e.g., counts, totals)
- [ ] Navigation reflects new state

### UI Feedback
- [ ] Loading states during all async operations
- [ ] Success feedback after actions complete
- [ ] Error messages displayed on failure
- [ ] Form resets after successful submission

### Stale Data
- [ ] Data refetched on page focus (where appropriate)
- [ ] Real-time updates where needed
- [ ] No stale data after back navigation

**Checklist per feature:**
| Feature | List Refresh | Error Handling | Loading State | Success Feedback |
|---------|-------------|----------------|---------------|------------------|
| Inventory Items | | | | |
| Purchase Orders | | | | |
| Receives | | | | |
| Stock Movements | | | | |
| Locations | | | | |
| Categories | | | | |
| Vendors | | | | |
| Users/Team | | | | |

---

## 5. Form & Input Validation

### Client-Side
- [ ] All required fields marked and validated
- [ ] Input formats validated (email, phone, etc.)
- [ ] Number ranges validated (min/max stock, prices)
- [ ] Character limits enforced

### Server-Side
- [ ] Validation matches client-side rules
- [ ] All user input sanitized
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (output encoding)

### Consistency
- [ ] Create and edit forms have same validation
- [ ] Error messages are clear and actionable
- [ ] Validation errors shown next to relevant fields

---

## 6. API & Database

### Query Efficiency
- [ ] No N+1 query patterns
- [ ] Proper indexes on filtered/sorted columns
- [ ] Pagination for large datasets
- [ ] Select only needed columns

### Security
- [ ] RLS policies on all tables
- [ ] Service role key never exposed to client
- [ ] Sensitive data not in API responses
- [ ] User can only access their tenant's data

### Type Safety
- [ ] API responses match TypeScript types
- [ ] Database query results properly typed
- [ ] No `any` types hiding potential issues

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
- [ ] Totals calculated the same way everywhere
- [ ] Tax calculations consistent
- [ ] Discount calculations consistent
- [ ] Rounding handled consistently

### Status Transitions
- [ ] Valid status transitions enforced
- [ ] Status changes logged in audit trail
- [ ] Notifications sent on status change (if applicable)

### Inventory Operations
- [ ] Stock quantity updates match movement records
- [ ] Low stock alerts trigger correctly
- [ ] Reorder points calculated consistently
- [ ] Inventory value calculated correctly

### Audit Trail
- [ ] All CRUD operations logged
- [ ] User who made change recorded
- [ ] Timestamp recorded
- [ ] Before/after values captured (for updates)

---

## 8. Feature-Specific Audits

### Purchase Orders
- [ ] Total calculated correctly (sum of line items)
- [ ] Currency uses `formatCurrency()`
- [ ] Dates use `formatDate()`
- [ ] Status transitions validated
- [ ] Received quantities update stock
- [ ] Partial receives handled correctly
- [ ] List refreshes after status change

### Inventory Items
- [ ] Stock quantity accurate
- [ ] Low stock indicator shows correctly
- [ ] Value calculated (qty × price)
- [ ] Images load properly
- [ ] Barcode/SKU unique validation
- [ ] Category/location relationships maintained

### Receives
- [ ] Quantities validated against PO ordered qty
- [ ] Stock updated on receive
- [ ] Movement record created
- [ ] PO status updated (partial/received)

### Reports
- [ ] Data aggregations correct
- [ ] Date ranges filter properly
- [ ] Export includes all filtered data
- [ ] Numbers/currencies formatted correctly

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
