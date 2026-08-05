import { describe, expect, it } from "vitest";
import { runwayDays } from "./bucket-runway";
import type { Bucket, Transaction } from "./types";

function discBucket(id: string, amount: number): Bucket {
  return {
    id,
    name: `Bucket ${id}`,
    order: 0,
    amount,
    top_off: null,
    percentage: null,
    type: "discretionary",
    goal_target_date: null,
    locked: false,
  };
}

function tx(id: string, bucketId: string, amount: number, date: string): Transaction {
  return {
    id,
    account_id: "acct1",
    amount,
    merchant: "Test",
    date,
    spending_type: "debit",
    primary_bucket_id: bucketId,
  };
}

describe("runwayDays", () => {
  it("computes days remaining at the trailing 30-day spend rate", () => {
    const bucket = discBucket("b1", 300);
    const now = new Date("2026-08-15");
    const transactions = [
      tx("1", "b1", 10, "2026-08-01"),
      tx("2", "b1", 10, "2026-08-05"),
      tx("3", "b1", 10, "2026-08-10"),
    ];
    expect(runwayDays(bucket, transactions, now)).toBe(300);
  });

  it("returns null when there is no recent spend", () => {
    const bucket = discBucket("b1", 300);
    const now = new Date("2026-08-15");
    expect(runwayDays(bucket, [], now)).toBeNull();
  });
});
