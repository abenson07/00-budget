"use client";

import Link from "next/link";
import { legacyRoutes } from "@/lib/legacy-routes";
import type { Bucket } from "@/lib/types";
import { formatUsd } from "@/lib/format";

export type BucketKindTag = "Unassigned" | "Essential" | "Discretionary";

export function bucketKindTag(bucket: Bucket): BucketKindTag {
  if (bucket.name === "Unassigned") return "Unassigned";
  if (bucket.type === "essential") return "Essential";
  return "Discretionary";
}

function tagClass(tag: BucketKindTag): string {
  switch (tag) {
    case "Unassigned":
      return "border-zinc-200 bg-zinc-100 text-zinc-800";
    case "Essential":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "Discretionary":
      return "border-sky-200 bg-sky-50 text-sky-900";
  }
}

export function BucketCard({ bucket }: { bucket: Bucket }) {
  const tag = bucketKindTag(bucket);
  const sub =
    bucket.type === "essential"
      ? bucket.essential_subtype === "bill"
        ? `Bill · due ${bucket.due_date}`
        : "Essential spending"
      : null;

  return (
    <Link
      href={legacyRoutes.bucket(bucket.id)}
      className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50/80 active:bg-zinc-50"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-zinc-900">{bucket.name}</span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tagClass(tag)}`}
            >
              {tag}
            </span>
          </div>
          {sub ? (
            <p className="mt-1 text-xs text-zinc-500">{sub}</p>
          ) : null}
        </div>
        <p className="shrink-0 text-lg font-semibold tabular-nums text-zinc-900 sm:text-right">
          {formatUsd(bucket.amount)}
        </p>
      </div>
    </Link>
  );
}
