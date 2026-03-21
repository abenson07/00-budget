import Link from "next/link";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import type { Bucket } from "@/lib/types";

/** Two-up preview tile on mobile home (Figma: BucketCard / Condensed). */
export function BucketCardCondensed({ bucket }: { bucket: Bucket }) {
  return (
    <Link
      href={appRoutes.bucket(bucket.id)}
      className="flex min-h-[140px] flex-col rounded-lg border border-[#bbb] bg-[#efeeea] p-4 transition-opacity active:opacity-90"
    >
      <p className="font-mono text-xs font-medium uppercase tracking-wide text-[#1e0403]">
        {bucket.name}
      </p>
      <p className="mt-1 text-3xl font-bold leading-tight tracking-tight text-[#1b1b1b] sm:text-[2.5rem]">
        {formatUsd(bucket.amount)}
      </p>
      <p className="mt-auto pt-2 font-mono text-xs text-[#1e0403]/50">
        Tap for details
      </p>
    </Link>
  );
}
