"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EssentialBucketCard } from "@/components/home/EssentialBucketCard";
import { sumEssentialBucketAmounts } from "@/lib/allocation";
import { nextBillHeroLine } from "@/lib/essentials-dates";
import { formatUsd } from "@/lib/format";
import { useBudgetStore } from "@/state/budget-store";

export function MobileEssentialsBuckets() {
  const buckets = useBudgetStore((s) => s.buckets);
  const now = useMemo(() => new Date(), []);

  const essentialBuckets = useMemo(
    () =>
      [...buckets]
        .filter((b) => b.type === "essential")
        .sort((a, b) => a.order - b.order),
    [buckets],
  );

  const total = sumEssentialBucketAmounts(buckets);
  const heroSubline = nextBillHeroLine(buckets, now);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-[4.5rem]">
        <nav>
          <Link
            href="/buckets"
            className="font-mono text-xs font-medium text-[#1e0403]/70 underline decoration-[#1e0403]/25 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← All buckets
          </Link>
        </nav>

        <header className="flex flex-col gap-4 rounded-xl text-[#1e1e1e]">
          <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl leading-tight">
            Essentials
          </h1>
          <div className="flex flex-col gap-1">
            <p className="text-[48px] font-bold leading-none tracking-tight">
              {formatUsd(total)}
            </p>
            <p className="text-base leading-snug text-[#1e1e1e]/80">
              {heroSubline}
            </p>
          </div>
        </header>

        <section
          className="flex flex-col gap-4"
          aria-label="Essentials buckets"
        >
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-xl text-[#1e1e1e]">
            Essentials
          </h2>

          {essentialBuckets.length === 0 ? (
            <p className="flex min-h-[88px] items-center rounded-lg border border-[#bbb] bg-[#efeeea] px-4 text-sm text-[#1e0403]/75">
              No essential buckets yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {essentialBuckets.map((b) => (
                <li key={b.id}>
                  <EssentialBucketCard bucket={b} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
