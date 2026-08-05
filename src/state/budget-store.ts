import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  accountBalance,
  applyDebitAllocation,
  computeSafeToSpendMetrics,
  getEffectiveSplits,
  getBucketById,
  reverseDebitAllocation,
  selectAllocationsForBucket,
  selectTransactionsByBucket,
  transferBetweenBuckets,
} from "@/lib/allocation";
import type { BucketMetadataInput } from "@/lib/bucket-metadata";
import { applyBucketMetadata, validateBucketMetadata } from "@/lib/bucket-metadata";
import { swapOrderWithNeighbor } from "@/lib/discretionary-priority";
import { discretionaryRecoveryPlan, essentialRecoveryPlan } from "@/lib/overspend-recovery";
import {
  runPaycheckAllocation as runAllocationEngine,
  type AllocationLineItem,
} from "@/lib/paycheck-allocation-engine";
import {
  fetchBudgetDataset,
  persistBucketAmounts,
  persistBucketCreate,
  persistBucketUpdate,
  persistTransactionCreate,
  persistTransactionDelete,
  persistTransactionUpdate,
  seedDemoIfEmpty,
} from "@/lib/budget-sync";
import {
  buildNewBucketFromCategory,
  nextBucketSortOrder,
  type NewBucketCategoryId,
} from "@/lib/new-bucket-from-category";
import { createMockDataset } from "@/lib/mockData";
import type { Account, AllocationRunSummary, Bucket, Transaction } from "@/lib/types";
import { validateTransactionAllocation } from "@/lib/validation";
import { createClient } from "@/utils/supabase/client";

export {
  applyDebitAllocation,
  applyDebitToBuckets,
  computeSafeToSpendMetrics,
  getBucketById,
  getEffectiveSplits,
  reverseDebitAllocation,
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
  nextPaycheckDate: string | null;
  lastAllocationRunAt: string | null;
  allocationHistory: AllocationRunSummary[];
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

  reorderDiscretionaryBucket: (bucketId: string, direction: "up" | "down") => void;

  setNextPaycheckDate: (date: string) => void;

  runPaycheckAllocation: (
    incomeAmount: number,
    slot: "paycheck_1" | "paycheck_2",
  ) => AllocationRunSummary | null;

  createBucketFromCategory: (category: NewBucketCategoryId) => string;

  appendBucket: (bucket: Bucket) => void;

  loadFinalizedDataset: (dataset: { account: Account; buckets: Bucket[]; transactions: Transaction[] }) => void;

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

export const selectAllocationRun = (id: string) => (s: BudgetStore) =>
  s.allocationHistory.find((r) => r.id === id);

function applyOverspendRecovery(buckets: Bucket[]): Bucket[] {
  let result = buckets;
  for (const b of result) {
    const current = result.find((x) => x.id === b.id)!;
    if (current.amount >= 0) continue;
    const plan =
      current.type === "essential"
        ? essentialRecoveryPlan(result, current.id)
        : discretionaryRecoveryPlan(result, current.id);
    if (!plan) continue;
    result = result.map((x) => {
      if (x.id === current.id) return { ...x, amount: x.amount + plan.amount };
      if (x.id === plan.coverFromId) return { ...x, amount: x.amount - plan.amount };
      return x;
    });
  }
  return result;
}

const fallbackInitial = createMockDataset();

export const useBudgetStore = create<BudgetState & BudgetActions>()(
  persist(
    (set, get) => ({
  account: fallbackInitial.account,
  buckets: fallbackInitial.buckets,
  transactions: fallbackInitial.transactions,
  syncError: null,
  nextPaycheckDate: null,
  lastAllocationRunAt: null,
  allocationHistory: [],

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

    const nextBuckets = applyOverspendRecovery(applyDebitAllocation(buckets, getEffectiveSplits(tx)));
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

    let nextBuckets = reverseDebitAllocation(buckets, getEffectiveSplits(prev));
    nextBuckets = applyDebitAllocation(nextBuckets, getEffectiveSplits(merged));
    nextBuckets = applyOverspendRecovery(nextBuckets);

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

    const nextBuckets = reverseDebitAllocation(
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

  reorderDiscretionaryBucket: (bucketId, direction) => {
    const { buckets } = get();
    const swap = swapOrderWithNeighbor(buckets, bucketId, direction);
    if (!swap) return;
    const next = buckets.map((b) => {
      const found = swap.find((s) => s.id === b.id);
      return found ? { ...b, order: found.order } : b;
    });
    set({ buckets: next });
    const supabase = tryCreateSupabase();
    if (!supabase) return;
    void (async () => {
      try {
        for (const s of swap) {
          const b = next.find((x) => x.id === s.id)!;
          await persistBucketUpdate(supabase, b);
        }
      } catch (e) {
        console.error("reorderDiscretionaryBucket persist failed", e);
      }
    })();
  },

  setNextPaycheckDate: (date) => set({ nextPaycheckDate: date }),

  runPaycheckAllocation: (incomeAmount, slot) => {
    const last = get().lastAllocationRunAt;
    if (last && Date.now() - new Date(last).getTime() < 60_000) {
      return null;
    }
    const { buckets } = get();
    const { buckets: nextBuckets, lineItems } = runAllocationEngine(buckets, incomeAmount, slot, new Date());
    const run: AllocationRunSummary = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      incomeAmount,
      slot,
      lineItems,
    };
    set({
      buckets: nextBuckets,
      lastAllocationRunAt: new Date().toISOString(),
      allocationHistory: [...get().allocationHistory, run],
    });
    const supabase = tryCreateSupabase();
    if (supabase) {
      void persistBucketAmounts(supabase, nextBuckets).catch((e) =>
        console.error("runPaycheckAllocation persist failed", e),
      );
    }
    return run;
  },

  createBucketFromCategory: (category) => {
    const { account, buckets } = get();
    const order = nextBucketSortOrder(buckets);
    const bucket = buildNewBucketFromCategory(category, order);
    set({ buckets: [...buckets, bucket] });

    const supabase = tryCreateSupabase();
    if (!supabase) return bucket.id;
    void (async () => {
      try {
        await persistBucketCreate(supabase, account.id, bucket);
      } catch (e) {
        console.error("createBucketFromCategory persist failed", e);
      }
    })();
    return bucket.id;
  },

  appendBucket: (bucket) => {
    const { account, buckets } = get();
    set({ buckets: [...buckets, bucket] });

    const supabase = tryCreateSupabase();
    if (!supabase) return;
    void (async () => {
      try {
        await persistBucketCreate(supabase, account.id, bucket);
      } catch (e) {
        console.error("appendBucket persist failed", e);
      }
    })();
  },

  loadFinalizedDataset: (dataset) =>
    set({ account: dataset.account, buckets: dataset.buckets, transactions: dataset.transactions, syncError: null }),

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
    }),
    {
      name: "budget-data",
      partialize: (s) => ({
        account: s.account,
        buckets: s.buckets,
        transactions: s.transactions,
        nextPaycheckDate: s.nextPaycheckDate,
        allocationHistory: s.allocationHistory,
      }),
    },
  ),
);
