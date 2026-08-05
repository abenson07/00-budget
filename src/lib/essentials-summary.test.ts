import { describe, expect, it } from "vitest";
import { buildEssentialsSummary } from "./essentials-summary";
import type { Bucket } from "./types";

describe("buildEssentialsSummary", () => {
  it("flags allOnTrack false when a bill is atRisk", () => {
    const buckets: Bucket[] = [
      {
        id: "1",
        name: "Rent",
        order: 0,
        amount: 1800,
        top_off: 1800,
        percentage: null,
        type: "essential",
        essential_subtype: "bill",
        due_date: "2026-12-01",
        alert_date: "2026-11-28",
      },
      {
        id: "2",
        name: "Utilities",
        order: 1,
        amount: 18,
        top_off: 180,
        percentage: null,
        type: "essential",
        essential_subtype: "bill",
        due_date: "2026-08-10",
        alert_date: "2026-08-07",
      },
    ];
    const now = new Date("2026-08-05");
    const summary = buildEssentialsSummary(buckets, now);
    expect(summary.allOnTrack).toBe(false);
    expect(summary.essentialLines).toHaveLength(2);
    expect(summary.essentialLines[1]!.percentageTagVariant).toBe("atRisk");
  });
});
