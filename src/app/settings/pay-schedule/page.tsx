"use client";

import { useEffect, useState } from "react";
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
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <h1 className="font-display text-2xl leading-tight">Pay schedule</h1>

        <div className="rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-[#222]/55">Detected cadence</p>
          <p className="text-lg font-semibold">{CADENCE_LABEL[detectedCadence]}</p>
          {nextPaycheckDate ? (
            <p className="mt-1 text-sm text-[#222]/70">Next paycheck: {nextPaycheckDate}</p>
          ) : null}
          <p className="mt-2 text-xs text-[#222]/55">
            {manualOverride ? "Using your manual override" : "Using your detected schedule"}
          </p>
          {manualOverride ? (
            <button
              type="button"
              onClick={clearManualOverride}
              className="mt-1 text-xs font-semibold text-[#1c3812] underline"
            >
              Reset
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Detected income events</h2>
          {incomeEvents.length === 0 ? (
            <p className="text-sm text-[#222]/60">No income events detected.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {incomeEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex justify-between rounded-md border border-[#222]/10 bg-white px-3 py-2 text-sm"
                >
                  <span>{e.date}</span>
                  <span className="tabular-nums">{formatUsd(e.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm font-semibold">Override cadence</h2>
          <div className="flex gap-2">
            {(["weekly", "biweekly", "monthly"] as const).map((cadence) => (
              <button
                key={cadence}
                type="button"
                onClick={() => {
                  if (overrideDate) setManualCadence(cadence, overrideDate);
                }}
                className="rounded-full border border-[#bbb] px-3 py-1.5 text-xs font-medium"
              >
                {CADENCE_LABEL[cadence]}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={overrideDate}
            onChange={(e) => setOverrideDate(e.target.value)}
            className="rounded-md border border-[#bbb] px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
