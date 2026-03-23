"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  BucketAllocationTransactionRow,
  BucketDetailHero,
} from "@/components/bucket-detail";
import { getBucketById, selectAllocationsForBucket } from "@/lib/allocation";
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
  const transactions = useBudgetStore((s) => s.transactions);
  const bucket = getBucketById(buckets, bucketId);
  const allocations = useMemo(
    () => selectAllocationsForBucket(transactions, bucketId),
    [transactions, bucketId],
  );

  const sortedAllocations = useMemo(
    () =>
      [...allocations].sort(
        (a, b) =>
          new Date(b.transaction.date).getTime() -
          new Date(a.transaction.date).getTime(),
      ),
    [allocations],
  );

  return (
    <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-10 pt-8">
        <nav>
          <Link
            href={appRoutes.buckets}
            className="text-xs font-medium text-[var(--budget-ink-soft)] underline decoration-[var(--budget-card-border)] underline-offset-2 transition-colors hover:text-[var(--budget-ink)]"
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
            <div className="flex flex-col gap-4">
              <BucketDetailHero bucket={bucket} />
              <div className="flex justify-center px-2">
                <Link
                  href={appRoutes.bucketSettings(bucketId)}
                  className="rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--budget-forest)] transition-opacity active:opacity-90"
                >
                  Change bucket settings
                </Link>
              </div>
            </div>

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

              {sortedAllocations.length === 0 ? (
                <p className="px-1 text-sm text-[var(--budget-ink-soft)]">
                  No transactions allocate to this bucket yet.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-[var(--budget-card-border)] border-y border-[var(--budget-card-border)] bg-white/40">
                  {sortedAllocations.map(({ transaction: tx, amount }) => (
                    <li key={tx.id}>
                      <BucketAllocationTransactionRow
                        transaction={tx}
                        bucketAmount={amount}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
