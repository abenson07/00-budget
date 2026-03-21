import { parseIsoLocalMs } from "./dates";
import type { Bucket } from "./types";

export type BucketMetadataInput = {
  name: string;
  order: number;
  type: "discretionary" | "essential";
  essential_subtype: "bill" | "essential_spending";
  due_date: string;
  alert_date: string;
  top_off: number | null;
  /** Fraction 0–1 (e.g. 0.12 = 12%). */
  percentage: number | null;
  /** Discretionary savings goal target; stored as DB `due_date`. */
  goal_target_date: string;
};

export function applyBucketMetadata(
  prev: Bucket,
  input: BucketMetadataInput,
): Bucket {
  const base = {
    id: prev.id,
    name: input.name.trim(),
    order: Math.round(input.order),
    amount: prev.amount,
    top_off: input.top_off,
    percentage: input.percentage,
  };

  if (input.type === "discretionary") {
    const g = input.goal_target_date.trim();
    return {
      ...base,
      type: "discretionary" as const,
      goal_target_date: g !== "" ? g : null,
    };
  }

  if (input.essential_subtype === "bill") {
    return {
      ...base,
      type: "essential" as const,
      essential_subtype: "bill" as const,
      due_date: input.due_date.trim(),
      alert_date: input.alert_date.trim(),
    };
  }

  return {
    ...base,
    type: "essential" as const,
    essential_subtype: "essential_spending" as const,
  };
}

export function validateBucketMetadata(input: BucketMetadataInput): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push("Name is required");
  if (!Number.isFinite(input.order)) errors.push("Order must be a number");
  if (input.type === "essential" && input.essential_subtype === "bill") {
    if (!input.due_date.trim()) errors.push("Due date is required for bill buckets");
    if (!input.alert_date.trim()) {
      errors.push("Alert date is required for bill buckets");
    } else if (input.due_date.trim()) {
      const dueMs = parseIsoLocalMs(input.due_date);
      const alertMs = parseIsoLocalMs(input.alert_date);
      if (dueMs == null) errors.push("Due date is not a valid calendar date");
      if (alertMs == null) errors.push("Alert date is not a valid calendar date");
      if (dueMs != null && alertMs != null && alertMs >= dueMs) {
        errors.push("Alert date must be before the due date");
      }
    }
  }
  if (input.top_off != null) {
    if (!Number.isFinite(input.top_off) || input.top_off < 0) {
      errors.push("Top off must be empty or a non-negative amount");
    }
  }
  if (input.percentage != null) {
    if (!Number.isFinite(input.percentage) || input.percentage < 0 || input.percentage > 1) {
      errors.push("Percentage must be between 0% and 100%");
    }
  }
  if (input.type === "discretionary" && input.goal_target_date.trim()) {
    const ms = parseIsoLocalMs(input.goal_target_date.trim());
    if (ms == null) errors.push("Goal target date is not a valid calendar date");
  }
  return errors;
}
