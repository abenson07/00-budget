"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  TOP_CARD_TRANSACTION_REFERENCE,
  TopCardTransaction,
} from "@/components/figma-buckets";
import { getEffectiveSplits } from "@/lib/allocation";
import { appRoutes } from "@/lib/routes";
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

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-10 pt-8">
        <h1 className="font-display text-[52px] leading-none">All Transactions</h1>
        <TopCardTransaction {...TOP_CARD_TRANSACTION_REFERENCE} />

        <section className="flex flex-col gap-4">
          <h2
            className={[
              "font-display box-border px-1",
              "w-[285px] max-w-full h-[31px]",
              "flex items-center",
              "text-[24px] leading-[31px] font-normal",
              "text-[#1c3812]",
            ].join(" ")}
          >
            Money spent
          </h2>

          {sorted.length === 0 ? (
            <p className="px-1 text-sm text-[#222]/60">No transactions yet.</p>
          ) : (
            <ul className="border-y border-[#222]/10">
              {sorted.map((tx, index) => {
                const firstSplit = getEffectiveSplits(tx)[0];
                const bucket = firstSplit
                  ? buckets.find((item) => item.id === firstSplit.bucketId)
                  : undefined;
                const bucketName = bucket?.name ?? "Unassigned";
                const amountRounded = Math.round(tx.amount);
                return (
                  <li
                    key={tx.id}
                    className={index < sorted.length - 1 ? "border-b border-[#222]/10" : ""}
                  >
                    <Link
                      href={appRoutes.transaction(tx.id)}
                      className="flex items-center justify-between gap-4 px-1 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222]/30"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {/* Figma status/avatar icon: hollow ring + dot */}
                        <span
                          aria-hidden
                          className="relative flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 border-[#9a3412]"
                        >
                          <span className="size-[6px] rounded-full bg-[#9a3412]" />
                        </span>

                        <div className="min-w-0 flex flex-col gap-1">
                          <p className="truncate text-[16px] font-semibold text-[#222]">
                            {tx.merchant || "Target"}
                          </p>
                          <p className="truncate text-[12px] font-medium text-[#222]/60">
                            {bucketName}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 tabular-nums text-[16px] font-semibold text-[#222]">
                        ${amountRounded}
                      </span>
                    </Link>
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
