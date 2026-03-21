import { getEffectiveSplits } from "@/lib/allocation";
import type { Bucket, Transaction } from "@/lib/types";

export function txAllocationLabel(
  tx: Transaction,
  getBucketById: (id: string) => Bucket | undefined,
): string {
  const eff = getEffectiveSplits(tx);
  const names = eff
    .map((s) => getBucketById(s.bucketId)?.name)
    .filter(Boolean) as string[];
  if (names.length === 0) return "Unassigned";
  if (names.length === 1) return names[0]!;
  return names.join(" · ");
}
