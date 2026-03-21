# budget-004: Bucket detail UI (balance, transactions, transfer/edit)

Goal: implement the bucket detail screen where users can inspect a bucket, see its assigned transactions, and perform manual transfers and bucket edits.

## Deliverable for this task
- Bucket detail route:
  - `Bucket Detail` page for a specific `bucketId`
  - Shows bucket balance
  - Shows transactions assigned to that bucket
- Manual bucket transfers:
  - Move money between buckets (without changing total account balance)
- Bucket edit:
  - Update bucket name, type, order
  - For essential buckets: edit essential subtype + due/alert dates (as applicable)
  - For rules: edit `top_off` and/or `percentage`

## Implementation steps (agent)
1. Implement Bucket Detail page (`src/app/test/buckets/[bucketId]/page.tsx`)
   - Fetch bucket by id from store.
   - Show:
     - bucket name
     - bucket type and essential subtype (if any)
     - `amount`
     - rule fields: `top_off` and/or `percentage`
     - due/alert dates for `bill` subtype
2. Assigned transactions list
   - Render a list/table of transactions that include this bucket in their splits.
   - Provide a link to each transaction detail route (`/test/transactions/[transactionId]`).
3. Manual bucket transfer UI + action wiring
   - UI:
     - pick destination bucket
     - input transfer amount
     - confirm/submit
   - Store action:
     - subtract from source bucket and add to destination bucket
     - ensure source bucket cannot go negative (or define behavior: allow negative but warn; recommended: prevent)
     - preserve the invariant that total bucket sum/account balance is unchanged by transfers
     - persist changes to Supabase
4. Bucket edit UI + actions
   - Provide edit form with fields:
     - name
     - type (`discretionary` | `essential`)
     - order
     - rule fields (`top_off`, `percentage`)
     - essential subtype (`bill` | `essential_spending`) if `type=essential`
     - due/alert dates if subtype is `bill`
   - Store action should update bucket and persist.
   - After update, derived selectors (safe-to-spend, alerts list) must update automatically.
5. Supabase update shape
   - Ensure your repository layer supports updating buckets in a consistent way.
   - If the schema uses `amount` as current bucket balance, edits should update that field too (unless you decide to keep it unchanged and only edit metadata).

## Agent testing (verification I will do)
1. UI smoke:
   - Open bucket detail route for each bucket in mock data.
   - Confirm transactions table shows entries when splits include that bucket.
2. Transfer correctness:
   - Transfer $X from bucket A to bucket B.
   - Verify `accountBalance` (sum of bucket amounts) does not change.
3. Edit correctness:
   - Change bucket type/order/rules.
   - Verify Dashboard safe-to-spend and ordering reflect the change.

## Human acceptance criteria (you can check)
1. Bucket detail page shows:
   - correct bucket name and current amount
   - a visible list of assigned transactions
2. Manual transfer:
   - after transferring, source bucket amount decreases and destination increases by exactly the entered amount
   - total account balance shown on Dashboard remains unchanged
3. Editing:
   - updating a bucket’s name/type/order/rules changes what you see immediately on Dashboard/bucket detail.

