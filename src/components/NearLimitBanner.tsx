"use client";

import { useMemo, useState } from "react";
import { remainingPercentFromBucket } from "@/lib/bucket-percentage-tag";
import { useBudgetStore } from "@/state/budget-store";
import { useSettingsStore } from "@/state/settings-store";

/** Only proactive alert in the app: session-dismissible, resets on reload. */
export function NearLimitBanner() {
  const buckets = useBudgetStore((s) => s.buckets);
  const threshold = useSettingsStore((s) => s.nearLimitThresholdPct);
  const [dismissed, setDismissed] = useState(false);
  const atRisk = useMemo(
    () =>
      buckets.filter((b) => {
        if (b.type !== "discretionary") return false;
        const pct = remainingPercentFromBucket(b);
        return pct != null && pct < threshold;
      }),
    [buckets, threshold],
  );

  if (dismissed || atRisk.length === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-[#fdecea] px-4 py-2 text-sm text-[#7a1f13]">
      <span>
        {atRisk.length} bucket{atRisk.length > 1 ? "s" : ""} near their limit
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-xs font-semibold underline"
      >
        Dismiss
      </button>
    </div>
  );
}
