# budget-013: Loan bucket type + monthly payment allocation + alerts

Goal: extend Phase 2 to support “loan” buckets treated as essential bills, with monthly payment allocation and due-date alerts.

## Deliverable for this task
- New bucket type/subtype for `loan`
- Loan bucket fields:
  - due date (monthly cadence)
  - minimum payment amount (and optionally full target)
  - remaining debt (prototype tracking)
- Paycheck simulator includes loan buckets in allocation order
- Loan bucket due/alert alerts show on Alerts page
- Basic loan payment event (prototype-level) reduces reserved/payment bucket and debt tracker

## Implementation steps (agent)
1. Extend schema/types
   - Add bucket support for `loan` (either:
     - new `type` value `loan`, or
     - keep `type=essential` with `essential_subtype='loan'` and add additional fields).
   - Required fields (choose consistent naming):
     - `due_date` (date)
     - `alert_date` (date)
     - `loan_debt` (numeric, remaining debt; prototype-level)
     - `minimum_payment` (numeric; used as payment reservation target)
     - (optional) `full_balance_target`
   - Pick a consistent rule interpretation:
     - recommended: use `top_off = minimum_payment` as reservation target for paycheck allocation.
2. Paycheck simulator integration
   - Include loan buckets in the same top-to-bottom order allocation.
   - For loan buckets:
     - use `top_off` to reserve enough toward the minimum payment target.
3. Loan payment event (prototype-level)
   - Add a UI action:
     - “Pay Loan” from the loan bucket page, or
     - a transaction editor spending type that represents loan payment.
   - Payment should:
     - reduce the loan bucket reserved amount
     - reduce `loan_debt` by the payment amount (clamp at 0)
     - decrease account bucket sum by payment amount (real payment reduces checking)
   - If payment amount exceeds reserved loan bucket:
     - trigger overspend/top-off flow (reuse essential overspend top-off behavior).
4. Alerts integration
   - Extend `Alerts` selector to include loan buckets (same due/alert logic).

## Agent testing (verification I will do)
1. Allocation:
   - In paycheck simulator, set paycheck large enough to increase loan bucket toward the target.
2. Payment:
   - Pay a loan amount <= reserved loan bucket.
   - Confirm loan bucket decreases and debt tracker decreases.
3. Overspend:
   - Attempt to pay more than reserved (force negative scenario).
   - Confirm top-off modal appears and payment succeeds after user top-off.
4. Persistence:
   - Refresh and confirm loan state + alerts remain correct.

## Human acceptance criteria (you can check)
1. A new “Loan” bucket can be created/edited and shows loan due/alert fields.
2. Paycheck simulator reserves toward the loan target.
3. Alerts page includes loan due/alert notifications.
4. Paying a loan reduces the loan bucket and updates the remaining debt indicator.

