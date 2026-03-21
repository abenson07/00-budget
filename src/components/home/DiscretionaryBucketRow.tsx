import { discretionaryImageForBucketId } from "@/lib/bucket-row-images";
import { formatUsd } from "@/lib/format";
import { legacyRoutes } from "@/lib/legacy-routes";
import type { Bucket } from "@/lib/types";
import { BucketListCardRow } from "./BucketListCardRow";

type DiscretionaryBucketRowProps = { bucket: Bucket };

/** Discretionary bucket row — Figma BucketCard / list variant (not condensed default). */
export function DiscretionaryBucketRow({ bucket }: DiscretionaryBucketRowProps) {
  const src = discretionaryImageForBucketId(bucket.id);
  const goalLine =
    bucket.top_off != null ? `Goal: ${formatUsd(bucket.top_off)}` : undefined;

  return (
    <BucketListCardRow
      href={legacyRoutes.bucket(bucket.id)}
      imageSrc={src}
      title={bucket.name}
      primaryRight={formatUsd(bucket.amount)}
      secondaryRight={goalLine}
      primaryRightSize="lg"
      showChevron
    />
  );
}
