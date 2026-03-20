import { getEffectiveSplits } from "./allocation";
import { MONEY_EPSILON } from "./constants";
import type { Bucket, Transaction, TransactionSplit } from "./types";

/** @deprecated Use MONEY_EPSILON */
export const SPLIT_TOTAL_EPSILON = MONEY_EPSILON;

/**
 * Validates that split rows are non-empty, amounts are sane, and the sum
 * matches `txAmount` within {@link MONEY_EPSILON}.
 */
export function validateSplits(
  txAmount: number,
  splits: TransactionSplit[],
): string[] {
  const errors: string[] = [];
  if (splits.length === 0) {
    errors.push("Allocation must include at least one split.");
    return errors;
  }
  for (const row of splits) {
    if (!Number.isFinite(row.amount) || row.amount < 0) {
      errors.push(
        "Each split amount must be a non-negative finite number.",
      );
      return errors;
    }
  }
  const sum = splits.reduce((s, row) => s + row.amount, 0);
  if (Math.abs(sum - txAmount) > MONEY_EPSILON) {
    errors.push(
      `Allocation amounts sum to ${sum.toFixed(2)}, transaction amount is ${txAmount.toFixed(2)}`,
    );
  }
  return errors;
}

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

  errors.push(...validateSplits(tx.amount, effective));

  const bucketIds = new Set(buckets.map((b) => b.id));
  const seen = new Set<string>();
  for (const row of effective) {
    if (seen.has(row.bucketId)) {
      errors.push("Allocation uses the same bucket more than once.");
      break;
    }
    seen.add(row.bucketId);
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
