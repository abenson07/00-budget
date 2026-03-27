"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  BucketCard,
  TOP_CARD_HOME_REFERENCE_CONTENT,
  TopCardHome,
} from "@/components/figma-buckets";
import { appRoutes } from "@/lib/routes";
import { isUnassignedBucket } from "@/lib/unassigned-bucket";
import type { DiscretionaryBucket, EssentialBillBucket, EssentialSpendingBucket } from "@/lib/types";
import { useBudgetStore } from "@/state/budget-store";

type RiskState = "safe" | "atRisk";

export function MobileBuckets() {
  const buckets = useBudgetStore((s) => s.buckets);
  const [riskOverrides, setRiskOverrides] = useState<Record<string, RiskState>>(
    {},
  );
  const [contextMenu, setContextMenu] = useState<null | {
    bucketId: string;
    x: number;
    y: number;
  }>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const sortedBuckets = useMemo(
    () => [...buckets].sort((a, b) => a.order - b.order),
    [buckets],
  );
  const discretionary = useMemo<DiscretionaryBucket[]>(
    () =>
      sortedBuckets.filter(
        (b): b is DiscretionaryBucket =>
          b.type === "discretionary" && !isUnassignedBucket(b),
      ),
    [sortedBuckets],
  );
  const essentialBuckets = useMemo<(EssentialBillBucket | EssentialSpendingBucket)[]>(
    () => sortedBuckets.filter((b): b is EssentialBillBucket | EssentialSpendingBucket => b.type === "essential"),
    [sortedBuckets],
  );

  const atRiskForBucket = (bucketId: string) =>
    riskOverrides[bucketId] === "atRisk";

  const openContextMenu = (bucketId: string, e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({ bucketId, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!contextMenu) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };

    const onPointerDown = (e: PointerEvent) => {
      const menu = contextMenuRef.current;
      if (!menu) return;
      if (e.target instanceof Node && !menu.contains(e.target)) {
        setContextMenu(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [contextMenu]);

  const setBucketRiskOverride = (bucketId: string, next: RiskState) => {
    setRiskOverrides((prev) => {
      // Default "safe" is no override (keeps behavior aligned with previous UI default).
      if (next === "safe") {
        const { [bucketId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [bucketId]: next };
    });
    setContextMenu(null);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <nav className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-xs font-medium text-[var(--budget-ink-soft)] underline decoration-[var(--budget-card-border)] underline-offset-2 transition-colors hover:text-[var(--budget-ink)]"
          >
            ← Home
          </Link>
          <Link
            href={appRoutes.bucketNew}
            className="shrink-0 rounded-[var(--radius-card)] bg-[var(--budget-forest)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity active:opacity-90"
          >
            New bucket
          </Link>
        </nav>

        <TopCardHome {...TOP_CARD_HOME_REFERENCE_CONTENT} />

        {contextMenu ? (
          <div
            ref={contextMenuRef}
            className="fixed z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div className="w-40 rounded-lg border border-[#222]/10 bg-white/95 p-1 shadow-lg">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#222]/60">
                Risk state
              </div>
              <button
                type="button"
                className={`mx-2 mt-1 w-[calc(100%-1rem)] rounded px-2 py-1 text-xs ${!atRiskForBucket(contextMenu.bucketId) ? "bg-[#1c3812] text-white" : "bg-[#e6e8dd]"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setBucketRiskOverride(contextMenu.bucketId, "safe");
                }}
              >
                Safe
              </button>
              <button
                type="button"
                className={`mx-2 mt-1 w-[calc(100%-1rem)] rounded px-2 py-1 text-xs ${atRiskForBucket(contextMenu.bucketId) ? "bg-[#f35226] text-white" : "bg-[#e6e8dd]"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setBucketRiskOverride(contextMenu.bucketId, "atRisk");
                }}
              >
                At risk
              </button>
            </div>
          </div>
        ) : null}

        <section className="flex flex-col gap-2" aria-label="Spending money">
          <div>
            <p className="text-base font-bold text-[var(--budget-ink)]">
              Spending money
            </p>
            <p className="mt-0.5 text-sm text-[var(--budget-ink-soft)]">
              The money you have left over for day-to-day choices.
            </p>
          </div>
          {discretionary.length === 0 ? (
            <p className="flex min-h-[88px] items-center rounded-[var(--radius-card)] border border-[var(--budget-card-border)] bg-[var(--budget-sage-panel)] px-4 text-sm text-[var(--budget-ink-soft)]">
              No discretionary buckets yet.
            </p>
          ) : (
            discretionary.map((b) => (
              <Link
                key={b.id}
                href={appRoutes.bucket(b.id)}
                onContextMenu={(e) => openContextMenu(b.id, e)}
              >
                <BucketCard
                  variant="spendingMoney"
                  state={b.locked ? "locked" : "default"}
                  title={b.name}
                  cadence={{
                    mode: "perPaycheck",
                    label: `$${Math.max(b.top_off ?? 0, 0).toFixed(0)} per paycheck`,
                  }}
                  balanceLabel={`$${Math.max(b.amount, 0).toFixed(0)}`}
                  percentLabel={atRiskForBucket(b.id) ? "20% " : "100% "}
                  risk={atRiskForBucket(b.id) ? "atRisk" : "safe"}
                />
              </Link>
            ))
          )}
        </section>

        <section className="flex flex-col gap-2" aria-label="Essential spending">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="min-w-0 flex-1 text-base font-bold text-[var(--budget-ink)]">
              Essentials
            </p>
            <div className="text-xs text-[#222]/55">{essentialBuckets.length} buckets</div>
          </div>

          {essentialBuckets.map((bucket) => {
            if (bucket.essential_subtype === "bill") {
              return (
                <Link
                  key={bucket.id}
                  href={appRoutes.bucket(bucket.id)}
                  onContextMenu={(e) => openContextMenu(bucket.id, e)}
                >
                  <BucketCard
                    variant="bill"
                    state="default"
                    title={bucket.name}
                    cadence={{
                      mode: "perPaycheck",
                      label: `$${Math.max(bucket.top_off ?? 0, 0).toFixed(0)} per paycheck`,
                    }}
                    balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                    percentLabel={atRiskForBucket(bucket.id) ? "20% " : "100% "}
                    risk={atRiskForBucket(bucket.id) ? "atRisk" : "safe"}
                  />
                </Link>
              );
            }

            return (
              <Link
                key={bucket.id}
                href={appRoutes.bucket(bucket.id)}
                onContextMenu={(e) => openContextMenu(bucket.id, e)}
              >
                <BucketCard
                  variant="monthlySpending"
                  state="default"
                  title={bucket.name}
                  cadence={{
                    mode: "topOff",
                    label: `Top off to $${Math.max(bucket.top_off ?? 0, 0).toFixed(0)}`,
                  }}
                  balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                  percentLabel={atRiskForBucket(bucket.id) ? "20% " : "100% "}
                  risk={atRiskForBucket(bucket.id) ? "atRisk" : "safe"}
                />
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
