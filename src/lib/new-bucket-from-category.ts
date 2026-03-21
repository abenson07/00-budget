import { addDaysToIsoLocal } from "./dates";
import type { Bucket } from "./types";

export type NewBucketCategoryId =
  | "upcoming_bills"
  | "essential_spending"
  | "future_planning"
  | "spending_money";

function localIsoDate(d: Date): string {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function buildNewBucketFromCategory(
  category: NewBucketCategoryId,
  nextOrder: number,
): Bucket {
  const base = {
    id: crypto.randomUUID(),
    order: nextOrder,
    amount: 0,
    top_off: null,
    percentage: null,
  };

  switch (category) {
    case "upcoming_bills": {
      const today = localIsoDate(new Date());
      const due = addDaysToIsoLocal(today, 14);
      const alert = addDaysToIsoLocal(today, 7);
      return {
        ...base,
        name: "Upcoming bills",
        type: "essential",
        essential_subtype: "bill",
        due_date: due ?? today,
        alert_date: alert ?? today,
      };
    }
    case "essential_spending":
      return {
        ...base,
        name: "Essential spending",
        type: "essential",
        essential_subtype: "essential_spending",
      };
    case "future_planning":
      return {
        ...base,
        name: "Future planning",
        type: "discretionary",
        goal_target_date: null,
      };
    case "spending_money":
      return {
        ...base,
        name: "Spending money",
        type: "discretionary",
        goal_target_date: null,
      };
  }
}

export function nextBucketSortOrder(buckets: { order: number }[]): number {
  if (buckets.length === 0) return 0;
  return Math.max(...buckets.map((b) => b.order)) + 10;
}
