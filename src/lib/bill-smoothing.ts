import { paycheckModeToBucketPercentage, type PaycheckMode } from "./paycheck-allocation";
import type { EssentialBillBucket } from "./types";

export function paycheckModeFromPercentage(percentage: number | null): PaycheckMode {
  if (percentage === 1) return "paycheck_1";
  if (percentage === 0) return "paycheck_2";
  return "both";
}

export function smoothingAmounts(bucket: EssentialBillBucket): {
  fullAmount: number;
  paycheck1Amount: number;
  paycheck2Amount: number;
  mode: PaycheckMode;
} {
  const fullAmount = bucket.top_off ?? bucket.amount;
  const pct = bucket.percentage ?? 0.5;
  return {
    fullAmount,
    paycheck1Amount: fullAmount * pct,
    paycheck2Amount: fullAmount * (1 - pct),
    mode: paycheckModeFromPercentage(bucket.percentage),
  };
}

export function percentageForMode(mode: PaycheckMode): number {
  return paycheckModeToBucketPercentage(mode, 0.5);
}
