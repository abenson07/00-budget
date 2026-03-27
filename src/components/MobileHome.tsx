"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BucketCard,
  TOP_CARD_HOME_REFERENCE_CONTENT,
  TopCardHome,
} from "@/components/figma-buckets";
import { getEffectiveSplits } from "@/lib/allocation";
import { appRoutes } from "@/lib/routes";
import { isUnassignedBucket } from "@/lib/unassigned-bucket";
import { useBudgetStore } from "@/state/budget-store";

export function MobileHome() {
  const buckets = useBudgetStore((s) => s.buckets);
  const transactionsAll = useBudgetStore((s) => s.transactions);
  const transactions = useMemo(() => transactionsAll.slice(0, 6), [transactionsAll]);
  const router = useRouter();
  const [essentialsOpen, setEssentialsOpen] = useState(false);
  const topCardShellRef = useRef<HTMLDivElement | null>(null);
  // Reserve space for the collapsed top card so expanded content overlays it instead of pushing.
  const [collapsedTopCardHeight, setCollapsedTopCardHeight] = useState<number | null>(
    null,
  );
  const browseBuckets = useMemo(
    () =>
      [...buckets]
        .filter((bucket) => !isUnassignedBucket(bucket))
        .sort((a, b) => a.order - b.order),
    [buckets],
  );
  const homeBuckets = useMemo(
    () =>
      browseBuckets.slice(0, 2).map((bucket, index) => ({
        id: bucket.id,
        title: bucket.name,
        amountLabel: `$${Math.round(bucket.amount)}`,
        percentLabel: index === 0 ? "20% " : "80% ",
        atRisk: index === 0,
      })),
    [browseBuckets],
  );

  const measureCollapsedHeight = () => {
    if (essentialsOpen) return; // Only reserve the height of the collapsed state.
    const el = topCardShellRef.current;
    const h = el?.getBoundingClientRect().height ?? 0;
    if (h > 0) setCollapsedTopCardHeight(h);
  };

  useLayoutEffect(() => {
    measureCollapsedHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => measureCollapsedHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [essentialsOpen]);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-8">
        <div className="relative">
          <div
            ref={topCardShellRef}
            className="absolute left-0 right-0 top-0 z-[20]"
          >
            <TopCardHome
              {...TOP_CARD_HOME_REFERENCE_CONTENT}
              expanded={essentialsOpen}
              onExpandedChange={setEssentialsOpen}
            />
          </div>

          <div
            className="flex flex-col gap-6"
            style={{
              // `gap-6` from the previous layout was 24px; keep that spacing between the top card and the first section.
              paddingTop:
                collapsedTopCardHeight == null
                  ? undefined
                  : collapsedTopCardHeight + 24,
            }}
          >
            <section className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2">
                {homeBuckets.map((bucket) => (
                  <Link key={bucket.id} href={appRoutes.bucket(bucket.id)}>
                <BucketCard
                  variant="home"
                  state="default"
                  title={bucket.title}
                  amountLabel={bucket.amountLabel}
                  percentLabel={bucket.percentLabel}
                  risk={bucket.atRisk ? "atRisk" : "safe"}
                />
                  </Link>
                ))}
                <Link
                  href={appRoutes.buckets}
                  className="flex min-h-[7.5rem] w-full items-end justify-start rounded-lg bg-[#e6e8dd] p-3 text-left text-[12px] font-bold text-[#1c3812] opacity-80"
                >
                  See all buckets
                </Link>
              </div>
              <div className="flex justify-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1c3812]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1c3812]/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1c3812]/40" />
              </div>
            </section>

            <section
              className={`flex flex-col gap-2 transition-opacity ${
                essentialsOpen ? "opacity-40" : "opacity-100"
              }`}
            >
              <h2 className="font-display text-[24px] leading-none">Transactions</h2>
              {transactions.length === 0 ? (
                <p className="text-sm text-[#222]/60">No transactions yet.</p>
              ) : (
                <ul>
                  {transactions.map((tx, index) => {
                    const firstSplit = getEffectiveSplits(tx)[0];
                    const bucket = firstSplit
                      ? buckets.find((item) => item.id === firstSplit.bucketId)
                      : undefined;
                    const bucketName = bucket?.name ?? "Unassigned";
                    const bucketHref = firstSplit
                      ? appRoutes.bucket(firstSplit.bucketId)
                      : appRoutes.buckets;
                    return (
                      <li
                        key={tx.id}
                        className={
                          index < transactions.length - 1
                            ? "border-b border-[#d7ddd6]"
                            : ""
                        }
                      >
                        <div
                          role="link"
                          tabIndex={0}
                          className="flex cursor-pointer items-center justify-between py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#222]/30"
                          onClick={() =>
                            router.push(appRoutes.transaction(tx.id))
                          }
                          onKeyDown={(e) => {
                            // Only activate when the row itself is focused (not when tabbing through child links).
                            if (e.target !== e.currentTarget) return;
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(appRoutes.transaction(tx.id));
                            }
                          }}
                        >
                          <div className="flex flex-col gap-1">
                            <Link
                              href={bucketHref}
                              className="w-fit text-[12px] font-medium text-[#1e0403]/50 underline-offset-2 hover:underline"
                              onClick={(e) => {
                                // Keep bucket navigation separate from the row transaction navigation.
                                e.stopPropagation();
                              }}
                            >
                              {bucketName}
                            </Link>
                            <span className="w-fit text-[18px] font-semibold text-[#222] underline-offset-2 hover:underline">
                              {tx.merchant || "Target"}
                            </span>
                          </div>
                          <span className="text-[18px] font-semibold text-[#222] underline-offset-2 hover:underline">
                            ${Math.round(tx.amount)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
      </div>
    </div>
  </div>
  );
}
