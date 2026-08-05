import { describe, expect, it } from "vitest";
import { runPaycheckAllocation } from "./paycheck-allocation-engine";
import type { Bucket, EssentialBillBucket, DiscretionaryBucket } from "./types";

function billBucket(overrides: Partial<EssentialBillBucket>): EssentialBillBucket {
  return {
    id: "bill1",
    name: "Rent",
    order: 0,
    amount: 0,
    top_off: 200,
    percentage: 1,
    type: "essential",
    essential_subtype: "bill",
    due_date: "2026-09-01",
    alert_date: "2026-08-29",
    ...overrides,
  };
}

function topoffBucket(overrides: Partial<DiscretionaryBucket>): DiscretionaryBucket {
  return {
    id: "disc1",
    name: "Fun",
    order: 10,
    amount: 0,
    top_off: 100,
    percentage: null,
    type: "discretionary",
    goal_target_date: null,
    locked: false,
    ...overrides,
  };
}

function unassignedBucket(overrides: Partial<DiscretionaryBucket>): DiscretionaryBucket {
  return {
    id: "unassigned1",
    name: "Unassigned",
    order: 0,
    amount: 0,
    top_off: null,
    percentage: null,
    type: "discretionary",
    goal_target_date: null,
    locked: false,
    ...overrides,
  };
}

describe("runPaycheckAllocation", () => {
  it("funds bills, then top-offs, then routes surplus to Unassigned (paycheck_1)", () => {
    const buckets = [billBucket({}), topoffBucket({}), unassignedBucket({})];
    const { buckets: result, lineItems } = runPaycheckAllocation(buckets, 500, "paycheck_1", new Date("2026-08-01"));

    const bill = result.find((b) => b.id === "bill1")!;
    const disc = result.find((b) => b.id === "disc1")!;
    const unassigned = result.find((b) => b.id === "unassigned1")!;
    expect(bill.amount).toBe(200);
    expect(disc.amount).toBe(100);
    expect(unassigned.amount).toBe(200);
    expect(lineItems).toHaveLength(3);
    expect(lineItems.map((l) => l.step)).toEqual(["essentials", "topoff", "surplus"]);
  });

  it("respects smoothing: paycheck_2 gets $0 for a percentage:1 bill", () => {
    const buckets = [billBucket({}), topoffBucket({}), unassignedBucket({})];
    const { buckets: result, lineItems } = runPaycheckAllocation(buckets, 500, "paycheck_2", new Date("2026-08-01"));

    const bill = result.find((b) => b.id === "bill1")!;
    expect(bill.amount).toBe(0);
    expect(lineItems.find((l) => l.step === "essentials")).toBeUndefined();
    const disc = result.find((b) => b.id === "disc1")!;
    const unassigned = result.find((b) => b.id === "unassigned1")!;
    expect(disc.amount).toBe(100);
    expect(unassigned.amount).toBe(400);
  });

  it("partially recovers an overspent essential bucket when pool is small", () => {
    const overspent: Bucket = {
      id: "spend1",
      name: "Groceries",
      order: 0,
      amount: -50,
      top_off: 400,
      percentage: null,
      type: "essential",
      essential_subtype: "essential_spending",
    };
    const buckets = [overspent, unassignedBucket({})];
    const { buckets: result, lineItems } = runPaycheckAllocation(buckets, 10, "paycheck_1", new Date("2026-08-01"));

    const recovered = result.find((b) => b.id === "spend1")!;
    expect(recovered.amount).toBe(-40);
    const unassigned = result.find((b) => b.id === "unassigned1")!;
    expect(unassigned.amount).toBe(0);
    expect(lineItems).toHaveLength(1);
    expect(lineItems[0]!.step).toBe("recovery");
  });
});
