"use client";

import Link from "next/link";
import { appRoutes } from "@/lib/routes";
import { useSettingsStore } from "@/state/settings-store";

export default function SettingsPage() {
  const nearLimitThresholdPct = useSettingsStore((s) => s.nearLimitThresholdPct);
  const setNearLimitThresholdPct = useSettingsStore((s) => s.setNearLimitThresholdPct);
  const surplusMode = useSettingsStore((s) => s.surplusMode);
  const setSurplusMode = useSettingsStore((s) => s.setSurplusMode);

  return (
    <div className="min-h-screen bg-[#faf9f6] font-[family-name:var(--font-instrument-sans)] text-[#1b1b1b]">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-8">
        <h1 className="font-display text-2xl leading-tight">Settings</h1>

        <div className="flex flex-col gap-2 rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm font-semibold">Pay schedule</h2>
          <Link href={appRoutes.paySchedule} className="text-sm text-[#1c3812] underline">
            Manage pay schedule
          </Link>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm font-semibold">Bucket priorities</h2>
          <p className="text-sm text-[#222]/70">
            Reorder discretionary buckets from the Buckets screen.
          </p>
          <Link href={appRoutes.buckets} className="text-sm text-[#1c3812] underline">
            Go to Buckets
          </Link>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm font-semibold">Notifications</h2>
          <label className="flex flex-col gap-1 text-sm text-[#222]/70">
            Alert me when a bucket has less than {nearLimitThresholdPct}% left
            <input
              type="range"
              min={0}
              max={100}
              value={nearLimitThresholdPct}
              onChange={(e) => setNearLimitThresholdPct(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-[#222]/10 bg-white px-4 py-3 shadow-sm">
          <h2 className="text-sm font-semibold">Extra paycheck money</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="surplusMode"
              checked={surplusMode === "unassigned"}
              onChange={() => setSurplusMode("unassigned")}
            />
            Send leftover to Unassigned
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="surplusMode"
              checked={surplusMode === "goals_first"}
              onChange={() => setSurplusMode("goals_first")}
            />
            Top off savings goals first
          </label>
        </div>
      </div>
    </div>
  );
}
