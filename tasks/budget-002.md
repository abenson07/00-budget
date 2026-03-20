# budget-002: Core allocation logic (safe-to-spend + transaction apply/reverse)

Goal: implement the correctness-critical “Buckets & Safe-to-Spend” computations and transaction allocation mechanics so every UI later can rely on stable, testable helpers.

## Deliverable for this task
- Pure helper functions for:
  - safe-to-spend
  - applying transaction allocations to bucket balances
  - reversing allocations when updating transactions
- Zustand store actions that use those helpers and preserve invariants
- Unit tests (at least for pure helpers)

## Implementation steps (agent)
1. Implement derived computations
   - `accountBalance = sum(buckets[].amount)` including `Unassigned`
   - `safeToSpend`:
     - Primary definition: `sum(b.amount for discretionary buckets)`
     - Sanity check: `accountBalance - sum(essential buckets[].amount)`
   - Decide whether to treat `Unassigned` as discretionary (recommended: yes).
2. Implement transaction allocation rules (Phase 1: debit-only)
   - When a transaction is created or updated:
     1. Reverse the previous allocation (if updating): add back the previously allocated amounts to each previously used bucket.
     2. Apply the new allocation:
        - For debit transactions, subtract split allocation amounts from bucket balances.
   - Ensure split totals:
     - sum of split allocations must equal transaction amount (within epsilon).
   - Invariants to maintain:
     - After applying a debit transaction, total sum of all bucket amounts decreases by `transaction.amount`.
     - Updating a transaction is equivalent to `delete(old)` then `add(new)` in terms of bucket totals.
3. Add overspend “hooks” (detection only; UI comes later)
   - Helpers should be able to report:
     - which bucket would go negative (if any)
     - deficit amount
     - bucket type (essential vs discretionary)
   - Do not implement UI top-off yet; just return structured information the UI/store can use later.
4. Store actions
   - `createTransaction(tx)`: validate splits, append transaction, apply allocation to buckets, persist.
   - `updateTransaction(txId, newData)`: reverse old allocations, apply new, persist.
   - `deleteTransaction(txId)`: reverse old allocations, delete transaction, persist.
   - `selectTransactionsByBucket(bucketId)`
5. Persistence integration (Phase 1)
   - Ensure store can load from Supabase and reflect those loads into `buckets` and `transactions`.
   - For now, you can:
     - insert mock demo data on first run if tables are empty
     - then read actual data thereafter

## Agent testing (verification I will do)
1. Unit tests for pure helpers:
   - safe-to-spend matches discretionary sum
   - safe-to-spend sanity check matches `accountBalance - essentialSum`
   - split total validation rejects invalid totals
   - apply then reverse returns bucket balances to original
   - update transaction equivalence: `old+new update` equals delete/add results
2. Manual runtime smoke test:
   - Create a non-split debit and verify only the assigned bucket decreases.
   - Create/update a split debit and verify bucket decreases match split allocations.

## Human acceptance criteria (you can check)
1. If you change a transaction’s bucket assignment/splits in the UI (once those screens exist), bucket totals update correctly and never drift from invariants.
2. safe-to-spend displayed on Dashboard matches the sum of all discretionary buckets (including Unassigned) at all times.

