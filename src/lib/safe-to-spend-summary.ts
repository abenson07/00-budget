import { computeSafeToSpendMetrics } from "./allocation";
import { daysUntilLocalDate } from "./essentials-dates";
import { formatUsd } from "./format";
import type { Bucket } from "./types";

export function paycheckLineFor(nextPaycheckDate: string | null, now: Date): string {
  if (!nextPaycheckDate) return "Add your next paycheck date";
  const days = daysUntilLocalDate(nextPaycheckDate, now);
  if (days < 0) return "Update your paycheck date";
  if (days === 0) return "Your paycheck is due today";
  if (days === 1) return "1 day until your next paycheck";
  return `${days} days until your next paycheck`;
}

export function safeToSpendHeadline(buckets: Bucket[]): { headline: string; amount: string } {
  return { headline: "Safe to spend", amount: formatUsd(computeSafeToSpendMetrics(buckets).primary) };
}
