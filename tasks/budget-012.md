# budget-012: Credit card repayment allocation + credit card interactions

Goal: ensure credit card repayment behavior is consistent across:
- paycheck allocation (reserve enough for payment target)
- top-off/overspend interactions when payment cannot be covered
- alerts for due dates

## Deliverable for this task
- Credit card “repayment target” supported in the bucket rule configuration
- Paycheck simulator correctly applies credit card bucket rule like essential bill bucket
- A way to record a credit card payment event (prototype-level)
- Overspend/top-off flow works when paying/allocating creates a negative bucket state

## Implementation steps (agent)
1. Define the credit card payment target semantics
   - Use bucket rule fields:
     - `top_off` is treated as the target reserved amount (minimum or full balance)
     - or alternatively interpret it as target payment amount due at due date.
   - Document your chosen interpretation and keep it consistent in code.
2. Paycheck simulator integration
   - Ensure paycheck allocation includes credit card bucket in order by `order`.
   - For credit card bucket rule:
     - `top_off`: allocate up to target reserved amount
     - `percentage`: if used, define semantics (usually apply to incoming paycheck)
3. Credit card payment event (prototype-level)
   - Add a simple UI action to simulate payment:
     - either a new “Pay Credit Card” button on the Credit Card bucket page
     - or a transaction editor spending type like `credit_card_payment`
   - Payment action should:
     - reduce the Credit Card bucket amount by the payment amount
     - optionally update due/alert status (or just leave dates)
     - decrease total account/bucket sum by the payment amount (because real payment reduces checking)
4. Top-off interactions for payments
   - If a payment would make the Credit Card bucket go negative:
     - reuse essential overspend Top-Off flow (pull from discretionary buckets, reverse order)
   - Make sure the modal surfaces an appropriate label (“Top Off Credit Card Payment” or similar).
5. Alerts alignment
   - Alerts should show credit card bucket due/alert dates.
   - If the credit card payment due is reached, ensure alert logic behaves as expected with updated bucket amounts (even if alert content doesn’t depend on amount).

## Agent testing (verification I will do)
1. Paycheck reserve:
   - Set credit card bucket target (`top_off`) above its current amount.
   - Run paycheck simulator apply and confirm credit card bucket increases toward the target.
2. Payment:
   - Pay an amount less than or equal to credit card bucket balance.
   - Confirm credit card bucket decreases and total account balance decreases by the payment amount.
3. Payment overspend:
   - Attempt to pay more than the credit card bucket has.
   - Confirm Top-Off modal appears and after top-off + payment the credit card bucket is not negative.
4. Persistence:
   - Refresh and confirm the payment changes are persisted.

## Human acceptance criteria (you can check)
1. You can simulate reserving money for a credit card via paycheck simulator.
2. There is a clear “pay credit card” prototype action, and it decreases the credit card bucket.
3. If there isn’t enough reserved money, the app offers a top-off option to pull from discretionary buckets.
4. Alerts page continues to show credit card due/alert dates.

