"use client";

import { useEffect, useState } from "react";
import { Card, Chip, Input, PageHeader, PageShell, SectionHeading } from "@/components/ui";
import { formatUsd } from "@/lib/format";
import type { PayCadence } from "@/lib/types";
import { useBudgetStore } from "@/state/budget-store";
import { usePayScheduleStore } from "@/state/pay-schedule-store";

const CADENCE_LABEL: Record<PayCadence, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  unknown: "We couldn't detect a pattern",
};

export default function PayScheduleSettingsPage() {
  const incomeEvents = usePayScheduleStore((s) => s.incomeEvents);
  const detectedCadence = usePayScheduleStore((s) => s.detectedCadence);
  const manualOverride = usePayScheduleStore((s) => s.manualOverride);
  const generateAndDetect = usePayScheduleStore((s) => s.generateAndDetect);
  const setManualCadence = usePayScheduleStore((s) => s.setManualCadence);
  const clearManualOverride = usePayScheduleStore((s) => s.clearManualOverride);
  const account = useBudgetStore((s) => s.account);
  const nextPaycheckDate = useBudgetStore((s) => s.nextPaycheckDate);
  const [overrideDate, setOverrideDate] = useState("");

  useEffect(() => {
    if (incomeEvents.length === 0) {
      generateAndDetect(account.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell>
      <PageHeader title="Pay schedule" />

      <Card>
        <p className="text-label text-budget-ink-soft">Detected cadence</p>
        <p className="text-lg font-semibold text-budget-ink">{CADENCE_LABEL[detectedCadence]}</p>
        {nextPaycheckDate ? (
          <p className="mt-1 text-sm text-budget-ink-soft">Next paycheck: {nextPaycheckDate}</p>
        ) : null}
        <p className="mt-2 text-label text-budget-ink-soft">
          {manualOverride ? "Using your manual override" : "Using your detected schedule"}
        </p>
        {manualOverride ? (
          <button
            type="button"
            onClick={clearManualOverride}
            className="mt-1 text-xs font-semibold text-budget-forest underline"
          >
            Reset
          </button>
        ) : null}
      </Card>

      <div className="flex flex-col gap-3">
        <SectionHeading>Detected income events</SectionHeading>
        {incomeEvents.length === 0 ? (
          <p className="text-sm text-budget-ink-soft">No income events detected.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {incomeEvents.map((e) => (
              <li
                key={e.id}
                className="flex justify-between rounded-control border border-budget-card-border bg-white px-4 py-3 text-sm"
              >
                <span>{e.date}</span>
                <span className="tabular-nums">{formatUsd(e.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Card className="flex flex-col gap-3">
        <SectionHeading>Override cadence</SectionHeading>
        <div className="flex gap-2">
          {(["weekly", "biweekly", "monthly"] as const).map((cadence) => (
            <Chip
              key={cadence}
              onClick={() => {
                if (overrideDate) setManualCadence(cadence, overrideDate);
              }}
            >
              {CADENCE_LABEL[cadence]}
            </Chip>
          ))}
        </div>
        <Input
          type="date"
          value={overrideDate}
          onChange={(e) => setOverrideDate(e.target.value)}
          className="mt-0"
        />
      </Card>
    </PageShell>
  );
}
