"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BucketHome, TopCardHome } from "@/components/figma-buckets";
import { NearLimitBanner } from "@/components/NearLimitBanner";
import { Button, Card, Field, Input, ListRow, PageShell, SectionHeading } from "@/components/ui";
import { getEffectiveSplits } from "@/lib/allocation";
import { percentageTagForBucket } from "@/lib/bucket-percentage-tag";
import { buildEssentialsSummary } from "@/lib/essentials-summary";
import { ESSENTIAL_VARIANCE_THRESHOLD } from "@/lib/overspend-recovery";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import { paycheckLineFor, safeToSpendHeadline } from "@/lib/safe-to-spend-summary";
import { isUnassignedBucket } from "@/lib/unassigned-bucket";
import { useBudgetStore } from "@/state/budget-store";

export function MobileHome() {
  const buckets = useBudgetStore((s) => s.buckets);
  const transferBetweenBuckets = useBudgetStore((s) => s.transferBetweenBuckets);
  const [coverError, setCoverError] = useState<string | null>(null);
  const transactionsAll = useBudgetStore((s) => s.transactions);
  const transactions = useMemo(() => transactionsAll.slice(0, 6), [transactionsAll]);
  const [essentialsOpen, setEssentialsOpen] = useState(false);
  const now = useMemo(() => new Date(), []);
  const essentialsSummary = useMemo(() => buildEssentialsSummary(buckets, now), [buckets, now]);
  const nextPaycheckDate = useBudgetStore((s) => s.nextPaycheckDate);
  const setNextPaycheckDate = useBudgetStore((s) => s.setNextPaycheckDate);
  const [editingPaycheck, setEditingPaycheck] = useState(false);
  const [paycheckInput, setPaycheckInput] = useState("");
  const { headline, amount } = useMemo(() => safeToSpendHeadline(buckets), [buckets]);
  const paycheckLine = useMemo(
    () => paycheckLineFor(nextPaycheckDate, now),
    [nextPaycheckDate, now],
  );
  const browseBuckets = useMemo(
    () =>
      [...buckets]
        .filter((bucket) => !isUnassignedBucket(bucket))
        .sort((a, b) => a.order - b.order),
    [buckets],
  );
  const unassignedBucket = useMemo(() => buckets.find(isUnassignedBucket), [buckets]);
  const overThresholdEssentials = useMemo(
    () =>
      buckets.filter(
        (b) => b.type === "essential" && b.amount < -ESSENTIAL_VARIANCE_THRESHOLD,
      ),
    [buckets],
  );
  const coverFromUnassigned = (bucketId: string, amount: number) => {
    if (!unassignedBucket) return;
    setCoverError(null);
    try {
      transferBetweenBuckets(unassignedBucket.id, bucketId, amount);
    } catch (e) {
      setCoverError(e instanceof Error ? e.message : String(e));
    }
  };
  const homeBuckets = useMemo(
    () =>
      browseBuckets.slice(0, 2).map((bucket) => {
        const tag = percentageTagForBucket(bucket, now);
        return {
          id: bucket.id,
          title: bucket.name,
          amountLabel: `$${Math.round(bucket.amount)}`,
          percentLabel: tag ? tag.label : "—",
          atRisk: tag?.variant === "atRisk",
        };
      }),
    [browseBuckets, now],
  );

  return (
    <PageShell>
      <NearLimitBanner />

      {overThresholdEssentials.length > 0 ? (
        <Card tone="alert" padded={false} className="flex flex-col gap-2 px-4 py-3 text-sm">
          {coverError ? <p className="text-xs">{coverError}</p> : null}
          {overThresholdEssentials.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3">
              <span>
                {b.name} is {formatUsd(-b.amount)} over
              </span>
              {unassignedBucket ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => coverFromUnassigned(b.id, -b.amount)}
                >
                  Cover from Unassigned
                </Button>
              ) : null}
            </div>
          ))}
        </Card>
      ) : null}

        <TopCardHome
          headline={headline}
          amount={amount}
          paycheckLine={paycheckLine}
          essentialsLabel="Essentials"
          dueThisWeekShort={essentialsSummary.dueThisWeekShort}
          monthlyStatusLine={essentialsSummary.monthlyStatusLine}
          essentials={essentialsSummary.essentialLines}
          expandedFooterLine={essentialsSummary.expandedFooterLine}
          expanded={essentialsOpen}
          onExpandedChange={setEssentialsOpen}
        />
      {!nextPaycheckDate ? (
        editingPaycheck ? (
          <Field className="flex-row items-end gap-2">
            <Input
              type="date"
              value={paycheckInput}
              onChange={(e) => setPaycheckInput(e.target.value)}
              className="mt-0 flex-1"
            />
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                if (!paycheckInput) return;
                setNextPaycheckDate(paycheckInput);
                setEditingPaycheck(false);
              }}
            >
              Save
            </Button>
          </Field>
        ) : (
          <button
            type="button"
            onClick={() => setEditingPaycheck(true)}
            className="text-xs text-budget-forest underline"
          >
            Set your next paycheck date
          </button>
        )
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          {homeBuckets.map((bucket) => (
            <Link key={bucket.id} href={appRoutes.bucket(bucket.id)}>
              <BucketHome {...bucket} />
            </Link>
          ))}
          <Link
            href={appRoutes.buckets}
            className="flex min-h-[8.5rem] w-full items-end justify-start rounded-tile bg-budget-sage-panel p-4 text-left text-label font-semibold text-budget-forest"
          >
            See all buckets
          </Link>
        </div>
      </section>

      <section
        className={`flex flex-col gap-3 transition-opacity ${
          essentialsOpen ? "opacity-40" : "opacity-100"
        }`}
      >
        <SectionHeading>Transactions</SectionHeading>
        {transactions.length === 0 ? (
          <p className="text-sm text-budget-ink-soft">No transactions yet.</p>
        ) : (
          <div>
            {transactions.map((tx, index) => {
              const firstSplit = getEffectiveSplits(tx)[0];
              const bucket = firstSplit
                ? buckets.find((item) => item.id === firstSplit.bucketId)
                : undefined;
              const bucketName = bucket?.name ?? "Unassigned";
              return (
                <ListRow
                  key={tx.id}
                  href={appRoutes.transaction(tx.id)}
                  title={tx.merchant || "Target"}
                  subtitle={bucketName}
                  amount={`$${Math.round(tx.amount)}`}
                  divider={index < transactions.length - 1}
                />
              );
            })}
          </div>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <Link href={appRoutes.allocations} className="text-center text-xs underline">
          View past paycheck allocations
        </Link>
        <Link href={appRoutes.settings} className="text-center text-xs underline">
          Settings
        </Link>
      </div>
    </PageShell>
  );
}
