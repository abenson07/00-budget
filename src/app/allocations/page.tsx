"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export default function AllocationsPage() {
  const allocationHistory = useBudgetStore((s) => s.allocationHistory);
  const runs = useMemo(() => [...allocationHistory].reverse(), [allocationHistory]);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <h1 className="font-display text-2xl leading-tight">Paycheck allocations</h1>
        {runs.length === 0 ? (
          <p className="text-sm text-[#222]/60">No paycheck allocations yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {runs.map((run) => (
              <li key={run.id}>
                <Link
                  href={appRoutes.allocationRun(run.id)}
                  className="flex items-center justify-between rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{run.date}</span>
                    <span className="text-xs text-[#222]/55">{run.slot}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatUsd(run.incomeAmount)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
