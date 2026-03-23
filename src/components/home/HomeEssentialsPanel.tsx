"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
} from "react";
import { legacyRoutes } from "@/lib/legacy-routes";
import type { Bucket } from "@/lib/types";
import { EssentialBucketCard } from "./EssentialBucketCard";

const LIST_ID = "home-essentials-drawer";

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

type HomeEssentialsPanelProps = {
  essentialBuckets: Bucket[];
  /** E.g. "$200 due this week". */
  dueLine: string;
  /** E.g. "On track this month". */
  monthStatus: string;
  expanded: boolean;
  onExpandedChange: (next: boolean) => void;
  /** Footer line (non-interactive), e.g. "$200 due this week". */
  footerLine: string;
};

export function HomeEssentialsPanel({
  essentialBuckets,
  dueLine,
  monthStatus,
  expanded,
  onExpandedChange,
  footerLine,
}: HomeEssentialsPanelProps) {
  const bannerRight = `${dueLine} · ${monthStatus}`;
  const prefersReducedMotion = usePrefersReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listHeadingId = `${baseId}-heading`;

  const toggle = useCallback(() => {
    if (essentialBuckets.length === 0) return;
    onExpandedChange(!expanded);
  }, [essentialBuckets.length, expanded, onExpandedChange]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onExpandedChange(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded, onExpandedChange]);

  useEffect(() => {
    if (!expanded || prefersReducedMotion) return;
    const t = window.setTimeout(() => {
      drawerRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    }, 50);
    return () => window.clearTimeout(t);
  }, [expanded, prefersReducedMotion]);

  const rows = essentialBuckets.slice(0, 5).map((b) => (
    <div key={b.id}>
      <EssentialBucketCard bucket={b} showChevron={false} />
    </div>
  ));

  if (essentialBuckets.length === 0) {
    return (
      <div className="-mt-1 rounded-b-[var(--radius-card)] rounded-t-none border border-t-0 border-[var(--budget-sage-deep)] bg-[var(--budget-sage-panel)] px-4 py-3 text-sm text-[var(--budget-forest)]">
        <span className="font-semibold">Essentials</span>
        <span className="text-[var(--budget-ink-soft)]"> · All set</span>
      </div>
    );
  }

  return (
    <div className="relative z-20 -mt-1">
      <button
        ref={triggerRef}
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-b-[var(--radius-card)] rounded-t-none border border-t-0 border-[var(--budget-sage-deep)] bg-[var(--budget-sage-panel)] px-4 py-3 text-left transition-colors hover:bg-[var(--budget-sage)]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--budget-forest)]"
        aria-expanded={expanded}
        aria-controls={expanded ? LIST_ID : undefined}
        onClick={toggle}
      >
        <span className="text-sm font-bold text-[var(--budget-forest)]">
          Essentials
        </span>
        <span className="max-w-[min(100%,14rem)] text-right text-xs font-medium leading-snug text-[var(--budget-ink)]">
          {bannerRight}
        </span>
      </button>

      {expanded ? (
        <div
          id={LIST_ID}
          ref={drawerRef}
          role="region"
          aria-labelledby={listHeadingId}
          className="absolute left-0 right-0 top-full z-50 overflow-hidden rounded-b-[var(--radius-card)] border border-t-0 border-[var(--budget-sage-deep)] bg-[var(--budget-sage-panel)] shadow-lg"
        >
          <h2 id={listHeadingId} className="sr-only">
            Essential buckets
          </h2>
          <div className="flex items-center justify-between gap-2 border-b border-[var(--budget-sage-deep)]/50 px-4 py-2 text-xs font-medium text-[var(--budget-ink)]">
            <span>Essentials</span>
            <span className="text-[var(--budget-ink-soft)]">{monthStatus}</span>
          </div>
          <div className="flex flex-col gap-2 px-3 py-3">{rows}</div>
          <div className="border-t border-[var(--budget-sage-deep)]/50 bg-[var(--budget-forest)] px-4 py-3 text-center text-sm font-semibold text-white">
            {footerLine}
          </div>
          <div className="flex justify-center border-t border-[var(--budget-sage-deep)]/40 px-4 py-3">
            <Link
              href={legacyRoutes.home}
              className="rounded-full border border-[var(--budget-forest)] px-5 py-2 text-xs font-semibold text-[var(--budget-forest)] transition-opacity active:opacity-80"
            >
              Add an essential
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
