"use client";

import { Fragment, useMemo } from "react";
import { PercentageTag } from "@/components/design-system/PercentageTag";
import { discretionaryImageForBucketId } from "@/lib/bucket-row-images";
import { percentageTagForBucket } from "@/lib/bucket-percentage-tag";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import type { Bucket } from "@/lib/types";
import { BucketListCardRow } from "./BucketListCardRow";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.4 10.4 0 0 1 12 5c4 0 7.3 2.6 9 6a10.4 10.4 0 0 1-1.6 2.9M6.3 6.3A10.1 10.1 0 0 0 3 11c1.7 3.4 5 6 9 6 .8 0 1.6-.1 2.4-.3"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9a2 2 0 0 0 3.6 1.2"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

type DiscretionaryBucketRowProps = { bucket: Bucket };

/** Discretionary bucket row — spending money variant with optional lock + tag. */
export function DiscretionaryBucketRow({ bucket }: DiscretionaryBucketRowProps) {
  const src = discretionaryImageForBucketId(bucket.id);
  const now = useMemo(() => new Date(), []);
  const tagInfo = percentageTagForBucket(bucket, now);
  const locked = bucket.type === "discretionary" && bucket.locked === true;

  const subtitle =
    bucket.top_off != null
      ? `${formatUsd(bucket.top_off)} per paycheck`
      : bucket.percentage != null
        ? `${Math.round(bucket.percentage * 100)}% of income`
        : undefined;

  return (
    <BucketListCardRow
      href={appRoutes.bucket(bucket.id)}
      imageSrc={src}
      title={bucket.name}
      titleAddon={
        locked ? (
          <Fragment>
            <span className="sr-only">
              Locked spending money, excluded from safe to spend
            </span>
            <span
              className="flex shrink-0 items-center gap-0.5 text-[var(--budget-ink-soft)]"
              aria-hidden
            >
              <LockIcon />
              <EyeOffIcon />
            </span>
          </Fragment>
        ) : null
      }
      subtitleLeft={subtitle}
      primaryRight={formatUsd(bucket.amount)}
      secondaryRight={undefined}
      trailingTag={
        tagInfo ? (
          <PercentageTag variant={tagInfo.variant}>{tagInfo.label}</PercentageTag>
        ) : null
      }
      primaryRightSize="lg"
      showChevron
    />
  );
}
