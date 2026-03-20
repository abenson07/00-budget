import { describe, expect, it } from "vitest";
import { MONEY_EPSILON } from "./constants";
import { createMockDataset } from "./mockData";
import type { Transaction } from "./types";
import { validateSplits, validateTransactionAllocation } from "./validation";

const GROCERIES = "f1000000-0000-4000-8000-000000000014";
const FUN = "f1000000-0000-4000-8000-000000000015";
const UNASSIGNED = "f1000000-0000-4000-8000-000000000011";
const UTILITIES = "f1000000-0000-4000-8000-000000000013";

describe("validateSplits", () => {
  it("accepts when split amounts sum exactly to transaction amount", () => {
    expect(
      validateSplits(100, [
        { bucketId: GROCERIES, amount: 60 },
        { bucketId: FUN, amount: 40 },
      ]),
    ).toEqual([]);
  });

  it("accepts multiple buckets (3+)", () => {
    expect(
      validateSplits(100, [
        { bucketId: GROCERIES, amount: 33.33 },
        { bucketId: FUN, amount: 33.33 },
        { bucketId: UNASSIGNED, amount: 33.34 },
      ]),
    ).toEqual([]);
  });

  it("rejects when sum is too low", () => {
    const errs = validateSplits(100, [
      { bucketId: GROCERIES, amount: 40 },
      { bucketId: FUN, amount: 50 },
    ]);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs.some((e) => e.includes("sum"))).toBe(true);
  });

  it("rejects when sum is too high", () => {
    const errs = validateSplits(100, [
      { bucketId: GROCERIES, amount: 60 },
      { bucketId: FUN, amount: 50 },
    ]);
    expect(errs.length).toBeGreaterThan(0);
  });

  it("accepts sums within floating-point epsilon of transaction amount", () => {
    const delta = MONEY_EPSILON * 0.5;
    expect(validateSplits(100, [{ bucketId: FUN, amount: 100 + delta }])).toEqual(
      [],
    );
  });

  it("rejects when sum is outside epsilon", () => {
    const errs = validateSplits(100, [
      { bucketId: FUN, amount: 100 + MONEY_EPSILON * 2 },
    ]);
    expect(errs.length).toBeGreaterThan(0);
  });

  it("rejects empty splits", () => {
    expect(validateSplits(100, []).length).toBeGreaterThan(0);
  });

  it("rejects non-finite or negative amounts", () => {
    expect(
      validateSplits(10, [{ bucketId: FUN, amount: Number.NaN }]).length,
    ).toBeGreaterThan(0);
    expect(
      validateSplits(10, [{ bucketId: FUN, amount: -1 }]).length,
    ).toBeGreaterThan(0);
  });
});

describe("validateTransactionAllocation (duplicates)", () => {
  it("rejects duplicate bucket ids in splits", () => {
    const { buckets } = createMockDataset(0);
    const tx: Transaction = {
      id: "dup",
      account_id: "f1000000-0000-4000-8000-000000000001",
      amount: 20,
      merchant: "X",
      date: "2025-01-01",
      spending_type: "debit",
      splits: [
        { bucketId: FUN, amount: 10 },
        { bucketId: FUN, amount: 10 },
      ],
    };
    const errs = validateTransactionAllocation(tx, buckets);
    expect(errs.some((e) => e.includes("more than once"))).toBe(true);
  });

  it("accepts single-bucket primary allocation", () => {
    const { buckets } = createMockDataset(0);
    const tx: Transaction = {
      id: "one",
      account_id: "f1000000-0000-4000-8000-000000000001",
      amount: 12,
      merchant: "Y",
      date: "2025-01-02",
      spending_type: "debit",
      primary_bucket_id: UTILITIES,
    };
    expect(validateTransactionAllocation(tx, buckets)).toEqual([]);
  });
});
