import { computeFixtureShiftDays, shiftIsoDate } from "./fixtures/shift-fixture-dates";
import { DEMO_TRANSACTION_HISTORY_ROWS } from "./fixtures/demo-transaction-history";
import type { Transaction } from "./types";

export function generateImportedTransactions(accountId: string, today: Date): Transaction[] {
  const debitRows = DEMO_TRANSACTION_HISTORY_ROWS.filter((r) => r[3] === "debit");
  const lastDate = DEMO_TRANSACTION_HISTORY_ROWS.reduce((max, r) => (r[0] > max ? r[0] : max), "");
  const deltaDays = computeFixtureShiftDays(lastDate, today);
  return debitRows
    .map(([date, merchant, amount]) => ({
      id: crypto.randomUUID(),
      account_id: accountId,
      amount: Math.abs(amount),
      merchant,
      date: shiftIsoDate(date, deltaDays),
      spending_type: "debit" as const,
      status: "cleared" as const,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
