"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { essentialImageForBucketId } from "@/lib/bucket-row-images";
import { dueLabelForBill } from "@/lib/essentials-dates";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import type { Bucket } from "@/lib/types";

const CARD_BG = "#efeeea";

type EssentialBucketCardProps = { bucket: Bucket };

function metaLineForEssential(bucket: Bucket): string | null {
  if (bucket.type !== "essential") return null;
  if (bucket.essential_subtype === "bill") {
    if (bucket.top_off != null) return formatUsd(bucket.top_off);
    return null;
  }
  return "Top off";
}

function subtitleForEssential(bucket: Bucket, now: Date): string | null {
  if (bucket.type !== "essential") return null;
  if (bucket.essential_subtype === "bill") {
    return dueLabelForBill(bucket.due_date, now);
  }
  if (bucket.top_off != null) {
    return `Min. ${formatUsd(bucket.top_off)}`;
  }
  return "Essential spending";
}

/**
 * Figma essentials bucket row: 88px tile, image + gradient, then a 2-column grid
 * (title stack | right column with meta top / amount bottom via flex).
 */
export function EssentialBucketCard({ bucket }: EssentialBucketCardProps) {
  const now = useMemo(() => new Date(), []);
  const imageSrc = essentialImageForBucketId(bucket.id);
  const metaLine = metaLineForEssential(bucket);
  const subtitle = subtitleForEssential(bucket, now);

  return (
    <Link
      href={appRoutes.bucket(bucket.id)}
      className="relative flex h-[88px] w-full min-w-0 items-stretch gap-2 overflow-hidden rounded-lg border border-solid border-[#bbb] bg-[#efeeea] pl-[152px] pr-4 py-4 outline-offset-2 transition-opacity active:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1e0403]/40"
      style={{ backgroundColor: CARD_BG }}
    >
      <div className="absolute bottom-0 left-0 top-0 w-[140px] overflow-hidden rounded-l-md">
        <div className="relative h-full w-full">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="140px"
            className="object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background: `linear-gradient(90deg, rgba(239,238,234,0.2) 30.29%, ${CARD_BG} 100%)`,
            }}
          />
        </div>
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-2 gap-2">
        <div className="flex min-h-0 min-w-0 flex-col justify-start gap-0 leading-tight">
          <p className="truncate text-lg font-medium text-[#1e0403]">
            {bucket.name}
          </p>
          {subtitle != null ? (
            <p className="mt-0.5 truncate text-sm font-medium text-[#1e0403]/50">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex min-h-0 min-w-0 flex-col items-end justify-between text-right leading-tight">
          <div className="min-h-[1.25rem] w-full truncate text-sm font-medium text-[#1e0403]/50">
            {metaLine != null ? metaLine : "\u00a0"}
          </div>
          <p className="w-full truncate text-[19px] font-bold text-[#222]">
            {formatUsd(bucket.amount)}
          </p>
        </div>
      </div>
    </Link>
  );
}
