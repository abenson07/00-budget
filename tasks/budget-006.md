# budget-006: Split logic execution + helper tests (apply/reverse)

Goal: make transaction splitting “bulletproof” by aligning UI/store behavior with the pure helper logic and adding unit tests that catch allocation drift.

## Deliverable for this task
- Pure helper functions fully support splits (multi-bucket, amount-based)
- Unit test coverage for:
  - split validation
  - apply/reverse invariants
  - update transaction equivalence
- Store actions used by the transaction editor call those helpers

## Implementation steps (agent)
1. Confirm helper design from `budget-002`
   - `validateSplits(txAmount, splits)` rejects invalid totals.
   - `applyDebitAllocation(buckets, splits)` subtracts from each bucket.
   - `reverseDebitAllocation(buckets, splits)` adds back.
2. Add split test cases
   - Valid case: splits sum exactly.
   - Invalid case: splits sum too low/high.
   - Boundary: floating point tolerance (epsilon).
   - Multiple splits across multiple bucket ids.
3. Add transaction update equivalence test
   - Let “state0” be initial bucket amounts.
   - Method A: update transaction with new splits.
   - Method B: delete the transaction (reverse old splits) then add it back with new splits.
   - Bucket balances after A and B must match.
4. Wire UI/store to helper behavior
   - Ensure the transaction editor uses the same split-validation as store.
5. Add a minimal “integration” test (optional)
   - If the codebase has test tooling set up, you can add a light test for store action output.

## Agent testing (verification I will do)
1. Run unit tests and ensure they pass.
2. Re-run manual UI checks from `budget-005`:
   - reassign
   - split across 2+ buckets
3. Confirm no runtime errors during save due to validation mismatch.

## Human acceptance criteria (you can check)
1. Saving split transactions always updates bucket balances correctly.
2. The app prevents saving invalid split totals.
3. No drift: editing a transaction and then re-editing it does not cause bucket totals to slowly diverge.

