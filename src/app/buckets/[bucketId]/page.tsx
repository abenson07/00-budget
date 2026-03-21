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
import { txAllocationLabel } from "@/lib/tx-allocation-label";
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
  const getBucketByIdFn = useBudgetStore((s) => s.getBucketById);

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
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-10 pt-8">
        <nav>
          <Link
            href={appRoutes.buckets}
            className="font-mono text-xs font-medium text-[#1e0403]/70 underline decoration-[#1e0403]/25 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← Buckets
          </Link>
        </nav>

        {!bucket ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-amber-950">
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
              <div className="flex gap-2">
                <Link
                  href={appRoutes.bucketTransfer(bucketId)}
                  className="flex flex-1 items-center justify-center rounded-lg bg-[#dbdad6] px-6 py-2 text-xl font-medium text-[#222] transition-opacity active:opacity-90"
                >
                  Transfer
                </Link>
                <Link
                  href={appRoutes.bucketSettings(bucketId)}
                  className="flex flex-1 items-center justify-center rounded-lg bg-[#dbdad6] px-6 py-2 text-xl font-medium text-[#222] transition-opacity active:opacity-90"
                >
                  Settings
                </Link>
              </div>
            </div>

            <section className="flex flex-col gap-3.5">
              <Link
                href={appRoutes.transactions}
                className="flex items-center justify-between px-4"
              >
                <span className="text-xs font-bold tracking-wide text-black">
                  Transactions
                </span>
                <span aria-hidden className="text-lg text-[#222]">
                  →
                </span>
              </Link>

              {sortedAllocations.length === 0 ? (
                <p className="px-4 text-sm text-[#1e0403]/60">
                  No transactions allocate to this bucket yet.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {sortedAllocations.map(({ transaction: tx, amount }) => (
                    <li key={tx.id}>
                      <BucketAllocationTransactionRow
                        transaction={tx}
                        bucketAmount={amount}
                        allocationLabel={txAllocationLabel(
                          tx,
                          getBucketByIdFn,
                        )}
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
