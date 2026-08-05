"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { AllocationStep } from "@/lib/paycheck-allocation-engine";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

const STEP_ORDER: AllocationStep[] = ["essentials", "recovery", "goals", "topoff", "surplus"];
const STEP_LABEL: Record<AllocationStep, string> = {
  essentials: "Essential bills",
  recovery: "Overage recovery",
  goals: "Savings goals",
  topoff: "Discretionary top-offs",
  surplus: "Leftover to Unassigned",
};

export default function AllocationRunPage() {
  const params = useParams();
  const runId =
    typeof params.runId === "string" ? params.runId : Array.isArray(params.runId) ? params.runId[0] : "";
  const run = useBudgetStore((s) => s.allocationHistory.find((r) => r.id === runId));

  if (!run) {
    return (
      <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-10 pt-8">
          <p className="text-sm text-[#222]/60">Allocation run not found.</p>
          <Link href={appRoutes.allocations} className="text-sm font-semibold text-[#1c3812] underline">
            Back to allocations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <nav>
          <Link href={appRoutes.allocations} className="text-xs font-medium text-[#222]/55 underline">
            ← Allocations
          </Link>
        </nav>
        <div>
          <p className="text-3xl font-bold tabular-nums">{formatUsd(run.incomeAmount)}</p>
          <p className="text-sm text-[#222]/55">
            {run.slot} · {run.date}
          </p>
        </div>

        {STEP_ORDER.map((step) => {
          const items = run.lineItems.filter((l) => l.step === step);
          if (items.length === 0) return null;
          return (
            <section key={step} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold">{STEP_LABEL[step]}</h2>
              <ul className="flex flex-col gap-1">
                {items.map((item, i) => (
                  <li
                    key={`${item.bucketId}-${i}`}
                    className="flex justify-between rounded-md border border-[#222]/10 bg-white px-3 py-2 text-sm"
                  >
                    <span>{item.bucketName}</span>
                    <span className="tabular-nums">{formatUsd(item.amountAdded)}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
