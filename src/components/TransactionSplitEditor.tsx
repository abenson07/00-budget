"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  TransactionHeader as FigmaTransactionHeader,
  TRANSACTION_HEADER_REFERENCE,
} from "@/components/figma-buckets";
import { ScanReceiptStub } from "@/components/TransactionDetail";
import { getEffectiveSplits } from "@/lib/allocation";
import { formatUsd } from "@/lib/format";
import {
  transactionRoutesApp,
  type TransactionViewRoutes,
} from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";
import { useMerchantRulesStore } from "@/state/merchant-rules-store";

type Props = {
  transactionId: string;
  routes?: TransactionViewRoutes;
};

/** Real single-bucket recategorization screen (mirrors Figma "transaction detail - split" layout). */
export function TransactionSplitEditor({
  transactionId,
  routes = transactionRoutesApp,
}: Props) {
  const router = useRouter();
  const tx = useBudgetStore((s) =>
    s.transactions.find((t) => t.id === transactionId),
  );
  const buckets = useBudgetStore((s) => s.buckets);
  const updateTransaction = useBudgetStore((s) => s.updateTransaction);
  const recordMerchantRule = useMerchantRulesStore((s) => s.recordMerchantRule);

  const [pickedBucketId, setPickedBucketId] = useState(
    tx ? (getEffectiveSplits(tx)[0]?.bucketId ?? "") : "",
  );
  const [remember, setRemember] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  const onSave = () => {
    setSaveError(null);
    try {
      updateTransaction(tx.id, { primary_bucket_id: pickedBucketId, splits: undefined });
      if (remember) recordMerchantRule(tx.merchant, pickedBucketId);
      router.push(routes.transaction(tx.id));
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e));
    }
  };

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
          dateLabel={tx.date}
          timeLabel=""
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-[12px] font-semibold text-[#222]">Choose a bucket</h2>
          <ul className="flex flex-col gap-2">
            {buckets.map((b) => {
              const active = b.id === pickedBucketId;
              return (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => setPickedBucketId(b.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left ${
                      active ? "border-[#1c3812] bg-[#1c3812]/10" : "border-[#222]/10 bg-white"
                    }`}
                  >
                    <span className="text-sm font-medium text-[#1b1b1b]">{b.name}</span>
                    <span className="text-xs tabular-nums text-[#1e0403]/55">
                      {formatUsd(b.amount)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <label className="flex items-center gap-2 text-sm text-[#222]">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember this merchant
          </label>

          {saveError ? <p className="text-sm text-red-700">{saveError}</p> : null}

          <div className="flex items-center justify-center gap-8 pt-2">
            <button
              type="button"
              disabled={pickedBucketId === ""}
              onClick={onSave}
              className="rounded-lg bg-[#1c3812] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save
            </button>
            <ScanReceiptStub />
          </div>
        </section>
      </div>
    </div>
  );
}
