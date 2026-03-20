"use client";

import Link from "next/link";
import {
  safeToSpendTotal,
  sumBucketAmounts,
  useBudgetStore,
} from "@/state/budget-store";

export function Dashboard() {
  const account = useBudgetStore((s) => s.account);
  const buckets = useBudgetStore((s) => s.buckets);

  const sorted = [...buckets].sort((a, b) => a.order - b.order);
  const balance = sumBucketAmounts(buckets);
  const safe = safeToSpendTotal(buckets);

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-6 font-sans">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Demo data from the budget store (Phase 1 mock).
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Account
          </p>
          <p className="mt-1 text-lg font-semibold">{account.name}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            ${balance.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Sum of bucket assignments
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">
            Safe to spend
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-900">
            ${safe.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-emerald-800/80">
            Discretionary buckets (includes Unassigned)
          </p>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-medium">Buckets</h2>
        <Link
          href="/transactions"
          className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
        >
          Transactions
        </Link>
      </div>

      <ul className="mt-3 divide-y rounded-lg border border-zinc-200 bg-white">
        {sorted.map((b) => (
          <li
            key={b.id}
            className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <span className="font-medium">{b.name}</span>
              <span className="mt-0.5 block text-xs text-zinc-500">
                {b.type === "essential"
                  ? `essential · ${b.essential_subtype}`
                  : "discretionary"}
                {b.type === "essential" && b.essential_subtype === "bill"
                  ? ` · due ${b.due_date}`
                  : null}
              </span>
            </div>
            <span className="text-sm tabular-nums text-zinc-700">
              ${b.amount.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
