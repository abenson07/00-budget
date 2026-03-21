"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  BucketMetadataForm,
  BucketRulesDatesCard,
  BucketTransferForm,
} from "@/components/bucket-detail";
import { selectAllocationsForBucket } from "@/lib/allocation";
import { formatUsd } from "@/lib/format";
import { legacyRoutes } from "@/lib/legacy-routes";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export default function TestBucketDetailPage() {
  const params = useParams();
  const bucketId =
    typeof params.bucketId === "string"
      ? params.bucketId
      : Array.isArray(params.bucketId)
        ? params.bucketId[0]
        : "";

  const buckets = useBudgetStore((s) => s.buckets);
  const transactions = useBudgetStore((s) => s.transactions);
  const bucket = buckets.find((b) => b.id === bucketId);
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
    <main className="mx-auto min-h-screen max-w-2xl p-4 pb-10 font-sans sm:p-6">
      <nav className="text-sm">
        <Link
          href={legacyRoutes.home}
          className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
        >
          ← Dashboard
        </Link>
      </nav>

      {!bucket ? (
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-amber-950">
          <h1 className="text-lg font-semibold">Bucket not found</h1>
          <p className="mt-1 text-sm text-amber-900/90">
            No bucket matches this link. Return to the dashboard and choose a
            bucket from the list.
          </p>
        </div>
      ) : (
        <>
          <header className="mt-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {bucket.name}
            </h1>
            <p className="mt-2 text-lg font-semibold tabular-nums text-zinc-950">
              {formatUsd(bucket.amount)}{" "}
              <span className="text-sm font-normal text-zinc-600">balance</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              App bucket UI:{" "}
              <Link
                href={appRoutes.bucket(bucketId)}
                className="font-medium text-sky-800 underline decoration-sky-200 underline-offset-2"
              >
                {appRoutes.bucket(bucketId)}
              </Link>
            </p>
          </header>

          <div className="mt-6 space-y-6">
            <BucketRulesDatesCard bucket={bucket} />

            <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">
                Assigned transactions
              </h2>
              {sortedAllocations.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-600">
                  No transactions allocate to this bucket yet.
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-md border border-zinc-200">
                  <table className="w-full min-w-[320px] text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Merchant</th>
                        <th className="px-3 py-2 font-medium text-right">
                          From this bucket
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAllocations.map(
                        ({ transaction: tx, amount: splitAmt }) => (
                          <tr
                            key={tx.id}
                            className="border-b border-zinc-100 last:border-0"
                          >
                            <td className="px-3 py-2 tabular-nums text-zinc-700">
                              {tx.date}
                            </td>
                            <td className="px-3 py-2">
                              <Link
                                href={appRoutes.transaction(tx.id)}
                                className="font-medium text-sky-800 underline decoration-sky-200 underline-offset-2 hover:text-sky-950"
                              >
                                {tx.merchant || "—"}
                              </Link>
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums font-medium text-zinc-900">
                              {formatUsd(splitAmt)}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-zinc-900">
                Transfer to another bucket
              </h2>
              <div className="mt-4">
                <BucketTransferForm bucketId={bucketId} />
              </div>
            </section>

            <BucketMetadataForm bucketId={bucketId} bucket={bucket} />
          </div>
        </>
      )}
    </main>
  );
}
