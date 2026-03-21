"use client";

import gsap from "gsap";
import Link from "next/link";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { getEffectiveSplits } from "@/lib/allocation";
import { parseIsoLocalMs } from "@/lib/dates";
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

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function essentialRowSubtitle(bucket: Bucket): string | null {
  if (bucket.type !== "essential") return null;
  if (bucket.essential_subtype === "bill") {
    const dueMs = parseIsoLocalMs(bucket.due_date);
    if (dueMs == null) return null;
    const days = Math.round((dueMs - startOfTodayMs()) / 86_400_000);
    if (days === 0) return "Due today";
    if (days === 1) return "Due in 1 day";
    if (days > 1) return `Due in ${days} days`;
    if (days === -1) return "Due 1 day ago";
    return `Due ${Math.abs(days)} days ago`;
  }
  if (bucket.top_off != null) return `Goal: ${formatUsd(bucket.top_off)}`;
  return null;
}

const ESSENTIALS_LIST_ID = "mobile-home-essentials-list";
/** Start times of staggered row tweens span this window along the chosen `from` axis. */
const STAGGER_TOTAL_SEC = 0.4;
const FADE_DURATION = 0.15;
const HEIGHT_DURATION = 0.225;

const rowStaggerExpand = { amount: STAGGER_TOTAL_SEC, from: "start" as const };
const rowStaggerCollapse = { amount: STAGGER_TOTAL_SEC, from: "end" as const };

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function prefersReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotionSnapshot,
    () => false,
  );
}

function TopCardEssentialsBlock({
  essentialBuckets,
}: {
  essentialBuckets: Bucket[];
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [essentialsExposed, setEssentialsExposed] = useState(false);
  const listShellRef = useRef<HTMLDivElement>(null);
  const listInnerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef = useRef(false);

  const killTimeline = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
  }, []);

  useLayoutEffect(() => () => killTimeline(), [killTimeline]);

  const runCollapse = useCallback(() => {
    const shell = listShellRef.current;
    const inner = listInnerRef.current;
    if (!shell || !inner) {
      setEssentialsExposed(false);
      return;
    }
    const staggerEls = gsap.utils.toArray<HTMLElement>(
      inner.querySelectorAll("[data-essential-animate]"),
    );
    if (staggerEls.length === 0) {
      setEssentialsExposed(false);
      return;
    }
    killTimeline();
    isAnimatingRef.current = true;
    const startH = shell.scrollHeight;
    gsap.set(shell, { height: startH, overflow: "hidden" });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        setEssentialsExposed(false);
      },
    });
    tl.to(staggerEls, {
      opacity: 0,
      duration: FADE_DURATION,
      stagger: rowStaggerCollapse,
      ease: "power1.out",
    }).to(shell, {
      height: 0,
      duration: HEIGHT_DURATION,
      ease: "power2.inOut",
    });
    timelineRef.current = tl;
  }, [killTimeline]);

  const runExpand = useCallback(() => {
    const shell = listShellRef.current;
    const inner = listInnerRef.current;
    if (!shell || !inner) return;
    const staggerEls = gsap.utils.toArray<HTMLElement>(
      inner.querySelectorAll("[data-essential-animate]"),
    );
    killTimeline();
    isAnimatingRef.current = true;
    gsap.set(staggerEls, { opacity: 0 });
    const targetH = inner.scrollHeight;
    gsap.set(shell, { height: 0, overflow: "hidden" });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        gsap.set(shell, { height: "auto" });
        shell.classList.remove("h-0");
      },
    });
    tl.to(shell, {
      height: targetH,
      duration: HEIGHT_DURATION,
      ease: "power2.inOut",
    }).to(
      staggerEls,
      {
        opacity: 1,
        duration: FADE_DURATION,
        stagger: rowStaggerExpand,
        ease: "power1.out",
      },
      ">",
    );
    timelineRef.current = tl;
  }, [killTimeline]);

  useLayoutEffect(() => {
    if (prefersReducedMotion || !essentialsExposed) return;
    runExpand();
    return () => killTimeline();
  }, [essentialsExposed, prefersReducedMotion, runExpand, killTimeline]);

  const handleToggle = () => {
    if (essentialBuckets.length === 0) return;
    if (prefersReducedMotion) {
      setEssentialsExposed((e) => !e);
      return;
    }
    if (isAnimatingRef.current) return;
    if (essentialsExposed) {
      runCollapse();
    } else {
      setEssentialsExposed(true);
    }
  };

  if (essentialBuckets.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#f9f8f4]">
        <CheckBadge />
        <span>All essentials on track</span>
      </div>
    );
  }

  const addEssentialControl = (
    <div data-essential-animate className="flex justify-center pt-1">
      <Link
        href={legacyRoutes.home}
        className="rounded-full border border-[#f9f8f4]/90 px-6 py-2 font-mono text-xs font-medium text-[#f9f8f4] transition-opacity active:opacity-85"
      >
        Add an essential
      </Link>
    </div>
  );

  const rowLinks = essentialBuckets.map((b) => {
    const sub = essentialRowSubtitle(b);
    return (
      <div key={b.id} data-essential-animate>
        <Link
          href={legacyRoutes.bucket(b.id)}
          className="flex items-start justify-between gap-3 text-[#faf9f6] active:opacity-85"
        >
          <div className="min-w-0 flex-1">
            <p className="text-lg font-medium leading-tight">{b.name}</p>
            {sub ? (
              <p className="mt-0.5 text-sm font-medium leading-tight text-[#faf9f6]/50">
                {sub}
              </p>
            ) : null}
          </div>
          <p className="shrink-0 text-2xl font-semibold leading-tight">
            {formatUsd(b.amount)}
          </p>
        </Link>
      </div>
    );
  });

  return (
    <>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-2 rounded-sm text-left text-xs text-[#f9f8f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f9f8f4]/80"
        onClick={handleToggle}
        aria-expanded={essentialsExposed}
        aria-controls={
          essentialsExposed ? ESSENTIALS_LIST_ID : undefined
        }
      >
        <CheckBadge />
        <span>All essentials on track</span>
      </button>
      {essentialsExposed ? (
        prefersReducedMotion ? (
          <div
            id={ESSENTIALS_LIST_ID}
            className="flex flex-col gap-4"
            role="region"
            aria-label="Essential buckets"
          >
            {rowLinks}
            {addEssentialControl}
          </div>
        ) : (
          <div
            id={ESSENTIALS_LIST_ID}
            ref={listShellRef}
            className="h-0 overflow-hidden"
            role="region"
            aria-label="Essential buckets"
          >
            <div ref={listInnerRef} className="flex flex-col gap-4">
              {rowLinks}
              {addEssentialControl}
            </div>
          </div>
        )
      ) : null}
    </>
  );
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
  const essentialBuckets = useMemo(
    () => sortedBuckets.filter((b) => b.type === "essential"),
    [sortedBuckets],
  );

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
          className="flex w-full flex-col gap-6 rounded-xl px-6 py-8 text-[#f9f8f4]"
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
          <div className="flex flex-col gap-4 pt-2">
            <TopCardEssentialsBlock essentialBuckets={essentialBuckets} />
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
