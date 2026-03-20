# budget-011: Feature flags + credit card mode + credit card bucket

Goal: add Phase 2 feature-flag plumbing and implement credit-card mode behavior (new transaction spending type + credit card bucket that tracks reserved payment money).

## Deliverable for this task
- Feature flag toggle (credit card mode) available in UI (and optionally env-based)
- Transaction editor supports/records `spending_type = credit_card` (Phase 2)
- Credit card bucket behavior:
  - exists as an essential bucket with a bill subtype (or equivalent fields)
  - starts at $0
  - increases when credit-card spending occurs
  - integrates with paycheck allocation ordering and alerts
- Update safe-to-spend calculation so credit card bucket is excluded (since it is essential)

## Implementation steps (agent)
1. Add feature flags to state + persistence strategy
   - Add `featureFlags` to store state, e.g.:
     - `enableCreditCard`
     - later `enableLoans`
   - Provide:
     - default values (off for credit card in Phase 1)
     - a UI toggle or a config file/env toggle
   - Persist flag choice either:
     - in Supabase (recommended for prototype), or
     - as local-only for now.
2. Expand bucket and transaction types
   - Buckets:
     - allow a “Credit Card” essential bucket (likely subtype `bill`)
     - include rule/fields to support repayment targets (e.g., `top_off` as target payment amount)
   - Transactions:
     - add spending type `credit_card`
     - keep Phase 1 debit allocation behavior unchanged
3. Credit card transaction logic (core)
   - When `spending_type = credit_card`:
     - Determine the “merchant bucket” like Phase 1 would for debit transactions (based on your existing bucket assignment approach).
     - Apply the checkbook logic:
       - subtract from the merchant-determined bucket by the transaction amount
       - add the same amount to the `Credit Card` bucket (so the account/bucket total is not reduced by credit card spending)
   - This implies credit-card spending is a “reallocation within buckets,” not a decrease in total account balance.
4. Credit card bucket classification and alerts
   - Credit card bucket should be treated as essential (excluded from safe-to-spend).
   - Set/require due date + alert date fields for alerts (or reuse the bill bucket alert logic).
5. UI updates
   - Transaction editor:
     - allow selecting transaction spending type (debit vs credit_card) when feature flag is enabled
     - ensure split/reassign UI still works (merchant bucket is determined; credit card bucket addition happens automatically)
   - Add a small “Credit Card” section in Dashboard or bucket list tag.

## Agent testing (verification I will do)
1. With `enableCreditCard` on:
   - Create a credit-card transaction:
     - confirm merchant bucket decreases by transaction amount
     - confirm Credit Card bucket increases by the same amount
     - confirm total bucket sum/account balance is unchanged by the credit-card transaction
2. safe-to-spend:
   - confirm safe-to-spend excludes the credit card bucket amount.
3. Alerts:
   - if Credit Card bucket has due/alert dates, confirm Alerts page includes it.
4. Persistence:
   - refresh and verify credit card bucket amount and transaction are persisted.

## Human acceptance criteria (you can check)
1. There is a visible toggle for credit card mode (or env-driven behavior documented).
2. When you add a credit-card transaction:
   - the credit card bucket increases
   - safe-to-spend updates accordingly (typically decreases because more is reserved in an essential bucket).
3. Alerts shows credit card due/alert information when due dates are set.

