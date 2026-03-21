"use client";

import gsap from "gsap";
import Link from "next/link";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { parseIsoLocalMs } from "@/lib/dates";
import { formatUsd } from "@/lib/format";
import { legacyRoutes } from "@/lib/legacy-routes";
import type { Bucket } from "@/lib/types";

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

/** Expandable essentials list + “All essentials on track” (Figma: EssentialsStatus / On Track). */
export function EssentialsStatus({
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

  const essentialRows = essentialBuckets.map((b) => {
    const sub = essentialRowSubtitle(b);
    return (
      <div key={b.id} data-essential-animate>
        <div className="flex items-start justify-between gap-3 text-[#faf9f6]">
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
        </div>
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
            {essentialRows}
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
              {essentialRows}
              {addEssentialControl}
            </div>
          </div>
        )
      ) : null}
    </>
  );
}
