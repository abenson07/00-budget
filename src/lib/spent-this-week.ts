import type { Transaction } from "@/lib/types";

function parseLocalDay(dateStr: string): Date | null {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Start of the calendar week (Sunday 00:00 local). */
function startOfCalendarWeekSunday(reference: Date): Date {
  const d = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Sum of debit amounts whose transaction date falls in the current week (Sun–Sat local), through today. */
export function sumSpentThisCalendarWeek(
  transactions: readonly Transaction[],
  now = new Date(),
): number {
  const weekStart = startOfCalendarWeekSunday(now);
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  let sum = 0;
  for (const tx of transactions) {
    if (tx.spending_type !== "debit") continue;
    const day = parseLocalDay(tx.date);
    if (!day) continue;
    if (day < weekStart || day > todayStart) continue;
    sum += tx.amount;
  }
  return sum;
}
