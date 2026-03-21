import { ESSENTIALS_LIST_IMAGE } from "@/lib/bucket-row-images";
import { formatUsd } from "@/lib/format";
import type { Bucket } from "@/lib/types";
import { BucketListCardRow } from "./BucketListCardRow";

type EssentialsSummaryRowProps = {
  essentialBuckets: Bucket[];
};

function aggregateGoalLine(buckets: Bucket[]): string | undefined {
  const essentials = buckets.filter((b) => b.type === "essential");
  const withGoal = essentials.filter((b) => b.top_off != null);
  if (withGoal.length === 0) return undefined;
  const sum = withGoal.reduce((s, b) => s + (b.top_off ?? 0), 0);
  return `Goal: ${formatUsd(sum)}`;
}

/** Aggregated essentials row — matches Figma list card (Hold to reveal + goal). */
export function EssentialsSummaryRow({
  essentialBuckets,
}: EssentialsSummaryRowProps) {
  const goalLine = aggregateGoalLine(essentialBuckets);

  return (
    <BucketListCardRow
      href="/buckets/essentials"
      imageSrc={ESSENTIALS_LIST_IMAGE}
      title="Essentials"
      primaryRight="Hold to reveal"
      secondaryRight={goalLine}
      primaryRightSize="md"
      showChevron={false}
      imageClassName="scale-[1.85] object-[36%_34%]"
    />
  );
}
