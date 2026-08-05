import { addDaysToIsoLocal, parseIsoLocalMs } from "@/lib/dates";

/** Days to add to every fixture date so the fixture's last row lands on `anchorOffsetDays` before `today`. */
export function computeFixtureShiftDays(
  fixtureLastDate: string,
  today: Date,
  anchorOffsetDays = 1,
): number {
  const lastMs = parseIsoLocalMs(fixtureLastDate)!;
  const todayIso = today.toISOString().slice(0, 10);
  const todayMs = parseIsoLocalMs(todayIso)!;
  const targetMs = todayMs - anchorOffsetDays * 86_400_000;
  return Math.round((targetMs - lastMs) / 86_400_000);
}

export function shiftIsoDate(iso: string, deltaDays: number): string {
  return addDaysToIsoLocal(iso, deltaDays) ?? iso;
}
