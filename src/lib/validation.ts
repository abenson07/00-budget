import type { Bucket, Transaction } from "./types";

export const SPLIT_TOTAL_EPSILON = 0.005;

/** Returns validation error messages; empty if valid. */
export function validateTransactionSplits(
  tx: Transaction,
  buckets: Bucket[],
): string[] {
  const errors: string[] = [];
  const splits = tx.splits;
  if (!splits?.length) return errors;

  const bucketIds = new Set(buckets.map((b) => b.id));
  const sum = splits.reduce((s, row) => s + row.amount, 0);
  if (Math.abs(sum - tx.amount) > SPLIT_TOTAL_EPSILON) {
    errors.push(
      `Split amounts sum to ${sum.toFixed(2)}, transaction amount is ${tx.amount.toFixed(2)}`,
    );
  }
  for (const row of splits) {
    if (!bucketIds.has(row.bucketId)) {
      errors.push(`Split references unknown bucket id: ${row.bucketId}`);
    }
  }
  return errors;
}

export function assertDatasetSplitIntegrity(
  transactions: Transaction[],
  buckets: Bucket[],
): void {
  for (const tx of transactions) {
    const errs = validateTransactionSplits(tx, buckets);
    if (errs.length > 0) {
      throw new Error(
        `Invalid splits on transaction ${tx.id}: ${errs.join("; ")}`,
      );
    }
  }
}
