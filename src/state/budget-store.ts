import { create } from "zustand";
import {
  accountBalance,
  applyDebitToBuckets,
  computeSafeToSpendMetrics,
  getEffectiveSplits,
  getBucketById,
  reverseDebitFromBuckets,
  selectAllocationsForBucket,
  selectTransactionsByBucket,
  transferBetweenBuckets,
} from "@/lib/allocation";
import type { BucketMetadataInput } from "@/lib/bucket-metadata";
import { applyBucketMetadata, validateBucketMetadata } from "@/lib/bucket-metadata";
import {
  fetchBudgetDataset,
  persistBucketAmounts,
  persistBucketUpdate,
  persistTransactionCreate,
  persistTransactionDelete,
  persistTransactionUpdate,
  seedDemoIfEmpty,
} from "@/lib/budget-sync";
import { createMockDataset } from "@/lib/mockData";
import type { Account, Bucket, Transaction } from "@/lib/types";
import { validateTransactionAllocation } from "@/lib/validation";
import { createClient } from "@/utils/supabase/client";

export {
  applyDebitToBuckets,
  computeSafeToSpendMetrics,
  getBucketById,
  getEffectiveSplits,
  reverseDebitFromBuckets,
  selectAllocationsForBucket,
  selectTransactionsByBucket,
  transferBetweenBuckets,
} from "@/lib/allocation";

export type { BucketMetadataInput } from "@/lib/bucket-metadata";

/** @deprecated Use accountBalance from @/lib/allocation or selectAccountBalance */
export function sumBucketAmounts(buckets: Bucket[]): number {
  return accountBalance(buckets);
}

/** @deprecated Use safeToSpendPrimary from @/lib/allocation */
export function safeToSpendTotal(buckets: Bucket[]): number {
  return computeSafeToSpendMetrics(buckets).primary;
}

function tryCreateSupabase() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

type BudgetState = {
  account: Account;
  buckets: Bucket[];
  transactions: Transaction[];
  syncError: string | null;
};

type BudgetActions = {
  getBucketById: (id: string) => Bucket | undefined;
  allocationsForBucket: (bucketId: string) => {
    transaction: Transaction;
    amount: number;
  }[];

  transactionsForBucket: (bucketId: string) => Transaction[];

  createTransaction: (tx: Transaction) => void;
  updateTransaction: (
    txId: string,
    patch: Partial<Omit<Transaction, "id" | "account_id">>,
  ) => void;
  deleteTransaction: (txId: string) => void;

  transferBetweenBuckets: (
    fromBucketId: string,
    toBucketId: string,
    amount: number,
  ) => void;

  updateBucketMetadata: (bucketId: string, input: BucketMetadataInput) => void;

  /** Load from Supabase; seeds demo if `accounts` is empty. No-op if env missing. */
  syncFromSupabase: () => Promise<void>;
};

type BudgetStore = BudgetState & BudgetActions;

/** Dashboard selectors (budget-003): single source with allocation helpers. */
export const selectAccountBalance = (s: BudgetStore) => accountBalance(s.buckets);

export const selectSafeToSpend = (s: BudgetStore) =>
  computeSafeToSpendMetrics(s.buckets).primary;

/** Prefer `useBudgetStore(s => s.buckets)` + `useMemo` for sorted order; do not pass this to `useBudgetStore` (new array each call breaks useSyncExternalStore). */
export const selectSortedBuckets = (s: BudgetStore) =>
  [...s.buckets].sort((a, b) => a.order - b.order);

const fallbackInitial = createMockDataset();

