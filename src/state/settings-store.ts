import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
  nearLimitThresholdPct: number;
  surplusMode: "unassigned" | "goals_first";
};
type SettingsActions = {
  setNearLimitThresholdPct: (pct: number) => void;
  setSurplusMode: (mode: "unassigned" | "goals_first") => void;
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      nearLimitThresholdPct: 20,
      surplusMode: "unassigned",
      setNearLimitThresholdPct: (pct) =>
        set({ nearLimitThresholdPct: Math.min(100, Math.max(0, pct)) }),
      setSurplusMode: (mode) => set({ surplusMode: mode }),
    }),
    { name: "budget-settings" },
  ),
);
