import { percentageTagForBucket } from "./bucket-percentage-tag";
import { dueLabelForBill, nextBillHeroLine } from "./essentials-dates";
import {
  essentialsFundingShortfall,
  essentialsHaveAtRiskBucket,
  sumEssentialDueWithinDays,
} from "./essentials-aggregates";
import { formatUsd } from "./format";
import type { Bucket } from "./types";
import type { TopCardHomeEssentialLine } from "@/components/figma-buckets/top-card-types";

export type EssentialsSummary = {
  essentialBuckets: Bucket[];
  allOnTrack: boolean;
  dueThisWeekShort: string;
  monthlyStatusLine: string;
  essentialLines: TopCardHomeEssentialLine[];
  expandedFooterLine: string;
};

export function buildEssentialsSummary(buckets: Bucket[], now: Date): EssentialsSummary {
  const essentialBuckets = buckets.filter((b) => b.type === "essential");
  const allOnTrack = !essentialsHaveAtRiskBucket(buckets, now);

  const essentialLines: TopCardHomeEssentialLine[] = essentialBuckets.map((b) => {
    const tag = percentageTagForBucket(b, now);
    const isBill = b.type === "essential" && b.essential_subtype === "bill";
    const variant = tag?.variant === "atRisk" ? "atRisk" : "safe"; // "noValue"/null collapse to "safe"
    return {
      title: b.name,
      subtitle: isBill ? dueLabelForBill(b.due_date, now) : "Essential spending",
      subtitleTone: "forest",
      amount: formatUsd(b.amount),
      percentLabel: tag ? tag.label : "—",
      percentageTagVariant: variant,
      percentageTagInverse: true,
    };
  });

  return {
    essentialBuckets,
    allOnTrack,
    dueThisWeekShort: nextBillHeroLine(buckets, now),
    monthlyStatusLine: allOnTrack ? "On track this month" : "Needs attention",
    essentialLines,
    expandedFooterLine: allOnTrack ? "All essentials on track" : "Some essentials need funding",
  };
}

export function buildEssentialsCardSummary(buckets: Bucket[], now: Date) {
  const essentialBuckets = buckets.filter((b) => b.type === "essential");
  const atRisk = essentialsHaveAtRiskBucket(buckets, now);
  const totalReserved = essentialBuckets.reduce((s, b) => s + b.amount, 0);
  const dueSoon = sumEssentialDueWithinDays(buckets, now, 7);
  const shortfall = essentialsFundingShortfall(buckets, now);
  return {
    state: atRisk ? ("atRisk" as const) : ("default" as const),
    title: "Due this week",
    totalReservedLabel: "Total reserved",
    totalReservedAmount: formatUsd(totalReserved),
    mainAmount: formatUsd(dueSoon),
    statusPill: atRisk
      ? `${formatUsd(shortfall)} short - transfer money to cover it`
      : "Good and ready",
  };
}
