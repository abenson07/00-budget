import { describe, expect, it } from "vitest";
import {
  bucketAllocationSplitSubtext,
  transactionHasMultipleAllocations,
  transactionListSplitSubtext,
} from "./transaction-row-subtext";
import type { Transaction } from "./types";

describe("transaction row subtext", () => {
  it("transactionListSplitSubtext is null for single allocation", () => {
    const tx: Transaction = {
      id: "1",
      account_id: "a",
      amount: 100,
      merchant: "Store",
      date: "2025-01-01",
      spending_type: "debit",
      primary_bucket_id: "b1",
    };
    expect(transactionListSplitSubtext(tx)).toBeNull();
    expect(transactionHasMultipleAllocations(tx)).toBe(false);
  });

  it("transactionListSplitSubtext uses smallest slice percent", () => {
    const tx: Transaction = {
      id: "1",
      account_id: "a",
      amount: 100,
      merchant: "Store",
      date: "2025-01-01",
      spending_type: "debit",
      splits: [
        { bucketId: "a", amount: 88 },
        { bucketId: "b", amount: 12 },
      ],
    };
    expect(transactionListSplitSubtext(tx)).toBe("12% of transaction");
    expect(transactionHasMultipleAllocations(tx)).toBe(true);
  });

  it("bucketAllocationSplitSubtext reflects this bucket share", () => {
    const tx: Transaction = {
      id: "1",
      account_id: "a",
      amount: 100,
      merchant: "Store",
      date: "2025-01-01",
      spending_type: "debit",
      splits: [
        { bucketId: "a", amount: 40 },
        { bucketId: "b", amount: 60 },
      ],
    };
    expect(bucketAllocationSplitSubtext(tx, 40)).toBe("40% of transaction");
    expect(bucketAllocationSplitSubtext(tx, 60)).toBe("60% of transaction");
    const single: Transaction = {
      id: "2",
      account_id: "a",
      amount: 50,
      merchant: "Solo",
      date: "2025-01-02",
      spending_type: "debit",
      primary_bucket_id: "a",
    };
    expect(bucketAllocationSplitSubtext(single, 50)).toBeNull();
  });
});
