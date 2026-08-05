import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyMerchantRules, normalizeMerchant, type MerchantRule } from "@/lib/merchant-matching";
import { useBudgetStore } from "./budget-store";

type MerchantRulesState = { rules: MerchantRule[] };
type MerchantRulesActions = {
  recordMerchantRule: (merchant: string, bucketId: string) => void;
  runAutoMatch: () => void;
};

export const useMerchantRulesStore = create<MerchantRulesState & MerchantRulesActions>()(
  persist(
    (set, get) => ({
      rules: [],
      recordMerchantRule: (merchant, bucketId) => {
        const key = normalizeMerchant(merchant);
        const rules = get().rules.filter((r) => r.merchant !== key);
        set({ rules: [...rules, { merchant: key, bucketId }] });
        get().runAutoMatch();
      },
      runAutoMatch: () => {
        const { transactions } = useBudgetStore.getState();
        const updated = applyMerchantRules(transactions, get().rules);
        for (let i = 0; i < updated.length; i++) {
          const before = transactions[i]!;
          const after = updated[i]!;
          if (before.primary_bucket_id !== after.primary_bucket_id) {
            useBudgetStore.getState().updateTransaction(after.id, { primary_bucket_id: after.primary_bucket_id });
          }
        }
      },
    }),
    { name: "merchant-rules" },
  ),
);
