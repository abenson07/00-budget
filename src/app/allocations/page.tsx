"use client";

import { useMemo } from "react";
import { ListRow, PageHeader, PageShell } from "@/components/ui";
import { formatUsd } from "@/lib/format";
import { appRoutes } from "@/lib/routes";
import { useBudgetStore } from "@/state/budget-store";

export default function AllocationsPage() {
  const allocationHistory = useBudgetStore((s) => s.allocationHistory);
  const runs = useMemo(() => [...allocationHistory].reverse(), [allocationHistory]);

  return (
    <PageShell>
      <PageHeader title="Paycheck allocations" />
      {runs.length === 0 ? (
        <p className="text-sm text-budget-ink-soft">No paycheck allocations yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <div key={run.id} className="rounded-card border border-budget-card-border bg-white">
              <ListRow
                href={appRoutes.allocationRun(run.id)}
                title={run.date}
                subtitle={run.slot}
                amount={formatUsd(run.incomeAmount)}
              />
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
