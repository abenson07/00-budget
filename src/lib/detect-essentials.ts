import type { DiscretionaryBucket, EssentialBillBucket } from "./types";

function isoDatePlusDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function detectEssentialCandidates(
  obligationMerchants: { merchant: string; amount: number }[],
  today: Date,
): EssentialBillBucket[] {
  const dueDate = isoDatePlusDays(today, 30);
  const alertDate = isoDatePlusDays(today, 27);
  return obligationMerchants.map((m, i) => ({
    id: crypto.randomUUID(),
    name: m.merchant,
    order: (i + 1) * 10,
    amount: m.amount,
    top_off: m.amount,
    percentage: null,
    type: "essential" as const,
    essential_subtype: "bill" as const,
    due_date: dueDate,
    alert_date: alertDate,
  }));
}

export function buildDiscretionaryCandidate(availableToAllocate: number): DiscretionaryBucket {
  return {
    id: crypto.randomUUID(),
    name: "Unassigned",
    order: 0,
    amount: availableToAllocate,
    top_off: availableToAllocate,
    percentage: null,
    type: "discretionary" as const,
    goal_target_date: null,
    locked: false,
  };
}
