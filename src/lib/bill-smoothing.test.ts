import { describe, expect, it } from "vitest";
import { percentageForMode, smoothingAmounts } from "./bill-smoothing";
import type { EssentialBillBucket } from "./types";

function billBucket(overrides: Partial<EssentialBillBucket>): EssentialBillBucket {
  return {
    id: "1",
    name: "Rent",
    order: 0,
    amount: 200,
    top_off: 200,
    percentage: null,
    type: "essential",
    essential_subtype: "bill",
    due_date: "2026-09-01",
    alert_date: "2026-08-29",
    ...overrides,
  };
}

describe("smoothingAmounts", () => {
  it("computes full paycheck_1 allocation when percentage is 1", () => {
    const result = smoothingAmounts(billBucket({ top_off: 200, percentage: 1 }));
    expect(result.paycheck1Amount).toBe(200);
    expect(result.paycheck2Amount).toBe(0);
    expect(result.mode).toBe("paycheck_1");
  });

  it("splits evenly when percentage is null", () => {
    const result = smoothingAmounts(billBucket({ top_off: 200, percentage: null }));
    expect(result.paycheck1Amount).toBe(100);
    expect(result.paycheck2Amount).toBe(100);
    expect(result.mode).toBe("both");
  });
});

describe("percentageForMode", () => {
  it("maps paycheck_2 to 0", () => {
    expect(percentageForMode("paycheck_2")).toBe(0);
  });
});
