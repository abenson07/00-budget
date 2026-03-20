"use client";

import Link from "next/link";
import { useBudgetStore } from "@/state/budget-store";

type Props = { transactionId: string };

export function TransactionDetail({ transactionId }: Props) {
  const tx = useBudgetStore((s) =>
    s.transactions.find((t) => t.id === transactionId),
  );
  const getBucketById = useBudgetStore((s) => s.getBucketById);

  if (!tx) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl p-6 font-sans">
        <p className="text-zinc-600">Transaction not found.</p>
        <Link
          href="/transactions"
          className="mt-4 inline-block text-sm font-medium text-zinc-700 underline"
        >
          Back to list
        </Link>
      </main>
    );
  }

  const splits = tx.splits ?? [];

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-6 font-sans">
      <Link
        href="/transactions"
        className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
      >
        ← Transactions
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        {tx.merchant}
      </h1>
      <p className="mt-1 text-sm text-zinc-600">{tx.date}</p>
      <p className="mt-4 text-3xl font-semibold tabular-nums">
        ${tx.amount.toFixed(2)}
      </p>

      <h2 className="mt-8 text-lg font-medium">Allocations</h2>
      {splits.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500">No split rows for this tx.</p>
      ) : (
        <ul className="mt-3 divide-y rounded-lg border border-zinc-200 bg-white">
          {splits.map((row) => {
            const bucket = getBucketById(row.bucketId);
            const pct =
              row.percentage != null
                ? `${(row.percentage * 100).toFixed(1)}%`
                : tx.amount > 0
                  ? `${((row.amount / tx.amount) * 100).toFixed(1)}%`
                  : "—";
            return (
              <li
                key={row.bucketId}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="font-medium">
                  {bucket?.name ?? row.bucketId}
                </span>
                <span className="text-right text-sm tabular-nums text-zinc-700">
                  ${row.amount.toFixed(2)}
                  <span className="ml-2 text-xs text-zinc-500">({pct})</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
