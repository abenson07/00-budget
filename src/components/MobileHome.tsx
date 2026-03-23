"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BucketHome,
  BucketTransaction,
  TOP_CARD_HOME_REFERENCE_CONTENT,
  TopCardHome,
} from "@/components/figma-buckets";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export function MobileHome() {
  const transactions = useBudgetStore((s) => s.transactions.slice(0, 6));
  const [essentialsOpen, setEssentialsOpen] = useState(false);
  const homeBuckets = useMemo(
    () => [
      { title: "Eating out", amountLabel: "$232", percentLabel: "20% " },
      { title: "Groceries", amountLabel: "$422", percentLabel: "80% " },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <TopCardHome
          {...TOP_CARD_HOME_REFERENCE_CONTENT}
          expanded={essentialsOpen}
          onExpandedChange={setEssentialsOpen}
          showToggleButton
        />

        <section className="flex flex-col gap-2">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            {homeBuckets.map((bucket) => (
              <Link key={bucket.title} href={appRoutes.buckets}>
                <BucketHome {...bucket} />
              </Link>
            ))}
            <Link
              href={appRoutes.buckets}
              className="flex min-h-[7.5rem] items-center justify-center rounded-lg bg-[#e6e8dd] px-2 text-center text-[12px] font-bold text-[#1c3812] opacity-80"
            >
              See all buckets
            </Link>
          </div>
          <div className="flex justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1c3812]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#1c3812]/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#1c3812]/40" />
          </div>
        </section>

        <section
          className={`flex flex-col gap-2 transition-opacity ${
            essentialsOpen ? "opacity-40" : "opacity-100"
          }`}
        >
          <h2 className="font-display text-[36px] leading-none">Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-[#222]/60">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-[#222]/10">
              {transactions.map((tx) => (
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
