"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  BucketBill,
  BucketMonthlySpending,
  BucketSpendingMoney,
  BucketSpendingMoneyLocked,
  BucketTransaction,
} from "@/components/figma-buckets";
import { selectTransactionsByBucket } from "@/lib/allocation";
import { percentageTagForBucket } from "@/lib/bucket-percentage-tag";
import { runwayDays } from "@/lib/bucket-runway";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export default function BucketDetailPage() {
  const params = useParams();
  const bucketId =
    typeof params.bucketId === "string"
      ? params.bucketId
      : Array.isArray(params.bucketId)
        ? params.bucketId[0]
        : "";

  const buckets = useBudgetStore((s) => s.buckets);
  const allTransactions = useBudgetStore((s) => s.transactions);
  const transactionsForBucket = useMemo(
    () => selectTransactionsByBucket(allTransactions, bucketId),
    [allTransactions, bucketId],
  );
  const transactions = useMemo(() => transactionsForBucket.slice(0, 6), [transactionsForBucket]);
  const bucket = useMemo(() => buckets.find((b) => b.id === bucketId), [buckets, bucketId]);
  const now = useMemo(() => new Date(), []);
  const tag = bucket ? percentageTagForBucket(bucket, now) : null;
  const atRisk = tag?.variant === "atRisk";
  const percentLabel = tag ? tag.label : "—";
  const runway =
    bucket && bucket.type === "discretionary" ? runwayDays(bucket, transactionsForBucket, now) : null;

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <nav>
          <Link
            href={appRoutes.buckets}
            className="text-xs font-medium text-[#222]/55 underline decoration-[#222]/20 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← Buckets
          </Link>
        </nav>

        {!bucket ? (
          <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50/90 p-4 text-amber-950">
            <h1 className="text-lg font-semibold">Bucket not found</h1>
            <p className="mt-1 text-sm text-amber-900/90">
              No bucket matches this link. Return to buckets and pick one from
              the list.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-[44px] leading-none">
              Bucket -{" "}
              {bucket.type === "discretionary"
                ? "Spending money"
                : bucket.essential_subtype === "bill"
                  ? "Bill"
                  : "Monthly spending"}
            </h1>

            {bucket.type === "essential" && bucket.essential_subtype === "bill" ? (
              <BucketBill
                title={bucket.name}
                balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                cadenceLabel={`$${Math.max(bucket.top_off ?? 0, 0).toFixed(0)} per paycheck`}
                atRisk={atRisk}
                percentLabel={percentLabel}
              />
            ) : bucket.type === "discretionary" && bucket.locked ? (
              <BucketSpendingMoneyLocked
                title={bucket.name}
                balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                cadenceLabel={`$${Math.max(bucket.top_off ?? 0, 0).toFixed(0)} per paycheck`}
                atRisk={atRisk}
                percentLabel={percentLabel}
              />
            ) : bucket.type === "discretionary" ? (
              <BucketSpendingMoney
                title={bucket.name}
                balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                cadenceLabel={`$${Math.max(bucket.top_off ?? 0, 0).toFixed(0)} per paycheck`}
                atRisk={atRisk}
                percentLabel={percentLabel}
              />
            ) : (
              <BucketMonthlySpending
                title={bucket.name}
                balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                cadenceLabel={`Top off to $${Math.max(bucket.top_off ?? 0, 0).toFixed(0)}`}
                atRisk={atRisk}
                percentLabel={percentLabel}
              />
            )}

            {bucket.type === "discretionary" ? (
              <p className="text-xs text-[#222]/55">
                {runway != null
                  ? `${runway} days left at your current pace`
                  : "Not enough spending history yet"}
              </p>
            ) : null}

            <section className="flex flex-col gap-3.5">
              <h2 className="font-display px-1 text-lg text-[var(--budget-ink)]">
                Recent spending
              </h2>
              <Link
                href={appRoutes.transactions}
                className="flex items-center justify-between px-1"
              >
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--budget-ink)]">
                  All transactions
                </span>
                <span aria-hidden className="text-[var(--budget-ink-soft)]">
                  →
                </span>
              </Link>

              <ul className="flex flex-col divide-y divide-[#222]/10 border-y border-[#222]/10">
                {transactions.map((tx) => (
                  <li key={tx.id}>
                    <Link href={appRoutes.transaction(tx.id)}>
                      <BucketTransaction
                        title={tx.merchant || "Target"}
                        amountLabel={`$${tx.amount.toFixed(0)}`}
                        className="rounded-none bg-transparent px-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <Link
              href={appRoutes.bucketSettings(bucketId)}
              className="mx-auto rounded-lg bg-[#e6e8dd] px-4 py-2 text-sm font-semibold text-[#1c3812]"
            >
              Change bucket settings
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
