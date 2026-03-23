"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  EssentialBucketCard,
  TopCardEssentialsDue,
  formatShortfallPill,
} from "@/components/home";
import { sumEssentialBucketAmounts } from "@/lib/allocation";
import {
  essentialsFundingShortfall,
  essentialsHaveAtRiskBucket,
  sumEssentialDueWithinDays,
} from "@/lib/essentials-aggregates";
import { formatUsd } from "@/lib/format";
import { useBudgetStore } from "@/state/budget-store";

export function MobileEssentialsBuckets() {
  const buckets = useBudgetStore((s) => s.buckets);
  const now = useMemo(() => new Date(), []);

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

  const total = sumEssentialBucketAmounts(buckets);
  const dueWeek = sumEssentialDueWithinDays(essentialBuckets, now, 6);
  const shortfall = essentialsFundingShortfall(essentialBuckets, now);
  const atRisk =
    essentialsHaveAtRiskBucket(essentialBuckets, now) || shortfall > 0.01;
  const riskCopy =
    shortfall > 0.01 ? formatShortfallPill(shortfall) : "Needs attention";

  const okPill = (
    <span className="inline-flex rounded-[var(--radius-pill)] bg-[var(--budget-tag-safe-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--budget-tag-safe-fg)]">
      Saved and ready
    </span>
  );
  const riskPill = (
    <span className="inline-flex rounded-[var(--radius-pill)] bg-[var(--budget-tag-risk-inverse-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--budget-tag-risk-inverse-fg)]">
      {riskCopy}
    </span>
  );

  return (
    <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <nav>
          <Link
            href="/buckets"
            className="text-xs font-medium text-[var(--budget-ink-soft)] underline decoration-[var(--budget-card-border)] underline-offset-2 transition-colors hover:text-[var(--budget-ink)]"
          >
            ← All buckets
          </Link>
        </nav>

        <h1 className="font-display text-2xl leading-tight text-[var(--budget-forest)]">
          Essential Buckets
        </h1>

        <TopCardEssentialsDue
          dueThisWeekFormatted={formatUsd(dueWeek)}
          totalReservedFormatted={formatUsd(total)}
          tone={atRisk ? "atRisk" : "ok"}
          statusPill={atRisk ? riskPill : okPill}
        />

        <section className="flex flex-col gap-3" aria-label="Bills">
          <div>
            <h2 className="text-base font-bold text-[var(--budget-ink)]">Bills</h2>
            <p className="mt-0.5 text-sm text-[var(--budget-ink-soft)]">
              The stuff that keeps the lights on.
            </p>
          </div>
          {bills.length === 0 ? (
            <p className="rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-[var(--budget-card)] px-4 py-6 text-sm text-[var(--budget-ink-soft)]">
              No bill buckets yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {bills.map((b) => (
                <li key={b.id}>
                  <EssentialBucketCard bucket={b} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3" aria-label="Monthly spending">
          <div>
            <h2 className="text-base font-bold text-[var(--budget-ink)]">
              Monthly spending
            </h2>
            <p className="mt-0.5 text-sm text-[var(--budget-ink-soft)]">
              The stuff you choose to spend for life.
            </p>
          </div>
          {monthly.length === 0 ? (
            <p className="rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-[var(--budget-card)] px-4 py-6 text-sm text-[var(--budget-ink-soft)]">
              No monthly essentials yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {monthly.map((b) => (
                <li key={b.id}>
                  <EssentialBucketCard bucket={b} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2 opacity-80" aria-label="Rainy day">
          <h2 className="text-base font-bold text-[var(--budget-ink)]">
            Rainy day
          </h2>
          <p className="text-sm text-[var(--budget-ink-soft)]">
            Monies set aside for the unexpected.
          </p>
        </section>
      </div>
    </div>
  );
}
