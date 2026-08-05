import { describe, expect, it } from "vitest";
import { computeInitialBudgetState, estimateObligations } from "./initial-budget-state";
import type { Transaction } from "./types";

function tx(id: string, merchant: string, amount: number, date: string): Transaction {
  return { id, account_id: "acct1", merchant, amount, date, spending_type: "debit" };
}

describe("estimateObligations", () => {
  it("counts a merchant recurring 2+ times at >= $50 as an obligation", () => {
    const transactions = [
      tx("1", "Gym Membership", 55.0, "2026-06-01"),
      tx("2", "Gym Membership", 55.0, "2026-07-01"),
      tx("3", "Whole Foods", 52.0, "2026-06-05"),
    ];
    const { total, merchants } = estimateObligations(transactions);
    expect(total).toBe(55);
    expect(merchants).toEqual([{ merchant: "Gym Membership", amount: 55.0 }]);
  });

  it("excludes a merchant recurring 2+ times below the $50 floor", () => {
    const transactions = [
      tx("1", "Netflix", 15.99, "2026-06-09"),
      tx("2", "Netflix", 15.99, "2026-07-09"),
    ];
    const { total, merchants } = estimateObligations(transactions);
    expect(total).toBe(0);
    expect(merchants).toEqual([]);
  });
});

describe("computeInitialBudgetState", () => {
  it("clamps availableToAllocate at 0, never negative", () => {
    const transactions = [
      tx("1", "Big Bill", 200, "2026-06-01"),
      tx("2", "Big Bill", 200, "2026-07-01"),
    ];
    const state = computeInitialBudgetState(transactions, 100, "2026-08-15", new Date("2026-08-01"));
    expect(state.estimatedObligations).toBe(200);
    expect(state.availableToAllocate).toBe(0);
  });
});
