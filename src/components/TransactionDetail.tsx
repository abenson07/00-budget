"use client";

import Link from "next/link";
import {
  discretionaryImageForBucketId,
  imageForBucket,
} from "@/lib/bucket-row-images";
import { formatLongCalendarDay, formatUsd } from "@/lib/format";
import {
  bucketRoutesApp,
  transactionRoutesApp,
  type BucketViewRoutes,
  type TransactionViewRoutes,
} from "@/lib/routes";
import { getEffectiveSplits } from "@/lib/allocation";
import { BucketListCardRow } from "@/components/home/BucketListCardRow";
import { TransactionHeader } from "@/components/transactions/TransactionHeader";
import { useBudgetStore } from "@/state/budget-store";

type Props = {
  transactionId: string;
  routes?: TransactionViewRoutes;
  bucketRoutes?: BucketViewRoutes;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 text-sm text-[var(--budget-ink)]">
      <p className="text-[var(--budget-ink-soft)]">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function ScanReceiptStub() {
  return (
    <span
      className="inline-flex cursor-not-allowed items-center gap-1.5 text-sm font-medium text-[var(--budget-ink-soft)] opacity-60"
      aria-disabled
    >
      <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
        <path
          fill="currentColor"
          d="M6 4h12v16H6V4zm2 2v12h8V6H8zm2 2h4v2h-4V8zm0 4h4v2h-4v-2z"
        />
      </svg>
      Scan receipt
    </span>
  );
}

/** Mobile transaction screen (single-bucket vs split). */
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
      <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
        <div className="mx-auto max-w-md px-4 pb-10 pt-8">
          <p className="text-[var(--budget-ink-soft)]">Transaction not found.</p>
          <Link
            href={routes.transactionsList}
            className="mt-4 inline-block text-xs font-medium text-[var(--budget-forest)] underline underline-offset-2"
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
  const pending = tx.status === "pending";

  return (
    <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-10 px-4 pb-10 pt-8">
        <nav>
          <Link
            href={routes.transactionsList}
            className="text-xs font-medium text-[var(--budget-ink-soft)] underline decoration-[var(--budget-card-border)] underline-offset-2 transition-colors hover:text-[var(--budget-ink)]"
          >
            ← Transactions
          </Link>
        </nav>

        <TransactionHeader
          merchant={tx.merchant || "—"}
          amountFormatted={formatUsd(tx.amount)}
          dateStr={tx.date}
          pending={pending}
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--budget-ink-soft)]">
            Bucket
          </h2>

          {liveSplits.length === 0 ? (
            <p className="text-sm text-[var(--budget-ink-soft)]">
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
                      subtitleLeft={`${pct}% of transaction`}
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

          <div className="flex flex-wrap items-center justify-center gap-8 pt-2">
            <Link
              href={splitHref}
              className="text-sm font-semibold text-[var(--budget-forest)] underline-offset-2 hover:underline"
            >
              {isSplit ? "Manage split" : "Add split"}
            </Link>
            <ScanReceiptStub />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-lg text-[var(--budget-ink)]">
            Extra details
          </h2>
          <DetailRow label="Merchant name" value={tx.merchant?.trim() ? tx.merchant : "—"} />
          <DetailRow label="Description / memo" value="—" />
          <DetailRow label="Transaction ID" value={tx.id} />
          <DetailRow
            label="Status"
            value={pending ? "Pending" : "Cleared"}
          />
          <DetailRow label="Date" value={formatLongCalendarDay(tx.date)} />
          <DetailRow label="Account" value={account.name} />
        </section>
      </div>
    </div>
  );
}
