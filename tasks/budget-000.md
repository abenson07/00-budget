# budget-000: Next.js + Tailwind + Zustand scaffold

Goal: create the baseline app structure so we can start implementing Buckets/Safe-to-Spend features without fighting routing, styling, or state wiring.

## Deliverable for this task
- A runnable Next.js (App Router) + TypeScript + Tailwind project
- Zustand store skeleton (DevTools enabled)
- Supabase client wiring skeleton (so later tasks can persist)
- Route skeletons for Phase 1 screens
- Mock data displayed somewhere so you can see the app isn’t blank

## Implementation steps (agent)
1. Scaffold the app
   - Create Next.js app in `budget-app/` using App Router and TypeScript (in `src/`).
   - Ensure scripts: `dev`, `build`, `start` work.
2. Add Tailwind
   - Configure Tailwind + PostCSS + `globals.css`.
   - Set up a simple mobile-first base layout.
3. Add core dependencies
   - `zustand` + `zustand/middleware` (use devtools middleware)
   - `supabase-js`
   - `date-fns`
   - (Optional but recommended) `zod` for validating split/inputs later
4. Create the base folder structure
   - `src/app/` for pages/routes
   - `src/state/` for Zustand store
   - `src/lib/` for pure helpers + Supabase client
5. Create Zustand store skeleton
   - Add `src/state/budgetStore.ts` with:
     - State shape placeholders for `account`, `buckets`, `transactions`, and feature toggles (Phase 2 later)
     - Actions placeholders (create/edit buckets, add/update transactions, allocate paycheck)
     - Selectors placeholders (`safeToSpend`, `bucketById`, etc.)
   - Enable devtools middleware so we can debug actions in the future.
6. Create Supabase wiring skeleton (Phase 1 persistence)
   - Follow **`tasks/human-tasks.md`**: install `@supabase/supabase-js` + `@supabase/ssr`.
   - Add `src/utils/supabase/server.ts`, `client.ts`, `middleware.ts` (session refresh), plus root `middleware.ts`.
   - Env vars (see `.env.local`):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
   - Create a thin repository layer (may be stubbed for now):
     - `src/lib/repositories/budgetRepo.ts`
     - Provide placeholder methods: `loadDemoAccount()`, `upsertBuckets()`, `upsertTransactions()`, etc.
7. Add route skeletons (Phase 1 screens)
   - `src/app/page.tsx` (mobile home; legacy dashboard lives under `/test`)
   - `src/app/test/buckets/[bucketId]/page.tsx` (Bucket Detail)
   - `src/app/test/transactions/[transactionId]/page.tsx` (Transaction Detail)
   - `src/app/simulate/page.tsx` (Paycheck Simulator)
   - `src/app/alerts/page.tsx` (Alerts)
8. Add minimal navigation + page shells
   - Show a top bar with links to Dashboard and Alerts (at least).
9. Display mock data
   - For now, use a simple in-memory initial state so `Dashboard` can render:
     - account balance (sum buckets)
     - safe-to-spend
     - list of bucket cards
   - Use the placeholder store state until `budget-001` provides real mock generators.

## Agent testing (verification I will do)
1. `npm install` (or `pnpm/yarn` depending on your choice) and `npm run dev`
2. Confirm the app loads without runtime errors.
3. Confirm each Phase 1 route shell renders (even if buttons are non-functional yet).
4. Confirm TypeScript builds (`npm run build`) and there are no ESLint/TS errors blocking startup.

## Human acceptance criteria (you can check)
1. Running the dev server (whatever the agent chooses) shows a page with a Dashboard header and at least a bucket list from mock state.
2. Visiting the other routes does not show a 404 and does not crash the app.
3. Tailwind styling is active (basic consistent spacing/typography).

