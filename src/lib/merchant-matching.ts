import { getEffectiveSplits } from "./allocation";
import type { Transaction } from "./types";

export type MerchantRule = { merchant: string; bucketId: string };

export function normalizeMerchant(merchant: string): string {
  return merchant.trim().toLowerCase();
}

export function matchBucketForMerchant(merchant: string, rules: MerchantRule[]): string | null {
  const key = normalizeMerchant(merchant);
  const found = rules.find((r) => r.merchant === key);
  return found ? found.bucketId : null;
}

/** Applies rules only to transactions with no existing allocation; returns a new array. */
export function applyMerchantRules(transactions: Transaction[], rules: MerchantRule[]): Transaction[] {
  return transactions.map((tx) => {
    if (getEffectiveSplits(tx).length > 0) return tx;
    const bucketId = matchBucketForMerchant(tx.merchant, rules);
    return bucketId ? { ...tx, primary_bucket_id: bucketId } : tx;
  });
}

export function unmatchedTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter((tx) => getEffectiveSplits(tx).length === 0);
}
