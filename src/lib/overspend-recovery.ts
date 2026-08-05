import { discretionaryPriorityList } from "./discretionary-priority";
import { isUnassignedBucket } from "./unassigned-bucket";
import type { Bucket, DiscretionaryBucket } from "./types";

export const ESSENTIAL_VARIANCE_THRESHOLD = 20;

export function essentialRecoveryPlan(
  buckets: Bucket[],
  essentialBucketId: string,
): { coverFromId: string; amount: number } | null {
  const bucket = buckets.find((b) => b.id === essentialBucketId);
  if (!bucket || bucket.amount >= 0) return null;
  const shortfall = -bucket.amount;
  if (shortfall > ESSENTIAL_VARIANCE_THRESHOLD) return null;
  const unassigned = buckets.find(isUnassignedBucket);
  if (!unassigned || unassigned.amount < shortfall) return null;
  return { coverFromId: unassigned.id, amount: shortfall };
}

export function discretionaryRecoveryPlan(
  buckets: Bucket[],
  overspentBucketId: string,
): { coverFromId: string; amount: number } | null {
  const bucket = buckets.find((b) => b.id === overspentBucketId);
  if (!bucket || bucket.type !== "discretionary" || bucket.amount >= 0) return null;
  const shortfall = -bucket.amount;
  const candidates = discretionaryPriorityList(buckets)
    .filter(
      (b): b is DiscretionaryBucket =>
        b.type === "discretionary" &&
        b.id !== overspentBucketId &&
        !b.locked &&
        b.amount >= shortfall,
    )
    .reverse();
  const candidate = candidates[0];
  return candidate ? { coverFromId: candidate.id, amount: shortfall } : null;
}