export const useBudgetStore = create<BudgetState & BudgetActions>((set, get) => ({
  account: fallbackInitial.account,
  buckets: fallbackInitial.buckets,
  transactions: fallbackInitial.transactions,
  syncError: null,

  getBucketById: (id) => getBucketById(get().buckets, id),

  allocationsForBucket: (bucketId) =>
    selectAllocationsForBucket(get().transactions, bucketId),

  transactionsForBucket: (bucketId) =>
    selectTransactionsByBucket(get().transactions, bucketId),

  createTransaction: (tx) => {
    const { buckets, transactions, account } = get();
    const errs = validateTransactionAllocation(tx, buckets);
    if (errs.length > 0) {
      throw new Error(errs.join("; "));
    }
    if (tx.account_id !== account.id) {
      throw new Error("Transaction account_id does not match current account");
    }

    const nextBuckets = applyDebitToBuckets(buckets, getEffectiveSplits(tx));
    set({
      buckets: nextBuckets,
      transactions: [...transactions, tx],
    });

    const supabase = tryCreateSupabase();
    if (!supabase) return;
    void (async () => {
      try {
        await persistTransactionCreate(supabase, tx);
        await persistBucketAmounts(supabase, get().buckets);
      } catch (e) {
        console.error("createTransaction persist failed", e);
      }
    })();
  },

  updateTransaction: (txId, patch) => {
    const { buckets, transactions, account } = get();
    const prev = transactions.find((t) => t.id === txId);
    if (!prev) return;

    const merged: Transaction = {
      ...prev,
      ...patch,
      id: prev.id,
      account_id: prev.account_id,
    };
    const errs = validateTransactionAllocation(merged, buckets);
    if (errs.length > 0) {
      throw new Error(errs.join("; "));
    }
    if (merged.account_id !== account.id) {
      throw new Error("Transaction account_id does not match current account");
    }

    let nextBuckets = reverseDebitFromBuckets(buckets, getEffectiveSplits(prev));
    nextBuckets = applyDebitToBuckets(nextBuckets, getEffectiveSplits(merged));

    set({
      buckets: nextBuckets,
      transactions: transactions.map((t) => (t.id === txId ? merged : t)),
    });

    const supabase = tryCreateSupabase();
    if (!supabase) return;
    void (async () => {
      try {
        await persistTransactionUpdate(supabase, merged);
        await persistBucketAmounts(supabase, get().buckets);
      } catch (e) {
        console.error("updateTransaction persist failed", e);
      }
    })();
  },

  deleteTransaction: (txId) => {
    const { buckets, transactions } = get();
    const prev = transactions.find((t) => t.id === txId);
    if (!prev) return;

    const nextBuckets = reverseDebitFromBuckets(
      buckets,
      getEffectiveSplits(prev),
    );
    set({
      buckets: nextBuckets,
      transactions: transactions.filter((t) => t.id !== txId),
    });

    const supabase = tryCreateSupabase();
    if (!supabase) return;
    void (async () => {
      try {
        await persistTransactionDelete(supabase, txId);
        await persistBucketAmounts(supabase, get().buckets);
      } catch (e) {
        console.error("deleteTransaction persist failed", e);
      }
    })();
  },

  transferBetweenBuckets: (fromBucketId, toBucketId, amount) => {
    const { buckets } = get();
    let next: Bucket[];
    try {
      next = transferBetweenBuckets(buckets, fromBucketId, toBucketId, amount);
    } catch (e) {
      throw e instanceof Error ? e : new Error(String(e));
    }
    set({ buckets: next });

    const supabase = tryCreateSupabase();
    if (!supabase) return;
    void (async () => {
      try {
        await persistBucketAmounts(supabase, get().buckets);
      } catch (e) {
        console.error("transferBetweenBuckets persist failed", e);
      }
    })();
  },

  updateBucketMetadata: (bucketId, input) => {
    const prev = getBucketById(get().buckets, bucketId);
    if (!prev) return;

    const errs = validateBucketMetadata(input);
    if (errs.length > 0) {
      throw new Error(errs.join("; "));
    }

    const nextBucket = applyBucketMetadata(prev, input);
    set({
      buckets: get().buckets.map((b) => (b.id === bucketId ? nextBucket : b)),
    });

    const supabase = tryCreateSupabase();
    if (!supabase) return;
    void (async () => {
      try {
        await persistBucketUpdate(supabase, get().getBucketById(bucketId)!);
      } catch (e) {
        console.error("updateBucketMetadata persist failed", e);
      }
    })();
  },

  syncFromSupabase: async () => {
    const supabase = tryCreateSupabase();
    if (!supabase) {
      set({ syncError: "Supabase not configured" });
      return;
    }

    set({ syncError: null });

    try {
      await seedDemoIfEmpty(supabase, 42);
      const dataset = await fetchBudgetDataset(supabase);
      if (dataset) {
        set({
          account: dataset.account,
          buckets: dataset.buckets,
          transactions: dataset.transactions,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ syncError: msg });
    }
  },
}));
