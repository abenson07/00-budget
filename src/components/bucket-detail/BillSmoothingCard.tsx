"use client";

import { useState } from "react";
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
    <section className="rounded-lg border border-[#bbb] bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[#1e1e1e]">Bill smoothing</h2>
      <p className="mt-1 text-xs text-[#1e0403]/65">
        Split this bill&apos;s {formatUsd(fullAmount)} across your two paychecks.
      </p>
      <div className="mt-3 flex gap-2">
        {(["paycheck_1", "paycheck_2", "both"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              mode === m ? "border-[#1c3812] bg-[#1c3812] text-white" : "border-[#bbb] text-[#222]"
            }`}
            onClick={() => onSelect(m)}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-[#1e0403]/55">Paycheck 1</dt>
          <dd className="font-medium tabular-nums text-[#222]">{formatUsd(paycheck1Amount)}</dd>
        </div>
        <div>
          <dt className="text-[#1e0403]/55">Paycheck 2</dt>
          <dd className="font-medium tabular-nums text-[#222]">{formatUsd(paycheck2Amount)}</dd>
        </div>
      </dl>
      {saved ? <p className="mt-2 text-sm text-emerald-800">Saved.</p> : null}
    </section>
  );
}
