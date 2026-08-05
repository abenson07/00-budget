"use client";

import { useMemo, useState } from "react";
import { Button, Card } from "@/components/ui";
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
    <Card tone="alert" padded={false} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <span>
        {atRisk.length} bucket{atRisk.length > 1 ? "s" : ""} near their limit
      </span>
      <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
        Dismiss
      </Button>
    </Card>
  );
}
