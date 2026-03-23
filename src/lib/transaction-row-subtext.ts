import { getEffectiveSplits } from "./allocation";
import type { Transaction } from "./types";

export function transactionHasMultipleAllocations(tx: Transaction): boolean {
  return getEffectiveSplits(tx).length > 1;
}

/**
 * Home / global transaction list: only show subtext for split txs (Figma: "% of transaction").
 * Uses the smallest slice as a percent so a 88/12 split reads as "12% of transaction".
 */
export function transactionListSplitSubtext(tx: Transaction): string | null {
  const eff = getEffectiveSplits(tx);
  if (eff.length <= 1 || tx.amount <= 0) return null;
  const pcts = eff.map((s) => Math.round((s.amount / tx.amount) * 100));
  const minPct = Math.min(...pcts);
  return `${minPct}% of transaction`;
}

/** Bucket detail allocation row: "% of transaction" when the tx is split. */
export function bucketAllocationSplitSubtext(
  tx: Transaction,
  bucketAmount: number,
): string | null {
  if (!transactionHasMultipleAllocations(tx) || tx.amount <= 0) return null;
  const pct = Math.round((bucketAmount / tx.amount) * 100);
  return `${pct}% of transaction`;
}
