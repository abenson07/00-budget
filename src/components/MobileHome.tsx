"use client";

import Link from "next/link";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AllBucketsButton,
  BalanceAlert,
  BucketCardCondensed,
  HomeEssentialsPanel,
  TopCardForest,
  TransactionListCondensed,
} from "@/components/home";
import {
  essentialsHaveAtRiskBucket,
  sumEssentialDueWithinDays,
} from "@/lib/essentials-aggregates";
import { formatUsd } from "@/lib/format";
import { legacyRoutes } from "@/lib/legacy-routes";
import { appRoutes } from "@/lib/routes";
import { isUnassignedBucket } from "@/lib/unassigned-bucket";
import {
  selectSafeToSpend,
  useBudgetStore,
} from "@/state/budget-store";

const PAYCHECK_DAYS_PLACEHOLDER = 14;

export function MobileHome() {
  const buckets = useBudgetStore((s) => s.buckets);
  const transactions = useBudgetStore((s) => s.transactions);
  const safe = useBudgetStore(selectSafeToSpend);
  const [essentialsOpen, setEssentialsOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [scrimTop, setScrimTop] = useState(0);

  const measureHeader = useCallback(() => {
    const el = headerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setScrimTop(r.bottom);
  }, []);

  useLayoutEffect(() => {
    measureHeader();
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measureHeader());
    ro.observe(el);
    window.addEventListener("resize", measureHeader);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureHeader);
    };
  }, [measureHeader, essentialsOpen]);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets],
  );
  const listBuckets = useMemo(
    () => sortedBuckets.filter((b) => !isUnassignedBucket(b)),
    [sortedBuckets],
  );
  const previewBuckets = listBuckets.slice(0, 2);
  const essentialBuckets = useMemo(
    () => sortedBuckets.filter((b) => b.type === "essential"),
    [sortedBuckets],
  );

  const now = useMemo(() => new Date(), []);
  const dueWeekSum = sumEssentialDueWithinDays(essentialBuckets, now, 6);
  const dueLine = `${formatUsd(dueWeekSum)} due this week`;
  const monthStatus = essentialsHaveAtRiskBucket(essentialBuckets, now)
    ? "Needs attention"
    : "On track this month";

  const recentTx = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, 7);
  }, [transactions]);

  const perDay =
    PAYCHECK_DAYS_PLACEHOLDER > 0
      ? formatUsd(safe / PAYCHECK_DAYS_PLACEHOLDER)
      : "—";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselSlides = Math.min(previewBuckets.length + 1, 3);

  const onCarouselScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth * 0.85;
    const idx = Math.round(el.scrollLeft / Math.max(w, 1));
    setCarouselIndex(Math.min(Math.max(0, idx), carouselSlides - 1));
  }, [carouselSlides]);

  return (
    <div className="min-h-screen bg-[var(--budget-page-bg)] font-[family-name:var(--font-instrument-sans)] text-[var(--budget-ink)]">
      <div className="relative mx-auto flex w-full max-w-md flex-col px-4 pb-10 pt-8">
        <div ref={headerRef} className="relative z-50 shrink-0">
          <TopCardForest
            formattedSafe={formatUsd(safe)}
            balanceAlert={
              <BalanceAlert
                variant="paycheck"
                paycheckDays={PAYCHECK_DAYS_PLACEHOLDER}
                perDayFormatted={perDay}
              />
            }
          />
          <HomeEssentialsPanel
            essentialBuckets={essentialBuckets}
            dueLine={dueLine}
            monthStatus={monthStatus}
            footerLine={dueLine}
            expanded={essentialsOpen}
            onExpandedChange={setEssentialsOpen}
          />
        </div>

        {essentialsOpen ? (
          <button
            type="button"
            aria-label="Dismiss essentials"
            className="fixed inset-x-0 bottom-0 z-40 bg-[var(--budget-scrim)] md:left-auto md:right-auto md:max-w-md"
            style={{ top: scrimTop }}
            onClick={() => setEssentialsOpen(false)}
          />
        ) : null}

        <div
          className={`relative z-10 mt-6 flex flex-col gap-6 transition-opacity duration-200 ${
            essentialsOpen ? "pointer-events-none opacity-50" : ""
          }`}
          {...(essentialsOpen ? { inert: true } : {})}
        >
          <section className="flex flex-col gap-3">
            <div
              ref={scrollRef}
              onScroll={onCarouselScroll}
              className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pl-1 pr-4"
            >
              {previewBuckets.length === 0 ? (
                <p className="snap-center rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-[var(--budget-card)] p-4 text-sm text-[var(--budget-ink-soft)]">
                  No buckets yet. Open the{" "}
                  <Link
                    href={legacyRoutes.home}
                    className="font-medium text-[var(--budget-forest)] underline underline-offset-2"
                  >
                    legacy dashboard
                  </Link>{" "}
                  to manage data.
                </p>
              ) : (
                <>
                  {previewBuckets.map((b) => (
                    <div
                      key={b.id}
                      className="w-[min(100%,280px)] shrink-0 snap-center"
                    >
                      <BucketCardCondensed bucket={b} />
                    </div>
                  ))}
                  <div className="w-[min(100%,280px)] shrink-0 snap-center">
                    <Link
                      href={appRoutes.buckets}
                      className="flex min-h-[132px] flex-col justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--budget-card-border)] bg-[var(--budget-card)]/60 px-4 py-4 text-center transition-opacity active:opacity-90"
                    >
                      <span className="font-display text-lg font-semibold text-[var(--budget-forest)]">
                        See all buckets
                      </span>
                      <span className="mt-1 text-xs text-[var(--budget-ink-soft)]">
                        Full list
                      </span>
                    </Link>
                  </div>
                </>
              )}
            </div>
            {previewBuckets.length > 0 && carouselSlides > 1 ? (
              <div
                className="flex justify-center gap-1.5"
                aria-hidden
              >
                {Array.from({ length: carouselSlides }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${
                      i === carouselIndex
                        ? "bg-[var(--budget-forest)]"
                        : "bg-[var(--budget-card-border)]"
                    }`}
                  />
                ))}
              </div>
            ) : null}

            <AllBucketsButton />
          </section>

          <TransactionListCondensed transactions={recentTx} />
        </div>
      </div>
    </div>
  );
}
