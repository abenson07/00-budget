"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BucketBill,
  BucketMonthlySpending,
  BucketSpendingMoney,
  TOP_CARD_HOME_REFERENCE_CONTENT,
  TopCardHome,
} from "@/components/figma-buckets";
import { percentageTagForBucket } from "@/lib/bucket-percentage-tag";
import { discretionaryPriorityList } from "@/lib/discretionary-priority";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export function MobileBuckets() {
  const buckets = useBudgetStore((s) => s.buckets);
  const [showType, setShowType] = useState<"all" | "spending" | "bill" | "monthly">("all");
  const now = useMemo(() => new Date(), []);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets],
  );
  const discretionary = useMemo(() => discretionaryPriorityList(buckets), [buckets]);
  const essentialBuckets = useMemo(
    () => sortedBuckets.filter((b) => b.type === "essential"),
    [sortedBuckets],
  );

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <nav className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-xs font-medium text-[var(--budget-ink-soft)] underline decoration-[var(--budget-card-border)] underline-offset-2 transition-colors hover:text-[var(--budget-ink)]"
          >
            ← Home
          </Link>
          <Link
            href={appRoutes.bucketNew}
            className="shrink-0 rounded-[var(--radius-card)] bg-[var(--budget-forest)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity active:opacity-90"
          >
            New bucket
          </Link>
        </nav>

        <h1 className="font-display text-2xl leading-tight text-[var(--budget-forest)]">
          Buckets
        </h1>

        <TopCardHome {...TOP_CARD_HOME_REFERENCE_CONTENT} />

        <section className="rounded-lg border border-[#222]/10 bg-white/70 p-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "spending", "bill", "monthly"] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`rounded px-2 py-1 text-xs ${showType === type ? "bg-[#1b1b1b] text-white" : "bg-[#e6e8dd]"}`}
                onClick={() => setShowType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2" aria-label="Spending money">
          <div>
            <p className="text-base font-bold text-[var(--budget-ink)]">
              Spending money
            </p>
            <p className="mt-0.5 text-sm text-[var(--budget-ink-soft)]">
              The money you have left over for day-to-day choices.
            </p>
          </div>
          {showType !== "all" && showType !== "spending" ? null : discretionary.length === 0 ? (
            <p className="flex min-h-[88px] items-center rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-[var(--budget-sage-panel)] px-4 text-sm text-[var(--budget-ink-soft)]">
              No discretionary buckets yet.
            </p>
          ) : (
            discretionary.map((b, idx) => {
              const tag = percentageTagForBucket(b, now);
              const percentLabel = tag ? tag.label : "—";
              const rowAtRisk = tag?.variant === "atRisk";
              return (
                <div key={b.id} className="flex items-center gap-2">
                  <Link href={appRoutes.bucket(b.id)} className="min-w-0 flex-1">
                    <BucketSpendingMoney
                      title={b.name}
                      cadenceLabel={`$${Math.max(b.top_off ?? 0, 0).toFixed(0)} per paycheck`}
                      balanceLabel={`$${Math.max(b.amount, 0).toFixed(0)}`}
                      percentLabel={percentLabel}
                      atRisk={rowAtRisk}
                      locked={b.type === "discretionary" && Boolean(b.locked)}
                    />
                  </Link>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => useBudgetStore.getState().reorderDiscretionaryBucket(b.id, "up")}
                      className="rounded px-2 py-1 text-xs disabled:opacity-30"
                      aria-label={`Move ${b.name} up`}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === discretionary.length - 1}
                      onClick={() => useBudgetStore.getState().reorderDiscretionaryBucket(b.id, "down")}
                      className="rounded px-2 py-1 text-xs disabled:opacity-30"
                      aria-label={`Move ${b.name} down`}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="flex flex-col gap-2" aria-label="Essential spending">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="min-w-0 flex-1 text-base font-bold text-[var(--budget-ink)]">
              Essentials
            </p>
            <div className="text-xs text-[#222]/55">{essentialBuckets.length} buckets</div>
          </div>

          {essentialBuckets.map((bucket) => {
            const tag = percentageTagForBucket(bucket, now);
            const percentLabel = tag ? tag.label : "—";
            const rowAtRisk = tag?.variant === "atRisk";
            if (bucket.essential_subtype === "bill") {
              if (showType !== "all" && showType !== "bill") return null;
              return (
                <Link key={bucket.id} href={appRoutes.bucket(bucket.id)}>
                  <BucketBill
                    title={bucket.name}
                    balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                    cadenceLabel={`$${Math.max(bucket.top_off ?? 0, 0).toFixed(0)} per paycheck`}
                    atRisk={rowAtRisk}
                    percentLabel={percentLabel}
                  />
                </Link>
              );
            }
            if (showType !== "all" && showType !== "monthly") return null;
            return (
              <Link key={bucket.id} href={appRoutes.bucket(bucket.id)}>
                <BucketMonthlySpending
                  title={bucket.name}
                  balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                  cadenceLabel={`Top off to $${Math.max(bucket.top_off ?? 0, 0).toFixed(0)}`}
                  atRisk={rowAtRisk}
                  percentLabel={percentLabel}
                />
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
