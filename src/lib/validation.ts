import { getEffectiveSplits } from "./allocation";
import { MONEY_EPSILON } from "./constants";
import type { Bucket, Transaction } from "./types";

/** @deprecated Use MONEY_EPSILON */
export const SPLIT_TOTAL_EPSILON = MONEY_EPSILON;

/** Returns validation error messages; empty if valid. */
export function validateTransactionSplits(
  tx: Transaction,
  buckets: Bucket[],
): string[] {
  return validateTransactionAllocation(tx, buckets);
}

/** Validates effective allocation (splits or primary bucket). */
export function validateTransactionAllocation(
  tx: Transaction,
  buckets: Bucket[],
): string[] {
  const errors: string[] = [];
  const effective = getEffectiveSplits(tx);
  if (effective.length === 0) {
    errors.push(
      "Transaction needs non-empty splits or primary_bucket_id for allocation",
    );
    return errors;
  }

  const bucketIds = new Set(buckets.map((b) => b.id));
  const sum = effective.reduce((s, row) => s + row.amount, 0);
  if (Math.abs(sum - tx.amount) > MONEY_EPSILON) {
    errors.push(
      `Allocation amounts sum to ${sum.toFixed(2)}, transaction amount is ${tx.amount.toFixed(2)}`,
    );
  }
  for (const row of effective) {
    if (!bucketIds.has(row.bucketId)) {
      errors.push(`Allocation references unknown bucket id: ${row.bucketId}`);
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
