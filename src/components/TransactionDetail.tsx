"use client";

import Link from "next/link";
import {
  discretionaryImageForBucketId,
  imageForBucket,
} from "@/lib/bucket-row-images";
import {
  formatLongCalendarDay,
  formatRelativeCalendarDay,
  formatUsd,
} from "@/lib/format";
import {
  bucketRoutesApp,
  transactionRoutesApp,
  type BucketViewRoutes,
  type TransactionViewRoutes,
} from "@/lib/routes";
import { getEffectiveSplits } from "@/lib/allocation";
import { useBudgetStore } from "@/state/budget-store";
import { BucketListCardRow } from "@/components/home/BucketListCardRow";

type Props = {
  transactionId: string;
  /** Defaults to `/transaction/...` tree; pass `transactionRoutesLegacy` on `/test` pages. */
  routes?: TransactionViewRoutes;
  /** Defaults to `/buckets/...`; pass `bucketRoutesLegacy` on `/test` pages. */
  bucketRoutes?: BucketViewRoutes;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 text-base text-[#1e1e1e]">
      <p className="text-[#1e1e1e]/80">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

/** Mobile transaction screen (Figma: single-bucket vs split summary). */
export function TransactionDetail({
  transactionId,
  routes = transactionRoutesApp,
  bucketRoutes = bucketRoutesApp,
}: Props) {
  const tx = useBudgetStore((s) =>
    s.transactions.find((t) => t.id === transactionId),
  );
  const account = useBudgetStore((s) => s.account);
  const getBucketById = useBudgetStore((s) => s.getBucketById);

  if (!tx) {
    return (
      <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
        <div className="mx-auto max-w-md px-4 pb-10 pt-[4.5rem]">
          <p className="text-[#1e0403]/70">Transaction not found.</p>
          <Link
            href={routes.transactionsList}
            className="mt-4 inline-block font-mono text-xs font-medium text-[#1e0403]/70 underline decoration-[#1e0403]/25 underline-offset-2"
          >
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  const liveSplits = getEffectiveSplits(tx);
  const isSplit = liveSplits.length > 1;
  const splitHref = routes.transactionSplit(tx.id);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-12 px-4 pb-10 pt-[4.5rem]">
        <nav>
          <Link
            href={routes.transactionsList}
            className="font-mono text-xs font-medium text-[#1e0403]/70 underline decoration-[#1e0403]/25 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← Transactions
          </Link>
        </nav>

        <header className="flex flex-col gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl leading-tight text-[#1e1e1e]">
              {tx.merchant || "—"}
            </h1>
            <p className="mt-1 text-base text-[#1e1e1e]/80">
              {formatRelativeCalendarDay(tx.date)}
            </p>
          </div>
          <p className="text-[48px] font-bold leading-none tracking-tight text-[#1e1e1e]">
            {formatUsd(tx.amount)}
          </p>
        </header>

        <section className="flex flex-col gap-2">
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-xl text-[#1e1e1e]">
            Bucket
          </h2>

          {liveSplits.length === 0 ? (
            <p className="text-sm font-medium text-[#1e0403]/55">
              No bucket assigned yet.
            </p>
          ) : isSplit ? (
            <ul className="flex flex-col gap-2">
              {liveSplits.map((row, index) => {
                const bucket = getBucketById(row.bucketId);
                const title = bucket?.name ?? row.bucketId;
                const pct =
                  tx.amount > 0
                    ? Math.round((row.amount / tx.amount) * 100)
                    : 0;
                const img = bucket
                  ? imageForBucket(bucket)
                  : discretionaryImageForBucketId(row.bucketId);
                return (
                  <li key={`${row.bucketId}-${index}`}>
                    <BucketListCardRow
                      href={bucketRoutes.bucket(row.bucketId)}
                      imageSrc={img}
                      title={title}
                      primaryRight={formatUsd(row.amount)}
                      secondaryRight={`${pct}%`}
                      showChevron={false}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            (() => {
              const row = liveSplits[0]!;
              const bucket = getBucketById(row.bucketId);
              const title = bucket?.name ?? row.bucketId;
              const img = bucket
                ? imageForBucket(bucket)
                : discretionaryImageForBucketId(row.bucketId);
              const goalLine =
                bucket?.top_off != null
                  ? `Goal: ${formatUsd(bucket.top_off)}`
                  : undefined;
              const balance = bucket?.amount ?? row.amount;
              return (
                <BucketListCardRow
                  href={bucketRoutes.bucket(row.bucketId)}
                  imageSrc={img}
                  title={title}
                  primaryRight={formatUsd(balance)}
                  secondaryRight={goalLine}
                  showChevron={false}
                />
              );
            })()
          )}

          <div className="flex justify-center pt-2">
            <Link
              href={splitHref}
              className="rounded-lg bg-[#dbdad6] px-6 py-2 font-mono text-base font-medium text-[#010101] transition-opacity active:opacity-90"
            >
              {isSplit ? "Manage Split" : "Add a split"}
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-4 text-[#1e1e1e]">
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-xl">
            Details
          </h2>
          <DetailRow label="Amount" value={formatUsd(tx.amount)} />
          <DetailRow label="Date" value={formatLongCalendarDay(tx.date)} />
          <DetailRow
            label="Merchant"
            value={tx.merchant?.trim() ? tx.merchant : "—"}
          />
          <DetailRow label="Account" value={account.name} />
        </section>
      </div>
    </div>
  );
}
