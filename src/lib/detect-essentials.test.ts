import { describe, expect, it } from "vitest";
import { buildDiscretionaryCandidate, detectEssentialCandidates } from "./detect-essentials";

describe("detectEssentialCandidates", () => {
  it("builds a bill bucket with a +30/+27 day due/alert placeholder", () => {
    const result = detectEssentialCandidates(
      [{ merchant: "Netflix", amount: 15.99 }],
      new Date("2026-01-01"),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: "Netflix",
      amount: 15.99,
      top_off: 15.99,
      essential_subtype: "bill",
      due_date: "2026-01-31",
      alert_date: "2026-01-28",
    });
  });
});

describe("buildDiscretionaryCandidate", () => {
  it("builds the Unassigned discretionary candidate", () => {
    const result = buildDiscretionaryCandidate(340.5);
    expect(result).toMatchObject({
      name: "Unassigned",
      amount: 340.5,
      top_off: 340.5,
      type: "discretionary",
      locked: false,
    });
  });
});
