"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BucketTransaction,
  TOP_CARD_TRANSACTION_REFERENCE,
  TopCardTransaction,
} from "@/components/figma-buckets";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

/** Full transactions list (Figma: Transactions / mobile screen). */
export function TransactionsScreen() {
  const transactions = useBudgetStore((s) => s.transactions);
  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-10 pt-8">
        <h1 className="font-display text-[52px] leading-none">Transactions</h1>
        <TopCardTransaction {...TOP_CARD_TRANSACTION_REFERENCE} />

        <section className="flex flex-col gap-4">
          <h2 className="font-display px-1 text-[36px] leading-none">Money spent</h2>

          {sorted.length === 0 ? (
            <p className="px-1 text-sm text-[#222]/60">No transactions yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-[#222]/10 border-y border-[#222]/10">
              {sorted.map((tx) => (
                <li key={tx.id}>
                  <Link href={appRoutes.transaction(tx.id)}>
                    <BucketTransaction
                      title={tx.merchant || "Target"}
                      amountLabel={`$${tx.amount.toFixed(0)}`}
                      className="rounded-none bg-transparent px-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
