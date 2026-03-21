import type { Bucket, EssentialBillBucket } from "./types";

function isEssentialBill(b: Bucket): b is EssentialBillBucket {
  return b.type === "essential" && b.essential_subtype === "bill";
}

function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole days from `now`'s local calendar day until `iso` (YYYY-MM-DD), negative if past. */
export function daysUntilLocalDate(iso: string, now: Date): number {
  const target = startOfLocalDay(parseLocalDate(iso)).getTime();
  const today = startOfLocalDay(now).getTime();
  return Math.round((target - today) / 86_400_000);
}

/** Subtitle for an essential bill row, e.g. "Due in 3 days". */
export function dueLabelForBill(dueDate: string, now: Date): string {
  const days = daysUntilLocalDate(dueDate, now);
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

/**
 * Hero line under the essentials total (Figma: "2 days until your next bill").
 * Uses the nearest bill due on or after today; if none, a fallback string.
 */
export function nextBillHeroLine(buckets: Bucket[], now: Date): string {
  const bills = buckets.filter(isEssentialBill);
  if (bills.length === 0) return "No bills in essentials";

  const today = startOfLocalDay(now).getTime();
  let bestFuture: Date | null = null;
  for (const b of bills) {
    const t = startOfLocalDay(parseLocalDate(b.due_date)).getTime();
    if (t >= today && (bestFuture === null || t < bestFuture.getTime())) {
      bestFuture = new Date(t);
    }
  }

  if (bestFuture) {
    const days = Math.round(
      (bestFuture.getTime() - today) / 86_400_000,
    );
    if (days === 0) return "Due today";
    if (days === 1) return "1 day until your next bill";
    return `${days} days until your next bill`;
  }

  return "No upcoming bills";
}
