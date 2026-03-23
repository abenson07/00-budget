"use client";

import { useMemo } from "react";
import {
  TopCardSpentThisWeek,
  TransactionCard,
} from "@/components/home";
import { formatUsd } from "@/lib/format";
import {
  sumSpentOnEssentialBucketsThisCalendarWeek,
  sumSpentThisCalendarWeek,
} from "@/lib/spent-this-week";
import { useBudgetStore } from "@/state/budget-store";

/** Full transactions list (Figma: Transactions / mobile screen). */
export function TransactionsScreen() {
  const transactions = useBudgetStore((s) => s.transactions);
  const buckets = useBudgetStore((s) => s.buckets);
  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );

  const spentThisWeek = useMemo(
    () => sumSpentThisCalendarWeek(transactions),
    [transactions],
  );

  const billsSpent = useMemo(
    () => sumSpentOnEssentialBucketsThisCalendarWeek(transactions, buckets),
    [transactions, buckets],
  );

  return (
    <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-4 pb-10 pt-8">
        <h1 className="font-display text-2xl leading-tight text-[var(--budget-forest)]">
          Transactions
        </h1>

        <TopCardSpentThisWeek
          spentFormatted={formatUsd(spentThisWeek)}
          billsSpentFormatted={formatUsd(billsSpent)}
        />

        <section className="flex flex-col gap-4">
          <h2 className="font-display px-1 text-xl text-[var(--budget-ink)]">
            Money spent
          </h2>

          {sorted.length === 0 ? (
            <p className="px-1 text-sm text-[var(--budget-ink-soft)]">
              No transactions yet.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--budget-card-border)] border-y border-[var(--budget-card-border)] bg-white/40">
              {sorted.map((tx) => (
                <li key={tx.id}>
                  <TransactionCard transaction={tx} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
