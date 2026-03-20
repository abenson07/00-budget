# Human tasks: Phase 1 setup (Supabase + secrets)

This file lists what **you** do on your machine and in the Supabase dashboard. The agent will align app code with this.

---

## 1. Install packages (in the Next.js app root)

Run:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- **`@supabase/supabase-js`** — database client.
- **`@supabase/ssr`** — cookie-based server/browser clients and session refresh for the Next.js App Router.

---

## 2. Persistence model (recommended)

Use **one demo `account` row** and link everything to it:

- **`accounts`** — one row for the prototype.
- **`buckets`** — all buckets for that account (including special **Unassigned**).
- **`transactions`** — one row per transaction.
- **`transaction_splits`** — zero or more rows per transaction (splits).

The app treats **account balance = sum of all bucket `amount` values** (including Unassigned).

---

## 3. Create tables (SQL)

1. Open Supabase → **SQL Editor**.
2. Paste and run the full script in **[`supabase-schema.sql`](./supabase-schema.sql)** (in this `tasks/` folder).

That script creates `accounts`, `buckets`, `transactions`, and `transaction_splits`.

---

## 4. Row Level Security (RLS)

For the prototype: **keep RLS disabled** on these tables (no policies needed yet).

That lets the publishable/anon key work for simple read/write while you build the UI.

---

## 5. Environment variables

The agent creates **`.env.local`** in the **Next.js app root** with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

**You add later** (server-only; never `NEXT_PUBLIC_`):

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Use the service role only for trusted server code (e.g. admin scripts, bypass RLS). Prefer the publishable key in the app during the RLS-off prototype.

---

## 6. Supabase helpers + middleware (reference for the agent)

After the app is scaffolded, use this layout (paths assume `src/`):

| File | Role |
|------|------|
| `src/utils/supabase/server.ts` | `createServerClient` + cookies (Server Components / Route Handlers) |
| `src/utils/supabase/client.ts` | `createBrowserClient` (Client Components) |
| `src/utils/supabase/middleware.ts` | `updateSession(request)` — refresh session, return `NextResponse` with cookies |
| `middleware.ts` (repo root) | `export async function middleware(request) { return await updateSession(request) }` |

**Important:** Middleware must call something like `supabase.auth.getUser()` (or the documented equivalent) so sessions refresh; returning `NextResponse.next` alone is not enough.

**Server Component example** (swap table name as the app grows):

```tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: buckets } = await supabase.from('buckets').select('*')

  return (
    <ul>
      {buckets?.map((b) => (
        <li key={b.id}>{b.name}</li>
      ))}
    </ul>
  )
}
```

---

## 7. N8N

**Skip for now** — no n8n setup required for Phase 1.

---

## 8. Optional: Supabase agent skills

If you want richer AI tooling for Supabase later:

```bash
npx skills add supabase/agent-skills
```

---

## Agent testing (verification I will do)

1. Confirm `npm install @supabase/supabase-js @supabase/ssr` is reflected in `package.json` after scaffold.
2. Confirm `.env.local` exists and the app reads `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` without runtime errors.
3. After you run `supabase-schema.sql`, run a smoke query from a Server Component or script: `select` from `accounts` / `buckets` / `transactions`.
4. Insert/update a row and reload — data persists (RLS off).

---

## Human acceptance criteria (you can check)

1. Tables from **`supabase-schema.sql`** exist in Supabase (no migration errors).
2. RLS is **off** (or unused) on those tables so the app can CRUD with the publishable key.
3. `.env.local` is present locally; you can add `SUPABASE_SERVICE_ROLE_KEY` when ready (not committed).
4. No Supabase connection/auth errors when opening the app after the agent wires helpers.
