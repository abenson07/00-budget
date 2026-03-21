"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BalanceAlert,
  DiscretionaryBucketRow,
  EssentialsStatus,
  EssentialsSummaryRow,
  TopCard,
} from "@/components/home";
import { formatUsd } from "@/lib/format";
import {
  selectSafeToSpend,
  useBudgetStore,
} from "@/state/budget-store";

export function MobileBuckets() {
  const buckets = useBudgetStore((s) => s.buckets);
  const safe = useBudgetStore(selectSafeToSpend);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets],
  );
  const discretionary = useMemo(
    () => sortedBuckets.filter((b) => b.type === "discretionary"),
    [sortedBuckets],
  );
  const essentialBuckets = useMemo(
    () => sortedBuckets.filter((b) => b.type === "essential"),
    [sortedBuckets],
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-[4.5rem]">
        <nav>
          <Link
            href="/"
            className="font-mono text-xs font-medium text-[#1e0403]/70 underline decoration-[#1e0403]/25 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← Home
          </Link>
        </nav>

        <TopCard
          variant="plain"
          formattedSafe={formatUsd(safe)}
          balanceAlert={<BalanceAlert variant="dashboardRule" />}
        />

        <section className="flex flex-col gap-2" aria-label="Discretionary buckets">
          <p className="font-[family-name:var(--font-instrument-serif)] text-xl text-[#1e1e1e]">
            Discretionary Spending
          </p>
          {discretionary.length === 0 ? (
            <p className="flex min-h-[88px] items-center rounded-lg border border-[#bbb] bg-[#efeeea] px-4 text-sm text-[#1e0403]/75">
              No discretionary buckets yet.
            </p>
          ) : (
            discretionary.map((b) => (
              <DiscretionaryBucketRow key={b.id} bucket={b} />
            ))
          )}
        </section>

        <section
          className="flex flex-col gap-2"
          aria-label="Essential spending"
        >
          <div className="flex w-full items-center justify-between gap-3">
            <p className="min-w-0 flex-1 font-[family-name:var(--font-instrument-serif)] text-xl text-[#1e1e1e]">
              Essential Spending
            </p>
            <div className="flex min-w-0 shrink-0 flex-col items-end gap-2 text-right">
              <EssentialsStatus
                essentialBuckets={essentialBuckets}
                tone="onLight"
              />
            </div>
          </div>

          <EssentialsSummaryRow essentialBuckets={essentialBuckets} />
        </section>
      </div>
    </div>
  );
}
