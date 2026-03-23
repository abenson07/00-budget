"use client";

import Link from "next/link";
import {
  BucketTransaction,
  BucketTransactionSplit,
  TransactionHeader as FigmaTransactionHeader,
  TRANSACTION_HEADER_REFERENCE,
} from "@/components/figma-buckets";
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
    <div className="flex flex-col gap-0.5 text-sm text-[#1b1b1b]">
      <p className="text-[#222]/55">{label}</p>
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
          <p className="text-[#222]/55">Transaction not found.</p>
          <Link
            href={routes.transactionsList}
            className="mt-4 inline-block text-xs font-medium text-[#1c3812] underline underline-offset-2"
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
  const amountLabel = `$${tx.amount.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-10 pt-8">
        <nav>
          <Link
            href={routes.transactionsList}
            className="text-xs font-medium text-[#222]/55 underline decoration-[#222]/20 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← Transactions
          </Link>
        </nav>

        <FigmaTransactionHeader
          {...TRANSACTION_HEADER_REFERENCE.default}
          merchantLabel={tx.merchant || "Target"}
          amountLabel={amountLabel}
          pending={pending}
          dateLabel="March 2nd, 2025"
          timeLabel="3:02pm"
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-[12px] font-semibold text-[#222]">Bucket</h2>

          {liveSplits.length === 0 ? (
            <p className="text-sm text-[#222]/55">No bucket assigned yet.</p>
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
              className="text-sm font-semibold text-[#1c3812] underline-offset-2 hover:underline"
            >
              {isSplit ? "Manage split" : "Add split"}
            </Link>
            <ScanReceiptStub />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-display text-[36px] leading-none">Extra details</h2>
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
      </div>
    </div>
  );
}
