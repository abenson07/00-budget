"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { PercentageTag } from "@/components/design-system/PercentageTag";
import { imageForBucket } from "@/lib/bucket-row-images";
import { percentageTagForBucket } from "@/lib/bucket-percentage-tag";
import { dueLabelForBill } from "@/lib/essentials-dates";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import type { Bucket } from "@/lib/types";

type BucketDetailHeroProps = { bucket: Bucket };

function categoryLabel(bucket: Bucket): string {
  if (bucket.type === "essential" && bucket.essential_subtype === "bill") {
    return "Bill";
  }
  if (bucket.type === "essential") return "Monthly spending";
  return "Spending money";
}

export function BucketDetailHero({ bucket }: BucketDetailHeroProps) {
  const now = useMemo(() => new Date(), []);
  const cover = imageForBucket(bucket);
  const tag = percentageTagForBucket(bucket, now);
  const isBill =
    bucket.type === "essential" && bucket.essential_subtype === "bill";
  const dueLine = isBill ? dueLabelForBill(bucket.due_date, now) : null;
  const billAtRisk = isBill && tag?.variant === "atRisk";
  const transferHref = appRoutes.bucketTransfer(bucket.id);

  const leftOfGoal =
    bucket.top_off != null
      ? Math.max(0, bucket.top_off - bucket.amount)
      : null;
  const metaRight =
    leftOfGoal != null && bucket.top_off != null
      ? `${categoryLabel(bucket)}, ${formatUsd(leftOfGoal)} left of ${formatUsd(bucket.top_off)}`
      : categoryLabel(bucket);

  return (
    <div className="relative -mx-4">
      <div className="relative h-44 w-full overflow-hidden bg-[var(--budget-card)]">
        <Image
          src={cover}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      <div className="relative z-[1] -mt-5 rounded-t-[var(--radius-card)] border border-b-0 border-[var(--budget-card-border)] bg-white px-5 pb-0 pt-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--budget-ink-soft)]">
          {categoryLabel(bucket)}
        </p>
        <p className="mt-0.5 font-display text-lg font-semibold leading-tight text-[var(--budget-ink)]">
          {bucket.name}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-3xl font-bold tabular-nums leading-none text-[var(--budget-ink)]">
            {formatUsd(bucket.amount)}
          </p>
          {tag ? (
            <PercentageTag variant={tag.variant}>{tag.label}</PercentageTag>
          ) : null}
        </div>
        <p className="mt-2 text-right text-xs text-[var(--budget-ink-soft)]">
          {metaRight}
        </p>

        <div className="mt-4 -mx-5 border-t border-[var(--budget-card-border)]">
          {!isBill ? (
            <Link
              href={transferHref}
              className="flex w-full items-center justify-center bg-[var(--budget-forest)] py-3.5 text-center text-sm font-semibold text-white transition-opacity active:opacity-90"
            >
              Transfer money to bucket
            </Link>
          ) : billAtRisk ? (
            <div className="flex w-full bg-[var(--budget-danger-bar)] text-sm font-semibold text-white">
              <span className="flex flex-1 items-center px-4 py-3.5">
                {dueLine ?? "Due soon"}
              </span>
              <Link
                href={transferHref}
                className="flex flex-1 items-center justify-end px-4 py-3.5 text-right underline-offset-2 hover:underline"
              >
                Top off now
              </Link>
            </div>
          ) : (
            <div className="flex w-full text-sm font-semibold text-white">
              <span className="flex flex-[0.45] items-center bg-[var(--budget-forest)] px-4 py-3.5">
                {dueLine ?? "—"}
              </span>
              <Link
                href={transferHref}
                className="flex flex-1 items-center justify-center bg-[var(--budget-sage-deep)] px-4 py-3.5 text-center transition-opacity active:opacity-90"
              >
                Transfer money to bucket
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
