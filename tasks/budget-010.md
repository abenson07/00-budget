# budget-010: Bill alerts UI (essential bill due/alert dates)

Goal: implement the alerts screen that notifies users of upcoming essential bills based on each essential `bill` bucket’s `alert_date` and `due_date`.

## Deliverable for this task
- `Alerts` route:
  - lists upcoming bill alerts
  - shows readable text like “Rent due in X days” (and/or alert date messaging)
- Alerts update automatically after bucket edits (due/alert dates) and after applying paycheck allocation.

## Implementation steps (agent)
1. Implement alerts query/selector (pure)
   - Find buckets where:
     - `type = essential`
     - `essential_subtype = bill`
   - For each bucket, compute:
     - whether an alert should show today based on your chosen rule for “on/before alert_date”
       - recommended: show if `today >= alert_date` AND `today <= due_date` OR until it’s due
     - days until due:
       - `daysUntilDue = differenceInDays(due_date, today)`
2. Implement Alerts page UI (`src/app/alerts/page.tsx`)
   - Render a list sorted by due date (soonest first).
   - Each alert item should show:
     - bucket name
     - due date
     - days remaining / days past (depending on rule)
     - optionally a badge if due today
   - Provide a link to the bucket detail page.
3. Persisted configuration
   - Ensure due/alert date edits in `budget-004` reflect in alerts after refresh.
4. Keep this Phase 1 scope focused
   - No need for advanced recurring schedules; just use the bucket’s stored due/alert dates.

## Agent testing (verification I will do)
1. With mock data, verify:
   - alerts appear for bills that should be “upcoming” based on your chosen date rule
2. Edit due/alert dates for a bill bucket:
   - confirm alerts list updates immediately
3. Reload:
   - confirm alerts remain correct after persistence round-trip.

## Human acceptance criteria (you can check)
1. Alerts page shows at least 1 essential bill alert from the mock dataset.
2. Alert messaging is understandable and includes due date context.
3. Changing a bill bucket’s due/alert date changes the alerts after refresh.

