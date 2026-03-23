"use client";

import Link from "next/link";
import {
  BucketTransactionSplit,
  TransactionHeader as FigmaTransactionHeader,
  TRANSACTION_HEADER_REFERENCE,
} from "@/components/figma-buckets";
import {
  transactionRoutesApp,
  type TransactionViewRoutes,
} from "@/lib/routes";
import { useMemo } from "react";
import { getEffectiveSplits } from "@/lib/allocation";
import { useBudgetStore } from "@/state/budget-store";

type Props = {
  transactionId: string;
  routes?: TransactionViewRoutes;
};

/** Split visual route mirroring Figma "transaction detail - split". */
export function TransactionSplitEditor({
  transactionId,
  routes = transactionRoutesApp,
}: Props) {
  const tx = useBudgetStore((s) =>
    s.transactions.find((t) => t.id === transactionId),
  );
  const getBucketById = useBudgetStore((s) => s.getBucketById);
  const splits = useMemo(() => {
    if (!tx) return [];
    const live = getEffectiveSplits(tx);
    if (live.length > 1) return live;
    if (live.length === 1) {
      const first = live[0]!;
      return [
        first,
        {
          bucketId: "shopping",
          amount: Math.max(tx.amount - first.amount, 0),
        },
      ];
    }
    return [
      { bucketId: "groceries", amount: tx.amount * 0.88 },
      { bucketId: "shopping", amount: tx.amount * 0.12 },
    ];
  }, [tx]);

  if (!tx) {
    return (
      <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
        <div className="mx-auto max-w-md px-4 pb-10 pt-8">
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

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pb-10 pt-8">
        <nav>
          <Link
            href={routes.transaction(tx.id)}
            className="text-xs font-medium text-[#222]/55 underline decoration-[#222]/20 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← Transaction
          </Link>
        </nav>

        <FigmaTransactionHeader
          {...TRANSACTION_HEADER_REFERENCE.pending}
          merchantLabel={tx.merchant || "Target"}
          amountLabel={`$${tx.amount.toFixed(2)}`}
          pending
          dateLabel="March 2nd, 2025"
          timeLabel="3:02pm"
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-[12px] font-semibold text-[#222]">Bucket</h2>
          <ul className="flex flex-col gap-2">
            {splits.map((split, index) => {
              const bucketName =
                getBucketById(split.bucketId)?.name ??
                (index === 0 ? "Groceries" : "Shopping");
              const pct = tx.amount > 0 ? Math.round((split.amount / tx.amount) * 100) : 0;
              return (
                <li key={`${split.bucketId}-${index}`}>
                  <BucketTransactionSplit
                    title={bucketName}
                    amountLabel={`$${split.amount.toFixed(2)}`}
                    splitLabel={`${pct}% of transaction`}
                  />
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-center gap-8 pt-2">
            <span className="text-sm font-semibold text-[#1c3812]">Manage split</span>
            <span className="text-sm text-[#222]/70">Scan receipt</span>
          </div>
        </section>
      </div>
    </div>
  );
}
