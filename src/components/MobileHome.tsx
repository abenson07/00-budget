"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AllBucketsButton,
  BalanceAlert,
  BucketCardCondensed,
  EssentialsStatus,
  TopCard,
  TransactionListCondensed,
} from "@/components/home";
import { formatUsd } from "@/lib/format";
import { legacyRoutes } from "@/lib/legacy-routes";
import {
  selectSafeToSpend,
  useBudgetStore,
} from "@/state/budget-store";

export function MobileHome() {
  const buckets = useBudgetStore((s) => s.buckets);
  const transactions = useBudgetStore((s) => s.transactions);
  const safe = useBudgetStore(selectSafeToSpend);
  const getBucketById = useBudgetStore((s) => s.getBucketById);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets],
  );
  const previewBuckets = sortedBuckets.slice(0, 2);
  const essentialBuckets = useMemo(
    () => sortedBuckets.filter((b) => b.type === "essential"),
    [sortedBuckets],
  );

  const recentTx = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, 7);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <TopCard
          formattedSafe={formatUsd(safe)}
          balanceAlert={<BalanceAlert variant="dashboardRule" />}
          essentials={<EssentialsStatus essentialBuckets={essentialBuckets} />}
        />

        <section className="flex flex-col items-stretch gap-6 py-2">
          <div className="grid grid-cols-2 gap-4">
            {previewBuckets.length === 0 ? (
              <p className="col-span-2 rounded-lg border border-[#bbb] bg-[#efeeea] p-4 text-sm text-[#1e0403]/70">
                No buckets yet. Open the{" "}
                <Link
                  href={legacyRoutes.home}
                  className="font-medium text-[#1e0403] underline underline-offset-2"
                >
                  legacy dashboard
                </Link>{" "}
                to manage data.
              </p>
            ) : (
              previewBuckets.map((b) => (
                <BucketCardCondensed key={b.id} bucket={b} />
              ))
            )}
          </div>

          <AllBucketsButton />
        </section>

        <TransactionListCondensed
          transactions={recentTx}
          getBucketById={getBucketById}
        />
      </div>
    </div>
  );
}
