import { describe, expect, it } from "vitest";
import { paycheckLineFor, safeToSpendHeadline } from "./safe-to-spend-summary";
import type { Bucket } from "./types";

describe("safeToSpendHeadline", () => {
  it("sums only unlocked discretionary balances", () => {
    const buckets: Bucket[] = [
      {
        id: "1",
        name: "Unassigned",
        order: 0,
        amount: 100,
        top_off: null,
        percentage: null,
        type: "discretionary",
        goal_target_date: null,
        locked: false,
      },
      {
        id: "2",
        name: "Locked savings",
        order: 1,
        amount: 50,
        top_off: null,
        percentage: null,
        type: "discretionary",
        goal_target_date: null,
        locked: true,
      },
      {
        id: "3",
        name: "Rent",
        order: 2,
        amount: 500,
        top_off: 500,
        percentage: null,
        type: "essential",
        essential_subtype: "bill",
        due_date: "2026-09-01",
        alert_date: "2026-08-29",
      },
    ];
    const { headline, amount } = safeToSpendHeadline(buckets);
    expect(headline).toBe("Safe to spend");
    expect(amount).toBe("$100.00");
  });
});

describe("paycheckLineFor", () => {
  it("prompts to add a date when none is set", () => {
    expect(paycheckLineFor(null, new Date(2026, 7, 5))).toBe("Add your next paycheck date");
  });

  it("counts down days when a date is set", () => {
    expect(paycheckLineFor("2026-08-08", new Date(2026, 7, 5))).toBe(
      "3 days until your next paycheck",
    );
  });
});
