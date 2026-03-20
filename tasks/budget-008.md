# budget-008: Paycheck allocation simulator (preview + apply)

Goal: implement the core “Buckets allocation” mechanic so entering a paycheck amount produces an allocation preview (top-to-bottom by bucket order) and can be applied to update bucket balances.

## Deliverable for this task
- Paycheck simulator page:
  - input paycheck amount
  - allocation preview per bucket (including Unassigned)
  - apply button that commits the allocation
- Uses bucket rules:
  - `top_off`: fill bucket up to its goal amount (if current amount < goal)
  - `percentage`: take X% of incoming money (interpretation must be consistent)

## Implementation steps (agent)
1. Implement pure paycheck allocation helper
   - Input:
     - current buckets (with amounts, order, essential/discretionary)
     - paycheck amount
   - Sort buckets by `order` ascending (top-to-bottom).
   - For each bucket:
     - If `top_off` is set:
       - compute needed = `top_off - currentAmount`
       - allocate `min(needed, remainingPaycheck)`
     - If `percentage` is set:
       - compute take = `remainingPaycheck * percentage` (or `paycheck * percentage`); pick one and document.
       - allocate min(take, remainingPaycheck)
   - Stop when paycheck is exhausted.
   - Any remaining money goes to `Unassigned` (if Unassigned bucket exists).
2. Add UI preview
   - Show:
     - remaining money after each step (optional)
     - preview of new bucket amounts
     - updated safe-to-spend preview
3. Apply action
   - “Apply” uses the pure helper to compute new bucket states.
   - Persist updated bucket amounts to Supabase.
4. Ensure essentials are treated correctly
   - In the allocation algorithm, because buckets are processed top-to-bottom by order, essential buckets earlier in order should get filled before discretionary (as long as their order is set).
   - If you want to enforce “essentials must be satisfied first,” you can validate allocation results: if an essential bucket with `top_off` is left short, show a warning state. Keep it simple for Phase 1.

## Agent testing (verification I will do)
1. Determinism:
   - With a known mock dataset, paycheck preview should match expected manual calculations.
2. Invariants:
   - After applying a paycheck of amount `P`, `sum(buckets[].amount)` increases by exactly `P`.
3. Rule correctness:
   - top_off fills to goal.
   - percentage allocation uses consistent interpretation.

## Human acceptance criteria (you can check)
1. When you enter a paycheck amount, the simulator shows what each bucket will become.
2. Clicking Apply updates Dashboard/bucket balances accordingly.
3. Safe-to-spend increases/decreases in a way consistent with how buckets were prioritized and rules applied.

