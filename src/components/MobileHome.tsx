"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BucketHome, TopCardHome } from "@/components/figma-buckets";
import { getEffectiveSplits } from "@/lib/allocation";
import { percentageTagForBucket } from "@/lib/bucket-percentage-tag";
import { buildEssentialsSummary } from "@/lib/essentials-summary";
import { appRoutes } from "@/lib/routes";
import { paycheckLineFor, safeToSpendHeadline } from "@/lib/safe-to-spend-summary";
import { isUnassignedBucket } from "@/lib/unassigned-bucket";
import { useBudgetStore } from "@/state/budget-store";

export function MobileHome() {
  const buckets = useBudgetStore((s) => s.buckets);
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
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
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
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={paycheckInput}
                onChange={(e) => setPaycheckInput(e.target.value)}
                className="rounded-md border border-[#bbb] bg-white px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (!paycheckInput) return;
                  setNextPaycheckDate(paycheckInput);
                  setEditingPaycheck(false);
                }}
                className="rounded-md bg-[#1c3812] px-3 py-1 text-xs font-semibold text-white"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingPaycheck(true)}
              className="text-xs text-[#1c3812] underline"
            >
              Set your next paycheck date
            </button>
          )
        ) : null}

        <section className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            {homeBuckets.map((bucket) => (
              <Link key={bucket.id} href={appRoutes.bucket(bucket.id)}>
                <BucketHome {...bucket} />
              </Link>
            ))}
            <Link
              href={appRoutes.buckets}
              className="flex min-h-[7.5rem] w-full items-end justify-start rounded-lg bg-[#e6e8dd] p-3 text-left text-[12px] font-bold text-[#1c3812] opacity-80"
            >
              See all buckets
            </Link>
          </div>
          <div className="flex justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1c3812]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#1c3812]/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#1c3812]/40" />
          </div>
        </section>

        <section
          className={`flex flex-col gap-2 transition-opacity ${
            essentialsOpen ? "opacity-40" : "opacity-100"
          }`}
        >
          <h2 className="font-display text-[24px] leading-none">Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-sm text-[#222]/60">No transactions yet.</p>
          ) : (
            <ul>
              {transactions.map((tx, index) => {
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
                    className={index < transactions.length - 1 ? "border-b border-[#d7ddd6]" : ""}
                  >
                    <div className="flex items-center justify-between py-4">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={appRoutes.transaction(tx.id)}
                          className="w-fit text-[18px] font-semibold text-[#222] underline-offset-2 hover:underline"
                        >
                          {tx.merchant || "Target"}
                        </Link>
                        <Link
                          href={bucketHref}
                          className="w-fit text-[12px] font-medium text-[#1e0403]/50 underline-offset-2 hover:underline"
                        >
                          {bucketName}
                        </Link>
                      </div>
                      <Link
                        href={appRoutes.transaction(tx.id)}
                        className="text-[18px] font-semibold text-[#222] underline-offset-2 hover:underline"
                      >
                        ${Math.round(tx.amount)}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <Link href={appRoutes.allocations} className="text-center text-xs underline">
          View past paycheck allocations
        </Link>
      </div>
    </div>
  );
}
