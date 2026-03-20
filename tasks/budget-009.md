# budget-009: Overspend detection + Top-Off flows

Goal: implement overspend detection when a debit transaction would drive a bucket below $0, and provide a “Top Off” UI to pull funds from other buckets to prevent negative balances.

## Deliverable for this task
- Overspend detection logic triggered by transaction application/editing
- Top-Off modal UI with two modes:
  - Essential overspend: top-off by pulling from discretionary buckets (reverse order)
  - Discretionary overspend: top-off by pulling from other discretionary buckets (equal or selected)
- Integration with transaction save flow:
  - user attempts to save a transaction
  - if overspend would occur, show Top-Off prompt
  - applying top-off results in a corrected bucket state

## Implementation steps (agent)
1. Overspend detection helpers (pure)
   - Extend transaction allocation helpers to report:
     - which bucket(s) would go negative
     - deficit amount(s)
     - bucket type (essential/discretionary)
2. Essential overspend Top-Off (as defined in system spec)
   - When an essential bucket would go negative after applying a debit:
     - deficit = absolute negative amount
     - show Top-Off UI:
       - provide list of discretionary buckets with their available amounts
       - ordering for pulling: reverse `order` (bottom discretionary first)
       - user chooses which buckets to pull from
   - Apply top-off:
     - perform a transfer of `deficit` from chosen discretionary buckets into the essential bucket
     - then apply the debit allocation as normal
3. Discretionary overspend Top-Off
   - If a discretionary bucket would go negative:
     - show Top-Off UI with options:
       - “Pull equally from all discretionary buckets”
       - “Pull from selected discretionary buckets”
   - Apply top-off:
     - transfer funds from chosen discretionary sources into the overspent discretionary bucket
     - then apply the debit
4. Integrate into transaction update flow
   - On “Save transaction”:
     - run a “dry run” allocation to detect overspend
     - if overspend exists:
       - present modal
       - if user confirms Top-Off:
         - rerun allocation with top-off plan applied (or execute transfers then apply debit)
       - if user cancels:
         - block save and show message
5. If funds are insufficient
   - If available discretionary total < deficit, show an error state:
     - “Not enough discretionary funds to top off.”

## Agent testing (verification I will do)
1. Essential overspend:
   - create/edit a transaction that forces essential bucket negative
   - confirm Top-Off modal appears
   - choose a discretionary selection and confirm save succeeds
2. Discretionary overspend:
   - similar test with a discretionary bucket overspend
   - confirm equal vs selected modes produce expected transfers
3. Invariants:
   - after top-off + applying transaction, ensure:
     - no bucket is below 0 (based on your chosen rule)
     - sum(buckets[]) decreases by exactly transaction.amount (debit behavior)
4. Persistence:
   - reload and confirm the corrected state and transaction allocations remain.

## Human acceptance criteria (you can check)
1. Editing a transaction that would cause essential overspend prompts a Top-Off UI.
2. Choosing to top off prevents the essential bucket from going negative.
3. For discretionary overspend, Top-Off provides equal and/or selected discretionary pull options.
4. If not enough discretionary funds exist, the UI shows a clear error and does not corrupt bucket totals.

