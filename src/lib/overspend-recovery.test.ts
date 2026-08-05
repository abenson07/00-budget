import { describe, expect, it } from "vitest";
import {
  discretionaryRecoveryPlan,
  essentialRecoveryPlan,
  ESSENTIAL_VARIANCE_THRESHOLD,
} from "./overspend-recovery";
import type { Bucket } from "./types";

const unassigned: Bucket = {
  id: "unassigned",
  name: "Unassigned",
  order: 0,
  amount: 100,
  top_off: null,
  percentage: null,
  type: "discretionary",
  goal_target_date: null,
};

function essential(id: string, amount: number): Bucket {
  return {
    id,
    name: id,
    order: 1,
    amount,
    top_off: 100,
    percentage: null,
    type: "essential",
    essential_subtype: "essential_spending",
  };
}

function discretionary(id: string, order: number, amount: number, locked = false): Bucket {
  return {
    id,
    name: id,
    order,
    amount,
    top_off: null,
    percentage: null,
    type: "discretionary",
    goal_target_date: null,
    locked,
  };
}

describe("essentialRecoveryPlan", () => {
  it("covers a shortfall within threshold from Unassigned", () => {
    const buckets = [unassigned, essential("groceries", -10)];
    expect(essentialRecoveryPlan(buckets, "groceries")).toEqual({
      coverFromId: "unassigned",
      amount: 10,
    });
  });

  it("does not cover a shortfall over the threshold", () => {
    const buckets = [unassigned, essential("groceries", -(ESSENTIAL_VARIANCE_THRESHOLD + 10))];
    expect(essentialRecoveryPlan(buckets, "groceries")).toBeNull();
  });
});

describe("discretionaryRecoveryPlan", () => {
  it("covers from the lowest-priority eligible discretionary bucket", () => {
    const overspent = discretionary("fun", 5, -15);
    const high = discretionary("shopping", 10, 100);
    const low = discretionary("travel", 20, 100);
    const buckets = [overspent, high, low];
    expect(discretionaryRecoveryPlan(buckets, "fun")).toEqual({
      coverFromId: "travel",
      amount: 15,
    });
  });
});
