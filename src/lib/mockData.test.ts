import { describe, expect, it } from "vitest";
import { createMockDataset } from "./mockData";
import { validateTransactionSplits } from "./validation";
import { getBucketById, selectAllocationsForBucket } from "@/state/budget-store";

describe("createMockDataset", () => {
  it("includes bill + essential_spending essentials, discretionary, and Unassigned", () => {
    const { buckets } = createMockDataset(42);
    const names = buckets.map((b) => b.name);
    expect(names).toContain("Unassigned");

    const bills = buckets.filter(
      (b) =>
        b.type === "essential" &&
        b.essential_subtype === "bill",
    );
    const spend = buckets.filter(
      (b) =>
        b.type === "essential" &&
        b.essential_subtype === "essential_spending",
    );
    const disc = buckets.filter((b) => b.type === "discretionary");

    expect(bills.length).toBeGreaterThanOrEqual(1);
    expect(spend.length).toBeGreaterThanOrEqual(1);
    expect(disc.length).toBeGreaterThanOrEqual(1);
  });

  it("uses distinct bucket order values", () => {
    const { buckets } = createMockDataset(7);
    const orders = buckets.map((b) => b.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("has at least one multi-bucket split transaction", () => {
    const { buckets, transactions } = createMockDataset(0);
    const multi = transactions.filter(
      (t) => (t.splits?.length ?? 0) >= 2,
    );
    expect(multi.length).toBeGreaterThanOrEqual(1);

    for (const tx of transactions) {
      expect(validateTransactionSplits(tx, buckets)).toEqual([]);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = createMockDataset(99);
    const b = createMockDataset(99);
    expect(a.buckets.map((x) => x.amount)).toEqual(
      b.buckets.map((x) => x.amount),
    );
  });

  it("selectors resolve split allocations by bucket id", () => {
    const { buckets, transactions } = createMockDataset(1);
    const groceries = getBucketById(
      buckets,
      "f1000000-0000-4000-8000-000000000014",
    )!;
    const alloc = selectAllocationsForBucket(transactions, groceries.id);
    const wholeFoods = alloc.find(
      (a) => a.transaction.id === "f2000000-0000-4000-8000-000000000001",
    );
    expect(wholeFoods?.amount).toBe(52);
  });
});
