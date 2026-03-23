"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BalanceAlert,
  DiscretionaryBucketRow,
  EssentialsStatus,
  EssentialsSummaryRow,
  TopCardForest,
} from "@/components/home";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import { isUnassignedBucket } from "@/lib/unassigned-bucket";
import {
  selectSafeToSpend,
  useBudgetStore,
} from "@/state/budget-store";

const PAYCHECK_DAYS_PLACEHOLDER = 14;

export function MobileBuckets() {
  const buckets = useBudgetStore((s) => s.buckets);
  const safe = useBudgetStore(selectSafeToSpend);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets],
  );
  const discretionary = useMemo(
    () =>
      sortedBuckets.filter(
        (b) => b.type === "discretionary" && !isUnassignedBucket(b),
      ),
    [sortedBuckets],
  );
  const essentialBuckets = useMemo(
    () => sortedBuckets.filter((b) => b.type === "essential"),
    [sortedBuckets],
  );

  const perDay =
    PAYCHECK_DAYS_PLACEHOLDER > 0
      ? formatUsd(safe / PAYCHECK_DAYS_PLACEHOLDER)
      : "—";

  return (
    <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
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

        <TopCardForest
          formattedSafe={formatUsd(safe)}
          balanceAlert={
            <BalanceAlert
              variant="paycheck"
              paycheckDays={PAYCHECK_DAYS_PLACEHOLDER}
              perDayFormatted={perDay}
            />
          }
        />

        <section className="flex flex-col gap-2" aria-label="Spending money">
          <div>
            <p className="text-base font-bold text-[var(--budget-ink)]">
              Spending money
            </p>
            <p className="mt-0.5 text-sm text-[var(--budget-ink-soft)]">
              The money you have left over for day-to-day choices.
            </p>
          </div>
          {discretionary.length === 0 ? (
            <p className="flex min-h-[88px] items-center rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-[var(--budget-sage-panel)] px-4 text-sm text-[var(--budget-ink-soft)]">
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
            <p className="min-w-0 flex-1 text-base font-bold text-[var(--budget-ink)]">
              Essentials
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
