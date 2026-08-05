"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BucketBill,
  BucketMonthlySpending,
  TopCardEssentials,
} from "@/components/figma-buckets";
import { PageHeader, PageShell, SectionHeading } from "@/components/ui";
import { percentageTagForBucket } from "@/lib/bucket-percentage-tag";
import { buildEssentialsCardSummary } from "@/lib/essentials-summary";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export function MobileEssentialsBuckets() {
  const buckets = useBudgetStore((s) => s.buckets);
  const now = useMemo(() => new Date(), []);
  const cardSummary = useMemo(() => buildEssentialsCardSummary(buckets, now), [buckets, now]);

  const essentialBuckets = useMemo(
    () =>
      [...buckets]
        .filter((b) => b.type === "essential")
        .sort((a, b) => a.order - b.order),
    [buckets],
  );

  const bills = useMemo(
    () =>
      essentialBuckets.filter(
        (b) => b.type === "essential" && b.essential_subtype === "bill",
      ),
    [essentialBuckets],
  );
  const monthly = useMemo(
    () =>
      essentialBuckets.filter(
        (b) => b.type === "essential" && b.essential_subtype === "essential_spending",
      ),
    [essentialBuckets],
  );

  return (
    <PageShell>
      <PageHeader title="Essential Buckets" backHref="/buckets" />

      <TopCardEssentials {...cardSummary} />

      <section className="flex flex-col gap-3" aria-label="Bills">
        <div className="flex flex-col gap-1">
          <SectionHeading>Bills</SectionHeading>
          <p className="text-sm text-budget-ink-soft">
            The stuff that keeps the lights on.
          </p>
        </div>
          {bills.length === 0 ? (
            <p className="rounded-card border border-budget-card-border bg-budget-card px-4 py-6 text-sm text-budget-ink-soft">
              No bill buckets yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {bills.map((b) => {
                const tag = percentageTagForBucket(b, now);
                const percentLabel = tag ? tag.label : "—";
                const atRisk = tag?.variant === "atRisk";
                return (
                  <li key={b.id}>
                    <Link href={appRoutes.bucket(b.id)}>
                      <BucketBill
                        title={b.name}
                        cadenceLabel={`$${Math.max(b.top_off ?? 0, 0).toFixed(0)} per paycheck`}
                        balanceLabel={`$${Math.max(b.amount, 0).toFixed(0)}`}
                        percentLabel={percentLabel}
                        atRisk={atRisk}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3" aria-label="Monthly spending">
          <div className="flex flex-col gap-1">
            <SectionHeading>Monthly spending</SectionHeading>
            <p className="text-sm text-budget-ink-soft">
              The stuff you choose to spend for life.
            </p>
          </div>
          {monthly.length === 0 ? (
            <p className="rounded-card border border-budget-card-border bg-budget-card px-4 py-6 text-sm text-budget-ink-soft">
              No monthly essentials yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {monthly.map((b) => {
                const tag = percentageTagForBucket(b, now);
                const percentLabel = tag ? tag.label : "—";
                const atRisk = tag?.variant === "atRisk";
                return (
                  <li key={b.id}>
                    <Link href={appRoutes.bucket(b.id)}>
                      <BucketMonthlySpending
                        title={b.name}
                        cadenceLabel={`Top off to $${Math.max(b.top_off ?? 0, 0).toFixed(0)}`}
                        balanceLabel={`$${Math.max(b.amount, 0).toFixed(0)}`}
                        percentLabel={percentLabel}
                        atRisk={atRisk}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2 opacity-80" aria-label="Rainy day">
          <SectionHeading>Rainy day</SectionHeading>
          <p className="text-sm text-budget-ink-soft">
            Monies set aside for the unexpected.
          </p>
        </section>
    </PageShell>
  );
}
