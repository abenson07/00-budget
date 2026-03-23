import type { Bucket } from "./types";
import { daysUntilLocalDate } from "./essentials-dates";

export type PercentageTagVariant = "safe" | "atRisk" | "noValue";

export type BucketTagContext = {
  kind: "bill" | "spending";
  /** Required when kind === "bill" for no-value vs at-risk when remaining &lt; 20%. */
  daysUntilDue?: number;
};

/**
 * Remaining % of goal: amount / top_off × 100, clamped 0–100.
 * Returns null when there is no goal line to compare (caller may hide tag).
 */
export function remainingPercentFromBucket(bucket: Bucket): number | null {
  if (bucket.top_off == null || bucket.top_off <= 0) return null;
  const pct = (bucket.amount / bucket.top_off) * 100;
  if (!Number.isFinite(pct)) return null;
  return Math.round(Math.min(100, Math.max(0, pct)));
}

/**
 * Classifies display for PercentageTag.
 * - Safe: remaining ≥ 20%.
 * - At risk: remaining &lt; 20%, or non-bill with remaining &lt; 20%.
 * - No value: bills only, remaining &lt; 20% and due more than 14 days away.
 */
export function classifyPercentageTagDisplay(
  remainingPct: number | null,
  ctx: BucketTagContext,
): { variant: PercentageTagVariant; label: string } | null {
  if (remainingPct === null) return null;

  const label = `${remainingPct}%`;

  if (remainingPct >= 20) {
    return { variant: "safe", label };
  }

  if (ctx.kind === "bill") {
    const days = ctx.daysUntilDue;
    if (days != null && days > 14) {
      return { variant: "noValue", label };
    }
  }

  return { variant: "atRisk", label };
}

/** Convenience: bucket + clock → tag display or null. */
export function percentageTagForBucket(bucket: Bucket, now: Date) {
  const remaining = remainingPercentFromBucket(bucket);
  if (bucket.type === "essential" && bucket.essential_subtype === "bill") {
    const daysUntilDue = daysUntilLocalDate(bucket.due_date, now);
    return classifyPercentageTagDisplay(remaining, {
      kind: "bill",
      daysUntilDue,
    });
  }
  return classifyPercentageTagDisplay(remaining, { kind: "spending" });
}
