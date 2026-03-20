import { MONEY_EPSILON } from "./constants";
import type { Bucket, Transaction, TransactionSplit } from "./types";

/**
 * Split rows are authoritative when non-empty; otherwise a single-bucket
 * allocation uses `primary_bucket_id` for the full transaction amount.
 */
export function getEffectiveSplits(tx: Transaction): TransactionSplit[] {
  const splits = tx.splits;
  if (splits && splits.length > 0) return splits;
  if (tx.primary_bucket_id) {
    return [{ bucketId: tx.primary_bucket_id, amount: tx.amount }];
  }
  return [];
}

export function getBucketById(
  buckets: Bucket[],
  id: string,
): Bucket | undefined {
  return buckets.find((b) => b.id === id);
}

export function accountBalance(buckets: Bucket[]): number {
  return buckets.reduce((s, b) => s + b.amount, 0);
}

export function sumEssentialBucketAmounts(buckets: Bucket[]): number {
  return buckets
    .filter((b) => b.type === "essential")
    .reduce((s, b) => s + b.amount, 0);
}

/** Sum of discretionary buckets (includes Unassigned when it is discretionary). */
export function safeToSpendPrimary(buckets: Bucket[]): number {
  return buckets
    .filter((b) => b.type === "discretionary")
    .reduce((s, b) => s + b.amount, 0);
}

export type SafeToSpendMetrics = {
  accountBalance: number;
  primary: number;
  /** Should match `primary` when every bucket is essential or discretionary. */
  sanityCheck: number;
};

export function computeSafeToSpendMetrics(
  buckets: Bucket[],
): SafeToSpendMetrics {
  const ab = accountBalance(buckets);
  const essential = sumEssentialBucketAmounts(buckets);
  const primary = safeToSpendPrimary(buckets);
  return { accountBalance: ab, primary, sanityCheck: ab - essential };
}

export type BucketOverspend = {
  bucketId: string;
  deficit: number;
  bucketType: "essential" | "discretionary";
};

/** Buckets that would go negative after applying these debit splits. */
export function detectOverspendAfterDebit(
  buckets: Bucket[],
  splits: TransactionSplit[],
): BucketOverspend[] {
  const next = applyDebitToBuckets(buckets, splits);
  const out: BucketOverspend[] = [];
  for (const b of next) {
    if (b.amount < -MONEY_EPSILON) {
      out.push({
        bucketId: b.id,
        deficit: -b.amount,
        bucketType: b.type,
      });
    }
  }
  return out;
}

/** Subtract split amounts from each bucket (debit). Immutable. */
export function applyDebitToBuckets(
  buckets: Bucket[],
  splits: TransactionSplit[],
): Bucket[] {
  const subByBucket = new Map<string, number>();
  for (const row of splits) {
    subByBucket.set(
      row.bucketId,
      (subByBucket.get(row.bucketId) ?? 0) + row.amount,
    );
  }
  return buckets.map((b) => {
    const sub = subByBucket.get(b.id) ?? 0;
    if (sub === 0) return b;
    return { ...b, amount: b.amount - sub };
  });
}

/** Alias for {@link applyDebitToBuckets} (split / debit allocation). */
export const applyDebitAllocation = applyDebitToBuckets;

/** Add split amounts back to each bucket (undo a debit). Immutable. */
export function reverseDebitFromBuckets(
  buckets: Bucket[],
  splits: TransactionSplit[],
): Bucket[] {
  const addByBucket = new Map<string, number>();
  for (const row of splits) {
    addByBucket.set(
      row.bucketId,
      (addByBucket.get(row.bucketId) ?? 0) + row.amount,
    );
  }
  return buckets.map((b) => {
    const add = addByBucket.get(b.id) ?? 0;
    if (add === 0) return b;
    return { ...b, amount: b.amount + add };
  });
}

/** Alias for {@link reverseDebitFromBuckets}. */
export const reverseDebitAllocation = reverseDebitFromBuckets;

export function selectTransactionsByBucket(
  transactions: Transaction[],
  bucketId: string,
): Transaction[] {
  return transactions.filter((tx) =>
    getEffectiveSplits(tx).some((s) => s.bucketId === bucketId),
  );
}

/**
 * Move `amount` from `fromId` to `toId`. Total of bucket amounts is unchanged.
 * @throws If buckets are missing, ids match, amount is not positive, or source would go negative.
 */
export function transferBetweenBuckets(
  buckets: Bucket[],
  fromId: string,
  toId: string,
  amount: number,
): Bucket[] {
  if (fromId === toId) {
    throw new Error("Choose a different destination bucket");
  }
  if (!Number.isFinite(amount) || amount <= MONEY_EPSILON) {
    throw new Error("Transfer amount must be greater than zero");
  }
  const from = getBucketById(buckets, fromId);
  const to = getBucketById(buckets, toId);
  if (!from || !to) {
    throw new Error("Unknown bucket");
  }
  if (from.amount + MONEY_EPSILON < amount) {
    throw new Error("Source bucket does not have enough balance");
  }
  return buckets.map((b) => {
    if (b.id === fromId) return { ...b, amount: b.amount - amount };
    if (b.id === toId) return { ...b, amount: b.amount + amount };
    return b;
  });
}

export function selectAllocationsForBucket(
  transactions: Transaction[],
  bucketId: string,
): { transaction: Transaction; amount: number }[] {
  const out: { transaction: Transaction; amount: number }[] = [];
  for (const tx of transactions) {
    for (const row of getEffectiveSplits(tx)) {
      if (row.bucketId === bucketId) {
        out.push({ transaction: tx, amount: row.amount });
      }
    }
  }
  return out;
}
