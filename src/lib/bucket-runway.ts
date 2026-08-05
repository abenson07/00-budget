import { getEffectiveSplits } from "./allocation";
import type { Bucket, Transaction } from "./types";

export function bankedAheadAmount(bucket: Bucket): number {
  if (bucket.type !== "discretionary") return 0;
  return Math.max(0, bucket.amount - (bucket.top_off ?? 0));
}

export function runwayDays(bucket: Bucket, transactions: Transaction[], now: Date): number | null {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);
  let spent = 0;
  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    if (txDate < cutoff || txDate > now) continue;
    for (const split of getEffectiveSplits(tx)) {
      if (split.bucketId === bucket.id) spent += split.amount;
    }
  }
  const avgDailySpend = spent / 30;
  if (avgDailySpend <= 0) return null;
  return Math.floor(bucket.amount / avgDailySpend);
}
