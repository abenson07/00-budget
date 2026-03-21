"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getEffectiveSplits } from "@/lib/allocation";
import { formatUsd } from "@/lib/format";
import { legacyRoutes } from "@/lib/legacy-routes";
import type { Bucket, Transaction } from "@/lib/types";
import {
  selectSafeToSpend,
  useBudgetStore,
} from "@/state/budget-store";

function txAllocationLabel(
  tx: Transaction,
  getBucketById: (id: string) => Bucket | undefined,
): string {
  const eff = getEffectiveSplits(tx);
  const names = eff
    .map((s) => getBucketById(s.bucketId)?.name)
    .filter(Boolean) as string[];
  if (names.length === 0) return "Unassigned";
  if (names.length === 1) return names[0]!;
  return names.join(" · ");
}

function CheckBadge() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <circle cx={7} cy={7} r={6.5} stroke="currentColor" strokeOpacity={0.35} />
      <path
        d="M4 7.2 6.1 9.3 10 4.8"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MobileHome() {
  const buckets = useBudgetStore((s) => s.buckets);
  const transactions = useBudgetStore((s) => s.transactions);
  const safe = useBudgetStore(selectSafeToSpend);
  const getBucketById = useBudgetStore((s) => s.getBucketById);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets],
  );
  const previewBuckets = sortedBuckets.slice(0, 2);

  const recentTx = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, 7);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-[4.5rem]">
        <section
          className="flex h-[245px] w-full flex-col justify-between rounded-xl px-6 py-8 text-[#f9f8f4]"
          style={{
            backgroundImage:
              "linear-gradient(50.25deg, rgb(0,0,0) 12.7%, rgb(70,69,66) 65%, rgb(148,147,144) 84.3%, rgb(183,182,179) 98.9%)",
          }}
        >
          <p className="font-[family-name:var(--font-instrument-serif)] text-2xl leading-tight">
            Safe to spend
          </p>
          <div>
            <p className="text-[2.75rem] font-bold leading-none tracking-tight sm:text-[4.5rem]">
              {formatUsd(safe)}
            </p>
            <p className="mt-2 text-xs opacity-80">
              Discretionary buckets and Unassigned — same rule as the legacy
              dashboard.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#f9f8f4]">
            <CheckBadge />
            <span>All essentials on track</span>
          </div>
        </section>

        <section className="flex flex-col items-stretch gap-6 py-2">
          <div className="grid grid-cols-2 gap-4">
            {previewBuckets.length === 0 ? (
              <p className="col-span-2 rounded-lg border border-[#bbb] bg-[#efeeea] p-4 text-sm text-[#1e0403]/70">
                No buckets yet. Open the{" "}
                <Link
                  href={legacyRoutes.home}
                  className="font-medium text-[#1e0403] underline underline-offset-2"
                >
                  legacy dashboard
                </Link>{" "}
                to manage data.
              </p>
            ) : (
              previewBuckets.map((b) => (
                <Link
                  key={b.id}
                  href={legacyRoutes.bucket(b.id)}
                  className="flex min-h-[140px] flex-col rounded-lg border border-[#bbb] bg-[#efeeea] p-4 transition-opacity active:opacity-90"
                >
                  <p className="font-mono text-xs font-medium uppercase tracking-wide text-[#1e0403]">
                    {b.name}
                  </p>
                  <p className="mt-1 text-3xl font-bold leading-tight tracking-tight text-[#1b1b1b] sm:text-[2.5rem]">
                    {formatUsd(b.amount)}
                  </p>
                  <p className="mt-auto pt-2 font-mono text-xs text-[#1e0403]/50">
                    Tap for details
                  </p>
                </Link>
              ))
            )}
          </div>

          <Link
            href={legacyRoutes.home}
            className="mx-auto rounded-lg bg-[#dbdad6] px-6 py-2 font-mono text-xs font-medium text-[#010101]"
          >
            All Buckets →
          </Link>
        </section>

        <section className="flex flex-col gap-3.5">
          <Link
            href={legacyRoutes.transactions}
            className="flex items-center justify-between px-4"
          >
            <span className="text-xs font-bold tracking-wide text-black">
              Transactions
            </span>
            <span aria-hidden className="text-lg text-[#222]">
              →
            </span>
          </Link>

          {recentTx.length === 0 ? (
            <p className="px-4 text-sm text-[#1e0403]/60">
              No transactions. Add some from the{" "}
              <Link
                href={legacyRoutes.transactions}
                className="font-medium text-[#1e0403] underline underline-offset-2"
              >
                legacy list
              </Link>
              .
            </p>
          ) : (
            <ul className="flex flex-col">
              {recentTx.map((tx) => (
                <li key={tx.id}>
                  <Link
                    href={legacyRoutes.transaction(tx.id)}
                    className="flex items-start justify-between gap-3 rounded-lg px-4 py-3 transition-colors active:bg-black/[0.04]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-medium text-[#222]">
                        {tx.merchant || "—"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#1e0403]/50">
                        {txAllocationLabel(tx, getBucketById)}
                      </p>
                    </div>
                    <p className="shrink-0 text-2xl font-semibold text-[#222]">
                      {formatUsd(tx.amount)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
