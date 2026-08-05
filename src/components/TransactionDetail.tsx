"use client";

import Link from "next/link";
import {
  BucketTransaction,
  BucketTransactionSplit,
  TransactionHeader as FigmaTransactionHeader,
  TRANSACTION_HEADER_REFERENCE,
} from "@/components/figma-buckets";
import { PageHeader, PageShell, SectionHeading } from "@/components/ui";
import {
  bucketRoutesApp,
  transactionRoutesApp,
  type BucketViewRoutes,
  type TransactionViewRoutes,
} from "@/lib/routes";
import { getEffectiveSplits } from "@/lib/allocation";
import { useBudgetStore } from "@/state/budget-store";

type Props = {
  transactionId: string;
  routes?: TransactionViewRoutes;
  bucketRoutes?: BucketViewRoutes;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 text-budget-ink">
      <p className="text-label text-budget-ink-soft">{label}</p>
      <p className="text-body font-medium">{value}</p>
    </div>
  );
}

export function ScanReceiptStub() {
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
      <PageShell>
        <p className="text-budget-ink-soft">Transaction not found.</p>
        <Link
          href={routes.transactionsList}
          className="inline-block text-xs font-medium text-budget-forest underline underline-offset-2"
        >
          Back to list
        </Link>
      </PageShell>
    );
  }

  const liveSplits = getEffectiveSplits(tx);
  const isSplit = liveSplits.length > 1;
  const splitHref = routes.transactionSplit(tx.id);
  const pending = tx.status === "pending";
  const amountLabel = `$${tx.amount.toFixed(2)}`;

  return (
    <PageShell>
      <PageHeader backHref={routes.transactionsList} size="compact" />

      <FigmaTransactionHeader
          {...TRANSACTION_HEADER_REFERENCE.default}
          merchantLabel={tx.merchant || "Target"}
          amountLabel={amountLabel}
          pending={pending}
          dateLabel={tx.date}
          timeLabel=""
        />

        <section className="flex flex-col gap-3">
          <SectionHeading>Bucket</SectionHeading>

          {liveSplits.length === 0 ? (
            <p className="text-sm text-budget-ink-soft">No bucket assigned yet.</p>
          ) : isSplit ? (
            <ul className="flex flex-col gap-2">
              {liveSplits.map((row, index) => {
                const bucket = getBucketById(row.bucketId);
                const title = bucket?.name ?? row.bucketId;
                const pct =
                  tx.amount > 0
                    ? Math.round((row.amount / tx.amount) * 100)
                    : 0;
                return (
                  <li key={`${row.bucketId}-${index}`}>
                    <Link href={bucketRoutes.bucket(row.bucketId)}>
                      <BucketTransactionSplit
                        title={title}
                        amountLabel={`$${row.amount.toFixed(2)}`}
                        splitLabel={`${pct}% of transaction`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            (() => {
              const row = liveSplits[0]!;
              const bucket = getBucketById(row.bucketId);
              const title = bucket?.name ?? row.bucketId;
              return (
                <Link href={bucketRoutes.bucket(row.bucketId)}>
                  <BucketTransaction
                    title={title}
                    amountLabel={`$${row.amount.toFixed(2)}`}
                  />
                </Link>
              );
            })()
          )}

          <div className="flex flex-wrap items-center justify-center gap-8 pt-2">
            <Link
              href={splitHref}
              className="text-sm font-semibold text-budget-forest underline-offset-2 hover:underline"
            >
              {isSplit ? "Manage split" : "Add split"}
            </Link>
            <ScanReceiptStub />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeading>Extra details</SectionHeading>
          <DetailRow label="Merchant name" value={tx.merchant?.trim() ? tx.merchant : "—"} />
          <DetailRow label="Description / memo" value="Fake data here" />
          <DetailRow label="Transaction ID" value={tx.id} />
          <DetailRow
            label="Status"
            value={pending ? "Pending" : "Cleared"}
          />
          <DetailRow label="Date" value={tx.date} />
          <DetailRow label="Account" value={account.name} />
        </section>
    </PageShell>
  );
}
