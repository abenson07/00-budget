import { create } from "zustand";
import { createMockDataset } from "@/lib/mockData";
import type { Account, Bucket, Transaction } from "@/lib/types";

export function getBucketById(
  buckets: Bucket[],
  id: string,
): Bucket | undefined {
  return buckets.find((b) => b.id === id);
}

export function sumBucketAmounts(buckets: Bucket[]): number {
  return buckets.reduce((s, b) => s + b.amount, 0);
}

/** Unassigned is discretionary; included here for safe-to-spend. */
export function safeToSpendTotal(buckets: Bucket[]): number {
  return buckets
    .filter((b) => b.type === "discretionary")
    .reduce((s, b) => s + b.amount, 0);
}

export function selectAllocationsForBucket(
  transactions: Transaction[],
  bucketId: string,
): { transaction: Transaction; amount: number }[] {
  const out: { transaction: Transaction; amount: number }[] = [];
  for (const tx of transactions) {
    const splits = tx.splits;
    if (!splits?.length) continue;
    const row = splits.find((s) => s.bucketId === bucketId);
    if (row) out.push({ transaction: tx, amount: row.amount });
  }
  return out;
}

type BudgetState = {
  account: Account;
  buckets: Bucket[];
  transactions: Transaction[];
};

type BudgetActions = {
  getBucketById: (id: string) => Bucket | undefined;
  allocationsForBucket: (bucketId: string) => {
    transaction: Transaction;
    amount: number;
  }[];
};

const initial = createMockDataset();

export const useBudgetStore = create<BudgetState & BudgetActions>((set, get) => ({
  account: initial.account,
  buckets: initial.buckets,
  transactions: initial.transactions,
  getBucketById: (id) => getBucketById(get().buckets, id),
  allocationsForBucket: (bucketId) =>
    selectAllocationsForBucket(get().transactions, bucketId),
}));
