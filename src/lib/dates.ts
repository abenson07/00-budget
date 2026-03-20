/** Parse `YYYY-MM-DD` as a local calendar date; returns ms at local midnight or null if invalid. */
export function parseIsoLocalMs(iso: string): number | null {
  const t = iso.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const [y, m, d] = t.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return null;
  }
  return dt.getTime();
}

/** Add days to a local `YYYY-MM-DD`; returns `YYYY-MM-DD` or null if input is invalid. */
export function addDaysToIsoLocal(iso: string, deltaDays: number): string | null {
  const ms = parseIsoLocalMs(iso);
  if (ms == null) return null;
  const dt = new Date(ms);
  dt.setDate(dt.getDate() + deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
