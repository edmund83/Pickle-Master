# Hydration guide (Next.js + React 19)

This project uses Next.js 16 with React 19. Server-rendered HTML must match the client’s first render or React will report **hydration mismatches**. This doc explains what causes them and how to avoid them.

---

## Why it matters

- **Server:** Renders HTML once (e.g. in Node).
- **Client:** Reuses that HTML and “hydrates” it with React.
- If the DOM from the server differs from what the client would render (e.g. different `id`, different text, different structure), React logs a hydration error and may patch the DOM in unexpected ways.

---

## Common causes and fixes

### 1. `React.useId()` (server vs client IDs differ)

**Problem:** In Next.js + React 19, `useId()` can produce different values on the server and on the client (or between client renders). Using that value for `id` / `htmlFor` leads to mismatches.

**Fix:**

- **Preferred:** Pass a **stable, explicit `id`** from the parent when you can (e.g. `id="delivery-order-customer-search"`).
- **In shared components (Input, Select, BarcodeScanner):** We **defer** using `useId()` until after mount:
  - `mounted` state + `useEffect(() => setMounted(true), [])`
  - `inputId = id ?? (mounted ? generatedId : undefined)`
  - Server and first client render: no `id`/`htmlFor` when no prop `id`; after mount we set them. No mismatch.

**Do not:** Rely on `useId()` alone for form control `id`/`htmlFor` in components that are server-rendered, unless you use the “defer until mount” pattern above.

---

### 2. `useState` with `new Date()` or `Date.now()`

**Problem:** Server and client run at different times (or timezones). Initial state like `useState(new Date().toISOString().split('T')[0])` can differ, so the tree (and DOM) differ.

**Fix:**

- Use a **stable initial value** (e.g. `''` or `receive.received_date || ''`), then set the real value in `useEffect` after mount:

```tsx
const [receivedDate, setReceivedDate] = useState('')

useEffect(() => {
  setReceivedDate((prev) => (prev === '' ? new Date().toISOString().split('T')[0] : prev))
}, [])
```

- Same idea for any initial state that depends on “now” (e.g. `useState(new Date())` for “last updated”): use `null` or a sentinel, then set in `useEffect`.

**Do not:** Use `new Date()`, `Date.now()`, or any time-based value in **initial** `useState` for anything that affects the first render (e.g. form default date, “last updated” time).

---

### 3. Current date/time in **render** (e.g. `min={new Date()...}`)

**Problem:** Attributes like `min={new Date().toISOString().split('T')[0]}` are computed during render. Server and client can produce different values (time, timezone, day boundary).

**Fix:**

- Store the value in **state** set only on the client after mount:

```tsx
const [minDate, setMinDate] = useState<string | undefined>(undefined)

useEffect(() => {
  setMinDate(new Date().toISOString().split('T')[0])
}, [])

// In JSX:
<Input type="date" min={minDate} ... />
```

- Server and first client render: `min` is `undefined`; after mount it becomes today. No mismatch.

**Do not:** Use `new Date()` or `Date.now()` directly in JSX or in attributes that are rendered on the server (e.g. `min`, `max`, default option text).

---

### 4. `typeof window` / `typeof document` changing the tree

**Problem:** If you render different components or different content based on `typeof window !== 'undefined'`, the server (no `window`) and the client can produce different DOM.

**Fix:**

- Use the “defer until mount” pattern: render the same initial output on server and first client (e.g. `null` or a placeholder), then in `useEffect` set state and re-render the real content.
- Avoid branching that changes **structure** (e.g. “if window then component A else component B”) unless the initial output is identical on both.

**Do not:** Use `typeof window` / `typeof document` to decide **what to render** in a way that changes the component tree between server and client.

---

### 5. Other non-deterministic or environment-dependent values

**Avoid in initial render or initial state:**

- `Math.random()` for anything that ends up in the DOM or in React tree.
- User locale / `toLocaleString()` for content that’s part of the first paint (server and client locales can differ).
- External data that isn’t part of the same snapshot the server used (e.g. live API data in initial state without revalidation).

**Use:** Stable props, deterministic IDs (e.g. from `id` or index when safe), or values set only after mount in `useEffect`.

---

## Checklist for new forms / pages

When adding or editing forms or pages that are server-rendered:

- [ ] **IDs:** Prefer explicit `id` props for `Input`/`Select` (e.g. `id="my-form-field-name"`). If you don’t pass `id`, the shared components will defer `useId()` until after mount (already implemented).
- [ ] **Default dates:** Don’t use `useState(new Date()...)` or `useState(..., new Date()...)`. Use `useState('')` (or similar) and set the default in `useEffect` after mount.
- [ ] **Date attributes:** Don’t use `min={new Date()...}` or `max={new Date()...}` in render. Use state (e.g. `minDate`) set in `useEffect`.
- [ ] **Temporary IDs:** For list items (e.g. `temp-${Date.now()}`), use inside **event handlers** or after mount, not in initial state or during first render.
- [ ] **Window/document:** Don’t change the component tree or initial DOM based on `typeof window` / `typeof document`; use mount + state if you need client-only behavior.

---

## References

- [React: useId](https://react.dev/reference/react/useId)
- [React: Hydration mismatch](https://react.dev/link/hydration-mismatch)
- Next.js issue: [useId format mismatch in client and server components (React 19.1)](https://github.com/vercel/next.js/issues/78691)

---

## Project-specific implementations

- **`components/ui/input.tsx`** and **`components/ui/select.tsx`**: Defer `useId()` until `mounted`; accept explicit `id` prop.
- **`components/scanner/BarcodeScanner.tsx`**: Same defer-until-mount for scanner element ID.
- **Date defaults:** New Receive, New Invoice, Invoice Detail, Receive Detail, and similar flows use `useState('')` (or prop-based default) + `useEffect` to set today’s date.
- **Date `min`:** BorrowOutModal, CheckOutModal, checkouts new page, WizardStepAssign use `minDate` state set in `useEffect` instead of `new Date()` in render.
- **LiveProgressIndicator:** `lastRefresh` is `useState<Date | null>(null)` and set in `useEffect`; UI handles `null` (e.g. “—”).
