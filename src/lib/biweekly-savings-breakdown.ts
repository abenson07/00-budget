/** Whole calendar days from today to target (local midnight), floored at 0. */
export function calendarDaysUntil(targetIso: string, from = new Date()): number {
  const parts = targetIso.trim().split("-").map(Number);
  if (parts.length !== 3) return 0;
  const [y, m, d] = parts;
  if (!y || !m || !d) return 0;
  const target = new Date(y, m - 1, d);
  const startFrom = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate(),
  );
  const startTarget = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  return Math.max(
    0,
    Math.round((startTarget.getTime() - startFrom.getTime()) / 86400000),
  );
}

/**
 * Assumes one deposit every 14 days. Returns an even per-paycheck amount
 * (same value for "paycheck 1" and "paycheck 2" in an alternating schedule).
 */
export function biweeklyPerPaycheckAmount(
  goalDollars: number,
  targetIso: string,
  from = new Date(),
): { daysUntil: number; paychecksUntil: number; perPaycheck: number } {
  const daysUntil = calendarDaysUntil(targetIso, from);
  const paychecksUntil = Math.max(1, Math.ceil(daysUntil / 14));
  const perPaycheck = goalDollars / paychecksUntil;
  return { daysUntil, paychecksUntil, perPaycheck };
}
