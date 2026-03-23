"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  DiscretionaryBucketRow,
  EssentialBucketCard,
} from "@/components/home";
import { formatUsd } from "@/lib/format";
import { isUnassignedBucket } from "@/lib/unassigned-bucket";
import { appRoutes } from "@/lib/routes";
import {
  selectAccountBalance,
  selectSafeToSpend,
  useBudgetStore,
} from "@/state/budget-store";

export function Dashboard() {
  const account = useBudgetStore((s) => s.account);
  const balance = useBudgetStore(selectAccountBalance);
  const safe = useBudgetStore(selectSafeToSpend);
  const buckets = useBudgetStore((s) => s.buckets);
  const sortedBuckets = useMemo(
    () =>
      [...buckets]
        .sort((a, b) => a.order - b.order)
        .filter((b) => !isUnassignedBucket(b)),
    [buckets],
  );

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-4 pb-10 font-sans sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Account snapshot and safe-to-spend from your bucket assignments.
      </p>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Account balance
          </p>
          <p className="mt-1 text-sm font-medium text-zinc-800">{account.name}</p>
          <p className="mt-2 text-[48px] font-bold leading-none tracking-tight tabular-nums text-zinc-950">
            {formatUsd(balance)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Sum of all bucket amounts (matches assigned cash).
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">
            Safe to spend
          </p>
          <p className="mt-2 text-[48px] font-bold leading-none tracking-tight tabular-nums text-emerald-950">
            {formatUsd(safe)}
          </p>
          <p className="mt-1 text-xs text-emerald-800/85">
            Unlocked discretionary only (essentials and locked buckets
            excluded).
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium text-zinc-900">Buckets</h2>
        <Link
          href={appRoutes.transactions}
          className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
        >
          Transactions
        </Link>
      </div>
      <p className="mt-1 text-xs text-zinc-500">
        Ordered by priority (lowest first).
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {sortedBuckets.map((bucket) => (
          <li key={bucket.id}>
            {bucket.type === "essential" ? (
              <EssentialBucketCard bucket={bucket} />
            ) : (
              <DiscretionaryBucketRow bucket={bucket} />
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
