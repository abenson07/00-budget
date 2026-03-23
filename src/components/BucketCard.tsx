"use client";

import {
  DiscretionaryBucketRow,
  EssentialBucketCard,
} from "@/components/home";
import { isUnassignedBucket } from "@/lib/unassigned-bucket";
import type { Bucket } from "@/lib/types";

export type BucketKindTag = "Unassigned" | "Essential" | "Discretionary";

export function bucketKindTag(bucket: Bucket): BucketKindTag {
  if (isUnassignedBucket(bucket)) return "Unassigned";
  if (bucket.type === "essential") return "Essential";
  return "Discretionary";
}

export function BucketCard({ bucket }: { bucket: Bucket }) {
  return bucket.type === "essential" ? (
    <EssentialBucketCard bucket={bucket} />
  ) : (
    <DiscretionaryBucketRow bucket={bucket} />
  );
}
