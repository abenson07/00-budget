import { paycheckModeToBucketPercentage } from "@/lib/paycheck-allocation";
import type { ActiveNewBucketWizard } from "@/state/new-bucket-wizard-store";
import type { Bucket, Transaction } from "@/lib/types";

export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export function buildBucketFromWizard(
  w: ActiveNewBucketWizard,
  nextOrder: number,
  transactions: Transaction[],
): Bucket {
  const baseId = crypto.randomUUID();

  if (w.category === "upcoming_bills") {
    const tx = w.billTransactionId
      ? transactions.find((t) => t.id === w.billTransactionId)
      : undefined;
    const name =
      tx?.merchant?.trim() ||
      w.billPresetLabel?.trim() ||
      "Bill";
    const topOff = tx
      ? tx.amount
      : Math.max(0, centsToDollars(w.billManualAmountCents));
    const pct = paycheckModeToBucketPercentage(
      w.paycheckMode,
      w.paycheckSplit,
    );
    return {
      id: baseId,
      name,
      type: "essential",
      essential_subtype: "bill",
      order: nextOrder,
      amount: 0,
      top_off: topOff > 0 ? topOff : null,
      percentage: pct,
      due_date: w.dueDate.trim(),
      alert_date: w.alertDate.trim(),
    };
  }

  if (w.category === "essential_spending") {
    const label = w.subcategoryLabel?.trim() || "Essential";
    const dollars = Math.max(0, centsToDollars(w.keypadCents));
    return {
      id: baseId,
      name: label,
      type: "essential",
      essential_subtype: "essential_spending",
      order: nextOrder,
      amount: dollars,
      top_off: dollars > 0 ? dollars : null,
      percentage: null,
    };
  }

  if (w.category === "spending_money") {
    const label = w.subcategoryLabel?.trim() || "Spending";
    const dollars = Math.max(0, centsToDollars(w.keypadCents));
    return {
      id: baseId,
      name: label,
      type: "discretionary",
      order: nextOrder,
      amount: dollars,
      top_off: dollars > 0 ? dollars : null,
      percentage: null,
      goal_target_date: null,
    };
  }

  // future_planning
  const name = w.goalName.trim() || "Savings goal";
  const dollars = Math.max(0, centsToDollars(w.keypadCents));
  const gtd = w.targetPurchaseDate.trim();
  return {
    id: baseId,
    name,
    type: "discretionary",
    order: nextOrder,
    amount: dollars,
    top_off: dollars > 0 ? dollars : null,
    percentage: null,
    goal_target_date: gtd !== "" ? gtd : null,
  };
}
