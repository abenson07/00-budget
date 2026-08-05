"use client";

import { useParams } from "next/navigation";
import { AmountDisplay, PageHeader, PageShell, SectionHeading } from "@/components/ui";
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
      <PageShell>
        <PageHeader backHref={appRoutes.allocations} size="compact" />
        <p className="text-sm text-budget-ink-soft">Allocation run not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader backHref={appRoutes.allocations} size="compact" />
      <AmountDisplay
        size="lg"
        value={formatUsd(run.incomeAmount)}
        sublabel={`${run.slot} · ${run.date}`}
      />

      {STEP_ORDER.map((step) => {
        const items = run.lineItems.filter((l) => l.step === step);
        if (items.length === 0) return null;
        return (
          <section key={step} className="flex flex-col gap-3">
            <SectionHeading>{STEP_LABEL[step]}</SectionHeading>
            <ul className="flex flex-col gap-2">
              {items.map((item, i) => (
                <li
                  key={`${item.bucketId}-${i}`}
                  className="flex justify-between rounded-control border border-budget-card-border bg-white px-4 py-3 text-sm"
                >
                  <span>{item.bucketName}</span>
                  <span className="tabular-nums">{formatUsd(item.amountAdded)}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </PageShell>
  );
}
