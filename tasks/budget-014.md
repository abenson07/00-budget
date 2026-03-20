# budget-014: Prototype integration readiness + smoke tests + helper coverage

Goal: ensure Phase 2 and the overall “Buckets & Safe-to-Spend” flows are wired end-to-end enough to be a working prototype, with confidence from unit tests for core helpers and smoke checks for the UI.

## Deliverable for this task
- End-to-end wiring is complete for Phase 1 + Phase 2 feature flags
- A simple “smoke test” checklist you can run manually
- Unit test coverage for key pure helpers:
  - safe-to-spend
  - transaction split apply/reverse
  - transfers preserving totals
  - paycheck simulator allocation
  - overspend deficit detection + top-off transfer computations
  - alerts selector logic for essential bill/loan/credit-card buckets

## Implementation steps (agent)
1. Consolidate shared logic
   - Ensure all UI uses the same pure helpers/selectors for:
     - safe-to-spend
     - paycheck allocation preview/apply
     - transaction allocation apply/reverse
     - overspend deficit computation inputs
     - alerts due/alert date rules
2. Persistence correctness
   - Ensure each major action persists:
     - bucket edits
     - transactions create/update/delete (with splits)
     - manual transfers
     - paycheck simulator apply
     - overspend top-off flows
     - credit card spend/payment events (Phase 2)
     - loan payment events (Phase 2)
3. Add/update test tooling
   - Prefer one test framework (example: `vitest` + `@testing-library/react` for light component tests).
   - Add unit tests for pure helpers (no network).
4. Add manual smoke test scripts (docs)
   - Provide a `README` section or a `docs/SMOKE_TESTS.md` describing:
     - how to run dev
     - what to click
     - what you should observe
5. Verify prototype UX
   - Ensure mobile layout doesn’t break for the primary screens:
     - Dashboard
     - Bucket detail
     - Transaction detail
     - Simulator
     - Alerts

## Agent testing (verification I will do)
1. Run:
   - `npm run test` (or `pnpm test` depending on setup) and confirm all tests pass
2. Manual smoke:
   - Complete one flow end-to-end in the browser:
     - edit buckets
     - create a split transaction
     - run paycheck simulator apply
     - trigger overspend and top-off
     - verify alerts update
   - Repeat the flow once more with credit card mode and (if enabled) loan type.
3. Persistence smoke:
   - Reload browser and confirm the same state is present after a full refresh.

## Human acceptance criteria (you can check)
1. You can open the app and complete these “no surprises” actions without errors:
   - create/edit buckets (including one essential with due/alert dates)
   - create a transaction and assign/split it
   - see bucket amounts update accordingly
2. Paycheck simulator preview matches what “Apply” actually does.
3. Overspend top-off prevents negative bucket balances per the selected flow.
4. Alerts list shows due/alert items for essential bills and (in Phase 2) credit card and/or loans.
5. With Phase 2 toggles enabled, credit card and loan behaviors are consistent with the spec (spend/reserve and payment reduces reserved/updates debt indicators).

