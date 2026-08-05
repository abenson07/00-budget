import { describe, expect, it } from "vitest";
import { detectCadence, projectNextPaycheckDate } from "./pay-cadence";
import type { IncomeEvent } from "./types";

function event(id: string, date: string): IncomeEvent {
  return { id, account_id: "acct1", amount: 2000, source: "Paycheck", date };
}

describe("detectCadence", () => {
  it("detects biweekly cadence from 14-day-spaced events", () => {
    const events = [
      event("1", "2026-06-05"),
      event("2", "2026-06-19"),
      event("3", "2026-07-03"),
      event("4", "2026-07-17"),
      event("5", "2026-07-31"),
      event("6", "2026-08-14"),
    ];
    expect(detectCadence(events)).toEqual({ cadence: "biweekly", averageGapDays: 14 });
  });

  it("returns unknown for fewer than 2 events", () => {
    expect(detectCadence([event("1", "2026-06-05")])).toEqual({
      cadence: "unknown",
      averageGapDays: null,
    });
  });
});

describe("projectNextPaycheckDate", () => {
  it("projects 14 days after the most recent event", () => {
    const events = [event("1", "2026-08-14"), event("2", "2026-07-31")];
    expect(projectNextPaycheckDate(events, 14)).toBe("2026-08-28");
  });
});
