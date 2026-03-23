"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PercentageTag } from "@/components/design-system/PercentageTag";
import { percentageTagForBucket } from "@/lib/bucket-percentage-tag";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import type { Bucket } from "@/lib/types";

/** Home carousel tile (Figma: Bucket – Home). */
export function BucketCardCondensed({ bucket }: { bucket: Bucket }) {
  const now = useMemo(() => new Date(), []);
  const tag = percentageTagForBucket(bucket, now);

  return (
    <Link
      href={appRoutes.bucket(bucket.id)}
      className="flex min-h-[132px] flex-col rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-[var(--budget-sage-panel)] p-4 transition-opacity active:opacity-90"
    >
      <p className="text-xs font-semibold leading-tight text-[var(--budget-ink)]">
        {bucket.name}
      </p>
      <p className="mt-2 text-2xl font-bold leading-none tracking-tight text-[var(--budget-ink)]">
        {formatUsd(bucket.amount)}
      </p>
      <div className="mt-auto flex items-center justify-end pt-3">
        {tag ? (
          <PercentageTag variant={tag.variant}>{tag.label}</PercentageTag>
        ) : (
          <span className="text-xs text-[var(--budget-ink-soft)]">—</span>
        )}
      </div>
    </Link>
  );
}
