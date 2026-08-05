import { smoothingAmounts } from "./bill-smoothing";
import { biweeklyPerPaycheckAmount } from "./biweekly-savings-breakdown";
import { discretionaryPriorityList } from "./discretionary-priority";
import { isUnassignedBucket } from "./unassigned-bucket";
import type { Bucket, EssentialBillBucket } from "./types";
import type { PaycheckMode } from "./paycheck-allocation";

export type AllocationStep = "essentials" | "recovery" | "goals" | "topoff" | "surplus";
export type AllocationLineItem = {
  bucketId: string;
  bucketName: string;
  amountAdded: number;
  step: AllocationStep;
};

function isBillBucket(b: Bucket): b is EssentialBillBucket {
  return b.type === "essential" && b.essential_subtype === "bill";
}

export function runPaycheckAllocation(
  buckets: Bucket[],
  incomeAmount: number,
  slot: Extract<PaycheckMode, "paycheck_1" | "paycheck_2">,
  now: Date,
): { buckets: Bucket[]; lineItems: AllocationLineItem[] } {
  let pool = Math.max(0, incomeAmount);
  const lineItems: AllocationLineItem[] = [];
  const byId = new Map(buckets.map((b) => [b.id, { ...b }]));

  const credit = (id: string, amount: number, step: AllocationStep) => {
    if (amount <= 0) return;
    const b = byId.get(id)!;
    b.amount += amount;
    pool -= amount;
    lineItems.push({ bucketId: id, bucketName: b.name, amountAdded: amount, step });
  };

  // 1. Essential bills (smoothing included), due-date ascending.
  const bills = buckets.filter(isBillBucket).sort((a, b) => (a.due_date < b.due_date ? -1 : 1));
  for (const bill of bills) {
    if (pool <= 0) break;
    const { paycheck1Amount, paycheck2Amount } = smoothingAmounts(bill);
    const target = slot === "paycheck_1" ? paycheck1Amount : paycheck2Amount;
    credit(bill.id, Math.min(target, pool), "essentials");
  }

  // 2. Overage recovery, essential buckets with amount < 0, order ascending.
  const overspent = buckets
    .filter((b) => b.type === "essential" && b.amount < 0)
    .sort((a, b) => a.order - b.order);
  for (const b of overspent) {
    if (pool <= 0) break;
    credit(b.id, Math.min(-b.amount, pool), "recovery");
  }

  // 3. Savings goals.
  const goalBuckets = discretionaryPriorityList(buckets).filter(
    (b) => b.type === "discretionary" && b.goal_target_date && b.top_off != null,
  );
  for (const b of goalBuckets) {
    if (pool <= 0) break;
    if (b.type !== "discretionary" || b.top_off == null || !b.goal_target_date) continue;
    const { perPaycheck } = biweeklyPerPaycheckAmount(b.top_off, b.goal_target_date, now);
    const remainingToGoal = Math.max(0, b.top_off - b.amount);
    credit(b.id, Math.min(perPaycheck, remainingToGoal, pool), "goals");
  }

  // 4. Discretionary top-offs (no goal date), excluding Unassigned.
  const topoffBuckets = discretionaryPriorityList(buckets).filter(
    (b): b is Bucket & { type: "discretionary" } =>
      b.type === "discretionary" && !b.goal_target_date && b.top_off != null && !isUnassignedBucket(b),
  );
  for (const b of topoffBuckets) {
    if (pool <= 0) break;
    if (b.top_off == null) continue;
    const remaining = Math.max(0, b.top_off - b.amount);
    credit(b.id, Math.min(remaining, pool), "topoff");
  }

  // 5. Surplus → Unassigned.
  const unassigned = buckets.find(isUnassignedBucket);
  if (unassigned && pool > 0) {
    credit(unassigned.id, pool, "surplus");
  }

  return { buckets: Array.from(byId.values()), lineItems };
}
