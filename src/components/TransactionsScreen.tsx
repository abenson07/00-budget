"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
            <ul className="border-y border-[#222]/10">
              {sorted.map((tx, index) => {
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
                    className={index < sorted.length - 1 ? "border-b border-[#222]/10" : ""}
                  >
                    <div
                      role="link"
                      tabIndex={0}
                      className="flex cursor-pointer items-center justify-between py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222]/30"
                      onClick={() => router.push(appRoutes.transaction(tx.id))}
                      onKeyDown={(e) => {
                        // Only activate when the row itself is focused (not when tabbing through child links).
                        if (e.target !== e.currentTarget) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(appRoutes.transaction(tx.id));
                        }
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <Link
                          href={bucketHref}
                          className="w-fit text-[12px] font-medium text-[#1e0403]/50 underline-offset-2 hover:underline"
                          onClick={(e) => {
                            // Keep bucket navigation separate from row transaction navigation.
                            e.stopPropagation();
                          }}
                        >
                          {bucketName}
                        </Link>
                        <span className="w-fit text-[18px] font-semibold text-[#222] underline-offset-2 hover:underline">
                          {tx.merchant || "Target"}
                        </span>
                      </div>
                      <span className="text-[18px] font-semibold text-[#222] underline-offset-2 hover:underline">
                        ${Math.round(tx.amount)}
                      </span>
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
