"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BucketBill,
  BucketMonthlySpending,
  TOP_CARD_ESSENTIALS_REFERENCE,
  TopCardEssentials,
} from "@/components/figma-buckets";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export function MobileEssentialsBuckets() {
  const buckets = useBudgetStore((s) => s.buckets);

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
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
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

        <TopCardEssentials {...TOP_CARD_ESSENTIALS_REFERENCE.default} />

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
                  <Link href={appRoutes.bucket(b.id)}>
                    <BucketBill
                      title={b.name}
                      cadenceLabel={`$${Math.max(b.top_off ?? 0, 0).toFixed(0)} per paycheck`}
                      balanceLabel={`$${Math.max(b.amount, 0).toFixed(0)}`}
                      percentLabel="100% "
                    />
                  </Link>
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
                  <Link href={appRoutes.bucket(b.id)}>
                    <BucketMonthlySpending
                      title={b.name}
                      cadenceLabel={`Top off to $${Math.max(b.top_off ?? 0, 0).toFixed(0)}`}
                      balanceLabel={`$${Math.max(b.amount, 0).toFixed(0)}`}
                      percentLabel="40% "
                    />
                  </Link>
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
