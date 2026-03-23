"use client";

import { useMemo } from "react";
import { PercentageTag } from "@/components/design-system/PercentageTag";
import { essentialImageForBucketId } from "@/lib/bucket-row-images";
import { percentageTagForBucket } from "@/lib/bucket-percentage-tag";
import { dueLabelForBill } from "@/lib/essentials-dates";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import type { Bucket } from "@/lib/types";
import { BucketListCardRow } from "./BucketListCardRow";

type EssentialBucketCardProps = {
  bucket: Bucket;
  /** List screens often hide the chevron (drawers, inline stacks). */
  showChevron?: boolean;
};

/**
 * Figma: Bucket – Monthly Spending / Bucket – Bill (horizontal list tile).
 * Bills add a due line under the amount + percentage tag.
 */
export function EssentialBucketCard({
  bucket,
  showChevron = true,
}: EssentialBucketCardProps) {
  const now = useMemo(() => new Date(), []);
  const imageSrc = essentialImageForBucketId(bucket.id);
  const tag = percentageTagForBucket(bucket, now);

  const isBill =
    bucket.type === "essential" && bucket.essential_subtype === "bill";
  const dueLine = isBill ? dueLabelForBill(bucket.due_date, now) : undefined;

  const subtitle =
    bucket.type === "essential"
      ? bucket.top_off != null
        ? `${formatUsd(bucket.top_off)} per paycheck`
        : isBill
          ? undefined
          : "Essential spending"
      : undefined;

  return (
    <BucketListCardRow
      href={appRoutes.bucket(bucket.id)}
      imageSrc={imageSrc}
      title={bucket.name}
      subtitleLeft={subtitle}
      primaryRight={formatUsd(bucket.amount)}
      secondaryRight={dueLine}
      trailingTag={
        tag ? (
          <PercentageTag variant={tag.variant}>{tag.label}</PercentageTag>
        ) : null
      }
      primaryRightSize="lg"
      showChevron={showChevron}
    />
  );
}
