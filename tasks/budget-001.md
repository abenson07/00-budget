# budget-001: Domain types + mock data generators

Goal: define the core data model in TypeScript and generate consistent mock “demo account/buckets/transactions” so the rest of Phase 1 can focus on correctness and UI.

## Deliverable for this task
- TS types for `Account`, `Bucket` (including essential subtype), and `Transaction` (with optional `splits`)
- A `mockData` generator producing:
  - At least one essential bucket of subtype `bill` and one of subtype `essential_spending`
  - At least one discretionary bucket
  - The special `Unassigned` bucket
  - A small transaction set including at least one split transaction
- Store initialization uses mock data (for now) so screens can render real values

## Implementation steps (agent)
1. Add domain types (in `src/state/` or `src/lib/types.ts`)
   - `Account`: include id + name (balance can be derived from buckets for invariant simplicity)
   - `Bucket`:
     - `id`, `name`, `type`: `discretionary` | `essential`
     - `order`: number (top-to-bottom priority)
     - `amount`: current assigned amount in that bucket
     - Rule fields:
       - `top_off` (goal amount) nullable
       - `percentage` (incoming money fraction or percent) nullable
     - Essential subtype (if `type=essential`):
       - `essential_subtype`: `bill` | `essential_spending`
       - if `bill`: `due_date`, `alert_date`
2. Define transaction model (Phase 1)
   - `Transaction`:
     - `id`, `account_id`
     - `amount` (positive)
     - `merchant`
     - `date`
     - `spending_type` for Phase 1: `debit`
     - Optional `splits`: array of `{ bucketId, amount, percentage }`
   - Pick one “source of truth” for splits in Phase 1 UI:
     - Prefer storing split `amount` primarily
     - Allow `percentage` to be derived from amounts (or vice-versa) later if you want
3. Implement mock generator (`src/lib/mockData.ts`)
   - Produce deterministic mock values (optional seed for repeatability).
   - Ensure:
     - Bucket `order` values are distinct so paycheck simulator is predictable later.
     - Unassigned bucket exists and is treated as discretionary for safe-to-spend purposes.
     - At least one transaction uses splits across >= 2 buckets.
4. Integrate with Zustand store
   - Initialize store with the generated mock dataset.
   - Ensure selectors can find a bucket by id and compute assigned transactions per bucket based on `splits`.
5. Add basic validation helpers (pure)
   - Validate split rows:
     - split total equals `transaction.amount` (within small epsilon for floats)
     - bucket ids referenced by splits exist in the generated dataset

## Agent testing (verification I will do)
1. Run dev server and confirm Dashboard shows non-zero bucket amounts and safe-to-spend.
2. Confirm Transaction list/detail (routes may still be shells) can locate transactions and display split allocations.
3. Add/execute small unit checks for mock invariants (split totals, existing bucket ids).

## Human acceptance criteria (you can check)
1. Dashboard displays:
   - account balance (or sum of buckets)
   - safe-to-spend value
   - a visible list of buckets including `Unassigned`
2. There is at least one transaction in the mock dataset that is split across multiple buckets (you can verify by navigating to any transaction detail route once it exists or via a temporary debug component).

