import { parseIsoLocalMs } from "./dates";
import { formatUsd } from "./format";
import type { Bucket } from "./types";

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Subtitle line for an essential row in home drawer / lists. */
export function essentialRowSubtitle(bucket: Bucket): string | null {
  if (bucket.type !== "essential") return null;
  if (bucket.essential_subtype === "bill") {
    const dueMs = parseIsoLocalMs(bucket.due_date);
    if (dueMs == null) return null;
    const days = Math.round((dueMs - startOfTodayMs()) / 86_400_000);
    if (days === 0) return "Due today";
    if (days === 1) return "Due in 1 day";
    if (days > 1) return `Due in ${days} days`;
    if (days === -1) return "Due 1 day ago";
    return `Due ${Math.abs(days)} days ago`;
  }
  if (bucket.top_off != null) return `Goal: ${formatUsd(bucket.top_off)}`;
  return null;
}
