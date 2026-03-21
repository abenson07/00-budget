"use client";

import { useMemo } from "react";
import { TransactionCard } from "@/components/home/TransactionCard";
import { formatUsd } from "@/lib/format";
import { sumSpentThisCalendarWeek } from "@/lib/spent-this-week";
import { txAllocationLabel } from "@/lib/tx-allocation-label";
import { useBudgetStore } from "@/state/budget-store";

/** Full transactions list (Figma: Transactions / mobile screen). */
export function TransactionsScreen() {
  const transactions = useBudgetStore((s) => s.transactions);
  const getBucketById = useBudgetStore((s) => s.getBucketById);

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

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-12 px-4 pb-10 pt-8">
        <section className="flex flex-col gap-4 text-[#1e1e1e]">
          <p className="font-[family-name:var(--font-instrument-serif)] text-2xl leading-tight">
            Transactions
          </p>
          <div className="flex flex-col gap-0">
            <p className="text-[48px] font-bold leading-none tracking-tight">
              {formatUsd(spentThisWeek)}
            </p>
            <p className="text-base text-[#1e1e1e]/80">spent this week</p>
          </div>
        </section>

        <section className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between px-4">
            <span className="text-xs font-bold tracking-wide text-black">
              Transactions
            </span>
            <span aria-hidden className="text-lg text-[#222]">
              →
            </span>
          </div>

          {sorted.length === 0 ? (
            <p className="px-4 text-sm text-[#1e0403]/60">
              No transactions yet.
            </p>
          ) : (
            <ul className="flex flex-col">
              {sorted.map((tx) => (
                <li key={tx.id}>
                  <TransactionCard
                    transaction={tx}
                    allocationLabel={txAllocationLabel(tx, getBucketById)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
