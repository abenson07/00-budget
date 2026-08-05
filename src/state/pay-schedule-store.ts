import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateIncomeHistory } from "@/lib/generate-income-history";
import { detectCadence, projectNextPaycheckDate } from "@/lib/pay-cadence";
import type { IncomeEvent, PayCadence } from "@/lib/types";
import { useBudgetStore } from "./budget-store";

type PayScheduleState = {
  incomeEvents: IncomeEvent[];
  detectedCadence: PayCadence;
  averageGapDays: number | null;
  manualOverride: boolean;
};

type PayScheduleActions = {
  generateAndDetect: (accountId: string) => void;
  setManualCadence: (cadence: PayCadence, nextDate: string) => void;
  clearManualOverride: () => void;
};

export const usePayScheduleStore = create<PayScheduleState & PayScheduleActions>()(
  persist(
    (set, get) => ({
      incomeEvents: [],
      detectedCadence: "unknown",
      averageGapDays: null,
      manualOverride: false,

      generateAndDetect: (accountId) => {
        const events = generateIncomeHistory(accountId, new Date());
        const { cadence, averageGapDays } = detectCadence(events);
        set({ incomeEvents: events, detectedCadence: cadence, averageGapDays });
        if (!get().manualOverride && averageGapDays != null) {
          const next = projectNextPaycheckDate(events, averageGapDays);
          if (next) useBudgetStore.getState().setNextPaycheckDate(next);
        }
      },

      setManualCadence: (cadence, nextDate) => {
        set({ detectedCadence: cadence, manualOverride: true });
        useBudgetStore.getState().setNextPaycheckDate(nextDate);
      },

      clearManualOverride: () => set({ manualOverride: false }),
    }),
    {
      name: "pay-schedule",
      partialize: (s) => ({
        incomeEvents: s.incomeEvents,
        detectedCadence: s.detectedCadence,
        averageGapDays: s.averageGapDays,
        manualOverride: s.manualOverride,
      }),
    },
  ),
);
