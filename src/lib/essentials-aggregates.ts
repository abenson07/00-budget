import { daysUntilLocalDate } from "./essentials-dates";
import type { Bucket } from "./types";
import { percentageTagForBucket } from "./bucket-percentage-tag";

/** Bills with due date in the next `withinDays` calendar days (0 = today). */
export function essentialBillsDueWithinDays(
  buckets: Bucket[],
  now: Date,
  withinDays: number,
): Bucket[] {
  return buckets.filter((b) => {
    if (b.type !== "essential" || b.essential_subtype !== "bill") return false;
    const d = daysUntilLocalDate(b.due_date, now);
    return d >= 0 && d <= withinDays;
  });
}

/** Sum of `top_off` (or `amount` if no top_off) for bills due within window. */
export function sumEssentialDueWithinDays(
  buckets: Bucket[],
  now: Date,
  withinDays: number,
): number {
  return essentialBillsDueWithinDays(buckets, now, withinDays).reduce((s, b) => {
    const line = b.top_off ?? b.amount;
    return s + line;
  }, 0);
}

/** True if any essential bucket is “at risk” (percentage tag atRisk). */
export function essentialsHaveAtRiskBucket(buckets: Bucket[], now: Date): boolean {
  const essentials = buckets.filter((b) => b.type === "essential");
  for (const b of essentials) {
    const tag = percentageTagForBucket(b, now);
    if (tag?.variant === "atRisk") return true;
  }
  return false;
}

/** Sum of (goal − amount) for essentials currently tagged at-risk. */
export function essentialsFundingShortfall(buckets: Bucket[], now: Date): number {
  let s = 0;
  for (const b of buckets) {
    if (b.type !== "essential") continue;
    const tag = percentageTagForBucket(b, now);
    if (tag?.variant !== "atRisk") continue;
    if (b.top_off != null) s += Math.max(0, b.top_off - b.amount);
    else s += Math.max(0, -b.amount);
  }
  return s;
}
