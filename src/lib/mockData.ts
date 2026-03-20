import type { MockDataset, TransactionSplit } from "./types";
import { assertDatasetSplitIntegrity } from "./validation";

/** Mulberry32 — same seed ⇒ same sequence (optional variation hook). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function splitPercentages(amounts: number[], total: number): number[] {
  if (total <= 0) return amounts.map(() => 0);
  return amounts.map((a) => a / total);
}

function buildSplits(
  pairs: [string, number][],
  totalAmount: number,
): TransactionSplit[] {
  const amounts = pairs.map(([, a]) => a);
  const pcts = splitPercentages(amounts, totalAmount);
  return pairs.map(([bucketId, amount], i) => ({
    bucketId,
    amount,
    percentage: pcts[i],
  }));
}

/**
 * Deterministic demo dataset. `seed` nudges discretionary “Fun” money so
 * runs are repeatable per seed.
 */
export function createMockDataset(seed = 42): MockDataset {
  const rng = mulberry32(seed);
  const funNudge = Math.round(rng() * 500) / 100;

  const accountId = "acc-demo";
  const bucketUnassigned = "bucket-unassigned";
  const bucketRent = "bucket-rent";
  const bucketGroceries = "bucket-groceries";
  const bucketFun = "bucket-fun";
  const bucketUtilities = "bucket-utilities";

  const account = { id: accountId, name: "Main checking" };

  const buckets: MockDataset["buckets"] = [
    {
      id: bucketUnassigned,
      name: "Unassigned",
      type: "discretionary",
      order: 0,
      amount: 120.5 + funNudge * 0.1,
      top_off: null,
      percentage: null,
    },
    {
      id: bucketRent,
      name: "Rent",
      type: "essential",
      essential_subtype: "bill",
      order: 10,
      amount: 1800,
      top_off: 1800,
      percentage: null,
      due_date: "2025-04-01",
      alert_date: "2025-03-28",
    },
    {
      id: bucketUtilities,
      name: "Utilities",
      type: "essential",
      essential_subtype: "bill",
      order: 20,
      amount: 185.33,
      top_off: 220,
      percentage: null,
      due_date: "2025-04-15",
      alert_date: "2025-04-10",
    },
    {
      id: bucketGroceries,
      name: "Groceries",
      type: "essential",
      essential_subtype: "essential_spending",
      order: 30,
      amount: 340,
      top_off: 400,
      percentage: 0.12,
    },
    {
      id: bucketFun,
      name: "Fun",
      type: "discretionary",
      order: 40,
      amount: 95 + funNudge,
      top_off: 150,
      percentage: null,
    },
  ];

  const splitTotal = 87.25;
  const splitAmounts: [string, number][] = [
    [bucketGroceries, 52.0],
    [bucketFun, 35.25],
  ];

  const transactions: MockDataset["transactions"] = [
    {
      id: "tx-grocery-run",
      account_id: accountId,
      amount: splitTotal,
      merchant: "Whole Foods",
      date: "2025-03-18",
      spending_type: "debit",
      splits: buildSplits(splitAmounts, splitTotal),
    },
    {
      id: "tx-coffee",
      account_id: accountId,
      amount: 6.5,
      merchant: "Daily Grind",
      date: "2025-03-17",
      spending_type: "debit",
      splits: buildSplits([[bucketFun, 6.5]], 6.5),
    },
    {
      id: "tx-netflix",
      account_id: accountId,
      amount: 15.99,
      merchant: "Netflix",
      date: "2025-03-14",
      spending_type: "debit",
      splits: buildSplits([[bucketUtilities, 15.99]], 15.99),
    },
  ];

  assertDatasetSplitIntegrity(transactions, buckets);

  return { account, buckets, transactions };
}
