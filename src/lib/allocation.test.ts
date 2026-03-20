import { describe, expect, it } from "vitest";
import {
  applyDebitAllocation,
  applyDebitToBuckets,
  computeSafeToSpendMetrics,
  detectOverspendAfterDebit,
  getEffectiveSplits,
  reverseDebitAllocation,
  reverseDebitFromBuckets,
} from "./allocation";
import { createMockDataset } from "./mockData";
import type { Transaction } from "./types";
import { validateSplits, validateTransactionAllocation } from "./validation";

const GROCERIES = "f1000000-0000-4000-8000-000000000014";
const FUN = "f1000000-0000-4000-8000-000000000015";
const UNASSIGNED = "f1000000-0000-4000-8000-000000000011";
const ACCOUNT = "f1000000-0000-4000-8000-000000000001";

function bucketAmounts(buckets: { id: string; amount: number }[]) {
  return Object.fromEntries(buckets.map((b) => [b.id, b.amount]));
}

describe("computeSafeToSpendMetrics", () => {
  it("primary matches discretionary sum and sanity check matches balance − essential", () => {
    const { buckets } = createMockDataset(42);
    const m = computeSafeToSpendMetrics(buckets);
    const disc = buckets
      .filter((b) => b.type === "discretionary")
      .reduce((s, b) => s + b.amount, 0);
    const essential = buckets
      .filter((b) => b.type === "essential")
      .reduce((s, b) => s + b.amount, 0);
    const balance = buckets.reduce((s, b) => s + b.amount, 0);

    expect(m.primary).toBeCloseTo(disc, 5);
    expect(m.accountBalance).toBeCloseTo(balance, 5);
    expect(m.sanityCheck).toBeCloseTo(balance - essential, 5);
    expect(m.primary).toBeCloseTo(m.sanityCheck, 5);
  });
});

describe("validateTransactionAllocation", () => {
  it("rejects split totals that do not match transaction amount", () => {
    const { buckets } = createMockDataset(0);
    const tx: Transaction = {
      id: "test-tx",
      account_id: ACCOUNT,
      amount: 100,
      merchant: "X",
      date: "2025-01-01",
      spending_type: "debit",
      splits: [
        { bucketId: GROCERIES, amount: 40 },
        { bucketId: FUN, amount: 50 },
      ],
    };
    const errs = validateTransactionAllocation(tx, buckets);
    expect(errs).toEqual(validateSplits(tx.amount, tx.splits!));
    expect(errs.some((e) => e.includes("sum"))).toBe(true);
  });

  it("accepts valid multi-bucket splits", () => {
    const { buckets } = createMockDataset(0);
    const tx: Transaction = {
      id: "ok-split",
      account_id: ACCOUNT,
      amount: 99.99,
      merchant: "Split",
      date: "2025-01-03",
      spending_type: "debit",
      splits: [
        { bucketId: GROCERIES, amount: 33.33 },
        { bucketId: FUN, amount: 33.33 },
        { bucketId: UNASSIGNED, amount: 33.33 },
      ],
    };
    expect(validateTransactionAllocation(tx, buckets)).toEqual([]);
  });
});

describe("applyDebitToBuckets / reverseDebitFromBuckets", () => {
  it("apply then restore returns original amounts", () => {
    const { buckets } = createMockDataset(3);
    const splits = [
      { bucketId: GROCERIES, amount: 12.5 },
      { bucketId: FUN, amount: 3.25 },
    ];
    const applied = applyDebitToBuckets(buckets, splits);
    const restored = reverseDebitFromBuckets(applied, splits);
    expect(bucketAmounts(restored)).toEqual(bucketAmounts(buckets));
  });

  it("aliases applyDebitAllocation / reverseDebitAllocation match apply/reverse", () => {
    const { buckets } = createMockDataset(1);
    const splits = [
      { bucketId: GROCERIES, amount: 10 },
      { bucketId: FUN, amount: 5 },
      { bucketId: UNASSIGNED, amount: 2 },
    ];
    const a = applyDebitAllocation(buckets, splits);
    const b = applyDebitToBuckets(buckets, splits);
    expect(bucketAmounts(a)).toEqual(bucketAmounts(b));
    expect(bucketAmounts(reverseDebitAllocation(a, splits))).toEqual(
      bucketAmounts(buckets),
    );
  });

  it("debit apply reduces total bucket balance by sum of splits", () => {
    const { buckets } = createMockDataset(2);
    const before = buckets.reduce((s, b) => s + b.amount, 0);
    const splits = [
      { bucketId: GROCERIES, amount: 30 },
      { bucketId: FUN, amount: 20 },
    ];
    const applied = applyDebitAllocation(buckets, splits);
    const after = applied.reduce((s, b) => s + b.amount, 0);
    expect(after).toBeCloseTo(before - 50, 5);
  });
});

