"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BucketCard,
} from "@/components/figma-buckets";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export default function BucketDetailPage() {
  const params = useParams();
  const bucketId =
    typeof params.bucketId === "string"
      ? params.bucketId
      : Array.isArray(params.bucketId)
        ? params.bucketId[0]
        : "";

  const buckets = useBudgetStore((s) => s.buckets);
  const transactionsAll = useBudgetStore((s) => s.transactions);
  const transactions = useMemo(() => transactionsAll.slice(0, 6), [transactionsAll]);
  const bucket = useMemo(() => buckets.find((b) => b.id === bucketId), [buckets, bucketId]);
  const [riskState, setRiskState] = useState<"safe" | "atRisk">("safe");
  const [bucketType, setBucketType] = useState<"monthly" | "bill" | "spending" | "spendingLocked">("monthly");
  const atRisk = riskState === "atRisk";

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <nav>
          <Link
            href={appRoutes.buckets}
            className="text-xs font-medium text-[#222]/55 underline decoration-[#222]/20 underline-offset-2 transition-colors hover:text-[#1b1b1b]"
          >
            ← Buckets
          </Link>
        </nav>

        {!bucket ? (
          <div className="rounded-[var(--radius-card)] border border-amber-200 bg-amber-50/90 p-4 text-amber-950">
            <h1 className="text-lg font-semibold">Bucket not found</h1>
            <p className="mt-1 text-sm text-amber-900/90">
              No bucket matches this link. Return to buckets and pick one from
              the list.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-[44px] leading-none">
              Bucket - {bucketType === "spendingLocked" ? "Spending money" : bucketType}
            </h1>

            <section className="rounded-lg border border-[#222]/10 bg-white/70 p-3">
              <p className="text-xs font-semibold text-[#222]/70">State controller</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className={`rounded px-2 py-1 text-xs ${riskState === "safe" ? "bg-[#1c3812] text-white" : "bg-[#e6e8dd]"}`}
                  onClick={() => setRiskState("safe")}
                >
                  Safe
                </button>
                <button
                  type="button"
                  className={`rounded px-2 py-1 text-xs ${riskState === "atRisk" ? "bg-[#f35226] text-white" : "bg-[#e6e8dd]"}`}
                  onClick={() => setRiskState("atRisk")}
                >
                  At risk
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["monthly", "bill", "spending", "spendingLocked"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`rounded px-2 py-1 text-xs ${bucketType === type ? "bg-[#1b1b1b] text-white" : "bg-[#e6e8dd]"}`}
                    onClick={() => setBucketType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </section>

            {bucketType === "bill" ? (
              <BucketCard
                variant="bill"
                state="default"
                title={bucket.name}
                cadence={{
                  mode: "perPaycheck",
                  label: `$${Math.max(bucket.top_off ?? 0, 0).toFixed(0)} per paycheck`,
                }}
                balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                percentLabel={atRisk ? "20% " : "100% "}
                risk={atRisk ? "atRisk" : "safe"}
              />
            ) : bucketType === "spending" ? (
              <BucketCard
                variant="spendingMoney"
                state="default"
                title={bucket.name}
                cadence={{
                  mode: "perPaycheck",
                  label: `$${Math.max(bucket.top_off ?? 0, 0).toFixed(0)} per paycheck`,
                }}
                balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                percentLabel={atRisk ? "20% " : "100% "}
                risk={atRisk ? "atRisk" : "safe"}
              />
            ) : bucketType === "spendingLocked" ? (
              <BucketCard
                variant="spendingMoney"
                state="locked"
                title={bucket.name}
                cadence={{
                  mode: "perPaycheck",
                  label: `$${Math.max(bucket.top_off ?? 0, 0).toFixed(0)} per paycheck`,
                }}
                balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                percentLabel={atRisk ? "20% " : "100% "}
                risk={atRisk ? "atRisk" : "safe"}
              />
            ) : (
              <BucketCard
                variant="monthlySpending"
                state="default"
                title={bucket.name}
                cadence={{
                  mode: "topOff",
                  label: `Top off to $${Math.max(bucket.top_off ?? 0, 0).toFixed(0)}`,
                }}
                balanceLabel={`$${Math.max(bucket.amount, 0).toFixed(0)}`}
                percentLabel={atRisk ? "20% " : "100% "}
                risk={atRisk ? "atRisk" : "safe"}
              />
            )}

            <section className="flex flex-col gap-3.5">
              <h2 className="font-display px-1 text-lg text-[var(--budget-ink)]">
                Recent spending
              </h2>
              <Link
                href={appRoutes.transactions}
                className="flex items-center justify-between px-1"
              >
                <span className="text-xs font-bold uppercase tracking-wide text-[var(--budget-ink)]">
                  All transactions
                </span>
                <span aria-hidden className="text-[var(--budget-ink-soft)]">
                  →
                </span>
              </Link>

              <ul className="flex flex-col divide-y divide-[#222]/10 border-y border-[#222]/10">
                {transactions.map((tx) => (
                  <li key={tx.id}>
                    <Link href={appRoutes.transaction(tx.id)}>
                      <BucketCard
                        variant="transaction"
                        state="default"
                        title={tx.merchant || "Target"}
                        amountLabel={`$${tx.amount.toFixed(0)}`}
                        className="rounded-none bg-transparent px-0"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <Link
              href={appRoutes.bucketSettings(bucketId)}
              className="mx-auto rounded-lg bg-[#e6e8dd] px-4 py-2 text-sm font-semibold text-[#1c3812]"
            >
              Change bucket settings
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
