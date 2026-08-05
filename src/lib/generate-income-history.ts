import { computeFixtureShiftDays, shiftIsoDate } from "./fixtures/shift-fixture-dates";
import { DEMO_TRANSACTION_HISTORY_ROWS } from "./fixtures/demo-transaction-history";
import type { IncomeEvent } from "./types";

export function generateIncomeHistory(accountId: string, today: Date): IncomeEvent[] {
  const creditRows = DEMO_TRANSACTION_HISTORY_ROWS.filter((r) => r[3] === "credit");
  const lastDate = DEMO_TRANSACTION_HISTORY_ROWS.reduce((max, r) => (r[0] > max ? r[0] : max), "");
  const deltaDays = computeFixtureShiftDays(lastDate, today);
  return creditRows
    .map(([date, merchant, amount]) => ({
      id: crypto.randomUUID(),
      account_id: accountId,
      amount,
      source: merchant,
      date: shiftIsoDate(date, deltaDays),
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
