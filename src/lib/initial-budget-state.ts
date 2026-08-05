import { daysUntilLocalDate } from "./essentials-dates";
import type { Transaction } from "./types";

export type InitialBudgetState = {
  currentCash: number;
  estimatedObligations: number;
  availableToAllocate: number;
  daysUntilPaycheck: number;
  obligationMerchants: { merchant: string; amount: number }[];
};

export function estimateObligations(
  transactions: Transaction[],
): { total: number; merchants: { merchant: string; amount: number }[] } {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const key = tx.merchant.trim().toLowerCase();
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }
  const merchants: { merchant: string; amount: number }[] = [];
  for (const [, txs] of groups) {
    if (txs.length < 2) continue;
    const mostRecent = [...txs].sort((a, b) => (a.date < b.date ? 1 : -1))[0]!;
    if (mostRecent.amount < 50) continue;
    merchants.push({ merchant: mostRecent.merchant, amount: mostRecent.amount });
  }
  const total = merchants.reduce((s, m) => s + m.amount, 0);
  return { total, merchants };
}

export function computeInitialBudgetState(
  importedTransactions: Transaction[],
  currentCash: number,
  nextPaycheckDate: string,
  today: Date,
): InitialBudgetState {
  const { total, merchants } = estimateObligations(importedTransactions);
  const availableToAllocate = Math.max(0, currentCash - total);
  return {
    currentCash,
    estimatedObligations: total,
    availableToAllocate,
    daysUntilPaycheck: daysUntilLocalDate(nextPaycheckDate, today),
    obligationMerchants: merchants,
  };
}
