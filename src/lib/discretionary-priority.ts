import { isUnassignedBucket } from "./unassigned-bucket";
import type { Bucket } from "./types";

export function discretionaryPriorityList(buckets: Bucket[]): Bucket[] {
  return [...buckets]
    .filter((b) => b.type === "discretionary" && !isUnassignedBucket(b))
    .sort((a, b) => a.order - b.order);
}

export function swapOrderWithNeighbor(
  buckets: Bucket[],
  bucketId: string,
  direction: "up" | "down",
): { id: string; order: number }[] | null {
  const list = discretionaryPriorityList(buckets);
  const idx = list.findIndex((b) => b.id === bucketId);
  if (idx === -1) return null;
  const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
  if (neighborIdx < 0 || neighborIdx >= list.length) return null;
  const a = list[idx]!;
  const b = list[neighborIdx]!;
  return [
    { id: a.id, order: b.order },
    { id: b.id, order: a.order },
  ];
}
