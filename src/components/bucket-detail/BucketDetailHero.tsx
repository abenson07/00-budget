"use client";

import Image from "next/image";
import { useMemo } from "react";
import { imageForBucket } from "@/lib/bucket-row-images";
import { dueLabelForBill } from "@/lib/essentials-dates";
import { formatUsd } from "@/lib/format";
import type { Bucket } from "@/lib/types";

const CARD_GRADIENT =
  "linear-gradient(44.2deg, rgb(0, 0, 0) 12.7%, rgb(149, 16, 11) 65%, rgb(199, 86, 12) 84.3%, rgb(217, 195, 171) 98.9%)";

const LEFT_VEIL =
  "linear-gradient(60deg, rgb(0, 0, 0) 3.8%, rgba(0, 0, 0, 0.2) 96.8%)";

type BucketDetailHeroProps = { bucket: Bucket };

export function BucketDetailHero({ bucket }: BucketDetailHeroProps) {
  const now = useMemo(() => new Date(), []);
  const cover = imageForBucket(bucket);

  const goalLine =
    bucket.top_off != null ? `Goal: ${formatUsd(bucket.top_off)}` : "—";

  const statusLine =
    bucket.type === "essential" && bucket.essential_subtype === "bill"
      ? dueLabelForBill(bucket.due_date, now)
      : bucket.percentage != null
        ? `${(bucket.percentage * 100).toFixed(1)}% of income`
        : null;

  return (
    <div
      className="relative isolate overflow-hidden rounded-xl px-6 pb-10 pt-8"
      style={{ backgroundImage: CARD_GRADIENT }}
    >
      <div className="pointer-events-none absolute inset-0 -translate-y-[10%] scale-110 opacity-55">
        <Image
          src={cover}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-0 top-0 w-[min(100%,408px)]"
        style={{ background: LEFT_VEIL }}
      />
      <div className="relative z-[1] flex flex-col gap-4 text-[#efeeea]">
        <h1 className="max-w-[18rem] font-[family-name:var(--font-instrument-serif)] text-2xl leading-tight text-[#efeeea]">
          {bucket.name}
        </h1>
        <div className="flex w-full flex-col gap-1 leading-none">
          <p className="text-[48px] font-bold leading-none tracking-tight">
            {formatUsd(bucket.amount)}
          </p>
          <div className="flex w-full items-start justify-between gap-3 pt-1 text-base font-normal opacity-80">
            <p className="min-w-0 shrink">{goalLine}</p>
            <p className="shrink-0 text-right whitespace-nowrap">
              {statusLine ?? "\u00a0"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
