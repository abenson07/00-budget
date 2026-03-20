# budget-003: Dashboard + bucket list UI (safe-to-spend)

Goal: implement the primary “what you can spend” dashboard so you can see account balance, safe-to-spend, and bucket ordering immediately.

## Deliverable for this task
- `Dashboard` UI showing:
  - Account balance
  - Safe-to-spend
  - Bucket list (cards/rows) with type and current amount
- Navigation to bucket detail pages

## Implementation steps (agent)
1. Implement Dashboard page (`src/app/page.tsx`)
   - Read from Zustand selectors:
     - `accountBalance`
     - `safeToSpend`
     - sorted buckets by `order`
   - Render:
     - Account balance (formatted as currency)
     - Safe-to-spend (formatted, likely also currency)
     - A bucket list (including Unassigned)
2. Implement Bucket card component (in `src/components/`)
   - Show bucket name, current amount, and type tag (Essential/Discretionary/Unassigned).
   - Include link to bucket detail using `bucketId`.
3. Ensure computed displays are consistent
   - Safe-to-spend uses the same helper logic from `budget-002`.
   - If the app chooses to derive account balance from bucket sum, ensure Dashboard uses the same source to avoid mismatches.
4. Persistence sanity
   - Once store loads from Supabase (later in `budget-002`), ensure Dashboard updates after load.
5. Add minimal styling polish
   - Mobile-first layout; keep it readable even with many buckets.

## Agent testing (verification I will do)
1. Run dev server and confirm:
   - Dashboard loads without console errors.
   - safe-to-spend value equals discretionary buckets sum.
2. If bucket amounts change (due to mock transaction apply or edits from later tasks), confirm Dashboard re-renders correctly.
3. Verify `Unassigned` is included in safe-to-spend (per system definition).

## Human acceptance criteria (you can check)
1. Visiting the root route shows:
   - an account balance number
   - a safe-to-spend number
   - a list of buckets with visible amounts
2. Bucket cards are ordered top-to-bottom by `order`.
3. Clicking a bucket navigates to the bucket detail route (even if detail is still a shell).

