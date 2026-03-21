# budget-005: Transaction detail editor (reassign + split editor UI)

Goal: implement the transaction editor where a user can reassign a transaction to a bucket and optionally split it across multiple buckets.

## Deliverable for this task
- Transaction detail route with editor:
  - Reassign transaction to a single bucket
  - Split editor to add/remove split rows
  - Validation before saving
  - Save triggers bucket balance updates
- Works with Phase 1 transaction model (`spending_type=debit`)

## Implementation steps (agent)
1. Implement Transaction Detail page (`src/app/test/transactions/[transactionId]/page.tsx`)
   - Display:
     - merchant, date, amount
     - current split allocations (bucket + amount)
2. Reassign mode
   - Provide a bucket dropdown to set the transaction to a single bucket.
   - When switching from split mode to single bucket, collapse splits to one split row.
3. Split mode editor
   - Allow adding split rows.
   - Each split row should capture:
     - `bucketId`
     - `amount` (recommended for Phase 1)
   - UI constraint:
     - Show computed “split total” and whether it matches `transaction.amount`.
   - Validation rules (enforced in UI and store):
     - sum of split amounts == transaction amount (within epsilon)
     - no duplicate bucket rows (or define duplicates behavior)
4. Save action
   - On submit:
     - call store `updateTransaction(txId, updated)` which must:
       - reverse old allocations
       - apply new allocations
       - persist to Supabase
5. Error states
   - If split totals do not match, disable Save and display an error.
   - If referenced bucket ids do not exist, show an error.

## Agent testing (verification I will do)
1. UI validation:
   - Try saving with split sum != transaction amount; confirm save is blocked.
2. Correctness:
   - Reassign from bucket A to bucket B.
   - Confirm bucket A decreases by `amount` and bucket B decreases by `amount` (and no other buckets change).
3. Split:
   - Split $100 into $30/$70 across two buckets.
   - Confirm each bucket decreases by the correct split amounts.
4. Persistence:
   - Reload page and confirm transaction edits persist.

## Human acceptance criteria (you can check)
1. Transaction detail screen allows choosing a bucket (reassign) and saving.
2. Transaction can be split across multiple buckets using the split editor.
3. After saving:
   - bucket balances shown in Dashboard/bucket detail change consistently
   - transaction edit persists after refresh.

