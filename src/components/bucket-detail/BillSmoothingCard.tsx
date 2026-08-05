"use client";

import { useState } from "react";
import { Card, Chip, SectionHeading } from "@/components/ui";
import { percentageForMode, smoothingAmounts } from "@/lib/bill-smoothing";
import type { BucketMetadataInput } from "@/lib/bucket-metadata";
import { formatUsd } from "@/lib/format";
import type { PaycheckMode } from "@/lib/paycheck-allocation";
import type { EssentialBillBucket } from "@/lib/types";
import { useBudgetStore } from "@/state/budget-store";

const MODE_LABEL: Record<PaycheckMode, string> = {
  paycheck_1: "Paycheck 1",
  paycheck_2: "Paycheck 2",
  both: "Split evenly",
};

export function BillSmoothingCard({ bucket }: { bucket: EssentialBillBucket }) {
  const updateMetadata = useBudgetStore((s) => s.updateBucketMetadata);
  const [saved, setSaved] = useState(false);
  const { fullAmount, paycheck1Amount, paycheck2Amount, mode } = smoothingAmounts(bucket);

  const onSelect = (next: PaycheckMode) => {
    setSaved(false);
    const input: BucketMetadataInput = {
      name: bucket.name,
      order: bucket.order,
      type: "essential",
      essential_subtype: "bill",
      due_date: bucket.due_date,
      alert_date: bucket.alert_date,
      top_off: bucket.top_off,
      percentage: percentageForMode(next),
      goal_target_date: "",
    };
    updateMetadata(bucket.id, input);
    setSaved(true);
  };

  return (
    <Card>
      <SectionHeading>Bill smoothing</SectionHeading>
      <p className="mt-1 text-xs text-budget-ink-soft">
        Split this bill&apos;s {formatUsd(fullAmount)} across your two paychecks.
      </p>
      <div className="mt-3 flex gap-2">
        {(["paycheck_1", "paycheck_2", "both"] as const).map((m) => (
          <Chip key={m} selected={mode === m} onClick={() => onSelect(m)}>
            {MODE_LABEL[m]}
          </Chip>
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-budget-ink-soft">Paycheck 1</dt>
          <dd className="font-medium tabular-nums text-budget-ink">{formatUsd(paycheck1Amount)}</dd>
        </div>
        <div>
          <dt className="text-budget-ink-soft">Paycheck 2</dt>
          <dd className="font-medium tabular-nums text-budget-ink">{formatUsd(paycheck2Amount)}</dd>
        </div>
      </dl>
      {saved ? <p className="mt-2 text-sm text-emerald-800">Saved.</p> : null}
    </Card>
  );
}