describe("updateTransaction bucket equivalence", () => {
  it("matches delete old + add new for bucket totals", () => {
    const { buckets } = createMockDataset(99);
    const tx1: Transaction = {
      id: "equiv-1",
      account_id: ACCOUNT,
      amount: 20,
      merchant: "A",
      date: "2025-02-01",
      spending_type: "debit",
      splits: [{ bucketId: GROCERIES, amount: 20 }],
    };
    const tx2: Transaction = {
      ...tx1,
      splits: [
        { bucketId: GROCERIES, amount: 8 },
        { bucketId: FUN, amount: 12 },
      ],
    };

    const s1 = applyDebitToBuckets(buckets, getEffectiveSplits(tx1));
    const viaUpdate = applyDebitToBuckets(
      reverseDebitFromBuckets(s1, getEffectiveSplits(tx1)),
      getEffectiveSplits(tx2),
    );

    const sAfterDelete = reverseDebitFromBuckets(s1, getEffectiveSplits(tx1));
    const viaDeleteAdd = applyDebitToBuckets(
      sAfterDelete,
      getEffectiveSplits(tx2),
    );

    expect(bucketAmounts(viaUpdate)).toEqual(bucketAmounts(viaDeleteAdd));
  });

  it("matches delete + add for three-way split update", () => {
    const { buckets } = createMockDataset(5);
    const tx1: Transaction = {
      id: "equiv-3",
      account_id: ACCOUNT,
      amount: 60,
      merchant: "A",
      date: "2025-02-01",
      spending_type: "debit",
      splits: [
        { bucketId: GROCERIES, amount: 60 },
      ],
    };
    const tx2: Transaction = {
      ...tx1,
      splits: [
        { bucketId: GROCERIES, amount: 20 },
        { bucketId: FUN, amount: 15 },
        { bucketId: UNASSIGNED, amount: 25 },
      ],
    };

    const s1 = applyDebitAllocation(buckets, getEffectiveSplits(tx1));
    const viaUpdate = applyDebitAllocation(
      reverseDebitAllocation(s1, getEffectiveSplits(tx1)),
      getEffectiveSplits(tx2),
    );
    const afterUndo = reverseDebitAllocation(s1, getEffectiveSplits(tx1));
    const viaDeleteAdd = applyDebitAllocation(
      afterUndo,
      getEffectiveSplits(tx2),
    );

    expect(bucketAmounts(viaUpdate)).toEqual(bucketAmounts(viaDeleteAdd));
    expect(validateSplits(tx2.amount, tx2.splits!)).toEqual([]);
  });
});

describe("detectOverspendAfterDebit", () => {
  it("reports deficit and bucket type when a bucket would go negative", () => {
    const { buckets } = createMockDataset(0);
    const small = buckets.map((b) =>
      b.id === FUN ? { ...b, amount: 2 } : b,
    );
    const over = detectOverspendAfterDebit(small, [
      { bucketId: FUN, amount: 50 },
    ]);
    expect(over.length).toBe(1);
    expect(over[0].bucketId).toBe(FUN);
    expect(over[0].bucketType).toBe("discretionary");
    expect(over[0].deficit).toBeCloseTo(48, 5);
  });
});

describe("getEffectiveSplits", () => {
  it("uses primary_bucket_id when splits are absent", () => {
    const tx: Transaction = {
      id: "p",
      account_id: ACCOUNT,
      amount: 6.5,
      merchant: "Café",
      date: "2025-01-02",
      spending_type: "debit",
      primary_bucket_id: FUN,
    };
    expect(getEffectiveSplits(tx)).toEqual([
      { bucketId: FUN, amount: 6.5 },
    ]);
  });
});
