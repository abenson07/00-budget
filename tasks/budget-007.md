# budget-007: Manual bucket transfers + invariant-preserving rules edits

Goal: implement “manual transfers” robustly and ensure bucket edits never break the core invariant model (no accidental drift of totals).

## Deliverable for this task
- Store-level transfer action that:
  - preserves total bucket sum
  - prevents negative balances for non-Unassigned buckets (recommended)
  - persists to Supabase
- Bucket edit actions that:
  - update metadata and rules without corrupting balances
  - handle changing `order`, `type`, and essential subtype gracefully

## Implementation steps (agent)
1. Transfer action (store)
   - Add `transferBetweenBuckets({fromBucketId, toBucketId, amount})`
   - Rules:
     - `amount` must be > 0
     - if `from` is not `Unassigned`, prevent sending more than available
     - update:
       - `from.amount -= amount`
       - `to.amount += amount`
     - confirm `sum(buckets[].amount)` is unchanged after transfer
2. Transfer UI (if not already fully implemented in `budget-004`)
   - Add/adjust UI so it’s easy to choose destination bucket and input amounts.
3. Rule edits safety
   - Clarify what edits affect:
     - Rule fields (`top_off`, `percentage`) should affect only allocation/simulator and not arbitrarily change bucket balances during edit.
     - Changing `order` should immediately affect simulator ordering.
     - Changing `essential_subtype` should update which fields are displayed, but should not change current bucket `amount` unless you explicitly add “reallocate now” behavior.
4. Persistence integration
   - Ensure transfer and edits are persisted and reloaded cleanly.

## Agent testing (verification I will do)
1. Transfer correctness:
   - pick two buckets and transfer $X
   - verify bucket amounts change exactly by +/- X
   - verify total account balance on Dashboard is unchanged
2. Negative/edge:
   - attempt transferring more than available; verify UI/store blocks or clamps according to spec.
3. Edit safety:
   - change `order` and rules for a bucket; verify balances remain the same, but simulator (later) will pick up the new rules.

## Human acceptance criteria (you can check)
1. Manual transfer UI works and results match the expected +/- amount behavior.
2. Dashboard total remains unchanged after transfers.
3. Editing a bucket’s name/type/order/rules updates what you see immediately without unexpectedly changing its current $ amount.

