"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  TransactionHeader as FigmaTransactionHeader,
  TRANSACTION_HEADER_REFERENCE,
} from "@/components/figma-buckets";
import { ScanReceiptStub } from "@/components/TransactionDetail";
import { Button, PageHeader, PageShell, SectionHeading } from "@/components/ui";
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
      <PageShell>
        <p className="text-budget-ink-soft">Transaction not found.</p>
        <Link
          href={routes.transactionsList}
          className="inline-block text-xs font-medium text-budget-ink-soft underline decoration-budget-card-border underline-offset-2"
        >
          Back to list
        </Link>
      </PageShell>
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
    <PageShell>
      <PageHeader backHref={routes.transaction(tx.id)} size="compact" />

      <FigmaTransactionHeader
        {...TRANSACTION_HEADER_REFERENCE.pending}
        merchantLabel={tx.merchant || "Target"}
        amountLabel={`$${tx.amount.toFixed(2)}`}
        pending
        dateLabel={tx.date}
        timeLabel=""
      />

      <section className="flex flex-col gap-3">
        <SectionHeading>Choose a bucket</SectionHeading>
        <ul className="flex flex-col gap-2">
          {buckets.map((b) => {
            const active = b.id === pickedBucketId;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setPickedBucketId(b.id)}
                  className={`flex min-h-[56px] w-full items-center justify-between rounded-control border px-4 py-3 text-left ${
                    active ? "border-budget-forest bg-budget-forest/10" : "border-budget-card-border bg-white"
                  }`}
                >
                  <span className="text-sm font-medium text-budget-ink">{b.name}</span>
                  <span className="text-xs tabular-nums text-budget-ink-soft">
                    {formatUsd(b.amount)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <label className="flex items-center gap-2 text-sm text-budget-ink">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-5 w-5 rounded accent-[var(--budget-forest)]"
          />
          Remember this merchant
        </label>

        {saveError ? <p className="text-sm text-red-700">{saveError}</p> : null}

        <div className="flex items-center justify-center gap-8 pt-2">
          <Button
            variant="primary"
            size="cta"
            fullWidth
            disabled={pickedBucketId === ""}
            onClick={onSave}
          >
            Save
          </Button>
        </div>
        <div className="flex justify-center">
          <ScanReceiptStub />
        </div>
      </section>
    </PageShell>
  );
}
