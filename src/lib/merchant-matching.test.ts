import { describe, expect, it } from "vitest";
import { applyMerchantRules, unmatchedTransactions } from "./merchant-matching";
import type { Transaction } from "./types";

describe("applyMerchantRules", () => {
  it("matches unassigned transactions by normalized merchant, leaves others untouched", () => {
    const rules = [
      { merchant: "whole foods", bucketId: "bucketA" },
      { merchant: "netflix", bucketId: "bucketB" },
    ];
    const transactions: Transaction[] = [
      { id: "1", account_id: "acct1", amount: 50, merchant: "Whole Foods", date: "2026-08-01", spending_type: "debit" },
      { id: "2", account_id: "acct1", amount: 10, merchant: "Target", date: "2026-08-02", spending_type: "debit" },
      {
        id: "3",
        account_id: "acct1",
        amount: 20,
        merchant: "Already Set",
        date: "2026-08-03",
        spending_type: "debit",
        primary_bucket_id: "bucketC",
      },
    ];

    const result = applyMerchantRules(transactions, rules);
    expect(result[0]!.primary_bucket_id).toBe("bucketA");
    expect(result[1]!.primary_bucket_id).toBeUndefined();
    expect(result[2]!.primary_bucket_id).toBe("bucketC");

    const stillUnmatched = unmatchedTransactions(result);
    expect(stillUnmatched).toHaveLength(1);
    expect(stillUnmatched[0]!.id).toBe("2");
  });
});
