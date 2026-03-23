import { describe, expect, it } from "vitest";
import {
  classifyPercentageTagDisplay,
  remainingPercentFromBucket,
} from "./bucket-percentage-tag";
import type { EssentialBillBucket } from "./types";

function bill(over: Partial<EssentialBillBucket> = {}): EssentialBillBucket {
  return {
    id: "b1",
    name: "Rent",
    order: 1,
    amount: 10,
    top_off: 100,
    percentage: null,
    type: "essential",
    essential_subtype: "bill",
    due_date: "2026-03-30",
    alert_date: "2026-03-25",
    ...over,
  };
}

describe("remainingPercentFromBucket", () => {
  it("returns null without top_off", () => {
    const b = bill({ top_off: null });
    expect(remainingPercentFromBucket(b)).toBeNull();
  });

  it("clamps 0–100", () => {
    expect(remainingPercentFromBucket(bill({ amount: 150, top_off: 100 }))).toBe(
      100,
    );
    expect(remainingPercentFromBucket(bill({ amount: 0, top_off: 100 }))).toBe(0);
  });

  it("rounds", () => {
    expect(
      remainingPercentFromBucket(bill({ amount: 33.33, top_off: 100 })),
    ).toBe(33);
  });
});

describe("classifyPercentageTagDisplay", () => {
  it("safe at 20%", () => {
    expect(classifyPercentageTagDisplay(20, { kind: "spending" })).toEqual({
      variant: "safe",
      label: "20%",
    });
  });

  it("safe above 20", () => {
    expect(classifyPercentageTagDisplay(80, { kind: "bill", daysUntilDue: 3 })).toEqual({
      variant: "safe",
      label: "80%",
    });
  });

  it("at risk below 20 for spending", () => {
    expect(classifyPercentageTagDisplay(10, { kind: "spending" })).toEqual({
      variant: "atRisk",
      label: "10%",
    });
  });

  it("bill far due uses noValue when below 20", () => {
    expect(
      classifyPercentageTagDisplay(5, { kind: "bill", daysUntilDue: 15 }),
    ).toEqual({
      variant: "noValue",
      label: "5%",
    });
  });

  it("bill due within 14 days at risk when below 20", () => {
    expect(
      classifyPercentageTagDisplay(5, { kind: "bill", daysUntilDue: 14 }),
    ).toEqual({
      variant: "atRisk",
      label: "5%",
    });
    expect(
      classifyPercentageTagDisplay(5, { kind: "bill", daysUntilDue: 3 }),
    ).toEqual({
      variant: "atRisk",
      label: "5%",
    });
  });

  it("bill missing days treated as at risk when below 20", () => {
    expect(classifyPercentageTagDisplay(5, { kind: "bill" })).toEqual({
      variant: "atRisk",
      label: "5%",
    });
  });

  it("returns null when remaining unknown", () => {
    expect(classifyPercentageTagDisplay(null, { kind: "spending" })).toBeNull();
  });
});
