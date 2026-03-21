import type { Bucket } from "./types";

export const UNASSIGNED_BUCKET_NAME = "Unassigned" as const;

/** System catch-all bucket — hide from bucket browse lists; still use in transfers / splits. */
export function isUnassignedBucket(bucket: Pick<Bucket, "name">): boolean {
  return bucket.name === UNASSIGNED_BUCKET_NAME;
}
