"use client";

import Link from "next/link";
import { getEffectiveSplits } from "@/lib/allocation";
import { useBudgetStore } from "@/state/budget-store";

export function TransactionList() {
  const transactions = useBudgetStore((s) => s.transactions);
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-6 font-sans">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <Link
          href="/"
          className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
        >
          Dashboard
        </Link>
      </div>
      <ul className="mt-6 divide-y rounded-lg border border-zinc-200 bg-white">
        {sorted.map((tx) => {
          const splitCount = getEffectiveSplits(tx).length;
          return (
            <li key={tx.id}>
              <Link
                href={`/transactions/${tx.id}`}
                className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="font-medium">{tx.merchant}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    {tx.date}
                    {splitCount > 1
                      ? ` · ${splitCount} buckets`
                      : splitCount === 1
                        ? " · 1 bucket"
                        : null}
                  </span>
                </div>
                <span className="text-sm font-medium tabular-nums text-zinc-800">
                  ${tx.amount.toFixed(2)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
