import { addDaysToIsoLocal, parseIsoLocalMs } from "./dates";
import type { IncomeEvent, PayCadence } from "./types";

export function detectCadence(events: IncomeEvent[]): { cadence: PayCadence; averageGapDays: number | null } {
  if (events.length < 2) return { cadence: "unknown", averageGapDays: null };
  const sorted = [...events].sort((a, b) => (a.date < b.date ? -1 : 1));
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevMs = parseIsoLocalMs(sorted[i - 1]!.date);
    const curMs = parseIsoLocalMs(sorted[i]!.date);
    if (prevMs == null || curMs == null) continue;
    gaps.push((curMs - prevMs) / 86_400_000);
  }
  if (gaps.length === 0) return { cadence: "unknown", averageGapDays: null };
  const avg = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const cadence: PayCadence = avg < 10 ? "weekly" : avg <= 20 ? "biweekly" : "monthly";
  return { cadence, averageGapDays: Math.round(avg) };
}

export function projectNextPaycheckDate(events: IncomeEvent[], averageGapDays: number): string | null {
  if (events.length === 0) return null;
  const sorted = [...events].sort((a, b) => (a.date < b.date ? -1 : 1));
  const mostRecent = sorted[sorted.length - 1]!.date;
  return addDaysToIsoLocal(mostRecent, averageGapDays);
}
