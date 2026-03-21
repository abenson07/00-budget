export type PaycheckMode = "paycheck_1" | "paycheck_2" | "both";

/**
 * Maps paycheck UI to `Bucket.percentage` for bill buckets: fraction of the bill
 * amount attributed to "paycheck 1" (paycheck 2 gets the remainder).
 */
export function paycheckModeToBucketPercentage(
  mode: PaycheckMode,
  splitPaycheck1Share: number,
): number {
  const s = Math.min(1, Math.max(0, splitPaycheck1Share));
  if (mode === "paycheck_1") return 1;
  if (mode === "paycheck_2") return 0;
  return s;
}
