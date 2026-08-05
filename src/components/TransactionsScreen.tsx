"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  TOP_CARD_TRANSACTION_REFERENCE,
  TopCardTransaction,
} from "@/components/figma-buckets";
import { getEffectiveSplits } from "@/lib/allocation";
import { unmatchedTransactions } from "@/lib/merchant-matching";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";
import { useMerchantRulesStore } from "@/state/merchant-rules-store";

/** Full transactions list (Figma: Transactions / mobile screen). */
export function TransactionsScreen() {
  const transactions = useBudgetStore((s) => s.transactions);
  const buckets = useBudgetStore((s) => s.buckets);
  const runAutoMatch = useMerchantRulesStore((s) => s.runAutoMatch);
  const [filter, setFilter] = useState<"all" | "unmatched">("all");

  useEffect(() => {
    runAutoMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sorted = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );
  const visible = useMemo(
    () => (filter === "unmatched" ? unmatchedTransactions(sorted) : sorted),
    [filter, sorted],
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-10 pt-8">
        <h1 className="font-display text-[52px] leading-none">Transactions</h1>
        <TopCardTransaction {...TOP_CARD_TRANSACTION_REFERENCE} />

        <section className="flex flex-col gap-4">
          <h2 className="font-display px-1 text-[36px] leading-none">Money spent</h2>

          <div className="flex gap-2 px-1">
            {(["all", "unmatched"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`rounded px-2 py-1 text-xs ${filter === f ? "bg-[#1b1b1b] text-white" : "bg-[#e6e8dd]"}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "All" : "Unmatched"}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="px-1 text-sm text-[#222]/60">
              {filter === "unmatched" ? "No unmatched transactions." : "No transactions yet."}
            </p>
          ) : (
            <ul className="border-y border-[#222]/10">
              {visible.map((tx, index) => {
                const firstSplit = getEffectiveSplits(tx)[0];
                const bucket = firstSplit
                  ? buckets.find((item) => item.id === firstSplit.bucketId)
                  : undefined;
                const bucketName = bucket?.name ?? "Unassigned";
                const bucketHref = firstSplit
                  ? appRoutes.bucket(firstSplit.bucketId)
                  : appRoutes.buckets;
                return (
                  <li
                    key={tx.id}
                    className={index < visible.length - 1 ? "border-b border-[#222]/10" : ""}
                  >
                    <div className="flex items-center justify-between py-4">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={appRoutes.transaction(tx.id)}
                          className="w-fit text-[18px] font-semibold text-[#222] underline-offset-2 hover:underline"
                        >
                          {tx.merchant || "Target"}
                        </Link>
                        <Link
                          href={bucketHref}
                          className="w-fit text-[12px] font-medium text-[#1e0403]/50 underline-offset-2 hover:underline"
                        >
                          {bucketName}
                        </Link>
                      </div>
                      <Link
                        href={appRoutes.transaction(tx.id)}
                        className="text-[18px] font-semibold text-[#222] underline-offset-2 hover:underline"
                      >
                        ${Math.round(tx.amount)}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
